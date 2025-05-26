import React from 'react'
import { getVisualizeLibInst, resizeCanvases, loadFonts } from './utils'
import './Canvas.css'
import { useController } from './useController'

type Props = {
    docFile: Uint8Array | undefined
}

export type CanvasRef = {
    zoomExtents(): void
}

export const Canvas = React.forwardRef(({ docFile }: Props, ref: React.Ref<CanvasRef | undefined>) => {
    const [viewer, setViewer] = React.useState<any>(undefined)
    const [lib, setLib] = React.useState<any>(undefined)

    const controller = useController(viewer, lib, getCanvasElement())

    React.useImperativeHandle(ref, () => ({
        zoomExtents: () => {
            controller?.zoomExtents()
        }
    }))

    React.useEffect(() => {
        async function fetchData() {
            const lib = await getVisualizeLibInst()
            setLib(lib)

            lib.postRun.push(async () => {
                const canvas = getCanvasElement()
                canvas.width = canvas.clientWidth * window.devicePixelRatio
                canvas.height = canvas.clientHeight * window.devicePixelRatio

                lib.canvas = canvas
                lib.Viewer.initRender(canvas.width, canvas.height, true)

                const viewer = lib.Viewer.create()
                setViewer(viewer)
            })
        }

        fetchData()
    }, [])

    React.useEffect(() => {
        const resizeHandler = () => {
            if (viewer) {
                const canvas = getCanvasElement()
                const view = viewer.activeView
                const scale = view.viewFieldWidth / canvas.width

                resizeCanvases(viewer, [getCanvasElement()])

                controller?.redraw()

                // window 크기가 확대/축소 되더라도 일정 scale 유지하도록 한다.
                if (controller) {
                    const extView = viewer.getActiveTvExtendedView()
                    extView.setView(
                        view.viewPosition,
                        view.viewTarget,
                        view.upVector,
                        canvas.width * scale,
                        canvas.height * scale,
                        view.perspective
                    )
                }
            }
        }

        window.addEventListener('resize', resizeHandler)

        return () => {
            window.removeEventListener('resize', resizeHandler)
        }
    }, [controller, viewer])

    React.useEffect(() => {
        async function fetchData() {
            viewer.parseFile(docFile)

            loadFonts(viewer)

            resizeCanvases(viewer, [getCanvasElement()])

            controller?.zoomExtents()
        }

        if (viewer && docFile && controller) fetchData()
    }, [docFile, viewer, controller])

    return (
        <div>
            <canvas id="documentCanvas" />
        </div>
    )
})

const getCanvasElement = (): HTMLCanvasElement => {
    return document.getElementById('documentCanvas') as HTMLCanvasElement
}
