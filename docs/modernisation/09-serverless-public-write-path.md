# 09. Serverless public write path (plan)

Goal: during an election the public site (reads and stall submissions) works with Django, Postgres, Redis and the RQ worker all down. Django and Postgres remain the admin system of record.

## 1. What must be replaced

| Today | Serverless replacement |
|---|---|
| `POST stalls/` | API Gateway HTTP API, then a submit Lambda, which validates and writes to SQS and DynamoDB |
| `PATCH stalls/{id}/update_and_resubmit/` | Edit Lambda, which verifies the signed token and writes to SQS |
| `GET stalls/{id}?token&signature` | Read Lambda that verifies the token and reads DynamoDB |
| Mailgun email and Discord webhook (done in Django signals) | Notifier Lambda triggered by the queue |
| `map_image` and `current_map_image` (RQ and Firefox screenshot) | Pre-rendered PNG per election in S3, published when the election data is published |
| `nearby`, `lookup`, `search`, `stall_lookup` | Read Lambdas over S3 (see file 08), or static files |
| `opt_out` mail link (`mail/opt_out/?stall_id&token&signature`) | Opt-out Lambda with the same signed-token check |

## 2. Recommended architecture: store and forward

```
Browser -> CloudFront -> /api/0.1/stalls* -> API Gateway -> Lambda (validate, sign)
                                                            |-> DynamoDB  stalls (token reads, idempotency)
                                                            |-> SQS       stall-events (FIFO, DLQ)
SQS -> Notifier Lambda -> SES/Mailgun + Discord
SQS -> Ingest worker (Django side, pulls when up) -> Postgres Stalls row + history -> admin queue
```

- A submission is durable the moment it is in SQS and DynamoDB, so it is never lost when Postgres is down.
- Django consumes the queue and creates the `Stalls` row, so the admin approve, decline and match flow is unchanged.
- Approval in admin publishes the new static data, and also updates the DynamoDB stall status, so token reads stay correct.
- Rejected alternative: Lambda writing directly to RDS. It needs a VPC and RDS Proxy, and it keeps the database dependency.

## 3. Behaviour to port exactly (from `stall_views.py`, `signals.py`, `mailgun.py`)

- The election must be active (`get_active_elections`), else 400. Needs a published election list in S3 that includes the active flag. Election-day tip-offs (`TIPOFF_RUN_OUT`, `TIPOFF_RED_CROSS_OF_SHAME`) only on election day.
- `submitter_type` selects the schema: tip-off or owner. `TIPOFF_RUN_OUT` forces `noms.run_out = true`.
- Edits: not allowed for run-out or red-cross tip-offs. Approved and Declined edits reset to Pending, and set `owner_edit_timestamp`. Finished election returns 418.
- History records the IP from `X-Forwarded-For`. Lambda gets it from the API Gateway request context.
- Pending count in the Discord message ("N waiting in the queue") needs a counter. Use an atomic DynamoDB counter, or just drop the number.
- `make_confirmation_hash(stall.id, token)` is the signature. Port it, and share the secret via Secrets Manager. Needs reading to confirm the algorithm before porting.

## 4. Fix while porting (from the security review, file 06)

- Allow-list fields instead of mass assignment. Public edits must not write `status` or `submitter_type`.
- Escape user input in HTML emails.
- Tighten the `location_info` schema.
- Add WAF rate limiting plus a honeypot or Turnstile on submit.
- Use idempotency keys (hash of body plus IP window) to stop double posts.

## 5. Ids

The stall id is assigned by Postgres today. Serverless needs one before Postgres sees it. Use a ULID or UUID as the public id, and keep `stalls.id` internal in Django. The edit-link format changes, so old emailed links must still work. Either keep a numeric-id route to Django or backfill the DynamoDB table with the existing stalls and ids. Decision needed.

## 6. Admin and Postgres coupling

- Admin keeps Django. It needs the pending queue within seconds of submission, so the ingest worker should long-poll SQS.
- If Postgres is down, submissions queue up and no one can approve them. That is acceptable, and the public site is unaffected.
- Publishing static data on approval stays a Django task (`task_regenerate_cached_election_data`), changed to write to S3.

