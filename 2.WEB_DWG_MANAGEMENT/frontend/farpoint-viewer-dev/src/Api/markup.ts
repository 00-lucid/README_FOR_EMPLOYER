import api from './init'
// Lib
import { global } from '../Lib/util'
import crypt from '../Lib/crypt'

const markup = {
    // 도면에 등록된 마크업 리스트 조회
    getMarkups(userId: string, docId: string, docVer: string, plantCode: string): Promise<MarkupContent[]> {
        global.log('markup.getMarkups start')
        return api
            .get(
                `/markups?docId=${crypt.encrypt(docId)}&docVer=${crypt.encrypt(docVer)}&plantCode=${crypt.encrypt(
                    plantCode
                )}&userId=${crypt.encrypt(userId)}`
            )
            .then(async (res) => {
                global.log('markup.getMarkups res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('markup.getMarkups error::', error)
                return false
            })
    },
    // 도면에 등록된 마크업 리스트 조회
    insertMarkup(value: InsertMarkupValue): Promise<boolean> {
        global.log('markup.insertMarkup start')
        const body = JSON.stringify(value)
        return api
            .post(`/markups`, body)
            .then(async (res) => {
                global.log('markup.insertMarkup res::', res)
                return true
            })
            .catch((error) => {
                global.log('markup.insertMarkup error::', error)
                return false
            })
    },

    // 마크업 삭제
    deleteMarkup(value: DeleteMarkupValue): Promise<boolean> {
        global.log('markup.deleteMarkup start')
        const body = JSON.stringify(value)
        return api
            .delete(`/markups`, {data:body})
            .then(async (res) => {
                global.log('markup.deleteMarkup res::', res)
                return true
            })
            .catch((error) => {
                global.log('markup.deleteMarkup error::', error)
                return false
            })
    },

    // 마크업 업데이트 (덮어쓰기)
    updateMarkup(value: UpdateMakrupValue): Promise<boolean> {
        global.log('markup.updateMarkup start')
        const body = JSON.stringify(value)
        return api
            .put(`/markups`, body)
            .then(async (res) => {
                global.log('markup.updateMarkup res::', res)
                return true
            })
            .catch((error) => {
                global.log('markup.updateMarkup error::', error)
                return false
            })
    },
}

export default markup
