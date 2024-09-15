now=`date '+%Y_%m_%d__%H_%M_%S'`

echo "Dump production database"
export $(xargs < secrets/sausage-prod-db.env)
echo "${DB_HOST}:${DB_PORT}:${DB_NAME}:${DB_USERNAME}:${DB_PASSWORD}" > ~/.pgpass
chmod 600 ~/.pgpass

prod_db_dump_file="dumps/aws-db_${DB_SCHEMA}_${now}.dump"
pg_dump --host=$DB_HOST --username=$DB_USERNAME --format=custom --schema=$DB_SCHEMA $DB_NAME > $prod_db_dump_file