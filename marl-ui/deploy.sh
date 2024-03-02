rm -rf dist
yarn build

# password admin
# scp -r dist/* root@10.0.75.238:/var/www/html/tieta
# password admin
# scp -P 2222 -r dist/* root@10.0.73.115:/var/www/html/tieta

# password admin
scp -r mark-server nvidia@10.4.213.241:/home/nvidia/disk/code/edge-zs-webserver
sucd
docker cp ./dist/. edge-v2x-mark-ui:/usr/share/nginx/html/
# sudo chmod -R 7777 /home/nvidia/disk/code/edge-zs-webserver/mark-ui