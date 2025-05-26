import React, { useEffect, useRef } from 'react'
import './PldEditor.css'
import { useSetRecoilState, useRecoilState } from 'recoil'
// 전역 Store
import { PldStore } from '../../../../Store/statusStore'
// Lib
import { global } from '../../../../Lib/util'
import { calcDistance } from '../../../../Lib/canvasUtils'
import { getModelSize, getModelViewSize } from '../../../../Lib/canvasUtils'

export function PldEditor({
    viewer,
    boundingClientRect,
    canvasPoint,
    svgWidth,
    svgHeight,
    setSvgWidth,
    setSvgHeight,
    docPoint,
    updateBoundingClientRect,
    idx,
    updateSimbolList,
}: PldEditorProps) {
    global.log('PldEditor:start::')

    // 전역 Store
    const setSvgList = useSetRecoilState(PldStore.svgList)
    const [pldSimbolList, setPldSimbolList] = useRecoilState(PldStore.pldSimbolList)

    const isDown = useRef<boolean>(false)
    const startPoint = useRef<Point2d>({ x: 0, y: 0 })

    const mouseDownMove = (e: any) => {
        if (!isDown.current) {
            isDown.current = true
            startPoint.current = calcStartPoint({ x: e.clientX, y: e.clientY })

            window.addEventListener('mousemove', mouseDragMove)
            window.addEventListener('mouseup', mouseUp)
        }
    }

    const calcPivotPoint = (quadrant: number): Point2d => {
        if (null !== boundingClientRect.current) {
            switch (quadrant) {
                case 1:
                    return { x: canvasPoint.x + boundingClientRect.current.width, y: canvasPoint.y }
                case 2:
                    return { x: canvasPoint.x, y: canvasPoint.y }
                case 3:
                    return { x: canvasPoint.x, y: canvasPoint.y + boundingClientRect.current.height }
                case 4:
                    return {
                        x: canvasPoint.x + boundingClientRect.current.width,
                        y: canvasPoint.y + boundingClientRect.current.height,
                    }
                default:
                    return { x: -1, y: -1 }
            }
        }
        return { x: -1, y: -1 }
    }

    const move = (point: Point2d): void => {
        global.log('move:docPoint::', point)
        const docArrPoint = viewer.screenToWorld(point.x * window.devicePixelRatio, point.y * window.devicePixelRatio)
        global.log('move:docPoint:', docPoint, { x: docArrPoint[0], y: docArrPoint[1] })
        docPoint.current = { x: docArrPoint[0], y: docArrPoint[1] }
    }

    const calcStartPoint = (point: Point2d): Point2d => {
        if (null !== boundingClientRect.current) {
            const startPoint_ = { x: point.x - canvasPoint.x - 80, y: point.y - canvasPoint.y }
            return startPoint_
        }
        return { x: -1, y: -1 }
    }

    const mouseDragMove = (e: MouseEvent) => {
        if (isDown.current) {
            const currentPoint = { x: e.clientX - 80 - startPoint.current.x, y: e.clientY - startPoint.current.y }
            move(currentPoint)
        }
    }

    const mouseDownScale = (target: number) => {
        if (null !== boundingClientRect.current) {
            isDown.current = true

            startPoint.current = calcPivotPoint(target)

            global.log('mouseDownScale:startPoint_::', startPoint.current)
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
        if (null !== boundingClientRect.current) {
            const startPoint_ = startPoint.current
            global.log('startPoint_::', startPoint_, boundingClientRect.current, canvasPoint)
            const currentPoint = { x: e.clientX, y: e.clientY }
            const distance = calcDistance(startPoint_, currentPoint)

            let sign = 1
            if (currentPoint.x < startPoint_.x && currentPoint.y < startPoint_.y) {
                sign = -1
            }

            const result = (distance / Math.sqrt(2)) * sign

            const correctionDimension = getModelViewSize(viewer).width / getModelSize(viewer).width

            const resultWidth = svgWidth + result * correctionDimension
            const resultHeight = svgHeight + result * correctionDimension

            const x = boundingClientRect.current.x + boundingClientRect.current.width
            const y = boundingClientRect.current.y + boundingClientRect.current.height
            startPoint.current = { x, y }

            setSvgWidth(Math.abs(resultWidth))
            setSvgHeight(Math.abs(resultHeight))
        }
    }

    const mouseUp = () => {
        isDown.current = false
        startPoint.current = { x: 0, y: 0 }

        updateSimbolList()

        window.removeEventListener('mousemove', mouseDragMove)
        window.removeEventListener('mousemove', mouseDragScale)

        window.removeEventListener('mouseup', mouseUp)

        updateBoundingClientRect()
    }

    const remove = (e: any) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            setSvgList((old: any[]) => [...old.slice(0, idx), ...old.slice(idx + 1)])
            setPldSimbolList([...pldSimbolList.slice(0, idx), ...pldSimbolList.slice(idx + 1)])
        }
    }

    useEffect(() => {
        //setPldHandle('')
        window.addEventListener('keydown', remove)
        return () => {
            window.removeEventListener('keydown', remove)
        }
    }, [])

    return (
        <>
            <rect className="editMove" width={`${svgWidth + 30}`} height={`${svgHeight + 30}`} onMouseDown={mouseDownMove} />
            {/* 1 */}
            {/* <rect className="editScale bottom-right" width={4} height={4} x={`${svgWidth + 10}`} y={`-4`} /> */}
            {/* 2 */}
            {/* <rect className="editScale top-left" width={4} height={4} x={`-4`} y={`-4`} cursor="nwse-resize" /> */}
            {/* 10 */}
            {/* <rect className="editScale bottom-right" width={4} height={4} x={`-4`} y={`${svgHeight + 10}`} /> */}
            {/* 4 */}
            <rect
                className="editScale top-left"
                width={4}
                height={4}
                x={`${svgWidth + 30}`}
                y={`${svgHeight + 30}`}
                onMouseDown={() => mouseDownScale(4)}
            />
        </>
    )
}
