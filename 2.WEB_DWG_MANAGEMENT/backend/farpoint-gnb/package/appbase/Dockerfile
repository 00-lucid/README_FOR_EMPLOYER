FROM node:14

RUN set -eux
RUN apt update
RUN apt upgrade -y
RUN apt install -y jq tree
# node에 반드시 필요한 것은 아니나, 자주 사용되기에 추가함
RUN apt-get install -y libc6-dev gcc g++ libncurses5-dev libstdc++6 build-essential

# node_modules, global로 설치하면 프로세스 로딩이 빠르다. jest에 특히 필요하다
RUN npm i -g nodemon npm-run-all prettier prettier-plugin-sh jest serve

# node-RFC
RUN npm i -g cmake-js prebuild-install

# docker 설치, docker cli만 사용하기 때문에 아래처럼 간단하게 했다.
RUN DOCKER_PKG="docker-20.10.1.tgz";\
    curl -fsSLO --compressed "https://download.docker.com/linux/static/stable/x86_64/$DOCKER_PKG"; \
    tar -xf $DOCKER_PKG --strip-components 1 --directory /usr/local/bin/ docker/docker; \
    rm -f $DOCKER_PKG

#----- Start Oracle DB
RUN chmod 755 /usr/local/bin/docker-entrypoint.sh && \
    mkdir /opt/oracle && \
    cd /opt/oracle && \
    curl -OL https://download.oracle.com/otn_software/linux/instantclient/19600/instantclient-basic-linux.x64-19.6.0.0.0dbru.zip && \
    unzip instantclient-basic-linux.x64-19.6.0.0.0dbru.zip && \
    rm -rf instantclient-basic-linux.x64-19.6.0.0.0dbru.zip && \
    cd /opt/oracle/instantclient_19_6 && \
    ln -s /usr/lib/libnsl.so.2 /usr/lib/libnsl.so.1 && \
    ln -s /lib/libc.so.6 /usr/lib/libresolv.so.2

# RUN apk add --no-cache libaio libnsl libc6-compat &&
RUN apt-get install -y libaio1
RUN echo "export LD_LIBRARY_PATH=/opt/oracle/instantclient_19_6:/lib64:$LD_LIBRARY_PATH" >> /etc/profile.d/oracle_client.sh && \
    echo "export PATH=/opt/oracle/instantclient_19_6:$PATH" >> /etc/profile.d/oracle_client.sh

ENV ORACLE_BASE /opt/oracle/instantclient_19_6
ENV LD_LIBRARY_PATH /opt/oracle/instantclient_19_6
ENV TNS_ADMIN /opt/oracle/instantclient_19_6
ENV ORACLE_HOME /opt/oracle/instantclient_19_6
#----- End Oracle DB

# SAP NetWeaver
COPY /nwrfcsdk /usr/local/sap/nwrfcsdk
ENV SAPNWRFC_HOME=/usr/local/sap/nwrfcsdk
ENV PATH=$PATH:/usr/local/sap/nwrfcsdk
ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/sap/nwrfcsdk/lib
# SAP NetWeaver End

# projects
ENV NODE_ENV=production

WORKDIR /workspaces
