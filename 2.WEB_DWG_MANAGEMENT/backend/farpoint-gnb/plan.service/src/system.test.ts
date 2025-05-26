import { HttpRequest } from 'common'
import { port, close } from './index.single'

const host = `http://localhost:${port()}/system`

describe('app 시작점', () => {
    jest.setTimeout(20 * 1000)

    afterAll(() => {
        close()
    })

    beforeAll(async () => {
        const res = await HttpRequest.get(`${host}/delete`)
        const json = res.json()
        console.log(json)
    })

    test('system init', async () => {
        const res = await HttpRequest.get(`${host}/init`)
        const json = res.json()

        console.log(json)
        expect(res.status.code).toEqual(200)
    })
})
