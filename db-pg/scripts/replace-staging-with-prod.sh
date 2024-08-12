now=`date '+%Y_%m_%d__%H_%M_%S'`

echo "Dump production database"
export $(xargs < secrets/sausage-prod-db.env)
echo "${DB_HOST}:${DB_PORT}:${DB_NAME}:${DB_USERNAME}:${DB_PASSWORD}" > ~/.pgpass
chmod 600 ~/.pgpass

prod_db_dump_file="dumps/aws-db_${DB_SCHEMA}_${now}.dump"
pg_dump --host=$DB_HOST --username=$DB_USERNAME --format=custom --schema=$DB_SCHEMA $DB_NAME > $prod_db_dump_file

DB_HOST=
DB_PORT=
DB_NAME=
DB_USERNAME=
DB_PASSWORD=

# If prod dump exists and is not empty
if [[ -f $prod_db_dump_file && -s $prod_db_dump_file ]]; then
  echo "Backup staging database"
  export $(xargs < secrets/sausage-staging-db.env)
  echo "${DB_HOST}:${DB_PORT}:${DB_NAME}:${DB_USERNAME}:${DB_PASSWORD}" > ~/.pgpass

  psql --host=$DB_HOST --username=$DB_USERNAME --dbname=$DB_NAME --command='DROP SCHEMA IF EXISTS "'"$DB_SCHEMA"'_bak" CASCADE;'
  psql --host=$DB_HOST --username=$DB_USERNAME --dbname=$DB_NAME --command='ALTER SCHEMA "'"$DB_SCHEMA"'" RENAME TO "'"$DB_SCHEMA"'_bak";'

  echo "Load production database dump to staging (host=$DB_HOST)"
  pg_restore --host=$DB_HOST --username=$DB_USERNAME --dbname=$DB_NAME --single-transaction $prod_db_dump_file
fi

echo "Fin"