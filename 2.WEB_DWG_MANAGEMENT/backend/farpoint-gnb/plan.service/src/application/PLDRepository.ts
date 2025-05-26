import { Oracledb } from 'infra'
import { Entities, PldInfo, Simbol, SimbolList, PldList, ChangePldCanvas } from 'types'

export class PLDRepository {
    public static create(db: Oracledb): PLDRepository {
        return new PLDRepository(db)
    }

    private constructor(db: Oracledb) {
        this.db = db
    }

    private readonly db: Oracledb

    public testRepository(): string[] {
        return ['hello', 'test', '!']
    }

    public async findAllSimbolList(dto: {
        cId: string
        cVr: string
        docNo: string
        docVr: string
        cSeq: string
    }): Promise<SimbolList[]> {
        const { cId, cVr, docNo, docVr, cSeq } = dto

        const sql = `SELECT * FROM IDS_PLD_SIMBOL_LIST WHERE PLD_C_ID = '${cId}' AND PLD_C_VR = '${cVr}' AND DOCNO = '${docNo}' AND DOCVR = '${docVr}' AND PLD_C_SEQ = '${cSeq}'`
        const allSimbolList = (await this.db.query(sql)) as SimbolList[]

        return allSimbolList
    }

    public async findAllSimbol(): Promise<Simbol[]> {
        const sql = `SELECT * FROM IDS_SIMBOL`
        const allSimbol = (await this.db.query(sql)) as Simbol[]

        return allSimbol
    }

    public async resisterPld(
        PLD_P_NUMBER: string,
        PLD_P_NAME: string,
        PLD_C_NAME: string,
        plantValue: string,
        PLD_C_DESC: string,
        selectedItems: string[],
        userId: string
    ): Promise<PldInfo> {
        let sql = `SELECT PLD_P_ID FROM IDS_PLD_MASTER WHERE PLD_P_NUMBER = '${PLD_P_NUMBER}' AND FOLID = '${plantValue}' `
        let PLD_P_ID = 0
        let PLD_C_ID = 0
        const PLD_C_SEQ = []

        const res = (await this.db.query(sql)) as []

        if (!res.length) {
            sql = `SELECT PLD_P_ID + 1 AS PLD_P_ID FROM (SELECT PLD_P_ID FROM IDS_PLD_MASTER ORDER BY PLD_P_ID DESC) WHERE ROWNUM = 1`
            const p_id = (await this.db.query(sql)) as { PLD_P_ID: number }[]
            PLD_P_ID = p_id[0].PLD_P_ID

            sql = `INSERT INTO IDS_PLD_MASTER (PLD_P_ID, PLD_P_NUMBER, PLD_P_NAME, FOLID, PLD_P_DESC, SEQ, USER_ID, REGDT)
            VALUES(${PLD_P_ID}, '${PLD_P_NUMBER}', '${PLD_P_NAME}', '${plantValue}', '', '', '${userId}', to_char(sysdate,'yyyyMMddHHmm')  )`

            await this.db.command(sql)
        }

        sql = 'SELECT PLD_P_ID FROM (SELECT PLD_P_ID FROM IDS_PLD_MASTER ORDER BY PLD_P_ID DESC) WHERE ROWNUM = 1'
        const p_seq = (await this.db.query(sql)) as { PLD_P_ID: number }[]
        PLD_P_ID = p_seq[0].PLD_P_ID

        sql = `SELECT PLD_C_ID FROM (SELECT PLD_C_ID FROM IDS_PLD_DETAIL WHERE CURRENT_YN = '001' ORDER BY PLD_C_ID DESC) WHERE ROWNUM = 1`
        const c_id = (await this.db.query(sql)) as { PLD_C_ID: number }[]
        PLD_C_ID = c_id[0].PLD_C_ID + 1

        sql = `INSERT INTO IDS_PLD_DETAIL (PLD_P_ID, PLD_C_ID, PLD_C_VR, PLD_C_NAME, PLD_C_DESC, USER_ID, REGDT, CURRENT_YN) 
            VALUES (${PLD_P_ID}, ${PLD_C_ID}, '000', '${PLD_C_NAME}', '${PLD_C_DESC}', '${userId}' , to_char(sysdate,'yyyyMMddHHmm'), '001' ) `

        await this.db.command(sql)

        for (const item of selectedItems) {
            const d_sql = `SELECT NVL(MAX(PLD_C_SEQ),0) + 1 as PLD_C_SEQ FROM IDS_PLD_DOC_DETAIL WHERE PLD_P_ID = '${PLD_P_ID}' AND PLD_C_ID = '${PLD_C_ID}' AND PLD_C_VR = '000' `
            const pld_c_seq = (await this.db.query(d_sql)) as { PLD_C_SEQ: number }[]
            const c_seq = pld_c_seq[0].PLD_C_SEQ
            PLD_C_SEQ.push(c_seq)

            const docno = item.slice(0, item.indexOf('-'))
            const docver = item.slice(item.indexOf('-') + 1, item.indexOf('-', item.indexOf('-') + 1))

            const sql = `INSERT INTO IDS_PLD_DOC_DETAIL (PLD_P_ID, PLD_C_ID, PLD_C_VR, DOCNO, DOCVR, PLD_DOC_DESC, SEQ, USER_ID, REGDT, CURRENT_YN, PLD_C_SEQ) 
            VALUES ( ${PLD_P_ID}, ${PLD_C_ID}, '000', '${docno}', '${docver}', '', ${c_seq}, '${userId}', to_char(sysdate,'yyyyMMddHHmm'), '001', ${c_seq} )`

            await this.db.command(sql)
        }

        return { PLD_C_ID: PLD_C_ID, PLD_C_VR: '000', PLD_C_SEQ }
    }

