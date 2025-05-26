FROM node:16-alpine

RUN apk update && apk add dumb-init
RUN mkdir /web-viewer
RUN chown node:node /web-viewer
WORKDIR /web-viewer

USER node
COPY --chown=node:node config ./config
COPY --chown=node:node public ./public
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node src ./src
COPY --chown=node:node package.json ./

# \"registration_host\": \"https://odaweb.azurefd.net/auth\",\
RUN echo "{\
    \"api_host\": \"http://open_cloud:8080\",\
    \"plugins_url\": \"https://opencloud.azureedge.net/libs/visualizejs/plugins/23.1\",\
    \"pageSize\": 16,\
    \"refreshFilesTimeout\": 5000,\
    \"chunkLoadingTime\": 12000,\
    \"cda\": true,\
    \"supportFormats\": [ \"DWG\", \"DGN\", \"DWF\", \"DXF\", \"OBJ\", \"PDF\", \"RCS\", \"RFA\", \"RVT\", \"IFC\", \"NWC\", \"NWD\", \"VSF\" ]\
    }" > public/config.json

RUN npm install && npm run build
CMD dumb-init node scripts/start.js
