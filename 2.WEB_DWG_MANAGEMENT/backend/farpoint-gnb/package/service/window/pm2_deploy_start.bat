REM 배포할 프로젝트 경로
cd C:\Users\user\Desktop\WebViewer\farpoint\farpoint\plan.service
REM 빌드 명령어
CALL npm run build:bundle
REM 서버 종료
CALL pm2 delete all
REM 서버 실행 default khnp 한수원 --env kospo 남부
CALL pm2 start ecosystem.config.js --env kospo