import { useContext } from "react";
import { CustomPicker } from "react-color";
import { Saturation, Hue } from "react-color/lib/components/common";
import "./MarkupPopup.css";
import { ThemeContext } from "../../context";

const ColorPicker = ({ 
    setColor, 
    cancel, 
    ok, 
    onChange, 
    hsl,
    hsv, 
    hex 
}) => {
    const colorArr = ["red", "#0069f4", "#6EC12D", "#9437C8", "#FFD737", "white", "black"];
    const theme = useContext(ThemeContext);
    const cssClassName = theme.theme.type === "light" ? "LightTheme" : "DarkTheme";

    const Pointer = () => {
        return <div />;
    };

    return (
        <div className={cssClassName + " color-picker"}>
            <div className="picker-one">
                <div className="saturation">
                    <Saturation hsl={hsl} hsv={hsv} onChange={onChange} />
                </div>
                <div className="hue">
                    <Hue hsl={hsl} onChange={onChange} direction="vertical" pointer={Pointer} />
                </div>
            </div>
            
            <div className="picker-two">
                <div
                    style={{
                        background: hex,
                        width: "40px",
                        height: "40px",
                        border:
                            cssClassName == "LightTheme"
                                ? "1px solid #e6e8ef"
                                : "1px solid #5e6467",
                    }}>
                </div>
                <div className="fix-color">
                    {colorArr.map(v => (
                        <div
                            key={v}
                            style={{
                                width: "22px",
                                height: "22px",
                                background: v,
                                border: cssClassName == "LightTheme" ? "1px solid #e6e8ef" : "1px solid #5e6467",
                                borderRadius: "4px",
                                marginLeft: "8px",
                                marginBottom: "8px",
                                cursor: "pointer",
                            }}
                            onClick={()=>{setColor(v)}}>
                        </div>
                    ))}
                </div>
            </div>
            <div className="picker-button">
                <div onClick={()=>{ok(hex)}}>
                    확인
                </div>
                <div onClick={cancel}>취소</div>
            </div>
        </div>
    );
};

export default CustomPicker(ColorPicker);
