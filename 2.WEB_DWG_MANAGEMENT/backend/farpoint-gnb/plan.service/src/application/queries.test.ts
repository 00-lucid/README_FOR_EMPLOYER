import { OracledbCfg, Oracledb } from '../infra'

describe('152번 DB 테스트', () => {
    let db = Oracledb.prototype

    jest.setTimeout(15 * 1000)

    beforeAll(async () => {
        const cfgText = process.env['DB_CFG'] as string
        const cfg = JSON.parse(cfgText) as OracledbCfg

        db = await Oracledb.create(cfg)
    })

    test('도면 폴더(관리자, m_Folder_Authority == "000001")', async () => {
        // {
        //     FOLID: '000000000000000001',
        //     FOLNM: 's-P&ID도면',
        //     FOLPT: null,
        //     FOLLV: '0',
        //     SEQ: 1
        // }
        // {
        //     FOLID: '000000000000002210',
        //     FOLNM: 'GT',
        //     FOLPT: '000000000000002200',
        //     FOLLV: '2',
        //     SEQ: 1
        // }
        const sSql =
            'SELECT A.FOLID as "folderId",A.FOLNM as "name",A.FOLPT as "parent",A.FOLLV,A.SEQ FROM IDS_FOLDER A WHERE FOLID IN (' +
            "SELECT FOLID FROM IDS_ACL_FOLDER WHERE ACLTP = '001' GROUP BY FOLID) " +
            'ORDER BY A.FOLLV, A.PLANTCODE, A.FOLPT, A.SEQ'

        const values = await db.query(sSql)
        console.log(values.length)
        console.log(values)
    })

    test('도면폴더에 도면리스트 추가', async () => {
        // {
        //     DOCNO: '000000000000000000000000001296',
        //     DOCVR: '001',
        //     DOCNM: 'KEY SINGLE LINE DIAGRAM (INCLUDING UPS, DC SYSTEM)',
        //     FOLID: '000000000000002759',
        //     DOCNUMBER: '0-21000-OE-140-003',
        //     PLANTCODE: '5900',
        //     PIPEDOC_YN: '001',
        //     PIPE_YN: null
        // }
        const sSql = `SELECT DOCNO as "docId",DOCVR as "docVer",DOCNM as "name",FOLID as "folderId",DOCNUMBER as "number",PLANTCODE as "plantCode" FROM IDS_DOC WHERE CURRENT_YN = '001' ORDER BY DOCNUMBER`

        const values = await db.query(sSql)
        console.log(values.length)
        console.log(values[0])
    })

    test('도면 파일(BLOB)', async () => {
        const DocNo = '000000000000000000000000002508'
        const DocVR = '001'
        const sSql = "SELECT DOCCT FROM IDS_DOC WHERE DOCNO = '" + DocNo + "' AND DOCVR = '" + DocVR + "'"

        const values = await db.getBlob(sSql)
        console.log(values.length)

        expect(values.length).toBeGreaterThan(0)
    })

    test('기기심볼 폴더', async () => {
        const m_DOCNO = '000000000000000000000000002508'
        const m_DOCVR = '001'
        const m_PlantCode = '5100'

        //기기심볼 폴더
        const sSql =
            'SELECT B.LIBNO as "libId", B.LIBNM as "libName", B.LIBDS as "libDesc", B.LIBPT as "parent", B.LIBLV, A.DOCNO FROM IDS_TAG A, IDS_LIB B ' +
            "WHERE A.DOCNO = '" +
            m_DOCNO +
            "' AND A.DOCVR = '" +
            m_DOCVR +
            "' " +
            "AND B.LIBLV != '9' AND B.PLANTCODE = '" +
            m_PlantCode +
            "' AND A.GUBUN = 'Y' AND A.LIBNO = B.LIBNO " +
            'GROUP BY B.LIBNO, B.LIBNM, B.LIBDS, B.LIBPT, B.LIBLV, A.DOCNO ' +
            'UNION ALL ' +
            "SELECT LIBNO, LIBNM, LIBDS, LIBPT, LIBLV, '' AS DOCNO FROM IDS_LIB WHERE PLANTCODE = '" +
            m_PlantCode +
            "' AND LIBLV != '9' AND LIBDS = 'VALVE' " +
            'AND LIBNO IN ' +
            '    (SELECT LIBPT FROM ' +
            '    IDS_TAG A, IDS_LIB B ' +
            "    WHERE A.DOCNO = '" +
            m_DOCNO +
            "' AND A.DOCVR = '" +
            m_DOCVR +
            "' " +
            "    AND A.DOCVR = '001' AND B.LIBLV != '9' AND B.PLANTCODE = '" +
            m_PlantCode +
            "' AND A.GUBUN = 'Y' AND A.LIBNO = B.LIBNO " +
            '    GROUP BY B.LIBPT) ' +
            ''

        const values = await db.query(sSql)
        console.log(values.length)
        console.log(values)
        // {
        //     LIBNO: '00000000000000000579',
        //     LIBNM: 'BUTTERFLY',
        //     LIBDS: 'BUTTERFLY',
        //     LIBPT: '00000000000000000519',
        //     LIBLV: '2',
        //     DOCNO: '000000000000000000000000002508'
        // }
    })

    test('기기심볼폴더에 설비 추가', async () => {
        const sSql = `SELECT B.LIBNO as "libId", B.LIBNM as "libName", B.LIBDS as "libDesc", B.LIBPT as "parent" FROM IDS_TAG A, IDS_LIB B WHERE A.DOCNO = '000000000000000000000000002508' AND A.DOCVR = '001' AND B.LIBLV != '9' AND B.PLANTCODE = '5100' AND A.GUBUN = 'Y' AND A.LIBNO = B.LIBNO GROUP BY B.LIBNO, B.LIBNM, B.LIBDS, B.LIBPT, B.LIBLV, A.DOCNO UNION ALL SELECT LIBNO, LIBNM, LIBDS, LIBPT, LIBLV, '' AS DOCNO FROM IDS_LIB WHERE PLANTCODE = '5100' AND LIBLV != '9' AND LIBDS = 'VALVE' AND LIBNO IN     (SELECT LIBPT FROM     IDS_TAG A, IDS_LIB B     WHERE A.DOCNO = '000000000000000000000000002508' AND A.DOCVR = '001'     AND A.DOCVR = '001' AND B.LIBLV != '9' AND B.PLANTCODE = '5100' AND A.GUBUN = 'Y' AND A.LIBNO = B.LIBNO     GROUP BY B.LIBPT) ORDER BY "libDesc"`

        const values = await db.query(sSql)
        console.log(values.length)
        console.log(values)
        // {
        //     TAGNO: '00000000000000001031',
        //     LIBDS: 'BUTTERFLY',
        //     LIBNO: '00000000000000000579',
        //     DOCVR: '001',
        //     INTELLIGENT: 'AHZY363',
        //     FUNCTION: '12-11540-J-AH-FV-363'
        // }
    })

    test('문서 정보', async () => {
        const docId = '000000000000000000000000002508'
        const docVer = '001'
        const plantCode = '5100'

        const sSql =
            `SELECT DOCNO as "docId",DOCVR as "docVer",DOCNM as "docName",DOCNUMBER as "docNumber",PLANTCODE as "plantCode" FROM IDS_DOC ` +
            `WHERE PLANTCODE = '${plantCode}' AND DOCNO = '${docId}' AND DOCVR = '${docVer}' ORDER BY DOCNUMBER`

        const values = await db.query(sSql)
        console.log(values.length)
        console.log(values[0])
        expect(values.length).toBeGreaterThan(0)
    })

    test('마크업 큰 스트링 쓰기(CLOB)', async () => {
        // const sql2 = `SELECT * FROM MarkupContents`
        // const values2 = await db.query(sql2)
        // console.log(values2)
        // console.log('values2')
        // const sql = `INSERT INTO MarkupContents
        // (SEQ,USERID,DOCID,DOCVER,PLANTCODE,TITLE,PATHS,ISPUBLIC,CREATE_DATE)
        // VALUES
        // (SEQ_MARKUP.NEXTVAL,:USERID,:DOCID,:DOCVER,:PLANTCODE,:TITLE,:PATHS,:ISPUBLIC,SYSDATE)`
        // const values = await db.insert('sql', '{}')
        // console.log(values)
        // const sql2 = `SELECT * FROM MarkupContents`
        // const values2 = await db.query(sql2)
        // console.log(values2)
        // expect(values.length).toBeGreaterThan(0)
    })

    test('마크업 큰 스트링 읽기(CLOB)', async () => {
        const docId = 'Idabcde'
        const docVer = 'Verabcde'
        const plantCode = 'plantCodeVerabcde'
        const userId = 'UserIDavbcjdjf'

        const sql = `SELECT SEQ as "seq",USERID as "userId",DOCID as "docId",DOCVER as "docVer",PLANTCODE as "plantCode",
        TITLE as "title",PATHS as "paths",ISPUBLIC as "isPublic", TO_CHAR(CREATE_DATE, 'YYYY-MM-DD HH24:MI') AS "createDate"
        FROM MarkupContents
        WHERE DOCID='${docId}' AND DOCVER='${docVer}' AND PLANTCODE='${plantCode}' AND (USERID = '${userId}' OR ISPUBLIC = 1)
        ORDER BY SEQ DESC`

        const values = await db.query(sql)
        console.log(values.length)

        // expect(values.length).toBeGreaterThan(0)
    })

    test('TEST', async () => {
        const sql = `
        SELECT a.DOKAR, a.DOKNR,a.DOKTL, a.DOKVR, a.DKTXT, a.ZZCHANGEDATE, a.EGUBUN, a.FGUBUN, b.FOLNM as DOKARNM
        FROM IDS_LT_DRAW a, (select PLANTCODE,FOLNM from IDS_FOLDER where FOLLV ='3' and APP_GUBUN='002') b
        WHERE a.DOKAR = b.PLANTCODE
        AND a.DOKAR in (select PLANTCODE from IDS_FOLDER where FOLLV ='3' and APP_GUBUN='002' and FOLPH LIKE '%100000000000000001%' )
        AND UPPER(a.DOKNR) LIKE UPPER('%862A-81100-E-152-001%') AND ROWNUM <= 1000`

        const values = await db.query(sql)
        console.log(JSON.stringify(values))
    })
})
