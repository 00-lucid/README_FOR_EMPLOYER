# plan.service(edit:23.03.08)

백엔드 프로젝트 디렉토리

### 개발 환경

#### nodemon

npm run (kospo:dev, khnp:dev)

### 운영 배포

#### 환경설정

###### .env 설정

    SERVICE_PORT,
    // 경로가 있어야 함!!! (한수원에선 만들기)
    MydocLocalPath='C:\\farpoint\\mydocs'
    // 저장된 도면(.dwg파일) 불러올 경로
    DOC_PATH='C:\\farpoint\\docs'
    // pdf 로 컨버팅 된 파일 저장할 경로
    PDF_PATH='C:\\farpoint\\pdf'
    // Front Address
    FE_PATH='localhost:3000'

###### ecosystem.config.js

    instances: '-1', // 클러스터 모드 사용 시 생성할 인스턴스 수

#### 빌드파일 생성

npm run build:bundle

### 서버 구동

#### 한수원

pm2 start ecosystem.config.js

#### 남부

pm2 start ecosystem.config.js --env kospo

#### 서비스 등록

###### 서비스 등록 전 셋팅

1. pm2 start ecosystem.config.js
2. pm2 save

###### nssm.exe - 윈도우 서비스 관리 툴 사용예시

nssm.exe install node
nssm.exe remove node

desc - 컴퓨터 재부팅시 서버가 자동으로 실행되게 하기 위해 Window 서비스에 등록해야함.
path = package/service/window/win64

다음 명령을 통해 서비스 등록을 수행한다.

1. 실행할 .bat 파일 설정 (ex. pm2_startup.bat)
2. path에서 cmd창
3. nssm.exe install node
4. 실행할 파일 경로 설정

ref - https://blog.cloudboost.io/nodejs-pm2-startup-on-windows-db0906328d75
