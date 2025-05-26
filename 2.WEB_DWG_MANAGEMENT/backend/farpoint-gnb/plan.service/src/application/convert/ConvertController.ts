import { StatusCode, HttpRouter, HttpTransaction } from 'common'
import { decrypt as dec } from '../../types'
import { ConvertService } from './ConvertService'

export function ConvertController(service: ConvertService): HttpRouter {
    const router = HttpRouter.create('/convert')
    router.add('get', '/pdf', (tx: HttpTransaction): void => {
        const docId = dec(tx.query('docId'))
        const docVr = dec(tx.query('docVr'))
        const userId = dec(tx.query('userId') as string)
        const type = dec(tx.query('type'))
        const colorMode = dec(tx.query('mode'))
        console.log('print::', docId, docVr, userId, type)
        if (docId && docVr && userId && type && colorMode) {
            service
                .getDwgToPdf({ docId, docVr, userId, type, colorMode })
                .then((res: Buffer) => {
                    tx.replyBufferPdf(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            tx.reply({ status: StatusCode.Error })
        }
    })

    return router
}
