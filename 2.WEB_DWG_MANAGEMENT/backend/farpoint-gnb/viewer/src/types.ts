import CryptoJS from 'crypto-js'

export type DocumentList = {
    folderName: string
    parentId: string | null
    subfolders: DocumentList[]
    documents: Document[]
}

export type DocFolder = { folderId: string; folderName: string; plantCode: string; parent: string | null }

export type Document = {
    docId: string
    docVer: string
    plantCode: string
    docName: string
    folderId: string
    docNumber: string
}

export type DocumentContext = {
    docName: string
    docNumber: string
    docId: string
    docVer: string
    plantCode: string
    equipmentList: EquipmentList[]
}

export type EquipmentList = {
    libId: string
    libName: string
    libDesc: string
    parentId: string
    subfolders: EquipmentList[]
    equipments: EquipmentContext[]
}

export type EquipmentContext = {
    tagId: string
    tagType: string
    libDesc: string
    libId: string
    docVer: string
    connection: string
    intelligent: string
    function: string
    handles: EquipmentHandle[]
}

export type EquipmentHandle = { handle: string; tagType: string }

export type DocumentKey = { docId: string; docVer: string }
export type EquipmentKey = { tagId: string }

export type DocumentResult = {
    hogi: string
    docNumber: string
    docName: string
    docId: string
    docVer: string
    folderId: string
    plantCode: string
}

export type EquipmentResult = {
    hogi: string
    docNumber: string
    docName: string
    docId: string
    docVer: string
    folderId: string
    tagId: string
    function: string
    plantCode: string
}

export type SymbolResult = {
    libId: string
    libName: string
    libDesc: string
    parent: string
}
export type RelatedFolder = {
    TEXT: string
    VALUE: string
    SEQ: string
}

export type RelatedSearchResult = {
    DOKAR: string
    DOKNR: string
    DOKTL: string
    DOKVR: string
    DKTXT: string
    ZZCHANGEDATE: string
    EGUBUN: string
    FGUBUN: string
    DOKARNM: string
    // files: RelatedFileInfo[]
}

export type RelatedFileInfo = {
    DOKAR: string
    DOKVR: string
    DOKTL: string
    DOKNR: string
    FILENAME: string
    DAPPL: string
    FILE_IDX: number
    viewerUrl?: string
}

export type SearchSignalResult = {
    SNO: number
    TAG: string
    DRAW_NM: string
    PAGE: string
    FILE_PATH: string
    PLANTCODE: string
    FILENM: string
    PLANTNM: string
    viewerUrl?: string
}

export type OpcHandle = {
    docId: string
    docVer: string
    plantCode: string
    hogi: string
    tagId: string
}

export type EquipmentLink = {
    tagId: string
    tagType: string
    equipmentLinkId: string | undefined
    funcDetail: string | undefined
    linkObject: string | undefined
    //for opc
    opcDocId: string | undefined
    opcDocVer: string | undefined
    opcHogi: string | undefined
    opcTagId: string | undefined
    opcPlantCode: string | undefined
    opcConnection: string | undefined
}

export type DrawingPath = {
    type: string
    width: number
    color: string
    values: number[]
    texts: string[]
    cmd?: string
    dash: number[]
    area: number[]
}

export type MarkupContent = {
    seq: string
    writer: { userId: string; name: string }
    docId: string
    docVer: string
    plantCode: string
    title: string
    paths: DrawingPath[]
    isPublic: number
    createDate: string
}

export type InsertMarkupValue = {
    docId: string
    docVer: string
    plantCode: string
    userId: string
    title: string
    paths: DrawingPath[]
    isPublic: number
}

export type UpdateMarkupValue = {
    docId: string
    docVer: string
    plantCode: string
    userId: string
    title: string
    paths: DrawingPath[]
    isPublic: number
    seq: number
}

export type DeleteMarkupValue = {
    docId: string
    docVer: string
    plantCode: string
    userId: string
    seqs: string[]
}

export type Color = { r: number; g: number; b: number }

// 통지/오더
export type Notiorder = {
    type: string // 'noti', 'order'
    id: string // qmnum/aufnr
    detail: string // qmtxt/ktext
    function: string // mapar
    equipmentExtId: string // equnr
    taskType: string // qmart,auart
    startDate: string // qmdate,gstrp
    endDate: string // qmdate,gltrp
    status: string // status
}

