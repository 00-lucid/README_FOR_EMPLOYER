type FavoriteDocument = {
    docId: string
    docVer: string
    plantCode: string
    docName: string
    docNumber: string
}

type FavoriteEquipment = {
    docId: string
    docVer: string
    plantCode: string
    docName: string
    docNumber: string
    tagId: string
    function: string
}

type TreeViewItemSource = {
    label: TreeViewItemLabel
    key: string
    items: TreeViewItemSource[]
    onClick: () => void
}

type DocFavoriteItemProps = {
    docList: FavoriteDocument[]
    depth: number
    keyIdx: number
}

type EquipFavoriteItemProps = {
    equipList: FavoriteEquipment[]
    depth: number
    keyIdx: number
}
