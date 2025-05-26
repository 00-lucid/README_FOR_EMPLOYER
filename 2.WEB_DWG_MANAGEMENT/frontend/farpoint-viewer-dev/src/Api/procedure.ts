import api from './init'
// Lib
import crypt from '../Lib/crypt'

const procedure = {
    getProcedureList: async (obj: { [key: string]: string | undefined }): Promise<ProcedureList[]> => {
        try {
            let url: string = `/procedure/list?`
            for (let item in obj) {
                if (obj[item] !== undefined) url += `${item}=${crypt.encrypt(obj[item])}`
                if (obj[item] !== undefined && item !== 'folph') url += '&'
            }
            const res = await api.get(url)
            return res.data
        } catch (e) {
            console.log('getProcedureList 함수 에러', e)
            return []
        }
    },

    getProcedureRead: async (userId: string, proId: string): Promise<ProcedureRead | undefined> => {
        try {
            const res = await api.get(`/procedure/read?userId=${crypt.encrypt(userId)}&proId=${crypt.encrypt(proId.toString())}`)
            console.log('getProcedureRead 함수 결과 값', res)
            return res.data
        } catch (e) {
            console.log('getProcedureRead 함수 에러', e)
            return undefined
        }
    },

    getProcedurePMDCData: async (PITAG: string, func: string): Promise<any> => {
        try {
            const res = await api.get(`/procedure/pmdc?piTag=${crypt.encrypt(PITAG)}&func=${crypt.encrypt(func)}`)
            console.log('getProcedureRead 함수 결과 값', res)
            return res.data
        } catch (e) {
            console.log('getProcedureRead 함수 에러', e)
            return undefined
        }
    },

    getProcedureEquipHandle: async (func: string, docId: string): Promise<any> => {
        try {
            const res = await api.get(`/procedure/handle?func=${crypt.encrypt(func)}&docId=${crypt.encrypt(docId)}`)
            console.log('getProcedureEquipHandle 함수 결과 값', res)
            return res.data
        } catch (e) {
            console.log('getProcedureEquipHandle 함수 에러', e)
            return undefined
        }
    },

    setProcedure: async (obj: any): Promise<any> => {
        try {
            const body = obj
            const res = await api.post(`/procedure/write`, body)
            console.log('setProcedure 함수 결과 값', res)
            return res.status
        } catch (e) {
            console.log('setProcedure 함수 에러', e)
            return undefined
        }
    },
}

export default procedure
