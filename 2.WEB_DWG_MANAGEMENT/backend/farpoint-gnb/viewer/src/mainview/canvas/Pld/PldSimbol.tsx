import { useContext, useEffect, useRef, useState } from 'react'
import { Point2d } from '../../../types'
import { PldEditor } from './PldEditor'
import { getModelSize, getModelViewSize, worldToScreen } from '../utils'
import './PldSimbol.css'
import { StatusContext } from '../../../context'

interface Props {
    svg: any
    viewer: any
    lib: any
    handleStep: boolean
    setSvgList: any
    idx: number
    controlMode: string
}

export function PldSimbol({ svg, viewer, lib, handleStep, setSvgList, idx, controlMode }: Props) {
    const status = useContext(StatusContext)

    const [canvasPoint, setCanvasPoint] = useState<Point2d>({ x: svg.createPoint.x, y: svg.createPoint.y })
    const [docPoint, setDocPoint] = useState<Point2d>({ x: 0, y: 0 })
    const [scale, setScale] = useState<number>(1)
    const [boundingClientRect, setBoundingClientRect] = useState<DOMRect | null>(null)
    const [isEditor, setIsEditor] = useState<boolean>(false)
    const [svgWidth, setSvgWidth] = useState<number>(svg.radpt.x)
    const [svgHeight, setSvgHeight] = useState<number>(svg.radpt.y)
    const [isDown, setIsDown] = useState<boolean>(false)

    const firstChildSvg = useRef<any>(null)

    const _canvasPoint = useRef(canvasPoint)
    const _docPoint = useRef(docPoint)
    const _scale = useRef(scale)
    const _boundingClientRect = useRef(boundingClientRect)
    const _isEditor = useRef(isEditor)
    const _svgWidth = useRef(svgWidth)
    const _svgHeight = useRef(svgHeight)
    const _isDown = useRef(isDown)

    const _setCanvasPoint = (point: Point2d) => {
        _canvasPoint.current = point
        setCanvasPoint(point)
    }
    const _setDocPoint = (point: Point2d) => {
        _docPoint.current = point
        setDocPoint(point)
    }
    const _setScale = (scale: number) => {
        _scale.current = scale
        setScale(scale)
    }
    const _setBoundingClientRect = (domRect: DOMRect) => {
        _boundingClientRect.current = domRect
        setBoundingClientRect(domRect)
    }
    const _setSvgWidth = (width: number) => {
        _svgWidth.current = width
        setSvgWidth(width)
    }
    const _setSvgHeight = (height: number) => {
        _svgHeight.current = height
        setSvgHeight(height)
    }
    const _setIsEditor = (boolean: boolean) => {
        _isEditor.current = boolean
        setIsEditor(boolean)
    }
    const _setIsDown = (boolean: boolean) => {
        _isDown.current = boolean
        setIsDown(boolean)
    }

    const isMouseIn = (mouseX: number, mouseY: number) => {
        if (null !== _boundingClientRect.current) {
            const startPoint: Point2d = { x: _canvasPoint.current.x, y: _canvasPoint.current.y }
            const endPoint: Point2d = {
                x: startPoint.x + _boundingClientRect.current.width,
                y: startPoint.y + _boundingClientRect.current.height
            }

            if (startPoint.x <= mouseX && mouseX <= endPoint.x && startPoint.y <= mouseY && mouseY <= endPoint.y) {
                return false
            }

            return true
        }
    }

    const updateBoundingClientRect = () => {
        const boundingClientRect = firstChildSvg?.current?.getBoundingClientRect()
        _setBoundingClientRect(boundingClientRect)
    }

    const calcScale = () => {
        return getModelSize(viewer).width / getModelViewSize(viewer).width
    }

    const unEditor = (e: MouseEvent) => {
        const _isMouseIn = isMouseIn(e.clientX - 80, e.clientY)
        if (_isMouseIn) {
            _setIsEditor(false)
        }
    }

    const panning = (e: MouseEvent) => {
        const canvasPoint_ = worldToScreen({ x: _docPoint.current.x, y: _docPoint.current.y }, viewer, lib)
        _setCanvasPoint(canvasPoint_)
    }

    const mouseDownPanning = () => {
        window.addEventListener('mousemove', panning)
        window.addEventListener('mouseup', mouseUpPannig)
    }

    const mouseUpPannig = () => {
        window.removeEventListener('mousemove', panning)
        window.removeEventListener('mouseup', mouseUpPannig)
    }

    const init = () => {
        const worldPoint = viewer.screenToWorld(
            _canvasPoint.current.x * window.devicePixelRatio,
            _canvasPoint.current.y * window.devicePixelRatio
        )
        const boundingClientRect = firstChildSvg?.current?.getBoundingClientRect()

        _setScale(calcScale())
        _setDocPoint({ x: worldPoint[0], y: worldPoint[1] })
        setBoundingClientRect(boundingClientRect)

        window.addEventListener('wheel', step)
        window.addEventListener('mousemove', panning)
        window.addEventListener('mousedown', unEditor)
        window.addEventListener('mousedown', mouseDownPanning)
    }

    useEffect(() => {
        init()
        return () => {
            window.removeEventListener('mousedown', unEditor)
            window.removeEventListener('wheel', step)
            window.removeEventListener('mousemove', panning)
            window.removeEventListener('mousedown', mouseDownPanning)
        }
    }, [])

    const step = () => {
        const point2d = { x: _docPoint.current.x, y: _docPoint.current.y }
        const screenPoint = worldToScreen(point2d, viewer, lib)

        _setScale(calcScale())
        _setCanvasPoint(screenPoint)

        updateBoundingClientRect()
    }

    useEffect(() => {
        step()
    }, [handleStep])

    const updateSimbolList = () => {
        if (status.pldSimbolList.length > idx) {
            const temp = [...status.pldSimbolList]
            const target = temp[idx]
            target.point1X = _docPoint.current.x
            target.point1Y = _docPoint.current.y
            target.radptX = _svgWidth.current
            target.radptY = _svgHeight.current
            status.setPldSimbolList(temp)
        }
    }

    return (
        <g
            ref={firstChildSvg}
            transform={`translate(${_canvasPoint.current.x}, ${_canvasPoint.current.y}) scale(${1 * _scale.current})`}
        >
            <rect
                display={!isEditor ? 'block' : 'none'}
                fill="rgba(0,0,0,0)"
                pointerEvents="painted"
                width={_svgWidth.current + 3}
                height={_svgHeight.current + 3}
                onMouseDown={() => _setIsEditor(true)}
            ></rect>
            <svg width={_svgWidth.current + 3} height={_svgHeight.current + 3} viewBox={svg.svg.viewBox}>
                {svg.svg.path}
            </svg>
            {isEditor && !status.pldHandle && controlMode === 'pld' && (
                <PldEditor
                    viewer={viewer}
                    boundingClientRect={_boundingClientRect.current}
                    setCanvasPoint={_setCanvasPoint}
                    setDocPoint={_setDocPoint}
                    setScale={_setScale}
                    setSvgWidth={_setSvgWidth}
                    setSvgHeight={_setSvgHeight}
                    scale={_scale.current}
                    svgWidth={_svgWidth.current}
                    svgHeight={_svgHeight.current}
                    updateBoundingClientRect={updateBoundingClientRect}
                    setSvgList={setSvgList}
                    idx={idx}
                    updateSimbolList={updateSimbolList}
                    canvasPoint={_canvasPoint.current}
                />
            )}
        </g>
    )
}
