import api, { pmdcApi } from './init'
import crypt from '../Lib/crypt'

const pmdc = {
    // 개별 PMDC 저장 리스트 불러오기
    async getPMDCUserList(userId: string, docKey: DocumentKey, func: string): Promise<PMDCUserList[]> {
        const res = await api.get(
            `/pmdc/user?userId=${crypt.encrypt(userId)}&docId=${crypt.encrypt(docKey.docId)}&docVer=${crypt.encrypt(
                docKey.docVer
            )}&func=${crypt.encrypt(func)}`
        )
        return res.data as PMDCUserList[]
    },

    // PMDC 가 있는 설비 목록 가져오기
    async getPMDCEquipments(docKey: DocumentKey, func: string): Promise<any> {
        const res = await api.get(
            `/pmdc?docId=${crypt.encrypt(docKey.docId)}&docVer=${crypt.encrypt(docKey.docVer)}&func=${crypt.encrypt(func)}`
        )
        return res.data
    },

    async PMDCPopupPosSave(userId: string, posArr: string, idArr: string): Promise<any> {
        await api.get(`/PMDCPopupPosSave?userId=${crypt.encrypt(userId)}&posArr=${crypt.encrypt(posArr)}&idArr=${crypt.encrypt(idArr)}`)
    },

    async updatePMDCUserList(value: any): Promise<void> {
        const body = JSON.stringify(value)
        await api.post(`/pmdc/user/update`, body)
    },

    async getPMDCSearchList(searchText: string, sourcePos: string): Promise<PMDCSearchList[]> {
        if (sourcePos === 'all') {
            const res: any = []
            return res
        } else {
            // const res = await pmdcApi.get(`/dataservers/${sourcePos}/points?nameFilter=*${searchText}*&maxCount=5000`)
            const res = await api.get(`/pmdc/search?sourcepos=${crypt.encrypt(sourcePos)}&searchtext=${crypt.encrypt(searchText)}`)
            console.log('res:', res)
            return res.data.Items
        }
    },

    async getPMDCSourcePos(): Promise<any> {
        const res = await api.get('/pmdc/source')
        return res.data
    },

    async getPMDCValue(webid: string): Promise<any> {
        const res = await api.get(`pmdc/value?webid=${crypt.encrypt(webid)}`)
        return res.data
    },

    async updatePMDCMasterList(value: any): Promise<void> {
        const body = JSON.stringify(value)
        await api.post(`/pmdc/master/update`, body)
    },

    async updatePMDCIspm(updatePm: any): Promise<void> {
        const list = JSON.stringify(updatePm)
        await api.get(`/pmdc/ispm/update?list=${crypt.encrypt(list)}`)
    },
}

export default pmdc
