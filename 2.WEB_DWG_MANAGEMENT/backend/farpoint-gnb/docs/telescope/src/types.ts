// EntityList
export type Entity = {
    id: string
}

export type EntityList = {
    id: string
    name: string
    children: EntityList[]
    items: Entity[]
}

export function getAncestor(folders: EntityList[], entities: Entity[]): Set<string> {
    const values = new Set<string>()

    for (const folder of folders) {
        for (const item of folder.items) {
            let found = false

            for (const entity of entities) {
                if (item.id === entity.id) {
                    values.add(folder.id)
                    found = true
                    break
                }
            }

            if (found) break
        }

        const children = getAncestor(folder.children, entities)

        if (0 < children.size) {
            values.add(folder.id)
            children.forEach(values.add, values)
        }
    }

    return values
}

export function isEqualEntities(array1: Entity[], array2: Entity[]) {
    return array1.length === array2.length && array1.every((value, index) => value.id === array2[index].id)
}

export type Link = {
    rel: string
    href: string
    action?: string
    types?: string[]
    templated?: boolean
}

// Drawing
export type DrawingList = {
    id: string
    name: string
    children: DrawingList[]
    items: DrawingListItem[]
}

export type DrawingListItem = {
    id: string
    name: string
    number: string
    link: Link
}

export type Drawing = {
    id: string
    name: string
    number: string
    equipments: Equipment[]
    equipmentList: EquipmentList[]
    notes: {
        links: Link[]
    }
}

// Equipment
export type EquipmentList = {
    id: string
    name: string
    children: EquipmentList[]
    items: EquipmentListItem[]
}

export type EquipmentListItem = {
    id: string
    name: string
}

export type Equipment = {
    id: string
    name: string
    handles: string[]
}

// 통지/오더
export type DrawingNotes = {
    notifications: EquipmentNote[]
    orders: EquipmentNote[]
}

export type EquipmentNote = {
    equipment: EquipmentListItem
    notes: NoteDescription[]
}

export type NoteDescription = {
    id: string
    category: string
    detail: string
    period: Period
    status: string
    url: string
}

export type Period = { start: string; end: string }

// 검색
export type SearchOption = {
    companies: { id: string; name: string }[]
    plants: { id: string; name: string; companyId: string }[]
    hogies: { id: string; name: string; plantId: string }[]
    symbols: { id: string; name: string; plantId: string }[]
}

export const nullSearchOption: SearchOption = {
    companies: [],
    plants: [],
    hogies: [],
    symbols: []
}

export type RelatedSearchOption = {
    companies: { id: string; name: string }[]
    categories: { id: string; name: string; companyId: string }[]
    types: { id: string; name: string; categoryId: string }[]
}

export const nullRlatedSearchOption = {
    companies: [],
    categories: [],
    types: []
}

// DrawingListItem과 유사. hogi만 없다. 같은 것으로 볼 것인가? 그건 아니다.
export type DocumentResult = {
    hogi: string
    docNumber: string
    docName: string
    link: Link
}

export type EquipmentResult = {
    hogi: string
    docNumber: string
    docName: string
    function: string
    equipment: Entity
    link: Link
}

export type SignalResult = {
    PLANTNM: string
    DRAW_NM: string
    TAG: string
    PAGE: string
    contentType: string
    url: string
}

export type RelatedResult = {
    DOKAR: string
    DOKNR: string
    DOKTL: string
    DOKVR: string
    DKTXT: string
    ZZCHANGEDATE: string
    EGUBUN: string
    FGUBUN: string
    DOKARNM: string
}
