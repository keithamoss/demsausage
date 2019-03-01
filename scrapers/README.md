# What is this?

Not all electoral commissions publish CSV files of polling places data, so we maintain this collection of web scrapers to get the data that Democracy Sausage needs to run.

These scrapers are run several times in the lead up to an election in order to capture any changes in polling booths.

# Are you from an electoral commission?

We would much prefer to source data officially from each electoral commission, in a machine-readable format, and with an appropriate data licence (like [Creative Commons](https://creativecommons.org.au/learn/licences/)).

If you can help us with that, or you have any concerns about what we're doing, do please get in touch with us at [ausdemocracysausage@gmail.com](mailto:ausdemocracysausage@gmail.com).

(And to be clear - we don't make any money off of running Democracy Sausage. This is a 'just for fun' project that we hope contributes in some small way to getting people enthusiastic about voting.)

# Running the scrapers

Bring up the Dockerised Democracy Sausage infrastructure.

```
docker-compose up
```

Then run your chosen scraper.

```
docker exec -it demsausage-v3_django_1 pip install -r /scrapers/requirements.txt
docker exec -it demsausage-v3_django_1 python /scrapers/nsw/scrape.py
```
