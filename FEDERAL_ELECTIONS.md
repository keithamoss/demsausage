# Before the election is called

1. Load new electoral boundaries data
2. If available, load the expected election day polling places data

# When the election is called

2. Refresh the overseas polling place data (note: this data may not be published until at least a few days after the election is called)
3. Merge the overseas polling places with the official list (per instructions)
4. Load the polling places from the AEC

# TOOD

- How did we pick up the wrong location stuff last time? We're not geocoding everything and then comparing are we? Or is it something vs the historical data?
