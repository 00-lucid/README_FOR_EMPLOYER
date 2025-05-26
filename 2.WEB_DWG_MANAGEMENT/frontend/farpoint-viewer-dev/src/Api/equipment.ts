import api from './init'
// Lib
import { global } from '../Lib/util'
import crypt from '../Lib/crypt'
import { getISOFileMock, getISOListMock } from '../Mock/iso'

const equipment = {
    getEquipmentLinks(docId: string, docVer: string, plantCode: string, handle: string): Promise<EquipmentLink[]> {
        global.log('equipment.getEquipmentLinks start')
        return api
            .get(
                `/equipmentLinks?docId=${crypt.encrypt(docId)}&docVer=${crypt.encrypt(docVer)}&plantCode=${crypt.encrypt(
                    plantCode
                )}&handle=${crypt.encrypt(handle)}`
            )
            .then(async (res) => {
                global.log('equipment.getEquipmentLinks res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('equipment.getEquipmentLinks error::', error)
                return false
            })
    },

    // A:설비정보
    getEquipmentInfoUrl(equnr: string, tplnr: string | undefined): Promise<string> {
        global.log('equipment.getEquipmentInfoUrl start')
        const tail = tplnr ? `&tplnr=${crypt.encrypt(tplnr)}` : ''
        return api
            .get(`/equipmentInfoUrl?equnr=${crypt.encrypt(equnr)}` + tail)
            .then(async (res) => {
                global.log('equipment.getEquipmentInfoUrl res::', res)
                return res.data.url
            })
            .catch((error) => {
                global.log('equipment.getEquipmentInfoUrl error::', error)
                return false
            })
    },
    // C:통지발행
    getNotiIssueUrl(equnr: string, tplnr: string | undefined): Promise<string> {
        global.log('equipment.getNotiIssueUrl start')
        const tail = tplnr ? `&tplnr=${crypt.encrypt(tplnr)}` : ''
        return api
            .get(`/notiIssueUrl?equnr=${crypt.encrypt(equnr)}` + tail)
            .then(async (res) => {
                global.log('equipment.getNotiIssueUrl res::', res)
                return res.data.url
            })
            .catch((error) => {
                global.log('equipment.getNotiIssueUrl error::', error)
                return false
            })
    },
    // D:오더발행
    getOrderIssueUrl(equnr: string, tplnr: string | undefined): Promise<string> {
        global.log('equipment.getOrderIssueUrl start')
        const tail = tplnr ? `&tplnr=${crypt.encrypt(tplnr)}` : ''
        return api
            .get(`/orderIssueUrl?equnr=${crypt.encrypt(equnr)}` + tail)
            .then(async (res) => {
                global.log('equipment.getOrderIssueUrl res::', res)
                return res.data.url
            })
            .catch((error) => {
                global.log('equipment.getOrderIssueUrl error::', error)
                return false
            })
    },
    // E:통지이력조회
    getNotiRecordUrl(equnr: string, startDate: string, endDate: string, tplnr: string | undefined): Promise<string> {
        global.log('equipment.getNotiRecordUrl start')
        const tail = tplnr ? `&tplnr=${crypt.encrypt(tplnr)}` : ''
        return api
            .get(
                `/notiRecordUrl?equnr=${crypt.encrypt(equnr)}&startDate=${crypt.encrypt(startDate)}&endDate=${crypt.encrypt(endDate)}` +
                    tail
            )
            .then(async (res) => {
                global.log('equipment.getNotiRecordUrl res::', res)
                return res.data.url
            })
            .catch((error) => {
                global.log('equipment.getNotiRecordUrl error::', error)
                return false
            })
    },
    // F:오더이력조회
    getOrderRecordUrl(equnr: string, startDate: string, endDate: string, tplnr: string | undefined): Promise<string> {
        global.log('equipment.getOrderRecordUrl start')
        const tail = tplnr ? `&tplnr=${crypt.encrypt(tplnr)}` : ''
        return api
            .get(
                `/orderRecordUrl?equnr=${crypt.encrypt(equnr)}&startDate=${crypt.encrypt(startDate)}&endDate=${crypt.encrypt(endDate)}` +
                    tail
            )
            .then(async (res) => {
                global.log('equipment.getOrderRecordUrl res::', res)
                return res.data.url
            })
            .catch((error) => {
                global.log('equipment.getOrderRecordUrl error::', error)
                return false
            })
    },
    // ISO도면조회
    getISOFile(dokar: string, doknr: string): Promise<any> | string {
        if (process.env.REACT_APP_ENV === 'mock') return getISOFileMock(dokar, doknr)

        return api
            .get(`/iso/file?dokar=${crypt.encrypt(dokar)}&doknr=${crypt.encrypt(doknr)}`)
            .then(async ({ data }) => {
                return data
            })
            .catch((error) => {
                console.log(error)
                return false
            })
    },
    // ISO도면리스트조회
    getISOList(tplnr: string): Promise<any> | any {
        if (process.env.REACT_APP_ENV === 'mock') return getISOListMock(tplnr)

        return api
            .get(`/iso/list?tplnr=${crypt.encrypt(tplnr)}`)
            .then(async ({ data }) => {
                return data
            })
            .catch((error) => {
                console.log(error)
                return false
            })
    },
    // 통지발행 (M1)
    getM1NotiIssueUrl(equnr: string, tplnr: string | undefined, userId: string): Promise<string> {
        const tail = tplnr ? `&tplnr=${crypt.encrypt(tplnr)}&userId=${crypt.encrypt(userId)}` : ''
        return api
            .get(`/notiIssueUrl/m1?equnr=${crypt.encrypt(equnr)}` + tail)
            .then(async (res) => {
                return res.data.url
            })
            .catch((error) => {
                return false
            })
    },
    // 통지발행 (M2)
    getM2NotiIssueUrl(equnr: string, tplnr: string | undefined, userId: string): Promise<string> {
        const tail = tplnr ? `&tplnr=${crypt.encrypt(tplnr)}&userId=${crypt.encrypt(userId)}` : ''
        return api
            .get(`/notiIssueUrl/m2?equnr=${crypt.encrypt(equnr)}` + tail)
            .then(async (res) => {
                return res.data.url
            })
            .catch((error) => {
                return false
            })
    },
    // P:관련문서조회
    getRelatedFilesByEquipment(equnr: string, tplnr: string | undefined): Promise<string> {
        const tail = tplnr ? `equnr=${crypt.encrypt(equnr)}&tplnr=${crypt.encrypt(tplnr)}` : ''

        return api
            .get(`/khnp/relatedFileInfo?${tail}`)
            .then(async (res) => {
                return res.data.url
            })
            .catch((error) => {
                return false
            })
    },
    // 검색 필터 설비조회 - by plantCode
    getSymbolsByPlant(plantCode: string): Promise<SymbolResult[]> {
        global.log('equipment.getSymbolsByPlant start')
        return api
            .get(`/symbols?plantCode=${crypt.encrypt(plantCode)}`)
            .then(async (res) => {
                global.log('equipment.getSymbolsByPlant res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('equipment.getSymbolsByPlant res::', error)
                return false
            })
    },

    // 검색 설비조회
    searchEquipment(
        folderId: string | undefined,
        libId: string | undefined,
        tag: string | undefined,
        cnt: string
    ): Promise<{ cnt: number; data: EquipmentResult[] }> {
        global.log('equipment.searchEquipment start')

        let url = `/search/equipments?cnt=${crypt.encrypt(cnt)}&`

        if (folderId !== undefined) {
            url = url + `folderId=${crypt.encrypt(folderId)}&`
        }

        if (libId !== undefined) {
            url = url + `libId=${crypt.encrypt(libId)}&`
        }

        if (tag !== undefined) {
            url = url + `tag=${crypt.encrypt(tag)}&`
        }

        url = url.slice(0, -1)

        return api
            .get(url)
            .then(async (res) => {
                global.log('equipment.searchEquipment res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('equipment.searchEquipment res::', error)
                return false
            })
    },
    // 도면 내 검색 설비조회
    searchEquipmentInnerDoc(
        docId: string,
        docVer: string,
        libId: string | undefined,
        tag: string | undefined,
        cnt: string | undefined
    ): Promise<EquipmentResult[]> {
        global.log('equipment.searchEquipmentInnerDoc start')

        let url = `/search/document/equipments?docId=${crypt.encrypt(docId)}&docVer=${crypt.encrypt(docVer)}`

        if (libId !== undefined) {
            url = url + `&libId=${crypt.encrypt(libId)}`
        }
        if (tag !== undefined) {
            url = url + `&tag=${crypt.encrypt(tag)}`
        }
        if (cnt !== undefined) {
            url = url + `&cnt=${crypt.encrypt(cnt)}`
        }
        return api
            .get(url)
            .then(async (res) => {
                global.log('equipment.searchEquipmentInnerDoc res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('equipment.searchEquipmentInnerDoc res::', error)
                return false
            })
    },

    // 설비 사진 조회
    getEquipmentImage(tplnr: string): Promise<[]> {
        let url = `/equipment/image?tplnr=${crypt.encrypt(tplnr)}`
        
        return api.get(url).then(async (res) => {
            return res.data
        })
    },

    // 설비 사진 추가
    addEquipmentImage(tplnr: string, formData: FormData) {
        let url = `/equipment/image?tplnr=${crypt.encrypt(tplnr)}`

        return api
            .post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then(async (res) => {
                return res.data
            })
    },

    // 설비 사진 삭제
    delEquipmentImage(serial: string): Promise<[]>{
        console.log('delEquipmentImage.serial:', serial)
        let url = `/equipment/imagedel?serial=${crypt.encrypt(serial.toString())}`
        console.log('delEquipmentImage.url:', url)
        return api.get(url).then(async (res) => {
            return res.data
        })
    }
}

export default equipment
