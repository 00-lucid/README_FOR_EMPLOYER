# redhat offline package
# sudo yum install yum-utils
# sudo yumdownloader docker --resolve
# sudo vmhgfs-fuse .host:/ /mnt/hgfs/ -o allow_other -o uid=1000

# sudo rpm -ivh --replacefiles --replacepkgs *.rpm
# sudo systemctl start docker
# sudo systemctl enable docker.service

FROM node:14

RUN set -eux
RUN apt update
RUN apt upgrade -y
RUN apt install -y jq tree
# node에 반드시 필요한 것은 아니나, 자주 사용되기에 추가함
RUN apt-get install -y libc6-dev gcc g++ libncurses5-dev libstdc++6 build-essential

# projects
ENV NODE_ENV=production

WORKDIR /workspaces/farpoint/services/proxy
COPY package.json       package.json
COPY package-lock.json  package-lock.json
COPY index.js       index.js
RUN npm ci --only=prod

CMD [ "npm","start" ]
