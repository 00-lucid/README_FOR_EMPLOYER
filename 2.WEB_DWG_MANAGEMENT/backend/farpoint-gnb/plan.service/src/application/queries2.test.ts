import { OracledbCfg, Oracledb } from '../infra'

describe('검색 쿼리 테스트', () => {
    let db = Oracledb.prototype

    jest.setTimeout(1500 * 1000)

    beforeAll(async () => {
        const cfgText = process.env['DB_CFG'] as string
        const cfg = JSON.parse(cfgText) as OracledbCfg

        db = await Oracledb.create(cfg)
    })

    test('사업소, 발전소, 호기 트리', async () => {
        const sSql =
            'SELECT A.FOLID as "folderId",A.FOLNM as "name",A.FOLPT as "parent", A.PLANTCODE as "plantCode" FROM IDS_FOLDER A WHERE FOLID IN (' +
            "SELECT FOLID FROM IDS_ACL_FOLDER WHERE ACLTP = '001' GROUP BY FOLID) AND A.FOLPT = " +
            "'000000000000000001'" +
            'ORDER BY A.FOLLV, A.PLANTCODE, A.FOLPT, A.SEQ'

        const results = await db.query(sSql)
        console.log(results)
    })

    test('도면 검색', async () => {
        const sSql =
            "SELECT CASE A.HOGI_GUBUN WHEN '0' THEN '0' WHEN 'L' THEN 'Legend' ELSE A.HOGI_GUBUN END AS HOGI_GUBUN, B.DOCNUMBER, B.DOCNM, B.DOCNO, B.DOCVR, B.FOLID, A.PLANTCODE " +
            'FROM IDS_FOLDER A, IDS_DOC B ' +
            "WHERE A.APP_GUBUN = '001' AND A.FOLID = B.FOLID AND B.CURRENT_YN = '001' AND B.FOLID IN " +
            "('000000000000002111','000000000000002112')" +
            ` AND UPPER(B.DOCNUMBER) LIKE '%001%' ` +
            ` AND UPPER(B.DOCNM) LIKE '%1&2%' ` +
            'ORDER BY DOCNUMBER, HOGI_GUBUN '

        const results = await db.query(sSql)
        console.log(results.length)
        console.log(results)
    })

    test('설비 검색', async () => {
        const sSql =
            'SELECT C.PLANTCODE as "plantCode", C.DOCNUMBER as "docNumber", C.HOGI_GUBUN as "hogi", D.FUNCTION as "function", C.DOCNO as "docId", C.DOCVR as "docVer", C.DOCNM as "docName", C.FOLID as "folderId", D.TAGNO as "tagId" FROM (' +
            "SELECT CASE A.HOGI_GUBUN WHEN '0' THEN '0' WHEN 'L' THEN 'Legend' ELSE A.HOGI_GUBUN END AS HOGI_GUBUN, A.PLANTCODE, B.DOCNO, B.DOCVR, B.DOCNM, B.DOCNUMBER, B.FOLID FROM IDS_FOLDER A, IDS_DOC B " +
            "WHERE A.APP_GUBUN = '001' AND A.FOLID = B.FOLID AND B.CURRENT_YN = '001' AND B.FOLID IN " +
            "('000000000000002111')" +
            " ) C, IDS_TAG D WHERE C.DOCNO = D.DOCNO AND C.DOCVR = D.DOCVR AND D.GUBUN = 'Y' " +
            ` AND UPPER(D.FUNCTION) LIKE '%01A%' ` + //TAG
            ` AND D.LIBNO = '00000000000000000535' ` + //SYMBOL
            ` ORDER BY FUNCTION, DOCNUMBER, HOGI_GUBUN `

        const results = await db.query(sSql)
        console.log(results.length)
        console.log(results)
    })

    test('사업소의 기기심볼 목록', async () => {
        const sSql = `SELECT * FROM IDS_LIB B WHERE B.PLANTCODE = '5100' ORDER BY B.LIBDS`

        const values = await db.query(sSql)
        console.log(values.length)
        // console.log(values)
        // IDS_LIB
        // {
        //     TAGNO: '00000000000000001031',
        //     LIBDS: 'BUTTERFLY',
        //     LIBNO: '00000000000000000579',
        //     DOCVR: '001',
        //     INTELLIGENT: 'AHZY363',
        //     FUNCTION: '12-11540-J-AH-FV-363'
        // }
    })

    // {
    //     "tagId": "00000000000000000001",
    //     "libDesc": "OVER PAGE CONNECTOR",
    //     "libId": "00000000000000000545",
    //     "docVer": "001",
    //     "intelligent": "8611-11520-OM-105-901A1",
    //     "function": "8611-11520-OM-105-901A1",
    //     "connection": "8611-11520-OM-105-903G1",
    //     "handles": [
    //         {
    //             "handle": "53315",
    //             "tagType": "002"
    //         }
    //     ]
    // }

    //     "docName": "P&ID-Bottom Ash System Unit 1",
    //     "docNumber": "8611-11520-OM-105-903",
    //     "docId": "000000000000000000000000002513",
    //     "docVer": "001",
    //     "plantCode": "5100",

    test('OPC쿼리1', async () => {
        const docId = '000000000000000000000000002513'
        const docVer = '001'
        // const connection = '8611-11520-OM-105-903G1'
        // const intelligent = '8611-11520-OM-105-901A1'

        // 열어야 하는 문서, intelligent에서 추출
        const targetDocNumber = '861111520OM105901'

        const sql1 = `
            SELECT A.DOCNO,A.DOCVR,A.PLANTCODE,A.DOCNM,A.DOCNUMBER, B.FOLPT, B.HOGI_GUBUN
            FROM IDS_DOC A ,IDS_FOLDER B
            WHERE A.FOLID = B.FOLID
            AND REPLACE(A.DOCNUMBER,'-','') = '${targetDocNumber}'
            AND A.CURRENT_YN = '001'
            AND A.PLANTCODE = (SELECT PLANTCODE FROM IDS_DOC WHERE DOCNO = '${docId}' AND DOCVR = '${docVer}')
            ORDER BY B.HOGI_GUBUN `

        const values = await db.query(sql1)
        console.log(values)

        expect(values).toEqual([
            {
                DOCNO: '000000000000000000000000002511',
                DOCVR: '001',
                PLANTCODE: '5100',
                DOCNM: 'P&ID-Bottom Ash System Unit 1',
                DOCNUMBER: '8611-11520-OM-105-901',
                FOLPT: '000000000000002110',
                HOGI_GUBUN: '1'
            },
            {
                DOCNO: '000000000000000000000000004608',
                DOCVR: '001',
                PLANTCODE: '5100',
                DOCNM: 'P&ID-Bottom Ash System Unit 1',
                DOCNUMBER: '8611-11520-OM-105-901',
                FOLPT: '000000000000002110',
                HOGI_GUBUN: '2'
            }
        ])
    })

    test('OPC쿼리2', async () => {
        const docId = '000000000000000000000000002511'
        const docVer = '001'
        const intelligent = '8611-11520-OM-105-903G1'
        const connection = '8611-11520-OM-105-901A1'

        const sql2 = `SELECT DOCNO, TAGNO FROM IDS_TAG WHERE DOCNO = '${docId}' AND DOCVR = '${docVer}'
        AND REPLACE(INTELLIGENT,'-','') = '${intelligent.replace(/-/gi, '')}'
        AND REPLACE(CONNECTION,'-','') = '${connection.replace(/-/gi, '')}'`

        const values2 = await db.query(sql2)
        console.log(values2)
        console.log(intelligent.replace(/-/gi, ''))

        expect(values2).toEqual([
            {
                DOCNO: '000000000000000000000000002511',
                DOCVR: '001',
                TAGNO: '00000000000000000002',
                LIBNO: '00000000000000000545',
                INTELLIGENT: '8611-11520-OM-105-903G1',
                REGID: 'psn20823',
                REGDT: '2021-02-15 17:27:33',
                CONNECTION: '8611-11520-OM-105-901A1',
                GUBUN: 'Y',
                FUNCTION: '8611-11520-OM-105-903G1',
                MAP: 'Y',
                TAG_TYPE: '002',
                ORI_FUNCTION: null,
                FOLID: '000000000000002111'
            }
        ])
    })

    test('OPC쿼리3', async () => {
        // const sql2 = `SELECT A.DOCNO,A.DOCVR,A.PLANTCODE, A.DOCNM,A.DOCNUMBER, B.FOLPT, B.FOLID, B.HOGI_GUBUN
        // FROM IDS_DOC A ,IDS_FOLDER B
        // WHERE  A.FOLID = B.FOLID
        // AND REPLACE(A.DOCNUMBER,'-','') = 'KR101310LBH10&MFB03040230505'
        // AND A.CURRENT_YN = '001'
        // AND A.PLANTCODE = (SELECT PLANTCODE FROM IDS_DOC WHERE DOCNO = '000000000000000000000000000528' AND DOCVR = '001')
        // `
        const sql2 = `SELECT * FROM IDS_TAG WHERE INTELLIGENT LIKE 'KR101%'`
        const values2 = await db.query(sql2)
        console.log(values2)
    })

    test('Markup', async () => {
        const sql2 = `SELECT * FROM MarkupContents`
        const values2 = await db.query(sql2)

        console.log(values2)
    })

    test('관련문서 사업소', async () => {
        const sql2 = `SELECT FOLNM as TEXT, FOLID as VALUE, SEQ,FOLPT from IDS_FOLDER where APP_GUBUN ='002'
        and FOLPT = '100000000000000001'
        order by SEQ asc`
        const values2 = await db.query(sql2)

        console.log(values2)
    })

    test('관련문서 종류', async () => {
        const sql2 = `select FOLNM as TEXT, FOLID as VALUE, SEQ from IDS_FOLDER where APP_GUBUN ='002'
        and FOLPT = '100000000000000125'
        order by SEQ asc`
        const values2 = await db.query(sql2)

        console.log(values2)
    })

    test('관련문서 유형', async () => {
        const sql2 = `select FOLNM as TEXT, FOLID as VALUE, SEQ from IDS_FOLDER where APP_GUBUN ='002'
        and FOLPT = '100000000000000126'
        order by SEQ asc`
        const values2 = await db.query(sql2)

        console.log(values2)
    })

    test('관련문서 검색', async () => {
        const sql2 = `select * from (select a.DOKAR, a.DOKNR,a.DOKTL, a.DOKVR, a.DKTXT, a.ZZCHANGEDATE, a.EGUBUN, a.FGUBUN, b.FOLNM as DOKARNM, b.FOLPH,b.FOLID from IDS_LT_DRAW a
    ,(select PLANTCODE,FOLNM,FOLPH,FOLID from IDS_FOLDER where FOLLV ='3' and APP_GUBUN='002') b
where a.DOKAR = b.PLANTCODE and a.DOKAR in
    (select PLANTCODE from IDS_FOLDER where FOLLV ='3' and APP_GUBUN='002' and FOLPH LIKE '100000000000000001%' and FOLPH LIKE '%100000000000000111%')
order by a.DKTXT asc)  WHERE ROWNUM <= 5`
        const values2 = await db.query(sql2)

        console.log(values2)
    })

    test('관련문서 기본검색', async () => {
        // DOKARNM : 유형
        // DOKNR : 문서번호
        // DKTXT : 문서명
        const sql2 = `SELECT a.DOKAR, a.DOKNR,a.DOKTL, a.DOKVR, a.DKTXT, a.ZZCHANGEDATE, a.EGUBUN, a.FGUBUN, b.FOLNM as DOKARNM
        FROM IDS_LT_DRAW a, (select PLANTCODE,FOLNM from IDS_FOLDER where FOLLV ='3' and APP_GUBUN='002') b
        WHERE a.DOKAR = b.PLANTCODE
            AND a.DOKAR in (select PLANTCODE from IDS_FOLDER where FOLLV ='3' and APP_GUBUN='002' and FOLPH LIKE '%100000000000000001%')
            AND a.DOKNR LIKE '%41320%'
            AND a.DKTXT LIKE '%ASSEMBLY%'
        ORDER BY a.DKTXT asc`
        const values2 = await db.query(sql2)

        console.log(values2)
    })

    test('시그널 검색', async () => {
        const sql = `select a.SNO, a.TAG, a.DRAW_NM, a.PAGE, a.FILE_PATH, a.PLANTCODE, a.FILENM,
                    case when length(d.PLANTNM) > 5 then substr(d.PLANTNM,0,length(d.PLANTNM)-3) else substr(d.PLANTNM,0,2) end ||' '||
                    (select f.FOLNM from IDS_FOLDER f where f.FOLID = (select e.FOLPT from IDS_FOLDER e where e.FOLID = a.FOLID)) as PLANTNM
                    from IDS_SIGNAL a, IDS_SITE d
                    where
                    a.PLANTCODE = d.PLANTCODE
                    and d.FOLDER_TYPE = '003'
                    AND a.FOLID in ('000000000000002761','000000000000002788')
                    and a.PLANTCODE in ('6000', '')
                    and a.DRAW_NM like '%FLOW%'
                    order by a.DRAW_NM asc`
        const values2 = await db.query(sql)

        console.log(values2)
    })

    test('쿼리테스트', async () => {
        await db.command('drop table Mydocs')

        const sql = `CREATE TABLE Mydocs (
            userId VARCHAR2(1024) NOT NULL,
            context CLOB NOT NULL,
            primary key (userId)
        )`

        await db.command(sql)
    })
})
