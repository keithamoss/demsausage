# Source

https://www.tec.tas.gov.au/house-of-assembly/elections-2024/ways-to-vote/polling-places.html

https://www.google.com/maps/d/u/0/viewer?mid=1QEIFgj0qwtaW6HKoMR7DoqgWxsmdhiM&ll=-41.54086995838426%2C146.69419721347654&z=9

# Conversion

Converted using https://mygeodata.cloud with manual removal of duplicate fields.

# Unmigratable stalls processing

UPDATE demsausage.app_stalls SET status = 'Declined', polling_place_id = NULL, approved_on = NULL WHERE id IN (7079, 7081, 7061, 7090, 7091);

DELETE FROM demsausage.app_pollingplaces WHERE id IN (374344, 374348, 374325, 374337, 374339);

## Added again by hand

Taroona Primary School (7061)
RHPS Sausage Sizzle (7091)

## Removed

Kyeemagh Public School (7079): It's in NSW
CWA Hall Lindisfarne (7081): Not actually a polling booth (and the nearby booth already has a stall)
Waverley Primary School Association Democracy BBQ (7090): Dupe
