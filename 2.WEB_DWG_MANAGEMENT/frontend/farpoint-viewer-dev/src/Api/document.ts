import api from './init'
// Lib
import { global } from '../Lib/util'
import crypt from '../Lib/crypt'

const document = {
    getDocumentList: (): Promise<DocumentList[]> => {
        global.log('document.getDocumentList start')
        return api
            .get('documents')
            .then((res) => {
                global.log('document.getDocumentList res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('document.getDocumentList error::', error)
                return false
            })
    },
    refreshDocumentListCash(): Promise<DocumentList[]> {
        global.log('document.refreshDocumentListCash start')
        return api
            .get(`/documents?isRefresh=${crypt.encrypt('true')}`)
            .then((res) => {
                global.log('document.refreshDocumentListCash res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('document.refreshDocumentListCash error::', error)
                return false
            })
    },
    getDocumentFile(docId: string, docVer: string): Promise<Uint8Array> {
        global.log('document.getDocumentFile start')
        //const res = await this.get(`/documents/${enc(key.docId)}/file?docVer=${enc(key.docVer)}`)
        return api
            .get(`/documents/${crypt.encrypt(docId)}/file?docVer=${crypt.encrypt(docVer)}`, {
                responseType: 'arraybuffer',
                headers: {
                    Accept: 'application/pdf',
                },
            })
            .then(async (res) => {
                global.log('document.getDocumentFile res::', res)
                return new Uint8Array(res.data)
            })
            .catch((error) => {
                global.log('document.getDocumentFile error::', error)
                throw new Error(error)
            })
    },
    getDocument(docId: string, docVer: string, plantCode: string): Promise<DocumentContext> {
        global.log('document.getDocument start')
        return api
            .get(`/documents/${crypt.encrypt(docId)}?docVer=${crypt.encrypt(docVer)}&plantCode=${crypt.encrypt(plantCode)}`)
            .then(async (res) => {
                global.log('document.getDocument res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('document.getDocument error::', error)
                return false
            })
    },
    searchDocument(
        folderId: string | undefined,
        docName: string | undefined,
        docNumber: string | undefined,
        cnt: string
    ): Promise<{ cnt: number; data: DocumentResult[] }> {
        global.log('document.searchDocument start')

        let url = `/search/documents?cnt=${crypt.encrypt(cnt)}&`

        if (folderId !== undefined) {
            url = url + `folderId=${crypt.encrypt(folderId)}&`
        }

        if (docName !== undefined) {
            url = url + `docName=${crypt.encrypt(docName)}&`
        }

        if (docNumber !== undefined) {
            url = url + `docNumber=${crypt.encrypt(docNumber)}&`
        }

        url = url.slice(0, -1)

        return api
            .get(url)
            .then(async (res) => {
                global.log('document.searchDocument res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('document.searchDocument error::', error)
                return false
            })
    },
    // 남부만 사용.
    searchSignal(
        folderId: string | undefined,
        docname: string | undefined,
        tagname: string | undefined,
        userId: string,
        cnt: string
    ): Promise<{ cnt: number; data: SearchSignalResult[] }> {
        global.log('document.searchSignal start')

        let url = `/search/signal?userId=${crypt.encrypt(userId)}&cnt=${crypt.encrypt(cnt)}`

        if (folderId !== undefined) {
            url = url + `&folderId=${crypt.encrypt(folderId)}&`
        }

        if (docname !== undefined) {
            url = url + `&docname=${crypt.encrypt(docname)}&`
        }

        if (tagname !== undefined) {
            url = url + `&tagname=${crypt.encrypt(tagname)}`
        }

        return api
            .get(url)
            .then(async (res) => {
                global.log('document.searchSignal res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('document.searchSignal error::', error)
                return false
            })
    },

    getDwgToPdf(docId: string, docVer: string, userId: string, type: string, colorMode: string): Promise<void | Blob> {
        global.log('document.getDocumentToPdf start', api.getUri())
        // fetch api 응답에만 blob 함수가 있어 여기서만 fetch사용.
        return fetch(
            `${api.getUri()}/convert/pdf?docId=${crypt.encrypt(docId)}&docVr=${crypt.encrypt(docVer)}&userId=${crypt.encrypt(
                userId
            )}&type=${crypt.encrypt(type)}&mode=${crypt.encrypt(colorMode)}`
        )
            .then(async (res) => {
                global.log('document.getDocumentToPdf res::', res)
                if (res.status === 400) throw new Error('Api Error')
                return await res.blob()
            })
            .catch((error) => {
                global.log('document.getDocumentToPdf error::', error)
                alert('pdf 변환에 실패했습니다.\n\n관리자에게 문의해주세요.')
            })
    },
    // 폰트파일이 없어서 적용이 안된 파일 서버에 log로 남기기 위한 Api
    setFontLog(fontName: string): Promise<void> {
        global.log('document.setFontLog start')
        const body = JSON.stringify({ fontName })
        return api
            .post(`/font/log`, body)
            .then(async (res) => {
                global.log('document.setFontLog res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('document.setFontLog error::', error)
                return false
            })
    },

    getFolderIdsByPlantCode(plantCode: string): Promise<SelectItem[]> {
        global.log('document.getFolderIdsByPlantCode start')

        let url = `/plantCode/folders?plantCode=${crypt.encrypt(plantCode)}`
        return api
            .get(url)
            .then(async (res) => {
                global.log('document.getFolderIdsByPlantCode res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('document.getFolderIdsByPlantCode error::', error)
                return false
            })
    },

    getLastOpenDocumentInfo(userId: string): Promise<any> {
        let url = `/last/document?userId=${crypt.encrypt(userId)}`
        return api
            .get(url)
            .then(async ({ data }) => {
                global.log('document.getLastOpenDocumentInfo res::', data)
                return data
            })
            .catch((error) => {
                global.log('document.getLastOpenDocumentInfo error::', error)
                return false
            })
    },

    getUrlByEquipNo(equipNo: string): Promise<any> {
        let url = `/epnid/api/url/equipNo?userId&equipmentNo=${equipNo}`
        return api
            .get(url)
            .then(async (res) => {
                global.log('document.getUrlByEquipNo res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('document.getUrlByEquipNo error::', error)
                return false
            })
    },

    getUrlByfuncName(funcName: string): Promise<any> {
        let url = `/epnid/api/url/funcName?userId&functionName=${funcName}`
        return api
            .get(url)
            .then(async (res) => {
                global.log('document.getUrlByfuncName res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('document.getUrlByfuncName error::', error)
                return false
            })
    },
}

export default document
