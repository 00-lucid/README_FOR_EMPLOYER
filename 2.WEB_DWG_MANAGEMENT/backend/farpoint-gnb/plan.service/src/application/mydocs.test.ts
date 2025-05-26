import { HttpRequest, utils } from '../common'
import { port, close } from '../index.single'
import { encrypt, MydocList } from '../types'

const host = `http://localhost:${port()}`

describe('mydocs controller', () => {
    jest.setTimeout(60 * 1000)

    beforeAll(async () => {
        await utils.sleep(3000)

        await HttpRequest.delete(`${host}/system/delete/do/not/use/mydocs`)
        await HttpRequest.get(`${host}/system/init/mydocs`)
    })

    afterAll(() => {
        close()
    })

    const getFirstFolder = async () => {
        const res = await HttpRequest.get(`${host}/mydocs/folders?userId=${encrypt('user1') ?? ''}`)
        const json = res.json() as unknown as MydocList[]

        return json[0].subfolders[0]
    }

    test('get list', async () => {
        const res = await HttpRequest.get(`${host}/mydocs/folders?userId=${encrypt('user1') ?? ''}`)
        const json = res.json()

        console.log(json)
        expect(res.status.code).toEqual(200)
    })

    test('create folder', async () => {
        const body = { folderName: 'testname' }

        const res = await HttpRequest.post(
            `${host}/mydocs/folders/${encrypt('root') ?? 'null'}?userId=${encrypt('user1') ?? ''}`,
            body
        )

        expect(res.status.code).toEqual(200)
    })

    test('rename folder', async () => {
        const folder = await getFirstFolder()

        const body = { newName: 'newname' }

        await HttpRequest.put(
            `${host}/mydocs/folders/${encrypt(folder.id) ?? 'null'}?userId=${encrypt('user1') ?? 'null'}`,
            body
        )

        const updated = await getFirstFolder()

        expect(updated.folderName).toEqual('newname')
    })

    test('delete folder', async () => {
        const folder = await getFirstFolder()

        const res = await HttpRequest.delete(
            `${host}/mydocs/folders/${encrypt(folder.id) ?? 'null'}?userId=${encrypt('user1') ?? 'null'}`
        )

        expect(res.status.code).toEqual(200)
    })
})
