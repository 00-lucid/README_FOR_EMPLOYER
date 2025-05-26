import { procedure } from './../../View/SideView/Component/MenuBarIcons'
import React, { useRef, useEffect } from 'react'
import {
    CanvasController,
    SelectCanvasController,
    MarkupCanvasController,
    EraseCanvasController,
    EditCanvasController,
    RectMarkupCanvasController,
    CircleMarkupCanvasController,
    TextMarkupCanvasController,
    PolylineMarkupCanvasController,
    CloudMarkupCanvasController,
    WCDCanvasController,
    PMDCCanvasController,
    PldSelectCanvasController,
    PldCanvasController,
    ProcedureCanvasController,
} from './CanvasController'
import { useNavigate } from 'react-router-dom'
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil'
// 전역 Store
import { StatusStore, MainViewPopupStore, MarkUpStore, WCDStore, PldStore, PMDCStore, ProcedureStore } from '../../Store/statusStore'
import ThemeStore from '../../Store/ThemeStore'
import { ControllerContext } from '../../Store/controllerContext'
import { PainterContext } from '../../Store/painterContext'
import { useWCDPainter } from './useWCDPainter'
// Lib
import { resizeCanvases } from '../../Lib/canvasUtils'
import { global } from '../../Lib/util'
import crypt from '../../Lib/crypt'
import { getEntities } from '../../Lib/canvasUtils'
// Api
import Api from '../../Api'
// Controller
import commonActive from '../useCommonActive'
import commonFunc from '../../Lib/commonFunc'
import { MarkupPainter } from './MarkupPainter'
import { usePMDCPainter } from './usePMDCPainter'
import { useProcedurePainter } from './useProcedurePainter'

