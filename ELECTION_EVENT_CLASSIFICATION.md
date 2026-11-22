# Election event classification

Before implementation, inventory and agree on classifications for all existing
elections, including hidden elections. The public subset and proposed
classifications are in [the inventory](ELECTION_CLASSIFICATION_INVENTORY.md).

The model change is to:

- Rename `jurisdiction`; agree on the new name and its precise meaning.
- Add event-level and event-type fields; agree on their values and how they
  represent multi-contest events. Expose them in the API and election editor.
- Retire the `is_state` and `is_federal` booleans, with a coordinated migration
  and API/frontend transition.
- Audit **every use** of those booleans and decide the intended behaviour for
  each event classification before replacing it. This includes public search's
  overseas-results option, public Sausagelytics calculation and display, and
  admin comparisons; check backend and other API consumers too. The WA Senate
  re-run's comparison treatment must not silently change unrelated behaviour.
- Use the agreed classifications to backfill existing events and to drive the
  chart and benchmark candidate selection consistently.

The WA Senate re-run should compare with WA general elections, and the 2023
referendum with federal general elections, both in either direction.
By-elections and local-government events should neither have comparisons nor
appear in other events' comparisons. The proposed operational treatment is to
classify the WA Senate re-run at state level for comparison purposes; review
the implications at the other boolean-use sites before finalising the model.

Replace the benchmark's temporary named inventory mapping with explicit
classification. Its 50-polling-place heuristic and historical-quality thresholds
have been removed under [the agreed benchmark rules](ELECTION_BENCHMARK_RELIABILITY.md).
The classification model change is not implemented.
