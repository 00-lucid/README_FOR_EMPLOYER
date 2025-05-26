#! /bin/sh
set -ex
cd "$(dirname "$0")"

imageName=${SOLUTION_NAME}/converter
docker rmi -f $imageName
docker build --force-rm -t $imageName $SOLUTION_PATH/package/converter

# docker save $imageName | gzip > "output/converter.tar.gz"
