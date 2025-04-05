# Data Source

[Federal electoral boundary GIS data for free download](https://aec.gov.au/Electorates/gis/gis_datadownload.htm)

Downloaded 05/04/2025.

# Loading data

Bring up the Dockerised Democracy Sausage infrastructure.

```
docker-compose up
```

Then replace dev's database with prod:

```
docker exec -it demsausage-db-1 /bin/bash
cd /var/lib/postgresql/scripts
. replace-dev-with-prod.sh
```

Then, if we've changed models.py, apply any migrations.

```
docker compose exec -it django /bin/bash
python manage.py makemigrations
python manage.py migrate
```

Then run the loader script.

```
docker compose exec -it django python /electoral_boundaries/federal_2025/load.py
```

Then, if all is good, replace the production table with the new development table:

```
docker exec -it demsausage-db-1 /bin/bash
cd /var/lib/postgresql/scripts/electoral_boundaries
. replace-electoral-boundaries.sh
```
