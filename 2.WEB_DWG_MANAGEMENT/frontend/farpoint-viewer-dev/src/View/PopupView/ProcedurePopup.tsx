import { useEffect, useLayoutEffect, useState } from 'react'
import { MarkupPainter } from '../../Controller/UseCanvas/MarkupPainter'
import { useRecoilValue } from 'recoil'
import ThemeStore from '../../Store/ThemeStore'
import { MarkUpStore, StatusStore } from '../../Store/statusStore'
import ProcedurePopupContents from './ProcedurePopupContents'

type Props = {
    i: number
    x: number
    y: number
    viewer: any
    markupCanvas: any
    value: any
    getPMDCUserListPopup: any
}

const ProcedurePopup = ({ x, y, i, viewer, markupCanvas, value, getPMDCUserListPopup }: Props) => {
    const theme = useRecoilValue(ThemeStore.theme)
    const painter = MarkupPainter.create(viewer, markupCanvas)
    const scale = painter!['adjust'].scale
    const cssClassName = theme.type === 'light' ? 'LightTheme' : 'DarkTheme'
    const isZoomExtends = useRecoilValue(MarkUpStore.isZoomExtends)

    useLayoutEffect(() => {
        const div = document.getElementsByClassName(`${i}procedureDiv`)[0] as HTMLElement
        div.style.left = ((x + painter!['adjust'].x) * scale) / window.devicePixelRatio + 'px'
        div.style.top = (painter!['canvas'].height - (y + painter!['adjust'].y) * scale) / window.devicePixelRatio + 'px'
    }, [scale, isZoomExtends])

    return (
        <div
            className={`${cssClassName} ${i}procedureDiv`}
            style={{
                background: cssClassName === 'DarkTheme' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0,0,0,0.7)',
                borderRadius: `${2 * scale}px`,
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                color: cssClassName === 'DarkTheme' ? 'black' : 'white',
                visibility: scale < 3 ? 'hidden' : 'visible',
                paddingTop: `${3 * scale}px`,
            }}
        >
            <div
                style={{
                    width: '100%',
                    fontWeight: 'bold',
                    padding: `0 ${3 * scale}px`,
                    fontSize: `${3 * scale}px`,
                    whiteSpace: 'nowrap',
                    transition: 'margin 0s',
                }}
            >
                {value.STPORDER}. {value.PRONM}
            </div>
            <hr
                style={{
                    border: 0,
                    height: 1,
                    background: cssClassName === 'DarkTheme' ? 'black' : 'white',
                    margin: `${3 * scale}px 0`,
                    transition: 'margin 0s',
                }}
            />
            <ProcedurePopupContents value={value} scale={scale} getPMDCUserListPopup={getPMDCUserListPopup}/>
        </div>
    )
}

export default ProcedurePopup