    public async deletePldCanvas(dto: ChangePldCanvas): Promise<void> {
        const { PLD_P_ID, PLD_C_ID, PLD_C_VR, DOCNO, DOCVR, PLD_DOC_DESC, CURRENT_YN, SEQ, USER_ID } = dto

        const deleteSql = `DELETE FROM IDS_PLD_DOC_DETAIL WHERE PLD_P_ID = ${PLD_P_ID} AND PLD_C_ID=${PLD_C_ID} AND PLD_C_VR=${PLD_C_VR}`

        await this.db.command(deleteSql)
    }

    public async changePldCanvas(dto: ChangePldCanvas): Promise<void> {
        const { PLD_P_ID, PLD_C_ID, PLD_C_VR, DOCNO, DOCVR, PLD_DOC_DESC, CURRENT_YN, SEQ, USER_ID } = dto

        const insertSql = `INSERT INTO IDS_PLD_DOC_DETAIL(PLD_P_ID, PLD_C_ID, PLD_C_VR, DOCNO, DOCVR, PLD_DOC_DESC, CURRENT_YN, SEQ, USER_ID, REGDT, PLD_C_SEQ) VALUES 
                                                    (${PLD_P_ID}, ${PLD_C_ID}, '${PLD_C_VR}', '${DOCNO}', '${DOCVR}', '${PLD_DOC_DESC}', '${CURRENT_YN}', ${SEQ}, '${USER_ID}', to_char(sysdate,'yyyyMMddHHmm'), ${SEQ})`
        console.log(insertSql)
        await this.db.command(insertSql)
    }

    public async saveSimbol(dto: {
        cId: string
        cVr: string
        cSeq: string
        docNo: string
        docVr: string
        simbol: SimbolList
    }): Promise<void> {
        const { cId, cVr, cSeq, docNo, docVr, simbol } = dto

        const { TYPE, POINT1_X, POINT1_Y, POINT1_Z, RADPT_X, RADPT_Y, RADPT_Z, ROTATION, SEQ } = simbol

        const sql = `INSERT INTO IDS_PLD_SIMBOL_LIST (PLD_C_ID, PLD_C_VR, DOCNO, DOCVR, SEQ, TYPE, POINT1_X, POINT1_Y, POINT1_Z, RADPT_X, RADPT_Y, RADPT_Z, ROTATION, PLD_C_SEQ) VALUES (${cId}, '${cVr}', '${docNo}', '${docVr}', ${SEQ}, '${TYPE}', ${POINT1_X}, ${POINT1_Y}, ${POINT1_Z}, ${RADPT_X}, ${RADPT_Y}, ${RADPT_Z}, ${ROTATION}, '${cSeq}')`

        await this.db.command(sql)
    }

    public async removeSimbolList(dto: { cId: string; cVr: string; cSeq: string; docNo: string; docVr: string }) {
        const { cId, cVr, docNo, docVr, cSeq } = dto

        const sql = `DELETE FROM IDS_PLD_SIMBOL_LIST WHERE PLD_C_ID = '${cId}' AND PLD_C_VR = '${cVr}' AND DOCNO = '${docNo}' AND DOCVR = '${docVr}' AND PLD_C_SEQ = '${cSeq}'`

        await this.db.command(sql)
    }

