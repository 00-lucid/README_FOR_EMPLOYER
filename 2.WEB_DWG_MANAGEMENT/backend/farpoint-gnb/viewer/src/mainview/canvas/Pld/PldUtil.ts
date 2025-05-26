import { pushCommand } from '../../../common'
import { AppContextType } from '../../../context'
import Repository from '../../../Repository'
import { pldCloseValvePath, pldControlValvePath, pldOpenValvePath } from './PldIcons'

export const simbolToSvg = (simbol: any) => {
    switch (simbol.TYPE) {
        case '1':
            return pldOpenValvePath
        case '2':
            return pldCloseValvePath
        case '3':
            return pldControlValvePath
        // case '4':
        //     // return 'openCloud'
        //     return null
        // case '5':
        //     // return 'closeCloud'
        //     return null
        // case '6':
        //     // return 'controlCloud'
        //     return null
        // case '7':
        //     // return 'check'
        //     return null
        // case '8':
        //     // return 'checkRed'
        //     return null
        // case '9':
        //     // return 'checkLiteral'
        //     return null
        // case '10':
        //     // return 'setting'
        //     return null
        // case '11':
        //     // return 'choice'
        //     return null
        // case '12':
        //     // return 'auto'
        //     return null
        // case '13':
        //     // return 'vct'
        //     return null
        // case '14':
        //     // return 'drainage'
        //     return null
        // case '15':
        //     // return 'exhaust'
        //     return null
        default:
            // return ''
            return pldOpenValvePath
    }
}

export async function requestSimbolList(data: {
    cId: number | undefined
    cVr: string | undefined
    docNo: string
    docVr: string
    cSeq: number
}) {
    if (!data.cId && !data.cVr) {
        return []
    }

    return await Repository.getAllSimbolList(data)
}

export async function requestAddSimbolList(data: any[]) {
    await Repository.addSimbolList(data)
}

export async function requestEntitiesList(data: {
    cId: number | undefined
    cVr: string | undefined
    docNo: string
    docVr: string
    cSeq: number
}) {
    if (!data.cId && !data.cVr) {
        return []
    }

    return await Repository.getEntitiesList(data)
}

export async function requestAddEntitiesList(entitiesList: any[]) {
    await Repository.addEntitiesList(entitiesList)
}

export function getCurDocumentPldSeq(status: any, app: AppContextType) {
    return app.pldDocumentList.filter((el) => el.DOCNM === status.documentContext?.docName)[0].PLD_C_SEQ
}

export function resetPldData(app: AppContextType) {
    pushCommand({ name: 'allDocumentClose' })
    pushCommand({ name: 'resetPld' })
    app.setCurrentPld(null)
    app.setPldDocumentList([])
}
