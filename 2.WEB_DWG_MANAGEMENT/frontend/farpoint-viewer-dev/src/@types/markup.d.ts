type DrawingPath = {
    type: string
    width: number
    color: string
    values: number[]
    texts: string[]
    cmd?: string
    dash: number[]
    area: number[]
}
type MarkupContent = {
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
type InsertMarkupValue = {
    docId: string
    docVer: string
    plantCode: string
    userId: string
    title: string
    paths: DrawingPath[]
    isPublic: number
}

type DeleteMarkupValue = {
    docId: string
    docVer: string
    plantCode: string
    userId: string
    seqs: string[]
}

type UpdateMakrupValue = {
    docId: string
    docVer: string
    plantCode: string
    userId: string
    title: string
    paths: DrawingPath[]
    isPublic: number
    seq: number
}

type MarkupViewProps = {
    markups: MarkupContent[]
    selectedItems: Set<string>
    setSelectedItems: (set: Set<string>) => void
}

type MarkupPopupValue = {
    message: string
    nextAction: () => void
}
