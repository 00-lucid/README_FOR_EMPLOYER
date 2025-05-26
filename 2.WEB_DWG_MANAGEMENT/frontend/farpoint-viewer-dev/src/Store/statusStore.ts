import { atom, selector } from 'recoil'

const StatusStore = {
    // VisualizeJs Viewer
    viewer: atom<any>({
        key: 'viewer',
        default: undefined,
    }),
    // VisualizeJs Lib Instant
    lib: atom<any>({
        key: 'lib',
        default: undefined,
    }),

    // 도면 폴더 리스트
    documentList: atom<DocumentList[]>({
        key: 'documentList',
        default: [],
    }),
    // 선택된 사이드 메뉴
    currentMenu: atom({
        key: 'currentMenu',
        default: '',
    }),
    // 저장하고 있을 도면 목록
    canvases: atom<CanvasContext[]>({
        key: 'canvases',
        default: [],
    }),
    // 선택된 도면 정보
    selectedCanvas: atom<CanvasContext | undefined>({
        key: 'selectedCanvas',
        default: undefined,
    }),
    // 선택된 도면 파일
    selectedDocFile: atom<Uint8Array | undefined>({
        key: 'selectedDocFile',
        default: undefined,
    }),
    // 선택된 설비 목록
    selectEquipments: atom<Set<string>>({
        key: 'selectEquipments',
        default: new Set<string>(),
    }),
    selectedDocFolderIds: atom<Set<string>>({
        key: 'selectedDocFolderIds',
        default: new Set<string>(),
    }),
    // 선택된 설비 폴더 : (key : equipmentObj.libId + equipmentObj.parentId)
    selectedEquipFolderIds: atom<Set<string>>({
        key: 'selectedEquipFolderIds',
        default: new Set<string>(),
    }),
    // 사이드바에 선택된 도면을 구분해주기 위한 상태 값 (value: docId + '_' + docVer)
    selectedDocKey: atom<string>({ key: 'selectedDocKey', default: '' }),

    // libId => (선택된 설비 ID) | 'all' | undefined
    // desc. 선택된 카테고리의 설비들의 색상을 변경하기 위한 상태값
    libId: atom<string | undefined>({
        key: 'libId',
        default: undefined,
    }),
    // PLD 모드 여부
    pldMode: atom<boolean>({
        key: 'pldMode',
        default: false,
    }),
    // 사이드바 - 이전에 열려있던 폴더 ID
    exLibId: atom<string>({
        key: 'exLibId',
        default: '',
    }),
    // controlMode (캔버스 컨트롤 모드.) (vlaue: 'select' | 'markup' | 'erase' | 'pld' | 'pldSelect')
    controlMode: atom<string>({
        key: 'controlMode',
        default: 'select',
    }),

    // Yes or No 팝업 상태
    yesNoPopupValue: atom<YesNoPopupValue | undefined>({
        key: 'yesNoPopupValue',
        default: undefined,
    }),
    // 확인 팝업 상태
    okPopupValue: atom<OkPopupValue | undefined>({
        key: 'okPopupValue',
        default: undefined,
    }),
    // waning 팝업 상태
    warningPopupValue: atom<WarningPopupValue | undefined>({
        key: 'warningPopupValue',
        default: undefined,
    }),

    // input 팝업 상태
    inputPopupValue: atom<InputPopupValue | undefined>({
        key: 'inputPopupValue',
        default: undefined,
    }),

    // picture 팝업 상태
    picturePopupValue: atom<PicturePopupValue | undefined>({
        key: 'picturePopupValue',
        default: undefined,
    }),

    // 통지 태그 아이디
    notifications: atom<EquipmentKey[]>({
        key: 'notifications',
        default: [],
    }),
    // 오더 태그 아이디
    orders: atom<EquipmentKey[]>({
        key: 'orders',
        default: [],
    }),

    // 도면, 마크업 초기화 실행 -> /SideView/ConversionMenu -> useEffect
    docAndMarkupResetActive: atom<boolean>({ key: 'docAndMarkupResetActive', default: false }),
    // Pld 초기화 실행 -> /SideView/ConversionMenu -> useEffect
    pldResetActive: atom<boolean>({ key: 'pldResetActive', default: false }),

    isShowISOPopup: atom<ISOPopupValue | undefined>({
        key: 'isShowISOPopup',
        default: undefined,
    }),

    ISOList: atom<ISOInfo[]>({
        key: 'ISOList',
        default: [],
    }),

    selectISOInfo: atom<Set<string>>({
        key: 'selectISOInfo',
        default: new Set<string>(),
    }),

    ISODrawList: atom<ISODraw[]>({
        key: 'ISODraw',
        default: [],
    }),

    isShowPiMimicPopup: atom<MimicPopupValue | undefined>({
        key: 'isShowPiMimicPopup',
        default: undefined,
    }),

    MimicList: atom<Mimic[]>({
        key: 'MimicList',
        default: [],
    }),

    selectMimic: atom<Set<string>>({
        key: 'selectMimic',
        default: new Set<string>(),
    }),

    isShowOption: atom<boolean>({
        key: 'isShowOption',
        default: false,
    }),

    layerIds: atom<any[]>({
        key: 'layerIds',
        default: [],
    }),

    // 선택한 사업소
    companyValue: atom<SelectItem | undefined>({ key: 'companyValue', default: undefined }),
    // 선택한 발전소
    plantValue: atom<SelectItem | undefined>({ key: 'plantValue', default: undefined }),
    // 선택한 호기
    hogiValue: atom<SelectItem | undefined>({ key: 'hogiValue', default: undefined }),

    // 사업소 폴더 아이템
    companyItems: atom<SelectItem[]>({ key: 'companyItems', default: [] }),
    // 발전소 폴더 아이템
    plantItems: atom<SelectItem[]>({ key: 'plantItems', default: [] }),
    // 호기 폴더 아이템
    hogiItems: atom<SelectItem[]>({ key: 'hogiItems', default: [] }),

    // mapFolderList, mapDocItemList- 폴더이름으로 쉽게 찾을수 있도록 폴더 구조를 Map으로 관리
    mapFolderList: atom<Map<string, SelectItem[]>>({ key: 'mapFolderList', default: new Map<string, SelectItem[]>() }),
    mapDocItemList: atom<Map<string, DocumentItem[]>>({ key: 'mapDocItemList', default: new Map<string, DocumentItem[]>() }),
    // 도면의 사업소 경로 정보 (한빛-1발전소-2호기)
    mapDocPathName: atom<Map<string, string>>({ key: 'mapDocPathName', default: new Map<string, string>() }),

    mapNameByPlantCode: atom<Map<string, string>>({ key: 'mapNameByPlantCode', default: new Map<string, string>() }),

    // 프로그레스바 배너 메시지
    banner: atom<string | undefined>({
        key: 'banner',
        default: undefined,
    }),

    isPrintPopup: atom<boolean>({
        key: 'isPrintPopup',
        default: false,
    }),

    // 현재도면의 설비 객체 Map
    entityMap: atom<Map<string, any>>({ key: 'entityMap', default: new Map<string, any>() }),
}

