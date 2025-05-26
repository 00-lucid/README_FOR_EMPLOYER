#! /bin/sh
set -ex
cd "$(dirname "$0")"

imageName=${SOLUTION_NAME}/appbase
docker rmi -f $imageName
docker build --force-rm -t $imageName ./
docker save $imageName | gzip > "output/appbase.tar.gz"
