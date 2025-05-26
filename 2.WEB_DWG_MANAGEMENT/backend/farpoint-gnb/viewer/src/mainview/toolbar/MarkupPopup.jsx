import { useEffect, useState, useContext } from "react";
import "./MarkupPopup.css";
import ColorPicker from "./ColorPicker";
import * as icons from "./ToolbarIcons";
import { ThemeContext } from "../../context";

const MarkupPopup = ({
    controlMode,
    markupPaths,
    setMarkupPaths,
    drawingStyle,
    editMarkupIdx,
    undoList,
    setUndoList,
    redoList,
    setRedoList,
}) => {
    const theme = useContext(ThemeContext);
    const cssClassName = theme.theme.type === "light" ? "LightTheme" : "DarkTheme";
    const fontStyleArr = ["bold", "italic", "underline"];
    const cloudStyleArr = ["wide", "normal", "narrow"];
    const [fontStyle, setFontStyle] = useState({
        bold: false,
        italic: false,
        underline: false,
        textAlign: "left",
    });
    const [inputValue, setInputValue] = useState(drawingStyle.width);
    const [cloudStyle, setCloudStyle] = useState("narrow");
    const [color, setColor] = useState("red");
    const [currentColor, setCurrentColor] = useState(color);
    const [currentMode, setCurrentMode] = useState("");
    const [visib, setVisib] = useState(true);

    useEffect(() => {
        if(controlMode == "text" || controlMode == "cloud") {
            drawingStyle.texts[2] = "";
        }
    }, [controlMode]);

    useEffect(() => {
        setCurrentMode(controlMode);
        if (controlMode == "cloud" && drawingStyle.texts[2] == "") {
            drawingStyle.texts[2] = cloudStyle;
        }
    }, [controlMode]);

    useEffect(() => {
        console.log("idx:", editMarkupIdx);
        if (editMarkupIdx == -1) {
            setCurrentMode(controlMode);
            return;
        }
        const path = markupPaths[editMarkupIdx];
        if (path.type) setCurrentMode(path.type);
        setCurrentColor(path.color);
        drawingStyle.color = path.color;
    }, [editMarkupIdx]);

    // 인풋 value 값을 지정해서 넣어주면 리액트에선 유저가 통제권을 잃음 state로 value를 넣어, 입력 할때마다 setState로 변경하는 방법으로 해결
    useEffect(() => {
        setInputValue(editMarkupIdx > -1 ? markupPaths[editMarkupIdx].width : drawingStyle.width);
    }, [editMarkupIdx]);

    // 편집모드 시에 수정 한 액션에 대해 undo 기능이 가능하게 리스트에 넣어주는 함수
    const editModeSetUndo = () => {
        let tempUndo = JSON.parse(JSON.stringify(markupPaths[editMarkupIdx]));
        tempUndo.cmd = "edit";
        tempUndo.idx = editMarkupIdx;
        tempUndo.dash = [];
        setUndoList([...undoList, tempUndo]);
    };

    // 컬러피커에 변화가 있을때마다 hex 값을 state에 변경하는 함수
    const colorChange = ({ hex }) => {
        setColor(hex);
    };

    // 컬러피커 확인버튼 함수
    const ok = hex => {
        setVisib(true);
        setCurrentColor(hex);
        drawingStyle.color = hex;
        if (editMarkupIdx > -1) {
            const tempPaths = JSON.parse(JSON.stringify(markupPaths));
            editModeSetUndo();
            console.log("markupPath:", tempPaths);
            tempPaths[editMarkupIdx].color = hex;
            setMarkupPaths(tempPaths);
        }
        setRedoList([]);
    };

    // 컬러피커 취소버튼 함수
    const cancel = () => {
        setVisib(true);
    };

    // 구름모드에서 테마에 맞는 구름팝업글씨 색깔을 위한 함수
    const cloudFontColor = currentCloudStyle => {
        if (editMarkupIdx > -1) {
            if (markupPaths[editMarkupIdx].texts[2] == currentCloudStyle) {
                return "#4A70F7";
            } else {
                return cssClassName == "LightTheme" ? "white" : "#464646";
            }
        } else {
            if (cloudStyle == currentCloudStyle) {
                return "#4A70F7";
            } else {
                return cssClassName == "LightTheme" ? "white" : "#464646";
            }
        }
    };

    return (
        <div
            className={
                controlMode === "select" || controlMode === "erase" || currentMode === "edit"
                    ? "hidden"
                    : cssClassName + " markupPopup"
            }>
            <div>
                <div className="markup-one">
                    <div className="span">
                        <div>{currentMode === "text" ? "글자 크기" : "선 두께"}</div>
                        <div>색상</div>
                        <div className={currentMode === "cloud" ? "" : "hidden"}>구름 두께</div>
                    </div>
                    <div className="input">
                        <input
                            type="number"
                            value={inputValue}
                            onChange={e => {
                                setInputValue(e.target.value);
                                if (controlMode == "edit") return;
                                if (e.target.value == "") {
                                    drawingStyle.width = 1;
                                } else {
                                    drawingStyle.width = e.target.value;
                                }
                            }}
                            onKeyDown={e => {
                                if (
                                    e.key != "Enter" ||
                                    editMarkupIdx == -1 ||
                                    controlMode != "edit"
                                )
                                    return;
                                if (e.target.value == "") e.target.value = 1;
                                let tempPaths = JSON.parse(JSON.stringify(markupPaths));
                                tempPaths[editMarkupIdx].width = e.target.value;
                                setMarkupPaths(tempPaths);
                                editModeSetUndo();
                            }}
                            onKeyPress={e => {
                                if (!/[0-9]/.test(e.key)) e.preventDefault();
                            }}
                            onInput={e => {
                                if (!/[0-9]/.test(e.nativeEvent.data)) e.target.value = "";
                                if (e.target.value.length > 2)
                                    e.target.value = e.target.value.substr(0, 2);
                            }}
                        />
                        <div className="input-colorPicker-font">
                            <div
                                style={{
                                    background: currentColor,
                                    width: "40px",
                                    height: "40px",
                                    marginRight: "10px",
                                }}
                                onClick={() => {setVisib(false)}}>
                            </div>
                            {fontStyleArr.map((v, i) => {
                                try {
                                    return (
                                        <div
                                            key={v}
                                            className={currentMode == "text" ? "" : "hidden"}
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                            }}
                                            onClick={() => {
                                                setFontStyle({ ...fontStyle, [v]: !fontStyle[v] });
                                                if (!fontStyle[v]) {
                                                    if (editMarkupIdx > -1) {
                                                        let tempPaths = JSON.parse(
                                                            JSON.stringify(markupPaths),
                                                        );
                                                        drawingStyle.texts[i + 1] = v;
                                                        tempPaths[editMarkupIdx].texts[i + 1] = v;
                                                        setMarkupPaths(tempPaths);
                                                        editModeSetUndo();
                                                    } else {
                                                        drawingStyle.texts[i + 1] = v;
                                                    }
                                                } else {
                                                    if (editMarkupIdx > -1) {
                                                        let tempPaths = JSON.parse(
                                                            JSON.stringify(markupPaths),
                                                        );
                                                        drawingStyle.texts[i + 1] = "";
                                                        tempPaths[editMarkupIdx].texts[i + 1] = "";
                                                        setMarkupPaths(tempPaths);
                                                        editModeSetUndo();
                                                    } else {
                                                        drawingStyle.texts[i + 1] = "";
                                                    }
                                                }
                                            }}>
                                            {icons.font(
                                                v,
                                                editMarkupIdx > -1
                                                    ? markupPaths[editMarkupIdx].texts[i + 1] === v
                                                    : drawingStyle.texts[i + 1] === v,
                                            )}
                                        </div>
                                    );
                                } catch (error) {
                                    console.log(error);
                                }
                            })}
                        </div>
                        <div
                            className={
                                currentMode !== "cloud"
                                    ? "hidden"
                                    : cssClassName + " markup-cloud-space"
                            }>
                            {cloudStyleArr.map(v => {
                                try {
                                    return (
                                        <div
                                            key={v}
                                            onClick={() => {
                                                setCloudStyle(v);
                                                if (editMarkupIdx > -1) {
                                                    let tempPaths = JSON.parse(
                                                        JSON.stringify(markupPaths),
                                                    );
                                                    drawingStyle.texts[2] = v;
                                                    tempPaths[editMarkupIdx].texts[2] = v;
                                                    setMarkupPaths(tempPaths);
                                                    editModeSetUndo();
                                                } else {
                                                    drawingStyle.texts[2] = v;
                                                }
                                            }}
                                            style={{ color: cloudFontColor(v) }}>
                                            {v == "wide" ? "넓게" : v == "normal" ? "중간" : "좁게"}
                                        </div>
                                    );
                                } catch (error) {
                                    console.log(error)
                                }
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className={visib ? "hidden" : ""}>
                <ColorPicker
                    cancel={cancel}
                    ok={ok}
                    color={color}
                    setColor={setColor}
                    onChange={colorChange}
                />
            </div>
        </div>
    );
};

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
export default MarkupPopup;
