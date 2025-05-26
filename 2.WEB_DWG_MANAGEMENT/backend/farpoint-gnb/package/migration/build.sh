#! /bin/sh
set -ex
cd "$(dirname "$0")"

imageName=${SOLUTION_NAME}/migration
docker rmi -f $imageName
docker build --force-rm -t $imageName $SOLUTION_PATH/package/migration
docker save $imageName | gzip > "output/migration.tar.gz"