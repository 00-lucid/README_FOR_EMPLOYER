import { Writable, Readable, Duplex } from 'stream'

export class NullStream extends Duplex {
    public static create(): NullStream {
        return new NullStream()
    }

    _read(): void {
        this.push(null)
    }

    _write(_chunk: unknown, _encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
        callback()
    }
}

export class BufferReadStream extends Readable {
    private buffer: Buffer

    public static fromObject(val: SafeObj): BufferReadStream {
        const str = JSON.stringify(val)
        const buffer = Buffer.from(str)

        return new BufferReadStream(buffer)
    }

    public static fromBuffer(val: Buffer): BufferReadStream {
        return new BufferReadStream(val)
    }

    private constructor(buffer: Buffer) {
        super()
        this.buffer = buffer
    }

    _read(): void {
        this.push(this.buffer)
        this.push(null)
    }
}

export class BufferWriteStream extends Writable {
    private readonly buffers: Buffer[]

    public static create(): BufferWriteStream {
        return new BufferWriteStream()
    }

    constructor() {
        super()
        this.buffers = []
    }

    public hasBuffer(): boolean {
        return this.buffers.length > 0
    }

    public getBuffer(): Buffer {
        return Buffer.concat(this.buffers)
    }

    _write(chunk: Buffer, _encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
        this.buffers.push(chunk)

        callback()
    }
}
