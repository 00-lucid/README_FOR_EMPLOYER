import api from './init'
// Lib
import { global } from '../Lib/util'
import crypt from '../Lib/crypt'

const favorite = {
    setUserContext(userId: string, value: UserContext): Promise<void> {
        const body = JSON.stringify(value)
        
        return api
            .put(`/users/${crypt.encrypt(userId)}/context`)
            .then(async (res) => {
                global.log('related.setUserContext res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('related.setUserContext error::', error)
                return false
            })
    },

    getUserContext(userId: string): Promise<UserContext> {
        return api
            .get(`/users/${crypt.encrypt(userId)}/context`)
            .then(async (res) => {
                global.log('related.setUserContext res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('related.setUserContext error::', error)
                return false
        })
    },

    hasAuthorization(userId: string): Promise<boolean> {
        return api
            .get(`/users/${crypt.encrypt(userId)}/exists`)
            .then(async (res) => {
                global.log('related.setUserContext res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('related.setUserContext error::', error)
                return false
        })
    }
}

export default favorite