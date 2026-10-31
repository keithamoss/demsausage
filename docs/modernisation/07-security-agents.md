## 14. Research: agents for forensic (SAST-style) security analysis
Scope agreed with the user: find vulnerabilities (not incident investigation); compare Copilot custom agents, Claude Code agents and framework-agnostic approaches; specific to this repo's Django/DRF and React stack; balanced recall and precision with a verification stage. Source: a web and GitHub research pass dated 2026-10-31. Items marked (V) were checked against primary sources, (S) are secondary, (I) are inference, (U) unverified or marketing.

### Patterns that work
- Staged pipeline: attack-surface recon, candidate generation, verification, dedup, report. Verification is the biggest precision lever.
- Prefer falsifiable checks over model self-assessment: a working PoC, a reachability confirmation, a crash or flag capture (Big Sleep, XBOW, AIxCC all do this).
- Use deterministic tools (Semgrep, Bandit, ESLint security plugins, pip-audit, npm audit, gitleaks) as hints that feed LLM triage, not as ground truth. Theori's AIxCC system and IRIS (arXiv:2405.17238) follow this pattern; GitHub's AI Scan uses CodeQL alerts to suppress duplicate LLM findings (V).
- Anthropic's `claude-code-security-review` (V): a regex hard-exclusion layer, then a second LLM call per finding returning `confidence_score`/`keep_finding`/`justification`; numeric rubric with 0.7 as the "don't report" line; it fails open when verification errors (avoid this: fail closed). It is not hardened against prompt injection and has no SARIF output.
- Vulnhuntr (protectai): README summary, per-file analysis, vulnerability-class prompts, and the LLM requests extra code via a symbol resolver to trace input-to-sink chains across files; confidence 0-10 with 8+ treated as likely.
- Evidence quality is uneven: named CVEs and case studies are checkable; aggregate precision and recall figures are almost all self-reported (AIxCC ">90% accuracy" was not independently audited; XBOW says its own CTF benchmark is saturated by training-data contamination).

### Platform notes
- Copilot (V): `.github/agents/*.agent.md` with `name`, `description`, `tools`, `model`; read-only via `tools: ['read','search']`; subagents run in isolated contexts in parallel; a built-in `security-review` agent exists; Autofix validates fixes by re-running CodeQL and cannot confirm fixes for custom queries or third-party SARIF.
- Claude Code (V for the command and Action): `/security-review` uses `allowed-tools: Read,Glob,Grep,LS,Task` plus scoped git diff; the Action runs the CLI headlessly with JSON output and a disallowed-tools list. Subagent and hook frontmatter fields were not re-verified (I): check the docs before relying on them.
- Framework-agnostic (I): orchestrator fans out per-file or per-endpoint hunters with ranked, bounded context, each emitting structured JSON (file, line, CWE, confidence, exploit scenario), then a verifier node and a dedup/report node. Portable across model vendors at the cost of more plumbing.

### Stack checklists and rulesets
- Django/DRF: permission overrides when `DEFAULT_PERMISSION_CLASSES` is relaxed per view; object-level permissions need `has_object_permission`, and list and create paths bypass them; `ModelSerializer` mass assignment; `.extra()`/`RawSQL`/`.raw()`; session auth CSRF nuance; CORS credentials with broad origins; throttling is not a security control by itself; `mark_safe`/`format_map` into HTML; `manage.py check --deploy`; pickle and `yaml.load`; SSRF via requests or a headless browser.
- React: `dangerouslySetInnerHTML`, `href` injection, token storage, open redirects, `VITE_`-prefixed variables being bundled client-side (V, Vite docs), `postMessage` origin checks. No RTK Query or MUI ruleset exists; standard React rules cover them.
- Reusable rules: `semgrep/semgrep-rules` (`python/django/security/**`, `typescript/react/security/**`) (V); OWASP CheatSheetSeries; community audit prompts such as `kuron3k0/code-audit` (S).

### Safety
Prompt injection from analysed code is a documented risk: keep agents read-only, never execute code suggested by the target repo, treat repo content as data, avoid sending proprietary code to third parties, and require human review before any change.

### Proposed design for this repo
1. `django-drf-hunter`: per-viewset analysis seeded with the Django/DRF checklist and the patterns found here (permission overrides, mass assignment, queryset scoping, unescaped email templates, CSRF/CORS, signed-token flows).
2. `react-rtkq-hunter`: per-component or per-slice analysis of the React checklist.
3. `security-verifier`: takes hunter JSON, re-checks reachability against call sites, requires exploit evidence, applies a 0.7 confidence cut-off, fails closed.
- Run Semgrep Django and React rulesets first as hints.
- First iteration: read-only, on demand, no SARIF, no auto-fix. Diff-scoped runs are cheaper but miss whole-repo queryset-scoping and IDOR issues, so add a periodic full-repo recon pass.
- Evaluation: the confirmed findings 1 and 3 (section 13.1) are the first regression cases (does the pipeline rediscover them, and does the verifier keep them while dropping noise). Add seeded-vulnerability Django apps (for example django.nV) for broader recall.
- Gaps: ZeroPath's methodology could not be verified; the Claude Code subagent and hook specifics need a direct doc check.