    public async findPldDocumentList(dto: { c_id: string; c_vr: string }) {
        const { c_id, c_vr } = dto

        console.log(c_id, c_vr)

        //const sql = `SELECT * FROM IDS_PLD_DOC_DETAIL WHERE PLD_C_ID = ${c_id} AND PLD_C_VR = '${c_vr}'`

        const sql = `SELECT A.PLD_P_ID, A.PLD_C_ID , A.PLD_C_VR , A.DOCNO, A.DOCVR , A.PLD_DOC_DESC, A.CURRENT_YN , A.SEQ , A.USER_ID , A.REGDT , A.PLD_C_SEQ, B.DOCNM , B.PLANTCODE  FROM IDS_PLD_DOC_DETAIL A, IDS_DOC B WHERE A.DOCNO = B.DOCNO AND PLD_C_ID = ${c_id} AND PLD_C_VR = '${c_vr}' AND A.DOCVR = B.DOCVR`
        return await this.db.query(sql)
    }

    public async findPldEntitiesList(dto: { cId: string; cVr: string; docNo: string; docVr: string; cSeq: string }) {
        const { cId, cVr, docNo, docVr, cSeq } = dto

        const sql = `SELECT * FROM IDS_PLD_ENTITIES_LIST WHERE PLD_C_ID = '${cId}' AND PLD_C_VR = '${cVr}' AND DOCNO = '${docNo}' AND DOCVR = '${docVr}' AND PLD_C_SEQ = '${cSeq}'`
        const allEntitiesList = (await this.db.query(sql)) as Entities[]

        return allEntitiesList
    }

    public async saveEntities(dto: {
        cId: string
        cVr: string
        cSeq: string
        docNo: string
        docVr: string
        entity: Entities
    }): Promise<void> {
        const { cId, cVr, cSeq, docNo, docVr, entity } = dto

        const { HANDLE, HANDLE_TYPE, TYPE, FUNCTION } = entity

        if (null === TYPE) {
            return
        }

        let newFuction
        if (null === FUNCTION) {
            newFuction = HANDLE
        }

        const sql = `INSERT INTO IDS_PLD_ENTITIES_LIST (PLD_C_ID, PLD_C_VR, DOCNO, DOCVR, HANDLE, HANDLE_TYPE, FUNCTION, TYPE, PLD_C_SEQ) VALUES (${cId}, '${cVr}', '${docNo}', '${docVr}', '${HANDLE}', '${HANDLE_TYPE}', '${FUNCTION}', '${TYPE}', ${cSeq})`
        await this.db.command(sql)
    }

    public async removeEntitites(dto: { cId: string; cVr: string; docNo: string; docVr: string; cSeq: string }) {
        const { cId, cVr, docNo, docVr, cSeq } = dto

        const sql = `DELETE FROM IDS_PLD_ENTITIES_LIST WHERE PLD_C_ID = '${cId}' AND PLD_C_VR = '${cVr}' AND DOCNO = '${docNo}' AND DOCVR = '${docVr}' AND PLD_C_SEQ = '${cSeq}'`

        await this.db.command(sql)
    }

