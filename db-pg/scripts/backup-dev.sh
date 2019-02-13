DB_HOST=db
DB_PORT=5432
DB_NAME=stack
DB_SCHEMA=demsausage
DB_USERNAME=postgres
DB_PASSWORD=postgres

BASE_DIR="/var/lib/postgresql/scripts"
now=`date '+%Y_%m_%d__%H_%M_%S'`

# pg_dump --username=$DB_USERNAME --schema=$DB_SCHEMA --table="$DB_SCHEMA.app_*" --format=custom $DB_NAME > "$BASE_DIR/${DB_SCHEMA}_app_${now}.dump"
# pg_dump --username=$DB_USERNAME --schema=$DB_SCHEMA --format=custom $DB_NAME > "$BASE_DIR/${DB_SCHEMA}_${now}.dump"

DB_NAME="scratch"

# psql --username=$DB_USERNAME --dbname=$DB_NAME --command='ALTER SCHEMA "'"$DB_SCHEMA"'" RENAME TO "'"$DB_SCHEMA"'_bak";'

# pg_restore --username=$DB_USERNAME --dbname=$DB_NAME --single-transaction "${BASE_DIR}/demsausage_2019_02_13__13_10_18.dump"
