/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import OracleDB from 'oracledb'

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

        return new Oracledb(pool)
    }

    private readonly pool: OracleDB.Pool

    public constructor(pool: OracleDB.Pool) {
        this.pool = pool
    }

    public async close(): Promise<void> {
        await this.pool.close()
    }

    public async query(query: string): Promise<unknown[]> {
        const conn = await this.pool.getConnection()

        try {
            const options = {
                outFormat: OracleDB.OUT_FORMAT_OBJECT // query result format
            }
            const res = await conn.execute(query, {}, options)

            return res.rows as unknown[]
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
}