const MarkUpStore = {
    // DrawingPath List
    markupPaths: atom<DrawingPath[]>({
        key: 'markupPaths',
        default: [],
        dangerouslyAllowMutability: true,
    }),
    // markupContents
    markupContents: atom<MarkupContent[]>({
        key: 'markupContents',
        default: [],
    }),
    // 마크업 편집 팝업 툴바 show 여부
    isEditMarkupView: atom<boolean>({
        key: 'isEditMarkup',
        default: false,
    }),
    // 마크업 팝업 show 여부 (리스트, 불러오기)
    isShowMarkupPopup: atom<MarkupPopupValue | undefined>({
        key: 'isShowMarkupPopup',
        default: undefined,
    }),

    // 로드된 마크업 편집 여부
    isMarkupChanged: atom<boolean>({
        key: 'isMarkupChanged',
        default: false,
    }),

    // selectedMarkupItems
    selectedMarkupItems: atom<Set<string>>({
        key: 'selectedMarkupItems',
        default: new Set<string>(),
    }),

    // Undo 리스트
    undoList: atom<DrawingPath[]>({
        key: 'undoList',
        default: [],
    }),

    //Redo 리스트
    redoList: atom<DrawingPath[]>({
        key: 'redoList',
        default: [],
    }),

    // 현재 선택된 편집할 도형 인덱스
    editMarkupIdx: atom<number>({
        key: 'editMarkupIdx',
        default: -1,
    }),

    // 마크업 스타일
    drawingStyle: atom({
        key: 'drawingStyle',
        default: {
            type: 'line',
            width: 10,
            color: '#ff0000',
            texts: ['', '', '', '', 'left', ''],
        },
        dangerouslyAllowMutability: true,
    }),

    // 마크업 텍스트 모드 실행을 위한 Object
    textInputObj: atom({
        key: 'textInputObj',
        default: {},
    }),

    // 현재 선택된 도면에서 불러온 마크업 제목
    currentMarkupTitle: atom({
        key: 'currentMarkup',
        default: '',
    }),

    // 등록된 마크업 있는지 확인
    hasMarkups: selector({
        key: 'hasMarkups',
        get: ({ get }) => {
            const markupContents: MarkupContent[] = get(MarkUpStore.markupContents)
            return 0 < markupContents.length
        },
    }),

    isZoomExtends: atom({
        key: 'isZoomExtends',
        default: false,
    }),
}