## 7. Phases

1. Terraform: DynamoDB table, SQS FIFO plus DLQ, API Gateway, submit Lambda. Test with the existing test bucket and CloudFront (file 08, `project_cache/aws/`).
2. Port validation. Contract-test against Django using the existing pytest fixtures: the same payloads must give the same accept or reject result.
3. Notifier Lambda (email and Discord) and the opt-out Lambda.
4. Django ingest management command, idempotent on the public id. Run in shadow mode: Lambda and Django both receive, and compare.
5. Pre-rendered election PNGs, replacing `map_image` for `og:image`.
6. Cutover behind a CloudFront behaviour. Keep Django as a fallback origin for the write path only. Roll back by flipping the behaviour.
7. Load test: submit burst of about 100 per minute, with Postgres stopped, then recover and check the backlog drains once.

## 8. Decisions (confirmed with maintainer)

- Old emailed edit and opt-out links do not need to keep working. Only links from new submissions. No backfill and no legacy Django route; use a ULID or UUID public id.
- Peak is 10 to 100 submissions per minute. Standard SQS plus Lambda covers this easily; load test at 200 per minute.
- Email moves to SES (about US$0.10 per 1,000, no fixed fee, IAM auth). Needs domain verification, DKIM and SPF, and production access. Pricing figures are from memory and need checking.
- Keep the Discord pending count with an atomic DynamoDB counter. Increment on submit, decrement when admin approves or declines (the ingest or admin side must update it).
- Cloudflare Turnstile plus WAF rate limiting on submit. Exact WAF rules to be decided.
- The existing RQ worker box pulls from SQS into Postgres (a management command, idempotent on the public id).

## 9. Research results

Verified in code:
- Signature is `HMAC-SHA256(SECRET_KEY, f"{stall_id}{token}")` (`mailgun.py:432-451`). The token is `str(getrandbits(128))`, generated fresh for each email and never stored. Verification is stateless, so a Lambda only needs the secret (Secrets Manager), not the database.
- Weaknesses to fix while porting: compare is `==` (use `hmac.compare_digest`), `getrandbits` is not cryptographically secure (use `secrets`), links never expire, and the secret is shared with Django's `SECRET_KEY` (use a separate key). A signature is not bound to the stall's current state.
- Opt-out (`mail/opt_out/`) is a write (`mail_confirmed = False`). Route it through the queue like other writes.
- Hidden writer: `mailgun_webhook` stores `MailgunEvents` rows in the database. With SES, use SNS or an SES event destination to SQS, consumed by the Django ingest worker.

