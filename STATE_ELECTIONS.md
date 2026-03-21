# Before the election is called

1. If available, load the expected election day polling places data

# Tasks to do IN THE WEEK before election day:
Resize the database the WEEKEND before so we miss peak load.

## 1. Resize the backend server
South Australia 2026 was 2vCPU / 4GB and it did just fine.

Resized back to: 1vCPU / 2GB

## 2. Resize and reconfigure the database server
Upsized to: 2vCPU / 4GB (t2.medium)
Changed shared_buffers to 3000MB (to make use of our extra memory)
Changed maintenance_work_mem to 512MB (should be 10% of system memory with a max of 1GB)

Resized back to: 1vCPU / 2GB (t2.small)
Changed shared_buffers back to 250MB
Changed maintenance_work_mem back to 128MB

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