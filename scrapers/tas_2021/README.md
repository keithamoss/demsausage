# Polling places we added:

Blackmans Bay Primary School

Completely missing from the data, but listed on TEC's website.

TEC has been notified.

TEC provided updated data on election day with the polling place added and two dupes removed.

# Polling places we tweaked in the DB to get around the old "schools are big and fail to match by location radius distance":

## Taroona Primary School

SRID=4326;POINT(147.3528774 -42.943093)
SRID=4326;POINT(147.35492 -42.94294)

{"geom": {"type": "Point", "coordinates": [147.3528774, -42.943093]}, "name": "Taroona Primary School", "state": "TAS", "address": "104 Channel Hwy, Taroona TAS 7053, Australia"}
{"geom": {"type": "Point", "coordinates": [147.35492, -42.94294]}, "name": "Taroona Primary School", "state": "TAS", "address": "104 Channel Hwy, Taroona TAS 7053, Australia"}

Reason: The old "schools are big" issue again. In this case, it's a Primary School and a High School next to each other.

## Goulburn Street Primary School

SRID=4326;POINT(147.3088312 -42.8895129)
SRID=4326;POINT(147.31741 -42.88763)

{"geom": {"type": "Point", "coordinates": [147.3088312, -42.8895129]}, "name": "Forest Road", "state": "TAS", "address": "Forest Rd, West Hobart TAS 7000, Australia"}
{"geom": {"type": "Point", "coordinates": [147.31741, -42.88763]}, "name": "Forest Road", "state": "TAS", "address": "Forest Rd, West Hobart TAS 7000, Australia"}

Reason: The address given by the stall was just "Forest Road", so Google returned a point somewhere on the road.