Pending count for Discord (decision: keep it in DynamoDB):
- An atomic DynamoDB counter, incremented by the submit Lambda and decremented when a stall leaves Pending. The notifier Lambda posts the Discord message with the count, so the ping is immediate and works with Postgres down.
- Rejected: a Lambda reading Postgres (needs a VPC and RDS Proxy, and submit would depend on the database), and sending Discord from the Django worker (ping delayed when Postgres is down).
- Decrement path: the Django ingest side or admin approve, decline and match actions must call a small "stall resolved" step that updates DynamoDB. An edit that resets a stall to Pending increments again.
- Drift: make the increment and decrement idempotent per stall and status transition (conditional write on the stall item's status, then adjust the counter in one transaction). Add a scheduled reconcile that recounts Pending in DynamoDB, or in Postgres, and resets the counter. Alert if they differ.
- The submitter's confirmation email still goes straight from the notifier Lambda.

Not verifiable from the sandbox (AWS, Mailgun and Cloudflare hosts are blocked by the allowlist):
- SES price (believed about US$0.10 per 1,000), SES production-access process, Mailgun plan prices, Turnstile limits and WAF rule pricing. Check the vendor pricing pages before committing.

## 10. Open items worked through

All figures marked (unverified) are from memory. The sandbox cannot reach AWS, Mailgun or Cloudflare, so check them on the vendor pages.

### 10.1 Pending count source of truth
- Recommendation: derive the count instead of keeping a counter. Put a sparse GSI on the DynamoDB stall items that only contains items with `status = Pending`, and count it with a `Query` using `Select=COUNT`. Volumes are thousands of items, so this is cheap and always matches the items, with no counter drift. The ms-level GSI lag is irrelevant for a Discord message.
- DynamoDB is authoritative for submissions the worker has not ingested yet. Postgres is authoritative once ingested, because admins triage there. The "stall resolved" step copies each status change back to DynamoDB.
- Reconcile job (every 15 minutes): once the queue is empty, compare the DynamoDB Pending count with Postgres. Alert on a difference, and repair DynamoDB from Postgres.
- If you still want an atomic counter, the plan in section 9 stands. This is the simpler option.

### 10.2 WAF and throttling
- Rate-based rule on `POST /api/0.1/stalls*`, keyed by IP. Suggested start: 20 requests per 5 minutes per IP. Shared mobile and campus NAT addresses are common on election day, so do not go tighter. Check the rule's minimum limit and window options (I believe the minimum is 10 per window) (unverified).
- Backstops behind WAF: API Gateway stage throttling, plus reserved Lambda concurrency on the submit function to protect downstream SES and DynamoDB. Size them for 200 submissions per minute, which is 2x your stated peak.
- Cost (unverified): about US$5 per web ACL per month, about US$1 per rule per month, about US$0.60 per million requests. Only attach WAF to the write path and to CloudFront if you want read protection. Skip Bot Control, it is expensive.
- Add AWS managed common rule set and IP reputation list as an optional layer.

### 10.3 Turnstile failure behaviour
- Recommendation: fail open with a flag when Cloudflare is unreachable, fail closed when the token is invalid.
  - Token present and `siteverify` says invalid: reject (400).
  - Token missing: reject.
  - `siteverify` times out (about 2 seconds) or errors: accept, set `captcha_unverified = true`, and apply a stricter per-IP limit.
- Rationale: every stall lands as Pending and is moderated by an admin, so spam from a fail-open window is bounded. Losing real submissions on election day is the worse failure, since the site exists to collect them.
- Turnstile is free for standard use (unverified). Tokens are single use and expire after 5 minutes (unverified), so the Lambda must call `siteverify` once per submission, and the form should re-request a token on retry.
- The `siteverify` call needs outbound internet from the Lambda, which is fine outside a VPC.

### 10.4 SES
- Request production access before cutover; the sandbox only sends to verified addresses. Approval usually takes about a day (unverified).
- Verify the sending domain with DKIM, plus SPF and DMARC.
- Bounce and complaint handling is mandatory: SES event destination to SNS to SQS, consumed by the ingest worker. This replaces `mailgun_webhook`.
- Price (unverified): about US$0.10 per 1,000 emails. Expect a few dollars a year at your volume.
- Does the SES region need to be ap-southeast-2? Check availability and sending limits for that region.

## 11. Decisions, round 2

- Pending count: keep the atomic DynamoDB counter (section 9), not the derived GSI count in 10.1. The reconcile job still applies.

### Cost-minimal spam protection (target: close to US$0)

Figures are from memory (unverified).

- AWS WAF costs about US$5 per web ACL per month, US$1 per rule per month and US$0.60 per million requests, prorated hourly. One ACL plus one rate rule is about US$6 per month, or about US$72 a year if left on. Managed rule groups cost extra.
- WAF attaches to CloudFront, REST APIs and ALB, but not to HTTP APIs or Lambda function URLs. Attaching to the whole CloudFront distribution charges for every request, reads included. The ACL must then be in us-east-1.
- Cheap default (no WAF): Turnstile, plus a per-IP limit inside the submit Lambda using a DynamoDB item per IP and window with a TTL and a conditional increment, plus API Gateway throttling and reserved Lambda concurrency. Cost is cents.
- Optional: create the WAF ACL with a Terraform toggle and enable it only in election months, so it costs about US$6 per month for those months only.
- CloudFront's newer flat-rate plans may bundle WAF; check the current pricing page before deciding.

Recommendation: start without WAF, add it only if real abuse appears.

## 12. Still open

- Confirm all pricing and limits marked (unverified).
- Tune the in-Lambda per-IP limit from the Postgres `ip_address` history.
