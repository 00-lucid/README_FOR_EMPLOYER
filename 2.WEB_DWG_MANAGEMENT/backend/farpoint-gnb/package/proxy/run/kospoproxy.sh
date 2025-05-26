# relay 실행
docker run --restart always -d --name gnbProxy \
    -p 4000:4000 \
    -e LISTENING_PORT=4000 \
    -e FORWARDING_HOST=172.17.0.3 \
    -e FORWARDING_PORT=3700 \
    farpoint/proxy
