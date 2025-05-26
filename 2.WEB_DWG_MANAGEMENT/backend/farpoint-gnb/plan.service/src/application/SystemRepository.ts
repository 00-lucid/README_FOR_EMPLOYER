import { Oracledb } from '../infra'

export class SystemRepository {
    public static create(db: Oracledb): SystemRepository {
        return new SystemRepository(db)
    }

    private constructor(db: Oracledb) {
        this.db = db
    }

    private readonly db: Oracledb

    public async createUserTable(): Promise<void> {
        try {
            const sSql1 = `CREATE TABLE UserContexts ( userId VARCHAR2(1024) NOT NULL, context CLOB NOT NULL, primary key (userId) )`
            await this.db.command(sSql1)
        } catch (error) {
            console.log(error)
        }
    }

    public async deleteUserTable(): Promise<void> {
        try {
            const sSql4 = `drop table UserContexts`
            await this.db.command(sSql4)
        } catch (error) {
            console.log(error)
        }
    }

    public async createMarkupTable(): Promise<void> {
        try {
            const sSql1 = `CREATE TABLE MarkupContents (
                seq NUMBER(11) NOT NULL,
                userId VARCHAR2(100) NOT NULL,
                docId VARCHAR2(100) NOT NULL,
                docVer VARCHAR2(10) NOT NULL,
                plantCode VARCHAR2(100) NOT NULL,
                title VARCHAR2(300) NOT NULL,
                paths CLOB NOT NULL,
                ispublic NUMBER(1) NOT NULL,
                create_date DATE NOT NULL,
                primary key (seq)
            )`

            await this.db.command(sSql1)
        } catch (error) {
            console.log(error)
        }
    }

    public async createMarkupSequence(): Promise<void> {
        try {
            const sSql1 = `CREATE SEQUENCE SEQ_MARKUP
            START WITH 1
            MAXVALUE 99999999999
            MINVALUE 1
            NOCYCLE
            CACHE 20
            NOORDER
          `

            await this.db.command(sSql1)
        } catch (error) {
            console.log(error)
        }
    }

    public async deleteMarkupTable(): Promise<void> {
        try {
            const sSql4 = `drop table MarkupContents`
            await this.db.command(sSql4)
        } catch (error) {
            console.log(error)
        }
    }

    public async createMydocs(): Promise<void> {
        try {
            const sSql1 = `CREATE TABLE Mydocs ( userId VARCHAR2(1024) NOT NULL, context CLOB NOT NULL, primary key (userId) )`
            await this.db.command(sSql1)
        } catch (error) {
            console.log(error)
        }
    }

    public async deleteMydocs(): Promise<void> {
        try {
            const sSql4 = `drop table Mydocs`
            await this.db.command(sSql4)
        } catch (error) {
            console.log(error)
        }
    }
}
