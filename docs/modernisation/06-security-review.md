## 13. Security review (Django + public-redesign + admin-redesign)
Scope: Django backend and both redesigned frontends only. Findings are from a security-review pass and have not been independently reproduced.

| # | Severity | File | Lines | Issue | Confidence |
|---|---|---|---|---|---|
| 1 | Medium | `django/demsausage/app/serializers.py` (via `views/stall_views.py` `create`) | 1016-1040 | Anonymous stall creation (`StallEditingPermissions` allows `create`) uses `StallsOwnerManagementSerializer`, an empty subclass of the admin `StallsManagementSerializer`. Client can set `status` (plain TextField, no choices), `previous_status`, `triaged_on`, `triaged_by` and `polling_place`, bypassing moderation and forging a moderator id. Feeds public `has_approved_subs` (`serializers.py:582-585`) and counts (`:697-708`). Not confirmed to change published noms or the map. | 8/10 |
| 2 | Medium | `django/demsausage/app/sausage/mailgun.py` | 61-63, 81-290 | `format_map` inserts unescaped user input (`STALL_NAME`, `STALL_DESCRIPTION`, `STALL_OPENING_HOURS`, `STALL_WEBSITE`, `TIPOFF_SOURCE`, location name and address) into HTML email. An anonymous submitter controls the recipient and content, so the real sender can be used for phishing. No throttling. | 7/10 |
| 3 | Low | `django/demsausage/app/serializers.py` (via `update_and_resubmit`) | 965-988 | `StallsUserEditSerializer.status` is writable; the view forces PENDING only when the stall is currently Approved or Declined. A token-and-signature holder can self-approve a pending stall. | 7/10 |
| 4 | Low | `django/Dockerfile` | 55-60 | Unpinned Poetry installer via `curl \| python`, no integrity check; `poetry update` ignores the lockfile; geckodriver checksum not verified. | 7/10 |

Not reported as findings: the non-constant-time compare in `opt_out`; `mailgun_webhook` `UnboundLocalError` (500 only). No frontend findings.

Fix direction: dedicated public-create serializer with `status`, `previous_status`, `triaged_*` and `polling_place` read-only or excluded and status set server-side to PENDING (#1, #3); `html.escape` every template parameter and consider email verification before sending (#2); pin Poetry with a checksum and use `poetry install --only main` against the lock file (#4); add throttling on anonymous submission.

### 13.1 Verification of findings 1 and 3
Method: code read of `stall_views.py`, `permissions.py`, `serializers.py`, `models.py`, plus a minimal Django/DRF reproduction (replica `Stalls` model and serializers with the same field definitions, in-memory SQLite). The full test suite needs the PostGIS Docker stack and was not run, so the real endpoints weren't called.

- **#1 confirmed.** `StallEditingPermissions` returns True for `create`; `create` passes raw `request.data` to `StallsOwnerManagementSerializer`, whose fields include `status`, `previous_status`, `triaged_on`, `triaged_by` and `polling_place`. Reproduction: an anonymous-style payload with `status="Approved"`, `triaged_by=<user id>` and `triaged_on` validated and was stored as sent.
  - Correction to the original report: `status` is a `ChoiceField` (model choices), so arbitrary strings are rejected, but `"Approved"` and `"Declined"` are valid.
  - `StallsTipOffManagementSerializer` is also affected for `status`, `triaged_on` and `polling_place` (it has no `triaged_by`).
  - Impact is narrower than first stated. Noms are published only by the authenticated `approve` action, so a self-approved stall does not change published noms. Confirmed effects: the stall never appears in the pending queue (`stall_views.py:278` filters `status=PENDING`), so it is never moderated; `triaged_by`/`triaged_on` can be forged; and the public, unauthenticated `lookup` endpoint (`pollingplace_views.py:376-381`) computes `has_approved_subs` from approved stalls (`serializers.py:582-585`), so an attacker who attaches a self-approved stall to any `polling_place` id can flip that flag. Admin stats counts (`serializers.py:697-708`) are also affected.
  - Likely but untested: the admin history view builds a message from `item.history_user.first_name` for approved entries (`pollingplace_views.py:301-306`), and an anonymous create has no `history_user`, so that history page may error for the affected polling place.
- **#3 confirmed, and slightly worse.** `StallsUserEditSerializer.status` is a bare `CharField` (no choices). The view forces PENDING only when the stall is currently Approved or Declined (`stall_views.py:167-168`). Reproduction on a Pending stall: client `status="Approved"` was stored, and so was `status="banana"`. Requires the stall's emailed token and signature, so it only affects the submitter's own stall; it can self-approve or store an invalid status that drops the stall out of every queue.
- Severity unchanged: #1 medium, #3 low.

## Where we got to
- The original four findings were verified by reproduction (#1, #3) or code reading. Later agent runs (section 14.2) confirmed or extended them and added more.
- Current consolidated view is in section 14.3 of `07-security-agents.md`. In short: the Azure AD login claim handling (likely, critical, depends on the Entra setting), anonymous create and token-holder mass assignment (confirmed, medium), email HTML injection and a loose `location_info` schema (likely, medium), and several low-severity items.
- No fixes have been made. All results come from reading code or from small reproductions, not from the real system.

## Potential next steps
- Check the Entra app registration, then change the social uid to `oid` or restrict the tenant if needed.
- Fix the mass-assignment issues with dedicated public serializers, a `ChoiceField` or read-only `status`, and server-set triage fields.
- Escape user content in `mailgun.py` and tighten the `location_info` schema.
- Follow `.github/instructions/testing.instructions.md` for any `django/**` change, and add regression tests for each fix.

## Open questions
- Is the Azure registration multi-tenant, and are the Azure keys set in production?
- Are all allowlisted users meant to be moderators, or should approve and decline need a stronger role?
- Should email go only to addresses the submitter has confirmed?
- Is there an existing process for reporting and disclosing security issues?
