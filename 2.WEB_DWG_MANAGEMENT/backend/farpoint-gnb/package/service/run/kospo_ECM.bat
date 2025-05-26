docker rm -f telescope

docker run --restart always -d --name telescope -p 3700:3700 -e SERVICE_PORT=3700 ^
-e DB_CFG="{\"user\":\"ids\",\"password\":\"ids\",\"host\":\"192.168.1.154\",\"port\":1521,\"database\":\"ORAKOSPO\"}" ^
-e DRAWING_FILE_PATH=C:\\Users\\farpoint\\convert ^
-e DNS="[]" ^
-e DocViewerUrl='http://16.130.10.65:8080/DocuGATE/viewer/document/docviewer.do' ^
-e MydocPath='http://10.130.9.27/TEMP/MYDOC' ^
-e SignalPath='http://10.130.9.27/TEMP/SIGNAL' ^
-e RelatedPath='http://10.130.9.27/TEMP/LDM' ^
-e MydocLocalPath="/farpoint/mydocs" ^
-e EnableMydoc="true" ^
--mount source="C:\Users\farpoint\mydoc",target=/farpoint/mydoc,type=bind ^
--mount source="C:\Users\farpoint\convert",target=/farpoint,type=bind ^
--mount source="C:\Users\farpoint\plan.service",target=/workspaces/plan.service,type=bind ^
--mount source=/var/run/docker.sock,target=/var/run/docker.sock,type=bind ^
-w /workspaces/plan.service farpoint/appbase npm start
