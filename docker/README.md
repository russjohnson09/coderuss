==Build docker-compose==
* docker-compose build
* docker-compose up -d
* docker exec -it app_web_1 /bin/bash

==Rebuild docker-compose==
* docker-compose build
* docker exec -it app_web_1 /bin/bash

==windows shared folder==
docker run -it --rm -v /c/Users/Username:/mnt coderuss /bin/bash


==Cloud9 setup==
run /docker/scripts/mongo-cloud9.sh
./docker/scripts/mongod to startup mongo database
install frotz
sudo apt-get update
sudo apt-get install frotz