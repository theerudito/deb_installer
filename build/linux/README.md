
chmod +x build/linux/build-deb.sh
./build/linux/build-deb.sh

ls -lah build/installer/

sudo dpkg -i "build/installer/deb-installer_1.0.0_amd64.deb"
sudo apt -f install

sudo dpkg -i "build/installer/deb-installer_1.0.0_amd64.deb"

