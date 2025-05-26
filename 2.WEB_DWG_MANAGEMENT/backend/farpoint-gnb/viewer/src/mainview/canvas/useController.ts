import React, { Dispatch, SetStateAction } from 'react'
import { DrawingPath, EquipmentContext } from '../../types'
import {
    CanvasController,
    SelectCanvasController,
    EraseCanvasController,
    EditCanvasController,
    MarkupCanvasController,
    RectMarkupCanvasController,
    CircleMarkupCanvasController,
    TextMarkupCanvasController,
    PolylineMarkupCanvasController,
    CloudMarkupCanvasController,
    WCDCanvasController,
    PldCanvasController,
    PldSelectCanvasController
} from './CanvasController'
import { ViewParams, MarkupPainter } from './MarkupPainter'
import { AppContext, StatusContext, ThemeContext } from '../../context'

export function useController(
    viewer: any,
    lib: any,
    documentCanvas: HTMLCanvasElement,
    markupCanvas: HTMLCanvasElement,
    controlMode: string,
    drawingStyle: {
        type: string
        width: number
        color: string
        texts: string[]
    },
    onSelectHandle: (handles: string[], x: number, y: number, controlMode: string) => void,
    onSelectPldHandle: (handles: string[], x: number, y: number) => void,
    onMouseOver: (handles: string[], x: number, y: number) => void,
    onMoveCanvas: (params: ViewParams) => void,
    registeredHandles: Set<string>,
    currentPath: DrawingPath[],
    undoList: any,
    setUndoList: Dispatch<SetStateAction<any>>,
    setRedoList: Dispatch<SetStateAction<any>>,
    setEditMarkupIdx: Dispatch<SetStateAction<any>>,
    setTextInputObj: any,
    equipmentsByHandle: Map<string, EquipmentContext[]>
) {
    const appContext = React.useContext(AppContext)
    const theme = React.useContext(ThemeContext)
    const dashColor = theme.theme.type == 'light' ? 'black' : 'white'

    const [controller, setController] = React.useState<CanvasController>()
    const shiftRef = React.useRef(false)

    const paint = React.useMemo(() => {
        return { documentFrameId: -1, markupFrameId: -1 }
    }, [])

    const redrawDocument = React.useCallback(() => {
        if (viewer) {
            const render = () => {
                viewer.update()

                paint.documentFrameId = -1
            }

            if (paint.documentFrameId === -1) {
                paint.documentFrameId = requestAnimationFrame(render)
            }
        }
    }, [viewer, paint])

    const redrawMarkup = React.useCallback(() => {
        const render = () => {
            const painter = MarkupPainter.create(viewer, markupCanvas)
            if (painter) {
                painter.clear()
                for (const path of currentPath) {
                    if (path.type === 'rect') {
                        if (dashColor != path.texts[2]) path.texts[2] = dashColor
                        painter.rectDraw(path)
                    } else if (path.type === 'circle') {
                        if (dashColor != path.texts[2]) path.texts[2] = dashColor
                        painter.circleDraw(path)
                    } else if (path.type === 'line') {
                        if (dashColor != path.texts[0]) path.texts[0] = dashColor
                        painter.draw(path)
                    } else if (path.type === 'text') {
                        if (dashColor != path.texts[5]) path.texts[5] = dashColor
                        painter.textDraw(path)
                    } else if (path.type === 'polyline') {
                        if (dashColor != path.texts[1]) path.texts[1] = dashColor
                        painter.lineDraw(path)
                    } else if (path.type === 'cloud') {
                        if (dashColor != path.texts[3]) path.texts[3] = dashColor
                        painter.cloudDraw(path)
                    }
                }
            }

            // paint.markupFrameId = -1;
        }
        render()
        // if (paint.markupFrameId === -1) {
        //     paint.markupFrameId = requestAnimationFrame(render);
        // }
    }, [undoList, currentPath, markupCanvas, paint, viewer, dashColor])

    redrawMarkup()
    redrawDocument()

    const onViewParamsChange = React.useCallback(
        (params: ViewParams) => {
            redrawMarkup()
            redrawDocument()

            onMoveCanvas(params)
        },
        [onMoveCanvas, redrawDocument, redrawMarkup]
    )

    const onMarkupStart = React.useCallback(
        (x: number, y: number) => {
            const path = {
                type: drawingStyle.type,
                width: drawingStyle.width,
                color: drawingStyle.color,
                values: [x, y],
                texts: [dashColor],
                dash: [],
                area: [x, y, x, y]
            }

            currentPath.push(path)
        },
        [currentPath, drawingStyle]
    )

    const onMarkupDraw = React.useCallback(
        (x: number, y: number) => {
            currentPath[currentPath.length - 1].values.push(x, y)
            const path = currentPath[currentPath.length - 1]
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
        [currentPath, drawingStyle.color, drawingStyle.type, drawingStyle.width, markupCanvas, viewer, dashColor]
    )

    const onMarkupErase = React.useCallback(
        (x: number, y: number) => {
            redrawMarkup()
        },
        [redrawMarkup]
    )

    const setEditIdx = React.useCallback(
        (idx: number) => {
            if (idx > currentPath.length - 1) return
            for (let i = 0; i < currentPath.length; i++) currentPath[i].dash = []
            currentPath[idx].dash = [2, 2]
            // console.log('markupPaths:', currentPath, 'idx:', idx);
        },
        [currentPath]
    )
    const resetEditIdx = React.useCallback(() => {
        for (let i = 0; i < currentPath.length; i++) currentPath[i].dash = []
        setEditMarkupIdx(-1)
    }, [currentPath])
    const onMarkupEdit = React.useCallback(
        (idx: number) => {
            if (idx >= 0) setEditIdx(idx)
            else resetEditIdx()
            redrawMarkup()
            // console.log('onMarkupEdit');
        },
        [redrawMarkup]
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
                area: [x, y, x, y]
            }

            currentPath.push(path)
            redrawMarkup()
        },
        [currentPath, drawingStyle]
    )

    const onRectMarkupDraw = React.useCallback(
        (x: number, y: number) => {
            let values = currentPath[currentPath.length - 1].values
            let area = currentPath[currentPath.length - 1].area
            if (currentPath[currentPath.length - 1].texts[1] == 'shift') {
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
        [currentPath, drawingStyle.color, drawingStyle.type, drawingStyle.width, markupCanvas, viewer, redrawMarkup]
    )

    const onRectMarkupShift = React.useCallback(
        (str?: string) => {
            if (
                currentPath.length !== 0 &&
                currentPath[currentPath.length - 1].texts.length !== 0 &&
                currentPath[currentPath.length - 1].type === 'rect' &&
                currentPath[currentPath.length - 1].texts[0] !== 'finish'
            ) {
                currentPath[currentPath.length - 1].texts[1] = str!
                redrawMarkup()
            }
            if (str !== '') shiftRef.current = true
            else shiftRef.current = false
            console.log('rectShift:', currentPath)
        },
        [currentPath]
    )

    const onRectMarkupComplete = React.useCallback(
        (key?: string) => {
            if (
                currentPath.length !== 0 &&
                currentPath[currentPath.length - 1].texts.length !== 0 &&
                currentPath[currentPath.length - 1].type === 'rect'
            ) {
                currentPath[currentPath.length - 1].texts[0] = 'finish'
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
                area: [x, y, x, y]
            }
            currentPath.push(path)
        },
        [currentPath, drawingStyle]
    )

    const onCircleMarkupDraw = React.useCallback(
        (x: number, y: number) => {
            let values = currentPath[currentPath.length - 1].values
            let area = currentPath[currentPath.length - 1].area
            if (currentPath[currentPath.length - 1].texts[1] == 'shift') {
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
        [currentPath, drawingStyle.color, drawingStyle.type, drawingStyle.width, markupCanvas, viewer]
    )

    const onCircleMarkupShift = React.useCallback(
        (str?: string) => {
            if (
                currentPath.length !== 0 &&
                currentPath[currentPath.length - 1].texts.length !== 0 &&
                currentPath[currentPath.length - 1].type === 'circle' &&
                currentPath[currentPath.length - 1].texts[0] !== 'finish'
            ) {
                currentPath[currentPath.length - 1].texts[1] = str!
                redrawMarkup()
            }
            console.log('rectShift:', currentPath)
            if (str !== '') shiftRef.current = true
            else shiftRef.current = false
        },
        [currentPath]
    )

    const onCircleMarkupComplete = React.useCallback(
        (key?: string) => {
            if (
                currentPath.length !== 0 &&
                currentPath[currentPath.length - 1].texts.length !== 0 &&
                currentPath[currentPath.length - 1].type === 'circle'
            ) {
                currentPath[currentPath.length - 1].texts[0] = 'finish'
            }
        },
        [currentPath]
    )

    const onInputMake = (point: any) => {
        const painter = MarkupPainter.create(viewer, markupCanvas)
        if (painter) {
            const screenHeight = painter['canvas'].height
            const x = (point.x + painter['adjust'].x) * painter['adjust'].scale
            const y = screenHeight - (point.y + painter['adjust'].y) * painter['adjust'].scale
            setTextInputObj({
                startX: point.x,
                startY: point.y,
                x: x,
                y: y,
                dashColor: dashColor
            })
        } else {
            return
        }
    }

    const onPolylineMarkupStart = React.useCallback(
        (x: number, y: number) => {
            if (
                currentPath.length == 0 ||
                currentPath[currentPath.length - 1].type != 'polyline' ||
                currentPath[currentPath.length - 1].texts[0] == 'finish'
            ) {
                const path = {
                    // type: drawingStyle.type,
                    type: 'polyline',
                    width: drawingStyle.width,
                    color: drawingStyle.color,
                    values: [x, y],
                    texts: ['', dashColor],
                    dash: [],
                    area: [x, y, x, y]
                }

                currentPath.push(path)
                console.log('onPolylineStart:', currentPath)
            } else {
                const path = currentPath[currentPath.length - 1]
                path.values.push(x)
                path.values.push(y)

                for (let i = 0; i < path.values.length - 1; i = i + 2) {
                    if (path.values[i] < path.area[0]) path.area[0] = path.values[i]
                    else if (path.values[i] > path.area[2]) path.area[2] = path.values[i]
                    if (path.values[i + 1] < path.area[1]) path.area[1] = path.values[i + 1]
                    else if (path.values[i + 1] > path.area[3]) path.area[3] = path.values[i + 1]
                }

                const valength = currentPath[currentPath.length - 1].values.length

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
                console.log('onPolylineDraw:', currentPath)
                if (path.texts[0] == 'finish') return true
            }
            return false
        },
        [currentPath, drawingStyle]
    )

    const onPolylineNextMove = React.useCallback(
        (x: number, y: number) => {
            // console.log("x1:", x, " y1:", y);
            if (
                currentPath.length > 0 &&
                currentPath[currentPath.length - 1].type == 'polyline' &&
                currentPath[currentPath.length - 1].texts[0] != 'finish'
            ) {
                const painter = MarkupPainter.create(viewer, markupCanvas)
                const path = currentPath[currentPath.length - 1]
                const values = path.values
                if (painter) {
                    redrawMarkup()
                    // painter.clear();
                    painter.singleLine(
                        values[values.length - 2],
                        values[values.length - 1],
                        x,
                        y,
                        path.width,
                        path.color
                    )
                }
            }
        },
        [currentPath, markupCanvas, paint, viewer, redrawMarkup]
    )

    const onPolylineMarkupComplete = React.useCallback(
        (key?: string) => {
            if (
                currentPath.length !== 0 &&
                currentPath[currentPath.length - 1].texts.length !== 0 &&
                currentPath[currentPath.length - 1].type === 'polyline' &&
                currentPath[currentPath.length - 1].texts[0] !== 'finish'
            )
                currentPath[currentPath.length - 1].texts[0] = 'finish'
        },
        [currentPath]
    )

    const onCloudMarkupStart = React.useCallback(
        (x: number, y: number) => {
            if (
                currentPath.length == 0 ||
                currentPath[currentPath.length - 1].type != 'cloud' ||
                currentPath[currentPath.length - 1].texts[0] == 'finish'
            ) {
                const path = {
                    // type: drawingStyle.type,
                    type: 'cloud',
                    width: drawingStyle.width,
                    color: drawingStyle.color,
                    values: [x, y],
                    texts: ['', 'cw', drawingStyle.texts[2], dashColor],
                    dash: [],
                    area: [x, y, x, y]
                }

                currentPath.push(path)
                console.log('onCloudStart:', currentPath)
            } else {
                const path = currentPath[currentPath.length - 1]
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

                console.log('onCloudDraw:', currentPath)
                if (path.texts[0] == 'finish') return true
            }
            return false
        },
        [currentPath, drawingStyle]
    )

    const onCloudNextMove = React.useCallback(
        (x: number, y: number) => {
            // console.log('x1:', x, ' y1:', y);
            if (
                currentPath.length > 0 &&
                currentPath[currentPath.length - 1].type == 'cloud' &&
                currentPath[currentPath.length - 1].texts[0] != 'finish'
            ) {
                const painter = MarkupPainter.create(viewer, markupCanvas)
                const path = currentPath[currentPath.length - 1]
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
        [currentPath, markupCanvas, paint, viewer, redrawMarkup]
    )

    const onCloudMarkupComplete = React.useCallback(
        (key?: string) => {
            if (
                currentPath.length !== 0 &&
                currentPath[currentPath.length - 1].texts.length !== 0 &&
                currentPath[currentPath.length - 1].type === 'cloud' &&
                currentPath[currentPath.length - 1].texts[0] !== 'finish'
            ) {
                currentPath[currentPath.length - 1].texts[0] = 'finish'
            }
        },
        [currentPath]
    )

    const onCloudMarkupShift = React.useCallback(
        (str?: string) => {
            if (
                currentPath.length !== 0 &&
                currentPath[currentPath.length - 1].texts.length !== 0 &&
                currentPath[currentPath.length - 1].type === 'cloud' &&
                currentPath[currentPath.length - 1].texts.length !== 0 &&
                currentPath[currentPath.length - 1].texts[0] !== 'finish'
            ) {
                if (currentPath[currentPath.length - 1].texts[1] === 'cw')
                    currentPath[currentPath.length - 1].texts[1] = 'ccw'
                else currentPath[currentPath.length - 1].texts[1] = 'cw'
                redrawMarkup()
            }
        },
        [currentPath]
    )

    React.useEffect(() => {
        let controller_: CanvasController | undefined

        if (viewer && lib) {
            if (controlMode === 'select') {
                controller_ = new SelectCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onSelectHandle,
                    onMouseOver,
                    registeredHandles,
                    equipmentsByHandle
                )
            } else if (controlMode === 'edit') {
                controller_ = new EditCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    currentPath,
                    undoList,
                    setUndoList,
                    setRedoList,
                    setEditMarkupIdx,
                    onMarkupEdit,
                    onMarkupErase,
                    appContext.setMarkupChanged
                )
            } else if (controlMode === 'markup') {
                controller_ = new MarkupCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    currentPath,
                    undoList,
                    setUndoList,
                    setRedoList,
                    onMarkupStart,
                    onMarkupDraw,
                    appContext.setMarkupChanged
                )
            } else if (controlMode === 'erase') {
                controller_ = new EraseCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    currentPath,
                    onMarkupErase,
                    undoList,
                    setUndoList,
                    setRedoList,
                    appContext.setMarkupChanged
                )
            } else if (controlMode === 'rect') {
                controller_ = new RectMarkupCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onRectMarkupStart,
                    onRectMarkupDraw,
                    onRectMarkupShift,
                    currentPath,
                    undoList,
                    setUndoList,
                    setRedoList,
                    onRectMarkupComplete,
                    appContext.setMarkupChanged
                )
            } else if (controlMode === 'circle') {
                controller_ = new CircleMarkupCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onCircleMarkupStart,
                    onCircleMarkupDraw,
                    onCircleMarkupShift,
                    onCircleMarkupComplete,
                    currentPath,
                    undoList,
                    setUndoList,
                    setRedoList,
                    appContext.setMarkupChanged
                )
            } else if (controlMode === 'text') {
                controller_ = new TextMarkupCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onInputMake
                )
            } else if (controlMode === 'poli') {
                onPolylineMarkupComplete()
                controller_ = new PolylineMarkupCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onPolylineMarkupStart,
                    onPolylineNextMove,
                    onPolylineMarkupComplete,
                    currentPath,
                    undoList,
                    setUndoList,
                    setRedoList,
                    appContext.setMarkupChanged
                )
            } else if (controlMode === 'cloud') {
                onPolylineMarkupComplete()
                controller_ = new CloudMarkupCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onCloudMarkupStart,
                    onCloudNextMove,
                    onCloudMarkupComplete,
                    currentPath,
                    undoList,
                    setUndoList,
                    setRedoList,
                    appContext.setMarkupChanged,
                    onCloudMarkupShift
                )
            } else if (controlMode === 'wcd') {
                controller_ = new WCDCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onSelectHandle,
                    onMouseOver,
                    registeredHandles
                )
            } else if (controlMode === 'pld') {
                controller_ = new PldCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onSelectPldHandle,
                    onMouseOver,
                    registeredHandles
                )
            } else if (controlMode === 'pldSelect') {
                controller_ = new PldSelectCanvasController(
                    viewer,
                    lib,
                    documentCanvas,
                    onViewParamsChange,
                    onSelectHandle,
                    onMouseOver,
                    registeredHandles
                )
            }
            if (controlMode !== 'poli') onPolylineMarkupComplete()
            if (controlMode !== 'cloud') onCloudMarkupComplete()
            if (controlMode !== 'edit') resetEditIdx()

            setController(controller_)
        }

        return () => {
            if (controller_) {
                controller_.release()
            }
        }
    }, [
        appContext.setMarkupChanged,
        controlMode,
        currentPath,
        documentCanvas,
        lib,
        onMarkupDraw,
        onMarkupErase,
        onMarkupStart,
        onMouseOver,
        onSelectHandle,
        onViewParamsChange,
        registeredHandles,
        viewer,
        onRectMarkupStart,
        onRectMarkupDraw,
        onCircleMarkupStart,
        onCircleMarkupDraw,
        equipmentsByHandle
    ])

    return {
        zoomExtents: () => {
            controller?.zoomExtents()
        },
        zoomEntity: (handles: string[]) => {
            controller?.zoomEntity(handles)
        },
        restoreState: (params: ViewParams | undefined) => {
            controller?.setViewParams(params)
        },
        redraw: () => {
            redrawDocument()
            redrawMarkup()
        }
    }
}
