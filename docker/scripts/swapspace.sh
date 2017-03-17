sudo fallocate -l 4G /swapfile #Create a 4 gigabyte swapfile
sudo chmod 600 /swapfile #Secure the swapfile by restricting access to root
sudo mkswap /swapfile #Mark the file as a swap space
sudo swapon /swapfile #Enable the swap
free -m