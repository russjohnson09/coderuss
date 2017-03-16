sudo apt-get install -y mongodb-org

mkdir /tmp/data

mongod --bind_ip=$IP --dbpath=/tmp/data --nojournal --rest "$@"