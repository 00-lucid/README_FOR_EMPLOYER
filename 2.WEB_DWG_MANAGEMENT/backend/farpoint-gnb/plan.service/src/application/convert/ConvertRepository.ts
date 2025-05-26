import { Oracledb } from 'infra'

export class ConvertRepository {
    public static create(db: Oracledb): ConvertRepository {
        return new ConvertRepository(db)
    }
    private constructor(db: Oracledb) {
        this.db = db
    }
    private readonly db: Oracledb

    public async findAllDetail(dto: { plant: string; piNo: string; site: string }): Promise<Mimic[]> {
        const { plant, piNo, site } = dto
        const sql = `SELECT FOLDER_ID, PI_NM, PI_URL FROM IDS_PI_DETAIL WHERE SITE_NO = '${plant}' AND PI_NO = '${piNo}' AND HOGI_NO = '${site}'`
        return (await this.db.query(sql)) as any[]
    }

    public getDocumentFile(docNo: string, docVr: string): Promise<Buffer> {
        const sSql = `SELECT DOCCT FROM IDS_DOC WHERE DOCNO = '${docNo}' AND DOCVR = '${docVr}'`

        return this.db.getBlob(sSql)
    }
}
