import { StatusCode, HttpRouter, HttpTransaction } from 'common'
import { decrypt as dec } from '../types'
import { PIService } from './PIService'

export function PIController(service: PIService): HttpRouter {
    const router = HttpRouter.create('/pi')

    router.add('get', '/detail', (tx: HttpTransaction): void => {
        console.log('init controller')
        const docNo = dec(tx.query('docNo'))
        const docVr = dec(tx.query('docVr'))

        if (docNo && docVr) {
            service
                .getAllDetail({ docNo, docVr })
                .then((result: Mimic[]) => {
                    const res = { status: StatusCode.Ok, body: result }
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

    return router
}
