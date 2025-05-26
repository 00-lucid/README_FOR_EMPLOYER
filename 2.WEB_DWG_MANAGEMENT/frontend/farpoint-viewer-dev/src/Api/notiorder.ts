import api from './init'
import crypt from '../Lib/crypt'
import { getDocumentNotiordersMock, getNoticeUrlMock, getOrderUrlMock } from '../Mock/notiorder'

export function getDocumentNotiorders(
    key: DocumentKey,
    requestType: string,
    startDate: string,
    endDate: string
): Promise<EquipmentNotiOrder[]> | EquipmentNotiOrder[] {
    if (process.env.REACT_APP_ENV === 'mock') return getDocumentNotiordersMock(key, requestType, startDate, endDate)

    return api
        .get(
            `/documents/${crypt.encrypt(key.docId)}/notiorders?docVer=${crypt.encrypt(key.docVer)}&type=${crypt.encrypt(
                requestType
            )}&startDate=${crypt.encrypt(startDate)}&endDate=${crypt.encrypt(endDate)}`
        )
        .then(({ data }) => {
            return data
        })
        .catch((err) => {
            console.log(err)
            return null
        })
}

export function getNoticeUrl(id: string, tplnr: string): Promise<any> | string {
    // if (process.env.REACT_APP_ENV === 'mock') return getNoticeUrlMock(id, tplnr)

    return api
        .get(`/noticeUrl?id=${crypt.encrypt(id)}&tplnr=${crypt.encrypt(tplnr)}`)
        .then(({ data }) => {
            return data.url
        })
        .catch((err) => {
            console.log(err)
            return null
        })
}

export function getOrderUrl(id: string, tplnr: string): Promise<any> | string {
    // if (process.env.REACT_APP_ENV === 'mock') return getOrderUrlMock(id, tplnr)

    return api
        .get(`/orderUrl?id=${crypt.encrypt(id)}&tplnr=${crypt.encrypt(tplnr)}`)
        .then(({ data }) => {
            return data.url
        })
        .catch((err) => {
            console.log(err)
            return null
        })
}
