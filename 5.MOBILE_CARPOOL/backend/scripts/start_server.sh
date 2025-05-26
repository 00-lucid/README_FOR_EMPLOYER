DeployPath=/home/ec2-user/code-deploy

cd $DeployPath
CURRENT_PID=$(pgrep -f server-0.0.1-SNAPSHOT.jar)
sudo kill $CURRENT_PID
sudo nohup java -jar ./server/build/libs/server-0.0.1-SNAPSHOT.jar &
