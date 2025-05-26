import React, { useEffect, useState, useRef } from "react";
import { MarkupPainter } from "./MarkupPainter";
import { AppContext } from "../../context";

const TextInput = ({
    undoList,
    setUndoList,
    setRedoList,
    viewer,
    markupCanvas,
    drawingStyle,
    markupPaths,
    isVisible,
    setIsVisible,
    textInputObj,
}) => {
    const ref = useRef();
    const painter = MarkupPainter.create(viewer, markupCanvas);
    const [scale, setScale] = useState(painter["adjust"].scale);
    const appContext = React.useContext(AppContext);
    let inputValue = '';
    let isEnd = false;
    useEffect(() => {
        ref.current.focus();
        return () => {
            if (inputValue != "" && isEnd) {
                isEnd = false;
                const enter = {
                    keyCode: 13,
                    target: { value: !isEnd ? inputValue : '' },
                };
                pressEnter(enter);
            } 
            else {
                return;
            }
        };
    }, []);

    useEffect(() => {
        const isScale = () => {
            setScale(MarkupPainter.getScale(viewer, markupCanvas));
        };
        window.addEventListener("wheel", isScale);
        return () => window.removeEventListener("wheel", isScale);
    }, []);

    const pressEnter = e => {
        isEnd = true;
        if (e.keyCode === 13) {
            isEnd = false;
            if (e.target.value === "") setIsVisible(false);
            if(e.isCleanUp) setIsVisible(false);
            const path = {
                type: "text",
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
                area: [
                    textInputObj.startX,
                    textInputObj.startY,
                    textInputObj.startX,
                    textInputObj.startY,
                ],
            };
            markupPaths.push(path);
            const textWidth = painter.textDraw(path);
            path.area[2] = path.area[2] + textWidth / painter["adjust"].scale;
            path.area[1] = path.area[1] + drawingStyle.width;
            const JSONpath = JSON.parse(JSON.stringify(markupPaths.at(-1)));
            setUndoList([...undoList, JSONpath]);
            setRedoList([]);
            appContext.setMarkupChanged(true);
            setIsVisible(false);
        } 
        else if (e.keyCode === 27) {
            setIsVisible(false);
            inputValue='';
        }
        else return;
    };

    return (
        <div>
            <input
                ref={ref}
                id="inputText"
                type="text"
                style={{
                    width: "100%",
                    position: "absolute",
                    left: window.devicePixelRatio == 1 ? 
                            (textInputObj.startX + MarkupPainter.getX(viewer)) * scale
                            : ((textInputObj.startX + MarkupPainter.getX(viewer)) * scale) / 2,
                    top: window.devicePixelRatio == 1 ?
                            painter["canvas"].height - (textInputObj.startY + MarkupPainter.getY(viewer)) * scale
                            : (painter["canvas"].height - (textInputObj.startY + MarkupPainter.getY(viewer)) * scale) / 2,
                    cursor: "text",
                    fontSize: window.devicePixelRatio == 1 ?
                                drawingStyle.width * scale * 0.2 + "px"
                                : (drawingStyle.width * scale * 0.2) / 2 + "px",
                    color: drawingStyle.color,
                }}
                onInput={e => {
                    inputValue = e.target.value
                }}
                onKeyDown={pressEnter}
            />
        </div>
    );
};

export default TextInput;
