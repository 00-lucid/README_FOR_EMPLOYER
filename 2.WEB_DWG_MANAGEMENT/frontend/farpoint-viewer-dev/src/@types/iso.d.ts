type ISOInfo = {
    DOKAR: string
    DOKNR: string
    DOKTL: string
    DOKVR: string
    OBJKY: string
}

type ISODraw = {
    EQUIPMENT: string
    FUCNTION: string
    DRAW: string
    OBJ: string
}

type ISOPopupValue = {
    message: string
    nextAction: () => void
}

type ISOViewProps = {
    ISODrawList: ISODraw[]
    selectedISODraw: Set<string>
    setSelectedISODraw: (set: Set<string>) => void
}