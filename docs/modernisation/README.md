# Democracy Sausage: modernisation plan

Status: analysis and planning. The only code-adjacent change so far is the set of read-only security agents in `.github/agents/`. Stale docs (`FOO.md`, `LOADER_REDESIGN_PLAN.md`, `MPP_SUBTASK_REDESIGN_SPEC.md`) are intentionally left in place.

The plan was split from one document, so section numbers (1 to 15) are kept and cross-references like "section 13" still apply across files.

| File | Sections | Contents |
|---|---|---|
| [01-context-and-roadmap.md](01-context-and-roadmap.md) | 1-2 | Context, constraints, four-phase roadmap |
| [02-data-model-and-matcher.md](02-data-model-and-matcher.md) | 3-7 | Target Django data model, matcher decision, evidence, caveats, next steps |
| [03-known-bugs-and-config-audit.md](03-known-bugs-and-config-audit.md) | 8-9 | Known bugs, audit of the 262 `fix_data_issues` entries |
| [04-scrape-time-validation.md](04-scrape-time-validation.md) | 10-11 | Scrape-time validation design, backtests on historical data |
| [05-frontend-api-delivery.md](05-frontend-api-delivery.md) | 12 | Frontend, API and delivery analysis |
| [06-security-review.md](06-security-review.md) | 13 | Security review of Django and the redesigned apps, with verification |
| [07-security-agents.md](07-security-agents.md) | 14-14.5 | Security-agent research, trials, results, recall ideas, business-logic invariants |
| [08-static-public-site.md](08-static-public-site.md) | 15 | Static S3/CDN public site design, local Compose stack, loaded data, benchmarks |
| [09-serverless-public-write-path.md](09-serverless-public-write-path.md) | n/a | Serverless replacement for stall submission, token reads, notifications and og:image |
| [10-dev-environment-and-synthetic-data.md](10-dev-environment-and-synthetic-data.md) | n/a | Plan for a one-command agent-friendly dev stack with deterministic synthetic data |
| [experiments/](experiments/) | n/a | Throwaway scripts behind the matcher and detector evidence |

## Notes
- Findings come from reading code. Unless a section says a reproduction was run, nothing was exploited against a live system.
- The `experiments/` scripts are exploratory. They assume a scratch directory at `/tmp` and downloaded data that is not in the repo, so they are evidence of method, not runnable tools.
- Draft invariants in section 14.5 are inferred from code and need maintainer confirmation.
