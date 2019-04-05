# April 1st 2019 Data Quality Issues

## Wrong location (AEC notified; fixed by-hand)

1. Charleville High School (PPID=6131): -26.395960, 146.259221 (was -26.40316, 146.24092)
2. Mile End (PPID=7079): -34.923374, 138.570222 (was -34.91979, 138.53797)

## Duplicate polling places (temporarily renamed by-hand)

1. Bedfordale North (Burt) (PPID=70737) and Armadale East (PPID=7468) are the same premises and location - Pioneer Village School. We've temporarily renamed Armadale East to "Bedfordale North (Canning)" so it gets deduplicated by the data loader.

## Missing locations (AEC notified; polling places skipped)

1. Oakleigh (Higgins) (PPID=34017) and Oakleigh (Hotham) (PPID=3906)
2. Wollert South (PPID=83636)
3. Warwick (PPID=7588)
4. Sorrento Beach (PPID=32446)
5. Beverley (PPID=7982)
6. Gingin (PPID=7934)
