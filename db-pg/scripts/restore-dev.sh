echo "Load database dump to development"
export $(xargs < secrets/sausage-dev-db.env)
echo "${DB_HOST}:${DB_PORT}:${DB_NAME}:${DB_USERNAME}:${DB_PASSWORD}" > ~/.pgpass
chmod 600 ~/.pgpass

psql --host=$DB_HOST --username=$DB_USERNAME --dbname=$DB_NAME --command='DROP SCHEMA IF EXISTS "'"$DB_SCHEMA"'_bak" CASCADE;'
psql --host=$DB_HOST --username=$DB_USERNAME --dbname=$DB_NAME --command='ALTER SCHEMA "'"$DB_SCHEMA"'" RENAME TO "'"$DB_SCHEMA"'_bak";'

db_dump_file="dumps/aws-db_demsausage_2025_04_25__04_12_20.dump"
pg_restore --host=$DB_HOST --username=$DB_USERNAME --dbname=$DB_NAME --single-transaction $db_dump_file