import React from 'react'
import './Canvas.css'
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil'
import { useSearchParams } from 'react-router-dom'
// Component
import { PldSimbol } from './Pld/PldSimbol'
import TextInput from '../../../Controller/UseCanvas/TextInput'
import commonActive from '../../../Controller/useCommonActive'
import { OptionMenu } from '../../OptionView/OptionMenu'
import { LayerMenu } from '../PopupMenu/Layer/LayerMenu'
import PMDCPopup from '../../PopupView/PMDCPopup'
import PMDCListView from '../../PopupView/PMDCListView'
import PMDCgraph from '../../PopupView/PMDCgraph'
import ProcedureManager from '../../PopupView/ProcedureManager'
import ProcedureListView from '../../PopupView/ProcedureListView'
import { MarkupPainter } from '../../../Controller/UseCanvas/MarkupPainter'

// Controller
import { useEntityPainter } from '../../../Controller/UseCanvas/useEntityPainter'
import { useController } from '../../../Controller/UseCanvas/useController'
// 전역 Store
import AppStore from '../../../Store/appStore'
import { StatusStore, MainViewPopupStore, PMDCStore, PldStore, MarkUpStore, WCDStore, ProcedureStore } from '../../../Store/statusStore'
import ThemeStore from '../../../Store/ThemeStore'
// Lib
import { getVisualizeLibInst, resizeCanvases, loadFonts, fixFonts } from '../../../Lib/canvasUtils'
import { global } from '../../../Lib/util'
import commonFunc from '../../../Lib/commonFunc'
import { simbolToSvg } from '../../../Lib/pldUtil'
import { getModel, getHandle } from '../../../Lib/canvasUtils'
import crypt from '../../../Lib/crypt'
// Api
import Api from '../../../Api'
import { DBLogType } from '../../../enum/LogType'

