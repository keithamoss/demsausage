# Representative synthetic local data

Create a management command to bootstrap representative elections, polling
places, stalls and historical records for local analysis and UI testing.

The proposed approach is to load existing fixture CSVs, then generate stall data
through the model/serializer layer under a controlled clock so that historical
records reflect a realistic reporting timeline. This remains a proposal;
implementation and final scope are deferred.
