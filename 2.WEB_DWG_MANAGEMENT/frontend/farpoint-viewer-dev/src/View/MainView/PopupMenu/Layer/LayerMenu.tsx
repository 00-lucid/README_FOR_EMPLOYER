import cn from 'classnames'
import { useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { StatusStore } from '../../../../Store/statusStore'
import './LayerMenu.css'

export function LayerMenu() {
    const [layerIds, setLayerIds] = useRecoilState<any[]>(StatusStore.layerIds)
    const [isEditLayer, setIsEditLayer] = useState<boolean>(false)

    const multiLayer = (layerId: any) => {
        if (layerIds.length > 0) {
            const newLayerIds = layerIds.map((el) => {
                if (el === layerId) {
                    el.openObject().setVisible(!el.openObject().getVisible())
                }
                return el
            })
            setLayerIds(newLayerIds)
        }
    }

    const IOEditLayer = () => {
        setIsEditLayer((old) => !old)
    }

    const getLayers = useMemo((): JSX.Element[] => {
        const elements: JSX.Element[] = []
        layerIds.forEach((layerId, idx) => {
            const layerObj = layerId.openObject()
            const layerName = layerObj.getName()
            const isVisible = layerObj.getVisible()
            elements.push(
                <button key={layerName} className={`layer-btn visible-${isVisible}`} onClick={() => multiLayer(layerId)}>
                    {layerName}
                    {/* {idx} */}
                </button>
            )
        })
        return elements
    }, [layerIds, multiLayer])

    return (
        <>
        {
            process.env.REACT_APP_DB === '한수원' ?
            <>
                <div id="layer-container" className={cn(isEditLayer ? 'open' : 'close')}>
                    <section id="layer-section">{layerIds.length > 0 && getLayers}</section>
                </div>
                <div className="layer-open" onClick={IOEditLayer}>
                    <svg
                        id="layer-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        x="0px"
                        y="0px"
                        viewBox="0 0 421.59 421.59"
                        width="16px"
                        height="16px"
                    >
                        <g fill="var(--Menu-Toolbar-Item-Stroke)">
                            <path d="M400.491,291.098l-58.865-36.976l58.864-36.971c2.185-1.372,3.511-3.771,3.511-6.351s-1.326-4.979-3.511-6.352    l-58.865-36.977l58.862-36.973c2.185-1.373,3.511-3.771,3.511-6.351s-1.326-4.979-3.511-6.351L214.783,1.149    c-2.438-1.532-5.54-1.532-7.979,0L21.1,117.796c-2.185,1.373-3.511,3.771-3.511,6.351c0,2.58,1.326,4.979,3.511,6.351    l58.861,36.972l-58.859,36.978c-2.185,1.373-3.51,3.771-3.51,6.351c0,2.58,1.326,4.979,3.511,6.351l58.859,36.97l-58.859,36.979    c-2.185,1.372-3.51,3.771-3.51,6.351c0,2.58,1.326,4.979,3.511,6.351l185.7,116.64c1.22,0.766,2.604,1.149,3.989,1.149    s2.77-0.383,3.989-1.149L400.491,303.8c2.185-1.372,3.511-3.771,3.511-6.351C404.002,294.869,402.676,292.47,400.491,291.098z     M39.189,124.147l171.605-107.79l171.604,107.79l-171.604,107.79L39.189,124.147z M39.191,210.798l54.869-34.471l112.744,70.818    c1.219,0.766,2.604,1.149,3.989,1.149c1.385,0,2.77-0.383,3.989-1.149l112.742-70.817l54.875,34.47L210.792,318.582    L39.191,210.798z M210.792,405.232L39.191,297.448l54.87-34.472l112.742,70.814c1.22,0.766,2.604,1.149,3.989,1.149    s2.77-0.383,3.989-1.149l112.744-70.812l54.876,34.47L210.792,405.232z" />
                        </g>
                    </svg>
                </div>
            </>
            :
            <>
                <div id="layer-container-kospo" className={cn(isEditLayer ? 'open' : 'close')}>
                    <section id="layer-section">{layerIds.length > 0 && getLayers}</section>
                </div>
                <div className="layer-open-kospo" onClick={IOEditLayer}>
                    <svg
                        id="layer-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        x="0px"
                        y="0px"
                        viewBox="0 0 421.59 421.59"
                        width="16px"
                        height="16px"
                    >
                        <g fill="var(--Menu-Toolbar-Item-Stroke)">
                            <path d="M400.491,291.098l-58.865-36.976l58.864-36.971c2.185-1.372,3.511-3.771,3.511-6.351s-1.326-4.979-3.511-6.352    l-58.865-36.977l58.862-36.973c2.185-1.373,3.511-3.771,3.511-6.351s-1.326-4.979-3.511-6.351L214.783,1.149    c-2.438-1.532-5.54-1.532-7.979,0L21.1,117.796c-2.185,1.373-3.511,3.771-3.511,6.351c0,2.58,1.326,4.979,3.511,6.351    l58.861,36.972l-58.859,36.978c-2.185,1.373-3.51,3.771-3.51,6.351c0,2.58,1.326,4.979,3.511,6.351l58.859,36.97l-58.859,36.979    c-2.185,1.372-3.51,3.771-3.51,6.351c0,2.58,1.326,4.979,3.511,6.351l185.7,116.64c1.22,0.766,2.604,1.149,3.989,1.149    s2.77-0.383,3.989-1.149L400.491,303.8c2.185-1.372,3.511-3.771,3.511-6.351C404.002,294.869,402.676,292.47,400.491,291.098z     M39.189,124.147l171.605-107.79l171.604,107.79l-171.604,107.79L39.189,124.147z M39.191,210.798l54.869-34.471l112.744,70.818    c1.219,0.766,2.604,1.149,3.989,1.149c1.385,0,2.77-0.383,3.989-1.149l112.742-70.817l54.875,34.47L210.792,318.582    L39.191,210.798z M210.792,405.232L39.191,297.448l54.87-34.472l112.742,70.814c1.22,0.766,2.604,1.149,3.989,1.149    s2.77-0.383,3.989-1.149l112.744-70.812l54.876,34.47L210.792,405.232z" />
                        </g>
                    </svg>
                </div>
            </>
        }
        </>
    )
}
