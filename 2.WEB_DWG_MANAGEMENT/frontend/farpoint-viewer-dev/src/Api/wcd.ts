import api from './init'
// Lib
import { global } from '../Lib/util'
import crypt from '../Lib/crypt'

const wcd = {
    // wcd 설비 리스트 조회
    async getWCDEquipments(docKey: DocumentKey): Promise<any[]> {
        const docId = docKey.docId;
        const docVer = docKey.docVer;
        const res = await api.get(`/wcd?docId=${crypt.encrypt(docId)}&docVer=${crypt.encrypt(docVer)}`)
        // const result = (await res.json()) as { handles: string[] }
        return res.data.handles
    },

    async getOrderList(func: string): Promise<any> {
        const res = await api.get(`/wcdOrderList?func=${crypt.encrypt(func)}`)
        return res.data
    },

    async getTaggingItemList(
        id: string,
        func: string,
        wcdNo: string,
        docKey: string,
    ): Promise<any> {
        const arrDocKey = docKey.split('_');
        const docId = arrDocKey[0];
        const docVer = arrDocKey[1];
        const res = await api.get(
            `/wcdTagging?id=${crypt.encrypt(id)}
                &func=${crypt.encrypt(func)}
                &wcdNo=${crypt.encrypt(wcdNo)}
                &docId=${crypt.encrypt(docId)}
                &docVer=${crypt.encrypt(docVer)}
            `
        )
        return res.data
    }
}

export default wcd
