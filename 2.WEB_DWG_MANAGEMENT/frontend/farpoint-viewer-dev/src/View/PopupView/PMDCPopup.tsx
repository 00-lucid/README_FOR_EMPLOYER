import { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react'
import PMDCPopupContents from './PMDCPopupContents'
import { useRecoilValue } from 'recoil'
import { MarkupPainter } from '../../Controller/UseCanvas/MarkupPainter'
import ThemeStore from '../../Store/ThemeStore'
import AppStore from '../../Store/appStore'
import Api from '../../Api'
import { MarkUpStore, PMDCStore } from '../../Store/statusStore'
import { getEntities } from '../../Lib/canvasUtils'

type Props = {
    i: number
    viewer: any
    markupCanvas: HTMLCanvasElement
    isDown: boolean
    setIsDown: Dispatch<SetStateAction<boolean>>
    shiftX: number
    setShiftX: Dispatch<SetStateAction<number>>
    shiftY: number
    setShiftY: Dispatch<SetStateAction<number>>
    currentDiv: any
    setCurrentDiv: Dispatch<SetStateAction<any>>
    x: number
    y: number
    value: any
    controlMode: string
    lib: any
    handle: number
    getPMDCUserListPopup: () => void
    entityPainter: any
    isPMDC: any
}

const PMDCPopup = ({
    i,
    viewer,
    markupCanvas,
    isDown,
    setIsDown,
    shiftX,
    setShiftX,
    shiftY,
    setShiftY,
    currentDiv,
    setCurrentDiv,
    x,
    y,
    value,
    controlMode,
    lib,
    handle,
    getPMDCUserListPopup,
    entityPainter,
    isPMDC
}: Props) => {
    // 전역 state
    const theme = useRecoilValue(ThemeStore.theme)
    const userId = useRecoilValue(AppStore.userId)
    const isZoomExtends = useRecoilValue(MarkUpStore.isZoomExtends)

    // state
    const [divX, setDivX] = useState<number>(x)
    const [divY, setDivY] = useState<number>(y)

    const cssClassName = theme.type === 'light' ? 'LightTheme' : 'DarkTheme'
    const painter = MarkupPainter.create(viewer, markupCanvas)
    const scale = painter!['adjust'].scale
    const path = new lib.OdTvSubItemPath()
    const entities = getEntities(viewer, [handle.toString()])

    // 팝업의 위치를 조정하는 useEffect
    useLayoutEffect(() => {
        const div = document.getElementsByClassName(`${i}pmdcDiv`)[0] as HTMLElement
        div.style.left = ((divX + painter!['adjust'].x) * scale) / window.devicePixelRatio + 'px'
        div.style.top = (painter!['canvas'].height - (divY + painter!['adjust'].y) * scale) / window.devicePixelRatio + 'px'
        if (scale < 2) {
            div.style.transformOrigin = `0 0`
            div.style.transform = `scale(${scale / 2})`
        } else {
            div.style.transformOrigin = ``
            div.style.transform = ''
        }
    }, [scale, isZoomExtends])

    // 마우스 다운 시 팝업의 위치를 조정할수 있고 하이라이팅 기능
    const onMouseDown = ({ nativeEvent }: React.MouseEvent) => {
        const target = nativeEvent.target as HTMLCanvasElement
        if (controlMode === 'pmdc' && target.tagName !== 'BUTTON' && target.className !== 'PMgraph') {
            const { clientX, clientY } = nativeEvent
            const div = document.getElementsByClassName(`${i}pmdcDiv`)[0] as HTMLElement
            const curX = clientX - markupCanvas.getBoundingClientRect().left
            const curY = clientY - markupCanvas.getBoundingClientRect().top
            div.style.background = '#888CFA'

            // 설비 색상 하이라이팅
            viewer.activeView.highlight(entities[0], path, true, 0)

            setIsDown(true)
            setCurrentDiv(div.className)
            setShiftX(curX - parseInt(div.style.left))
            setShiftY(curY - parseInt(div.style.top))
        }
    }

    // 마우스 업 시 팝업의 위치를 저장, 하이라이팅 해제
    const onMouseUp = async () => {
        if (controlMode === 'pmdc') {
            const div = document.getElementsByClassName(`${i}pmdcDiv`)[0] as HTMLElement
            const arr: string[] = value.map((v: any) => v.ID)
            const gePoint = viewer.screenToWorld(
                parseInt(div.style.left) * window.devicePixelRatio,
                parseInt(div.style.top) * window.devicePixelRatio
            )
            const posArr: string = JSON.stringify([gePoint[0], gePoint[1]])

            // 설비 색상 하이라이팅 되돌리기
            viewer.activeView.highlight(entities[0], path, false, 0)

            if (cssClassName === 'DarkTheme') {
                div.style.background = 'rgba(255, 255, 255, 0.7)'
            } else {
                div.style.background = 'rgba(0,0,0,0.7)'
            }

            setIsDown(false)
            setCurrentDiv('')
            setDivX(gePoint[0])
            setDivY(gePoint[1])

            // 팝업에서 마우스를 놓을떄마다 디비에 위치 수정
            // zoomExtents 시 정보 갱신이 안되어서 getPMDCUserListPopup() 으로 불러오기
            await Api.pmdc.PMDCPopupPosSave(userId!, posArr, JSON.stringify(arr))
            getPMDCUserListPopup()
        }
    }

    // useEffect(() => {
    //     entityPainter.setPMDCPopupHandle(entities[0])
    //     return () => {
    //         entityPainter.setPMDCPopupUnHandle(entities[0])
    //     }
    // }, [])

    // useEffect(() => {
    //     if (isPMDC) {
    //         setTimeout(() => {
    //             entityPainter.setPMDCPopupHandle(entities[0])
    //         }, 500)
    //     }
    // }, [isPMDC])

    return (
        <div
            className={`${cssClassName} ${i}pmdcDiv`}
            style={{
                background: cssClassName === 'DarkTheme' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0,0,0,0.7)',
                borderRadius: `${3 * scale}px`,
                position: 'absolute',
                color: cssClassName === 'DarkTheme' ? 'black' : 'white',
                padding: `${3 * scale}px`,
                display: 'flex',
                flexDirection: 'column',
            }}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
        >
            {/* 기능 위치 이름 */}
            <div
                style={{
                    fontWeight: 'bold',
                    fontSize: `${scale / 4}rem`,
                    transition: 'margin 0s',
                    whiteSpace: 'nowrap',
                    borderBottom: `${0.5 * scale}px solid #797c7c`,
                    paddingBottom: `${2 * scale}px`,
                }}
            >
                {value[0].FUNCTION}
            </div>

            {/* 컨텐츠 컴포넌트 */}
            {value.map((v: any) => (
                <PMDCPopupContents key={v.ID} sensorData={v} scale={scale} controlMode={controlMode} />
            ))}
        </div>
    )
}

export default PMDCPopup
