import nock from 'nock'
import * as http from 'http'
import { BufferReadStream, BufferWriteStream, HttpRequest } from '..'

describe('http request for client', () => {
    afterEach(() => {
        nock.cleanAll()
    })

    test('nock 모듈이 정상 동작한다.', (done) => {
        nock('http://localhost').get('/path').reply(200)

        http.get('http://localhost/path', (_: http.IncomingMessage) => {
            expect(nock.isDone()).toBeTruthy()
            done()
        })
    })

    test('raw request method', async () => {
        const send = { test: 'value', arg: 'test1' }
        const recv = { test: 'value', arg: 'test2' }

        nock('http://localhost').post('/path', send).reply(200, recv)

        const reader = BufferReadStream.fromObject(send)
        const writer = BufferWriteStream.create()

        const response = await HttpRequest.sendStream(
            {
                host: 'localhost',
                port: 80,
                path: '/path',
                protocol: 'http:',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            },
            reader,
            writer
        )

        expect(nock.isDone()).toBeTruthy()
        expect(response.code).toEqual(200)

        const buffer = writer.getBuffer()
        const str = buffer.toString()
        const json = JSON.parse(str) as SafeObj

        expect(recv).toEqual(json)
    })

    test('get method', async () => {
        nock('http://localhost:3000').get('/path').reply(200)

        const response = await HttpRequest.get('http://localhost:3000/path')

        expect(nock.isDone()).toBeTruthy()
        expect(response.status.code).toEqual(200)
    })

    test('post method', async () => {
        const send = { test: 'value', arg: 'test1' }
        const recv = { test: 'value', arg: 'test2' }

        nock('http://localhost').post('/path', send).reply(200, recv)

        const response = await HttpRequest.post('http://localhost/path', send)

        expect(nock.isDone()).toBeTruthy()

        const json = response.json()

        expect(recv).toEqual(json)
    })
})
