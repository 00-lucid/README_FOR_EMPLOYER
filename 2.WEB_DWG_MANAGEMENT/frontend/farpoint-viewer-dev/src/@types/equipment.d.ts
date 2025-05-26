type EquipmentKey = { tagId: string }
type FavoriteEquipment = {
    docId: string
    docVer: string
    plantCode: string
    docName: string
    docNumber: string
    tagId: string
    function: string
}
type EquipmentLink = {
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
type EquipmentList = {
    libId: string
    libName: string
    libDesc: string
    parentId: string
    subfolders: EquipmentList[]
    equipments: EquipmentContext[]
}
type EquipmentContext = {
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
type EquipmentHandle = { handle: string; tagType: string }

// desc. change => 도면변경 여부
type equipMoveAction = { change: boolean; tagId: string | undefined }
