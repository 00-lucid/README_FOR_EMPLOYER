import { setBanner } from '../../popupview'

export class Point {
    public readonly x: number
    public readonly y: number

    private constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    public static create(x: number, y: number) {
        return new Point(x, y)
    }

    public distance(pt: Point) {
        var a = this.x - pt.x
        var b = this.y - pt.y

        return Math.sqrt(a * a + b * b)
    }

    public static zero = new Point(0, 0)
}

export function distance(x1: number, y1: number, x2: number, y2: number) {
    var a = x1 - x2
    var b = y1 - y2

    return Math.sqrt(a * a + b * b)
}

export function resizeCanvases(viewer: any, canvases: HTMLCanvasElement[]) {
    for (const canvas of canvases) {
        canvas.width = canvas.clientWidth * window.devicePixelRatio
        canvas.height = canvas.clientHeight * window.devicePixelRatio
    }

    if (viewer && 0 < canvases.length) {
        viewer.resize(0, canvases[0].width, canvases[0].height, 0)

        update(viewer)
    }
}

export function update(viewer: any) {
    if (viewer !== undefined) {
        viewer.update()
    }
}

export function getVisualizeLibInst(): any {
    const safeWindow = window as { [key: string]: any }

    const wasmUrl = safeWindow['WasmUrl']

    const instance = safeWindow['getVisualizeLibInst']({
        onprogress: (info: any) => {
            const visualizeWasmSize = 18631515
            const percent = Math.floor((info.loaded * 100) / visualizeWasmSize)

            setBanner(`리소스(WebGL) 로딩 중... ${percent}%`)
        },
        urlMemFile: wasmUrl,
        TOTAL_MEMORY: 200 * 1024 * 1024
    })

    return instance
}

export async function loadFonts(viewer: any) {
    let iter = viewer.getTextStylesIterator()

    while (!iter.done()) {
        const styleId = iter.getTextStyle()
        const style = styleId.openObject()

        const filename = style.getFileName()

        if (0 < filename.length) {
            try {
                console.log('FONT', filename)

                const res = await fetch('/fonts/' + filename)
                const buffer = await res.arrayBuffer()

                viewer.addEmbeddedFile(filename, new Uint8Array(buffer))
            } catch (error) {
                console.log(error)
            }
        }

        iter.step()
    }

    viewer.regenAll()
}

export function getModel(viewer: any): any {
    return viewer.getModelIterator().getModel()
}

export function getEntities(viewer: any, handles: string[]): any[] {
    const results = new Array<any>()

    const model = getModel(viewer)

    const itr = model.getEntitiesIterator()

    for (const handle of handles) {
        while (!itr.done()) {
            const val = itr.getEntity()

            if (getHandle(val) === handle) {
                results.push(val)
            }

            itr.step()
        }
    }

    return results
}

export function getHandle(entity: any): string {
    if (entity.getType() === 1) {
        return entity.openObject().getNativeDatabaseHandle()
    } else if (entity.getType() === 2) {
        return entity.openObjectAsInsert().getNativeDatabaseHandle()
    }

    return '0'
}
