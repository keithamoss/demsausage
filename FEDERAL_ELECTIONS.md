# Before the election is called

1. Load new electoral boundaries data
2. If available, load the expected election day polling places data

# When the election is called

2. Refresh the overseas polling place data
3. Merge the overseas polling places with the official list (manually per instructions)
4. Load the polling places from the AEC

# TOOD

- Automate loading overseas polling places
- How did we pick up the wrong location stuff last time? We're not geocoding everything and then comparing are we? Or is it something vs the historical data?
- Use different Sentry projects for public vs admin