export function useController(viewer: any, lib: any, documentCanvas: HTMLCanvasElement, markupCanvas: HTMLCanvasElement) {
    // global.log('useController 읽힘', viewer, lib)

    // 전역 Store
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const setSelectEquipments = useSetRecoilState(StatusStore.selectEquipments)
    const setSelectedEquipFolderIds = useSetRecoilState(StatusStore.selectedEquipFolderIds)
    const [controlMode, setControlMode] = useRecoilState(StatusStore.controlMode)
    const wcdTagDoc = useRecoilValue(WCDStore.wcdTagDoc)

    const [equipmentLinks, setEquipmentLinks] = useRecoilState(MainViewPopupStore.equipmentLinks)
    const setX = useSetRecoilState(MainViewPopupStore.x)
    const setY = useSetRecoilState(MainViewPopupStore.y)

    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    const entityMap = useRecoilValue(StatusStore.entityMap)
    const colorElements = useRecoilValue(ThemeStore.colorElements)

    // 마크업
    const [markupPaths, setMarkupPaths] = useRecoilState(MarkUpStore.markupPaths)
    const currentPath = React.useRef<DrawingPath[]>([...markupPaths])
    const [isMarkupChanged, setIsMarkupChanged] = useRecoilState(MarkUpStore.isMarkupChanged)
    const theme = useRecoilValue(ThemeStore.theme)
    const dashColor = theme.type === 'light' ? 'black' : 'white'
    const shiftRef = React.useRef(false)
    const setEditMarkupIdx = useSetRecoilState(MarkUpStore.editMarkupIdx)
    const [undoList, setUndoList] = useRecoilState(MarkUpStore.undoList)
    const setRedoList = useSetRecoilState(MarkUpStore.redoList)
    const isZoomExtends = useRecoilValue(MarkUpStore.isZoomExtends)

    // WCD
    const wcdPainter = useWCDPainter(viewer, lib, theme, documentCanvas)
    const [wcdEquipments, setWCDEquipments] = useRecoilState(WCDStore.wcdEquipments)
    const [selWCDEquipment, setSelWCDEquipment] = useRecoilState(WCDStore.selWCDEquipment)
    const [wcdDocHandles, setWCDDocHandles] = useRecoilState(WCDStore.wcdTagDoc)
    const wcdTagDocRef = useRef([])

    // PMDC
    const pmdcPainter = usePMDCPainter(viewer, lib, theme, documentCanvas)
    const pmdcEquipments = useRecoilValue(PMDCStore.pmdcEquipments)
    const PMDCArr = useRecoilValue(PMDCStore.PMDCArr)
    const [initScale, setInitScale] = useRecoilState(PMDCStore.scale)
    const [isPMDC, setIsPMDC] = useRecoilState(PMDCStore.isPMDC)
    const setIsPMDCTagOn = useSetRecoilState(PMDCStore.isPMDCTagOn)
    const setSelPMDCEquipment = useSetRecoilState(PMDCStore.selPMDCEquipment)

    // Procedure
    const procedurePainter = useProcedurePainter(viewer, lib, theme, documentCanvas)
    const procedureSteps = useRecoilValue(ProcedureStore.procedureSteps)
    const procedureStepsRef = useRef([])
    const [selProcedureEquipments, setSelProcedureEquipments] = useRecoilState(ProcedureStore.selProcedureEquipments)
    // MarkUp State
    const setIsShowMarkupPopup = useSetRecoilState(MarkUpStore.isShowMarkupPopup)
    const drawingStyle = useRecoilValue(MarkUpStore.drawingStyle)
    const setTextInputObj = useSetRecoilState(MarkUpStore.textInputObj)

    // Pld State
    const setPldHandle = useSetRecoilState(PldStore.pldHandle)
    const setPldHandleEntityType = useSetRecoilState(PldStore.pldHandleEntityType)
    const currentPld = useRecoilValue(PldStore.currentPld)
    const setSvgList = useSetRecoilState(PldStore.svgList)
    const pldEquipList = useRecoilValue(PldStore.pldEquipList)

    // 전역 컨텍스트
    const controllerContext = React.useContext(ControllerContext)
    const painterContext = React.useContext(PainterContext)

    if (!controllerContext || !painterContext) throw new Error('Unhandled context')
    const { canvasController, setCanvasController } = controllerContext
    const { entityPainter } = painterContext

    // const markupDrawingStyle = React.useRef(drawingStyle)

    // 라우터 경로 이동을 위한 네비게이터
    const navigate = useNavigate()

    const onMouseOverHandler = React.useCallback(
        (handles: string[]) => {
            // 설비 색상 변경
            entityPainter.setMouseOverByColor(handles, colorElements)
        },
        [entityPainter, colorElements]
    )

    const redrawMarkup = React.useCallback(() => {
        const render = () => {
            const painter = MarkupPainter.create(viewer, markupCanvas)
            // 마크업이 있는데 캔버스 뷰 이동 OR 마크업 지우기 발생했을 때만 다시 렌더링
            if (
                currentPath.current.length > 0
                // || currentPath.current.length !== markupPaths.length
            ) {
                if (painter) {
                    painter.clear()

                    for (let temp of currentPath.current) {
                        const path = JSON.parse(JSON.stringify(temp))

                        if (path.type === 'rect') {
                            if (dashColor !== path.texts[2]) path.texts[2] = dashColor
                            painter.rectDraw(path)
                        } else if (path.type === 'circle') {
                            if (dashColor !== path.texts[2]) path.texts[2] = dashColor
                            painter.circleDraw(path)
                        } else if (path.type === 'line') {
                            if (dashColor !== path.texts[0]) path.texts[0] = dashColor
                            painter.draw(path)
                        } else if (path.type === 'text') {
                            if (dashColor !== path.texts[5]) path.texts[5] = dashColor
                            painter.textDraw(path)
                        } else if (path.type === 'polyline') {
                            if (dashColor !== path.texts[1]) path.texts[1] = dashColor
                            painter.lineDraw(path)
                        } else if (path.type === 'cloud') {
                            if (dashColor !== path.texts[3]) path.texts[3] = dashColor
                            painter.cloudDraw(path)
                        }
                        temp = path
                    }
                }
            }
            if (controlMode === 'wcd') {
                if (wcdTagDocRef.current.length > 0) {
                    if (painter) {
                        painter.clear()
                        wcdPainter.drawOrder(wcdTagDocRef.current, viewer, markupCanvas, theme)
                    }
                } else if (painter) painter.clear()
            } else if (controlMode === 'procedure') {
                if (procedureStepsRef.current.length > 0) {
                    if (painter) {
                        painter.clear()
                        procedurePainter.drawOrder(procedureStepsRef.current, viewer, markupCanvas, theme)
                    }
                } else if (painter) painter.clear()
            } else if (
                controlMode !== 'wcd' &&
                controlMode !== 'procedure' &&
                currentPath.current.length === 0 &&
                wcdTagDocRef.current.length === 0 &&
                procedureStepsRef.current.length === 0
            ) {
                if (painter) painter.clear()
            }
            // paint.current.markupFrameId = -1
        }

        // if (paint.current.markupFrameId === -1) {
        //     paint.current.markupFrameId = requestAnimationFrame(render)
        // }
        render()
        // setMarkupPaths(currentPath.current);
    }, [markupCanvas, viewer, dashColor, wcdTagDoc, controlMode, theme, wcdPainter, procedureSteps, procedurePainter])

    useEffect(() => {
        if (controlMode === 'wcd') {
            if (wcdTagDoc.length > 0) {
                const sortedTag = wcdTagDoc.sort((a: any, b: any) => a.counter - b.counter)
                const handles: any = [[], [], []]
                for (const item of sortedTag) {
                    if (item.handle.length > 0) {
                        handles[1].push(item.line)
                        const arry: any = []
                        item.handle.map((f: any) => arry.push(f.TAGHANDLE))
                        handles[0].push(arry)

                        const entityId = getEntities(viewer, [item.handle[0].TAGHANDLE])
                        if (entityId.length === 0) {
                            handles[2].push([])
                            continue
                        }

                        let extents: any
                        const type = entityId[0].getType()
                        if (type === 1) {
                            const entity = entityId[0].openObject()
                            extents = entity.getExtents()
                        } else if (type === 2) {
                            const entity = entityId[0].openObjectAsInsert()
                            extents = entity.getExtents().ext
                        }
                        handles[2].push(extents.center())
                    }
                }
                wcdTagDocRef.current = handles
            } else {
                wcdTagDocRef.current = []
            }
        } else if (controlMode === 'procedure') {
            if (procedureSteps.length > 0) {
                const handles: any = [[], [], []]
                for (const item of procedureSteps) {
                    if (item.HANDLE !== null) {
                        handles[0].push(item.STPORDER)
                        handles[1].push(item.HANDLE)
                        const entityId = getEntities(viewer, [item.HANDLE])
                        if (entityId.length === 0) {
                            handles[2].push([])
                            continue
                        }

                        let extents: any
                        const type = entityId[0].getType()
                        if (type === 1) {
                            const entity = entityId[0].openObject()
                            extents = entity.getExtents()
                        } else if (type === 2) {
                            const entity = entityId[0].openObjectAsInsert()
                            extents = entity.getExtents().ext
                        }
                        handles[2].push(extents.center())
                    }
                }
                procedureStepsRef.current = handles
            } else {
                procedureStepsRef.current = []
            }
        } else if (controlMode !== 'wcd' && controlMode !== 'procedure') {
            wcdTagDocRef.current = []
            procedureStepsRef.current = []
        }

        redrawMarkup()
    }, [controlMode, redrawMarkup, viewer, wcdTagDoc, isZoomExtends, procedureSteps])

    // 선택한 핸들 하이라이트 업데이트
    const updateSelectHandle = React.useCallback(
        (allEquipments: Set<string>, selectedCanvas: CanvasContext, tagId: string, newEquipmentLinks: EquipmentLink[]) => {
            // 사이드바 설비 아이템 선택 하이라이트
            setSelectEquipments(allEquipments)
            // 캔버스 설비 페인팅
            commonActive.canvasHandlesPaint(selectedCanvas, tagId, entityPainter, colorElements)
            // 선택된 설비 팝업 띄움
            setEquipmentLinks(newEquipmentLinks)
        },
        [setSelectEquipments, setEquipmentLinks, entityPainter, colorElements]
    )
    const onMoveCanvas = React.useCallback(
        (params: ViewParams) => {
            if (selectedCanvas) {
                const isPopup = 1 < equipmentLinks.length
                if (isPopup) {
                    updateSelectHandle(new Set<string>(), selectedCanvas, equipmentLinks[0]?.tagId, [])
                }
            }
        },
        [equipmentLinks, selectedCanvas, updateSelectHandle]
    )
    const onViewParamsChange = React.useCallback(
        (params: ViewParams) => {
            //redrawDocument()
            redrawMarkup()
            onMoveCanvas(params)
            const painter = MarkupPainter.create(viewer, markupCanvas)
            const painterScale = painter!['adjust'].scale
            setInitScale(painterScale)
            if (isPMDC || controlMode === 'pmdc') {
                PMDCArr.map((v: any, i: number) => {
                    const arr = JSON.parse(v[0].POSITION)
                    const div = document.getElementsByClassName(`${i}pmdcDiv`)[0] as HTMLElement
                    div.style.left = ((arr[0] + painter!['adjust'].x) * painterScale) / window.devicePixelRatio + 'px'
                    div.style.top =
                        (painter!['canvas'].height - (arr[1] + painter!['adjust'].y) * painterScale) / window.devicePixelRatio + 'px'
                })
            } else if (controlMode === 'procedure') {
                selProcedureEquipments.map((v: any, i: any) => {
                    const div = document.getElementsByClassName(`${i}procedureDiv`)[0] as HTMLElement
                    div.style.left = ((v.x + painter!['adjust'].x) * painterScale) / window.devicePixelRatio + 'px'
                    div.style.top =
                        (painter!['canvas'].height - (v.y + painter!['adjust'].y) * painterScale) / window.devicePixelRatio + 'px'
                })
            }
        },
        [redrawMarkup, onMoveCanvas, isPMDC, PMDCArr, selProcedureEquipments]
    )
    // onViewParamsChange - 캔버스 뷰 이동 ---- end

    // controlmode === 'select' ----
    // 설비 선택
    const onSelectHandle = React.useCallback(
        async (handles: string[], x: number, y: number) => {
            global.log('onSelectHandle:', handles)
            const allEquipments = new Set<string>()
            const newEquipmentLinks: EquipmentLink[] = []
            // Exception Handler
            if (!selectedCanvas || !entityPainter) return
            for (const handle of handles) {
                const equipments = selectedCanvas.equipmentsByHandle.get(handle)
                if (!equipments) continue
                equipments.map((item) => allEquipments.add(item.tagId))
                const { docId, docVer, plantCode } = selectedCanvas.documentCtx
                const links = await Api.equipment.getEquipmentLinks(docId, docVer, plantCode, handle)
                if (links.length === 1) {
                    const link = links[0]
                    const isOpc = link.tagType === '002'
                    // OverPageConnection 확인
                    if (isOpc) {
                        if (link.opcDocId && link.opcDocVer && link.opcPlantCode && link.opcTagId) {
                            if (controlMode === 'pmdc') {
                                console.log("controlMode:", controlMode)
                                setControlMode('select')
                                setIsPMDC(false)
                                setIsPMDCTagOn(false)
                                setSelPMDCEquipment([])
                            }
                            // Event : MainView/Canvas/index.tsx -> 2. URL Params를 통해 도면 & 설비 설정
                            commonFunc.changeDocument(
                                crypt.encrypt(link.opcDocId),
                                crypt.encrypt(link.opcDocVer),
                                crypt.encrypt(link.opcPlantCode),
                                crypt.encrypt(link.opcTagId),
                                isMarkupChanged,
                                setIsShowMarkupPopup,
                                navigate,
                                setYesNoPopupValue
                            )
                            return
                        } else {
                            setOkPopupValue({ message: `도면이 존재하지 않습니다.`, ok: () => {} })
                        }
                    } else {
                        newEquipmentLinks.push(link)
                    }
                } else if (links.length > 1) {
                    newEquipmentLinks.push(...links)
                }
            }
            /*
                - 변경사항 있는지 확인
                    기존과 길이가 같다면 MORE CHECK
                        요소가 1개 이상이라면 MORE CHECK
                            1개가 같다면
                                업데이트 하지 않음.
                        요소가 0개 라면
                            업데이트 하지 않음.
                    업데이트 함
            */
            let checkUpdate = true
            if (equipmentLinks.length === newEquipmentLinks.length)
                if (newEquipmentLinks.length > 0) {
                    if (equipmentLinks[0].tagId === newEquipmentLinks[0].tagId) checkUpdate = false
                } else checkUpdate = false

            updateSelectHandle(allEquipments, selectedCanvas, newEquipmentLinks[0]?.tagId, newEquipmentLinks)
            if (checkUpdate) {
                // 선택한 설비 사이드바 폴더 열림 설정 - selectedEquipFolderIds
                if (newEquipmentLinks.length > 0) {
                    const equipCtx = selectedCanvas.equipmentByTagId.get(newEquipmentLinks[0]?.tagId)
                    if (equipCtx) {
                        const newSelectedIds = new Set<string>()
                        commonFunc.updateEquipFolderIds(selectedCanvas, newSelectedIds, equipCtx.libId)
                        setSelectedEquipFolderIds(newSelectedIds)
                    }
                }
                // (선택한 설비 2개 이상일때 뜨는 설비목록)팝업 좌표
                if (newEquipmentLinks.length > 1) {
                    setX(x)
                    setY(y)
                }
            }
        },
        [
            selectedCanvas,
            entityPainter,
            equipmentLinks,
            setX,
            setY,
            navigate,
            setSelectedEquipFolderIds,
            updateSelectHandle,
            isMarkupChanged,
            setIsShowMarkupPopup,
            setYesNoPopupValue,
            setOkPopupValue,
        ]
    )
    // controlmode === 'select' ---- end
    // controlmode === 'wcd' ----
    const onSelectWCDHandle = React.useCallback(
        async (handles: string[], x: number, y: number) => {
            if (selectedCanvas && wcdEquipments) {
                if (handles.length !== 0) {
                    for (const handle of wcdEquipments) {
                        const equipment = selectedCanvas.equipmentsByHandle.get(handle)
                        const wcdEquipment = selectedCanvas.equipmentsByHandle.get(handles[0])
                        if (!equipment || !wcdEquipment) return
                        if (equipment === wcdEquipment) {
                            setSelWCDEquipment(equipment)
                            break
                        }
                    }
                } else {
                    // pushCommand({ name: 'selectWCDHandle', value: { wcdEquipments: [], x, y}});
                }
            }
        },
        [selectedCanvas, wcdEquipments, setSelWCDEquipment]
    )

    const onWCDMouseOver = React.useCallback(
        async (handles: string[], x: number, y: number) => {
            if (handles.length !== 0) {
                if (wcdEquipments.includes(handles[0])) wcdPainter.setWCDMouseOver(handles)
            }
            // else wcdPainter.setWCDMouseOver(handles)
        },
        [wcdPainter, wcdEquipments]
    )

    const onSelectPMDCHandle = React.useCallback(
        (handles: string[], x: number, y: number) => {
            if (selectedCanvas) {
                const equipment = selectedCanvas.equipmentsByHandle.get(handles[0])
                setSelPMDCEquipment(equipment ?? '')
            }
        },
        [selectedCanvas, setSelPMDCEquipment]
    )

    const onPMDCMouseOver = React.useCallback(
        async (handles: string[], x: number, y: number) => {
            if (handles.length !== 0) {
                if (pmdcEquipments.includes(handles[0])) pmdcPainter.setWCDMouseOver(handles)
            }
            // else wcdPainter.setWCDMouseOver(handles)
        },
        [pmdcPainter, pmdcEquipments]
    )

    const onSelectProcedureHandle = React.useCallback(
        (handles: string[], x: number, y: number) => {
            if (handles.length > 0 && selectedCanvas && procedureSteps.some((v: any) => handles[0] === v.HANDLE)) {
                const equipment = selectedCanvas.equipmentsByHandle.get(handles[0])
                const gePoint = viewer.screenToWorld(x, y)
                const temp: any = equipment!.map((v: any) => {
                    return { ...v, x: gePoint[0], y: gePoint[1] }
                })
                if (selProcedureEquipments.length === 0) setSelProcedureEquipments([temp[0]])
                else {
                    if (selProcedureEquipments.every((item: any) => item.handles[0].handle !== temp[0].handles[0].handle))
                        setSelProcedureEquipments([...selProcedureEquipments, temp[0]])
                }
                // setSelProcedureEquipments(Array.from(newSet))
            }
        },
        [selectedCanvas, procedureSteps, selProcedureEquipments]
    )

    // controlmode === 'wcd' ---- end
    // controlmode === 'markup' ----
    const onMarkupStart = React.useCallback(
        (x: number, y: number) => {
            const path = {
                type: drawingStyle.type,
                width: drawingStyle.width,
                color: drawingStyle.color,
                values: [x, y],
                texts: [dashColor],
                dash: [],
                area: [x, y, x, y],
            }
            currentPath.current.push(path)
        },
        [drawingStyle, dashColor]
    )
    const onMarkupDraw = React.useCallback(
        (x: number, y: number) => {
            currentPath.current.at(-1)!.values.push(x, y)
            const path = currentPath.current.at(-1)!
            for (let i = 0; i < path.values.length - 1; i = i + 2) {
                if (path.values[i] < path.area[0]) path.area[0] = path.values[i]
                else if (path.values[i] > path.area[2]) path.area[2] = path.values[i]
                if (path.values[i + 1] < path.area[1]) path.area[1] = path.values[i + 1]
                else if (path.values[i + 1] > path.area[3]) path.area[3] = path.values[i + 1]
            }

            const painter = MarkupPainter.create(viewer, markupCanvas)

            if (painter) {
                redrawMarkup()
            }
        },
        [markupCanvas, viewer, redrawMarkup]
    )
    const setMarkupChanged = React.useCallback(() => {
        const strCurrent = JSON.parse(JSON.stringify(currentPath.current))
        const strMarkup = JSON.parse(JSON.stringify(markupPaths))
        if (strCurrent !== strMarkup) {
            setMarkupPaths([...currentPath.current])
            global.log('setMarkupChanged::', [...currentPath.current], 'ex value::', markupPaths)
            if (!isMarkupChanged) setIsMarkupChanged(true)
        }
    }, [markupPaths, setMarkupPaths, isMarkupChanged, setIsMarkupChanged])

    // setMarkupPath 이벤트 감지(저장안함 초기화, 불러오기) -> 마크업 지우기
    React.useEffect(() => {
        currentPath.current = [...markupPaths]
        const painter = MarkupPainter.create(viewer, markupCanvas)
        if (painter) {
            painter.clear()
            redrawMarkup()
        }
    }, [markupPaths, currentPath, markupCanvas, viewer, theme.type, redrawMarkup])
    // controlmode === 'markup' ---- end

    // controlmode === 'erase' ----
    const onMarkupErase = React.useCallback(
        (tempMarkupPath: DrawingPath[]) => {
            setMarkupPaths(tempMarkupPath)
            // redrawMarkup()
        },
        [setMarkupPaths]
    )
    // controlmode === 'erase' ---- end

    const setEditIdx = React.useCallback(
        (idx: number) => {
            if (idx > currentPath.current.length - 1) return
            for (let i = 0; i < currentPath.current.length; i++) {
                const tempPath = { ...currentPath.current[i] }
                tempPath.dash = []
                currentPath.current[i] = tempPath
                // currentPath.current[i].dash = []
            }
            const tempPath = { ...currentPath.current[idx] }
            tempPath.dash = [2, 2]
            currentPath.current[idx] = tempPath
            // currentPath.current[idx].dash = [2, 2]
            // console.log('markupPaths:', currentPath, 'idx:', idx);
        },
        [currentPath]
    )

    const resetEditIdx = React.useCallback(() => {
        for (let i = 0; i < currentPath.current.length; i++) {
            let obj = { ...currentPath.current[i] }
            obj.dash = []
            currentPath.current[i] = obj
        }
        setEditMarkupIdx(-1)
    }, [currentPath, setEditMarkupIdx])

    const onMarkupEdit = React.useCallback(
        (idx: number) => {
            if (idx >= 0) setEditIdx(idx)
            else resetEditIdx()
            redrawMarkup()
        },
        [redrawMarkup, setEditIdx, resetEditIdx]
    )

    const onRectMarkupStart = React.useCallback(
        (x: number, y: number) => {
            const path = {
                type: 'rect',
                width: drawingStyle.width,
                color: drawingStyle.color,
                values: [x, y],
                texts: ['', shiftRef.current ? 'shift' : '', dashColor],
                dash: [],
                area: [x, y, x, y],
            }

            currentPath.current.push(path)
            redrawMarkup()
        },
        [currentPath, drawingStyle, dashColor, redrawMarkup]
    )

    const onRectMarkupDraw = React.useCallback(
        (x: number, y: number) => {
            let values = currentPath.current[currentPath.current.length - 1].values
            let area = currentPath.current[currentPath.current.length - 1].area
            if (currentPath.current[currentPath.current.length - 1].texts[1] === 'shift') {
                let shiftX = x - values[0]
                let shiftY = y - values[1]
                if (Math.abs(shiftX) > Math.abs(shiftY)) {
                    values[2] = x
                    values[3] = values[1] - shiftX
                    area[2] = x
                    area[1] = values[1] - shiftX
                } else {
                    values[2] = values[0] - shiftY
                    values[3] = y
                    area[2] = values[0] - shiftY
                    area[1] = y
                }
            } else {
                values[2] = x
                values[3] = y
                area[2] = x
                area[1] = y
            }
            const painter = MarkupPainter.create(viewer, markupCanvas)
            if (painter) {
                redrawMarkup()
            }
        },
        [currentPath, markupCanvas, viewer, redrawMarkup]
    )

    const onRectMarkupShift = React.useCallback(
        (str?: string) => {
            if (
                currentPath.current.length !== 0 &&
                currentPath.current[currentPath.current.length - 1].texts.length !== 0 &&
                currentPath.current[currentPath.current.length - 1].type === 'rect' &&
                currentPath.current[currentPath.current.length - 1].texts[0] !== 'finish'
            ) {
                currentPath.current[currentPath.current.length - 1].texts[1] = str!
                redrawMarkup()
            }
            if (str !== '') shiftRef.current = true
            else shiftRef.current = false
        },
        [currentPath, redrawMarkup]
    )

    const onRectMarkupComplete = React.useCallback(
        (key?: string) => {
            if (
                currentPath.current.length !== 0 &&
                currentPath.current[currentPath.current.length - 1].texts.length !== 0 &&
                currentPath.current[currentPath.current.length - 1].type === 'rect'
            ) {
                currentPath.current[currentPath.current.length - 1].texts[0] = 'finish'
            }
        },
        [currentPath]
    )

    const onCircleMarkupStart = React.useCallback(
        (x: number, y: number) => {
            const path = {
                type: 'circle',
                width: drawingStyle.width,
                color: drawingStyle.color,
                values: [x, y],
                texts: ['', shiftRef.current ? 'shift' : '', dashColor],
                dash: [],
                area: [x, y, x, y],
            }
            currentPath.current.push(path)
        },
        [currentPath, drawingStyle, dashColor]
    )

    const onCircleMarkupDraw = React.useCallback(
        (x: number, y: number) => {
            let values = currentPath.current[currentPath.current.length - 1].values
            let area = currentPath.current[currentPath.current.length - 1].area
            if (currentPath.current[currentPath.current.length - 1].texts[1] === 'shift') {
                let shiftX = x - values[0]
                let shiftY = y - values[1]
                if (Math.abs(shiftX) > Math.abs(shiftY)) {
                    values[2] = x
                    values[3] = values[1] - shiftX
                    area[2] = x
                    area[1] = values[1] - shiftX
                } else {
                    values[2] = values[0] - shiftY
                    values[3] = y
                    area[2] = values[0] - shiftY
                    area[1] = y
                }
            } else {
                values[2] = x
                values[3] = y
                area[2] = x
                area[1] = y
            }
            const painter = MarkupPainter.create(viewer, markupCanvas)
            if (painter) {
                redrawMarkup()
            }
        },
        [currentPath, markupCanvas, viewer, redrawMarkup]
    )

    const onCircleMarkupShift = React.useCallback(
        (str?: string) => {
            if (
                currentPath.current.length !== 0 &&
                currentPath.current[currentPath.current.length - 1].texts.length !== 0 &&
                currentPath.current[currentPath.current.length - 1].type === 'circle' &&
                currentPath.current[currentPath.current.length - 1].texts[0] !== 'finish'
            ) {
                currentPath.current[currentPath.current.length - 1].texts[1] = str!
                redrawMarkup()
            }
            if (str !== '') shiftRef.current = true
            else shiftRef.current = false
        },
        [currentPath, redrawMarkup]
    )

    const onCircleMarkupComplete = React.useCallback(
        (key?: string) => {
            if (
                currentPath.current.length !== 0 &&
                currentPath.current[currentPath.current.length - 1].texts.length !== 0 &&
                currentPath.current[currentPath.current.length - 1].type === 'circle'
            ) {
                currentPath.current[currentPath.current.length - 1].texts[0] = 'finish'
            }
        },
        [currentPath]
    )

    const onInputMake = React.useCallback(
        (point: any) => {
            setTextInputObj({
                startX: point.x,
                startY: point.y,
                dashColor: dashColor,
            })
        },
        [setTextInputObj, dashColor]
    )

    const onPolylineMarkupComplete = React.useCallback(
        (key?: string) => {
            if (
                currentPath.current.length !== 0 &&
                currentPath.current[currentPath.current.length - 1].texts.length !== 0 &&
                currentPath.current[currentPath.current.length - 1].type === 'polyline' &&
                currentPath.current[currentPath.current.length - 1].texts[0] !== 'finish'
            ) {
                currentPath.current[currentPath.current.length - 1].texts[0] = 'finish'
            }
            redrawMarkup()
        },
        [currentPath, redrawMarkup]
    )

    const onPolylineMarkupStart = React.useCallback(
        (x: number, y: number) => {
            if (
                currentPath.current.length === 0 ||
                currentPath.current[currentPath.current.length - 1].type !== 'polyline' ||
                currentPath.current[currentPath.current.length - 1].texts[0] === 'finish'
            ) {
                const path = {
                    // type: drawingStyle.type,
                    type: 'polyline',
                    width: drawingStyle.width,
                    color: drawingStyle.color,
                    values: [x, y],
                    texts: ['', dashColor],
                    dash: [],
                    area: [x, y, x, y],
                }

                currentPath.current.push(path)
            } else {
                const path = currentPath.current[currentPath.current.length - 1]
                path.values.push(x)
                path.values.push(y)

                for (let i = 0; i < path.values.length - 1; i = i + 2) {
                    if (path.values[i] < path.area[0]) path.area[0] = path.values[i]
                    else if (path.values[i] > path.area[2]) path.area[2] = path.values[i]
                    if (path.values[i + 1] < path.area[1]) path.area[1] = path.values[i + 1]
                    else if (path.values[i + 1] > path.area[3]) path.area[3] = path.values[i + 1]
                }

                const valength = currentPath.current[currentPath.current.length - 1].values.length

                if (Math.abs(path.values[0] - x) < 10 && Math.abs(path.values[1] - y) < 10) {
                    path.values[valength - 2] = path.values[0]
                    path.values[valength - 1] = path.values[1]
                    onPolylineMarkupComplete()
                }

                const painter = MarkupPainter.create(viewer, markupCanvas)

                if (painter) {
                    painter.clear()
                    redrawMarkup()
                }
                if (path.texts[0] === 'finish') return true
            }
            return false
        },
        [currentPath, drawingStyle, dashColor, markupCanvas, onPolylineMarkupComplete, redrawMarkup, viewer]
    )

    const onPolylineNextMove = React.useCallback(
        (x: number, y: number) => {
            // console.log("x1:", x, " y1:", y);
            if (
                currentPath.current.length > 0 &&
                currentPath.current[currentPath.current.length - 1].type === 'polyline' &&
                currentPath.current[currentPath.current.length - 1].texts[0] !== 'finish'
            ) {
                const painter = MarkupPainter.create(viewer, markupCanvas)
                const path = currentPath.current[currentPath.current.length - 1]
                const values = path.values
                if (painter) {
                    redrawMarkup()
                    // painter.clear();
                    painter.singleLine(values[values.length - 2], values[values.length - 1], x, y, path.width, path.color)
                }
            }
        },
        [currentPath, markupCanvas, viewer, redrawMarkup]
    )

    const onCloudMarkupComplete = React.useCallback(
        (key?: string) => {
            if (
                currentPath.current.length !== 0 &&
                currentPath.current[currentPath.current.length - 1].texts.length !== 0 &&
                currentPath.current[currentPath.current.length - 1].type === 'cloud' &&
                currentPath.current[currentPath.current.length - 1].texts[0] !== 'finish'
            ) {
                currentPath.current[currentPath.current.length - 1].texts[0] = 'finish'
            }
            redrawMarkup()
        },
        [redrawMarkup]
    )

    const onCloudMarkupStart = React.useCallback(
        (x: number, y: number) => {
            if (
                currentPath.current.length === 0 ||
                currentPath.current[currentPath.current.length - 1].type !== 'cloud' ||
                currentPath.current[currentPath.current.length - 1].texts[0] === 'finish'
            ) {
                const path = {
                    // type: drawingStyle.type,
                    type: 'cloud',
                    width: drawingStyle.width,
                    color: drawingStyle.color,
                    values: [x, y],
                    texts: ['', 'cw', drawingStyle.texts[2], dashColor],
                    dash: [],
                    area: [x, y, x, y],
                }

                currentPath.current.push(path)
            } else {
                const path = currentPath.current[currentPath.current.length - 1]
                path.values.push(x)
                path.values.push(y)

                for (let i = 0; i < path.values.length - 1; i = i + 2) {
                    if (path.values[i] < path.area[0]) path.area[0] = path.values[i]
                    else if (path.values[i] > path.area[2]) path.area[2] = path.values[i]
                    if (path.values[i + 1] < path.area[1]) path.area[1] = path.values[i + 1]
                    else if (path.values[i + 1] > path.area[3]) path.area[3] = path.values[i + 1]
                }

                const valength = path.values.length

                if (Math.abs(path.values[0] - x) < 10 && Math.abs(path.values[1] - y) < 10) {
                    path.values[valength - 2] = path.values[0]
                    path.values[valength - 1] = path.values[1]
                    onCloudMarkupComplete()
                }
                const painter = MarkupPainter.create(viewer, markupCanvas)

                if (painter) {
                    painter.clear()
                    redrawMarkup()
                }

                if (path.texts[0] === 'finish') return true
            }
            return false
        },
        [currentPath, drawingStyle, dashColor, markupCanvas, onCloudMarkupComplete, redrawMarkup, viewer]
    )

    const onCloudNextMove = React.useCallback(
        (x: number, y: number) => {
            if (
                currentPath.current.length > 0 &&
                currentPath.current[currentPath.current.length - 1].type === 'cloud' &&
                currentPath.current[currentPath.current.length - 1].texts[0] !== 'finish'
            ) {
                const painter = MarkupPainter.create(viewer, markupCanvas)
                const path = currentPath.current[currentPath.current.length - 1]
                const values = path.values
                if (painter) {
                    redrawMarkup()
                    // painter.clear();
                    painter.singleCloud(
                        values[values.length - 2],
                        values[values.length - 1],
                        x,
                        y,
                        path.width,
                        path.color,
                        path.texts[1],
                        path.texts[2]
                    )
                }
            }
        },
        [currentPath, markupCanvas, viewer, redrawMarkup]
    )

    const onCloudMarkupShift = React.useCallback(
        (str?: string) => {
            if (
                currentPath.current.length !== 0 &&
                currentPath.current[currentPath.current.length - 1].texts.length !== 0 &&
                currentPath.current[currentPath.current.length - 1].type === 'cloud' &&
                currentPath.current[currentPath.current.length - 1].texts.length !== 0 &&
                currentPath.current[currentPath.current.length - 1].texts[0] !== 'finish'
            ) {
                if (currentPath.current[currentPath.current.length - 1].texts[1] === 'cw')
                    currentPath.current[currentPath.current.length - 1].texts[1] = 'ccw'
                else currentPath.current[currentPath.current.length - 1].texts[1] = 'cw'
                redrawMarkup()
            }
        },
        [currentPath, redrawMarkup]
    )
    // controlmode === 'pld' ----
    // PLD 설비 클릭 이벤트
    const onSelectPldHandle = React.useCallback(
        async (handles: string[], x: number, y: number) => {
            setPldHandle(handles[0])
            if (handles.length > 0) {
                const entity = entityMap.get(handles[0])
                if (entity) setPldHandleEntityType(entity.getType())
            }

            setX(x)
            setY(y)
            // (선택한 설비들) 색상변경
            entityPainter.setPldHandle(handles, pldEquipList)
        },
        [setPldHandle, setPldHandleEntityType, viewer, setX, setY, entityPainter, pldEquipList]
    )

    // 현재 PLD 프로세스 취소시 - 설비 이미지 리스트 초기화
    React.useEffect(() => {
        if (currentPld === undefined) {
            setSvgList([])
        }
    }, [currentPld, setSvgList])
    // controlmode === 'pld' ---- end

    // CanvasController 초기화
    React.useEffect(() => {
        if (viewer && lib && selectedCanvas) {
            let selectedController: CanvasController | undefined
            global.log('controlMode::', controlMode)

            if (controlMode === 'select') {
                selectedController = new SelectCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onMouseOverHandler,
                    selectedCanvas.registeredHandles,
                    onSelectHandle,
                    selectedCanvas.equipmentsByHandle
                )
            } else if (controlMode === 'markup') {
                selectedController = new MarkupCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    currentPath.current,
                    undoList,
                    setUndoList,
                    setRedoList,
                    onMarkupStart,
                    onMarkupDraw,
                    setMarkupChanged
                )
            } else if (controlMode === 'erase') {
                selectedController = new EraseCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    currentPath.current,
                    onMarkupErase,
                    undoList,
                    setUndoList,
                    setRedoList,
                    setMarkupChanged
                )
            } else if (controlMode === 'edit') {
                selectedController = new EditCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    currentPath.current,
                    undoList,
                    setUndoList,
                    setRedoList,
                    setEditMarkupIdx,
                    onMarkupEdit,
                    onMarkupErase,
                    setMarkupChanged
                )
            } else if (controlMode === 'rect') {
                selectedController = new RectMarkupCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onRectMarkupStart,
                    onRectMarkupDraw,
                    onRectMarkupShift,
                    currentPath.current,
                    undoList,
                    setUndoList,
                    setRedoList,
                    onRectMarkupComplete,
                    setMarkupChanged
                )
            } else if (controlMode === 'circle') {
                selectedController = new CircleMarkupCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onCircleMarkupStart,
                    onCircleMarkupDraw,
                    onCircleMarkupShift,
                    onCircleMarkupComplete,
                    currentPath.current,
                    undoList,
                    setUndoList,
                    setRedoList,
                    setMarkupChanged
                )
            } else if (controlMode === 'text') {
                selectedController = new TextMarkupCanvasController(viewer, lib, documentCanvas, onViewParamsChange, onInputMake)
            } else if (controlMode === 'poli') {
                onPolylineMarkupComplete()
                selectedController = new PolylineMarkupCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onPolylineMarkupStart,
                    onPolylineNextMove,
                    onPolylineMarkupComplete,
                    currentPath.current,
                    undoList,
                    setUndoList,
                    setRedoList,
                    setMarkupChanged
                )
            } else if (controlMode === 'cloud') {
                onPolylineMarkupComplete()
                selectedController = new CloudMarkupCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onCloudMarkupStart,
                    onCloudNextMove,
                    onCloudMarkupComplete,
                    currentPath.current,
                    undoList,
                    setUndoList,
                    setRedoList,
                    setMarkupChanged,
                    onCloudMarkupShift
                )
            } else if (controlMode === 'wcd') {
                selectedController = new WCDCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onSelectWCDHandle,
                    onWCDMouseOver,
                    selectedCanvas.registeredHandles
                )
            } else if (controlMode === 'pmdc') {
                selectedController = new PMDCCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onSelectPMDCHandle,
                    onPMDCMouseOver,
                    selectedCanvas.registeredHandles
                )
            } else if (controlMode === 'pldSelect') {
                selectedController = new PldSelectCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    //onSelectHandle,
                    //onMouseOverHandler,
                    selectedCanvas.registeredHandles
                )
            } else if (controlMode === 'pld') {
                selectedController = new PldCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onSelectPldHandle
                    //onMouseOverHandler,
                    //selectedCanvas.registeredHandles
                )
            } else if (controlMode === 'procedure') {
                selectedController = new ProcedureCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onSelectProcedureHandle,
                    onPMDCMouseOver,
                    selectedCanvas.registeredHandles
                )
            }
            // else if (controlMode === 'pmdc') {
            //     selectedController = new PMDCCanvasController(
            //         viewer,
            //         lib,
            //         documentCanvas,
            //         onViewParamsChange,
            //         onSelectPMDCHandle,
            //         onPMDCMouseOver,
            //         selectedCanvas.registeredHandles,
            //     )
            // }
            if (controlMode !== 'poli') onPolylineMarkupComplete()
            if (controlMode !== 'cloud') onCloudMarkupComplete()
            if (controlMode !== 'edit') resetEditIdx()
            if (controlMode !== 'select') setSelectEquipments(new Set())

            setCanvasController(selectedController)

            return () => {
                if (selectedController) {
                    selectedController.release()
                }
            }
        }
    }, [
        documentCanvas,
        lib,
        viewer,
        onViewParamsChange,
        onMouseOverHandler,
        selectedCanvas,
        setCanvasController,
        onSelectHandle,
        controlMode,
        onMarkupDraw,
        onMarkupStart,
        setMarkupChanged,
        onMarkupErase,
        undoList,
        setUndoList,
        setRedoList,
        setEditMarkupIdx,
        onMarkupEdit,
        onRectMarkupStart,
        onRectMarkupDraw,
        onRectMarkupShift,
        onRectMarkupComplete,
        onCircleMarkupStart,
        onCircleMarkupDraw,
        onCircleMarkupShift,
        onCircleMarkupComplete,
        onPolylineMarkupStart,
        onPolylineNextMove,
        onPolylineMarkupComplete,
        onCloudMarkupStart,
        onCloudNextMove,
        onCloudMarkupComplete,
        onCloudMarkupShift,
        onSelectWCDHandle,
        onWCDMouseOver,
        onPMDCMouseOver,
        onSelectPMDCHandle,
        onSelectPldHandle,
        onInputMake,
        resetEditIdx,
        setSelectEquipments,
        wcdDocHandles,
        wcdEquipments,
        selWCDEquipment,
        setSelWCDEquipment,
        setWCDDocHandles,
        setWCDEquipments,
        procedureSteps,
        selProcedureEquipments,
        setSelProcedureEquipments,
        onSelectProcedureHandle,
    ])

    // 브라우져 화면 사이즈 변경 이벤트 처리
    React.useEffect(() => {
        if (!viewer) return
        const _resizeObserver = new ResizeObserver(() => {
            resizeCanvases(viewer, [documentCanvas, markupCanvas])
            redrawMarkup()
        })
        _resizeObserver.observe(lib.canvas)
    }, [viewer])

    return {
        canvasController,
        //redraw: () => {
        //    redrawDocument()
        //},
    }
}
