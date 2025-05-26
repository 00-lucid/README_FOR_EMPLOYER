import compression from 'compression'
import errorHandler from 'errorhandler'
import express from 'express'
import cors from 'cors'
import { Server, createServer } from 'http'
import { HttpRouter } from './'
import fileUpload from 'express-fileupload'
import MorganUtil from '../morgan'

export class HttpServer {
    public static create(
        routers: HttpRouter[],
        staticFiles: { prefix: string; path: string }[] = [],
        tempFileDir = '/tmp'
    ): HttpServer {
        const app = express()
        app.use(
            cors({
                credentials: true, // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
                origin: true // 출처 허용 옵션
            })
        )
        app.use(compression())
        app.use(errorHandler())
        // log
        MorganUtil(app)

        app.use(express.json({ limit: '100mb' })) // limit: set body size
        app.use(express.urlencoded({ limit: '100mb', extended: false })) // limit: set url size
        // default options
        app.use(
            fileUpload({
                limits: { fileSize: 50 * 1024 * 1024 },
                useTempFiles: true,
                tempFileDir
            })
        )

        for (const file of staticFiles) {
            app.use(file.prefix, express.static(file.path))
        }

        for (const router of routers) {
            app.use(router.namespace, router.handle)
        }

        const server = createServer(app)

        return new HttpServer(server)
    }

    private readonly server: Server

    private constructor(server: Server) {
        this.server = server
    }

    public start(port: number): void {
        this.server.on('error', (err?: NodeJS.ErrnoException) => {
            if (typeof err !== 'undefined') {
                if (err.syscall !== 'listen') {
                    throw err
                }

                switch (err.code) {
                    case 'EACCES':
                        error(`Port ${port} requires elevated privileges`)
                    // eslint-disable-next-line no-fallthrough
                    case 'EADDRINUSE':
                        error(`Port ${port} is already in use!`)
                    // eslint-disable-next-line no-fallthrough
                    default:
                        error(err.message)
                }
            }
        })

        this.server.listen(port, () => {
            console.log('Listening...')
        })
    }

    public stop(): void {
        if (this.server.listening) {
            this.server.close()
        }
    }
}
