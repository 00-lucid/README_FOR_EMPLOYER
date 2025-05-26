import React from 'react'
import { CanvasController, SelectCanvasController } from './CanvasController'

export function useController(viewer: any, lib: any, documentCanvas: HTMLCanvasElement) {
    const [controller, setController] = React.useState<CanvasController>()

    const [paint] = React.useState({ documentFrameId: -1, markupFrameId: -1 })

    const redrawDocument = React.useCallback(() => {
        if (viewer) {
            const render = () => {
                viewer.update()

                paint.documentFrameId = -1
            }

            if (paint.documentFrameId === -1) {
                paint.documentFrameId = requestAnimationFrame(render)
            }
        }
    }, [viewer, paint])

    React.useEffect(() => {
        let controller_: CanvasController | undefined

        if (viewer && lib) {
            controller_ = new SelectCanvasController(viewer, lib, documentCanvas, redrawDocument)
            setController(controller_)
        }

        return () => {
            if (controller_) {
                controller_.release()
            }
        }
    }, [lib, viewer, documentCanvas, redrawDocument])

    return controller
}
