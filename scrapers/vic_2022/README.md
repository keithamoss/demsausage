# Manual submissions that haven't appeared in the data yet

```sql
-- 'St Columba's Primary School' (24 Glen Huntly Rd, Elwood VIC 3184, Australia)
UPDATE "demsausage"."app_stalls" SET "polling_place_id"=NULL WHERE "id"=5196;
DELETE FROM "demsausage"."app_pollingplaces" WHERE "id"=321414;

-- 'Fawkner Primary School' (40 Lorne St, Fawkner VIC 3060, Australia)
UPDATE "demsausage"."app_stalls" SET "polling_place_id"=NULL WHERE "id"=5221;
DELETE FROM "demsausage"."app_pollingplaces" WHERE "id"=321441;
```

# Manually fix slightly wonky location data on a few manual submissions that were blocking loading

```sql
UPDATE "demsausage"."app_stalls" SET "location_info"='{"geom":{"type":"Point","coordinates":[145.0547616,-37.98011753]},"name":"Mentone Girls'' Secondary College","state":"VIC","address":"175 Balcombe Rd, Mentone VIC 3194, Australia"}' WHERE "id"=5213;
UPDATE "demsausage"."app_pollingplaces" SET "geom" = 'SRID=4326;POINT(145.0547616 -37.98011753)' WHERE "id" = 321418;

UPDATE "demsausage"."app_stalls" SET "location_info" = '{"geom":{"type":"Point","coordinates":[143.8022055, -37.55480626]},"name":"Alfredton Primary School","state":"VIC","address":"89A Cuthberts Rd, Alfredton VIC 3350, Australia"}' WHERE "id" = 5253;
UPDATE "demsausage"."app_pollingplaces" SET "geom" = 'SRID=4326;POINT(143.8022055 -37.55480626)' WHERE "id" = 321454;

UPDATE "demsausage"."app_stalls" SET "location_info" = '{"geom":{"type":"Point","coordinates":[145.3228644,-37.81102736]},"name":"Gladesville Primary School","state":"VIC","address":"48 Gladesville Dr, Kilsyth VIC 3137, Australia"}' WHERE "id" = 5212;
UPDATE "demsausage"."app_pollingplaces" SET "geom" = 'SRID=4326;POINT(145.3228644 -37.81102736)' WHERE "id" = 321417;

UPDATE "demsausage"."app_stalls" SET "location_info" = '{"geom":{"type":"Point","coordinates":[145.0419402,-37.89944641]},"name":"Kilvington Grammar School","state":"VIC","address":"Kilvington Grammar School, 2 Leila Rd, Ormond VIC 3204, Australia"}' WHERE "id" = 5252;
UPDATE "demsausage"."app_pollingplaces" SET "geom" = 'SRID=4326;POINT(145.0419402 -37.89944641)' WHERE "id" = 321455;

UPDATE "demsausage"."app_stalls" SET "location_info"='{"geom":{"type":"Point","coordinates":[144.82204,-37.86802312]},"name":"109 Blyth Street","state":"VIC","address":"Altona Primary, 109 Blyth St, Altona VIC 3018, Australia"}' WHERE "id"=5229;
UPDATE "demsausage"."app_pollingplaces" SET "geom"='SRID=4326;POINT(144.82204 -37.868023121)' WHERE "id"=321438;

UPDATE "demsausage"."app_stalls" SET "location_info"='{"geom":{"type":"Point","coordinates":[145.2722114,-37.76635763]},"name":"Yarra Road Primary School","state":"VIC","address":"222-228 Yarra Rd, Croydon North VIC 3136, Australia"}' WHERE "id"=5259;
UPDATE "demsausage"."app_pollingplaces" SET "geom"='SRID=4326;POINT(145.2722114 -37.76635763)' WHERE "id"=321468;
```
