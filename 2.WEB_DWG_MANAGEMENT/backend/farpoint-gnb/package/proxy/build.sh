#! /bin/sh
set -ex
cd "$(dirname "$0")"

for proj in "proxy"; do
    npm i --prefix $SOLUTION_PATH/package/$proj
done

proxyName=${SOLUTION_NAME}/proxy
docker rmi -f $proxyName
docker build --force-rm -t $proxyName $SOLUTION_PATH/package/proxy

docker save $proxyName | gzip > "output/proxy.tar.gz"

rm -rf node_modules