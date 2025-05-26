/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { StatusCode, HttpRouter, HttpTransaction } from 'common'
import { DocumentService } from '../application'
import java from 'java'
import fs from 'fs'
import {
    decrypt as dec,
    MarkupContent,
    InsertMarkupValue,
    UpdateMarkupValue,
    DeleteMarkupValue,
    UserContext,
    Order,
    Taggings,
    OrderList
} from '../types'
import axios from 'axios'
import { buffer } from 'stream/consumers'
// initialize api object
// axios.defaults.withCredentials = true // withCredentials 전역 설정

const pmdcURL = 'https://10.130.1.181/piwebapi'
const username = 'kospoadmin'
const password = 'Kospopiadmin!'
const auth = btoa(`${username}:${password}`)
// const auth = Buffer.from(`${username}:${password}`).toString('base64');

const pmdcApi = axios.create({
    baseURL: pmdcURL,
    timeout: 60 * 1000,
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`
    }
})

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export function folders(service: DocumentService): HttpRouter {
    const router = HttpRouter.create('/')

    router.add('get', '/documents', (tx: HttpTransaction): void => {
        // 도면정보 강제 새로고침
        const isRefresh = dec(tx.query('isRefresh') as string | undefined)

        service
            .getDocumentList(isRefresh)
            .then((body: SafeObj[]) => {
                const res = { status: StatusCode.Ok, body }
                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/folders', (tx: HttpTransaction): void => {
        const parentId = dec(tx.query('parentId') as string)!

        service
            .getSubFolders(parentId)
            .then((body: SafeObj[]) => {
                const res = { status: StatusCode.Ok, body }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('post', '/font/log', (tx: HttpTransaction): void => {
        const body = tx.body() as unknown as { fontName: string }
        service
            .setFontLog(body.fontName)
            .then(() => {
                const res = { status: StatusCode.Ok }
                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/documents/:docId', (tx: HttpTransaction): void => {
        const docNo = dec(tx.param('docId'))!
        const plantCode = dec(tx.query('plantCode') as string)!
        const docVer = dec(tx.query('docVer') as string)!

        service
            .getDocument(docNo, docVer, plantCode)
            .then((body: SafeObj) => {
                const res = { status: StatusCode.Ok, body: body }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/documents/:docId/notiorders', (tx: HttpTransaction): void => {
        const docId = dec(tx.param('docId'))!
        const docVer = dec(tx.query('docVer') as string | undefined)
        const requestType = dec(tx.query('type') as string | undefined)
        const startDate = dec(tx.query('startDate') as string | undefined)
        const endDate = dec(tx.query('endDate') as string | undefined)

        if (!docVer || !requestType) {
            tx.reply({ status: StatusCode.Error })
        } else {
            service
                .getDocumentNotiorders(docId, docVer, requestType, startDate, endDate)
                .then((body: SafeObj[]) => {
                    const res = { status: StatusCode.Ok, body: body }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        }
    })

    router.add('get', '/documents/:docId/file', (tx: HttpTransaction): void => {
        const docId = dec(tx.param('docId'))!
        const docVer = dec(tx.query('docVer') as string)!

        service
            .getDocumentFilePath(docId, docVer)
            .then((filePath: string) => {
                tx.replyFile(filePath, undefined)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/search/documents', (tx: HttpTransaction): void => {
        const folderId = dec(tx.query('folderId') as string | undefined)
        const docName = dec(tx.query('docName') as string | undefined)
        const docNumber = dec(tx.query('docNumber') as string | undefined)
        const cnt = dec(tx.query('cnt') as string | undefined)
        service
            .searchDocument(folderId, docName, docNumber, cnt)
            .then((body: { cnt: number; data: SafeObj[] }) => {
                const res = { status: StatusCode.Ok, body }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/search/equipments', (tx: HttpTransaction): void => {
        const folderId = dec(tx.query('folderId') as string | undefined)
        const libId = dec(tx.query('libId') as string | undefined)
        const tag = dec(tx.query('tag') as string | undefined)
        const cnt = dec(tx.query('cnt') as string | undefined)

        service
            .searchEquipment(folderId, libId, tag, cnt)
            .then((body: { cnt: number; data: SafeObj[] }) => {
                const res = { status: StatusCode.Ok, body }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })
    router.add('get', '/search/document/equipments', (tx: HttpTransaction): void => {
        const docId = dec(tx.query('docId') as string)!
        const docVer = dec(tx.query('docVer') as string)!
        const libId = dec(tx.query('libId') as string | undefined)
        const tag = dec(tx.query('tag') as string | undefined)
        const cnt = dec(tx.query('cnt') as string | undefined)
        service
            .searchDocumentEquipment(docId, docVer, libId, tag, cnt)
            .then((body: SafeObj[]) => {
                const res = { status: StatusCode.Ok, body }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/search/signal', (tx: HttpTransaction): void => {
        const folderId = dec(tx.query('folderId') as string | undefined)
        const docname = dec(tx.query('docname') as string | undefined)
        const tagname = dec(tx.query('tagname') as string | undefined)
        const userId = dec(tx.query('userId') as string)!
        const cnt = dec(tx.query('cnt') as string | undefined)

        service
            .searchSignal(folderId, docname, tagname, userId, cnt)
            .then((body: { cnt: number; data: SafeObj[] }) => {
                const res = { status: StatusCode.Ok, body }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/search/related', (tx: HttpTransaction): void => {
        const foldersData = dec(tx.query('folders') as string | undefined)
        const name = dec(tx.query('name') as string | undefined)
        const number = dec(tx.query('number') as string | undefined)

        let folders: string[] = []

        if (foldersData) {
            folders = foldersData.split(',')
        }

        service
            .searchRelated(folders ?? [], name, number)
            .then((body: SafeObj[]) => {
                const res = { status: StatusCode.Ok, body }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/relatedRoot', (tx: HttpTransaction): void => {
        service
            .getRelatedRoot()
            .then((body: SafeObj[]) => {
                const res = { status: StatusCode.Ok, body }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/relatedFolders', (tx: HttpTransaction): void => {
        const parentId = dec(tx.query('parentId') as string)!

        service
            .getRelatedFolders(parentId)
            .then((body: SafeObj[]) => {
                const res = { status: StatusCode.Ok, body }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/symbols', (tx: HttpTransaction): void => {
        const plantCode = dec(tx.query('plantCode') as string)!

        service
            .getSymbolsByPlant(plantCode)
            .then((body: SafeObj[]) => {
                const res = { status: StatusCode.Ok, body }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/handles', (tx: HttpTransaction): void => {
        const docId = dec(tx.query('docId') as string)!
        const docVer = dec(tx.query('docVer') as string)!
        const tagId = dec(tx.query('tagId') as string)!

        service
            .getHandles(docId, docVer, tagId)
            .then((body: SafeObj[]) => {
                const res = { status: StatusCode.Ok, body: body }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/users/:userId/exists', (tx: HttpTransaction): void => {
        const userId = dec(tx.param('userId'))!

        service
            .existsUser(userId, tx.clientIp())
            .then((exists: boolean) => {
                const res = { status: exists ? StatusCode.Ok : StatusCode.NotFound }
                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/users/:userId/context', (tx: HttpTransaction): void => {
        const userId = dec(tx.param('userId'))!

        service
            .getContext(userId)
            .then((body: SafeObj) => {
                const res = { status: StatusCode.Ok, body }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('put', '/users/:userId/context', (tx: HttpTransaction): void => {
        const userId = dec(tx.param('userId'))!
        const body = tx.body() as unknown as UserContext

        service
            .setContext(userId, body)
            .then(() => {
                const res = { status: StatusCode.Ok }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/equipmentLinks', (tx: HttpTransaction): void => {
        const docId = dec(tx.query('docId') as string)!
        const docVer = dec(tx.query('docVer') as string)!
        const plantCode = dec(tx.query('plantCode') as string)!
        const handle = dec(tx.query('handle') as string)!

        service
            .getEquipmentLinks(docId, docVer, plantCode, handle)
            .then((body: SafeObj[]) => {
                const res = { status: StatusCode.Ok, body: body }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/markups', (tx: HttpTransaction): void => {
        const docNo = dec(tx.query('docId') as string)!
        const plantCode = dec(tx.query('plantCode') as string)!
        const docVer = dec(tx.query('docVer') as string)!
        const userId = dec(tx.query('userId') as string)!

        service
            .getMarkups(userId, docNo, docVer, plantCode)
            .then((body: MarkupContent[]) => {
                const res = { status: StatusCode.Ok, body: body }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('post', '/markups', (tx: HttpTransaction): void => {
        const body = tx.body() as InsertMarkupValue

        service
            .insertMarkup(body)
            .then((success: boolean) => {
                const res = { status: success ? StatusCode.Ok : StatusCode.Error }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('put', '/markups', (tx: HttpTransaction): void => {
        const body = tx.body() as UpdateMarkupValue
        console.log('body:', body)
        // return;
        service
            .updateMarkup(body)
            .then((success: boolean) => {
                const res = { status: success ? StatusCode.Ok : StatusCode.Error }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('delete', '/markups', (tx: HttpTransaction): void => {
        const body = tx.body() as DeleteMarkupValue

        service
            .deleteMarkup(body)
            .then((success: boolean) => {
                const res = { status: success ? StatusCode.Ok : StatusCode.Error }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    // A:설비정보
    router.add('get', '/equipmentInfoUrl', (tx: HttpTransaction): void => {
        const equnr = dec(tx.query('equnr') as string | undefined)
        const tplnr = dec(tx.query('tplnr') as string | undefined)

        if (equnr) {
            service
                .getEquipmentInfoUrl(equnr, tplnr)
                .then((body: SafeObj) => {
                    const res = { status: StatusCode.Ok, body: body }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            tx.reply({ status: StatusCode.Error })
        }
    })

    // C:통지발행
    router.add('get', '/notiIssueUrl', (tx: HttpTransaction): void => {
        const equnr = dec(tx.query('equnr') as string | undefined)
        const tplnr = dec(tx.query('tplnr') as string | undefined)

        if (equnr) {
            service
                .getNotiIssueUrl(equnr, tplnr)
                .then((body: SafeObj) => {
                    const res = { status: StatusCode.Ok, body: body }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            tx.reply({ status: StatusCode.Error })
        }
    })

    // D:오더발행
    router.add('get', '/orderIssueUrl', (tx: HttpTransaction): void => {
        const equnr = dec(tx.query('equnr') as string | undefined)
        const tplnr = dec(tx.query('tplnr') as string | undefined)

        if (equnr) {
            service
                .getOrderIssueUrl(equnr, tplnr)
                .then((body: SafeObj) => {
                    const res = { status: StatusCode.Ok, body: body }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            tx.reply({ status: StatusCode.Error })
        }
    })

    // E:통지이력조회
    router.add('get', '/notiRecordUrl', (tx: HttpTransaction): void => {
        const equnr = dec(tx.query('equnr') as string | undefined)
        const startDate = dec(tx.query('startDate') as string | undefined)
        const endDate = dec(tx.query('endDate') as string | undefined)
        const tplnr = dec(tx.query('tplnr') as string | undefined)

        if (equnr && startDate && endDate) {
            service
                .getNotiRecordUrl(equnr, startDate, endDate, tplnr)
                .then((body: SafeObj) => {
                    const res = { status: StatusCode.Ok, body: body }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            tx.reply({ status: StatusCode.Error })
        }
    })

    // F:오더이력조회
    router.add('get', '/orderRecordUrl', (tx: HttpTransaction): void => {
        const equnr = dec(tx.query('equnr') as string | undefined)
        const startDate = dec(tx.query('startDate') as string | undefined)
        const endDate = dec(tx.query('endDate') as string | undefined)
        const tplnr = dec(tx.query('tplnr') as string | undefined)

        if (equnr && startDate && endDate) {
            service
                .getOrderRecordUrl(equnr, startDate, endDate, tplnr)
                .then((body: SafeObj) => {
                    const res = { status: StatusCode.Ok, body: body }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            tx.reply({ status: StatusCode.Error })
        }
    })

    router.add('get', '/orderUrl', (tx: HttpTransaction): void => {
        const id = dec(tx.query('id') as string | undefined)
        const tplnr = dec(tx.query('tplnr') as string | undefined)

        if (id) {
            service
                .getOrderUrl(id, tplnr)
                .then((body: SafeObj) => {
                    const res = { status: StatusCode.Ok, body: body }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            tx.reply({ status: StatusCode.Error })
        }
    })

    router.add('get', '/noticeUrl', (tx: HttpTransaction): void => {
        const id = dec(tx.query('id') as string | undefined)
        const tplnr = dec(tx.query('tplnr') as string | undefined)

        if (id) {
            service
                .getNoticeUrl(id, tplnr)
                .then((body: SafeObj) => {
                    const res = { status: StatusCode.Ok, body: body }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            tx.reply({ status: StatusCode.Error })
        }
    })

    router.add('get', '/relatedFileInfo', (tx: HttpTransaction): void => {
        const DOKAR = dec(tx.query('DOKAR') as string | undefined)
        const DOKVR = dec(tx.query('DOKVR') as string | undefined)
        const DOKTL = dec(tx.query('DOKTL') as string | undefined)
        const DOKNR = dec(tx.query('DOKNR') as string | undefined)
        const userId = dec(tx.query('userId') as string)!

        if (DOKAR && DOKVR && DOKTL && DOKNR && userId) {
            service
                .getRelatedFileInfo(DOKAR, DOKVR, DOKTL, DOKNR, userId)
                .then((body: SafeObj[]) => {
                    const res = { status: StatusCode.Ok, body: body }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            tx.reply({ status: StatusCode.Error })
        }
    })

    // P:관련문서조회
    router.add('get', '/khnp/relatedFileInfo', (tx: HttpTransaction): void => {
        /**
         * 설비 데이터 기반 관련문서 조회입니다
         * (이전 뷰어에서 사용하는 방식)
         * TODO RFC 호출을 통한 URL 반환값을 호출해서 SAP 창을 띄워주면 됩니다
         */
        const equnr = dec(tx.query('equnr') as string | undefined)
        const tplnr = dec(tx.query('tplnr') as string | undefined)

        if (equnr && tplnr) {
            service
                .getRelateFileInfoUrl(equnr, tplnr)
                .then((body: SafeObj) => {
                    const res = { status: StatusCode.Ok, body }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            tx.reply({ status: StatusCode.Error })
        }
    })

    router.add('get', '/khnp/ecm/relatedFileInfo', (tx: HttpTransaction) => {
        const dokar = dec(tx.query('dokar') as string | undefined)
        const doknr = dec(tx.query('doknr') as string | undefined)
        const doktl = dec(tx.query('doktl') as string | undefined)
        const dokvr = dec(tx.query('dokvr') as string | undefined)
        const filename = dec(tx.query('filename') as string | undefined)

        if (dokar && doknr && doktl && dokvr && filename) {
            service
                .getECMRelatedFileInfo({
                    I_DOKAR: dokar,
                    I_DOKNR: doknr,
                    I_DOKTL: doktl,
                    I_DOKVR: dokvr,
                    I_FILENM: filename
                })
                .then((body: SafeObj) => {
                    const res = { status: StatusCode.Ok, body }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        }
    })

    // ISO 도면 조회
    router.add('get', '/iso/file', (tx: HttpTransaction): void => {
        // 문서유형
        const dokar = dec(tx.query('dokar') as string | undefined)
        // 문서번호
        const doknr = dec(tx.query('doknr') as string | undefined)

        if (dokar && doknr) {
            service
                .getISOFile(dokar, doknr)
                .then((body: SafeObj) => {
                    const res = { status: StatusCode.Ok, body }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            tx.reply({ status: StatusCode.Error })
        }
    })

    // ISO 도면 리스트 조회
    router.add('get', '/iso/list', (tx: HttpTransaction): void => {
        const tplnr = dec(tx.query('tplnr') as string)

        if (tplnr) {
            service
                .getISODrawList(tplnr)
                .then((body: SafeObj) => {
                    const res = { status: StatusCode.Ok, body }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            tx.reply({ status: StatusCode.Error })
        }
    })

    // M1 통지발행
    router.add('get', '/notiIssueUrl/m1', (tx: HttpTransaction): void => {
        const equnr = dec(tx.query('equnr') as string | undefined)
        const tplnr = dec(tx.query('tplnr') as string)
        const userId = dec(tx.query('userId') as string)

        if (equnr && tplnr && userId) {
            service
                .getM1NotiIssueUrl(equnr, tplnr, userId)
                .then((body: SafeObj) => {
                    const res = { status: StatusCode.Ok, body }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        }
    })

    // M2 통지발행
    router.add('get', '/notiIssueUrl/m2', (tx: HttpTransaction): void => {
        const equnr = dec(tx.query('equnr') as string | undefined)
        const tplnr = dec(tx.query('tplnr') as string)
        const userId = dec(tx.query('userId') as string)

        if (equnr && tplnr && userId) {
            service
                .getM2NotiIssueUrl(equnr, tplnr, userId)
                .then((body: SafeObj) => {
                    const res = { status: StatusCode.Ok, body }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        }
    })

    router.add('get', '/wcd', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const docId = dec(tx.query('docId') as string)
                const docVer = dec(tx.query('docVer') as string)
                if (docId && docVer) {
                    const result = await service.getWcd(docId, docVer)
                    const res = { status: StatusCode.Ok, body: result }
                    tx.reply(res)
                } else {
                    tx.reply({ status: StatusCode.Error })
                }
            } catch (error) {
                console.log(error)
            }
        })()
    })

    router.add('get', '/wcdOrderList', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const func = dec(tx.query('func') as string)
                if (func) {
                    const result = await service.getOrderList(func)
                    const res = { status: StatusCode.Ok, body: result }
                    tx.reply(res)
                } else {
                    tx.reply({ status: StatusCode.Error })
                }
            } catch (error) {
                console.log(error)
            }
        })()
    })

    router.add('get', '/wcdTagging', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const docId = dec(tx.query('docId') as string)
                const docVer = dec(tx.query('docVer') as string)
                const id = dec(tx.query('id') as string)
                const func = dec(tx.query('func') as string)
                const wcdNo = dec(tx.query('wcdNo') as string)
                if (docId && docVer && func && wcdNo) {
                    const result = await service.getTagging(docId, docVer, id, func, wcdNo)
                    const res = { status: StatusCode.Ok, body: result }
                    tx.reply(res)
                } else {
                    tx.reply({ status: StatusCode.Error })
                }
            } catch (error) {
                console.log(error)
            }
        })()
    })

    router.add('get', '/pmdc', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const docId = dec(tx.query('docId') as string)
                const docVer = dec(tx.query('docVer') as string)
                const func = dec(tx.query('func') as string)
                if (docId && docVer) {
                    if (func) {
                        const result = await service.getPMDCEquipments(docId, docVer, func)
                        const res = { status: StatusCode.Ok, body: result }
                        tx.reply(res)
                    } else {
                        const result = await service.getPMDCEquipments(docId, docVer, '')
                        const res = { status: StatusCode.Ok, body: result }
                        tx.reply(res)
                    }
                } else {
                    tx.reply({ status: StatusCode.Error })
                }
            } catch (error) {
                console.log(error)
            }
        })()
    })

    router.add('get', '/pmdc/user', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const userId = dec(tx.query('userId') as string)
                const docId = dec(tx.query('docId') as string)
                const docVer = dec(tx.query('docVer') as string)
                const func = dec(tx.query('func') as string)
                if (docId && docVer) {
                    if (func) {
                        const result = await service.getPMDCUser(userId!, docId, docVer, func)
                        const res = { status: StatusCode.Ok, body: result }
                        tx.reply(res)
                    } else {
                        const result = await service.getPMDCUser(userId!, docId, docVer, '')
                        const res = { status: StatusCode.Ok, body: result }
                        tx.reply(res)
                    }
                } else {
                    tx.reply({ status: StatusCode.Error })
                }
            } catch (error) {
                console.log(error)
            }
        })()
    })

    router.add('post', '/pmdc/user/update', (tx: HttpTransaction): void => {
        const body = tx.body() as { add: []; sub: [] }
        console.log('body:', body)
        if (body.add.length > 0)
            service
                .insertPMDCUser(body.add)
                .then((success: boolean) => {
                    const res = { status: success ? StatusCode.Ok : StatusCode.Error }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        if (body.sub.length > 0)
            service
                .deletePMDCUser(body.sub)
                .then((success: boolean) => {
                    const res = { status: success ? StatusCode.Ok : StatusCode.Error }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
    })

    router.add('post', '/pmdc/master/update', (tx: HttpTransaction): void => {
        const body = tx.body() as { add: []; sub: [] }
        console.log('body:', body)
        if (body.add.length === 0 && body.sub.length === 0) tx.reply({ status: StatusCode.Ok })
        if (body.add.length > 0)
            service
                .insertPMDCMaster(body.add)
                .then((success: boolean) => {
                    const res = { status: success ? StatusCode.Ok : StatusCode.Error }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        if (body.sub.length > 0)
            service
                .deletePMDCMaster(body.sub)
                .then((success: boolean) => {
                    const res = { status: success ? StatusCode.Ok : StatusCode.Error }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
    })

    router.add('get', '/pmdc/search', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const search = dec(tx.query('searchtext') as string)
                const source = dec(tx.query('sourcepos') as string)
                if (search && source) {
                    const result: any = await pmdcApi.get(
                        `/dataservers/${source}/points?nameFilter=${search}&maxCount=30000`
                    )
                    const res = { status: StatusCode.Ok, body: result.data }
                    tx.reply(res)
                } else {
                    tx.reply({ status: StatusCode.Error })
                }
            } catch (error) {
                console.log(error)
            }
        })()
    })

    router.add('get', '/pmdc/source', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const result: any = await pmdcApi.get(`/dataservers`)
                const res = { status: StatusCode.Ok, body: result.data }
                tx.reply(res)
            } catch (error) {
                console.log(error)
            }
        })()
    })

    router.add('get', '/pmdc/value', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const webid = dec(tx.query('webid') as string)
                if (webid) {
                    const result: any = await pmdcApi.get(`/streams/${webid}/value`)
                    const res = { status: StatusCode.Ok, body: result.data }
                    tx.reply(res)
                } else {
                    tx.reply({ status: StatusCode.Error })
                }
            } catch (error) {
                console.log(error)
            }
        })()
    })

    router.add('get', '/PMDCPopupPosSave', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const userId = dec(tx.query('userId') as string)
                const posArr = dec(tx.query('posArr') as string)
                const idArr = dec(tx.query('idArr') as string)

                if (userId && posArr && idArr) {
                    const result = await service.PMDCPopupPosSave(userId, posArr, idArr)
                    if (result) {
                        const res = { status: StatusCode.Ok }
                        tx.reply(res)
                    } else {
                        tx.reply({ status: StatusCode.Error })
                    }
                } else {
                    tx.reply({ status: StatusCode.Error })
                }
            } catch (error) {
                console.log(error)
            }
        })()
    })

    router.add('get', '/getPMDCRealTimeData', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const name = dec(tx.query('name') as string)
                if (name) {
                    const result = await service.getPMDCRealTimeData(name)
                    const res = { status: StatusCode.Ok, body: result }
                    tx.reply(res)
                } else {
                    tx.reply({ status: StatusCode.Error })
                }
            } catch (error) {
                console.log(error)
            }
        })()
    })

    router.add('get', '/pmdc/ispm/update', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const list = dec(tx.query('list') as string)
                if (list) {
                    const result = await service.updateIspm(list)
                    if (result) {
                        const res = { status: StatusCode.Ok }
                        tx.reply(res)
                    } else {
                        tx.reply({ status: StatusCode.Error })
                    }
                } else {
                    tx.reply({ status: StatusCode.Error })
                }
            } catch (error) {
                console.log(error)
            }
        })()
    })

    router.add('post', '/log/user', (tx: HttpTransaction): void => {
        const { value } = tx.body() as { value: any }
        value.logIP = tx.clientIp()

        /**
         * ! logGubun, plantCode, plantName은 경주에서 확인 뒤 적용
         */

        console.log(value)

        if (undefined !== value) {
            service
                .logUser(value)
                .then((result: boolean) => {
                    if (result) {
                        const res = { status: StatusCode.Ok }
                        tx.reply(res)
                    } else {
                        console.log('Fail')
                        tx.reply({ status: StatusCode.Error })
                    }
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            tx.reply({ status: StatusCode.Error })
        }
    })

    router.add('post', '/log/document', (tx: HttpTransaction): void => {
        const { value } = tx.body() as { value: any }
        value.logIp = tx.clientIp().replace('::ffff:', '')

        if (undefined !== value) {
            service
                .logDocument(value)
                .then((result: boolean) => {
                    if (result) {
                        const res = { status: StatusCode.Ok }
                        tx.reply(res)
                    } else {
                        tx.reply({ status: StatusCode.Error })
                    }
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        }
    })

    router.add('get', '/NotiOrderSync', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const startDate = tx.query('startDate') as string
                const endDate = tx.query('endDate') as string
                if (startDate && endDate) {
                    const result = await service.NotiOrderSync(startDate, endDate)
                    const res = { status: StatusCode.Ok, body: result }
                    tx.reply(res)
                } else {
                    tx.reply({ status: StatusCode.Error })
                }
            } catch (error) {
                console.log(error)
            }
        })()
    })

    router.add('get', '/EquipSync', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const startDate = tx.query('startDate') as string
                const endDate = tx.query('endDate') as string
                const type = tx.query('type') as string
                if (startDate && endDate && type) {
                    const result = await service.EquipSync(startDate, endDate, type)
                    const res = { status: StatusCode.Ok, body: result }
                    tx.reply(res)
                } else {
                    tx.reply({ status: StatusCode.Error })
                }
            } catch (error) {
                console.log(error)
            }
        })()
    })

    router.add('get', '/plantCode/folders', (tx: HttpTransaction): void => {
        const plantCode = dec(tx.query('plantCode') as string)!
        service
            .getFolderIdsByPlantCode(plantCode)
            .then((body: selectItem[]) => {
                const res = { status: StatusCode.Ok, body }
                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/epnid/api/url/equipNo', (tx: HttpTransaction): void => {
        const userId = tx.query('userId') as string
        const equipmentNo = tx.query('equipmentNo') as string

        service
            .getUrlByEquipNo(userId, equipmentNo)
            .then((result: string) => {
                const res = { status: StatusCode.Ok, body: { url: result } }
                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/epnid/api/url/funcName', (tx: HttpTransaction): void => {
        const userId = tx.query('userId') as string
        const equipment = tx.query('functionName') as string

        service
            .getUrlByfunctionName(userId, equipment)
            .then((result: string) => {
                const res = { status: StatusCode.Ok, body: { url: result } }
                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/procedure/list', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const userId = dec(tx.query('userId')) as string
                const prono = dec(tx.query('prono')) as string | undefined
                const pronm = dec(tx.query('pronm')) as string | undefined
                const folId = dec(tx.query('folId')) as string | undefined
                const folph = dec(tx.query('folph')) as string | undefined

                if (userId) {
                    const result = await service.procedureList({ userId, prono, pronm, folId, folph })
                    const res = { status: StatusCode.Ok, body: result }
                    tx.reply(res)
                } else {
                    tx.reply({ status: StatusCode.Error })
                }
            } catch (error) {
                console.log(error)
            }
        })()
    })

    router.add('get', '/procedure/read', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const userId = dec(tx.query('userId')) as string
                const proId = dec(tx.query('proId')) as string
                if (userId && proId) {
                    const result = await service.procedureRead(userId, proId)
                    const res = { status: StatusCode.Ok, body: result }
                    tx.reply(res)
                } else {
                    tx.reply({ status: StatusCode.Error })
                }
            } catch (error) {
                console.log(error)
            }
        })()
    })

    router.add('post', '/procedure/write', (tx: HttpTransaction): void => {
        const body = tx.body() as any
        body.STEPS.map((v: any) => {
            v.STPDESC = v.STPDESC.replace(/'/gi, `'||CHR(039)||'`)
            v.STPDESC = v.STPDESC.replace(/"/gi, `'||CHR(034)||'`)
            v.STPNM = v.STPNM.replace(/'/gi, `'||CHR(039)||'`)
            v.STPNM = v.STPNM.replace(/"/gi, `'||CHR(034)||'`)
        })
        body.PRONO = body.PRONO.replace(/'/gi, `'||CHR(039)||'`)
        body.PRONO = body.PRONO.replace(/"/gi, `'||CHR(034)||'`)
        body.PRONM = body.PRONM.replace(/'/gi, `'||CHR(039)||'`)
        body.PRONM = body.PRONM.replace(/"/gi, `'||CHR(034)||'`)
        service.insertProcedure(body).then((success: boolean) => {
            const res = { status: success ? StatusCode.Ok : StatusCode.Error }
        })
    })

    router.add('get', '/procedure/handle', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const func = dec(tx.query('func')) as string
                const docId = dec(tx.query('docId')) as string
                if (func && docId) {
                    const result = await service.getProcedureEquipHandle(func, docId)
                    const res = { status: StatusCode.Ok, body: result }
                    tx.reply(res)
                } else {
                    tx.reply({ status: StatusCode.Error })
                }
            } catch (e) {
                console.log('folder get /procedure/pmdc 에러', e)
            }
        })()
    })

    router.add('get', '/test/imgInsert', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const result = await service.testImgInsert()

                const res = { status: StatusCode.Ok, body: result }
                tx.reply(res)
            } catch (e) {
                console.log('folder get /procedure/pmdc 에러', e)
            }
        })()
    })

    router.add('get', '/last/document', (tx: HttpTransaction): void => {
        const userId = dec(tx.query('userId') as string)

        if (undefined !== userId) {
            service
                .getLastDocumentInfo(userId)
                .then((result: any) => {
                    if (result) {
                        const res = { status: StatusCode.Ok, body: result }
                        tx.reply(res)
                    } else {
                        tx.reply({ status: StatusCode.Error })
                    }
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        }
    })

    router.add('get', '/equipment/image', (tx: HttpTransaction): void => {
        const tplnr = dec(tx.query('tplnr') as string | undefined)

        if (undefined !== tplnr) {
            service
                .getEquipmentImage(tplnr)
                .then((result: any) => {
                    if (result) {
                        const res = { status: StatusCode.Ok, body: result }
                        tx.reply(res)
                    } else {
                        tx.reply({ status: StatusCode.Error })
                    }
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        }
    })

    router.add('get', '/equipment/image/:serial', (tx: HttpTransaction): void => {
        const serial = dec(tx.param('serial'))
        console.log('@serial_1: ', serial)
        if (serial) {
            service
                .getEquipmentImageData(serial)
                .then((result: any) => {
                    if (result) {
                        tx.replyStream(result)
                    } else {
                        tx.reply({ status: StatusCode.Error })
                    }
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        }
    })

    router.add('get', '/equipment/imagedel', (tx: HttpTransaction): void => {
        const serial = dec(tx.query('serial') as string | undefined)

        if (undefined !== serial) {
            service
                .deleteEquipmentImageData(serial)
                .then((result: any) => {
                    if (result) {
                        const res = { status: StatusCode.Ok, body: result }
                        tx.reply(res)
                    } else {
                        tx.reply({ status: StatusCode.Error })
                    }
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        }
    })

    router.add('get', '/sso', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const ssotoken = dec(tx.query('ssotoken'))
                console.log('ssotoken: ', ssotoken)
                axios.get(`http://localhost:9090/index.jsp?ssotoken=${ssotoken}`)

                return
            } catch (e) {
                console.log('error: ', e)
            }
        })
    })

    router.add('get', '/sso/token', async (tx: HttpTransaction): Promise<void> => {
        try {
            const ssotoken = tx.query('ssotoken')
            const result = await axios.get(`http://localhost:9090/index.jsp?ssotoken=${ssotoken}`)
            tx.redirect(`http://epnid.se.hn:8180/loginSEC.aspx?sid=${result.headers.sabun}`)
        } catch (e) {
            console.log('error: ', e)
        }
    })

    router.add('post', '/equipment/image', (tx: HttpTransaction): void => {
        const tplnr = dec(tx.query('tplnr') as string | undefined)
        const body = tx.body() as any
        // const body = tx.body() as { folderId: string; userId: string }

        const files = tx.files()
        body.tplnr = tplnr

        if (tplnr && files) {
            const file = files['image_0']

            if (!Array.isArray(file)) {
                body.files = files

                service
                    .addEquipmentImage(body)
                    .then((success: boolean) => {
                        const res = { status: success ? StatusCode.Ok : StatusCode.Error }

                        console.log('@SUCESS: ', success)

                        tx.reply(res)
                    })
                    .catch((e) => {
                        console.log(JSON.stringify(e))
                        tx.reply({ status: StatusCode.Error })
                    })
                // })
            }
        }
    })

    router.add('get', 'sso', (tx: HttpTransaction): void => {
        void (async () => {
            try {
                const ssotoken = tx.query('ssotoken')

                const result = await axios.get(`http://localhost:9090/index.jsp?ssotoken=${ssotoken}`)

                tx.redirect(`http://epnid.se.hn:8180/loginSEC.aspx?sid=${result.headers.sabun}`)
            } catch (e) {
                console.log('error: ', e)
            }
        })
    })

    router.add('get', '/user/:sabun', (tx: HttpTransaction): void => {
        const sabun = dec(tx.param('sabun'))
        if (sabun) {
            service
                .getUserBySabun(sabun)
                .then((result: any) => {
                    if (result) {
                        const res = { status: StatusCode.Ok, body: result }
                        tx.reply(res)
                    } else {
                        tx.reply({ status: StatusCode.Error })
                    }
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        }
    })

    // setInterval(async () => {
    //     // console.log("request pi system!!");
    //     await pmdcApi.get(`/dataservers`)
    // }, 30000)
    return router
}
