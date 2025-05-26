import { Router, Request, Response } from 'express'
import { HttpTransaction } from './HttpTransaction'

type Method = 'get' | 'post' | 'put' | 'delete'
type RouterDelegate = (tx: HttpTransaction) => void

export class HttpRouter {
    public static create(namespace: string): HttpRouter {
        const handle = Router()

        return new HttpRouter(namespace, handle)
    }

    public readonly namespace: string
    public readonly handle: Router

    private constructor(namespace: string, handle: Router) {
        this.namespace = namespace
        this.handle = handle
    }

    public add(method: Method, path: string, delegate: RouterDelegate): void {
        const callback = (req: Request, res: Response): void => {
            const tx = HttpTransaction.create(req, res)

            delegate(tx)
        }

        switch (method) {
            case 'get':
                this.handle.get(path, callback)
                break
            case 'post':
                this.handle.post(path, callback)
                break
            case 'put':
                this.handle.put(path, callback)
                break
            case 'delete':
                this.handle.delete(path, callback)
                break
            default:
                error('not implemented, ' + __filename)
        }
    }
}
