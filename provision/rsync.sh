
#sudo cp /vagrant /node/ -vR
#sudo rsync -r /vagrant/ /node -v
sudo rsync -zvr --exclude=".*/" --exclude node_modules --exclude vendor/ /vagrant/ /node