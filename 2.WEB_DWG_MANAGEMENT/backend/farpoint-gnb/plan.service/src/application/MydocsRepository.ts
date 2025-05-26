import { Oracledb } from '../infra'
import { MydocList } from '../types'

export class MydocsRepository {
    public static create(db: Oracledb): MydocsRepository {
        return new MydocsRepository(db)
    }

    private constructor(db: Oracledb) {
        this.db = db
    }

    private readonly db: Oracledb

    public async getMydocs(userId: string): Promise<MydocList[]> {
        const sql = `select userId as "userId", context as "context" from Mydocs where userId = '${userId}'`

        const res = (await this.db.getClob(sql)) as { userId: string; context: string }[]

        const allList = JSON.parse(res[0].context) as MydocList[]

        return allList
    }

    public async addMydocs(userId: string): Promise<void> {
        const context = JSON.stringify([
            {
                id: 'root',
                folderName: userId,
                subfolders: [],
                documents: []
            }
        ])

        const sql = `INSERT INTO Mydocs e ( userId, context ) VALUES ( '${userId}', '${context}' )`
        await this.db.command(sql)
    }

    public async updateMydocs(userId: string, context: MydocList[]): Promise<boolean> {
        const text = JSON.stringify(context)

        const query = `UPDATE Mydocs SET context = :CONTEXT WHERE userId = '${userId}'`
        const opts = [{ key: 'CONTEXT', type: 'clob', maxSize: 1 * 1024 * 1024 }]
        const write = [{ CONTEXT: text }]

        const res = await this.db.insert(query, opts, write)

        return 0 < res
    }
}
