// Api
import api from './init'
// Lib
import { global } from '../Lib/util'
import crypt from '../Lib/crypt'

const auth = {
    // get 사용자 정보
    getUserContext: (userId: string): Promise<UserContext> => {
        global.log('auth.getUserContext start', userId)
        return api
            .get(`users/${crypt.encrypt(userId)}/context`)
            .then((res): any => {
                global.log('auth.getUserContext res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('auth.getUserContext error::', error)
                return error
            })
    },
    // 사용자 권한 확인
    hasAuthorization: (userId: string): Promise<boolean> => {
        global.log('auth.hasAuthorization start', userId)
        return api
            .get(`users/${crypt.encrypt(userId)}/exists`)
            .then((res) => {
                global.log('res::', res)
                return res.status === 200
            })
            .catch((error) => {
                global.log('error::', error)
                return error
            })
    },
    // 사용자 권한 확인
    setUserContext: (userId: string, value: UserContext): Promise<void> => {
        global.log('auth.setUserContext start', userId, value)
        const body = JSON.stringify(value)
        return api
            .put(`users/${crypt.encrypt(userId)}/context`, body)
            .then((res) => {
                global.log('res::', res)
            })
            .catch((error) => {
                global.log('error::', error)
            })
    },

    getUserBySabun: (sabun: string): Promise<any> => {
        return api
            .get(`user/${crypt.encrypt(sabun)}`)
            .then((res) => {
                global.log('res::', res)
            })
            .catch((error) => {
                global.log('error::', error)
            })
    },
}

export default auth
