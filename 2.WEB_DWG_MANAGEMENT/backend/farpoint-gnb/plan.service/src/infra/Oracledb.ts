/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import OracleDB from 'oracledb'

export type CommandResult = { affectedRows: number; insertId: number; warningStatus: number }

export const NumberType = OracleDB.NUMBER
export const ClobType = OracleDB.CLOB
export const StringType = OracleDB.STRING

export type OracledbCfg = {
    user: string
    password: string
    host: string
    port: number
    database: string
}

process.env.ORA_SDTZ = 'UTC'

export class Oracledb {
    public static async create(config: OracledbCfg): Promise<Oracledb> {
        const connCfg = {
            user: config.user,
            password: config.password,
            connectString: `${config.host}:${config.port}/${config.database}`,
            externalAuth: false
        }

        const pool = await OracleDB.createPool(connCfg)

        // setting - CLOB to String
        OracleDB.fetchAsString = [OracleDB.CLOB]

        return new Oracledb(pool)
    }

    private readonly pool: OracleDB.Pool

    private constructor(pool: OracleDB.Pool) {
        this.pool = pool
    }

    public async close(): Promise<void> {
        await this.pool.close()
    }

    public async query(query: string): Promise<SafeObj[]> {
        console.log(query)
        const conn = await this.pool.getConnection()

        try {
            const options = {
                outFormat: OracleDB.OUT_FORMAT_OBJECT, // query result format
                // extendedMetaData: true,               // get extra metadata
                // prefetchRows:     100,                // internal buffer allocation size for tuning
                fetchArraySize: 100 // internal buffer allocation size for tuning
            }
            const res = await conn.execute(query, {}, options)
            const values = res.rows as SafeObj[]
            if (0 < values.length) {
                console.log('length', values.length)
                console.log('values[0]', values[0])
            } else {
                console.log('no results found')
            }
            return values
        } finally {
            if (conn) await conn.release()
        }
    }

    public async getBlob(query: string): Promise<Buffer> {
        const conn = await this.pool.getConnection()

        try {
            const options = { outFormat: OracleDB.OUT_FORMAT_ARRAY }

            const res = await conn.execute(query, {}, options)

            const values = res.rows as [OracleDB.Lob[]]

            if (values.length !== 1) throw '조건에 맞는 데이터가 없음'
            if (values[0].length !== 1) throw 'blob을 위한 query의 column은 단일이어야 한다.'

            return (await values[0][0].getData()) as Buffer
        } finally {
            if (conn) await conn.release()
        }
    }

    public async getBlobs(query: string): Promise<Map<string, Buffer>> {
        const conn = await this.pool.getConnection()

        try {
            const options = { outFormat: OracleDB.OUT_FORMAT_ARRAY }
            const res = await conn.execute(query, {}, options)

            const rows = res.rows as [string, OracleDB.Lob[]]
            let result = new Map<string, Buffer>()
            if (rows) {
                for (const row of rows) {
                    const imgName = row[0]
                    const Lob = row[1]
                    if (typeof Lob !== 'string' && typeof imgName === 'string') {
                        const imgBuffer = (await Lob.getData()) as Buffer
                        result.set(imgName, imgBuffer)
                    }
                }
            }
            return result
        } finally {
            if (conn) await conn.release()
        }
    }

    public async command(query: string): Promise<number> {
        const conn = await this.pool.getConnection()

        try {
            const res = (await conn.execute(
                query,
                {},
                {
                    autoCommit: true
                }
            )) as CommandResult

            return res.affectedRows
        } finally {
            if (conn) await conn.release()
        }
    }

    public async getClob(query: string): Promise<unknown[]> {
        const conn = await this.pool.getConnection()

        try {
            const options = { outFormat: OracleDB.OUT_FORMAT_OBJECT }

            const res = await conn.execute(query, {}, options)

            const values: unknown[] = []

            if (res.metaData && res.rows) {
                for (const row of res.rows) {
                    const keyval = new Map<string, string | number>()

                    for (const [key, value] of Object.entries(row as object)) {
                        if (typeof value === 'string' || typeof value === 'number') {
                            keyval.set(key, value)
                        } else if (typeof value === 'object') {
                            const text = (await value.getData()) as string
                            keyval.set(key, text)
                        }
                    }

                    const value = Object.fromEntries(keyval)
                    values.push(value)
                }
            }

            return values
        } finally {
            if (conn) await conn.release()
        }
    }

    public async insert(
        query: string,
        opts: { key: string; type: string; maxSize?: number }[],
        values: Record<string, string | number>[]
    ): Promise<number> {
        const conn = await this.pool.getConnection()

        try {
            const newOpts = new Map<string, { type: number; maxSize?: number }>()

            for (const opt of opts) {
                if (opt.type === 'number') {
                    newOpts.set(opt.key, { type: OracleDB.NUMBER })
                } else if (opt.type === 'string') {
                    newOpts.set(opt.key, { type: OracleDB.STRING, maxSize: opt.maxSize })
                } else if (opt.type === 'clob') {
                    newOpts.set(opt.key, { type: OracleDB.CLOB, maxSize: opt.maxSize })
                }
            }

            const options = {
                autoCommit: true,
                bindDefs: Object.fromEntries(newOpts)
            }

            const result = await conn.executeMany(query, values, options)

            return result.rowsAffected ?? 0
        } finally {
            if (conn) await conn.release()
        }
    }

    public async update(
        query: string,
        opts: { key: string; type: string; maxSize?: number }[],
        values: Record<string, string | number>[]
    ): Promise<number> {
        const conn = await this.pool.getConnection()

        try {
            const newOpts = new Map<string, { type: number; maxSize?: number }>()

            for (const opt of opts) {
                if (opt.type === 'number') {
                    newOpts.set(opt.key, { type: OracleDB.NUMBER })
                } else if (opt.type === 'string') {
                    newOpts.set(opt.key, { type: OracleDB.STRING, maxSize: opt.maxSize })
                } else if (opt.type === 'clob') {
                    newOpts.set(opt.key, { type: OracleDB.CLOB, maxSize: opt.maxSize })
                }
            }

            const options = {
                autoCommit: true,
                bindDefs: Object.fromEntries(newOpts)
            }
            console.log('update:', query, ' values:', values, ' options:', options)
            // return 1
            const result = await conn.executeMany(query, values, options)

            return result.rowsAffected ?? 0
        } finally {
            if (conn) await conn.release()
        }
    }

    public async execute(query: string, opts: any): Promise<any> {
        const conn = await this.pool.getConnection()

        try {
            await conn.execute(query, opts, {
                autoCommit: true
            })
        } finally {
            if (conn) await conn.release()
        }
    }
}
