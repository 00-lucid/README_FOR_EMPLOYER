import React, { Suspense, useRef, Dispatch, SetStateAction, useEffect, useState } from 'react'
import {
    getVisualizeLibInst,
    resizeCanvases,
    loadFonts,
    getModelSize,
    getModelViewSize,
    getEntities,
    worldToScreen,
    getModel
} from './utils'
import { useEntityPainter } from './useEntityPainter'
import './Canvas.css'
import { useController } from './useController'
import { ViewParams } from './MarkupPainter'
import { DrawingPath } from '../..'
import { CanvasContext } from '../useCanvasContext'
import { useOnSelectHandle } from './useOnSelectHandle'
import { EquipmentContext, Point2d } from '../../types'
import { useOnSelectPldHandle } from './useOnSelectPldHandle'
import { AppContext, StatusContext } from '../../context'
import { getCurDocumentPldSeq, requestSimbolList, simbolToSvg } from './Pld/PldUtil'
import CryptoJS from 'crypto-js'
import { CanvasRef } from '../../basicview/canvas/Canvas'
import { setBanner } from '../../popupview'
import { useWCDContents } from './useWCDContents'
import TextInput from './TextInput'

const PldSvg = React.lazy(() => {
    return import('./Pld/PldSvg').then(({ PldSvg }) => ({ default: PldSvg }))
})

type Props = {
    docFile: Uint8Array | undefined
    controlMode: string
    onLoad: () => void
    onCanvasMove: (params: ViewParams) => void
    markupPaths: DrawingPath[]
    canvasContext: CanvasContext | undefined
    curSvg: { path: JSX.Element; viewBox: string; type: string } | null
    setCurSvg: (svg: { path: JSX.Element; viewBox: string; type: string } | null) => void
    handleStep: boolean
    equipmentsByHandle: Map<string, EquipmentContext[]>

    drawingStyle: {
        type: string
        width: number
        color: string
        texts: string[]
    }
    undoList: any
    setUndoList: Dispatch<SetStateAction<any>>
    setRedoList: Dispatch<SetStateAction<any>>
    editMarkupIdx: number
    setEditMarkupIdx: Dispatch<SetStateAction<any>>
}

// registeredHandles에서만 사용한다. 한 번만 할당해서 사용하도록 해야 한다.
// 직접 new Set<string>()을 하면 매 번 새로운 인스턴스가 만들어 지는 것이다.
const emptySet = new Set<string>()

