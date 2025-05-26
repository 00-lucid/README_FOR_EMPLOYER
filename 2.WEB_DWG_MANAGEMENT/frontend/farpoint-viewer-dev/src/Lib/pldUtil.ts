import {
    autoPath,
    choicePath,
    closeCloudPath,
    controlCloudPath,
    drainPath,
    openCloudPath,
    pldCheckedPath,
    pldCloseValvePath,
    pldControlValvePath,
    pldOpenValvePath,
    settingPath,
    undefindPath,
    vctPath,
    ventPath,
} from '../View/MainView/Canvas/Pld/PldIcons'

export const simbolToSvg = (type: string) => {
    switch (type) {
        case '1':
            return pldOpenValvePath
        case '2':
            return pldCloseValvePath
        case '3':
            return pldControlValvePath
        case '4':
            return openCloudPath
        case '5':
            return closeCloudPath
        case '6':
            return controlCloudPath
        // case '7':
        //     // return 'check'
        //     return null
        // ! 9번 또는 7번일 수 있음
        case '8':
            return pldCheckedPath
        // case '9':
        //     // return 'checkLiteral'
        //     return null
        case '10':
            return settingPath
        case '11':
            return choicePath
        case '12':
            return autoPath
        case '13':
            return vctPath
        case '14':
            return drainPath
        case '15':
            return ventPath
        default:
            return {
                path: undefindPath.path,
                viewBox: '',
                type,
            }
    }
}

//export async function requestSimbolList(data: {
//    cId: number | undefined
//    cVr: string | undefined
//    docNo: string
//    docVr: string
//    cSeq: number
//}) {
//    if (!data.cId && !data.cVr) {
//        return []
//    }

//    return await Repository.getAllSimbolList(data)
//}

//export async function requestAddSimbolList(data: any[]) {
//    await Repository.addSimbolList(data)
//}

//export function getCurDocumentPldSeq(status: any, app: AppContextType) {
//    return app.pldDocumentList.filter((el) => el.DOCNM === status.documentContext?.docName)[0].PLD_C_SEQ
//}
