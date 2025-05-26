type DocumentKey = { docId: string; docVer: string }
type SelectedDocument = {
    docKey: DocumentKey
    plantCode: string
}
type FavoriteDocument = { docId: string; docVer: string; plantCode: string; docName: string; docNumber: string }
type DocumentContext = {
    docId: string
    docVer: string
    plantCode: string
    docName: string
    docNumber: string
    equipmentList: EquipmentList[]
}
type DocumentList = {
    folderName: string
    parentId: string | null
    subfolders: DocumentList[]
    documents: DocumentItem[]
    folderId: string
    plantCode: string
}
type DocumentItem = {
    docId: string
    docVer: string
    plantCode: string
    docName: string
    folderId: string
    docNumber: string
}

type DocFolder = { folderId: string; folderName: string; plantCode: string; parent: string | null }
