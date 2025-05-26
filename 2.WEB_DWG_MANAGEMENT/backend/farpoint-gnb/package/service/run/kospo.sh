read -p '포트 입력' port
read -p '배포 위치 선정[LTE, ECM]' area

case $area in
    LTE)
        docker rm -f linux_telescope

        docker run -d --name linux_telescope -p $port:$port -e SERVICE_PORT=$port \
        -e DB_CFG='{"user":"ids","password":"ids","host":"192.168.1.154","port":1521,"database":"ORAKOSPO"}' \
        -e DRAWING_FILE_PATH=\"C:\\Users\\farpoint\\convert\" \
        -e DNS='[{"name":"lrifesp1.kospo.co.kr","ip":"16.130.10.65"}]' \
        -e DocViewerUrl="http://16.130.10.65:8080/DocuGATE/viewer/document/docviewer.do" \
        -e MydocPath="http://10.130.9.27/TEMP/MYDOC" \
        -e SignalPath="http://10.130.9.27/TEMP/SIGNAL" \
        -e RelatedPath="http://10.130.9.27/TEMP/LDM" \
        -e MydocLocalPath="/farpoint/mydocs" \
        -e EnableMydoc="false" \
        --mount source="C:\Users\farpoint\convert",target=/farpoint,type=bind \
        --mount source="C:\Users\farpoint\plan.service",target=/workplaces/plan_service,type=bind \
        --mount source=/var/run/docker.sock,target=/var/run/docker.sock,type=bind \
        -w /workplaces/plan_service farpoint/appbase npm start
        ;;
    ECM)
        docker rm -f linux_telescope

        docker run -d --name linux_telescope -p $port:$port -e SERVICE_PORT=$port \
        -e DB_CFG='{"user":"ids","password":"ids","host":"192.168.1.154","port":1521,"database":"ORAKOSPO"}' \
        -e DRAWING_FILE_PATH=\"C:\\Users\\farpoint\\convert\" \
        -e DNS='[]' \
        -e DocViewerUrl="http://16.130.10.65:8080/DocuGATE/viewer/document/docviewer.do" \
        -e MydocPath="http://10.130.9.27/TEMP/MYDOC" \
        -e SignalPath="http://10.130.9.27/TEMP/SIGNAL" \
        -e RelatedPath="http://10.130.9.27/TEMP/LDM" \
        -e MydocLocalPath="/farpoint/mydocs" \
        -e EnableMydoc="false" \
        --mount source="C:\Users\farpoint\convert",target=/farpoint,type=bind \
        --mount source="C:\Users\farpoint\plan.service",target=/workplaces/plan_service,type=bind \
        --mount source=/var/run/docker.sock,target=/var/run/docker.sock,type=bind \
        -w /workplaces/plan_service farpoint/appbase npm start
        ;;
    *)
        echo LTE/ECM 중 하나를 입력하세요
        ;;
esac