export const Canvas = React.forwardRef(
    (
        {
            docFile,
            controlMode,
            drawingStyle,
            onLoad,
            onCanvasMove,
            markupPaths,
            canvasContext,
            curSvg,
            setCurSvg,
            handleStep,
            equipmentsByHandle,
            undoList,
            setUndoList,
            setRedoList,
            setEditMarkupIdx
        }: Props,
        ref: React.Ref<CanvasRef | undefined>
    ) => {
        const status = React.useContext(StatusContext)
        const app = React.useContext(AppContext)

        const [viewer, setViewer] = React.useState<any>(undefined)
        const [lib, setLib] = React.useState<any>(undefined)
        const [currentFile, setDocFile] = React.useState<Uint8Array>()
        const [svgList, setSvgList] = React.useState<any[]>([])
        const [maskPoint, setMaskPoint] = React.useState<Point2d>({ x: 0, y: 0 })
        const [maskScale, setMaskScale] = React.useState<number>(1)
        const [ratio, setRatio] = React.useState<number>(0)
        const [isChange, setIsChange] = React.useState<boolean>(false)
        const [isVisible, setIsVisible] = useState(false)
        const [textInputObj, setTextInputObj] = useState({})
        const entityPainter = useEntityPainter(viewer, lib, canvasContext)
        const orderEquipment = useWCDContents(viewer, controlMode, entityPainter)

        const _ratio = useRef(ratio)

        const _setRatio = (ratio: number) => {
            _ratio.current = ratio
            setRatio(ratio)
        }

        const _maskScale = useRef(maskScale)

        const _setMaskScale = (scale: number) => {
            _maskScale.current = scale
            setMaskScale(scale)
        }

        const onSelectHandle = useOnSelectHandle(canvasContext, controlMode)
        const onSelectPldHandle = useOnSelectPldHandle(canvasContext)

        const onMouseOver = React.useCallback(
            (handles: string[], x: number, y: number) => {
                entityPainter?.setMouseOver(handles)
            },
            [entityPainter]
        )

        const registeredHandles = canvasContext ? canvasContext.registeredHandles : emptySet

        const controller = useController(
            viewer,
            lib,
            getCanvasElement(),
            getMarkupCanvasElement(),
            controlMode,
            drawingStyle,
            onSelectHandle,
            onSelectPldHandle,
            onMouseOver,
            onCanvasMove,
            registeredHandles,
            markupPaths,
            undoList,
            setUndoList,
            setRedoList,
            setEditMarkupIdx,
            setTextInputObj,
            equipmentsByHandle
        )

        React.useImperativeHandle(ref, () => ({
            zoomExtents: () => {
                controller?.zoomExtents()
                const ratio = getModelSize(viewer).width / getModelViewSize(viewer).width
                console.log(ratio)
            },
            zoomEntity: (handles: string[]) => {
                controller?.zoomEntity(handles)
            },
            restoreState: (state: ViewParams | undefined) => {
                controller?.restoreState(state)
            },
            redraw: () => {
                controller?.redraw()
            }
        }))
        // 1. viewer, lib 설정
        React.useEffect(() => {
            async function fetchData() {
                const lib = await getVisualizeLibInst()
                setLib(lib)

                lib.postRun.push(async () => {
                    const canvas = getCanvasElement()
                    canvas.width = canvas.clientWidth * window.devicePixelRatio
                    canvas.height = canvas.clientHeight * window.devicePixelRatio

                    lib.canvas = canvas
                    lib.Viewer.initRender(canvas.width, canvas.height, true)

                    const viewer = lib.Viewer.create()
                    setViewer(viewer)
                })
            }

            fetchData()
        }, [])

        // 이벤트 처리 - 1. 브라우져 화면 사이즈 변경
        React.useEffect(() => {
            const resizeHandler = () => {
                const canvas = getCanvasElement()
                const view = viewer.activeView
                const scale = view.viewFieldWidth / canvas.width

                resizeCanvases(viewer, [getCanvasElement(), getMarkupCanvasElement()])

                controller?.redraw()

                // window 크기가 확대/축소 되더라도 일정 scale 유지하도록 한다.
                if (controller) {
                    const extView = viewer.getActiveTvExtendedView()
                    extView.setView(
                        view.viewPosition,
                        view.viewTarget,
                        view.upVector,
                        canvas.width * scale,
                        canvas.height * scale,
                        view.perspective
                    )
                }
            }

            window.addEventListener('resize', resizeHandler)

            return () => {
                window.removeEventListener('resize', resizeHandler)
            }
        }, [controller, viewer])

        // 2. 현재 도면설정
        React.useEffect(() => {
            async function fetchData() {
                if (docFile !== currentFile) {
                    if (docFile) {
                        // vsf -> viewer.parseFile(selectedDocFile)
                        viewer.parseVsfx(docFile) // vsfx

                        //viewer.parseFile(docFile)
                        viewer.setExperimentalFunctionalityFlag('gpu_select', false)
                        viewer.setEnableSceneGraph(true)

                        // 폰트 로딩 비동기 처리.
                        loadFonts(viewer)

                        entityPainter?.reload()

                        controller?.zoomExtents()
                        resizeCanvases(viewer, [getCanvasElement(), getMarkupCanvasElement()])
                        onLoad()
                        setDocFile(docFile)
                    }
                }
            }

            if (viewer && entityPainter) fetchData()
        }, [controller, currentFile, docFile, entityPainter, onLoad, viewer])

        const calcScale = () => {
            return getModelSize(viewer).width / getModelViewSize(viewer).width
        }

        const addSvgList = (e: MouseEvent | null) => {
            if (null !== curSvg && null !== e && !status.pldHandle) {
                const cSeq = app.pldDocumentList.filter((el) => el.DOCNM === status.documentContext?.docName)[0]
                    .PLD_C_SEQ

                const x = e.clientX - 80
                const y = e.clientY

                const docArrPoint = viewer.screenToWorld(x * window.devicePixelRatio, y * window.devicePixelRatio)

                const info = {
                    seq: status.pldSimbolList.length + 1,
                    type: curSvg?.type,
                    point1X: docArrPoint[0],
                    point1Y: docArrPoint[1],
                    radptX: 0.1,
                    radptY: 0.1,
                    cSeq
                }

                status.setPldSimbolList([...status.pldSimbolList, info])

                setSvgList((svgList) => {
                    if (null !== svgList) {
                        return [...svgList, { svg: curSvg, createPoint: { x: e.clientX - 80, y: e.clientY } }]
                    }
                    return [{ svg: curSvg, createPoint: { x: e.clientX - 80, y: e.clientY } }]
                })

                setCurSvg(null)
                setMaskPoint({ x: 0, y: 0 })

                window.removeEventListener('mousedown', addSvgList)
                window.removeEventListener('keydown', cancleAddSvgList)
                window.removeEventListener('mousemove', updateMaskPoint)
                window.removeEventListener('wheel', updateMaskScale)
            } else if (null !== curSvg && status.pldHandle) {
                const entities = getEntities(viewer, [status.pldHandle])
                if (entities[0].getType() === 1) {
                    const docArrPoint = entities[0].openObject().getExtents().center()
                    const canvasPoint = worldToScreen({ x: docArrPoint[0], y: docArrPoint[1] }, viewer, lib)

                    const cSeq = getCurDocumentPldSeq(status, app)
                    const info = {
                        seq: status.pldSimbolList.length + 1,
                        type: curSvg?.type,
                        point1X: docArrPoint[0],
                        point1Y: docArrPoint[1],
                        radptX: 0.1,
                        radptY: 0.1,
                        cSeq
                    }

                    status.setPldSimbolList([...status.pldSimbolList, info])

                    setSvgList((svgList) => {
                        if (null !== svgList) {
                            return [...svgList, { svg: curSvg, createPoint: { x: canvasPoint.x, y: canvasPoint.y } }]
                        }
                        return [{ svg: curSvg, createPoint: { x: canvasPoint.x, y: canvasPoint.y } }]
                    })
                } else if (entities[0].getType() === 2) {
                    const offsetX = 3
                    const offsetY = 3

                    const docArrPoint = entities[0].openObjectAsInsert().getExtents().ext.center()
                    const canvasPoint = worldToScreen(
                        { x: docArrPoint[0] + offsetX, y: docArrPoint[1] + offsetY },
                        viewer,
                        lib
                    )

                    const cSeq = getCurDocumentPldSeq(status, app)

                    const info = {
                        seq: status.pldSimbolList.length + 1,
                        type: curSvg?.type,
                        point1X: docArrPoint[0] + offsetX,
                        point1Y: docArrPoint[1] + offsetY,
                        radptX: 0.1,
                        radptY: 0.1,
                        cSeq
                    }

                    status.setPldSimbolList([...status.pldSimbolList, info])

                    setSvgList((svgList) => {
                        if (null !== svgList) {
                            return [
                                ...svgList,
                                {
                                    svg: curSvg,
                                    createPoint: { x: canvasPoint.x, y: canvasPoint.y },
                                    radpt: { x: 0.1, y: 0.1 }
                                }
                            ]
                        }
                        return [
                            {
                                svg: curSvg,
                                createPoint: { x: canvasPoint.x, y: canvasPoint.y },
                                radpt: { x: 0.1, y: 0.1 }
                            }
                        ]
                    })
                }
                setCurSvg(null)
            }
        }

        const cancleAddSvgList = (e: any) => {
            if (e.code === 'Escape') {
                setCurSvg(null)
                window.removeEventListener('mousedown', addSvgList)
                window.removeEventListener('keydown', cancleAddSvgList)
                window.removeEventListener('mousemove', updateMaskPoint)
                window.removeEventListener('wheel', updateMaskScale)
            }
        }

        const updateMaskPoint = (e: MouseEvent) => {
            setMaskPoint({ x: e.clientX, y: e.clientY })
        }

        const updateMaskScale = () => {
            _setMaskScale(calcScale())
        }

        const blockRightClick = (e: MouseEvent) => {
            // TODO
        }

        const blockDevTools = () => {
            // TODO
        }

        const blockCapture = () => {
            // TODO
        }

        React.useEffect(() => {
            if (null !== curSvg && !status.pldHandle) {
                updateMaskScale()
                window.addEventListener('wheel', updateMaskScale)
                window.addEventListener('mousedown', addSvgList)
                window.addEventListener('keydown', cancleAddSvgList)
                window.addEventListener('mousemove', updateMaskPoint)
            } else if (null !== curSvg && status.pldHandle) {
                addSvgList(null)
            }
        }, [curSvg])

        React.useEffect(() => {
            if (app.pldMode && status.documentContext?.docNumber) {
                const { docId, docVer } = status.documentContext
                const cSeq = app.pldDocumentList.filter((el) => el.DOCNM === status.documentContext?.docName)[0]
                    .PLD_C_SEQ

                if (undefined === cSeq) {
                    return
                }

                requestSimbolList({
                    cId: app.currentPld?.PLD_C_ID,
                    cVr: app.currentPld?.PLD_C_VR,
                    docNo: docId,
                    docVr: docVer,
                    cSeq
                }).then((data: any[]) => {
                    const resultList = []
                    const pldSimbolList = []

                    for (let i = 0; i < data.length; i++) {
                        const simbol = data[i]

                        const { POINT1_X, POINT1_Y, RADPT_X, RADPT_Y } = simbol

                        const canvasPoint = worldToScreen({ x: POINT1_X, y: POINT1_Y }, viewer, lib)

                        const path = simbolToSvg(simbol)

                        const svgEl = {
                            svg: path,
                            createPoint: { x: canvasPoint.x, y: canvasPoint.y },
                            radpt: { x: RADPT_X * 10, y: RADPT_Y * 10 }
                        }

                        resultList.push(svgEl)

                        const cSeq = app.pldDocumentList.filter((el) => el.DOCNM === status.documentContext?.docName)[0]
                            .PLD_C_SEQ

                        const info = {
                            seq: i + 1,
                            type: path.type,
                            point1X: POINT1_X,
                            point1Y: POINT1_Y,
                            radptX: RADPT_X * 10,
                            radptY: RADPT_Y * 10,
                            cSeq
                        }

                        pldSimbolList.push(info)
                    }

                    if (pldSimbolList.length === 0) {
                        status.setPivotSimbolListHash('')
                    } else {
                        // 불러올 때 피벗 초기화
                        status.setPivotSimbolListHash(CryptoJS.SHA256(JSON.stringify(pldSimbolList)).toString())
                    }

                    setSvgList(resultList)
                    status.setPldSimbolList(pldSimbolList)
                })
            }
        }, [status.documentContext])

        React.useEffect(() => {
            if (null === app.currentPld) {
                setSvgList([])
            }
        }, [app.currentPld])

        React.useEffect(() => {
            if (status.pldHandle !== '' && status.pldHandle !== undefined) {
                const entitiy = getEntities(viewer, [status.pldHandle])[0]
                status.setPldHandleEntityType(entitiy.getType())
            }
        }, [status.pldHandle])

        React.useEffect(() => {
            window.addEventListener('wheel', () => {
                if (viewer) {
                    _setRatio(getModelSize(viewer).width / getModelViewSize(viewer).width)
                }
            })
        }, [viewer])

        React.useEffect(() => {
            /**
             * 도면의 확대, 축소 비율에 따라서 선 굵기가 변경되야 함
             * 구간이 많아지면 성능이슈가 발생하기 때문에 두 구간으로 구분 (기본구간, 축소구간)
             */
            const correction = 3

            if (!viewer) return

            if (isChange && _ratio.current > 1) {
                /** 기본구간 */
                const itr = getModel(viewer).getEntitiesIterator()
                while (!itr.done()) {
                    const entityId = itr.getEntity()
                    const entity = entityId.openObject()
                    if (entityId.getType() === 1) {
                        const lineWeight = entity.getLineWeight(lib.GeometryTypes.kAll)
                        const current = lineWeight.getValue()
                        if (current > 1) {
                            const after = current + correction
                            lineWeight.setValue(after)
                            entity.setLineWeight(lineWeight, 1)
                        }
                    }
                    itr.step()
                }
                setIsChange(false)
            }

            if (!isChange && _ratio.current <= 1) {
                /** 축소구간 */
                const itr = getModel(viewer).getEntitiesIterator()
                while (!itr.done()) {
                    const entityId = itr.getEntity()
                    const entity = entityId.openObject()
                    if (entityId.getType() === 1) {
                        const lineWeight = entity.getLineWeight(lib.GeometryTypes.kAll)
                        const current = lineWeight.getValue()
                        if (current > 4) {
                            const after = current - correction
                            lineWeight.setValue(after)
                            entity.setLineWeight(lineWeight, 1)
                        }
                    }
                    itr.step()
                }
                setIsChange(true)
            }
        }, [_ratio.current, entityPainter])

        return (
            <div>
                {/* oda lib.에서 Canvas ID를 필요로 한다. id="documentCanvas" 삭제 금지 */}
                <canvas
                    id="documentCanvas"
                    onClick={() => {
                        if (controlMode !== 'text') return
                        setIsVisible(!isVisible)
                    }}
                />
                <canvas id="markupCanvas" />
                <Suspense fallback={false}>
                    {app.pldMode && (
                        <PldSvg
                            svgList={svgList}
                            viewer={viewer}
                            lib={lib}
                            handleStep={handleStep}
                            setSvgList={setSvgList}
                            controlMode={controlMode}
                        />
                    )}
                    {isVisible && (
                        <TextInput
                            undoList={undoList}
                            setUndoList={setUndoList}
                            setRedoList={setRedoList}
                            viewer={viewer}
                            markupCanvas={document.getElementById('markupCanvas')}
                            drawingStyle={drawingStyle}
                            markupPaths={markupPaths}
                            isVisible={isVisible}
                            setIsVisible={setIsVisible}
                            textInputObj={textInputObj}
                        />
                    )}
                </Suspense>
            </div>
        )
    }
)

const getCanvasElement = (): HTMLCanvasElement => {
    return document.getElementById('documentCanvas') as HTMLCanvasElement
}

const getMarkupCanvasElement = (): HTMLCanvasElement => {
    return document.getElementById('markupCanvas') as HTMLCanvasElement
}
