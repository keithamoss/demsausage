## 1. Context and constraints
- Redesign apps (`public-redesign`, `admin-redesign`) are live.
- Driver: developer experience and maintainability. Upgrades are done per component. Production is Docker Compose on a VM. Timing is flexible.
- Scrapers are a mix of reusable and one-off, run manually, and finished ones are never re-run.
- The electoral commission is the source of truth per election. MPP (the venue layer) may override it later, after human review.
- Early-voting centres and election offices are outside the election-day dataset. Filter by the source's explicit record type before matching, duplicate checks, validation and diff reporting; do not exclude an election-day record merely because its premises also hosts early voting. Retain the raw source separately; there is no `kind` field in the output.

## 2. Roadmap (4 phases)
Phase detail was given in chat; this file records the workstreams that were designed in depth.
1. **Scraper framework.** A Python package plus CLI with a typed interchange format and shared normalise, validate, patch and diff steps.
2. **Loader redesign.** Six phases to split the 2,461-line `loader.py` (matching, migrate, dedupe, rollback).
3. **Polling-place data model.** Stable booth identity and an append-only ingest history (section 3).
4. **Dependency and tooling upgrades.** Done per component, after phases 1-3.

### Scraper framework requirements from VIC 2026
- Source adapters must support absent or partially populated commission IDs. Diffing cannot depend on every commission issuing stable IDs.
- Preserve raw downloads and records alongside normalised values. Record retrieval time, source URL, content hash and any publisher-provided update time separately: the VEC API, spreadsheet and spatial export can update independently.
- Produce semantic diffs, not file-text diffs: ignore feature/property ordering, insignificant coordinate rounding and known representation-only differences. Keep original values available in the detailed report.
- Report confirmed modifications, additions, absences and unresolved possible matches separately. Reviewed linkage decisions must be retained with provenance so ambiguous cases do not need resolving on every run.
- Report meaningful relocations even when identity matching is confident. The matcher and validation details, including proposed Victorian regression cases, are in [02-data-model-and-matcher.md](02-data-model-and-matcher.md) and [04-scrape-time-validation.md](04-scrape-time-validation.md).

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