## 14.1 Security-agent trials
- Broad hunter, 2 runs: found known #1 both times; DJ-002 (any authenticated user can approve/decline) once; missed #3 and email HTML injection.
- Split passes A/B/C (mass assignment / authz / injection+outbound), same scope: A found #1 and #3, C found the email injection (#2), B found any authenticated user can update/delete any stall (related to DJ-002 but not the approve/decline actions). Union covers all 3 known findings plus 1 related new candidate.
- Verifier now has a severity rubric (allowlisted-only reachability => low). Hunter trust-model note added.
- Caveat: trials used generic explore agents following the agent files, not the custom agents themselves; recall is still run-to-run variable. Unverified new candidate: DJ-B001 (needs verifier).
- Orchestrator (`security-audit`) now runs the hunter 3 times (A/B/C) plus the React hunter in parallel.

## 14.2 Full-scope hunter run (general-purpose, claude-sonnet-5.5, high effort) + verifier
Passes A/B/C over all of django/demsausage (~9-13 min each) found all 3 known issues plus new candidates. Verifier (same model) results:
- DJ-A-001 anonymous create mass assignment: confirmed, medium 0.9 (extra: forged triage fields can make staff pending list / history 500; verify (a)(b)(c) individually if fixing).
- DJ-A-002/B-003 token holder sets status/submitter_type: confirmed, medium 0.85.
- DJ-A-003 tipoff_source bare CharField + writable email -> email HTML: likely, low.
- DJ-A-004 loose location_info schema breaks staff unofficial list: likely, medium 0.8 (NEW).
- DJ-C-001 email HTML injection w/ attacker-chosen recipient: likely, medium 0.78.
- DJ-B-001 Azure AD: uid=email claim, 'common' tenant, social-auth-core 4.5.4, unsigned id_token: likely, critical 0.72 (NEW). Unverified: multi-tenant app registration, prod keys set, email claim present, `poetry update` may change version. No associate_by_email so attacker gets a NEW user, but all authenticated users are equivalent (approve/decline, edit, loader).
- DJ-B-004 HMAC over undelimited id+token, `==` compare: likely, low (token is random 128-bit, stored-bound).
- DJ-C-002 X-Forwarded-For first hop stored as history IP, 3+ hops -> 500: likely, low.
- DJ-C-003 Dockerfile poetry update: likely, low. DJ-A-005, DJ-B001, DJ-002 (authenticated-user over-permission): confirmed, low (allowlist-only).
Notes: hunter severities inflated; verifier rubric corrected them. Run-to-run recall varies (B did not re-report DJ-002). Azure check needs the Entra app registration setting (Authentication > supported account types).

## 14.3 Security agents: what was built, how to run, results, next steps

### Built (uncommitted, `.github/agents/`)
| Agent | Role | Tools |
|---|---|---|
| `django-drf-hunter` | Finds candidate vulns in `django/`. Takes a focus pass: A mass assignment/field control, B authorisation/authentication, C injection/outbound content. Has Depth section (read in full, enumerate, self-recheck) and a trust-model note (allowlisted staff are semi-trusted). | read, search |
| `react-rtkq-hunter` | Same for `public-redesign` and `admin-redesign`. Not yet trialled. | read, search |
| `security-verifier` | Tries to refute each candidate. Verdicts confirmed / likely / rejected / unverifiable, fails closed, severity rubric (allowlisted-only reachability => low; follow data to consumers). | read, search |
| `security-audit` | Orchestrator: runs hunter passes A, B, C and the React hunter in parallel, merges, verifies in batches (~15), reports table. The `agent` delegation tool name is unconfirmed. | read, search, agent |

### How to run
- Real custom agents: Copilot CLI (`--agent security-audit` or `/agent`) or VS Code agent picker; files must be on the checked-out branch. Not tested here (the `task` tool cannot launch them).
- What was actually run: `general-purpose` sub-agents with `model: claude-sonnet-5.5`, `reasoning_effort: high`, each told to read an agent file and follow it. ~9-13 min per full-scope hunter pass, ~6 min for the verifier.

