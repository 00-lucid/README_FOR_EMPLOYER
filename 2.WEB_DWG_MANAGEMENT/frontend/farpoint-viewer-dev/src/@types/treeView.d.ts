type DocumentFolders = {
    folderList: DocumentList[]
    depth: number
    keyIdx: number
}
type PldDocumentFolders = {
    folderList: PldDocument[]
    depth: number
    keyIdx: number
    currentPld: PldInfo
}
type PldEquipmentFolders = {
    pldDocument: PldDocument
    depth: number
    keyIdx: number
}
type DocumentItemProps = {
    documentList: DocumentItem[]
    depth: number
    keyIdx: number
}
type EquipmentItemProps = {
    equipmentList: EquipmentContext[]
    depth: number
    keyIdx: number
    parentId: string
}
type EquitmentFolders = {
    folderList: EquipmentList[]
    depth: number
    keyIdx: number
    sideBarEquipmentFolderShowSelect: (
        oldLibId: string | undefined,
        newLibId: string | undefined,
        selectedCanvas: CanvasContext | undefined,
        setLibId: (valOrUpdater: string | ((currVal: string | undefined) => string | undefined) | undefined) => void,
        entityPainter: any,
        setBanner: (message: string | undefined) => void
    ) => Promise<void>
}
type TreeViewItemLabel = {
    height: number
    heightUnit: string
    selected: { open: JSX.Element; close: JSX.Element }
    normal: { open: JSX.Element; close: JSX.Element }
}
type TreeViewItemProps = {
    children?: any
    label: TreeViewItemLabel
    offset: number
    childrenHeight: number
    onClick: () => void
    isExtended: boolean
    isSelected: boolean
}
type TreeViewItemLabel = {
    height: number
    heightUnit: string
    selected: { open: JSX.Element; close: JSX.Element }
    normal: { open: JSX.Element; close: JSX.Element }
}

type DoucmentTreeViewProps = {
    id: string
    documentList: DocumentList[]
    style?: React.CSSProperties
}
type EquitmentTreeViewProps = {
    id: string
    equipmentList: EquipmentList[]
}

type DateInputProps = {
    text: string
    depth: number
    date: Date
    onChange: (date: Date) => void
}

type FavoriteTreeViewProps = {
    id: string
    items: TreeViewItemSource[]
    extendedIds: Set<string>
    selectedIds: Set<string>
    style?: React.CSSProperties
}

type TreeViewItemValue = {
    elements: JSX.Element[]
    height: number
}

type TreeViewFolderOption = {
    folderIcon?: boolean
    selectAllIcon?: SelectAllIconOption
}

type TreeViewItemValue = {
    elements: JSX.Element[]
    height: number
}
