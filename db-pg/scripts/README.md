These scripts are explicit host-terminal database maintenance operations. They are not run by the Dev Container, its rebuild, or workspace bootstrap. Review the target and expected data replacement carefully before running a restore or replacement script.

```
docker compose up db
docker exec -i -t demsausage-db-1 /bin/bash
cd /var/lib/postgresql/scripts
./replace-dev-with-prod.sh
```
