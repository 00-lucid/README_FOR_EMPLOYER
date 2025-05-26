import React from 'react'
import { useController } from './useController'
import { getVisualizeLibInst, resizeCanvases } from './utils'

type Props = {
    docFile: Uint8Array | undefined
}

export const Canvas = ({ docFile }: Props) => {
    const [viewer, setViewer] = React.useState<any>(undefined)
    const [lib, setLib] = React.useState<any>(undefined)

    const controller = useController(viewer, lib, getCanvasElement())

    React.useEffect(() => {
        async function fetchData() {
            const lib = await getVisualizeLibInst()
            setLib(lib)

            lib.postRun.push(async () => {
                const canvas = getCanvasElement()
                canvas.width = canvas.clientWidth * window.devicePixelRatio
                canvas.height = canvas.clientHeight * window.devicePixelRatio

                lib.canvas = canvas
                // lib.Viewer.initRender(canvas.width, canvas.height, true)

                const viewer = lib.Viewer.create()
                setViewer(viewer)

                viewer.setExperimentalFunctionalityFlag('gpu_select', false)

                const render = () => {
                    requestAnimationFrame(render)
                    lib.getViewer().update()
                }

                render()
            })
        }

        fetchData()
    }, [])

    React.useEffect(() => {
        async function fetchData() {
            viewer.parseFile(docFile)
            // viewer.parseVsfx(docFile)

            viewer.setEnableSceneGraph(true)

            resizeCanvases(viewer, [getCanvasElement()])

            printAll(viewer, lib)

            controller?.zoomExtents()
        }

        if (viewer && docFile && controller && lib) fetchData()
    }, [docFile, viewer, controller, lib])

    return <canvas id="documentCanvas" style={{ position: 'absolute', height: '100%', width: '100%' }} />
}

const getCanvasElement = (): HTMLCanvasElement => {
    return document.getElementById('documentCanvas') as HTMLCanvasElement
}

function printAll(viewer: any, lib: any) {
    const model = viewer.getModelIterator().getModel()
    const itr = model.getEntitiesIterator()

    while (!itr.done()) {
        const entity = itr.getEntity()

        if (entity.getType() === 1) {
            const entityPtr = entity.openObject()
            const colorDef = entityPtr.getColor(1)

            let color = colorDef.getColor()

            // if inheritance 0 == byLayer, 1 == byBlock
            if (colorDef.getInheritedColor() === 0)
                color = entityPtr.getLayer(lib.GeometryTypes.kAll).openObject().getColor().getColor()

            if (color[0] !== 0 || color[1] !== 0 || color[2] !== 0) {
                console.log('Type1', color)
            }
        } else if (entity.getType() === 2) {
            const entityPtr = entity.openObjectAsInsert()
            const colorDef = entityPtr.getColor()

            let color = colorDef.getColor()

            if (colorDef.getInheritedColor() === 0) {
                const val1 = entityPtr.getLayer()
                const val2 = val1.openObject()
                const val3 = val2.getColor()
                const val4 = val3.getColor()
                color = val4
            }

            if (color[0] !== 0 || color[1] !== 0 || color[2] !== 0) {
                console.log('Type2', color)
            }
        }

        itr.step()
    }
}
