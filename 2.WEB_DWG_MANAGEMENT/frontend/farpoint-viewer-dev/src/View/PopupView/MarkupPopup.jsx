import { useEffect, useState } from 'react'
import './MarkupPopup.css'
import ColorPicker from './ColorPicker'
import * as icons from '../MainView/Toolbar/ToolbarIcons'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import ThemeStore from '../../Store/ThemeStore'
import { MarkUpStore, StatusStore } from '../../Store/statusStore'

const MarkupPopup = () => {
    //전역 변수
    const controlMode = useRecoilValue(StatusStore.controlMode)
    const editMarkupIdx = useRecoilValue(MarkUpStore.editMarkupIdx)
    const [markupPaths, setMarkupPaths] = useRecoilState(MarkUpStore.markupPaths)
    const [undoList, setUndoList] = useRecoilState(MarkUpStore.undoList)
    const setRedoList = useSetRecoilState(MarkUpStore.redoList)
    const theme = useRecoilValue(ThemeStore.theme)
    const [drawingStyle, setDrawingStyle] = useRecoilState(MarkUpStore.drawingStyle)

    let obj = JSON.parse(JSON.stringify(drawingStyle))
    const cssClassName = theme.type === 'light' ? 'LightTheme' : 'DarkTheme'
    const fontStyleArr = ['bold', 'italic', 'underline']
    const cloudStyleArr = ['wide', 'normal', 'narrow']

    const [inputValue, setInputValue] = useState(drawingStyle.width)
    const [cloudStyle, setCloudStyle] = useState('narrow')
    const [color, setColor] = useState('red')
    const [currentColor, setCurrentColor] = useState(color)
    const [currentMode, setCurrentMode] = useState('')
    const [visib, setVisib] = useState(true)
    const [fontStyle, setFontStyle] = useState({
        bold: false,
        italic: false,
        underline: false,
        textAlign: 'left',
    })

    useEffect(() => {
        setCurrentMode(controlMode)
        if (controlMode === 'text' || controlMode === 'cloud') {
            if (controlMode === 'cloud' && drawingStyle.texts[2] === '') {
                obj.texts[2] = cloudStyle
                setDrawingStyle(obj)
            } else {
                obj.texts[2] = ''
                setDrawingStyle(obj)
            }
        }
    }, [controlMode])

    useEffect(() => {
        if (editMarkupIdx === -1) {
            setCurrentMode(controlMode)
            return
        }
        const path = markupPaths[editMarkupIdx]
        if (path.type) setCurrentMode(path.type)
        setCurrentColor(path.color)
        obj.color = path.color
        setDrawingStyle(obj)
    }, [editMarkupIdx])

    // 인풋 value 값을 지정해서 넣어주면 리액트에선 유저가 통제권을 잃음 state로 value를 넣어, 입력 할때마다 setState로 변경하는 방법으로 해결
    useEffect(() => {
        setInputValue(editMarkupIdx > -1 ? markupPaths[editMarkupIdx].width : drawingStyle.width)
    }, [editMarkupIdx])

    // 편집모드 시에 수정 한 액션에 대해 undo 기능이 가능하게 리스트에 넣어주는 함수
    const editModeSetUndo = () => {
        let tempUndo = JSON.parse(JSON.stringify(markupPaths[editMarkupIdx]))
        tempUndo.cmd = 'edit'
        tempUndo.idx = editMarkupIdx
        setUndoList([...undoList, tempUndo])
    }

    // 컬러피커에 변화가 있을때마다 hex 값을 state에 변경하는 함수
    const colorChange = ({ hex }) => {
        setColor(hex)
    }

    // 컬러피커 확인버튼 함수
    const ok = (hex) => {
        setVisib(true)
        setCurrentColor(hex)
        obj.color = hex
        setDrawingStyle(obj)
        if (editMarkupIdx > -1) {
            const tempPaths = JSON.parse(JSON.stringify(markupPaths))
            editModeSetUndo()
            tempPaths[editMarkupIdx].color = hex
            setMarkupPaths(tempPaths)
        }
        setRedoList([])
    }

    // 컬러피커 취소버튼 함수
    const cancel = () => {
        setVisib(true)
    }

    // 구름모드에서 테마에 맞는 구름팝업글씨 색깔을 위한 함수
    const cloudFontColor = (currentCloudStyle) => {
        if (editMarkupIdx > -1) {
            if (markupPaths[editMarkupIdx].texts[2] === currentCloudStyle) return '#4A70F7'
            else {
                return cssClassName === 'LightTheme' ? 'white' : '#464646'
            }
        } else {
            if (cloudStyle === currentCloudStyle) return '#4A70F7'
            else {
                return cssClassName === 'LightTheme' ? 'white' : '#464646'
            }
        }
    }

    return (
        <div
            className={
                currentMode === 'edit' ||
                currentMode === 'select' ||
                currentMode === 'wcd' ||
                currentMode === 'pmdc' ||
                currentMode === 'erase' ||
                currentMode === 'procedure'
                    ? `hidden ${cssClassName} markupPopup`
                    : `${cssClassName} markupPopup`
            }
        >
            <div>
                <div className="markup-one">
                    <div className="span">
                        <div>{currentMode === 'text' ? '글자 크기' : '선 두께'}</div>
                        <div>색상</div>
                        <div className={currentMode === 'cloud' ? '' : 'hidden'}>구름 두께</div>
                    </div>
                    <div className="input">
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value)
                                if (controlMode === 'edit') return
                                if (e.target.value === '') {
                                    obj.width = 1
                                    setDrawingStyle(obj)
                                } else {
                                    obj.width = e.target.value
                                    setDrawingStyle(obj)
                                }
                            }}
                            onKeyDown={(e) => {
                                if (
                                    !/[0-9]|[]/.test(e.key) &&
                                    e.key !== 'Backspace' &&
                                    e.key !== 'Delete' &&
                                    e.key !== 'ArrowLeft' &&
                                    e.key !== 'ArrowRight'
                                )
                                    e.preventDefault()

                                if (controlMode === 'edit' && e.key === 'Enter') {
                                    let tempPaths = JSON.parse(JSON.stringify(markupPaths))
                                    tempPaths[editMarkupIdx].width = Number(e.target.value)
                                    setMarkupPaths(tempPaths)
                                    editModeSetUndo()
                                }
                            }}
                            onInput={(e) => {
                                if (e.target.value.length > 2) e.target.value = e.target.value.substr(0, 2)
                            }}
                        />
                        <div className="input-colorPicker-font">
                            <div
                                style={{
                                    background: currentColor,
                                    width: '40px',
                                    height: '40px',
                                    marginRight: '10px',
                                }}
                                onClick={() => setVisib(false)}
                            ></div>
                            {fontStyleArr.map((v, i) => {
                                try {
                                    return (
                                        <div
                                            key={v}
                                            className={currentMode === 'text' ? '' : 'hidden'}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                            }}
                                            onClick={() => {
                                                setFontStyle({ ...fontStyle, [v]: !fontStyle[v] })
                                                if (!fontStyle[v]) {
                                                    if (editMarkupIdx > -1) {
                                                        let tempPaths = JSON.parse(JSON.stringify(markupPaths))
                                                        obj.texts[i + 1] = v
                                                        setDrawingStyle(obj)
                                                        tempPaths[editMarkupIdx].texts[i + 1] = v
                                                        setMarkupPaths(tempPaths)
                                                        editModeSetUndo()
                                                    } else {
                                                        obj.texts[i + 1] = v
                                                        setDrawingStyle(obj)
                                                    }
                                                } else {
                                                    if (editMarkupIdx > -1) {
                                                        let tempPaths = JSON.parse(JSON.stringify(markupPaths))
                                                        obj.texts[i + 1] = ''
                                                        setDrawingStyle(obj)
                                                        tempPaths[editMarkupIdx].texts[i + 1] = ''
                                                        setMarkupPaths(tempPaths)
                                                        editModeSetUndo()
                                                    } else {
                                                        obj.texts[i + 1] = ''
                                                        setDrawingStyle(obj)
                                                    }
                                                }
                                            }}
                                        >
                                            {icons.font(
                                                v,
                                                editMarkupIdx > -1
                                                    ? markupPaths[editMarkupIdx].texts[i + 1] === v
                                                    : drawingStyle.texts[i + 1] === v
                                            )}
                                        </div>
                                    )
                                } catch (error) {
                                    console.log(error)
                                }
                            })}
                        </div>
                        <div className={currentMode !== 'cloud' ? 'hidden' : `${cssClassName} markup-cloud-space`}>
                            {cloudStyleArr.map((v) => {
                                try {
                                    return (
                                        <div
                                            key={v}
                                            onClick={() => {
                                                setCloudStyle(v)
                                                if (editMarkupIdx > -1) {
                                                    let tempPaths = JSON.parse(JSON.stringify(markupPaths))
                                                    obj.texts[2] = v
                                                    obj.dash = [2, 2]
                                                    setDrawingStyle(obj)
                                                    tempPaths[editMarkupIdx].texts[2] = v
                                                    setMarkupPaths(tempPaths)
                                                    editModeSetUndo()
                                                } else {
                                                    obj.texts[2] = v
                                                    setDrawingStyle(obj)
                                                }
                                            }}
                                            style={{ color: cloudFontColor(v) }}
                                        >
                                            {v === 'wide' ? '넓게' : v === 'normal' ? '중간' : '좁게'}
                                        </div>
                                    )
                                } catch (error) {
                                    console.log(error)
                                }
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className={visib ? 'hidden' : ''}>
                <ColorPicker cancel={cancel} ok={ok} color={color} setColor={setColor} onChange={colorChange} />
            </div>
        </div>
    )
}

// textAlign 내용 주석처리 함

// <div
// onClick={() => {
//     setFontStyle({
//         ...fontStyle,
//         textAlign: "right",
//     });
//     drawingStyle.texts[4] = "right";
// }}
// >
// {icons.alignLeft(drawingStyle.texts[4] === "right")}
// </div>
// <div
// onClick={() => {
//     setFontStyle({
//         ...fontStyle,
//         textAlign: "center",
//     });
//     drawingStyle.texts[4] = "center";
// }}
// >
// {icons.alignCenter(drawingStyle.texts[4] === "center")}
// </div>
// <div
// onClick={() => {
//     setFontStyle({
//         ...fontStyle,
//         textAlign: "left",
//     });
//     drawingStyle.texts[4] = "left";
// }}
// >
// {icons.alignRight(drawingStyle.texts[4] === "left")}
// </div>
export default MarkupPopup