### Trial results (see 14.1 / 14.2)
1. Broad hunter on explore (fast model), 2 runs: 1-2 of 4 known issues each; run-to-run variable.
2. Split passes on explore, stall/mail scope: all 3 known issues across passes, plus 1 related candidate.
3. Full-scope passes on claude-sonnet-5.5 / high effort: all known issues, plus new candidates; verifier outcomes in 14.2.
4. The verifier on the strong model correctly downgraded hunter severities (e.g. allowlist-only issues to low).

### Consolidated verified findings (all from code reading, none exploited against a live system)
| # | Finding | Verdict / severity |
|---|---|---|
| 1 | Azure AD login: uid = email claim, `common` tenant, unsigned id_token (social-auth-core 4.5.4) | likely, critical (0.72); needs Entra check: multi-tenant registration? prod keys set? |
| 2 | Anonymous stall create accepts status/triage/polling_place (also crashes staff pending list/history) | confirmed, medium |
| 3 | Token holder sets `status`/`submitter_type` via update_and_resubmit | confirmed, medium |
| 4 | Unescaped user input in HTML emails; attacker picks recipient | likely, medium |
| 5 | Loose `location_info` schema poisons staff unofficial-stalls list | likely, medium |
| 6 | Any authenticated user can approve/decline/update/delete stalls and forge audit fields | confirmed, low (allowlist-only) |
| 7 | HMAC over undelimited id+token, `==` compare | likely, low |
| 8 | X-Forwarded-For first hop stored as history IP; 3+ hops 500 | likely, low |
| 9 | Dockerfile `poetry update`, unpinned Poetry installer | likely, low |

### Limitations
- Scoring against known findings is circular (we found those first); false-negative rate on unknown issues is unmeasured.
- Verifier and hunters share one model family, so correlated blind spots are possible.
- Findings 1 (Azure) and 6 depend on deployment facts not in the repo.
- Recall varies between runs; run the passes more than once for important reviews.

### Suggested next steps
1. Check the Entra app registration (supported account types) and, if multi-tenant, switch the social uid to `oid` / restrict to the tenant.
2. Fix 2, 3, 4, 5 (dedicated public serializers with read-only triage fields; ChoiceField or read-only for status; html.escape in `mailgun.py`; tighten `location_info` schema) following `.github/instructions/testing.instructions.md`.
3. Trial the React hunter; seed a known bug to measure recall; run `security-audit` in the Copilot CLI.
4. Decide whether to commit `.github/agents/` (add the Copilot co-author trailer) and wire the verifier-gated audit into CI or a scheduled run.

## 14.4 Improving recall, and live-system testing (ideas, not yet done)

### Recall levers (cheapest first)
1. Repeat each hunter pass 2-3 times and union results (run-to-run variance is the main observed problem).
2. Narrower passes: one sub-pass per vulnerability class or file group, so each agent reads less and goes deeper.
3. Deterministic hints fed to the hunters: Semgrep (`python/django/security`, `typescript/react/security`), Bandit, and a script that lists every serializer's writable fields, every route's permission classes and every template placeholder. Removes reliance on the model to enumerate.
4. Diversity: run some passes on a second model family to reduce correlated blind spots (hunters and verifier currently share one).
5. Measure: seeded-bug benchmark (inject known bugs on a scratch branch) plus the confirmed findings as a regression set; track recall per prompt change. Current scoring is circular.
6. Self-recheck round: before returning, the hunter lists what it skipped against the checklist and enumerations.
7. Add a "variant analysis" pass: for every confirmed finding, search for the same pattern elsewhere (e.g. other bare CharField status overrides, other format_map sinks).

### Live-system verification (needs a disposable stack, never production)
- Needs: docker compose with PostGIS, seeded data, throwaway users/tokens, mail in dev (print) mode. Not available in the authoring sandbox.
- Verifier gets an optional "run it" mode: send real HTTP requests to confirm/deny likely findings (e.g. create-with-status then GET pending list; bad `location_info` then the unofficial list; X-Forwarded-For handling via nginx).
- Value: raises precision (likely -> confirmed) and finds runtime-only behaviour (nginx headers, Postgres NULL ordering, caching, real permission responses). Does not by itself widen what hunters think to test.

### Different kinds of hunters for a live system (from memory, not researched this session; verify before adopting)
- Schema-driven API fuzzing: Schemathesis or similar against the OpenAPI schema (drf-spectacular is already configured but has no `extend_schema`, so the schema would need improving first). Finds 500s and schema/response mismatches, e.g. the location_info crash class.
- DAST scanners: OWASP ZAP (baseline/API scan), Nuclei templates. Good for headers, CORS, cookie flags, known misconfigurations; weak on business logic.
- Authorisation matrix testing: script or agent replays every endpoint as anonymous / token holder / allowlisted user / other user and diffs responses. Directly targets the IDOR / permission class of finding that hunters miss.
- Stateful business-logic fuzzing (e.g. RESTler-style): chains create -> edit -> approve calls and checks invariants (a Pending stall must never appear approved to the public).
- LLM pentest agents driving a browser/HTTP client (Playwright is available as an MCP tool here) to explore the admin and public UIs and attempt abuse flows (stall submit, edit link, opt-out, login).
- Dependency/image scanning: pip-audit, npm audit, Trivy on the built images, gitleaks for secrets.
Suggested order: authorisation matrix + Schemathesis first (cheap, deterministic, complements code reading), then verifier "run it" mode, then an LLM pentest agent.

