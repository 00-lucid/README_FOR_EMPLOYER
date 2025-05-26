docker run -d --network vscode --name mongo mongo:3.2.0

# 실행 전에 build를 해야 한다.
# docker build  -t opencloud ./OpenCloudServer_23/
docker run -d --network vscode \
    --name open_cloud \
    -e OPEN_CLOUD_OdWebSettings__DatabaseUrl="mongodb://mongo:27017" \
    -e OPEN_CLOUD_OdWebSettings__DatabaseName="od-web-service" \
    -e OPEN_CLOUD_OdWebSettings__RegistrationToken="df1dceb8e2d6f6b0894363b085801e36" \
    -e ASPNETCORE_URLS="http://+:8080" \
    -p 8080:8080 \
    opencloud

docker run -d --network vscode \
    --name job_runner \
    -e BINARIES_DIR="bin/lnxX64_5.3dll" \
    farpoint/converter \
    ./JobRunner --token=df1dceb8e2d6f6b0894363b085801e36 --host=open_cloud --port=8080 --name=runner_lnx --waitTimeOut=5000

# examples/webviewer에서 아래 실행
# docker build -t webviewer .
docker run -d --network vscode \
    --name webviewer \
    -p 3000:3000 \
    webviewer
