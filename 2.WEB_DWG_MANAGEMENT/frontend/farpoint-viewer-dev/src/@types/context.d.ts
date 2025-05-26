// AppContext --
type AppContextType = {
    AppCtxStates: {
        userId: string | undefined
        pldMode: boolean
        userContext: UserContext | undefined
        isMarkupChanged: boolean
        currentPld: PldInfo | null
        pldDocumentList: PldDocument[]
        controlMode: string
    }
    AppCtxActions: {
        addDocumentFavorite: (value: FavoriteDocument) => void
        removeDocumentFavorite: (value: DocumentKey) => void
        addEquipmentFavorite: (value: FavoriteEquipment) => void
        removeEquipmentFavorite: (docKey: DocumentKey, value: EquipmentKey) => void
        setMarkupChanged: (value: boolean) => void
        togglePldMode: () => void
        setCurrentPld: (pld: PldInfo | null) => void
        setPldDocumentList: (list: any[]) => void
        setControlMode: React.Dispatch<React.SetStateAction<string>>
    }
}
type UserContext = {
    userId: string
    favorite: {
        documents: FavoriteDocument[]
        equipments: FavoriteEquipment[]
    }
}

// ThemeContext --
type Color = { r: number; g: number; b: number }
type ColorStyles = {
    [key: string]: { color: Color; index: number }
}
type Theme = {
    type: string
    backgroundColor: Color
    strokeColor: Color
    mouseOverColor: Color
    selectedColor: Color
    equipmentLibColor: Color
    notificationColor: Color
    orderColor: Color
    pldColor: Color
    pldMainLineColor: Color
    pldSubLineColor: Color
    pldOpenValveColor: Color
    pldCloseValveColor: Color
    pldControlValveColor: Color
}

type DisplayType = 'name' | 'number'

// StatusContext --
type onMenuChange = {
    onMenuChange: (menuId: string, userId: string | undefined) => void
}
type onMenuChange2 = {
    onMenuChange: (
        menuId: string,
        userId: string | undefined,
        setCurrentMenu: (valOrUpdater: string | ((currVal: string) => string)) => void
    ) => void
}

type StatusContextType = {
    StatusCtxStates: {
        currentMenu: string
        selectedIds: Set<string>
        canvases: CanvasContext[]
        selectedCanvas: CanvasContext | undefined
        selectedDocFile: Uint8Array | undefined
        libId: string | undefined
        selectEquipment: EquipmentContext | undefined
    }
    StatusCtxActions: {
        setCurrentMenu: React.Dispatch<React.SetStateAction<string>>
        onMenuChange: (menuId: string, userId: string | undefined) => void
        setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
        setCanvases: React.Dispatch<React.SetStateAction<CanvasContext[]>>
        setSelectedCanvas: React.Dispatch<React.SetStateAction<CanvasContext | undefined>>
        setSelectedDocFile: React.Dispatch<React.SetStateAction<Uint8Array | undefined>>
        setLibId: React.Dispatch<React.SetStateAction<string | undefined>>
        setSelectEquipment: React.Dispatch<React.SetStateAction<EquipmentContext | undefined>>
    }
}

type MenuContextType = {
    currentMenu: string
    onMenuChange: (menuId: string, userId: string | undefined) => void
}
type CanvasContext = {
    documentCtx: DocumentContext
    docFile: Uint8Array
    equipmentsByHandle: Map<string, EquipmentContext[]>
    equipmentByTagId: Map<string, EquipmentContext>
    handlesByLibId: Map<string, string[]>
    parentIdByLibId: Map<string, string>
    state: ViewParams | undefined
    registeredHandles: Set<string>
}

type CanvasContextType = {
    canvasController: CanvasController | undefined
    setCanvasController: React.Dispatch<React.SetStateAction<CanvasController | undefined>>
}
type PainterContextType = {
    entityPainter: EntityPainter | undefined
    setEntityPainter: React.Dispatch<React.SetStateAction<EntityPainter | undefined>>
}
