import { Request, Response } from 'express'
import { Base64 } from '../Base64'
import fileUpload from 'express-fileupload'

declare global {
    type HttpQuery = { [key: string]: string }
}

export enum StatusCode {
    Ok = 200,
    Create = 201,
    Error = 400,
    NotFound = 404
}

type HttpHeader = {
    name: string
    value: number | string | ReadonlyArray<string>
}

type HttpResponse = {
    status: StatusCode
    headers?: HttpHeader[]
    body?: SafeObj | SafeObj[] | Buffer
}

export class HttpTransaction {
    public static create(req: Request, res: Response): HttpTransaction {
        return new HttpTransaction(req, res)
    }

    private constructor(req: Request, res: Response) {
        this.req = req
        this.res = res
    }

    private readonly req: Request
    private readonly res: Response

    public files(): fileUpload.FileArray | undefined {
        return this.req.files
    }

    public clientIp(): string {
        return this.req.ip
    }

    public text(): string {
        return JSON.stringify(this.body())
    }

    public body(): SafeObj {
        return this.req.body as SafeObj
    }

    public query(name: string): string | undefined {
        const value = this.req.query[name] as string

        if (value === undefined) {
            return undefined
        }

        return value
    }

    public param(name: string): string {
        return this.req.params[name]
    }

    public method(): string {
        return this.req.method
    }

    public path(): string {
        return this.req.path
    }

    public replyBuffer(res: HttpResponse): void {
        if (res.body instanceof Buffer) {
            const contents = Base64.encode(res.body)

            this.res.status(res.status).json({ contents: contents })
        }
    }

    public replyBufferPdf(res: Buffer): void {
        this.res.contentType('application/pdf')
        this.res.send(res)
    }

    public replyFile(file: string, filename: string | undefined): void {
        if (filename) {
            this.res.status(StatusCode.Ok).download(file, filename)
            return
        }

        this.res.status(StatusCode.Ok).download(file)
    }

    public reply(res: HttpResponse): void {
        for (const header of res.headers ?? []) {
            this.res.setHeader(header.name, header.value)
        }

        if (res.body === undefined) {
            this.res.status(res.status).end()
        } else {
            this.res.status(res.status).json(res.body)
        }
    }

    public replyStream(stream: any): void {
        stream.pipe(this.res)
    }

    public redirect(url: string): void {
        this.res.redirect(url)
    }
}
