FROM ubuntu:trusty

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update


RUN apt-get install g++ -y
RUN apt-get install make -y
RUN apt-get install curl -y


RUN curl -sL https://deb.nodesource.com/setup | sudo bash -
RUN apt-get install nodejs -y 
RUN rm /usr/bin/node || true
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN npm cache clean -f
RUN npm install -g n
RUN  n 6.2.2
RUN rm /usr/bin/node
RUN ln -s /usr/local/n/versions/node/6.2.2/bin/node /usr/bin/node
RUN npm rebuild

#git required for some npm install packages
RUN apt-get install git -y

#gyp ERR! stack Error: Can't find Python executable "python", you can set the PYTHON env variable.
RUN apt-get install python-pip python-dev build-essential -y

RUN npm install -g nodemon

RUN apt-get install frotz -y

# https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-16-04
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
RUN echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
RUN apt-get update
RUN apt-get install -y mongodb-org

RUN apt-get install wget -y

RUN mkdir travis-phantomjs

RUN wget https://s3.amazonaws.com/travis-phantomjs/phantomjs-2.0.0-ubuntu-12.04.tar.bz2 -O $PWD/travis-phantomjs/phantomjs-2.0.0-ubuntu-12.04.tar.bz2
RUN tar -xvf $PWD/travis-phantomjs/phantomjs-2.0.0-ubuntu-12.04.tar.bz2 -C $PWD/travis-phantomjs


RUN apt-get install firefox -y
RUN apt-get install xvfb -y

RUN apt-get install default-jdk -y

RUN npm install selenium-standalone@latest -g
RUN selenium-standalone install

RUN npm install -g phantomjs
RUN npm install -g mocha






ADD data/db /data/db
ADD lib/systemd/system/mongod.service /lib/systemd/system/mongod.service

ADD root/bashrc /root/.bashrc

ADD scripts /scripts


