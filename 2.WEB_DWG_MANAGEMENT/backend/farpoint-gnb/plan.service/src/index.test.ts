import { File, HttpRequest, utils } from 'common'
import { port, close } from './index.single'

const host = `http://localhost:${port()}`

describe('app 시작점', () => {
    jest.setTimeout(60 * 1000)

    beforeAll(async () => {
        await utils.sleep(3000)
        Path.mkdir('output/test')
    })

    afterAll(() => {
        close()
    })

    test('GET test path', async () => {
        const res = await HttpRequest.get(`${host}/test`)
        const json = res.json()

        console.log(json)
        expect(res.status.code).toEqual(200)
    })

    test('GET document list', async () => {
        const res = await HttpRequest.get(`${host}/documents`)
        const json = res.json()

        const str = JSON.stringify(json)
        File.write('output/test/documentList.json', str)

        console.log(json)
    })

    test('GET a document', async () => {
        const res = await HttpRequest.get(`${host}/documents/000000000000000000000000000606?docVer=001&plantCode=6000`)
        const json = res.json()

        const str = JSON.stringify(json)
        File.write('output/test/document.json', str)

        console.log(json)
    })

    test('GET document file', async () => {
        const res = await HttpRequest.get(`${host}/documents/000000000000000000000000000606/file?docVer=001`)
        const buffer = res.buffer()

        File.write('output/test/file.vsf', buffer)

        console.log(buffer.length)
    })

    test('GET subfolders', async () => {
        const res = await HttpRequest.get(`${host}/folders?parentId=000000000000000001`)
        const json = res.json()

        console.log(json)
    })

    test('search docs', async () => {
        const res = await HttpRequest.get(
            `${host}/search/documents?folderId=000000000000002111&docName=diagram&docNumber=001`
        )
        const json = res.json()

        console.log(json)
    })

    test('search equipments', async () => {
        const res = await HttpRequest.get(
            `${host}/search/equipments?folderId=000000000000002111&libId=00000000000000000535&tag=01A`
        )
        const json = res.json()
        console.log(json)
        console.log(json.length)
    })

    test('get symbols by plantCode', async () => {
        const res = await HttpRequest.get(`${host}/symbols?plantCode=5100`)
        const json = res.json()

        console.log(json)
    })

    test('get handle', async () => {
        const res = await HttpRequest.get(
            `${host}/handles?docId=000000000000000000000000002729&docVer=001&tagId=00000000000000001122`
        )
        const json = res.json()

        console.log(json)
    })

    test('get OPC', async () => {
        const docId = '000000000000000000000000002513'
        const docVer = '001'
        // 861B-15240-LM-106-001
        const connection = '8611-11520-OM-105-903G1'
        const intelligent = '8611-11520-OM-105-901A1'

        const res = await HttpRequest.get(
            `${host}/opc?docId=${docId}&docVer=${docVer}&connection=${connection}&intelligent=${intelligent}`
        )
        const json = res.json()
        const txt = JSON.stringify(json)
        console.log(txt)
    })

    test('equipmentLinks', async () => {
        const res = await HttpRequest.get(
            `${host}/equipmentLinks?docId=J1hkCHLDfhhgyUhHiYqd4MVz%2FeOj1HXJtCWXIyLsnvA%3D&docVer=OO8D6c0ecIsb2vZKQDpT7Q%3D%3D&plantCode=qD1Pjt8KI1U03tNluIhI7Q%3D%3D&handle=z4veDicGyjLMzCt2xS1ONQ%3D%3D`
        )

        const json = res.json()
        const txt = JSON.stringify(json)
        console.log(txt)
    })

    test('test search', async () => {
        const res = await HttpRequest.get(`${host}/search/documents?folderId=000000000000002100`)
        const json = res.json()
        const txt = JSON.stringify(json)
        console.log(txt)
    })

    test('exist user', async () => {
        const res = await HttpRequest.get(`${host}/users/userId001/exists`)

        expect(res.status).toEqual(200)
    })

    test('문서의 통지/오더 가져오기', async () => {
        const res = await HttpRequest.get(
            `${host}/documents/000000000000000000000000000606/notiorders?docVer=001&type=nocomplete`
        )
        const json = res.json()

        const str = JSON.stringify(json)
        // File.write('output/test/document.json', str)

        console.log(str)
    })

    test('관련문서 검색', async () => {
        const res = await HttpRequest.get(
            `${host}/search/related?folders=100000000000000001&name=ASSEMBLY&number=41320`
        )

        expect(res.status.code).toEqual(200)
    })

    test('관련문서 루트', async () => {
        const res = await HttpRequest.get(`${host}/relatedRoot`)

        expect(res.status.code).toEqual(200)
    })
    test('관련문서 종류', async () => {
        const res = await HttpRequest.get(`${host}/relatedFolders?parentId=100000000000000010`)

        expect(res.status.code).toEqual(200)
    })

    test('시그널 검색', async () => {
        const res = await HttpRequest.get(`${host}/search/signal?folderId=000000000000002761&docname=AIR&tagname=01A`)
        const json = res.json()
        console.log(json)
        console.log(json.length)
    })
})
