import { useContext, useEffect, useRef, useState } from 'react'
import { Point2d } from '../../../types'
import './PldEditor.css'
import { getModelSize, getModelViewSize } from '../utils'
import { StatusContext } from '../../../context'

interface Props {
    viewer: any
    boundingClientRect: DOMRect | null
    setCanvasPoint: (point: Point2d) => void
    setDocPoint: (point: Point2d) => void
    updateBoundingClientRect: () => void
    setScale: (scale: number) => void
    setSvgWidth: (width: number) => void
    setSvgHeight: (height: number) => void
    scale: number
    svgWidth: number
    svgHeight: number
    setSvgList: any
    idx: number
    updateSimbolList: () => void
    canvasPoint: Point2d
}

export function PldEditor({
    viewer,
    boundingClientRect,
    setCanvasPoint,
    setDocPoint,
    setScale,
    setSvgWidth,
    setSvgHeight,
    updateBoundingClientRect,
    scale,
    svgWidth,
    svgHeight,
    setSvgList,
    idx,
    updateSimbolList,
    canvasPoint
}: Props) {
    const status = useContext(StatusContext)

    const [isDown, setIsDown] = useState<boolean>(false)
    const [startPoint, setStartPoint] = useState<Point2d>({ x: 0, y: 0 })

    const _isDown = useRef(isDown)
    const _startPoint = useRef(startPoint)

    const _setStartPoint = (point: Point2d) => {
        _startPoint.current = point
        setStartPoint(point)
    }
    const _setIsDown = (isDown: boolean) => {
        _isDown.current = isDown
        setIsDown(isDown)
    }

    const calcRatio = (val1: number, val2: number): number => {
        return val1 / val2
    }

    const calcDistance = (point1: Point2d, point2: Point2d): number => {
        const x = point1.x - point2.x
        const y = point1.y - point2.y
        const distance = Math.sqrt(x ** 2 + y ** 2)
        return distance
    }

    const calcStartPoint = (point: Point2d): Point2d => {
        if (null !== boundingClientRect) {
            const startPoint_ = { x: point.x - canvasPoint.x - 80, y: point.y - canvasPoint.y }
            return startPoint_
        }
        return { x: -1, y: -1 }
    }

    const calcPivotPoint = (quadrant: number): Point2d => {
        if (null !== boundingClientRect) {
            switch (quadrant) {
                case 1:
                    return { x: canvasPoint.x + boundingClientRect.width, y: canvasPoint.y }
                case 2:
                    return { x: canvasPoint.x, y: canvasPoint.y }
                case 3:
                    return { x: canvasPoint.x, y: canvasPoint.y + boundingClientRect.height }
                case 4:
                    return {
                        x: canvasPoint.x + boundingClientRect.width,
                        y: canvasPoint.y + boundingClientRect.height
                    }
                default:
                    return { x: -1, y: -1 }
            }
        }
        return { x: -1, y: -1 }
    }

    const move = (point: Point2d): void => {
        setCanvasPoint(point)
        const docArrPoint = viewer.screenToWorld(point.x * window.devicePixelRatio, point.y * window.devicePixelRatio)
        setDocPoint({ x: docArrPoint[0], y: docArrPoint[1] })
    }

    const mouseDownMove = (e: any) => {
        if (!_isDown.current) {
            _setIsDown(true)

            const startPoint_ = calcStartPoint({ x: e.clientX, y: e.clientY })
            _setStartPoint(startPoint_)

            window.addEventListener('mousemove', mouseDragMove)
            window.addEventListener('mouseup', mouseUp)
        }
    }

    const mouseDragMove = (e: MouseEvent) => {
        if (_isDown.current) {
            const currentPoint = { x: e.clientX - 80 - _startPoint.current.x, y: e.clientY - _startPoint.current.y }
            move(currentPoint)
        }
    }

    const mouseDownScale = (target: number) => {
        if (null !== boundingClientRect) {
            _setIsDown(true)
            _setStartPoint(calcPivotPoint(target))

            switch (target) {
                case 1:
                    // origin 0% 100%
                    break
                case 2:
                    // origin 100% 100%
                    break
                case 3:
                    // origin 100% 0%
                    break
                case 4:
                    // origin 0% 0% default
                    window.addEventListener('mousemove', mouseDragScale)
                    break
                default:
                    break
            }
            window.addEventListener('mouseup', mouseUp)
        }
    }

    const mouseDragScale = (e: MouseEvent) => {
        if (null !== boundingClientRect) {
            let sign = 1

            const startPoint_ = _startPoint.current
            const currentPoint = { x: e.clientX, y: e.clientY }
            const distance = calcDistance(startPoint_, currentPoint)

            if (currentPoint.x < startPoint_.x && currentPoint.y < startPoint_.y) {
                sign = -1
            }

            const result = (distance / Math.sqrt(2)) * sign

            const correctionDimension = getModelViewSize(viewer).width / getModelSize(viewer).width

            const resultWidth = svgWidth + result * correctionDimension
            const resultHeight = svgHeight + result * correctionDimension

            setSvgWidth(Math.abs(resultWidth))
            setSvgHeight(Math.abs(resultHeight))

            const x = boundingClientRect.x + boundingClientRect.width
            const y = boundingClientRect.y + boundingClientRect.height
            _setStartPoint({ x, y })
        }
    }

    const mouseUp = () => {
        _setIsDown(false)
        _setStartPoint({ x: 0, y: 0 })

        updateSimbolList()

        window.removeEventListener('mousemove', mouseDragMove)
        window.removeEventListener('mousemove', mouseDragScale)

        window.removeEventListener('mouseup', mouseUp)

        updateBoundingClientRect()
    }

    const remove = (e: any) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            setSvgList((old: any[]) => [...old.slice(0, idx), ...old.slice(idx + 1)])

            const currentSimbolList = [...status.pldSimbolList.slice(0, idx), ...status.pldSimbolList.slice(idx + 1)]
            status.setPldSimbolList(currentSimbolList)
        }
    }

    useEffect(() => {
        status.setPldHandle('')

        window.addEventListener('keydown', remove)

        return () => {
            window.removeEventListener('keydown', remove)
        }
    }, [])

    return (
        <>
            <rect className="editMove" width={svgWidth + 3} height={svgHeight + 3} onMouseDown={mouseDownMove} />
            {/* 1 */}
            {/* <rect className="editScale bottom-right" width={4} height={4} x={`${svgWidth + 3}`} y={`-4`} /> */}
            {/* 2 */}
            {/* <rect className="editScale top-left" width={4} height={4} x={`-4`} y={`-4`} cursor="nwse-resize" /> */}
            {/* 3 */}
            {/* <rect className="editScale bottom-right" width={4} height={4} x={`-4`} y={`${svgHeight + 3}`} /> */}
            {/* 4 */}
            <rect
                className="editScale top-left"
                width={4}
                height={4}
                x={`${svgWidth + 3}`}
                y={`${svgHeight + 3}`}
                onMouseDown={() => mouseDownScale(4)}
            />
        </>
    )
}
