import { StatusCode, HttpRouter, HttpTransaction } from 'common'
import { SystemRepository } from './'

export function system(repo: SystemRepository): HttpRouter {
    const router = HttpRouter.create('/system')

    const createTables = async (): Promise<void> => {
        await repo.createUserTable()
        await repo.createMarkupTable()
        await repo.createMarkupSequence()
        await repo.createMydocs()
    }

    router.add('get', '/init', (tx: HttpTransaction): void => {
        createTables()
            .then(() => {
                const res = { status: StatusCode.Ok, body: { userTable: true } }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(e)
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/init/mydocs', (tx: HttpTransaction): void => {
        repo.createMydocs()
            .then(() => {
                const res = { status: StatusCode.Ok, body: { userTable: true } }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(e)
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('get', '/init/markup', (tx: HttpTransaction): void => {
        repo.deleteMarkupTable()
            .then(() => {
                repo.createMarkupTable()
                    .then(() => {
                        const res = { status: StatusCode.Ok, body: { markupTable: true } }
        
                        tx.reply(res)
                    })
                    .catch((e) => {
                        console.log(e)
                        tx.reply({ status: StatusCode.Error })
                    })
            })
            .catch((e) => {
                console.log(e)
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('delete', '/delete/do/not/use/mydocs', (tx: HttpTransaction): void => {
        repo.deleteMydocs()
            .then(() => {
                const res = { status: StatusCode.Ok, body: { userTable: true } }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(e)
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('delete', '/delete/do/not/use/users', (tx: HttpTransaction): void => {
        repo.deleteUserTable()
            .then(() => {
                const res = { status: StatusCode.Ok, body: { userTable: true } }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(e)
                tx.reply({ status: StatusCode.Error })
            })
    })

    router.add('delete', '/delete/do/not/use/markups', (tx: HttpTransaction): void => {
        repo.deleteMarkupTable()
            .then(() => {
                const res = { status: StatusCode.Ok, body: { userTable: true } }

                tx.reply(res)
            })
            .catch((e) => {
                console.log(e)
                tx.reply({ status: StatusCode.Error })
            })
    })

    return router
}
