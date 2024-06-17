now=`date '+%Y_%m_%d__%H_%M_%S'`

echo "Dump staging database"
export $(xargs < secrets/sausage-staging-db.env)
echo "${DB_HOST}:${DB_PORT}:${DB_NAME}:${DB_USERNAME}:${DB_PASSWORD}" > ~/.pgpass
chmod 600 ~/.pgpass

staging_db_dump_file="dumps/aws-db_${DB_SCHEMA}_${now}.dump"
pg_dump --host=$DB_HOST --username=$DB_USERNAME --format=custom --schema=$DB_SCHEMA $DB_NAME > $staging_db_dump_file

DB_HOST=
DB_PORT=
DB_NAME=
DB_USERNAME=
DB_PASSWORD=

# If staging dump exists and is not empty
if [[ -f $staging_db_dump_file && -s $staging_db_dump_file ]]; then
  echo "Backup development database"
  export $(xargs < secrets/sausage-dev-db.env)
  echo "${DB_HOST}:${DB_PORT}:${DB_NAME}:${DB_USERNAME}:${DB_PASSWORD}" > ~/.pgpass

  psql --host=$DB_HOST --username=$DB_USERNAME --dbname=$DB_NAME --command='DROP SCHEMA IF EXISTS "'"$DB_SCHEMA"'_bak" CASCADE;'
  psql --host=$DB_HOST --username=$DB_USERNAME --dbname=$DB_NAME --command='ALTER SCHEMA "'"$DB_SCHEMA"'" RENAME TO "'"$DB_SCHEMA"'_bak";'

  echo "Load staging database dump to development (host=$DB_HOST)"
  pg_restore --host=$DB_HOST --username=$DB_USERNAME --dbname=$DB_NAME --single-transaction $staging_db_dump_file
fi

echo "Fin"