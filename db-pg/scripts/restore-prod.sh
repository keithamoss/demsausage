echo "Load database dump to production"
export $(xargs < secrets/sausage-prod-db.env)
echo "${DB_HOST}:${DB_PORT}:${DB_NAME}:${DB_USERNAME}:${DB_PASSWORD}" > ~/.pgpass
chmod 600 ~/.pgpass

db_dump_file="dumps/local_dev_db_demsausage_2019_02_17__12_17_18.dump"
pg_restore --host=$DB_HOST --username=$DB_USERNAME --dbname=$DB_NAME --single-transaction $db_dump_file