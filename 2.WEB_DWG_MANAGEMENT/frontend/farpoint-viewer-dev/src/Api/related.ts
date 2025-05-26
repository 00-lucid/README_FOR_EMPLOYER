import api from './init'
// Lib
import { global } from '../Lib/util'
import crypt from '../Lib/crypt'

const related = {
    getRelatedRoot(): Promise<RelatedFolder[]> {
        return api
            .get(`/relatedRoot`)
            .then(async (res) => {
                global.log('related.getRelatedRoot res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('related.getRelatedRoot error::', error)
                return false
            })
    },
    getRelatedFolders(parentId: string): Promise<RelatedFolder[]> {
        return api
            .get(`/relatedFolders?parentId=${crypt.encrypt(parentId)}`)
            .then(async (res) => {
                global.log('related.getRelatedFolders res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('related.getRelatedFolders error::', error)
                return false
            })
    },
    searchRelated(folders: string[], docName: string | undefined, docNumber: string | undefined): Promise<RelatedSearchResult[]> {
        let url = `/search/related?`

        if (0 < folders.length) {
            url = url + `folders=${crypt.encrypt(folders.join(','))}&`
        }

        if (docName !== undefined) {
            url = url + `name=${crypt.encrypt(docName)}&`
        }

        if (docNumber !== undefined) {
            url = url + `number=${crypt.encrypt(docNumber)}&`
        }

        url = url.slice(0, -1)

        return api
            .get(url)
            .then(async (res) => {
                global.log('related.getRelatedFolders res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('related.getRelatedFolders error::', error)
                return false
            })
    },
    getRelatedFileInfo(DOKAR: string, DOKVR: string, DOKTL: string, DOKNR: string, userId: string): Promise<RelatedFileInfo[]> {
        return api
            .get(
                `/relatedFileInfo?userId=${crypt.encrypt(userId)}&DOKAR=${crypt.encrypt(DOKAR)}
                    &DOKVR=${crypt.encrypt(DOKVR)}&DOKTL=${crypt.encrypt(DOKTL)}&DOKNR=${crypt.encrypt(DOKNR)}`
            )
            .then(async (res) => {
                global.log('related.getRelatedFileInfo res::', res)
                return res.data
            })
            .catch((error) => {
                global.log('related.getRelatedFileInfo error::', error)
                return false
            })
    },
    openRelatedFileInfo(file: RelatedFileInfo): Promise<any> | string {
        const { DOKAR, DOKNR, DOKTL, DOKVR, FILENAME } = file

        return api
            .get(
                `/khnp/ecm/relatedFileInfo?dokar=${crypt.encrypt(DOKAR)}&doknr=${crypt.encrypt(DOKNR)}&doktl=${crypt.encrypt(
                    DOKTL
                )}&dokvr=${crypt.encrypt(DOKVR)}&filename=${crypt.encrypt(FILENAME)}`
            )
            .then(async (res) => {
                return res.data
            })
            .catch((error) => {
                global.log('related.openRelatedFileInfo error::', error)
                return false
            })
    },
}

export default related
