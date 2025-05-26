type SymbolResult = {
    libId: string
    libName: string
    libDesc: string
    parent: string
}
type DocumentResult = {
    hogi: string
    docNumber: string
    docName: string
    docId: string
    docVer: string
    folderId: string
    plantCode: string
}
type EquipmentResult = {
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
type SearchSignalResult = {
    SNO: number
    TAG: string
    DRAW_NM: string
    PAGE: string
    FILE_PATH: string
    PLANTCODE: string
    FILENM: string
    PLANTNM: string
    viewerUrl?: string | undefined
}

type SearchListViewProps = {
    searchList: DocumentResult[]
    docMap: Map<string, DocumentResult>
    setDocMap: React.Dispatch<React.SetStateAction<Map<string, DocumentResult>>>
}
