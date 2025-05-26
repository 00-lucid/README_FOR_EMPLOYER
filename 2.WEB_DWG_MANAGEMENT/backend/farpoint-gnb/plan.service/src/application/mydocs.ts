import { StatusCode, HttpRouter, HttpTransaction } from 'common'
import { MydocsService } from './'
import { decrypt as dec, MydocList } from '../types'

export function mydocs(service: MydocsService): HttpRouter {
    const router = HttpRouter.create('/mydocs')

    router.add('get', '/info', (tx: HttpTransaction): void => {
        tx.reply({
            status: StatusCode.Ok,
            body: { editable: service.canEdit() }
        })
    })

    router.add('get', '/folders', (tx: HttpTransaction): void => {
        const userId = dec(tx.query('userId') as string)

        if (userId) {
            service
                .getMydocs(userId)
                .then((body: MydocList[]) => {
                    const res = { status: StatusCode.Ok, body: body }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            console.log('userId가 존재하지 않음.')
            tx.reply({ status: StatusCode.Error })
        }
    })

    // 내문서 폴더 추가
    router.add('post', '/folders/:folderId', (tx: HttpTransaction): void => {
        const folderId = dec(tx.param('folderId'))
        const userId = dec(tx.query('userId') as string)

        if (userId && folderId) {
            const body = tx.body() as { folderName: string }

            service
                .addFolder(userId, folderId, body.folderName)
                .then((success: boolean) => {
                    const res = { status: success ? StatusCode.Ok : StatusCode.Error }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            console.log('userId가 존재하지 않음.')
            tx.reply({ status: StatusCode.Error })
        }
    })

    router.add('put', '/folders/:folderId', (tx: HttpTransaction): void => {
        const folderId = dec(tx.param('folderId'))
        const userId = dec(tx.query('userId') as string)

        if (userId && folderId) {
            const body = tx.body() as { newName: string }

            service
                .renameFolder(userId, folderId, body.newName)
                .then((success: boolean) => {
                    const res = { status: success ? StatusCode.Ok : StatusCode.Error }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            console.log('userId가 존재하지 않음.')
            tx.reply({ status: StatusCode.Error })
        }
    })

    router.add('delete', '/folders/:folderId', (tx: HttpTransaction): void => {
        const folderId = dec(tx.param('folderId'))
        const userId = dec(tx.query('userId') as string)

        if (userId && folderId) {
            service
                .deleteFolder(userId, folderId)
                .then((success: boolean) => {
                    const res = { status: success ? StatusCode.Ok : StatusCode.Error }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            console.log('userId가 존재하지 않음.')
            tx.reply({ status: StatusCode.Error })
        }
    })

    router.add('delete', '/files/:fileId', (tx: HttpTransaction): void => {
        const fileId = dec(tx.param('fileId'))
        const userId = dec(tx.query('userId') as string)

        if (userId && fileId) {
            service
                .deleteFile(userId, fileId)
                .then((success: boolean) => {
                    const res = { status: success ? StatusCode.Ok : StatusCode.Error }

                    tx.reply(res)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        } else {
            console.log('userId가 존재하지 않음.')
            tx.reply({ status: StatusCode.Error })
        }
    })

    // 내문서 파일 생성
    router.add('post', '/files', (tx: HttpTransaction): void => {
        const userId = dec(tx.query('userId') as string)

        const files = tx.files()

        const body = tx.body() as { folderId: string; userId: string }
        const folderId = dec(decodeURIComponent(body.folderId))

        if (userId && folderId && files) {
            const file = files['mydocFile']

            if (!Array.isArray(file)) {
                service
                    .uploadFile(userId, folderId, file.tempFilePath, file.name, file.size)
                    .then((success: boolean) => {
                        const res = { status: success ? StatusCode.Ok : StatusCode.Error }

                        tx.reply(res)
                    })
                    .catch((e) => {
                        console.log(JSON.stringify(e))
                        tx.reply({ status: StatusCode.Error })
                    })
            }
        } else {
            console.log('userId가 존재하지 않음.')
            tx.reply({ status: StatusCode.Error })
        }
    })

    // 내문서 파일 다운로드 (한수원)
    router.add('get', '/download/files', (tx: HttpTransaction): void => {
        const userId = dec(tx.query('userId') as string)
        const id = dec(tx.query('id') as string)
        const filename = dec(tx.query('filename') as string)

        if (userId && id && filename) {
            service
                .downloadFile(userId, id, filename)
                .then((path: any) => {
                    tx.replyFile(path, filename)
                })
                .catch((e) => {
                    console.log(JSON.stringify(e))
                    tx.reply({ status: StatusCode.Error })
                })
        }
        
    })

    return router
}
