# Data Source

These are polling places where we've manually QA'd the geographic locations.

Based on AEC data from 02/05/2019.

# Loading data

Bring up the Dockerised Democracy Sausage infrastructure.

```
docker-compose up
```

Then run the preparation script.

```
docker exec -it demsausage_django_1 python /data/federal_2019/data_quality/prepare.py
```

# Known Issues
- Three "TBC" addresses slipped through that were un-geocodable and just gave us the centre of the town.
- In preparing for ingest we didn't account for also needing to output fixes for all other booths (with different `ec_ids`) that would be in the AEC data