const WCDStore = {
    wcdEquipments: atom<string[]>({
        key: 'wcdEquipments',
        default: [],
    }),

    selWCDEquipment: atom<EquipmentContext[]>({
        key: 'selWCDEquipment',
        default: undefined,
    }),

    wcdTagDoc: atom<any>({
        key: 'wcdTagDoc',
        default: [],
        dangerouslyAllowMutability: true,
    }),

    wcdTagItem: atom<string[]>({
        key: 'wcdTagItem',
        default: [],
    }),

    isRelativeDoc: atom<boolean>({
        key: 'isRelativeDoc',
        default: false,
    }),
}

const PMDCStore = {
    // 툴바 아이콘의  ON/OFF 를 위한 변수
    isPMDC: atom<boolean>({
        key: 'isPMDC',
        default: false,
    }),

    isPMDCChanged: atom<boolean>({
        key: 'isPMDCChanged',
        default: false,
    }),

    pmdcEquipments: atom<any>({
        key: 'pmdcEquipments',
        default: [],
    }),

    isPMDCTagOn: atom<boolean>({
        key: 'isPMDCTagOn',
        default: false,
    }),

    selPMDCEquipment: atom<any>({
        key: 'selPMDCEquipment',
        default: [],
    }),

    // PMDC 데이터를 담을 배열
    PMDCArr: atom({
        key: 'PMDCArr',
        default: [{}],
    }),

    // 도면의 위치와 PMDC 팝업이 같이 움직이게 하기 위한 팝업의 X, Y 값
    curDivPos: atom<any>({
        key: 'curDivPos',
        default: [{}],
    }),

    scale: atom<number>({
        key: 'scale',
        default: 0,
    }),

    isShowPm: atom<boolean>({
        key: 'isShowPm',
        default: true,
    }),

    alarmList: atom<Set<string>>({
        key: 'alarmList',
        default: new Set<string>(),
    }),

    testData: atom({
        key: 'testData',
        default: [],
    }),

    PMGraph: atom<string>({
        key: 'PMGraph',
        default: '',
    }),

    // ws: atom({
    //     key: 'ws',
    //     default: new WebSocket('ws://localhost:5005'),
    // }),
}