const Canvas = ({ hideEditMarkup, viewer, setViewer, lib, setLib }: CanvasProps) => {
    // 전역 Store
    const userId = useRecoilValue(AppStore.userId)
    const [selectedDocFile, setSelectedDocFile] = useRecoilState(StatusStore.selectedDocFile)
    const setSelectedDocKey = useSetRecoilState(StatusStore.selectedDocKey)
    const [canvases, setCanvases] = useRecoilState(StatusStore.canvases)
    const [selectedCanvas, setSelectedCanvas] = useRecoilState(StatusStore.selectedCanvas)
    const theme = useRecoilValue(ThemeStore.theme)
    const hColorStyles = useRecoilValue(ThemeStore.hColorStyles)

    const setLibId = useSetRecoilState(StatusStore.libId)
    const controlMode = useRecoilValue(StatusStore.controlMode)
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    const [colorElements, setColorElements] = useRecoilState(ThemeStore.colorElements)
    const okPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    const [isZoomExtends, setIsZoomExtends] = useRecoilState(MarkUpStore.isZoomExtends)

    const setEquipmentLinks = useSetRecoilState(MainViewPopupStore.equipmentLinks)

    const pldMode = useRecoilValue(StatusStore.pldMode)

    const setMarkupContents = useSetRecoilState(MarkUpStore.markupContents)

    const setSelectEquipments = useSetRecoilState(StatusStore.selectEquipments)
    const setSelectedEquipFolderIds = useSetRecoilState(StatusStore.selectedEquipFolderIds)

    const [layerIds, setLayerIds] = useRecoilState(StatusStore.layerIds)
    const setEntityMap = useSetRecoilState(StatusStore.entityMap)
    const setBanner = useSetRecoilState(StatusStore.banner)

    // PLD State
    //const [svgList, setSvgList] = useRecoilState(PldStore.svgList)
    const pldDocumentList = useRecoilValue(PldStore.pldDocumentList)
    const [pldSimbolList, setPldSimbolList] = useRecoilState(PldStore.pldSimbolList)
    const setPldEquipList = useSetRecoilState(PldStore.pldEquipList)
    const setPivotSimbolListHash = useSetRecoilState(PldStore.pivotSimbolListHash)
    const setPivotProcessListHash = useSetRecoilState(PldStore.pivotProcessListHash)

    // WCD
    const [isRelativeDoc, setIsRelativeDoc] = useRecoilState(WCDStore.isRelativeDoc)

    // PMDC
    const [isPMDC, setIsPMDC] = useRecoilState(PMDCStore.isPMDC)
    const [PMDCArr, setPMDCArr] = useRecoilState(PMDCStore.PMDCArr)
    const [curDivPos, setCurDivPos] = useRecoilState(PMDCStore.curDivPos)
    const setScale = useSetRecoilState(PMDCStore.scale)
    const PMGraph = useRecoilValue(PMDCStore.PMGraph)
    // const ws = useRecoilValue(PMDCStore.ws)
    const setAlarmList = useSetRecoilState(PMDCStore.alarmList)
    const setTestData = useSetRecoilState(PMDCStore.testData)

    // Procedure
    const [isProcedureManagerVisible, setIsProcedureManagerVisible] = useRecoilState(ProcedureStore.isProcedureManagerVisible)
    const procedureSteps = useRecoilValue(ProcedureStore.procedureSteps)
    // Font File Buffer Set (file name cache)
    const fontNameSet = React.useRef(new Set<string>())

    // 이전 파일 체크용도
    const currentFile = React.useRef<Uint8Array>()
    const currentDocStringKey = React.useRef<string | null>(null)

    // State
    const [isLoading, setIsLoading] = React.useState({ doc: false, equip: false })
    const [isVisible, setIsVisible] = React.useState<boolean>(false)
    const [isDown, setIsDown] = React.useState(false)
    const [isCanvasDown, setIsCanvasDown] = React.useState(false)
    const [shiftX, setShiftX] = React.useState(0)
    const [shiftY, setShiftY] = React.useState(0)
    const [currentDiv, setCurrentDiv] = React.useState('')
    const [curX, setCurX] = React.useState(0)
    const [curY, setCurY] = React.useState(0)

    // 설비 색상변경 Controller
    const entityPainter = useEntityPainter(viewer, lib, theme)

    // 캔버스 이벤트 Controller
    const controller = useController(viewer, lib, getCanvasElement(), getMarkupCanvasElement())

    // URL 파라미터 조회
    const [searchParams] = useSearchParams()
    const drawing = searchParams.get('drawing')
    const revision = searchParams.get('revision')
    const plant = searchParams.get('plant')
    const equip = searchParams.get('equip')

    // 선택한 PLD 도면에 대한 설비정보 불러오기
    const setPldEquipments = React.useCallback(
        async (documentCtx: DocumentContext) => {
            const { docId, docVer } = documentCtx
            const pldDocument = pldDocumentList.filter((el) => el.DOCNO === docId && el.DOCVR === docVer)[0]
            if (!pldDocument) return
            global.log('setPldEquipments:::', documentCtx, pldDocument)

            const { PLD_C_ID, PLD_C_VR, DOCNO, DOCVR, PLD_C_SEQ } = pldDocument

            // PLD 설비 셋팅-----

            // PLD 설비 API 호출
            const entitiesRes = await Api.pld.getEntitiesList({
                cId: PLD_C_ID,
                cVr: PLD_C_VR,
                docNo: DOCNO,
                docVr: DOCVR,
                cSeq: PLD_C_SEQ,
            })

            const newPldEquipList: PldEquipment[] = []

            entitiesRes.forEach((entities: { HANDLE: string; TYPE: string; FUNCTION: string }) => {
                const { HANDLE, TYPE, FUNCTION } = entities
                newPldEquipList.push({ handle: HANDLE, type: TYPE, function: FUNCTION })
            })

            setPldEquipList(newPldEquipList)

            // (선택한 설비들) 색상변경
            entityPainter.setPldHandleList(newPldEquipList)
            // 불러올 때 피벗 초기화
            setPivotProcessListHash(crypt.CryptoJS.SHA256(JSON.stringify(newPldEquipList)).toString())
            // PLD 설비 셋팅----- end

            global.log('getEntitiesList::', entitiesRes)

            // PLD의 선택된 도면의 심볼 셋팅
            const res = await Api.pld.getAllSimbolList({
                cId: PLD_C_ID,
                cVr: PLD_C_VR,
                docNo: DOCNO,
                docVr: DOCVR,
                cSeq: PLD_C_SEQ,
            })
            global.log('getAllSimbolList::', res)

            const pldSimbolList = []

            for (let i = 0; i < res.length; i++) {
                const simbol = res[i]

                const { POINT1_X, POINT1_Y, RADPT_X, RADPT_Y } = simbol

                const path = simbolToSvg(simbol.TYPE)

                const info = {
                    seq: i + 1,
                    type: path.type,
                    point1X: POINT1_X,
                    point1Y: POINT1_Y + 2.8,
                    radptX: RADPT_X * 10,
                    radptY: RADPT_Y * 10,
                    PLD_C_SEQ: PLD_C_SEQ,
                    svg: path,
                }

                pldSimbolList.push(info)
            }

            // 불러올 때 피벗 초기화
            setPivotSimbolListHash(crypt.CryptoJS.SHA256(JSON.stringify(pldSimbolList)).toString())

            //setSvgList(resSvgList)
            setPldSimbolList(pldSimbolList)
        },
        [entityPainter, setPivotSimbolListHash, setPldSimbolList, pldDocumentList, setPivotProcessListHash, setPldEquipList]
    )

    // 도면에 등록된 마크업 리스트 조회
    const getMarkups = React.useCallback(
        async (canvas: CanvasContext) => {
            if (!pldMode && userId) {
                const markups = await Api.markup.getMarkups(
                    userId,
                    canvas.documentCtx.docId,
                    canvas.documentCtx.docVer,
                    canvas.documentCtx.plantCode
                )
                if (markups) {
                    setBanner(`마크업 갱신 중...`)
                    setMarkupContents(markups)
                    setBanner(undefined)
                }
            }
        },
        [pldMode, setMarkupContents, userId, setBanner]
    )

    // 1. viewer, lib 설정
    React.useEffect(() => {
        global.log('1. viewer, lib 설정')
        async function fetchData() {
            const lib = await getVisualizeLibInst(setBanner)

            lib.postRun.push(async () => {
                const canvas = getCanvasElement()
                canvas.width = canvas.clientWidth * window.devicePixelRatio
                canvas.height = canvas.clientHeight * window.devicePixelRatio

                lib.canvas = canvas
                lib.Viewer.initRender(canvas.width, canvas.height, true)

                const viewer = lib.Viewer.create()

                let fontName = 'gulim.ttc'
                let res = await fetch('/fonts/' + fontName)
                let buffer = await res.arrayBuffer()
                fontNameSet.current.add(fontName)
                viewer.addEmbeddedFile(fontName, new Uint8Array(buffer))
                viewer.regenAll()

                setLib(lib)
                setViewer(viewer)

                const render = () => {
                    viewer.update()
                    requestAnimationFrame(render)
                }

                render() // start render loop
            })
        }

        if (!viewer) fetchData()
    }, [setLib, setViewer, viewer])

    // 2. URL Params를 통해 도면 & 설비 설정
    React.useEffect(() => {
        async function fetchData() {
            if (!drawing || !revision || !plant) {
                currentDocStringKey.current = null
                return
            }
            const docId = crypt.decrypt(drawing)
            const docVer = crypt.decrypt(revision)
            const plantCode = crypt.decrypt(plant)
            if (!docId || !docVer || !plantCode) return

            if (currentDocStringKey.current === docId + docVer + plantCode) {
                // 이미 선택된 도면이라면
                return
            }

            currentDocStringKey.current = docId + docVer + plantCode

            global.log('2. 도면 정보 로드')
            global.log(drawing, docId, docVer, plantCode)

            setIsLoading({ doc: false, equip: false })
            // 선택된 도면이 있다면
            if (selectedCanvas) {
                // 이전에 선택했던 도면 리스트에 선택한 도면이 있는지 확인
                for (const canvas of canvases) {
                    if (canvas.documentCtx.docId === docId && canvas.documentCtx.docVer === docVer) {
                        setBanner(`도면 로딩 중...`)
                        await global.wait(0) // wait 있어야 setBanner가 먹힘.

                        setSelectedDocFile(canvas.docFile) // 도면 상태 설정
                        setSelectedDocKey(docId + '_' + docVer) // 사이드바 도면 아이템 선택
                        setSelectedCanvas(canvas) // 도면 정보 설정
                        if (!pldMode) {
                            setEquipmentLinks([]) // 설비 팝업링크 초기화
                            if (!isRelativeDoc) hideEditMarkup() // 마크업 초기화
                            setLibId(undefined) // 사이드바 설비 눈동자 선택 초기화
                            getMarkups(canvas)

                            setIsLoading((isLoading) => ({ ...isLoading, equip: true }))
                        } else {
                            // PLD 모드인 경우 해당 도면에 PLD 설비, 심볼 불러오기
                            setPldEquipments(canvas.documentCtx)
                        }
                        setBanner(undefined)
                        return
                    }
                }
            }
            setBanner(`도면 로딩 중...`)
            const docFile = await Api.document.getDocumentFile(docId, docVer)
            setSelectedDocFile(docFile) // 도면 상태 설정
            setSelectedDocKey(docId + '_' + docVer) // 사이드바 도면 아이템 선택
            setBanner(undefined)

            // 설비 로딩
            Api.document.getDocument(docId, docVer, plantCode).then((documentCtx: DocumentContext) => {
                // 도면 열람 로그
                global.logDB({
                    type: DBLogType.DOCUMENT,
                    value: {
                        userId: userId,
                        logDate: new Date().toLocaleDateString().replace(/\./g, '').replace(/\s/g, '-'),
                        logTime: new Date().toTimeString().split(' ')[0],
                        document: {
                            // COL: DOCNO
                            id: docId,
                            // COL: DOCVR
                            vr: docVer,
                            // COL: DOCNUMBER
                            name: documentCtx.docNumber,
                        },
                    },
                })

                if (0 === documentCtx.equipmentList.length) {
                    setOkPopupValue({ message: '해당 도면에는 지능화 설비가 없습니다.', ok: () => {} })
                }

                global.log('documentCtx::', documentCtx)
                const equipmentsByHandle = new Map<string, EquipmentContext[]>()
                commonFunc.getEquipmentsByHandle(documentCtx.equipmentList, equipmentsByHandle)

                const equipmentByTagId = new Map<string, EquipmentContext>()
                commonFunc.getEquipmentByTagId(documentCtx.equipmentList, equipmentByTagId)

                const registeredHandles = new Set<string>()
                commonFunc.getAllHandles(documentCtx.equipmentList, registeredHandles)

                const handlesByLibId = new Map<string, string[]>()
                commonFunc.getHandlesByEquipmentListAndLibId(documentCtx.equipmentList, handlesByLibId)

                const parentIdByLibId = new Map<string, string>()
                commonFunc.getParentIdByLibId(documentCtx.equipmentList, parentIdByLibId)

                const canvas = {
                    documentCtx,
                    docFile,
                    equipmentsByHandle,
                    equipmentByTagId,
                    state: undefined,
                    registeredHandles,
                    handlesByLibId,
                    parentIdByLibId,
                }

                const newCanvases = canvases.slice()

                if (5 <= newCanvases.length) {
                    newCanvases.pop()
                }
                newCanvases.unshift(canvas)

                setCanvases(newCanvases) // 도면 목록 설정
                setSelectedCanvas(canvas) // 도면 정보 설정
                //if (!isRelativeDoc) hideEditMarkup()
                if (!pldMode) {
                    setEquipmentLinks([]) // 설비 팝업링크 초기화
                    if (!isRelativeDoc) hideEditMarkup() // 마크업 초기화
                    setLibId(undefined) // 사이드바 설비 눈동자 선택 초기화
                    getMarkups(canvas)
                    setIsLoading((isLoading) => ({ ...isLoading, equip: true }))
                } else {
                    // PLD 모드인 경우 해당 도면에 PLD 설비, 심볼 불러오기
                    setPldEquipments(canvas.documentCtx)
                }
            })
        }

        if (viewer) fetchData()
        setIsRelativeDoc(false)
    }, [
        canvases,
        setCanvases,
        selectedCanvas,
        setSelectedCanvas,
        setSelectedDocFile,
        setSelectedDocKey,
        viewer,
        drawing,
        plant,
        revision,
        setEquipmentLinks,
        hideEditMarkup,
        setLibId,
        setOkPopupValue,
        pldMode,
        setPldEquipments,
        getMarkups,
        entityPainter,
        controller.canvasController,
        isRelativeDoc,
    ])

    // 3. 뷰어에 선택된 현재 도면설정
    React.useEffect(() => {
        async function fetchData() {
            if (selectedDocFile && viewer && controller.canvasController) {
                if (currentFile.current !== selectedDocFile) {
                    currentFile.current = selectedDocFile
                    global.log('3. 현재 도면설정', selectedDocFile)

                    //viewer.clear()
                    //viewer.update()

                    // vsf -> viewer.parseFile(selectedDocFile)
                    await viewer.parseVsfx(selectedDocFile) // vsfx
                    //viewer.parseFile(selectedDocFile)
                    viewer.setExperimentalFunctionalityFlag('gpu_select', false)
                    viewer.setEnableSceneGraph(true)
                    viewer.setEnableAnimation(false)

                    resizeCanvases(viewer, [getCanvasElement(), getMarkupCanvasElement()])
                    viewer.zoomExtents()
                    setIsZoomExtends(!isZoomExtends)

                    // Set Layer
                    const itrLayer = viewer.getLayersIterator()
                    const layerIds = []
                    while (!itrLayer.done()) {
                        const layerId = itrLayer.getLayer()
                        layerIds.push(layerId)
                        itrLayer.step()
                    }
                    setLayerIds(layerIds)
                    settingEntity()

                    fixFonts(viewer)
                    loadFonts(viewer, fontNameSet)

                    await global.wait(0)
                    // 페인터 초기화
                    entityPainter?.reload(colorElements, setColorElements)
                    entityPainter?.getDefaultWeight()
                    entityPainter?.updateLineWeight()

                    // Set default color
                    if (controlMode !== 'pmdc' && controlMode !== 'wcd') {
                        entityPainter.changeTheme(theme, colorElements, setColorElements)
                    }
                    setIsLoading((isLoading) => ({ ...isLoading, doc: true }))
                    setIsPMDC(false)
                    MarkupPainter.getRealScale(viewer, getCanvasElement())
                    // 하이라이트 컬러 셋팅
                    setHighlightColor()
                }
            }
        }
        if (viewer) fetchData()
    }, [
        selectedDocFile,
        viewer,
        controller.canvasController,
        entityPainter,
        colorElements,
        setLayerIds,
        setColorElements,
        theme,
        pldMode,
        selectedCanvas,
    ])

    // 4. 선택된 설비로 캔버스 이동
    React.useEffect(() => {
        // 설비로 캔버스 줌 이동 & 설비 페인팅
        if (isLoading.doc && isLoading.equip && selectedCanvas && equip) {
            const equipTagId = crypt.decrypt(equip)
            if (!equipTagId) return

            const { docId, docVer, plantCode } = selectedCanvas.documentCtx
            if (
                currentDocStringKey.current !== docId + docVer + plantCode ||
                selectedCanvas.registeredHandles !== controller.canvasController.registeredHandles
            )
                return

            // 선택한 설비 사이드바 폴더 열림 설정 - selectedEquipFolderIds
            const equipCtx = selectedCanvas.equipmentByTagId.get(equipTagId)
            if (equipCtx) {
                const newSelectedIds = new Set<string>()
                commonFunc.updateEquipFolderIds(selectedCanvas, newSelectedIds, equipCtx.libId)
                setSelectedEquipFolderIds(newSelectedIds)
            }
            commonActive.canvasHandlesPaint(selectedCanvas, equipTagId, entityPainter, colorElements, controller.canvasController)
            // 사이드바 설비 아이템 선택 하이라이트
            const newSelectEquipment = new Set<string>().add(equipTagId)
            setSelectEquipments(newSelectEquipment)
            global.log('4. 선택된 설비로 캔버스 이동:', isLoading, equip, equipTagId)
        }
    }, [selectedCanvas, entityPainter, isLoading, setSelectEquipments, colorElements, equip])

    // 5. PMDC 유저 정보 가져오기
    React.useEffect(() => {
        if (isPMDC || controlMode === 'pmdc') getPMDCUserListPopup()
        else setPMDCArr([])
    }, [isPMDC, controlMode])

    // 6. PMDC 소켓 연결
    // React.useEffect(() => {
    //     ws.onopen = () => {
    //         console.log('웹소켓 연결')
    //     }

    //     ws.onmessage = ({ data }: any) => {
    //         const json = JSON.parse(data)
    //         if (json.status === 'alarm') {
    //             const set = new Set<string>(json.list)
    //             setAlarmList(set)
    //         } else if (json.status === 'noData') {
    //             setTestData([])
    //         } else {
    //             setTestData(json)
    //         }
    //     }

    //     ws.onerror = (error: any) => {
    //         console.log('웹소켓 에러', error)
    //     }
    //     return () => {
    //         ws.close()
    //     }
    // }, [])

    const setHighlightColor = () => {
        // 설비 하이라이트 컬러 셋팅
        const highlightArray = new lib.OdTvHighlightStyleIdArrayObjAlloc()
        for (const key in hColorStyles) {
            let highlightId = undefined
            //if (key === 'hover') highlightId = viewer.findHighlightStyle('Web_Default') else
            highlightId = viewer.createHighlightStyle(key)
            if (!highlightId) continue
            let highlightStyle = highlightId.openObject()
            const { r, g, b } = hColorStyles[key].color
            let hcolor = new lib.OdTvRGBColorDef(r, g, b)

            highlightStyle.setFacesColor(lib.Entry.k2DTop.value, hcolor)
            highlightStyle.setEdgesColor(lib.Entry.k2DTop.value, hcolor)
            highlightStyle.setFacesVisibility(lib.Entry.k2DTop.value, true)
            highlightStyle.setEdgesVisibility(lib.Entry.k2DTop.value, true)
            highlightStyle.setEdgesTransparency(lib.Entry.k2DTop.value, 0)
            highlightStyle.setFacesTransparency(lib.Entry.k2DTop.value, 0)
            highlightStyle.setEdgesLineweight(lib.Entry.k2DTop.value, 1)

            // apply new style to array
            highlightArray.push_back(highlightId)

            hcolor.delete()
            highlightStyle.delete()
            highlightId.delete()
        }
        // apply set of styles to device
        viewer.getActiveDevice().setHighlightStyles(highlightArray, true)
        viewer.regenAll()
    }
    const getPMDCUserListPopup = async () => {
        let arr: object[] = []
        const documentCtx = selectedCanvas?.documentCtx
        if (documentCtx) {
            const pmdcContents = await Api.pmdc.getPMDCEquipments(documentCtx, '')
            const res = await Api.pmdc.getPMDCUserList(userId!, documentCtx!, '')

            if (res.length === 0 && controlMode !== 'pmdc') {
                okPopupValue({
                    message: 'PMDC 모니터링이 설정된 설비가 없습니다.',
                    ok: () => {
                        setIsPMDC(false)
                    },
                })
                return
            }

            const sort = pmdcContents
                .filter((pmdcValue: any) => res.some((userValue) => userValue.ID === pmdcValue.ID))
                .map((v: any) => {
                    let obj = v
                    res.map((userValue: any) => {
                        if (v.ID === userValue.ID) {
                            obj = { ...v, POSITION: userValue.POSITION }
                        }
                    })
                    return obj
                })

            sort.map((value: any) => {
                const isDuplication = arr.some((arrValue: any) => arrValue[0].FUNCTION === value.FUNCTION)
                if (!isDuplication) {
                    const temp = sort.filter((value2: any) => value2.FUNCTION === value.FUNCTION)
                    arr.push(temp)
                }
            })
            setPMDCArr(arr)
        }
    }

    const onMouseMove = ({ nativeEvent }: React.MouseEvent) => {
        const { clientX, clientY } = nativeEvent
        // 도면을 움직일때 팝업도 같이 움직이기
        if (!isPMDC && isCanvasDown && !isDown) {
            PMDCArr.map((v, i) => {
                const div = document.getElementsByClassName(`${i}pmdcDiv`)[0] as HTMLElement
                div.style.left = curDivPos[`${i}pmdcDivX`] + (clientX - curX) + 'px'
                div.style.top = curDivPos[`${i}pmdcDivY`] + (clientY - curY) + 'px'
            })
        }
        // 팝업을 움직일때
        if (!isPMDC && isDown && currentDiv) {
            const canvas = getMarkupCanvasElement()
            const div = document.getElementsByClassName(currentDiv)[0] as HTMLElement
            const valX = clientX - canvas.getBoundingClientRect().left
            const valY = clientY - canvas.getBoundingClientRect().top
            div.style.left = valX - shiftX! + 'px'
            div.style.top = valY - shiftY! + 'px'
        }
    }

    // 설비 객체 미리 저장
    const settingEntity = () => {
        const itr = getModel(viewer).getEntitiesIterator()

        const newEntityMap = new Map()
        while (!itr.done()) {
            const entity = itr.getEntity()
            const handle = getHandle(entity)
            newEntityMap.set(handle, entity)
            itr.step()
        }
        setEntityMap(newEntityMap)
        entityPainter?.setEntityMap(newEntityMap)
    }



    return (
        <div
            onContextMenu={(e) => e.preventDefault()}
            onMouseMove={onMouseMove}
            onMouseDown={({ nativeEvent }: React.MouseEvent) => {
                const target = nativeEvent.target as HTMLCanvasElement
                if (target.tagName === 'CANVAS') {
                    let obj: Object = {}
                    setCurX(nativeEvent.clientX)
                    setCurY(nativeEvent.clientY)
                    setIsCanvasDown(true)
                    PMDCArr.map((v: any, i: number) => {
                        const div = document.getElementsByClassName(`${i}pmdcDiv`)[0] as HTMLElement
                        obj = {
                            ...obj,
                            [`${i}pmdcDivX`]: parseInt(div.style.left),
                            [`${i}pmdcDivY`]: parseInt(div.style.top),
                        }
                        setCurDivPos({ ...curDivPos, ...obj })
                    })
                }
            }}
            onMouseUp={() => setIsCanvasDown(false)}
            onClick={() => {
                if (controlMode === 'text') setIsVisible(!isVisible)
            }}
        >
            
            <div id="printArea">
                {/* oda lib.에서 Canvas ID를 필요로 한다. id="documentCanvas" 삭제 금지 */}
                <canvas
                    id="documentCanvas"
                    onClick={() => {
                        if (controlMode === 'text') {
                            setIsVisible(!isVisible)
                        }
                    }}
                />
                <canvas id="markupCanvas" />

            {/* PLD 심볼 Canvas에 프린트 */}
            {pldMode ? (
                <svg id="pldSvg">
                    {pldSimbolList.map((pldSimbolItem: pldSimbolList, idx: number) => (
                        <PldSimbol
                            key={`${pldSimbolItem.seq}-${pldSimbolItem.PLD_C_SEQ}`}
                            pldSimbolItem={pldSimbolItem}
                            viewer={viewer}
                            lib={lib}
                            idx={idx}
                        />
                    ))}
                </svg>
            ) : null}
            </div>
            {isVisible && (
                <TextInput isVisible={isVisible} setIsVisible={setIsVisible} viewer={viewer} markupCanvas={getMarkupCanvasElement()} />
            )}
            {(isPMDC || controlMode === 'pmdc') &&
                PMDCArr &&
                PMDCArr.map((v: any, i: number) => {
                    const arr = JSON.parse(v[0].POSITION)
                    const handle = JSON.parse(v[0].HANDLE)
                    return (
                        <PMDCPopup
                            key={v[0]['ID']}
                            i={i}
                            viewer={viewer}
                            markupCanvas={getMarkupCanvasElement()}
                            isDown={isDown}
                            setIsDown={setIsDown}
                            shiftX={shiftX}
                            setShiftX={setShiftX}
                            shiftY={shiftY}
                            setShiftY={setShiftY}
                            currentDiv={currentDiv}
                            setCurrentDiv={setCurrentDiv}
                            x={arr[0]}
                            y={arr[1]}
                            value={v}
                            controlMode={controlMode}
                            lib={lib}
                            handle={handle}
                            getPMDCUserListPopup={getPMDCUserListPopup}
                            entityPainter={entityPainter}
                            isPMDC={isPMDC}
                        />
                    )
                })}
            <div className="CenterPopup">
                <PMDCListView viewer={viewer} getPMDCUserListPopup={getPMDCUserListPopup} />
            </div>
            {isPMDC && PMGraph && <PMDCgraph />}
            
            {/* 옵션 메뉴 */}
            <OptionMenu entityPainter={entityPainter} />
            {/* 레이어 메뉴 */}
            {layerIds.length > 0 && <LayerMenu />}
            {isProcedureManagerVisible && <ProcedureManager />}
            {procedureSteps.length > 0 && (
                <ProcedureListView viewer={viewer} markupCanvas={getMarkupCanvasElement()} getPMDCUserListPopup={getPMDCUserListPopup} />
            )}
        </div>
    )
}

const getCanvasElement = (): HTMLCanvasElement => {
    return document.getElementById('documentCanvas') as HTMLCanvasElement
}

const getMarkupCanvasElement = (): HTMLCanvasElement => {
    return document.getElementById('markupCanvas') as HTMLCanvasElement
}



export default Canvas
