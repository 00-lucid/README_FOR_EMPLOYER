import { Oracledb } from 'infra'

export class PIRepository {
    public static create(db: Oracledb): PIRepository {
        return new PIRepository(db)
    }

    private constructor(db: Oracledb) {
        this.db = db
    }

    private readonly db: Oracledb

    public async findAllDetailInfo(dto: {
        plant: string
        pbsNo: string
    }): Promise<DetailInfo[]> {
        const { plant, pbsNo } = dto

        const sql = `SELECT SITE_NO, PI_NO, PBS_NO FROM IDS_PI WHERE SITE_NO = '${plant}' AND PBS_NO = '${pbsNo}'`
        return await this.db.query(sql) as DetailInfo[]
    }

    public async findCountOfDetail(dto: {
        plant: string
        piNo: string
        site: string
    }
    ): Promise<any> {
        const { plant, piNo, site } = dto

        const sql = `SELECT COUNT(${piNo}) FROM IDS_PI_DETAIL WHERE SITE_HO = '${plant}' AND PI_NO = '${piNo}' AND HOGI_NO = '${site}'`
        return await this.db.query(sql) as any
    }

    public async findKeyOfDetail(dto: {
        docNo: string
        docVr: string
    }): Promise<DetailKey[]> {
        const { docNo, docVr } = dto

        const sql = `SELECT FOLID, PLANTCODE, PBS_NO FROM IDS_DOC WHERE DOCNO = '${docNo}' AND DOCVR = '${docVr}'`

        return (await this.db.query(sql)) as DetailKey[]
    }

    public async findHogiGubun(folId: string): Promise<Hogi[]> {
        const sql = `SELECT HOGI_GUBUN FROM IDS_FOLDER WHERE FOLID IN (${folId})`

        return (await this.db.query(sql)) as Hogi[]
    }

    public async findAllDetailSpecificHogi(dto: {
        plant: string
        pbsNo: string
        site: string
    }): Promise<Mimic[]> {
        const { plant, pbsNo, site } = dto
        const sql = `SELECT FOLDER_ID, PI_NM, PI_URL FROM IDS_PI_DETAIL WHERE SITE_NO = '${plant}' AND PI_NO = '${pbsNo}' AND HOGI_NO = '${site}'`
        return (await this.db.query(sql)) as any[]
    }

    public async findAllDetail(dto: {
        plant: string
        piNo: string
        site: string
    }): Promise<Mimic[]> {
        const { plant, piNo, site } = dto
        const sql = `SELECT FOLDER_ID, PI_NM, PI_URL FROM IDS_PI_DETAIL WHERE SITE_NO = '${plant}' AND PI_NO = '${piNo}' AND HOGI_NO = '${site}'`
        return (await this.db.query(sql)) as any[]
    }
}
