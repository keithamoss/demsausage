## 1. Context and constraints
- Redesign apps (`public-redesign`, `admin-redesign`) are live.
- Driver: developer experience and maintainability. Upgrades are done per component. Production is Docker Compose on a VM. Timing is flexible.
- Scrapers are a mix of reusable and one-off, run manually, and finished ones are never re-run.
- The electoral commission is the source of truth per election. MPP (the venue layer) may override it later, after human review.
- Early-voting centres are never shown on the map, so they are filtered out at scrape time and there is no `kind` field.

## 2. Roadmap (4 phases)
Phase detail was given in chat; this file records the workstreams that were designed in depth.
1. **Scraper framework.** A Python package plus CLI with a typed interchange format and shared normalise, validate, patch and diff steps.
2. **Loader redesign.** Six phases to split the 2,461-line `loader.py` (matching, migrate, dedupe, rollback).
3. **Polling-place data model.** Stable booth identity and an append-only ingest history (section 3).
4. **Dependency and tooling upgrades.** Done per component, after phases 1-3.

## Where we got to
- Constraints and drivers are agreed. Phases 1-3 are designed in depth (files 02-04); phase 4 is outlined only.
- The security analysis (files 06-07) is the most actionable output and sits partly outside the four phases.
- No application code has changed. Only read-only agents (`.github/agents/`) and these docs exist.

## Potential next steps
- Agree the order of work, for example: fix confirmed security issues, then the validator and matcher, then the schema and loader, then upgrades.
- Decide whether security fixes jump ahead of the data-model work.
- Turn each phase into tracked issues once the order is agreed.

## Open questions
- What is the intended priority between security fixes, data-model work and upgrades?
- Which Python and Node versions are targeted, and by when (Python 3.10 nears end of life)?
- Is there a calendar constraint (for example, the next election) that limits when the loader and schema can change?
