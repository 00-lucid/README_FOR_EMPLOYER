export function getVisualizeLibInst(): any {
    const safeWindow = window as { [key: string]: any }

    const wasmUrl = safeWindow['WasmUrl']

    const instance = safeWindow['getVisualizeLibInst']({ urlMemFile: wasmUrl })

    return instance
}

export function resizeCanvases(viewer: any, canvases: HTMLCanvasElement[]) {
    for (const canvas of canvases) {
        canvas.width = canvas.clientWidth * window.devicePixelRatio
        canvas.height = canvas.clientHeight * window.devicePixelRatio
    }

    if (viewer && 0 < canvases.length) {
        viewer.resize(0, canvases[0].width, canvases[0].height, 0)

        viewer.update()
    }
}
