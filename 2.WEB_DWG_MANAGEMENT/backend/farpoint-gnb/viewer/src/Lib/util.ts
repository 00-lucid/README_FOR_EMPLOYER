import { encrypt } from '..'

// global - 전역 변수와, 로그함수 선언
const isDebug: boolean = true

// 환경변수
const serviceConfig = {
    env: 'local', // local, dev, prod, mock
    localUrl: 'http://localhost:4000',
    devUrl: 'http://192.168.1.40:49155',
    prodUrl: '',
    db: '한수원' // 남부, 한수원
}

const global = {
    log: (...res: any) => {
        if (isDebug) {
            console.log(...res)
        }
    }
}

export { global, serviceConfig }
