now=`date '+%Y_%m_%d__%H_%M_%S'`

export $(xargs < ../secrets/sausage-dev-db.env)
echo "${DB_HOST}:${DB_PORT}:${DB_NAME}:${DB_USERNAME}:${DB_PASSWORD}" > ~/.pgpass
chmod 600 ~/.pgpass

echo "Dump electoral boundaries table from development (host=$DB_HOST)"

dev_db_dump_file="local_dev_db_electoralboundaries_${DB_SCHEMA}_${now}.dump"
table_name="app_electoralboundaries"

pg_dump --host=$DB_HOST --username=$DB_USERNAME --format=custom --schema=$DB_SCHEMA --table $DB_SCHEMA.$table_name --verbose $DB_NAME > $dev_db_dump_file
echo "$dev_db_dump_file created"

DB_HOST=
DB_PORT=
DB_NAME=
DB_USERNAME=
DB_PASSWORD=

# If dev dump exists and is not empty
if [[ -f $dev_db_dump_file && -s $dev_db_dump_file ]]; then
  export $(xargs < ../secrets/sausage-prod-db.env)
  echo "${DB_HOST}:${DB_PORT}:${DB_NAME}:${DB_USERNAME}:${DB_PASSWORD}" > ~/.pgpass

  echo "Backup electoral boundaries table from production (host=$DB_HOST)"

  prod_db_dump_file="aws-db_electoralboundaries_${DB_SCHEMA}_${now}.dump"
  table_name="app_electoralboundaries"

  pg_dump --host=$DB_HOST --username=$DB_USERNAME --format=custom --schema=$DB_SCHEMA --table $DB_SCHEMA.$table_name --verbose $DB_NAME > $prod_db_dump_file
  echo "$prod_db_dump_file created"

  echo "Drop '$table_name' in production (host=$DB_HOST)"
  psql --host=$DB_HOST --username=$DB_USERNAME --dbname=$DB_NAME --command='DROP TABLE IF EXISTS "'$DB_SCHEMA'"."'$table_name'";'

  echo "Load development table dump to production (host=$DB_HOST)"
  pg_restore --host=$DB_HOST --username=$DB_USERNAME --dbname=$DB_NAME --single-transaction --verbose $dev_db_dump_file
fi

echo "Fin"