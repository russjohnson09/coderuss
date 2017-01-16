#!/bin/bash

#requires java 8

sudo apt-get install openjdk-8-jre

java --version

wget https://packages.graylog2.org/repo/packages/graylog-collector-latest-repository-ubuntu14.04_latest.deb

sudo dpkg -i graylog-collector-latest-repository-ubuntu14.04_latest.deb

sudo apt-get update

sudo apt-get install apt-transport-https -y

sudo apt-get install graylog-collector -y

sudo rm graylog-collector-latest-repository-ubuntu14.04_latest.deb