const MainViewPopupStore = {
    // x, y -> 메인 팝업 메뉴의 x,y 좌표
    x: atom<number>({
        key: 'x',
        default: -1,
    }),
    y: atom<number>({
        key: 'y',
        default: -1,
    }),
    equipmentLinks: atom<EquipmentLink[]>({
        key: 'equipmentLinks',
        default: [],
    }),
}
const PldStore = {
    // 현재 PLD 상태
    currentPld: atom<PldInfo | undefined>({ key: 'currentPld', default: undefined }),
    // 선택된 PLD 도면 리스트
    pldDocumentList: atom<PldDocument[]>({ key: 'pldDocumentList', default: [] }),
    // 선택된 PLD 도면
    selectedPldDocument: atom<PldDocument | undefined>({ key: 'selectedPldDocument', default: undefined }),
    // PLD 생성 절차 (1 or 2)
    registerStep: atom<number>({ key: 'registerStep', default: 1 }),

    // PLD - NEW (생성) ----
    // 선택한 호기의 도면 리스트
    documentListFiltered: atom<DocumentItem[]>({ key: 'documentListFiltered', default: [] }),
    // 절차서 번호
    procedureNumber: atom<string>({ key: 'procedureNumber', default: '' }),
    // 절차서 명
    procedureName: atom<string>({ key: 'procedureName', default: '' }),
    // PLD 명
    pldNameValue: atom<string>({ key: 'pldNameValue', default: '' }),
    // PLD 설명
    pldDescValue: atom<string>({ key: 'pldDescValue', default: '' }),
    // PLD - NEW ---- end

    // PLD - 열기 ----
    // 열기 메뉴에서 사용하는 companyItems (desc. 전체 추가)
    openCompanyItems: selector({
        key: 'openCompanyItems',
        get: ({ get }) => {
            const companyItems: SelectItem[] = get(StatusStore.companyItems)
            const newCompayItems = companyItems.concat({ value: '', text: '-전체-' })
            return newCompayItems
        },
    }),
    // 선택한 사업소
    openCompanyValue: atom<string>({ key: 'openCompanyValue', default: '' }),
    // 선택한 발전소
    openPlantValue: atom<string>({ key: 'openPlantValue', default: '' }),
    // 발전소 폴더 아이템
    openPlantItems: atom<SelectItem[]>({ key: 'openPlantItems', default: [] }),
    // PLD - 열기 ---- end

    // PLD - 프로세스 ----
    // Pld 도면 리스트 팝업 상태
    pldDocListPopupValue: atom<PldDocListPopupValue | undefined>({
        key: 'pldDocListPopupValue',
        default: undefined,
    }),
    // PLD - 프로세스 ----end

    // PLD 상태
    // 선택한 핸들(설비)
    pldHandle: atom<string>({ key: 'pldHandle', default: '' }),
    // 선택한 핸들(설비) 타입 (1 or 2) (desc. 일반적으로 1:설비, 2: 라인)
    pldHandleEntityType: atom<number>({ key: 'pldHandleEntityType', default: 1 }),
    // PLD 설비 리스트 (handle, type, function)
    pldEquipList: atom<PldEquipment[]>({ key: 'pldEquipList', default: [] }),
    // PLD 추가된 핸들(설비) 리스트
    pldHandleList: atom<string[]>({ key: 'pldHandleList', default: [] }),
    // PLD 추가된 핸들(설비) 타입
    pldHandleListTypes: atom<string[]>({ key: 'pldHandleListTypes', default: [] }),
    // PLD 저장여부
    isSavePld: atom<boolean>({ key: 'isSavePld', default: false }),
    // PLD 수정여부
    isChangedPld: atom<boolean>({ key: 'isChangedPld', default: false }),
    // 선택한 핸들의 PLD 도구(열림, 닫힘, 조절) 이미지
    curSvg: atom<curSvg | null>({ key: 'curSvg', default: null }),
    svgList: atom<svgList[]>({ key: 'svgList', default: [] }),
    pldSimbolList: atom<pldSimbolList[]>({ key: 'pldSimbolList', default: [] }),
    // 변경사항 확인을 위한 Hash String
    pivotProcessListHash: atom<string>({ key: 'pivotProcessListHash', default: '' }),
    pivotSimbolListHash: atom<string>({ key: 'pivotSimbolListHash', default: '' }),
    // PLD 설비 로딩
    pldEquipmentLoading: atom<boolean>({ key: 'pldEquipmentLoading', default: false }),
    // PLD View Change - 도면 캔버스 뷰에 zoom 변경 이벤트 발생시 상태감지
    pldViewChange: atom<boolean>({ key: 'pldViewChange', default: false }),

    // PLD 편집모드 상태
    isEditPld: atom<boolean>({ key: 'isEditPld', default: false }),
}

const ProcedureStore = {
    procedureSteps: atom<any>({
        key: 'procedureSteps',
        default: [],
    }),

    selProcedureEquipments: atom<any>({
        key: 'selProcedureEquipments',
        default: [],
    }),

    isHideSide: atom<boolean>({
        key: 'isHideSide',
        default: false,
    }),

    isProcedureManagerVisible: atom<boolean>({
        key: 'isProcedureManagerVisible',
        default: false,
    }),

    isFix: atom<boolean>({
        key: 'isFix',
        default: false,
    }),

    isStepFix: atom<any>({
        key: 'isStepFix',
        default: undefined,
    }),

    addPMDC: atom<string>({
        key: 'addPMDC',
        default: '',
    }),

    tempStep: atom<any>({
        key: 'tempStep',
        default: [],
    }),

    procedureSourceInfo: atom<any>({
        key: 'procedureSourceInfo',
        default: '',
    }),
}

const PictureStore = {
    isShowPicturePopup: atom<any>({
        key: 'isShowPicturePopup',
        default: undefined,
    }),
}

const MydocStore = {}

export { StatusStore, MainViewPopupStore, MarkUpStore, WCDStore, PMDCStore, PldStore, MydocStore, ProcedureStore, PictureStore }