export type EquipmentNotiorder = {
    tagId: string
    function: string
    notifications: Notiorder[]
    orders: Notiorder[]
}

export type FavoriteDocument = { docId: string; docVer: string; plantCode: string; docName: string; docNumber: string }
export type FavoriteEquipment = {
    docId: string
    docVer: string
    plantCode: string
    docName: string
    docNumber: string
    tagId: string
    function: string
}
export type UserContext = {
    userId: string
    favorite: {
        documents: FavoriteDocument[]
        equipments: FavoriteEquipment[]
    }
}

const secret = CryptoJS.enc.Utf8.parse('d4g7u2db7g0l2r1dhy3svgt871segu09')

export function encrypt(source: string | undefined) {
    if (!source) return undefined

    const opt = { iv: CryptoJS.enc.Utf8.parse(''), padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC }
    const encrypted = CryptoJS.AES.encrypt(source, secret, opt)
    const output = encrypted.toString()

    return encodeURIComponent(output)
}

export function decrypt(source: string | undefined | null) {
    if (!source) return undefined

    const opt = { iv: CryptoJS.enc.Utf8.parse(''), padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC }
    const decrypted = CryptoJS.AES.decrypt(source, secret, opt)
    const output = CryptoJS.enc.Utf8.stringify(decrypted)

    return output
}

export type MydocList = {
    id: string
    folderName: string
    subfolders: MydocList[]
    documents: Mydoc[]
}

export type Mydoc = {
    id: string
    filename: string
    size: number
    viewerUrl?: string
}

export type EquipmentsList = {
    id: string
}

export type OrderListFlag = {
    taskType: string // qmart,auart
    id: string // qmnum/aufnr
    detail: string // qmtxt/ktext
    startDate: string // qmdate,gstrp
    endDate: string // qmdate,gltrp
    status: string // status
}
export type OrderList = {
    id: string // qmnum/aufnr
    detail: string // qmtxt/ktext
    wcaNo: string
    wcdNo: string
    status: string // status
    object: string
}
export type TagginItemList = {
    counter: string
    object: string
    order: string
    setOption: string
    setCaution: string
    resetOption: string
    resetCaution: string
    line: string
    docNo: string
}

export type Point2d = {
    x: number
    y: number
}

export type Simbol = {
    svg: {
        path: JSX.Element
        viewBox: string
    }
    createPoint: Point2d
}

export type ProcessList = {
    id: string
    name: string
    plantcode: string
    docvr: string
    subFolders: ProcessList[]
    processes: Process[]
    type: string
    callback: any
    status: string
}

export type Process = {
    id: string
    handle: string
    equipment: any | null
    status: string
}

export type PldInfo = {
    PLD_C_ID: number
    PLD_C_VR: string
    COMPANY: { company: string; plant: string }
    PLD_P_NUMBER: string
    PLD_P_NAME: string
    PLD_C_NAME: string
    FOLID: number
    FOLPT: number
}

export type PldDocument = {
    PLD_C_ID: number
    PLD_C_VR: string
    PLD_C_SEQ: number
    PLD_P_ID: number
    DOCNO: string
    DOCVR: string
    SEQ: number
    USER_ID: string
    DOCNM: string
    PLANTCODE: string
    CURRENT_YN: number
    PLD_DOC_DESC: string
}

export type Entities = {
    PLD_C_ID: number
    PLD_C_VR: string
    DOCNO: string
    DOCVR: string
    HANDLE: string
    HANDLE_TYPE: string
    PLD_C_SEQ: number
    FUNCTION: string | null
    TYPE: string | null
}

export type PldList = {
    DOCNM: string
    PLD_C_ID: number
    PLD_P_NUMBER: string
    FOLID: number
    FOLNM: string
    FOLPT: number
    FOLPTNM: string
    COMPANY: { COMPANY: string; PLANT: string }
    PLD_P_NAME: string
    PLD_C_NAME: string
    PLD_C_VR: string
    PLD_C_DESC: string
    REGDT: string
    USER_ID: string
    DOCLIST: string[]
}
