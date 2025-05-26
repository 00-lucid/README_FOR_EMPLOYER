import OracleDB from 'oracledb'
import { Oracledb } from '../infra'
import {
    EquipmentLink,
    SymbolResult,
    EquipmentResult,
    DocFolder,
    Document,
    EquipmentHandle,
    DocumentResult,
    DeleteMarkupValue,
    RelatedSearchResult,
    RelatedFolder,
    SearchSignalResult,
    UserContext,
    FavoriteEquipment,
    FavoriteDocument,
    RelatedFileInfo
} from '../types'

export type HandleList = {
    handle: string
    tagType: string
}

export type EquipmentFolder = {
    libId: string
    libName: string
    libDesc: string
    parent: string
    docVer: string
    intelligent: string
    function: string
    connection: string
    LIBLV: string
    DOCNO: string
    handle: string
    newHandle: HandleList[]
    tagType: string
    tagId: string
}

export type Equipment = {
    tagId: string
    tagType: string
    libDesc: string
    libId: string
    docVer: string
    intelligent: string
    function: string
    connection: string
}

export type UserInfo = { userId: string; deptCode: string; name: string }

export type NotiorderEquipment = {
    EQUIPMENT: string
    TAGNO: string
    FUNCTION: string
}

type Funcs = {
    FUNCTION: string
}

type DocumentInfo = {
    docId: string
    docVer: string
    plantCode: string
    docName: string
    folderId: string
    docNumber: string
}

