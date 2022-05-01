FROM eoranged/rq-dashboard:latest

# Because https://github.com/Parallels/rq-dashboard/issues/362 (compatibility issues)
RUN pip install rq==1.10.1

ENTRYPOINT ["/app/docker-entrypoint.sh"]