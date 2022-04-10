# Data Source

[Federal electoral boundary GIS data for free download](https://aec.gov.au/Electorates/gis/gis_datadownload.htm)

Downloaded 10/05/2019.

# Loading data

Bring up the Dockerised Democracy Sausage infrastructure.

```
docker-compose up
```

Then run the loader script.

```
docker exec -it demsausage-django-1 python /electoral_boundaries/federal_2022/electoral_boundaries/load.py
```
