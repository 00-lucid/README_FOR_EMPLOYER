import React, { useEffect, useRef, useState } from 'react'
import { useRecoilValue, useRecoilState } from 'recoil'
// 전역 Store
import { StatusStore, PldStore } from '../../../../Store/statusStore'
// Component
import { PldEditor } from './PldEditor'
// Lib
import { global } from '../../../../Lib/util'
import { worldToScreen, getModelSize, getModelViewSize } from '../../../../Lib/canvasUtils'

export function PldSimbol({ pldSimbolItem, viewer, lib, idx }: PldSimbolProps) {
    // 전역 Store
    const pldHandle = useRecoilValue(PldStore.pldHandle)
    const [pldSimbolList, setPldSimbolList] = useRecoilState(PldStore.pldSimbolList)
    const [pldViewChange, setPldViewChange] = useRecoilState(PldStore.pldViewChange)

    const controlMode = useRecoilValue(StatusStore.controlMode)

    const [canvasPoint, setCanvasPoint] = useState<Point2d>(
        worldToScreen({ x: pldSimbolItem.point1X, y: pldSimbolItem.point1Y }, viewer, lib)
    )
    const [isEditor, setIsEditor] = useState<boolean>(false)
    const [svgWidth, setSvgWidth] = useState<number>(pldSimbolItem.radptX)
    const [svgHeight, setSvgHeight] = useState<number>(pldSimbolItem.radptY)

    const _canvasPoint = useRef(canvasPoint)
    const _isEditor = useRef(isEditor)
    const _svgWidth = useRef(svgWidth)
    const _svgHeight = useRef(svgHeight)

    const firstChildSvg = useRef<any>(null) // Svg Element
    const _docPoint = useRef({ x: 0, y: 0 })
    const _scale = useRef(1)
    const _boundingClientRect = useRef<DOMRect | null>(null)

    /* 
        UseRef와 UseState를 동시에 사용하는이유는 
        이벤트리스너에서 사용되는 함수의 경우 
        useState값의 최신값을 참조하지 못하고, 
        useRef의 경우 변경해도 재렌더링 되지 않기 때문에 두개를 엮어서 사용.
    */
    const _setCanvasPoint = (point: Point2d) => {
        _canvasPoint.current = point
        setCanvasPoint(point)
    }
    const _setIsEditor = (boolean: boolean) => {
        _isEditor.current = boolean
        setIsEditor(boolean)
    }
    const _setSvgWidth = (width: number) => {
        _svgWidth.current = width
        setSvgWidth(width)
    }
    const _setSvgHeight = (height: number) => {
        _svgHeight.current = height
        setSvgHeight(height)
    }

    const updateBoundingClientRect = React.useCallback(() => {
        const boundingClientRect = firstChildSvg?.current?.getBoundingClientRect()
        _boundingClientRect.current = boundingClientRect
    }, [])

    const init = () => {
        const worldPoint = viewer.screenToWorld(canvasPoint.x * window.devicePixelRatio, canvasPoint.y * window.devicePixelRatio)
        global.log('init: ', worldPoint)
        global.log('firstChildSvg: ', firstChildSvg)

        _scale.current = calcScale()
        _docPoint.current = { x: worldPoint[0], y: worldPoint[1] }

        const canvasPoint_ = worldToScreen({ x: _docPoint.current.x, y: _docPoint.current.y }, viewer, lib)
        _setCanvasPoint(canvasPoint_)

        updateBoundingClientRect()

        window.addEventListener('wheel', wheeling)
        //window.addEventListener('mousemove', panning)
        window.addEventListener('mousedown', setEditorMode)
        window.addEventListener('mousedown', mouseDownPanning)
    }
    // 초기화
    useEffect(() => {
        init()
        return () => {
            window.removeEventListener('wheel', wheeling)
            //window.removeEventListener('mousemove', panning)
            window.removeEventListener('mousedown', setEditorMode)
            window.removeEventListener('mousedown', mouseDownPanning)
        }
    }, [])

    // canvas zoom Event listener
    useEffect(() => {
        if (pldViewChange) {
            wheeling()
            setPldViewChange(false)
        }
    }, [pldViewChange, setPldViewChange])

    // 스케일 계산
    const calcScale = () => {
        return getModelSize(viewer).width / getModelViewSize(viewer).width
    }
    // canvas panning(이동)
    const panning = (e: MouseEvent) => {
        global.log('panning::', e)
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
    // canvas panning(이동) --- end

    // wheel 마우스 휠(줌 인아웃)
    const wheeling = () => {
        const point2d = { x: _docPoint.current.x, y: _docPoint.current.y }
        const screenPoint = worldToScreen(point2d, viewer, lib)
        _scale.current = calcScale()
        _setCanvasPoint(screenPoint)

        updateBoundingClientRect()
    }
    // isMouseIn - 심볼이 클릭된 위치에 있는지 확인
    const isMouseIn = React.useCallback((mouseX: number, mouseY: number) => {
        if (null !== _boundingClientRect.current) {
            const startPoint: Point2d = { x: _canvasPoint.current.x, y: _canvasPoint.current.y }
            const endPoint: Point2d = {
                x: startPoint.x + _boundingClientRect.current.width,
                y: startPoint.y + _boundingClientRect.current.height,
            }

            if (startPoint.x <= mouseX && mouseX <= endPoint.x && startPoint.y <= mouseY && mouseY <= endPoint.y) {
                return false
            }

            return true
        }
    }, [])
    // 심볼 Editor 모드 변경
    const setEditorMode = React.useCallback(
        (e: MouseEvent) => {
            const isMouseInRes = isMouseIn(e.clientX - 80, e.clientY)
            global.log('isMouseInRes::', isMouseInRes, _isEditor)
            if (isMouseInRes) {
                if (_isEditor.current) _setIsEditor(false)
            } else {
                global.log('isEditor:??', _isEditor)
                if (!_isEditor.current) {
                    global.log('setIsEditor(true)')
                    _setIsEditor(true)
                }
            }
        },
        [isMouseIn]
    )

    const updateSimbolList = () => {
        global.log('updateSimbolList:', pldSimbolList, idx)
        if (pldSimbolList.length > idx) {
            const temp = [...pldSimbolList]
            const target = temp[idx]

            const newValue = {
                PLD_C_SEQ: target.PLD_C_SEQ,
                point1X: _docPoint.current.x,
                point1Y: _docPoint.current.y,
                radptX: _svgWidth.current,
                radptY: _svgHeight.current,
                seq: target.seq,
                type: target.type,
                svg: target.svg,
            }
            temp[idx] = newValue
            setPldSimbolList(temp)
        }
    }

    return (
        <g ref={firstChildSvg} transform={`translate(${canvasPoint.x}, ${canvasPoint.y}) scale(${1 * _scale.current})`}>
            <rect
                display={!isEditor ? 'block' : 'none'}
                fill="rgba(0,0,0,0)"
                pointerEvents="painted"
                width={`${svgWidth + 30}`}
                height={`${svgHeight + 30}`}
            ></rect>
            <svg width={`${svgWidth + 30}`} height={`${svgHeight + 30}`} viewBox={pldSimbolItem.svg.viewBox}>
                {pldSimbolItem.svg.path}
            </svg>
            {isEditor && !pldHandle && controlMode === 'pld' && (
                <PldEditor
                    viewer={viewer}
                    boundingClientRect={_boundingClientRect}
                    canvasPoint={_canvasPoint.current}
                    svgWidth={_svgWidth.current}
                    svgHeight={_svgHeight.current}
                    setSvgWidth={_setSvgWidth}
                    setSvgHeight={_setSvgHeight}
                    docPoint={_docPoint}
                    updateBoundingClientRect={updateBoundingClientRect}
                    idx={idx}
                    updateSimbolList={updateSimbolList}
                    setCanvasPoint={_setCanvasPoint}
                />
            )}
        </g>
    )
}
