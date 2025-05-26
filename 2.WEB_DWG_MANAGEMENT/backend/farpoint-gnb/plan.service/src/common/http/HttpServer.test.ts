import { HttpRequest, StatusCode, HttpServer, HttpRouter, HttpTransaction } from '.'

describe('http request for client', () => {
    test('Application 초기화', async () => {
        let app = HttpServer.prototype

        const port = 44001

        const message = {
            status: StatusCode.Ok,
            headers: [{ name: 'test', value: 'header Val' }],
            body: { item: 'test body' }
        }

        try {
            const router = HttpRouter.create('')

            router.add('get', '/', (tx: HttpTransaction): void => {
                tx.reply(message)
            })

            app = HttpServer.create([router])
            app.start(port)

            const res = await HttpRequest.get(`http://localhost:${port}/`)

            expect(res.status.code).toEqual(StatusCode.Ok)
            expect(res.json()).toEqual(message.body)
        } finally {
            app.stop()
        }
    })

    test('query 읽기', async () => {
        let app = HttpServer.prototype
        const port = 44001
        const url = `http://localhost:${port}`

        try {
            const router = HttpRouter.create('')

            let values: string[] = []

            router.add('get', '/', (tx: HttpTransaction): void => {
                values = tx.query('items') as string[]

                tx.reply({ status: StatusCode.Ok })
            })

            app = HttpServer.create([router])
            app.start(port)

            await HttpRequest.get(url + '/?items=(a,b,3)&number=123')

            expect(values.length).toEqual(3)
            expect(values[0]).toEqual('a')
            expect(values[2]).toEqual('3')
        } finally {
            app.stop()
        }
    })
})
