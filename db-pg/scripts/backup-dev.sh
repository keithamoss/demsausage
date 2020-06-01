now=`date '+%Y_%m_%d__%H_%M_%S'`

echo "Dump development database"
export $(xargs < secrets/sausage-dev-db.env)
echo "${DB_HOST}:${DB_PORT}:${DB_NAME}:${DB_USERNAME}:${DB_PASSWORD}" > ~/.pgpass
chmod 600 ~/.pgpass

dev_db_dump_file="local_dev_db_${DB_SCHEMA}_${now}.dump"
pg_dump --host=$DB_HOST --username=$DB_USERNAME --format=custom --schema=$DB_SCHEMA $DB_NAME > $dev_db_dump_file