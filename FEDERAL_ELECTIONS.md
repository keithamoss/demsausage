# Before the election is called

1. Load new electoral boundaries data
2. If available, load the expected election day polling places data
3. Book AT LEAST two days of leave before, and one or two days of leave afterwards

# Tasks to do IN THE WEEK before election day:
Resize the database the WEEKEND before so we miss peak load.

## 1. Resize the backend server
Federal 2022 was 8vCPUs, 16GB RAM, 25GB SSD, 6TB Transfer and had no performance issues. 

Probably overspecd for what it was, and way overspecd from what we use historically because of the unknowns around the new addition of the RQ queue, the social preview images, and the option to embed the site as an image or interactive map.

Federal 2025 was 4vCPU / 16GB and it did just fine.

Resized back to: 1vCPU / 2GB

## 2. Resize and reconfigure the database server
Upsized to: 4vCPU / 16GB (t2.xlarge)
Changed shared_buffers to 2048MB (to make use of our extra memory)
Changed maintenance_work_mem to 1GB (should be 10% of system memory with a max of 1GB)

Resized back to: 1vCPU / 2GB (t2.small)
Changed shared_buffers back to 250MB
Changed maintenance_work_mem back to 128MB

## 3. Setup alerts for the database server
e.g. CloudWatch alarms to spot issues like we had during Fed 2025 where slow queries would gradually start to be logged as the database crawled to an unresponsive halt.

- CPU utilisation >= 30%
- Incoming log events > 5 in a 1 minute period

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

## Stashing stats and logs
- Resize the database and backend server
- Server and API usage stats.xlsx: Take screenshots of server usage from AWS, DO, CloudFlare, and Mapbox
- Store logs in S3: Archive, reset, and clean-up log files from DO
- 'CloudFlare' folder: Dump the four flavours of analytics reports we get from CloudFlare
- 'Web server logs' folder: Analyse access.log (see 'log_analysis')
- Analyse error.log and log GitHub issues (see 'log_analysis')
- Analyse django.log, python_rq, supervisord, and friends and log GitHub issues
- 'Google analytics' folder: Dump Google Analytics reports:
-- Acquisition: Overview
-- Engagement: Overview
-- Engagement: Events (page size = 250)
-- Engagement: Pages and screens (page size = 250)
-- Retention
-- Search Console: Queries (page size = 250)
-- User attributes: Overview
-- Tech: Overview