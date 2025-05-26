import { useEffect, useState, useRef } from 'react'
import { MarkupPainter } from './MarkupPainter'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { MarkUpStore, StatusStore } from '../../Store/statusStore'

const TextInput = ({ isVisible, setIsVisible, viewer, markupCanvas }) => {
    const ref = useRef()
    const drawingStyle = useRecoilValue(MarkUpStore.drawingStyle)
    const textInputObj = useRecoilValue(MarkUpStore.textInputObj)
    const controlMode = useRecoilValue(StatusStore.controlMode)
    const [markupPaths, setMarkupPaths] = useRecoilState(MarkUpStore.markupPaths)
    const [undoList, setUndoList] = useRecoilState(MarkUpStore.undoList)
    const [isMarkupChanged, setIsMarkupChanged] = useRecoilState(MarkUpStore.isMarkupChanged)
    const setRedoList = useSetRecoilState(MarkUpStore.redoList)

    const painter = MarkupPainter.create(viewer, markupCanvas)
    const [scale, setScale] = useState(painter['adjust'].scale)

    useEffect(() => {
        if (controlMode !== 'text') setIsVisible(false)
    }, [controlMode])

    useEffect(() => {
        ref.current.focus()
        const isScale = () => {
            setScale(MarkupPainter.getScale(viewer, markupCanvas))
        }
        window.addEventListener('wheel', isScale)
        return () => window.removeEventListener('wheel', isScale)
    }, [])

    const pressEnter = (e) => {
        if (e.keyCode === 13) {
            if (e.target.value === '') {
                setIsVisible(false)
                return
            }
            const path = {
                type: 'text',
                width: drawingStyle.width,
                color: drawingStyle.color,
                values: [textInputObj.startX, textInputObj.startY],
                texts: [
                    e.target.value,
                    drawingStyle.texts[1],
                    drawingStyle.texts[2],
                    drawingStyle.texts[3],
                    drawingStyle.texts[4],
                    textInputObj.dashColor,
                ],
                dash: [],
                area: [textInputObj.startX, textInputObj.startY, textInputObj.startX, textInputObj.startY],
            }
            setMarkupPaths([...markupPaths, path])
            const textWidth = painter.textDraw(path)
            path.area[2] = path.area[0] + textWidth / painter['adjust'].scale
            path.area[1] = path.area[3] - +drawingStyle.width * 0.2
            setUndoList([...undoList, path])
            if (markupPaths.at(-1)) setRedoList([])
            if (!isMarkupChanged) setIsMarkupChanged(true)
            setIsVisible(false)
        } else if (e.keyCode === 27) {
            setIsVisible(false)
        }
    }
    return (
        <div>
            <input
                ref={ref}
                autoComplete="off"
                id="inputText"
                type="text"
                style={{
                    position: 'absolute',
                    left: ((textInputObj.startX + MarkupPainter.getX(viewer)) * scale) / window.devicePixelRatio,
                    top: (painter['canvas'].height - (textInputObj.startY + MarkupPainter.getY(viewer)) * scale) / window.devicePixelRatio,
                    fontSize: (drawingStyle.width * (scale / MarkupPainter.tempScale) * 0.2 * 2) / window.devicePixelRatio + 'px',
                    color: drawingStyle.color,
                    cursor: 'text',
                    border: 'none',
                    background: 'none',
                }}
                onKeyDown={pressEnter}
            />
        </div>
    )
}

export default TextInput
