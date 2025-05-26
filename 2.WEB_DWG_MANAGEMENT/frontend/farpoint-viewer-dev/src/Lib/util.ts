import axios from 'axios'

// global - 전역 변수와, 로그함수 선언
const isDebug: boolean = true

const global = {
    log: (...res: any) => {
        if (isDebug) {
            console.log(...res)
        }
    },
    wait: (timeToDelay: number) => new Promise((resolve) => window.setTimeout(resolve, timeToDelay)),

    env(key: string): string | undefined {
        return process.env[key]
    },

    envs: (keys: string[]): Map<string, string> | undefined => {
        const map = new Map<string, string>()

        for (const key of keys) {
            const value = process.env[key]

            if (value === undefined) {
                return undefined
            } else {
                map.set(key, value)
            }
        }

        return map
    },

    logDB: (log: DBLog) => {
        const { REACT_APP_ENV, REACT_APP_URL_LOCAL, REACT_APP_URL_DEV, REACT_APP_URL_PRD } = process.env
        const baseURL = REACT_APP_ENV === 'dev' ? REACT_APP_URL_DEV : REACT_APP_ENV === 'local' ? REACT_APP_URL_LOCAL : REACT_APP_URL_PRD
        axios.post(`${baseURL}/log/${log.type}`, {
            value: log.value,
        })
    },
}

export { global }
