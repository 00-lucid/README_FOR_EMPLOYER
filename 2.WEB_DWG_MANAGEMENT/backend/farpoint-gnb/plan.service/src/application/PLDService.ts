import { ChangePldCanvas, Entities, SimbolList } from 'types'
import { PLDRepository } from './PLDRepository'

export class PLDService {
    public static create(repo: PLDRepository): PLDService {
        return new PLDService(repo)
    }

    private readonly repo: PLDRepository

    private constructor(repo: PLDRepository) {
        this.repo = repo
    }

    public testService(): string[] {
        return this.repo.testRepository()
    }

    public async getAllSimbolList(dto: {
        cId: string
        cVr: string
        docNo: string
        docVr: string
        cSeq: string
    }): Promise<SimbolList[]> {
        return await this.repo.findAllSimbolList(dto)
    }

    public async getAllSimbol() {
        return await this.repo.findAllSimbol()
    }

    public async resisterPld(
        PLD_P_NUMBER: string,
        PLD_P_NAME: string,
        PLD_C_NAME: string,
        plantValue: string,
        PLD_C_DESC: string,
        selectedItems: string[],
        userId: string
    ) {
        return await this.repo.resisterPld(
            PLD_P_NUMBER,
            PLD_P_NAME,
            PLD_C_NAME,
            plantValue,
            PLD_C_DESC,
            selectedItems,
            userId
        )
    }

    public async changePldCanvas(dto: ChangePldCanvas[]) {
        await this.repo.deletePldCanvas(dto[0])

        for (let i = 0; i < dto.length; i++) {
            await this.repo.changePldCanvas(dto[i])
        }
    }

    public async addSimbolList(dto: {
        PLD_C_ID: string
        PLD_C_VR: string
        DOCNO: string
        DOCVR: string
        PLD_C_SEQ: string
        simbolList: SimbolList[]
    }) {
        const { PLD_C_ID, PLD_C_VR, PLD_C_SEQ, DOCNO, DOCVR, simbolList } = dto

        await this.repo.removeSimbolList({
            cId: `${PLD_C_ID}`,
            cVr: PLD_C_VR,
            cSeq: `${PLD_C_SEQ}`,
            docNo: DOCNO,
            docVr: DOCVR
        })

        if (simbolList.length !== 0) {
            for (let simbol of simbolList) {
                await this.repo.saveSimbol({
                    cId: `${PLD_C_ID}`,
                    cVr: PLD_C_VR,
                    cSeq: PLD_C_SEQ,
                    docNo: DOCNO,
                    docVr: DOCVR,
                    simbol
                })
            }
        }
    }

    public async getPldDocumentList(dto: { c_id: string; c_vr: string }) {
        return await this.repo.findPldDocumentList(dto)
    }

    public async getPldEntitiesList(dto: { cId: string; cVr: string; docNo: string; docVr: string; cSeq: string }) {
        return await this.repo.findPldEntitiesList(dto)
    }

    public async addEntitiesList(dto: {
        PLD_C_ID: string
        PLD_C_VR: string
        DOCNO: string
        DOCVR: string
        PLD_C_SEQ: string
        entitiesList: Entities[]
    }) {
        const { PLD_C_ID, PLD_C_VR, PLD_C_SEQ, DOCNO, DOCVR, entitiesList } = dto

        await this.repo.removeEntitites({
            cId: `${PLD_C_ID}`,
            cVr: PLD_C_VR,
            cSeq: `${PLD_C_SEQ}`,
            docNo: DOCNO,
            docVr: DOCVR
        })

        if (entitiesList.length !== 0) {
            for (let entity of entitiesList) {
                await this.repo.saveEntities({
                    cId: `${PLD_C_ID}`,
                    cVr: PLD_C_VR,
                    cSeq: `${PLD_C_SEQ}`,
                    docNo: DOCNO,
                    docVr: DOCVR,
                    entity
                })
            }
        }
    }

    public async searchPld(dto: { companyFolder: string; plantFolder: string }) {
        return await this.repo.searchPld(dto)
    }
}
