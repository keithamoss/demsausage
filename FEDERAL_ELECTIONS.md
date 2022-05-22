# Before the election is called

1. Load new electoral boundaries data
2. If available, load the expected election day polling places data
3. Book at least two days of leave before, and one or two days of leave afterwards

# Tasks to do just before election day:

1. Resize the server (Federal 2022 was 8vCPUs, 16GB RAM, 25GB SSD, 6TB Transfer and had no performance issues. Probably overspeccd for what it was, and way overspecced from what we use historically because of the unknowns around the new addition of the RQ queue, the social preview images, and the option to embed the site as an image or interactive map)

# When the election is called

2. Refresh the overseas polling place data (note: this data may not be published until at least a few days after the election is called)
3. Merge the overseas polling places with the official list (per instructions)
4. Load the polling places from the AEC

# TOOD

- How did we pick up the wrong location stuff last time? We're not geocoding everything and then comparing are we? Or is it something vs the historical data?

# Tasks to do after election day:

- [ ] Remove volunteer access from DemSausage `UPDATE demsausage.auth_user SET is_active = False WHERE is_staff = False;`
- [ ] Copy all of the logs off of the server for later analysis for errors et cetera
- [ ] Bookmark significant/interesting Sentry logs for later and analysis fixing
- [ ] Log a ticket to examine the RQ task results for anything interesting
- [ ] Snapshot the server
- [ ] Resize the server
