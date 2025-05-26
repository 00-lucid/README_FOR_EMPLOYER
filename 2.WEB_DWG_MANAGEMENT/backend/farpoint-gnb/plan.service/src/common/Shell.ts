import { spawn } from 'child_process'
import { Readable, Writable } from 'stream'
import { BufferWriteStream } from '.'

export class Shell {
    public static exec(command: string): Promise<string>
    public static exec(command: string, opts: { input?: Readable; output?: Writable }): Promise<void>
    public static exec(command: string, opts?: { input?: Readable; output?: Writable }): unknown {
        return new Promise((resolve, reject) => {
            try {
                const process = spawn(command, {
                    shell: true
                })

                const stream = BufferWriteStream.create()

                if (opts === undefined) {
                    process.stdout.pipe(stream)
                } else {
                    if (opts.input !== undefined) {
                        opts.input?.pipe(process.stdin)
                    }

                    if (opts.output !== undefined) {
                        process.stdout.pipe(opts.output)
                    }
                }

                let errMsg = ''

                process.stderr.on('data', (data: Buffer) => {
                    errMsg = data.toString('utf8')
                })

                process.on('close', (code: number) => {
                    if (code === 0) {
                        const buffer = stream.getBuffer()
                        resolve(buffer.toString())
                    } else {
                        error(`${errMsg}, code=${code}`, reject)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}
