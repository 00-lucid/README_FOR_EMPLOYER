import { OracledbCfg, Oracledb } from './Oracledb'
import { File } from 'common'

describe('152번 DB 테스트', () => {
    let db = Oracledb.prototype

    jest.setTimeout(150 * 1000)

    beforeAll(async () => {
        const cfgText = process.env['DB_CFG'] as string
        const cfg = JSON.parse(cfgText) as OracledbCfg

        db = await Oracledb.create(cfg)
    })

    test('select', async () => {
        const sSql =
            'SELECT A.FOLID,A.FOLNM,A.FOLPT FROM IDS_FOLDER A WHERE FOLID IN (' +
            "SELECT FOLID FROM IDS_ACL_FOLDER WHERE ACLTP = '001' GROUP BY FOLID) " +
            'ORDER BY A.FOLLV, A.PLANTCODE, A.FOLPT, A.SEQ'

        const values = await db.query(sSql)

        expect(values[0]).toEqual({
            FOLID: '000000000000000001',
            FOLNM: 's-P&ID도면',
            FOLPT: null
        })
    })

    test('create/update/delete', async () => {
        try {
            const sSql1 = `CREATE TABLE UserContexts ( userId VARCHAR2(100) NOT NULL, context LONG NOT NULL, primary key (userId) )`
            await db.command(sSql1)

            const insert = `INSERT INTO UserContexts ( userId, context ) VALUES ( 'userid00001', 'adfhadksjfhdsjfhsdjfh' )`
            const res1 = await db.command(insert)
            console.log(res1)

            const update = `UPDATE UserContexts SET context = 'abcd' WHERE userId = 'userid00001'`
            const res4 = await db.command(update)
            console.log(res4)

            const sSql3 = `select userId, context from UserContexts`
            const res2 = await db.query(sSql3)
            console.log(res2)

            const sSql4 = `drop table UserContexts`
            await db.command(sSql4)
        } catch (error) {
            console.log(error)
        }
    })

    test('insert/query CLOB', async () => {
        await db.command(`DROP TABLE no_example`)
        await db.command(`CREATE TABLE no_example (ID NUMBER, DATA VARCHAR2(20), BIGTEXT CLOB)`)

        Path.remkdir('output/test')
        const largeFile = 'output/test/large.txt'

        await File.createChunk(largeFile, 1 * 1024 * 1024)

        const bigData = File.read(largeFile)
        const bigText = bigData.toString('utf8')

        const query = `INSERT INTO no_example VALUES (:ID, :DATA, :BIGTEXT)`
        const opts = [
            { key: 'ID', type: 'number' },
            { key: 'DATA', type: 'string', maxSize: 20 },
            { key: 'BIGTEXT', type: 'clob', maxSize: 10 * 1024 * 1024 }
        ]
        const write = [
            { ID: 101, DATA: 'Alpha1', BIGTEXT: bigText },
            { ID: 102, DATA: 'Alpha2', BIGTEXT: bigText },
            { ID: 103, DATA: 'Alpha3', BIGTEXT: bigText }
        ]

        const result = await db.insert(query, opts, write)
        expect(result).toEqual(3)

        const query2 = 'select id,data,BIGTEXT from no_example'

        const read = (await db.getClob(query2)) as { BIGTEXT: string }[]

        expect(read.length).toEqual(3)
        expect(read[0].BIGTEXT.length).toEqual(1 * 1024 * 1024)
    })
})
