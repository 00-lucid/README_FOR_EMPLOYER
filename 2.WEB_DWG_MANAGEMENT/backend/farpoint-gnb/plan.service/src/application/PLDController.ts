import { StatusCode, HttpRouter, HttpTransaction } from 'common'
import { Entities, PldInfo, Simbol, SimbolList, PldList, ChangePldCanvas } from 'types'
import { PLDService } from './PLDService'
import { decrypt as dec } from '../types'

export function PLDController(service: PLDService): HttpRouter {
    const router = HttpRouter.create('/')

    router.add('get', '/pld/test', (tx: HttpTransaction): void => {
        try {
            const testResult = service.testService()
            if (null !== testResult) {
                const res = { status: StatusCode.Ok }
                tx.reply(res)
            }
        } catch (e) {
            console.log(JSON.stringify(e))
            tx.reply({ status: StatusCode.Error })
        }
    })

    router.add('get', '/pld/simbol', (tx: HttpTransaction): void => {
        service
            .getAllSimbol()
            .then((data: Simbol[]) => {
                const res = { status: StatusCode.Ok, body: data }
                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
            })
    })

    router.add('get', '/pld/simbol-list/:cId/:cVr/:docNo/:docVr/:cSeq', (tx: HttpTransaction): void => {
        const cId = tx.param('cId')
        const cVr = tx.param('cVr')
        const docNo = tx.param('docNo')
        const docVr = tx.param('docVr')
        const cSeq = tx.param('cSeq')

        service
            .getAllSimbolList({ cId, cVr, docNo, docVr, cSeq })
            .then((data: SimbolList[]) => {
                const res = { status: StatusCode.Ok, body: data }
                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
            })
    })

    router.add('post', '/pld/resister', (tx: HttpTransaction): void => {
        const userId = dec(tx.query('userId') as string)

        if (userId) {
            const body = tx.body() as {
                procedureNumber: string
                procedureName: string
                pldName: string
                plantValue: string
                pldDESC: string
                selectedItems: string[]
            }

            service
                .resisterPld(
                    body.procedureNumber,
                    body.procedureName,
                    body.pldName,
                    body.plantValue,
                    body.pldDESC,
                    body.selectedItems,
                    userId
                )
                .then((data: PldInfo) => {
                    const res = { status: StatusCode.Ok, body: data }
                    tx.reply(res)
                })
                .catch((error) => {
                    console.log(JSON.stringify(error))
                    tx.reply({ status: StatusCode.Error })
                })
        }
    })

    router.add('post', '/pld/changePldCanvas', (tx:HttpTransaction): void => {
        const body = tx.body() as {
            pldList : ChangePldCanvas[]
        }

        service
            .changePldCanvas(body.pldList)
            .then(() => {
                const res = { status: StatusCode.Ok }
                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
            })
    })

    router.add('post', '/pld/simbol-list', (tx: HttpTransaction): void => {
        const body = tx.body() as {
            simbolList: SimbolList[]
        }

        service
            .addSimbolList(body.simbolList)
            .then(() => {
                const res = { status: StatusCode.Ok }
                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
            })
    })

    router.add('get', '/pld/open/:companyFolder/:plantFolder', (tx: HttpTransaction): void => {
        const companyFolder = tx.param('companyFolder')
        const plantFolder = tx.param('plantFolder')

        service
            .searchPld({ companyFolder, plantFolder })
            .then((data: PldList[]) => {
                const res = { status: StatusCode.Ok, body: data }
                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
            })
    })

    router.add('get', '/pld/document-list/:cId/:cVr', (tx: HttpTransaction): void => {
        const c_id = tx.param('cId')
        const c_vr = tx.param('cVr')

        service
            .getPldDocumentList({ c_id, c_vr })
            .then((data) => {
                console.log(data)
                const res = { status: StatusCode.Ok, body: data }
                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
            })
    })

    router.add('get', '/pld/entities-list/:cId/:cVr/:docNo/:docVr/:cSeq', (tx: HttpTransaction): void => {
        const cId = tx.param('cId')
        const cVr = tx.param('cVr')
        const docNo = tx.param('docNo')
        const docVr = tx.param('docVr')
        const cSeq = tx.param('cSeq')

        service
            .getPldEntitiesList({ cId, cVr, docNo, docVr, cSeq })
            .then((data) => {
                const res = { status: StatusCode.Ok, body: data }
                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
            })
    })

    router.add('post', '/pld/entities-list', (tx: HttpTransaction) => {
        const body = tx.body() as {
            entitiesList: Entities[]
        }

        service
            .addEntitiesList(body.entitiesList)
            .then(() => {
                const res = { status: StatusCode.Create }
                tx.reply(res)
            })
            .catch((e) => {
                console.log(JSON.stringify(e))
            })
    })

    return router
}
