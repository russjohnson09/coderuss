mkdir /tmp/data | true

mongod --bind_ip=0.0.0.0 --dbpath=/tmp/data --nojournal --rest "$@"