type PldInfo = {
    PLD_C_ID: number
    PLD_C_VR: string
    COMPANY: { company: string; plant: string }
    PLD_P_NUMBER: string
    PLD_P_NAME: string
    PLD_C_NAME: string
    FOLID: string
    FOLPT: string
}

type PldDocument = {
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
type Entities = {
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

type StepProps = {
    onStepChange: () => void
    allClear: () => void
}

type PldList = {
    DOCNM: string
    PLD_C_ID: number
    PLD_P_NUMBER: string
    FOLID: string
    FOLNM: string
    FOLPT: string
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

type ProcessList = {
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

type PldEquipmentFolderType = {
    type: string
    name: string
    code: string
}
type svgList = {
    svg: curSvg
    createPoint: Point2d
    radpt: Point2d
    seq: number
}
type curSvg = { path: JSX.Element; viewBox: string; type: string }

type pldDataParam = {
    cId: number | undefined
    cVr: string | undefined
    docNo: string
    docVr: string
    cSeq: number
}

type getAllSimbolListResp = {
    DOCNO: string
    DOCVR: string
    PLD_C_ID: number
    PLD_C_SEQ: number
    PLD_C_VR: string
    POINT1_X: number
    POINT1_Y: number
    POINT1_Z: number
    RADPT_X: number
    RADPT_Y: number
    RADPT_Z: number
    ROTATION: number
    SEQ: number
    TYPE: string
}

type svgList = {
    svg: curSvg
    createPoint: {
        x: number
        y: number
    }
    radpt: {
        x: number
        y: number
    }
}
type pldSimbolList = {
    seq: number
    type: string
    point1X: number
    point1Y: number
    radptX: number
    radptY: number
    PLD_C_SEQ: number
    svg: curSvg
}
type PldSvgProps = {
    viewer: any
    lib: any
}

type PldSimbolProps = {
    pldSimbolItem: pldSimbolList
    viewer: any
    lib: any
    idx: number
}

type PldEditorProps = {
    viewer: any
    boundingClientRect: React.MutableRefObject<DOMRect | null>
    canvasPoint: Point2d
    svgWidth: number
    svgHeight: number
    setSvgWidth: (width: number) => void
    setSvgHeight: (height: number) => void
    docPoint: React.MutableRefObject<{
        x: number
        y: number
    }>
    updateBoundingClientRect: () => void
    idx: number
    updateSimbolList: () => void
    setCanvasPoint: (point: Point2d) => void
}

type pldOpenValvePath = {
    path: JSX.Element
    viewBox: string
    type: string
}

type PldEquipment = {
    handle: string
    type: string
    function: string
}
