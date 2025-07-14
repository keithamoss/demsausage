```
docker compose up db
docker exec -i -t demsausage-db-1 /bin/bash
cd /var/lib/postgresql/scripts
./replace-dev-with-prod.sh
```