    public async searchPld(dto: { companyFolder: string; plantFolder: string }): Promise<PldList[]> {
        const { companyFolder, plantFolder } = dto
        let sql = ''
        let pldLIst: PldList[] = []

        // 사업소 전체 검색
        if (companyFolder === 'all') {
            sql = `SELECT XMLCAST(XMLAGG(XMLELEMENT(D, D.DOCNM || '/') ORDER BY D.DOCNM).EXTRACT('//text()') AS CLOB) AS DOCNM, E.PLD_C_ID, E.PLD_P_NUMBER, E.FOLID, E.FOLNM, E.FOLPT
                    , (SELECT FOLNM FROM IDS_FOLDER F WHERE F.FOLID = E.FOLPT) AS FOLPTNM, E.PLD_P_NAME, E.PLD_C_NAME, E.PLD_C_VR, E.PLD_C_DESC, E.REGDT, E.USER_ID
                    FROM IDS_PLD_DOC_DETAIL C LEFT JOIN IDS_DOC D ON C.DOCNO = D.DOCNO,
                        (SELECT C.PLD_C_ID, A.PLD_P_NUMBER, A.FOLID, B.FOLNM, B.FOLPT, A.PLD_P_NAME, C.PLD_C_NAME, C.PLD_C_VR, C.PLD_C_DESC, C.REGDT, C.USER_ID
                         FROM IDS_PLD_MASTER A LEFT JOIN IDS_FOLDER B ON B.FOLID = A.FOLID, IDS_PLD_DETAIL C
                         WHERE A.PLD_P_ID = C.PLD_P_ID) E
                    WHERE C.PLD_C_ID  = E.PLD_C_ID
                    GROUP BY E.PLD_C_ID, E.PLD_C_ID, E.PLD_P_NUMBER, E.FOLID, E.FOLNM, E.FOLPT, E.PLD_P_NAME, E.PLD_C_NAME, E.PLD_C_VR, E.PLD_C_DESC, E.REGDT, E.USER_ID
                    ORDER BY REGDT DESC`

            // 발전소 전체 검색
        } else if (plantFolder === 'all') {
            sql = `SELECT XMLCAST(XMLAGG(XMLELEMENT(D, D.DOCNM || '/') ORDER BY D.DOCNM).EXTRACT('//text()') AS CLOB) AS DOCNM, E.PLD_C_ID, E.PLD_P_NUMBER, E.FOLID, E.FOLNM, E.FOLPT
                , (SELECT FOLNM FROM IDS_FOLDER F WHERE F.FOLID = E.FOLPT) AS FOLPTNM, E.PLD_P_NAME, E.PLD_C_NAME, E.PLD_C_VR, E.PLD_C_DESC, E.REGDT, E.USER_ID
                FROM IDS_PLD_DOC_DETAIL C LEFT JOIN IDS_DOC D ON C.DOCNO = D.DOCNO,
                    (SELECT C.PLD_C_ID, A.PLD_P_NUMBER, A.FOLID, B.FOLNM, B.FOLPT, A.PLD_P_NAME, C.PLD_C_NAME, C.PLD_C_VR, C.PLD_C_DESC, C.REGDT, C.USER_ID
                     FROM IDS_PLD_MASTER A LEFT JOIN IDS_FOLDER B ON B.FOLID = A.FOLID, IDS_PLD_DETAIL C
                     WHERE A.FOLID IN (SELECT FOLID FROM IDS_FOLDER WHERE FOLPT = ${companyFolder}) AND A.PLD_P_ID = C.PLD_P_ID) E
                WHERE C.PLD_C_ID  = E.PLD_C_ID
                GROUP BY E.PLD_C_ID, E.PLD_C_ID, E.PLD_P_NUMBER, E.FOLID, E.FOLNM, E.FOLPT, E.PLD_P_NAME, E.PLD_C_NAME, E.PLD_C_VR, E.PLD_C_DESC, E.REGDT, E.USER_ID
                ORDER BY REGDT DESC`

            // 선택 검색
        } else {
            sql = `SELECT XMLCAST(XMLAGG(XMLELEMENT(D, D.DOCNM || '/') ORDER BY D.DOCNM).EXTRACT('//text()') AS CLOB) AS DOCNM, E.PLD_C_ID, E.PLD_P_NUMBER, E.FOLID, E.FOLNM, E.FOLPT
                , (SELECT FOLNM FROM IDS_FOLDER F WHERE F.FOLID = E.FOLPT) AS FOLPTNM, E.PLD_P_NAME, E.PLD_C_NAME, E.PLD_C_VR, E.PLD_C_DESC, E.REGDT, E.USER_ID
                FROM IDS_PLD_DOC_DETAIL C LEFT JOIN IDS_DOC D ON C.DOCNO = D.DOCNO,
                    (SELECT C.PLD_C_ID, A.PLD_P_NUMBER, A.FOLID, B.FOLNM, B.FOLPT, A.PLD_P_NAME, C.PLD_C_NAME, C.PLD_C_VR, C.PLD_C_DESC, C.REGDT, C.USER_ID
                     FROM IDS_PLD_MASTER A LEFT JOIN IDS_FOLDER B ON B.FOLID = A.FOLID, IDS_PLD_DETAIL C
                     WHERE A.FOLID IN ('${plantFolder}') AND A.PLD_P_ID = C.PLD_P_ID) E
                WHERE C.PLD_C_ID  = E.PLD_C_ID
                GROUP BY E.PLD_C_ID, E.PLD_C_ID, E.PLD_P_NUMBER, E.FOLID, E.FOLNM, E.FOLPT, E.PLD_P_NAME, E.PLD_C_NAME, E.PLD_C_VR, E.PLD_C_DESC, E.REGDT, E.USER_ID
                ORDER BY REGDT DESC`
        }

        pldLIst = (await this.db.query(sql)) as PldList[]

        return pldLIst
    }
}