function replaceSearchTerm(src: string): string {
    return src.replace(/%/gi, '!%').replace(/_/gi, '!_').replace(/'/gi, "''").toUpperCase()
}
function replaceSearchTermByLike(src: string): string {
    if (src.indexOf('*') !== -1)
        return `${src
            .replace(/%/gi, '!%')
            .replace(/_/gi, '!_')
            .replace(/'/gi, "''")
            .replace(/\*/gi, '%')
            .toUpperCase()}`
    else return `%${src.replace(/%/gi, '!%').replace(/_/gi, '!_').replace(/'/gi, "''").toUpperCase()}%`
}

type GetMarkupType = {
    seq: string
    userId: string
    docId: string
    docVer: string
    plantCode: string
    title: string
    paths: string[]
    isPublic: number
    createDate: string
}

type InsertMarkupType = {
    USERID: string
    DOCID: string
    DOCVER: string
    PLANTCODE: string
    TITLE: string
    PATHS: string
    ISPUBLIC: number
}

type UpdateMarkupType = {
    USERID: string
    DOCID: string
    DOCVER: string
    PLANTCODE: string
    TITLE: string
    PATHS: string
    ISPUBLIC: number
    SEQ: number
}

type InsertPMDCUserType = {
    USERID: string
    MEMO: string
    POSITION: string
    ID: string
}

export class DocumentRepository {
    public static create(db: Oracledb): DocumentRepository {
        return new DocumentRepository(db)
    }

    private constructor(db: Oracledb) {
        this.db = db
    }

    private readonly db: Oracledb

    public async getAllFolders(): Promise<DocFolder[]> {
        const sSql =
            'SELECT A.FOLID as "folderId",A.FOLNM as "folderName",A.FOLPT as "parent", A.PLANTCODE as "plantCode"  FROM IDS_FOLDER A WHERE FOLID IN (' +
            "SELECT FOLID FROM IDS_ACL_FOLDER WHERE ACLTP = '001' GROUP BY FOLID) " +
            'ORDER BY A.FOLLV, A.PLANTCODE, A.FOLPT, A.SEQ'

        const results = (await this.db.query(sSql)) as DocFolder[]

        return results
    }

    public async getSubFolders(parentId: string): Promise<DocFolder[]> {
        const sSql =
            'SELECT A.FOLID as "folderId",A.FOLNM as "folderName",A.FOLPT as "parent", A.PLANTCODE as "plantCode"  FROM IDS_FOLDER A WHERE FOLID IN (' +
            "SELECT FOLID FROM IDS_ACL_FOLDER WHERE ACLTP = '001' GROUP BY FOLID) AND A.FOLPT = '" +
            parentId +
            "' ORDER BY A.FOLLV, A.PLANTCODE, A.FOLPT, A.SEQ"

        const results = (await this.db.query(sSql)) as DocFolder[]

        return results
    }

    public async getDocumentList(): Promise<Document[]> {
        //const sSql = `SELECT DOCNO as "docId",DOCVR as "docVer",DOCNM as "docName",FOLID as "folderId",DOCNUMBER as "docNumber",PLANTCODE as "plantCode" FROM IDS_DOC WHERE CURRENT_YN = '001' ORDER BY DOCNUMBER`
        // 본사 한수원 서버에 존재하는 도면 리스트만 불러오기위한 임시 쿼리 수정
        const sSql = `SELECT DOCNO as "docId",DOCVR as "docVer",DOCNM as "docName",FOLID as "folderId",DOCNUMBER as "docNumber",PLANTCODE as "plantCode" FROM IDS_DOC WHERE CURRENT_YN = '001' AND DOCCT is not null ORDER BY DOCNUMBER`

        const results = (await this.db.query(sSql)) as Document[]

        return results
    }

    public async getEquipmentFolders(docId: string, docVer: string, plantCode: string): Promise<EquipmentFolder[]> {
        //기기심볼 폴더
        // const query =
        //     'SELECT B.LIBNO as "libId", B.LIBNM as "libName", B.LIBDS as "libDesc", B.LIBPT as "parent", B.LIBLV, A.DOCNO  FROM IDS_TAG A, IDS_LIB B ' +
        //     "WHERE A.DOCNO = '" +
        //     docId +
        //     "' AND A.DOCVR = '" +
        //     docVer +
        //     "' " +
        //     "AND B.LIBLV != '9' AND B.PLANTCODE = '" +
        //     plantCode +
        //     "' AND A.GUBUN = 'Y' AND A.LIBNO = B.LIBNO " +
        //     'GROUP BY B.LIBNO, B.LIBNM, B.LIBDS, B.LIBPT, B.LIBLV, A.DOCNO ' +
        //     'UNION ALL ' +
        //     "SELECT LIBNO, LIBNM, LIBDS, LIBPT, LIBLV, '' AS DOCNO FROM IDS_LIB WHERE PLANTCODE = '" +
        //     plantCode +
        //     "' AND LIBLV != '9' AND LIBDS = 'VALVE' " +
        //     'AND LIBNO IN ' +
        //     '    (SELECT LIBPT FROM ' +
        //     '    IDS_TAG A, IDS_LIB B ' +
        //     "    WHERE A.DOCNO = '" +
        //     docId +
        //     "' AND A.DOCVR = '" +
        //     docVer +
        //     "' " +
        //     "    AND A.DOCVR = '001' AND B.LIBLV != '9' AND B.PLANTCODE = '" +
        //     plantCode +
        //     "' AND A.GUBUN = 'Y' AND A.LIBNO = B.LIBNO " +
        //     '    GROUP BY B.LIBPT) ' +
        //     'ORDER BY "libDesc"'

        // const query = `
        //             SELECT T1.LIBNO AS "libId", T1.LIBNM AS "libName", T1.LIBDS AS "libDesc", T1.LIBPT AS "parent", T1.LIBLV, T1.DOCNO, T1.DOCVR AS "docVer"
        //                     , T1.INTELLIGENT AS "intelligent", T1.FUNCTION AS "function", T1.CONNECTION AS "connection"
        //                     , T2.TAGHANDLE AS "handle", T2.TAG_TYPE AS "tagType", T2.TAGNO AS "tagId"
        //             FROM (
        //                 SELECT B.LIBNO, B.LIBNM, B.LIBDS, B.LIBPT, B.LIBLV, A.DOCNO, A.TAGNO, A.TAG_TYPE, A.DOCVR, A.INTELLIGENT, A.FUNCTION, A.CONNECTION
        //                 FROM IDS_TAG A, IDS_LIB B
        //                 WHERE A.DOCNO = '${docId}' AND A.DOCVR = '${docVer}' AND B.LIBLV != '9' AND B.PLANTCODE = '${plantCode}' AND A.GUBUN = 'Y' AND A.LIBNO = B.LIBNO
        //                 GROUP BY B.LIBNO, B.LIBNM, B.LIBDS, B.LIBPT, B.LIBLV, A.DOCNO, A.TAGNO, A.TAG_TYPE, A.DOCVR, A.INTELLIGENT, A.FUNCTION, A.CONNECTION
        //                 UNION ALL
        //                 SELECT LIBNO, LIBNM, LIBDS, LIBPT, LIBLV, '' AS DOCNO, '' AS TAGNO, '' AS TAG_TYPE, '' AS DOCVR, '' AS INTELLIGENT, '' AS FUNCTION, '' AS CONNECTION
        //                 FROM IDS_LIB
        //                 WHERE PLANTCODE = '${plantCode}' AND LIBLV != '9' AND LIBDS = 'VALVE' AND LIBNO IN (
        //                     SELECT LIBPT FROM IDS_TAG A, IDS_LIB B
        //                     WHERE A.DOCNO = '${docId}' AND A.DOCVR = '${docVer}' AND A.DOCVR = '001' AND B.LIBLV != '9' AND B.PLANTCODE = '${plantCode}' AND A.GUBUN = 'Y' AND A.LIBNO = B.LIBNO
        //                     GROUP BY B.LIBPT
        //                 )
        //                 ORDER BY LIBDS
        //             ) T1 LEFT JOIN (
        //                                 SELECT LISTAGG(SUB.TAGHANDLE, '/') WITHIN GROUP (ORDER BY SUB.TAGNO) AS TAGHANDLE, SUB.TAG_TYPE, SUB.TAGNO
        //                                 FROM (
        //                                     SELECT A.TAGHANDLE, B.TAG_TYPE, A.TAGNO, A.DOCNO, A.DOCVR FROM IDS_TAG_DETAIL A, IDS_TAG B
        //                                         WHERE A.DOCNO = B.DOCNO AND A.DOCVR = B.DOCVR AND A.TAGNO = B.TAGNO AND A.DOCVR = '${docVer}' AND A.DOCNO = '${docId}'
        //                                     GROUP BY B.TAG_TYPE, A.TAGNO, A.DOCNO, A.DOCVR, A.TAGHANDLE
        //                                 ) SUB
        //                                 GROUP BY SUB.TAGNO, SUB.TAG_TYPE
        //                             ) T2 ON T2.TAGNO IN (T1.TAGNO)
        //             ORDER BY FUNCTION
        //             `

        const query = `
                    SELECT T1.LIBNO AS "libId", T1.LIBNM AS "libName", T1.LIBDS AS "libDesc", T1.LIBPT AS "parent", T1.LIBLV, T1.DOCNO, T1.DOCVR AS "docVer"
                            , T1.INTELLIGENT AS "intelligent", T1.FUNCTION AS "function", T1.CONNECTION AS "connection"
                            , T2.TAGHANDLE AS "handle", T2.TAG_TYPE AS "tagType", T2.TAGNO AS "tagId"
                    FROM (
                        SELECT B.LIBNO, B.LIBNM, B.LIBDS, B.LIBPT, B.LIBLV, A.DOCNO, A.TAGNO, A.TAG_TYPE, A.DOCVR, A.INTELLIGENT, A.FUNCTION, A.CONNECTION
                        FROM IDS_TAG A, IDS_LIB B 
                        WHERE A.DOCNO = '${docId}' AND A.DOCVR = '${docVer}' AND B.LIBLV != '9' AND B.PLANTCODE = '${plantCode}' AND A.GUBUN = 'Y' AND A.LIBNO = B.LIBNO 
                        GROUP BY B.LIBNO, B.LIBNM, B.LIBDS, B.LIBPT, B.LIBLV, A.DOCNO, A.TAGNO, A.TAG_TYPE, A.DOCVR, A.INTELLIGENT, A.FUNCTION, A.CONNECTION
                        UNION ALL 
                        SELECT LIBNO, LIBNM, LIBDS, LIBPT, LIBLV, '' AS DOCNO, '' AS TAGNO, '' AS TAG_TYPE, '' AS DOCVR, '' AS INTELLIGENT, '' AS FUNCTION, '' AS CONNECTION
                        FROM IDS_LIB 
                        WHERE PLANTCODE = '${plantCode}' AND LIBLV != '9' AND LIBDS = 'VALVE' AND LIBNO IN (
                            SELECT LIBPT FROM IDS_TAG A, IDS_LIB B 
                            WHERE A.DOCNO = '${docId}' AND A.DOCVR = '001' AND B.LIBLV != '9' AND B.PLANTCODE = '${plantCode}' AND A.GUBUN = 'Y' AND A.LIBNO = B.LIBNO
                            GROUP BY B.LIBPT
                        )
                        ORDER BY LIBDS
                    ) T1 LEFT JOIN (
                                        SELECT LISTAGG(SUB.TAGHANDLE, '/') WITHIN GROUP (ORDER BY SUB.TAGNO) AS TAGHANDLE, SUB.TAG_TYPE, SUB.TAGNO
                                        FROM (
                                            SELECT A.TAGHANDLE, B.TAG_TYPE, A.TAGNO, A.DOCNO, A.DOCVR FROM IDS_TAG_DETAIL A, IDS_TAG B
                                                WHERE A.DOCNO = B.DOCNO AND A.DOCVR = B.DOCVR AND A.TAGNO = B.TAGNO AND A.DOCVR = '${docVer}' AND A.DOCNO = '${docId}'
                                            GROUP BY B.TAG_TYPE, A.TAGNO, A.DOCNO, A.DOCVR, A.TAGHANDLE
                                        ) SUB
                                        GROUP BY SUB.TAGNO, SUB.TAG_TYPE
                                    ) T2 ON T2.TAGNO IN (T1.TAGNO)
                    ORDER BY FUNCTION
                    `

        return this.db.query(query) as Promise<EquipmentFolder[]>
    }

    public async getEquipments(docId: string, docVer: string, plantCode: string): Promise<Equipment[]> {
        //기기심볼 폴더에 설비 추가
        const query = `SELECT TAGNO as "tagId",TAG_TYPE as "tagType",LIBDS as "libDesc",A.LIBNO as "libId",A.DOCVR as "docVer",A.INTELLIGENT as "intelligent",A.FUNCTION as "function" ,A.CONNECTION as "connection"
                FROM IDS_TAG A, IDS_LIB B
                WHERE
                    A.DOCNO = '${docId}' AND A.DOCVR = '${docVer}'
                    AND B.LIBLV != '9' AND B.PLANTCODE = '${plantCode}'
                    AND A.GUBUN = 'Y' AND A.LIBNO = B.LIBNO ORDER BY "function"`

        return this.db.query(query) as Promise<Equipment[]>
    }

    public async getHandles(docId: string, docVer: string, tagId: string): Promise<EquipmentHandle[]> {
        //설비 핸들 추가
        const sSql = `SELECT A.TAGHANDLE as "handle", B.TAG_TYPE as "tagType" FROM IDS_TAG_DETAIL A, IDS_TAG B
        WHERE A.DOCNO = B.DOCNO AND A.DOCVR = B.DOCVR AND A.TAGNO = B.TAGNO
        AND A.DOCNO = '${docId}' and A.DOCVR = '${docVer}' AND A.TAGNO = '${tagId}'`

        return this.db.query(sSql) as Promise<EquipmentHandle[]>
    }

    public getDocumentFile(docNo: string, docVr: string): Promise<Buffer> {
        const sSql = `SELECT DOCCT FROM IDS_DOC WHERE DOCNO = '${docNo}' AND DOCVR = '${docVr}'`

        return this.db.getBlob(sSql)
    }

    public getDocumentImg(docNo: string, docVr: string): Promise<Map<string, Buffer>> {
        const sSql = `SELECT IMGNM ,IMG FROM IDS_DOC_IMG WHERE DOCNO = '${docNo}' AND DOCVR = '${docVr}'`
        return this.db.getBlobs(sSql)
    }

    public async searchDocument(
        folders: string[],
        docName: string | undefined,
        docNumber: string | undefined,
        cnt: string | undefined
    ): Promise<{ cnt: number; data: DocumentResult[] }> {
        let sSql = `SELECT CASE A.HOGI_GUBUN WHEN '0' THEN '0' WHEN 'L' THEN 'Legend' ELSE A.HOGI_GUBUN END AS "hogi", B.DOCNUMBER as "docNumber", 
            B.DOCNM as "docName", B.DOCNO as "docId", B.DOCVR as "docVer", B.FOLID as "folderId", A.PLANTCODE as "plantCode"
            FROM IDS_FOLDER A, IDS_DOC B 
            WHERE A.APP_GUBUN = '001' AND A.FOLID = B.FOLID AND B.CURRENT_YN = '001' 
            `
        if (0 < folders.length) {
            let opt = 'AND B.FOLID IN ('
            for (const folder of folders) {
                opt = opt + `'${folder}',`
            }
            opt = opt.slice(0, -1)

            sSql = sSql + opt + ')'
        }

        if (docName !== undefined) {
            const opt1 = replaceSearchTermByLike(docName)
            if (0 < opt1.length) sSql = sSql + ` AND UPPER(B.DOCNM) LIKE UPPER('${opt1}') `
        }

        if (docNumber !== undefined) {
            const opt2 = replaceSearchTermByLike(docNumber)
            if (0 < opt2.length) sSql = sSql + ` AND UPPER(B.DOCNUMBER) LIKE UPPER('${opt2}') `
        }

        sSql = sSql + 'ORDER BY DOCNUMBER, HOGI_GUBUN '

        let totalCntSql = `Select COUNT(*) as "cnt" From (${sSql})`
        const totalCntRes = (await this.db.query(totalCntSql)) as [{ cnt: number }]

        if (cnt) sSql = `SELECT * FROM (${sSql}) WHERE ROWNUM <= ${cnt}`

        const results = (await this.db.query(sSql)) as DocumentResult[]

        return { cnt: totalCntRes.length > 0 ? totalCntRes[0].cnt : 0, data: results }
    }

    public async searchEquipment(
        folders: string[],
        libId: string | undefined,
        tag: string | undefined,
        cnt: string | undefined
    ): Promise<{ cnt: number; data: EquipmentResult[] }> {
        let sSql =
            'SELECT C.PLANTCODE as "plantCode", C.DOCNUMBER as "docNumber", C.HOGI_GUBUN as "hogi", D.FUNCTION as "function", C.DOCNO as "docId", C.DOCVR as "docVer", C.DOCNM as "docName", C.FOLID as "folderId", D.TAGNO as "tagId" FROM (' +
            "SELECT CASE A.HOGI_GUBUN WHEN '0' THEN '0' WHEN 'L' THEN 'Legend' ELSE A.HOGI_GUBUN END AS HOGI_GUBUN, A.PLANTCODE, B.DOCNO, B.DOCVR, B.DOCNM, B.DOCNUMBER, B.FOLID FROM IDS_FOLDER A, IDS_DOC B " +
            "WHERE A.APP_GUBUN = '001' AND A.FOLID = B.FOLID AND B.CURRENT_YN = '001' "

        if (0 < folders.length) {
            let opt = 'AND B.FOLID IN ('
            for (const folder of folders) {
                opt = opt + `'${folder}',`
            }
            opt = opt.slice(0, -1)

            sSql = sSql + opt + ')'
        }

        sSql = sSql + " ) C, IDS_TAG D WHERE C.DOCNO = D.DOCNO AND C.DOCVR = D.DOCVR AND D.GUBUN = 'Y' "

        if (tag !== undefined) {
            const opt1 = replaceSearchTermByLike(tag)
            if (0 < opt1.length) sSql = sSql + ` AND UPPER(D.FUNCTION) LIKE UPPER('${opt1}') `
        }

        if (libId !== undefined) {
            const opt2 = replaceSearchTerm(libId)
            if (0 < opt2.length) sSql = sSql + ` AND D.LIBNO = '${opt2}' `
        }

        sSql = sSql + ` ORDER BY FUNCTION, DOCNUMBER, HOGI_GUBUN `

        let totalCntSql = `Select COUNT(*) as "cnt" From (${sSql})`
        const totalCntRes = (await this.db.query(totalCntSql)) as [{ cnt: number }]

        if (cnt) sSql = `SELECT * FROM (${sSql}) WHERE ROWNUM <= ${cnt}`

        const results = (await this.db.query(sSql)) as EquipmentResult[]

        return { cnt: totalCntRes.length > 0 ? totalCntRes[0].cnt : 0, data: results }
    }

    public async searchDocumentEquipment(
        docId: string,
        docVer: string,
        libId: string | undefined,
        tag: string | undefined,
        cnt: string | undefined
    ): Promise<EquipmentResult[]> {
        let sSql = `
            SELECT C.PLANTCODE as "plantCode",
                    C.DOCNUMBER as "docNumber", 
                    C.HOGI_GUBUN as "hogi", 
                    D.FUNCTION as "function", 
                    C.DOCNO as "docId", 
                    C.DOCVR as "docVer", 
                    C.DOCNM as "docName", 
                    C.FOLID as "folderId", 
                    D.TAGNO as "tagId" 
                FROM (
                    SELECT 
                        CASE A.HOGI_GUBUN WHEN '0' THEN '0' WHEN 'L' THEN 'Legend' ELSE A.HOGI_GUBUN END AS HOGI_GUBUN,
                        A.PLANTCODE, 
                        B.DOCNO, 
                        B.DOCVR, 
                        B.DOCNM, 
                        B.DOCNUMBER, 
                        B.FOLID 
                    FROM 
                        IDS_FOLDER A, 
                        IDS_DOC B 
                    WHERE 
                        A.APP_GUBUN = '001' AND 
                        A.FOLID = B.FOLID AND 
                        B.CURRENT_YN = '001' AND
                        B.DOCNO = '${docId}' AND
                        B.DOCVR = '${docVer}' 
                ) C,
                IDS_TAG D 
                    WHERE C.DOCNO = D.DOCNO AND C.DOCVR = D.DOCVR AND D.GUBUN = 'Y' 
        `
        if (tag !== undefined) {
            const opt1 = replaceSearchTermByLike(tag)
            if (0 < opt1.length) sSql = sSql + ` AND UPPER(D.FUNCTION) LIKE UPPER('${opt1}') `
        }

        if (libId !== undefined) {
            const opt2 = replaceSearchTerm(libId)
            if (0 < opt2.length) sSql = sSql + ` AND D.LIBNO = '${opt2}' `
        }

        sSql = sSql + ` ORDER BY FUNCTION, DOCNUMBER, HOGI_GUBUN `

        if (cnt) sSql = `SELECT * FROM (${sSql}) WHERE ROWNUM <= ${cnt}`

        const results = (await this.db.query(sSql)) as EquipmentResult[]

        return results
    }

    public async getSymbolsByPlant(plantCode: string): Promise<SymbolResult[]> {
        const sSql = `SELECT B.LIBNO as "libId", B.LIBNM as "libName", B.LIBDS as "libDesc", B.LIBPT as "parent" FROM IDS_LIB B WHERE B.PLANTCODE = '${plantCode}' ORDER BY "libDesc"`

        const results = (await this.db.query(sSql)) as SymbolResult[]

        return results
    }

    public async getDocumentInfo(docId: string, docVer: string, plantCode: string): Promise<DocumentInfo> {
        const sSql =
            `SELECT DOCNO as "docId",DOCVR as "docVer",DOCNM as "docName",DOCNUMBER as "docNumber",PLANTCODE as "plantCode", FOLID as "folderId" FROM IDS_DOC ` +
            `WHERE PLANTCODE = '${plantCode}' AND DOCNO = '${docId}' AND DOCVR = '${docVer}' ORDER BY DOCNUMBER`

        const results = (await this.db.query(sSql)) as DocumentInfo[]

        return results[0]
    }

    public async getUserContext(userId: string): Promise<UserContext> {
        const sSql3 = `select userId as "userId", context as "context" from UserContexts where userId = '${userId}'`

        const res = (await this.db.getClob(sSql3)) as { userId: string; context: string }[]

        let documents: FavoriteDocument[] = []
        let equipments: FavoriteEquipment[] = []

        console.log(res)

        if (res.length === 1) {
            const context = JSON.parse(res[0].context) as unknown

            console.log(context)

            if (Array.isArray(context)) {
                try {
                    const newDocs = context as FavoriteDocument[]
                    documents.push(...newDocs)
                } catch (error) {
                    console.log(error)
                }
            } else {
                const favorite = (context as UserContext).favorite

                if (favorite.documents) {
                    documents = favorite.documents
                }
                if (favorite.equipments) {
                    equipments = favorite.equipments
                }
            }
        }

        return { userId, favorite: { documents, equipments } }
    }

    public async addUserContext(userId: string): Promise<void> {
        const context = JSON.stringify({ userId, favorite: { documents: [], equipments: [] } })

        const sql = `INSERT INTO UserContexts e ( userId, context ) VALUES ( '${userId}', '${context}' )`
        await this.db.command(sql)
    }

    // https://stackoverflow.com/questions/65147359/node-js-oracledb-executemany-fail-to-update-database
    public async updateUserContext(userId: string, context: UserContext): Promise<void> {
        const text = JSON.stringify(context)

        const query = `UPDATE UserContexts SET context = :CONTEXT WHERE userId = '${userId}'`
        const opts = [{ key: 'CONTEXT', type: 'clob', maxSize: 1 * 1024 * 1024 }]
        const write = [{ CONTEXT: text }]

        await this.db.insert(query, opts, write)
    }

    public async getUser(userId: string): Promise<UserInfo | undefined> {
        const sql = `select a.PERNR as "userId",a.NAME as "name", a.DEPT_CODE  as "deptCode", a.DEPT_CODE as DEPT_CODE,
(select c.DEPT_NAME from PT_JOJIK c where c.DEPT_CODE=b.UP_CODE)||' '||b.DEPT_NAME as DEPT_NAME,
a.JIKWI as JIKWI, a.CEL_TEL as CEL_TEL
from PT_INSA a, PT_JOJIK b where a.DEPT_CODE = b.DEPT_CODE and  a.PERNR='${userId}'`

        const results = await this.db.query(sql)

        if (results.length === 0) {
            console.log('error, 존재하지 않는 사용자', sql)
            return undefined
        }

        if (1 < results.length) console.log('warning, 다수의 사용자가 검색됨', sql)

        return results[0] as UserInfo
    }

    public async getDeptInfo(deptCode: string): Promise<{ DEPT_CODE: string; UP_CODE: string; DEPT_NAME: string }[]> {
        const sql = `select DEPT_CODE, UP_CODE, DEPT_NAME from PT_JOJIK where DEPT_CODE = '${deptCode}' `

        return (await this.db.query(sql)) as { DEPT_CODE: string; UP_CODE: string; DEPT_NAME: string }[]
    }

    public async getLoginCount(userId: string, plantCode: string): Promise<{ count: number }[]> {
        const sql = `select LOGCNT as "count" from IDS_LOGIN_LOG where USERID='${userId}' and LOGDT =to_char(sysdate,'yyyy-MM-dd') and PLANTCODE='${plantCode}'`
        const count = (await this.db.query(sql)) as { count: number }[]

        const sql2 = `select LOGCNT as "count" from IDS_LOGIN_LOG_AD where USERID='${userId}' and LOGDT =to_char(sysdate,'yyyy-MM-dd') and PLANTCODE='${plantCode}'`
        const count2 = (await this.db.query(sql2)) as { count: number }[]
        notUsed(count2)

        return count
    }

    public async updateLoginCount(userId: string, plantCode: string, count: number): Promise<void> {
        const sql = `update IDS_LOGIN_LOG set LOGCNT = ${count} where USERID='${userId}' and LOGDT=to_char(sysdate,'yyyy-MM-dd') and PLANTCODE='${plantCode}'`
        await this.db.command(sql)

        const sql2 = `update IDS_LOGIN_LOG_AD set LOGCNT = ${count} where USERID='${userId}' and LOGDT=to_char(sysdate,'yyyy-MM-dd') and PLANTCODE='${plantCode}'`
        await this.db.command(sql2)
    }

    public async createLoginCount(userId: string, plantCode: string, plantName: string, gubun: string): Promise<void> {
        const sql = `insert into IDS_LOGIN_LOG(USERID, LOGDT, LOGCNT, PLANTCODE, PLANTNM, GUBUN) values ('${userId}',to_char(sysdate,'yyyy-MM-dd'),1,'${plantCode}','${plantName}','${gubun}')`
        await this.db.command(sql)

        const sql2 = `insert into IDS_LOGIN_LOG_AD(USERID, LOGDT, LOGCNT, PLANTCODE, PLANTNM, GUBUN) values ('${userId}',to_char(sysdate,'yyyy-MM-dd'),1,'${plantCode}','${plantName}','${gubun}')`
        await this.db.command(sql2)
    }

    public async writeLoginHistory(
        userId: string,
        gubun: string,
        clientIp: string,
        plantCode: string,
        plantName: string
    ): Promise<void> {
        const sql = `insert into IDS_USER_HISTORY(USERID, LOGDT,LOGTIME, LOGGUBUN, LOGIP, PLANTCODE, PLANTNM) values
        ('${userId}',to_char(sysdate,'yyyy-MM-dd'),to_char(sysdate,'hh24:mi:ss'),${gubun},'${clientIp}','${plantCode}','${plantName}')`
        await this.db.command(sql)

        const sql2 = `insert into IDS_USER_HISTORY_AD(USERID, LOGDT,LOGTIME, LOGGUBUN, LOGIP, PLANTCODE, PLANTNM) values
        ('${userId}',to_char(sysdate,'yyyy-MM-dd'),to_char(sysdate,'hh24:mi:ss'),${gubun},'${clientIp}','${plantCode}','${plantName}')`
        await this.db.command(sql2)
    }

    public getDocumentByOpc(docId: string, docVer: string, targetDocNum: string): Promise<DocByOpc[]> {
        const sql = `SELECT A.DOCNO as "docId",A.DOCVR as "docVer",A.PLANTCODE as "plantCode", A.DOCNM as "docName",A.DOCNUMBER as "docNumber", B.FOLPT, B.FOLID, B.HOGI_GUBUN as "hogi"
        FROM IDS_DOC A ,IDS_FOLDER B
        WHERE A.FOLID = B.FOLID
        AND REPLACE(A.DOCNUMBER,'-','') = '${targetDocNum}'
        AND A.CURRENT_YN = '001'
        AND A.PLANTCODE = (SELECT PLANTCODE FROM IDS_DOC WHERE DOCNO = '${docId}' AND DOCVR = '${docVer}')
        ORDER BY B.HOGI_GUBUN `

        return this.db.query(sql) as Promise<DocByOpc[]>
    }

    public getDocumentByOpcFromHansuwon_1(docId: string, docVer: string, intelligent: string): Promise<DocByOpc[]> {
        const sql = `SELECT A.DOCNO as "docId",A.DOCVR as "docVer",A.PLANTCODE as "plantCode", A.DOCNM as "docName",A.DOCNUMBER as "docNumber", B.FOLPT, B.FOLID, B.HOGI_GUBUN as "hogi"
        FROM IDS_DOC A ,IDS_FOLDER B
        WHERE A.FOLID = B.FOLID
        AND SUBSTR(A.DOCNUMBER,1,1) = '${intelligent.slice(0, 1)}'
        AND SUBSTR(A.DOCNUMBER,3,3) = '${intelligent.slice(1, 4)}'
        AND SUBSTR(A.DOCNUMBER,12,3) = '${intelligent.slice(5, 8)}'
        AND A.CURRENT_YN = '001'
        AND A.PLANTCODE = (SELECT PLANTCODE FROM IDS_DOC WHERE DOCNO = '${docId}' AND DOCVR = '${docVer}')
        ORDER BY B.HOGI_GUBUN `

        return this.db.query(sql) as Promise<DocByOpc[]>
    }
    public getDocumentByOpcFromHansuwon_2(intelligent: string): Promise<DocByOpc[]> {
        const sql = `SELECT A.DOCNO as "docId",A.DOCVR as "docVer",A.PLANTCODE as "plantCode", A.DOCNM as "docName",A.DOCNUMBER as "docNumber", B.FOLPT, B.FOLID, B.HOGI_GUBUN as "hogi"
        FROM IDS_DOC A ,IDS_FOLDER B
        WHERE A.FOLID = B.FOLID
        AND REPLACE(A.DOCNUMBER,'-','') = '${intelligent}'
        AND A.CURRENT_YN = '001'
       `
        return this.db.query(sql) as Promise<DocByOpc[]>
    }

    public async getDocumentHogiByFolId(folderId: string): Promise<string> {
        const sql = `SELECT HOGI_GUBUN as "hogi" FROM IDS_FOLDER WHERE FOLID = ${folderId}`

        const results = await this.db.query(sql)

        if (results.length === 0) {
            return ''
        }
        return results[0].hogi as string
    }

    public async getTagId(
        docId: string,
        docVer: string,
        connection: string,
        intelligent: string
    ): Promise<string | undefined> {
        const sql = `SELECT DOCNO, TAGNO as "tagId" FROM IDS_TAG WHERE DOCNO = '${docId}' AND DOCVR = '${docVer}'
        AND REPLACE(INTELLIGENT,'-','') = '${intelligent.replace(/-/gi, '')}'
        AND REPLACE(CONNECTION,'-','') = '${connection.replace(/-/gi, '')}'`

        const values = await this.db.query(sql)

        if (values.length === 0) return undefined

        return values[0].tagId as string
    }

    public async getTagIdFromHansuwon(
        docId: string,
        docVer: string,
        intelligent: string,
        connection: string
    ): Promise<string | undefined> {
        const sql = `SELECT DOCNO, TAGNO as "tagId" FROM IDS_TAG WHERE DOCNO = '${docId}' AND DOCVR = '${docVer}'
        AND REPLACE(INTELLIGENT,'-','') = '${connection.replace(/-/gi, '')}'
        AND REPLACE(CONNECTION,'-','') = '${intelligent.replace(/-/gi, '')}'`

        const values = await this.db.query(sql)

        if (values.length === 0) return undefined

        return values[0].tagId as string
    }

    public async getEquipmentLink(plantCode: string, function_: string): Promise<EquipmentLink[]> {
        const sql = `SELECT
        DISTINCT (EQUIPMENT) as "equipmentLinkId",
        INTELLIGENT as "intelligent",
        FUNCTION_DETAIL as "funcDetail",
        OBJECT as "linkObject"
        FROM IDS_MASTER
        WHERE  INTELLIGENT is not null AND FUNCTION = '${function_}'
        AND PLANTCODE = '${plantCode}'`

        return (await this.db.query(sql)) as EquipmentLink[]
    }

    public async getEquipmentLinkList(
        docId: string,
        docVer: string,
        handle: string
    ): Promise<
        {
            TAGNO: string
            TAG_TYPE: string
            INTELLIGENT: string
            CONNECTION: string
            FUNCTION: string
            FOLID: string
        }[]
    > {
        // 한수원 DB의 경우 FOLID 컬럼이 없음으로 쿼리 수정
        const region = process.env.REGION as string
        const selectDB = region === 'kospo' ? '남부' : '한수원'
        let sql = ''
        if (selectDB === '남부')
            sql = `SELECT A.TAGNO, A.TAG_TYPE, A.GUBUN, A.INTELLIGENT, A.CONNECTION, A.FUNCTION, A.LIBNO, A.FOLID
            FROM IDS_TAG A
            WHERE A.TAGNO IN (SELECT TAGNO FROM IDS_TAG_DETAIL WHERE TAGHANDLE = '${handle}' AND DOCNO = '${docId}' AND DOCVR = '${docVer}'
            GROUP BY TAGNO) AND A.DOCNO = '${docId}' AND A.DOCVR = '${docVer}'
            ORDER BY A.INTELLIGENT`
        else
            sql = `SELECT A.TAGNO, A.TAG_TYPE, A.GUBUN, A.INTELLIGENT, A.CONNECTION, A.FUNCTION, A.LIBNO
            FROM IDS_TAG A
            WHERE A.TAGNO IN (SELECT TAGNO FROM IDS_TAG_DETAIL WHERE TAGHANDLE = '${handle}' AND DOCNO = '${docId}' AND DOCVR = '${docVer}'
            GROUP BY TAGNO) AND A.DOCNO = '${docId}' AND A.DOCVR = '${docVer}'
            ORDER BY A.INTELLIGENT`

        return (await this.db.query(sql)) as {
            TAGNO: string
            TAG_TYPE: string
            CONNECTION: string
            INTELLIGENT: string
            FUNCTION: string
            FOLID: string
        }[]
    }

    public async insertMarkup(write: InsertMarkupType[]): Promise<boolean> {
        try {
            const query = `INSERT INTO MarkupContents
            (SEQ,USERID,DOCID,DOCVER,PLANTCODE,TITLE,PATHS,ISPUBLIC,CREATE_DATE)
            VALUES
            (SEQ_MARKUP.NEXTVAL,:USERID,:DOCID,:DOCVER,:PLANTCODE,:TITLE,:PATHS,:ISPUBLIC,SYSDATE)`

            const opts = [
                { key: 'USERID', type: 'string', maxSize: 100 },
                { key: 'DOCID', type: 'string', maxSize: 100 },
                { key: 'DOCVER', type: 'string', maxSize: 10 },
                { key: 'PLANTCODE', type: 'string', maxSize: 100 },
                { key: 'TITLE', type: 'string', maxSize: 300 },
                { key: 'PATHS', type: 'clob', maxSize: 10 * 1024 * 1024 },
                { key: 'ISPUBLIC', type: 'number', maxSize: 1 }
            ]

            const result = await this.db.insert(query, opts, write)

            return result === 1
        } catch (error) {
            console.log(error)
        }

        return false
    }

    public async updateMarkup(write: UpdateMarkupType[]): Promise<boolean> {
        try {
            const query = `UPDATE MarkupContents SET
                USERID=:USERID,
                DOCID=:DOCID,
                DOCVER=:DOCVER,
                PLANTCODE=:PLANTCODE,
                TITLE=:TITLE,
                PATHS=:PATHS,
                ISPUBLIC=:ISPUBLIC,
                CREATE_DATE=SYSDATE
            WHERE SEQ=:SEQ`

            const opts = [
                { key: 'USERID', type: 'string', maxSize: 100 },
                { key: 'DOCID', type: 'string', maxSize: 100 },
                { key: 'DOCVER', type: 'string', maxSize: 10 },
                { key: 'PLANTCODE', type: 'string', maxSize: 100 },
                { key: 'TITLE', type: 'string', maxSize: 300 },
                { key: 'PATHS', type: 'clob', maxSize: 10 * 1024 * 1024 },
                { key: 'ISPUBLIC', type: 'number', maxSize: 1 },
                { key: 'SEQ', type: 'number', maxSize: 11 }
            ]

            console.log('query:', query)

            const result = await this.db.update(query, opts, write)

            return result === 1
        } catch (error) {
            console.log(error)
        }

        return false
    }

    public async deleteMarkup(value: DeleteMarkupValue): Promise<boolean> {
        try {
            let seqs = ''

            for (const seq of value.seqs) {
                seqs = seqs + `SEQ = ${seq} OR `
            }

            seqs = seqs.slice(0, -3)

            const query = `DELETE FROM MarkupContents WHERE
            DOCID='${value.docId}' AND DOCVER='${value.docVer}' AND PLANTCODE='${value.plantCode}' AND USERID = '${value.userId}' AND ( ${seqs})`

            console.log(query)

            await this.db.command(query)

            return true
        } catch (error) {
            console.log(error)
        }

        return false
    }

    public async getMarkups(
        userId: string,
        docId: string,
        docVer: string,
        plantCode: string
    ): Promise<GetMarkupType[]> {
        try {
            const sql = `SELECT SEQ as "seq",USERID as "userId",DOCID as "docId",DOCVER as "docVer",PLANTCODE as "plantCode",
            TITLE as "title",PATHS as "paths",ISPUBLIC as "isPublic", TO_CHAR(CREATE_DATE, 'YYYY-MM-DD HH24:MI') AS "createDate"
            FROM MarkupContents
            WHERE DOCID='${docId}' AND DOCVER='${docVer}' AND PLANTCODE='${plantCode}' AND (USERID = '${userId}' OR ISPUBLIC = 1)
            ORDER BY SEQ DESC`

            const res = await this.db.getClob(sql)

            return res as GetMarkupType[]
        } catch (error) {
            console.log(error)
        }

        return []
    }

    public async getNotiorderEquipments(docId: string, docVer: string): Promise<NotiorderEquipment[]> {
        //OPC를 제외한 기능위치
        const sql = `SELECT C.EQUIPMENT, B.TAGNO, C.FUNCTION FROM IDS_DOC A, IDS_TAG B, IDS_MASTER C
        WHERE A.DOCNO = B.DOCNO AND A.DOCVR = B.DOCVR
        AND A.DOCNUMBER = C.DOCNUMBER AND B.FUNCTION = C.FUNCTION
        AND A.DOCNO = '${docId}' AND A.DOCVR = '${docVer}' AND C.EQUIPMENT IS NOT NULL
        AND B.TAG_TYPE <> '002' AND B.GUBUN = 'Y'`

        const results = (await this.db.query(sql)) as NotiorderEquipment[]

        return results
    }

    public async getFuncs(docId: string, docVer: string): Promise<Funcs[]> {
        const sql = `SELECT FUNCTION FROM IDS_TAG WHERE DOCNO='${docId}'
            AND DOCVR='${docVer}'
            AND GUBUN='Y'
            GROUP BY FUNCTION`
        const results = (await this.db.query(sql)) as Funcs[]
        return results
    }

    public async getTagNo(FData: string, LData: string, docId: string, docVer: string): Promise<string> {
        const sql = `SELECT TAGNO FROM IDS_TAG 
        WHERE DOCNO = '${docId}'
        AND DOCVR = '${docVer}'
        AND SUBSTR(FUNCTION,1,3) = '${FData}' 
        AND SUBSTR(FUNCTION,5) = '${LData}'
        AND GUBUN = 'Y'`

        const results = (await this.db.query(sql)) as unknown as string
        return results
    }

    public async getHandle(
        tagNo: string,
        FData: string,
        LData: string,
        docId: string,
        docVer: string
    ): Promise<string> {
        const sql = `SELECT TAGHANDLE FROM IDS_TAG_DETAIL
        WHERE DOCNO = '${docId}'
        AND DOCVR = '${docVer}'
        AND TAGNO = '${tagNo}'
        AND SUBSTR(FUNCTION,1,3) = '${FData}'
        AND SUBSTR(FUNCTION,5) = '${LData}'
        `
        const results = (await this.db.query(sql)) as unknown as string
        return results
    }

    public async getTaggingHandle(docId: string, docVer: string, func: string): Promise<string> {
        const sql = `
            SELECT TAGHANDLE FROM IDS_TAG_DETAIL
            WHERE DOCNO = '${docId}'
            AND DOCVR = '${docVer}'
            AND FUNCTION = '${func}' 
        `
        const results = (await this.db.query(sql)) as unknown as string
        return results
    }

    // public async getPMDCEquipments(docId: string, docVer: string, func: string): Promise<{ [key: string]: string }[]> {
    //     let sql = `
    //     SELECT ID, NAME_KEY, MEMO, REGDT, DOCID, DOCVR, FUNCTION, HANDLE,
    //     DESCRIPTION, DIGITALSET, DISPLAYDIGITS, ENGUNITS, POINTSOURCE, POINTTYPE
    //     FROM IDS_PMDC_MASTER
    //     INNER JOIN IDS_PMDC_SENSOR
    //     ON IDS_PMDC_MASTER.NAME_KEY  = IDS_PMDC_SENSOR.NAME
    //     WHERE DOCID = '${docId}'
    //     AND DOCVR = '${docVer}'
    //     `
    //     if (func) sql += ` AND FUNCTION = '${func}'`
    //     console.log('getPMDCSql:', sql)
    //     const results = (await this.db.query(sql)) as { [key: string]: string }[]
    //     console.log('getPMDCResult:', results)
    //     return results
    // }

    public async getPMDCEquipments(docId: string, docVer: string, func: string): Promise<{ [key: string]: string }[]> {
        let sql = `
            SELECT * FROM IDS_PMDC_MASTER
            WHERE DOCID = '${docId}'
            AND DOCVR = '${docVer}'
        `
        if (func) sql += ` AND FUNCTION = '${func}'`
        const results = (await this.db.query(sql)) as { [key: string]: string }[]
        return results
    }

    public async getPMDCUser(
        userId: string,
        docId: string,
        docVer: string,
        func: string
    ): Promise<{ [key: string]: string }[]> {
        let sql = `
        SELECT * FROM IDS_PMDC_USER
            INNER JOIN IDS_PMDC_MASTER
            ON IDS_PMDC_USER.ID = IDS_PMDC_MASTER.ID 
        WHERE USERID = '${userId}' 
        AND DOCID = '${docId}'
        AND DOCVR = '${docVer}'
        `
        if (func) sql += ` AND FUNCTION = '${func}'`
        console.log('getPMDCSql:', sql)
        const results = (await this.db.query(sql)) as { [key: string]: string }[]
        console.log('getPMDCResult:', results)
        return results
    }

    public async getPMDCSearch(search: string, source: string): Promise<{ [key: string]: string }[]> {
        let sql = `
            SELECT * FROM IDS_PMDC_SENSOR 
            WHERE (DESCRIPTION LIKE '%${search}%' OR NAME LIKE '%${search}%') 
        `
        if (source !== 'all') sql += ` AND POINTSOURCE = '${source}'`
        const results = (await this.db.query(sql)) as { [key: string]: string }[]
        return results
    }

    public async getPMDCSource(): Promise<{ [key: string]: string }[]> {
        const sql = `
            SELECT DISTINCT POINTSOURCE FROM IDS_PMDC_SENSOR
        `
        const results = (await this.db.query(sql)) as { [key: string]: string }[]
        return results
    }

    public async insertPMDCUser(write: InsertPMDCUserType[]): Promise<boolean> {
        try {
            const query = `INSERT INTO IDS_PMDC_USER
            ( USERID, REGDT, MEMO, POSITION, ID )
            VALUES
            ( :USERID, SYSDATE, :MEMO, :POSITION, :ID )`

            const opts = [
                { key: 'USERID', type: 'string', maxSize: 100 },
                { key: 'MEMO', type: 'string', maxSize: 100 },
                { key: 'POSITION', type: 'string', maxSize: 100 },
                { key: 'ID', type: 'string', maxSize: 100 }
            ]
            console.log('query;', query, ' opts:', opts, ' write:', write)
            const result = await this.db.insert(query, opts, write)

            // return result === 1
            return true
        } catch (error) {
            console.log(error)
        }

        return false
    }

    public async deletePMDCUser(value: { [key: string]: string }[]): Promise<boolean> {
        console.log('del:', value)
        try {
            let ids = ''

            for (const item of value) {
                ids = ids + `ID = '${item.ID}' OR `
            }

            ids = ids.slice(0, -3)

            const query = `DELETE FROM IDS_PMDC_USER WHERE ${ids}`

            console.log(query)

            await this.db.command(query)

            return true
        } catch (error) {
            console.log(error)
        }

        return false
    }

    public async PMDCPopupPosSave(userId: string, posArr: string, idArr: string): Promise<void> {
        const id = JSON.parse(idArr) as string[]
        let str = '' as string
        id.map((v: string, i: number) => {
            str += `'${v}'`
            if (i !== id.length - 1) str += ','
        })
        const sql = `
            UPDATE IDS_PMDC_USER 
            SET POSITION='${posArr}' 
            WHERE USERID='${userId}'
            AND ID IN (${str})
        `
        await this.db.command(sql)
    }

    public async getPMDCRealTimeData(name: string): Promise<{ [key: string]: string }[]> {
        const sql = `
        SELECT VALUE FROM IDS_PMDC_REALTIME
        WHERE NAME = '${name}'
        `
        const results = (await this.db.query(sql)) as { [key: string]: string }[]
        return results
    }

    public async insertPMDCMaster(write: InsertPMDCUserType[]): Promise<boolean> {
        try {
            const query = `INSERT INTO IDS_PMDC_MASTER
            ( ID, NAME_KEY, HANDLE, FUNCTION, MEMO, REGDT, DOCID, DOCVR, DESCRIPTION, DIGITALSET, DISPLAYDIGITS, ENGUNITS, POINTTYPE, WEBID)
            VALUES
            ( :ID, :NAME_KEY, :HANDLE, :FUNCTION, :MEMO, SYSDATE, :DOCID, :DOCVR, :DESCRIPTION, :DIGITALSET, :DISPLAYDIGITS, :ENGUNITS, :POINTTYPE, :WEBID)`

            const opts = [
                { key: 'ID', type: 'string', maxSize: 100 },
                { key: 'NAME_KEY', type: 'string', maxSize: 100 },
                { key: 'HANDLE', type: 'string', maxSize: 100 },
                { key: 'FUNCTION', type: 'string', maxSize: 100 },
                { key: 'MEMO', type: 'string', maxSize: 100 },
                { key: 'DOCID', type: 'string', maxSize: 100 },
                { key: 'DOCVR', type: 'string', maxSize: 100 },
                { key: 'DESCRIPTION', type: 'string', maxSize: 100 },
                // { key: 'POINTSOURCE', type: 'string', maxSize: 100 },
                { key: 'DIGITALSET', type: 'string', maxSize: 100 },
                { key: 'DISPLAYDIGITS', type: 'string', maxSize: 100 },
                { key: 'ENGUNITS', type: 'string', maxSize: 100 },
                { key: 'POINTTYPE', type: 'string', maxSize: 100 },
                { key: 'WEBID', type: 'string', maxSize: 100 }
            ]
            await this.db.insert(query, opts, write)
            return true
        } catch (error) {
            console.log(error)
        }
        return false
    }

    public async deletePMDCMaster(value: { [key: string]: string }[]): Promise<boolean> {
        console.log('del:', value)
        try {
            let ids = ''
            for (const item of value) {
                ids = ids + `ID = '${item.ID}' OR `
            }
            ids = ids.slice(0, -3)
            const query = `DELETE FROM IDS_PMDC_MASTER WHERE ${ids}`
            const query1 = `DELETE FROM IDS_PMDC_USER WHERE ${ids}`
            console.log(query1)
            await this.db.command(query)
            await this.db.command(query1)
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    public async updateIspm(list: string): Promise<boolean> {
        try {
            const updateList = JSON.parse(list)
            const addList: string[] = updateList.add
            const subList: string[] = updateList.sub

            if (addList.length !== 0) {
                let str = ''
                addList.map((item, i) => {
                    str += `'${item}'`
                    if (addList.length - 1 !== i) {
                        str += `,`
                    }
                })
                let query = `UPDATE IDS_PMDC_MASTER SET ISPM = 1 WHERE ID IN (${str})`
                await this.db.command(query)
            }

            if (subList.length !== 0) {
                let str = ''
                subList.map((item, i) => {
                    str += `'${item}'`
                    if (subList.length - 1 !== i) {
                        str += `,`
                    }
                })
                let query = `UPDATE IDS_PMDC_MASTER SET ISPM = 0 WHERE ID IN (${str})`
                await this.db.command(query)
            }

            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    public async getRefDoc(CCOBJ: string): Promise<{ [key: string]: string }[]> {
        const sql = `
            SELECT B.DOCNO,B.DOCVR,B.DOCNUMBER,B.DOCNM,B.FOLID,B.PLANTCODE FROM IDS_TAG A, IDS_DOC B
            WHERE A.DOCNO = B.DOCNO 
            AND B.CURRENT_YN = '001' 
            AND A.GUBUN = 'Y' 
            AND A.FUNCTION IN (${CCOBJ})
            GROUP BY B.DOCNO,B.DOCVR,B.DOCNUMBER,B.DOCNM,B.FOLID,B.PLANTCODE
        `
        const results = (await this.db.query(sql)) as { [key: string]: string }[]
        return results
    }

    public async getRelatedRoot(): Promise<RelatedFolder[]> {
        const sSql = `select FOLNM as TEXT, FOLID as VALUE, SEQ from IDS_FOLDER WHERE APP_GUBUN = '002'
        and FOLPT = '100000000000000001'
        order by SEQ asc`

        const results = (await this.db.query(sSql)) as RelatedFolder[]

        return results
    }

    public async getRelatedFolders(parentId: string): Promise<RelatedFolder[]> {
        const sSql = `select FOLNM as TEXT, FOLID as VALUE, SEQ from IDS_FOLDER WHERE APP_GUBUN = '002'
        and FOLPT = '${parentId}'
        order by SEQ asc`

        const results = (await this.db.query(sSql)) as RelatedFolder[]

        return results
    }

    public async searchSignal(
        folders: string[],
        docName: string | undefined,
        tagName: string | undefined,
        cnt: string | undefined
    ): Promise<{ cnt: number; data: SearchSignalResult[] }> {
        let folderCondition = ''

        if (0 < folders.length) {
            folderCondition = 'AND a.FOLID in ('

            for (const folder of folders) {
                folderCondition += `'${folder}',`
            }

            folderCondition = folderCondition.slice(0, -1)
            folderCondition += ')'
        }

        let docNameCondition = ''

        if (docName) {
            docNameCondition = `and UPPER(a.DRAW_NM) like UPPER('${replaceSearchTermByLike(docName)}')`
        }

        let tagNameCondition = ''

        if (tagName) {
            tagNameCondition = `and UPPER(a.TAG) like UPPER('${replaceSearchTermByLike(tagName)}')`
        }

        let sSql = `select a.SNO, a.TAG, a.DRAW_NM, a.PAGE, a.FILE_PATH, a.PLANTCODE, a.FILENM,
                    case when length(d.PLANTNM) > 5 then substr(d.PLANTNM,0,length(d.PLANTNM)-3) else substr(d.PLANTNM,0,2) end ||' '||
                    (select f.FOLNM from IDS_FOLDER f where f.FOLID = (select e.FOLPT from IDS_FOLDER e where e.FOLID = a.FOLID)) as PLANTNM
                    from IDS_SIGNAL a, IDS_SITE d
                    where
                    a.PLANTCODE = d.PLANTCODE
                    and d.FOLDER_TYPE = '003'
                    ${folderCondition}
                    ${docNameCondition}
                    ${tagNameCondition}
                    order by a.DRAW_NM asc`

        let totalCntSql = `Select COUNT(*) as "cnt" From (${sSql})`
        const totalCntRes = (await this.db.query(totalCntSql)) as [{ cnt: number }]

        if (cnt) sSql = `SELECT * FROM (${sSql}) WHERE ROWNUM <= ${cnt}`

        const results = (await this.db.query(sSql)) as SearchSignalResult[]

        return { cnt: totalCntRes.length > 0 ? totalCntRes[0].cnt : 0, data: results }
    }

    public async searchRelated(
        folders: string[],
        relatedName: string | undefined,
        relatedNumber: string | undefined
    ): Promise<RelatedSearchResult[]> {
        let nameQuery = ''

        if (relatedName) {
            nameQuery = `AND UPPER(a.DKTXT) LIKE UPPER('${replaceSearchTermByLike(relatedName)}')`
        }

        let numberQuery = ''

        if (relatedNumber) {
            numberQuery = `AND UPPER(a.DOKNR) LIKE UPPER('${replaceSearchTermByLike(relatedNumber)}')`
        }

        let folderQuery = ''

        for (const folder of folders) {
            folderQuery = folderQuery + `and FOLPH LIKE '%${folder}%'`
        }

        const sSql = `SELECT a.DOKAR, a.DOKNR,a.DOKTL, a.DOKVR, a.DKTXT, a.ZZCHANGEDATE, a.EGUBUN, a.FGUBUN, b.FOLNM as DOKARNM
        FROM IDS_LT_DRAW a, (select PLANTCODE,FOLNM from IDS_FOLDER where FOLLV ='3' and APP_GUBUN='002') b
        WHERE a.DOKAR = b.PLANTCODE
            AND a.DOKAR in (select PLANTCODE from IDS_FOLDER where FOLLV ='3' and APP_GUBUN='002' and FOLPH LIKE '%100000000000000001%' ${folderQuery})
            ${nameQuery} ${numberQuery} AND ROWNUM <= 1000
        ORDER BY a.DKTXT asc`

        const results = (await this.db.query(sSql)) as RelatedSearchResult[]

        // for (const result of results) {
        // result.files = await this.getRelatedFileInfo(result.DOKAR, result.DOKVR, result.DOKTL, result.DOKNR)
        // }
        return results
    }

    public async getRelatedFileInfo(
        DOKAR: string,
        DOKVR: string,
        DOKTL: string,
        DOKNR: string
    ): Promise<RelatedFileInfo[]> {
        const sql = `select * from IDS_LT_FILE WHERE DOKNR = '${DOKNR}' AND DOKAR = '${DOKAR}' AND DOKTL = '${DOKTL}' AND DOKVR = '${DOKVR}'`

        const results = (await this.db.query(sql)) as RelatedFileInfo[]

        return results
    }

    public async findISODrawList(tplnr: string): Promise<any> {
        const sql = `SELECT * FROM IDS_ISO_DRAW WHERE FUNCTION = '${tplnr}'`

        const results = (await this.db.query(sql)) as any

        return results
    }

    public async findFunctionDetailByEquipment(equnr: string) {
        const sql = `SELECT FUNCTION_DETAIL FROM IDS_MASTER WHERE EQUIPMENT = ${equnr}`

        const results = (await this.db.query(sql)) as any

        return results
    }

    public async addLogUser(value: any): Promise<boolean> {
        const { userId, logDate, logTime, logGubun, logIP, plantCode, plantName } = value
        const sql = `INSERT INTO IDS_USER_HISTORY(USERID, LOGDT, LOGTIME, LOGGUBUN, LOGIP, PLANTCODE, PLANTNM) values ('${userId}', '${logDate}', '${logTime}', '${logGubun}', '${logIP}', '${plantCode}', '${plantName}')`

        console.log(sql)
        await this.db.command(sql)

        return true
    }

    public async addLogDocument(value: any): Promise<boolean> {
        const { userId, logDate, logTime, document } = value

        // let temp = logDate.split('/')
        // let date = `${temp[2].slice(2)}/${temp[0]}/${temp[1]}`

        await this.db.command(
            `INSERT INTO IDS_LOG(USERID, LOG_GUBUN, DOCNUMBER, DOCNO, DOCVR, OPEN_DATE) values ('${userId}', '001', '${document.name}', '${document.id}', '${document.vr}', sysdate)`
        )
        await this.db.command(`DELETE FROM IDS_DOC_LOG WHERE USERID = '${userId}'`)
        await this.db.command(
            `INSERT INTO IDS_DOC_LOG(USERID, DOCNUMBER, DOCNO, DOCVR, OPEN_DATE) values ('${userId}', '${document.name}', '${document.id}', '${document.vr}', sysdate)`
        )

        // await this.db.command(
        //     `INSERT INTO IDS_LOG(USERID, LOG_GUBUN, DOCNUMBER, DOCNO, DOCVR, OPEN_DATE) values ('${userId}', '001', '${document.name}', '${document.id}', '${document.vr}', TO_DATE('${date}', 'YY/MM/DD'))`
        // )
        // await this.db.command(`DELETE FROM IDS_DOC_LOG WHERE USERID = '${userId}'`)
        // await this.db.command(
        //     `INSERT INTO IDS_DOC_LOG(USERID, DOCNUMBER, DOCNO, DOCVR, OPEN_DATE) values ('${userId}', '${document.name}', '${document.id}', '${document.vr}', TO_DATE('${date}', 'YY/MM/DD'))`
        // )

        return true
    }

    public async getProcedureList(value: any): Promise<any> {
        let contains = `1=1`
        console.log(value)
        for (let key in value) {
            if ((key === 'prono' || key === 'pronm' || key === 'folId' || key === 'folph') && value[key]) {
                if (value[key].includes('*')) {
                    if (value[key].startsWith('*')) value[key] = value[key].replace(/\*/, '%')
                    if (value[key].endsWith('*')) value[key] = value[key].replace(/.$/, '%')

                    contains += ` and ${key} like '${value[key]}'`
                } else {
                    contains += ` and ${key}='${value[key]}'`
                }
            }
        }

        const sql = `SELECT * FROM (SELECT A.*, B.FOLPH FROM IDS_PROCEDURE A, IDS_FOLDER B WHERE A.FOLID=B.FOLID AND B.APP_GUBUN='001') WHERE ${contains} ORDER BY PRONM`
        let results = (await this.db.query(sql)) as any

        for await (let v of results) {
            if (v.FOLPH) {
                let path = ''
                for await (let w of v.FOLPH.split('/')) {
                    if (w != '000000000000000001') {
                        let name = (await this.db.query(
                            `SELECT FOLID, FOLLV, FOLNM FROM IDS_FOLDER WHERE APP_GUBUN='001' and FOLID='${w}'`
                        )) as any
                        if (name.length > 0) {
                            name = name[0]['FOLNM']
                            path += name + ' '
                        }
                    }
                }
                if (path) path = path.slice(0, -1)
                v['PATH'] = path
            }
        }

        return results
    }

    public async getProcedureRead(proId: string): Promise<any> {
        const sql = `SELECT A.*, B.FOLPH FROM IDS_PROCEDURE A, IDS_FOLDER B WHERE A.PROID='${proId}' and A.FOLID=B.FOLID`
        let results = (await this.db.query(sql)) as any
        if (results.length > 0) results = results[0]
        else return {}

        let folph = results.FOLPH.split('/')
        let site: any = {},
            bal: any = {},
            hogi: any = {}
        let i = 0
        for await (const item of folph) {
            if (item !== '000000000000000001') {
                let res = (await this.db.query(`SELECT FOLID, FOLNM FROM IDS_FOLDER WHERE FOLID='${item}'`)) as any
                if (res.length > 0) {
                    res = res[0]
                    if (i === 0) {
                        site['text'] = res.FOLNM
                        site['value'] = res.FOLID
                    }
                    if (i === 1) {
                        bal['text'] = res.FOLNM
                        bal['value'] = res.FOLID
                    }
                    if (i === 2) {
                        hogi['text'] = res.FOLNM
                        hogi['value'] = res.FOLID
                    }
                }
                i++
            }
        }
        results['gubun'] = {}
        if (i >= 0) results['gubun']['site'] = site
        if (i >= 1) results['gubun']['bal'] = bal
        if (i >= 2) results['gubun']['hogi'] = hogi

        const stepsql = `SELECT * FROM IDS_PROCEDURE_STEP WHERE PROID='${proId}' ORDER BY STPORDER`
        let steps = (await this.db.query(stepsql)) as any
        results['STEPS'] = steps

        for await (const item of steps) {
            let docVer = `SELECT DOCVR, PLANTCODE, DOCNUMBER FROM IDS_DOC WHERE DOCNO='${item.DOCNO}' AND CURRENT_YN='001'`
            let res = (await this.db.query(docVer)) as any
            if (res.length > 0) {
                res = res[0]
                item['DOCVR'] = res['DOCVR']
                item['PLANTCODE'] = res['PLANTCODE']
                item['DOCNUMBER'] = res['DOCNUMBER']
            } else {
                item['DOCVR'] = ''
                item['PLANTCODE'] = ''
                item['DOCNUMBER'] = ''
            }
        }

        return results
    }

    public async insertProcedure(value: any): Promise<boolean> {
        let sql = ``,
            set = ``

        try {
            if (value['PROID']) {
                if (value['isDel'] && value['isDel'] === 'Y') {
                    sql = `DELETE FROM IDS_PROCEDURE WHERE PROID='${value['PROID']}'`
                    await this.db.command(sql)
                    sql = `DELETE FROM IDS_PROCEDURE_STEP WHERE PROID='${value['PROID']}'`
                    await this.db.command(sql)
                } else {
                    set = ``
                    for (let key in value) {
                        if ((key === 'PRONO' || key === 'PRONM' || key === 'FOLID') && value[key]) {
                            if (set) set += ', '
                            set += ` ${key}='${value[key]}'`
                        }
                    }

                    if (set) {
                        set += `, EDITID='${value['userId']}', EDITDT=SYSDATE`
                        sql = `UPDATE IDS_PROCEDURE SET ${set} WHERE PROID='${value['PROID']}'`
                        await this.db.command(sql)
                    }

                    if (value['STEPS'] && Array.isArray(value['STEPS'])) {
                        sql = `DELETE FROM IDS_PROCEDURE_STEP WHERE PROID='${value['PROID']}'`
                        await this.db.command(sql)

                        for await (let v of value['STEPS']) {
                            sql = `INSERT INTO IDS_PROCEDURE_STEP (PROID, STPORDER, STPNM, STPDESC, DOCNO, FUNCTION, HANDLE, WEBID, NAME_KEY, POINTTYPE, ENGUNITS, DIGITALSET, DESCRIPTOR)
                            VALUES (
                                '${v['PROID']}',
                                '${v['STPORDER']}',
                                ${v['STPNM'] ? `'${v['STPNM']}'` : `NULL`},
                                ${v['STPDESC'] ? `'${v['STPDESC']}'` : `NULL`},
                                ${v['DOCNO'] ? `'${v['DOCNO']}'` : `NULL`},
                                ${v['FUNCTION'] ? `'${v['FUNCTION']}'` : `NULL`},
                                ${v['HANDLE'] ? `'${v['HANDLE']}'` : `NULL`},
                                ${v['WEBID'] ? `'${v['WEBID']}'` : `NULL`},
                                ${v['NAME_KEY'] ? `'${v['NAME_KEY']}'` : `NULL`},
                                ${v['POINTTYPE'] ? `'${v['POINTTYPE']}'` : `NULL`},
                                ${v['ENGUNITS'] ? `'${v['ENGUNITS']}'` : `NULL`},
                                ${v['DIGITALSET'] ? `'${v['DIGITALSET']}'` : `NULL`},
                                ${v['DESCRIPTOR'] ? `'${v['DESCRIPTOR']}'` : `NULL`}
                            )`
                            await this.db.command(sql)
                        }
                    }
                }
            } else {
                sql = `select nvl(max(PROID),0)+1 AS NEWID from IDS_PROCEDURE`
                let newId = (await this.db.query(sql)) as any
                newId = newId[0]['NEWID']

                sql = `INSERT INTO IDS_PROCEDURE (PROID, PRONO, PRONM, FOLID, REGID, REGDT, EDITID, EDITDT)
                VALUES (
                    ${newId},
                    '${value['PRONO']}',
                    '${value['PRONM']}',
                    '${value['FOLID']}',
                    ${value['userId'] ? `'${value['userId']}'` : `NULL`},
                    SYSDATE,
                    NULL,
                    NULL
                )`
                await this.db.command(sql)

                if (value['STEPS'] && Array.isArray(value['STEPS'])) {
                    for await (let v of value['STEPS']) {
                        sql = `INSERT INTO IDS_PROCEDURE_STEP (PROID, STPORDER, STPNM, STPDESC, DOCNO, FUNCTION, HANDLE, WEBID, NAME_KEY, POINTTYPE, ENGUNITS, DIGITALSET, DESCRIPTOR)
                        VALUES (
                            ${newId},
                            '${v['STPORDER']}',
                            ${v['STPNM'] ? `'${v['STPNM']}'` : `NULL`},
                            ${v['STPDESC'] ? `'${v['STPDESC']}'` : `NULL`},
                            ${v['DOCNO'] ? `'${v['DOCNO']}'` : `NULL`},
                            ${v['FUNCTION'] ? `'${v['FUNCTION']}'` : `NULL`},
                            ${v['HANDLE'] ? `'${v['HANDLE']}'` : `NULL`},
                            ${v['WEBID'] ? `'${v['WEBID']}'` : `NULL`},
                            ${v['NAME_KEY'] ? `'${v['NAME_KEY']}'` : `NULL`},
                            ${v['POINTTYPE'] ? `'${v['POINTTYPE']}'` : `NULL`},
                            ${v['ENGUNITS'] ? `'${v['ENGUNITS']}'` : `NULL`},
                            ${v['DIGITALSET'] ? `'${v['DIGITALSET']}'` : `NULL`},
                            ${v['DESCRIPTOR'] ? `'${v['DESCRIPTOR']}'` : `NULL`}
                        )`
                        await this.db.command(sql)
                    }
                }
            }
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

    public async getProcedureEquipHandle(func: string, docId: string): Promise<any> {
        try {
            const sql = `SELECT TAGHANDLE FROM IDS_TAG_DETAIL WHERE FUNCTION = '${func}' AND DOCNO ='${docId}'`
            const results = (await this.db.query(sql)) as any
            console.log('repo getProcedureEquipHandle 결과', results)
            return results
        } catch (e) {
            console.log('repo getProcedureEquipHandle 함수 에러', e)
        }
    }

    public async getUrlByfunctionName(functionName: string): Promise<undefined | EquipInfo> {
        const sql = `
            SELECT A.DOCNO as "docId", A.DOCVR as "docVer", B.PLANTCODE as "plantCode", A.TAGNO as "tagId" 
            FROM IDS_TAG A, IDS_DOC B
            WHERE A.DOCNO = B.DOCNO 
                AND A.DOCVR = B.DOCVR 
                AND b.CURRENT_YN='001' 
                AND A.FUNCTION ='${functionName}'  
        `

        const results = (await this.db.query(sql)) as Object[]

        if (results.length === 0) {
            return undefined
        }
        return results[results.length - 1] as EquipInfo
    }

    public async getUrlByEquipNo(equipmentNo: string): Promise<undefined | EquipInfo> {
        const sql = `
            SELECT A.DOCNO as "docId", A.DOCVR as "docVer", B.PLANTCODE as "plantCode", A.TAGNO as "tagId" 
            FROM IDS_TAG A, IDS_DOC B, IDS_MASTER C
            WHERE A.FUNCTION = C.FUNCTION  
                AND A.DOCNO = B.DOCNO 
                AND A.DOCVR = B.DOCVR 
                AND b.CURRENT_YN='001' 
                AND C.INTELLIGENT IS NOT null 
                AND C.EQUIPMENT = '${equipmentNo}'
        `

        const results = (await this.db.query(sql)) as Object[]

        if (results.length === 0) {
            return undefined
        }
        return results[results.length - 1] as EquipInfo
    }

    public async getFolderIdsByPlantCode(plantCode: string): Promise<undefined | string> {
        const sql = `
            SELECT FOLPH as "folderPath" FROM IDS_FOLDER
            WHERE plantCode ='${plantCode}'
        `
        const results = (await this.db.query(sql)) as any[]

        if (results.length === 0) {
            return undefined
        }
        return results[0].folderPath
    }

    public async getFolderNameByFolderId(folderId: string): Promise<undefined | string> {
        const sql = `
            SELECT FOLNM as "folderName" FROM IDS_FOLDER
            WHERE FOLID ='${folderId}'
        `
        const results = (await this.db.query(sql)) as any[]

        if (results.length === 0) {
            return undefined
        }
        return results[0].folderName
    }

    public async testImgInsert(imageBuffer: Buffer, opts: any): Promise<undefined | string> {
        const query = `INSERT INTO IDS.IDS_DOC_IMG
            (SEQ, DOCNO, DOCVR, IMGNM, IMGEXT, IMG)
            VALUES
            (:SEQ, :DOCNO, :DOCVR, :IMGNM, :IMGEXT, :IMG)`

        await this.db.execute(query, opts)

        return 'testImgInsert'
    }

    public async findLastDocumentInfo(userId: string): Promise<any> {
        try {
            const query = `SELECT d.* FROM IDS_DOC d INNER JOIN IDS_DOC_LOG l ON d.DOCNUMBER = l.DOCNUMBER AND d.DOCVR = l.DOCVR AND d.DOCNO = l.DOCNO WHERE l.USERID = '${userId}'`

            return this.db.query(query)
        } catch (e) {
            console.log(e)
        }
    }

    public async findEquipmentImageInfo(tplnr: string): Promise<any> {
        try {
            const query = `SELECT * FROM IDS_PICTURE_DRAW WHERE FUNCTION = '${tplnr}'`

            return this.db.query(query)
        } catch (e) {
            console.log(e)
        }
    }

    public async findEquipmentImageBySerial(serial: string): Promise<any> {
        try {
            const query = `SELECT PICCT FROM IDS_PICTURE_DRAW WHERE SERIAL = ${serial}`
            console.log('@QUERY: ', query)
            return this.db.getBlob(query)
        } catch (e) {
            console.log(e)
        }
    }

    // public async saveEquipmentImage(data: any): Promise<boolean> {
    //     try {
    //         const now=new Date().getTime()%10000 + Math.floor(Math.random()*100)
    //         const query = `
    //             INSERT INTO IDS_PICTURE_DRAW (
    //                 SERIAL, FUNCTION, NAME, PICNAME, REGDT
    //             ) VALUES (
    //                 ${now}, '${data.tplnr}', 'dummy.jpg', 'dummy.jpg', SYSDATE
    //             )
    //         `

    //         const binds={}

    //         await this.db.execute(query, binds)
    //         return true
    //     } catch (e) {
    //         console.log(e)
    //         return false
    //     }
    // }
    public async saveEquipmentImage(data: any): Promise<boolean> {
        try {
            const query = `
                INSERT INTO IDS_PICTURE_DRAW (
                    SERIAL, FUNCTION, PBS, TAG, NAME, CONNECTION, PICCT, PICNAME, PICEXT, REGDT
                ) VALUES (
                    SEQ_ID.NEXTVAL, :tplnr, '000', 'V-0000', :fileName, null, :blobData, :fileName, :mimeType, SYSDATE
                )
            `

            const binds = {
                tplnr: data.tplnr,
                fileName: data.file.name,
                blobData: { val: data.file.data },
                mimeType: data.file.mimetype
            }

            await this.db.execute(query, binds)
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

    public async deleteEquipmentImage(data: any): Promise<boolean> {
        try {
            console.log(data)
            const query = `DELETE FROM IDS_PICTURE_DRAW WHERE SERIAL='${data}'`
            await this.db.command(query)
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

    public async findUserBySabun(sabun: string): Promise<any> {
        try {
            const query = `SELECT BONBU, BONBU_T, PLANT, PLANT_T FROM COMM.ocgrcat1 WHERE UNAME = '${sabun}'`

            return this.db.query(query)
        } catch (e) {
            console.log(e)
        }
    }
}