## 14.5 Business-logic testing and draft invariants

### Why generic scanners are weak here
Business-logic flaws need an oracle: a statement of what the app is supposed to do. ZAP/Nuclei have none. What works is supplying one:
- Invariant-based stateful testing (Hypothesis stateful tests, RESTler-style call chaining): generate call sequences, check invariants after each step. Best fit for this app; it would have found the anonymous-create and token-holder status bugs without reading code.
- Authorisation matrix with an explicit policy table (who may call what), replayed per role and diffed.
- LLM agents given a written spec of the intended workflow and asked to break it (creative, unreliable, needs verification).
- Differential/metamorphic checks: same outcome via direct call vs the intended flow.
- Human review against the spec (the tools above scale this).

### Draft invariants (inferred from code reading and the confirmed findings; NOT yet confirmed with the maintainer)
Stall lifecycle
1. A stall created by an anonymous caller is always Pending, with no triaged_by, triaged_on or previous_status, whatever the request body contains. (Violated today: findings 2.)
2. Only a moderator action (`approve` / `decline`) changes a stall's status to Approved or Declined, and it always records triaged_by (the acting user) and triaged_on.
3. A stall edited via the edit link (token + signature) always ends up Pending, with status and submitter_type unchanged by the caller. (Violated today: finding 3.)
4. status is always one of the StallStatus choices; no endpoint can store another value.
5. submitter_type restrictions enforced on create (e.g. run-out / red-cross-of-shame tip-off types) also hold on edit.
6. polling_place on a stall belongs to the same election as the stall and is active.
7. A token+signature pair grants access to exactly one stall and nothing else; changing the stall id or token invalidates the signature.
Publication and visibility
8. Noms and other public polling-place data change only through an approve action by an authenticated moderator, never directly from a submission.
9. The public `lookup` / `has_approved_subs` result for a polling place reflects only genuinely moderated (approved) submissions.
10. Public endpoints never expose submitter email, triage user names, internal history or ip_address.
Roles and audit
11. Only users in the allowlist (and, if roles are introduced, moderators) can reach approve/decline/update/delete; non-staff callers get 401/403.
12. Audit fields (triaged_by, actioned_by, history_user, ip_address) are set server-side from the authenticated request only, never from request data or client-supplied headers.
13. Every change to a history-tracked model records a history row with the true actor.
Robustness
14. No anonymous input can cause a 500 on a staff endpoint (pending list, unofficial list, polling-place history); malformed `location_info` is rejected at submission.
15. Outbound email contains only escaped user content, and goes only to an address the submitter is allowed to use (consider ownership confirmation).
Login
16. A user is identified by an immutable, tenant-bound identifier (e.g. Azure `tid`+`oid`), and only users from the organisation's tenant can sign in.

### How to use the list
- Turn each into either a stateful test (Hypothesis against the live stack) or a row in the authorisation matrix.
- Ask the maintainer to confirm/correct the list first; invariants 2, 6, 11 and 15 especially depend on intent (are all allowlisted users moderators? may a stall attach to any polling place?).
- The verifier and hunters can also take the confirmed list as a spec ("find code paths that violate these").

## Where we got to
- Four read-only agents exist in `.github/agents/` (two hunters, a verifier, an orchestrator). They are uncommitted.
- The agents were run through generic sub-agents, not as true custom agents. Full-scope runs on a strong model found all known issues plus new ones, and the verifier corrected inflated severities.
- Recall varies between runs. The recall levers, live-testing ideas and draft invariants are recorded in 14.4 and 14.5. None of them are built.

## Potential next steps
- Commit the agents and try `security-audit` in the Copilot CLI.
- Trial the React hunter.
- Build the seeded-bug benchmark and a script that lists writable serializer fields, permissions and template placeholders.
- Build the authorisation matrix and invariant-based tests against a disposable stack.
- Decide whether to run the audit on a schedule or in CI.

## Open questions
- Is the `agent` delegation tool name in `security-audit` correct for Copilot custom agents?
- Is a disposable live stack (PostGIS and seeded data) acceptable in CI or a dev container?
- Should the audit be a gate on pull requests or an advisory scheduled run?
- Is a second model family available and allowed for diversity?
- Are the draft invariants right (especially 2, 6, 11 and 15)?
