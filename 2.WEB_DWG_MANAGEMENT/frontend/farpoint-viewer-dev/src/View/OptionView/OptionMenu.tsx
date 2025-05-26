import { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect'
import { StatusStore } from '../../Store/statusStore'
import ThemeStore from '../../Store/ThemeStore'
import './OptionMenu.css'

interface OptionMenuProps {
    entityPainter: any
}

// type toStringOfKey = {
//     [key: string]: any
// }

// const Highlight: toStringOfKey = {
//     blue: { rgb: { r: 0, g: 0, b: 255 }, index: 5 },
//     red: { rgb: { r: 255, g: 0, b: 0 }, index: 1 },
//     green: { rgb: { r: 0, g: 255, b: 0 }, index: 3 },
//     pink: { rgb: { r: 251, g: 72, b: 196 }, index: 6 },
//     orange: { rgb: { r: 255, g: 168, b: 54 }, index: 30 },
//     brown: { rgb: { r: 101, g: 67, b: 33 }, index: 12 },
// }

export function OptionMenu({ entityPainter }: OptionMenuProps) {
    const [option, setOption] = useState<Option>(
        JSON.parse(localStorage.getItem('option') || 'null') || {
            lineWidth: 50,
            isOriginalMode: false,
            highlightColor: { rgb: { r: 0, g: 0, b: 255 }, index: 5 },
        }
    )
    const [isChangeOption, setIsChangeOption] = useState<boolean>(false)
    const [wait, setWait] = useState<boolean>(false)
    const setIsShowOption = useSetRecoilState<boolean>(StatusStore.isShowOption)

    const isShowOption = useRecoilValue(StatusStore.isShowOption)
    const theme = useRecoilValue(ThemeStore.theme)

    const [colorElements, setColorElements] = useRecoilState(ThemeStore.colorElements)

    const setLineWidth = (lineWidth: number) => {
        setWait(true)
        setOption({ lineWidth, isOriginalMode: option.isOriginalMode, highlightColor: option.highlightColor })
    }

    const setIsOriginalMode = (isOriginalMode: boolean) => {
        setWait(true)
        setOption({ lineWidth: option.lineWidth, isOriginalMode, highlightColor: option.highlightColor })
    }

    // const setHighlightColor = (highlightColor: MixedColor) => {
    //     setWait(true)
    //     setOption({ lineWidth: option.lineWidth, isOriginalMode: option.isOriginalMode, highlightColor })
    // }

    const save = () => {
        const option: Option = {
            lineWidth,
            isOriginalMode,
            highlightColor,
        }

        localStorage.setItem('option', JSON.stringify(option))
        setIsChangeOption(false)
        setOption(option)
        entityPainter?.updateLineWeight()
        entityPainter?.updateHighlightColor(colorElements)
        entityPainter?.changeTheme(theme, colorElements, setColorElements)
    }

    // 변경사항 감지는 localStorage와 state 값 비교를 통해 판단하며 debounce 기법을 사용한다
    useDebouncedEffect(
        () => {
            setWait(false)
            const optionJSON = localStorage.getItem('option')
            const isEqual = optionJSON === JSON.stringify(option)
            if (!isEqual) {
                setIsChangeOption(true)
            } else {
                setIsChangeOption(false)
            }
        },
        700,
        [option]
    )

    useEffect(() => {
        const optionJSON = localStorage.getItem('option')
        if (null !== optionJSON) {
            window.addEventListener('storage', () => {
                setOption(JSON.parse(optionJSON))
            })
        } else {
            localStorage.setItem('option', JSON.stringify(option))
        }
    }, [])

    const { lineWidth, isOriginalMode, highlightColor } = option
    return (
        <div
            className={process.env.REACT_APP_DB === '한수원' ? 'option-menu-container' : 'option-menu-container-kospo'}
            hidden={!isShowOption}
        >
            {/* 선옵션 */}
            <label className="title">선</label>
            <label className="subtitle" htmlFor="line-width">
                굵기
            </label>
            <input
                id="line-width"
                type="range"
                min={10}
                max={100}
                defaultValue={lineWidth}
                step={10}
                onChange={(e) => setLineWidth(Number.parseInt(e.target.value))}
            />
            {/* 색상옵션 */}
            <label className="title">색상</label>
            <label className="subtitle" htmlFor="line-width">
                원도
            </label>
            <input id="colorful" type="checkbox" defaultChecked={isOriginalMode} onChange={(e) => setIsOriginalMode(e.target.checked)} />
            {/* <label className="subtitle" htmlFor="highlight-color">
                강조
            </label>
            <section className="row">
                {['blue', 'red', 'green', 'pink', 'orange', 'brown'].map((color: string, index: number) => (
                    <input
                        key={index}
                        id={color}
                        className={`option-highlight-color ${
                            JSON.stringify(Highlight[color]) === JSON.stringify(highlightColor) ? 'selected' : ''
                        }`}
                        onClick={() => setHighlightColor(Highlight[color])}
                    ></input>
                ))}
            </section> */}
            {/* 콘솔 */}
            <section style={{ display: 'flex', flexDirection: 'row', marginTop: '14px' }}>
                {/* 뱃지 */}
                {isChangeOption && <div className="noti"></div>}
                {wait && <div className="noti wait"></div>}
                {/* 버튼 */}
                <button className="option-save-btn" onClick={save} disabled={!isChangeOption || wait}>
                    저장
                </button>
                <button className="option-save-btn" onClick={() => setIsShowOption(false)}>
                    닫기
                </button>
            </section>
        </div>
    )
}
