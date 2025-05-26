import api from './init'
// Lib
import { global } from '../Lib/util'
import crypt from '../Lib/crypt'

const pld = {
    // PLD 생성
    resisterPld(
        procedureNumber: string,
        procedureName: string,
        pldName: string,
        plantValue: string,
        pldDESC: string,
        selectedItems: string[],
        userId: string
    ): Promise<any> {
        global.log('pld.resisterPld start')
        const data = { procedureNumber, procedureName, pldName, plantValue, pldDESC, selectedItems }
        const body = JSON.stringify(data)

        return api
            .post(`/pld/resister/?userId=${crypt.encrypt(userId)}`, body)
            .then(async (res) => {
                global.log('pld.resisterPld res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('pld.resisterPld error::', error)
                return false
            })
    },
    // PLD 검색
    searchPld(companyValue: string, plantValue: string): Promise<any> {
        global.log('pld.searchPld start')
        if (companyValue === '') companyValue = 'all'
        if (plantValue === '') plantValue = 'all'

        return api
            .get(`/pld/open/${companyValue}/${plantValue}`)
            .then(async (res) => {
                global.log('pld.searchPld res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('pld.searchPld error::', error)
                return false
            })
    },
    // PLD 도면 리스트 조회
    getPldDocumentList: (c_id: number, c_vr: string): Promise<PldDocument[]> => {
        global.log('pld.getPldDocumentList start', c_id, c_vr)
        return api
            .get(`pld/document-list/${c_id}/${c_vr}`)
            .then((res) => {
                global.log('pld.getPldDocumentList res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('pld.getPldDocumentList error::', error)
                return error
            })
    },
    // 선택한 도면의 PLD 설비 조회
    getEntitiesList: (data: pldDataParam): Promise<any> => {
        global.log('pld.getEntitiesList start', data)

        const { cId, cVr, docNo, docVr, cSeq } = data
        return api
            .get(`/pld/entities-list/${cId}/${cVr}/${docNo}/${docVr}/${cSeq}`)
            .then((res) => {
                global.log('pld.getEntitiesList res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('pld.getEntitiesList error::', error)
                return error
            })
    },

    // 선택된 도면의 PLD 심볼 조회
    getAllSimbolList: (data: pldDataParam): Promise<getAllSimbolListResp[]> => {
        global.log('pld.getAllSimbolList start', data)

        const { cId, cVr, docNo, docVr, cSeq } = data
        return api
            .get(`/pld/simbol-list/${cId}/${cVr}/${docNo}/${docVr}/${cSeq}`)
            .then((res) => {
                global.log('pld.getAllSimbolList res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('pld.getAllSimbolList error::', error)
                return false
            })
    },
    // PLD 설비 저장
    addEntitiesList: (entitiesList: any): Promise<boolean> => {
        global.log('pld.addEntitiesList start', entitiesList)

        const body = JSON.stringify({ entitiesList })
        return api
            .post('/pld/entities-list', body)
            .then((res) => {
                global.log('pld.addEntitiesList res::', res)
                return true
            })
            .catch((error) => {
                global.log('pld.addEntitiesList error::', error)
                return false
            })
    },
    // PLD 심볼 저장
    addSimbolList: (simbolList: any): Promise<boolean> => {
        global.log('pld.addSimbolList start', simbolList)
        const body = JSON.stringify({ simbolList })

        return api
            .post('/pld/simbol-list', body)
            .then((res) => {
                global.log('pld.addSimbolList res::', res)
                return true
            })
            .catch((error) => {
                global.log('pld.addSimbolList error::', error)
                return false
            })
    },
    // PLD 도면 리스트 변경
    changePldCanvas(pldList: any): Promise<any> {
        const body = JSON.stringify({ pldList })

        global.log('pld.changePldCanvas start', body)

        return api
            .post(`/pld/changePldCanvas`, body)
            .then((res) => {
                global.log('pld.changePldCanvas res::', res)
                return true
            })
            .catch((error) => {
                global.log('pld.changePldCanvas error::', error)
                return false
            })
    },
}

export default pld
