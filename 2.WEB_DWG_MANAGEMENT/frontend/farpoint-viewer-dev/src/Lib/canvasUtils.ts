import Api from '../Api'
import { global } from './util'
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

export function calcDistance(point1: Point2d, point2: Point2d): number {
    const x = point1.x - point2.x
    const y = point1.y - point2.y
    const distance = Math.sqrt(x ** 2 + y ** 2)
    return distance
}

export function resizeCanvases(viewer: any, canvases: HTMLCanvasElement[]) {
    for (const canvas of canvases) {
        canvas.width = canvas.clientWidth * window.devicePixelRatio
        canvas.height = canvas.clientHeight * window.devicePixelRatio
    }

    if (viewer && 0 < canvases.length) {
        viewer.resize(0, canvases[0].width, canvases[0].height, 0)
    }
    viewer.update()
}

export function update(viewer: any) {
    if (viewer !== undefined) {
        viewer.update()
    }
}

export function getVisualizeLibInst(setBanner: any): any {
    const safeWindow = window as { [key: string]: any }

    const wasmUrl = safeWindow['WasmUrl']

    const instance = safeWindow['getVisualizeLibInst']({
        onprogress: (info: any) => {
            // visualize 23.7로 upgrade 하면서 사이즈 변경
            const visualizeWasmSize = 19826585
            const percent = Math.floor((info.loaded * 100) / visualizeWasmSize)

            setBanner(`리소스(WebGL) 로딩 중... ${percent}%`)

            if (percent >= 100) setBanner(undefined)
        },
        urlMemFile: wasmUrl,
        TOTAL_MEMORY: 200 * 1024 * 1024,
    })

    return instance
}

export async function fixFonts(viewer: any, defaultFont = 'gulim.ttc') {
    let iter = viewer.getTextStylesIterator()
    while (!iter.done()) {
        let styleId = iter.getTextStyle()
        let style = styleId.openObject()

        /**
         * Crop file name from path
         */
        const cropFileName = /[^\/\\]*$/gi.exec(style.getFileName())

        if (cropFileName) {
            style.setFileName(cropFileName[0])
            if (cropFileName[0] === 'FONT87.shx') {
                style.setBigFontFileName('FONT87.shx')
            }
        }

        /**
         * Any shx fonts need additional big font for unicode characters
         */
        let bigFontFileName = style.getBigFontFileName()
        if (!bigFontFileName) {
            style.setBigFontFileName(defaultFont)
        } else {
            bigFontFileName = bigFontFileName.toLowerCase()
            if (bigFontFileName === 'gothic_singlebig.shx' || bigFontFileName === 'myongjo_singlebig.shx')
                style.setBigFontFileName(defaultFont)
        }
        /**
         * Default font needed
         */
        if (!style.getFileName()) {
            style.setFileName(defaultFont)
        }

        iter.step()
    }
}

export async function loadFonts(viewer: any, fontNameSet: React.MutableRefObject<Set<string>>) {
    let regenBool = false
    // 폰트 로딩.
    let iter = viewer.getTextStylesIterator()
    const fileArr: string[] = []
    while (!iter.done()) {
        const styleId = iter.getTextStyle()
        const style = styleId.openObject()
        let fileName: string = style.getFileName()
        let bigFileName: string = style.getBigFontFileName()

        if (0 < fileName.length) {
            if (!fontNameSet.current.has(fileName)) {
                fileArr.push(fileName)
            }
        }

        if (0 < bigFileName.length) {
            if (!fontNameSet.current.has(bigFileName)) {
                fileArr.push(bigFileName)
            }
        }
        iter.step()
    }

    try {
        for (let fnItem of fileArr) {
            if (fnItem.includes('C:')) {
                const fnArr = fnItem.split('\\')
                fnItem = fnArr[fnArr.length - 1]
            } else if (!fnItem.includes('.')) {
                // 문자열 ARIAL 로 넘어오는 경우가 있음.
                fnItem = fnItem + '.ttf'
            }
            if (!fontNameSet.current.has(fnItem)) {
                const res = await fetch('/fonts/' + fnItem)
                const buffer = await res.arrayBuffer()
                fontNameSet.current.add(fnItem)
                global.log('fnItem::', fnItem, buffer.byteLength)

                if (buffer.byteLength < 3200) {
                    Api.document.setFontLog(fnItem)
                    continue
                }

                viewer.addEmbeddedFile(fnItem, new Uint8Array(buffer))
                regenBool = true
            }
        }
    } catch (error) {
        global.log('load fonts error::', error)
    }

    if (regenBool) {
        global.log('font regenAll')
        viewer.regenAll()
    }
}

export function getModel(viewer: any): any {
    return viewer.getModelIterator().getModel()
}

export function getEntities(viewer: any, handles: string[]): any[] {
    const results = new Array<any>()

    const model = getModel(viewer)

    for (const handle of handles) {
        const itr = model.getEntitiesIterator()

        while (!itr.done()) {
            const val = itr.getEntity()

            if (getHandle(val) === handle) {
                results.push(val)
                break
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

export function worldToScreen(point2d: Point2d, viewer: any, lib: any): Point2d {
    const point3d = lib.Point3d.createFromArray([point2d.x, point2d.y, 0])
    const mtx = viewer.activeView.worldToDeviceMatrix

    point3d.transformBy(mtx)
    const res = { x: point3d.x / window.devicePixelRatio, y: point3d.y / window.devicePixelRatio }

    point3d.delete()

    return res
}

export function getModelSize(viewer: any): { width: number; height: number } {
    const model = viewer.getActiveExtents()
    const max = model.max()
    return { width: max[0], height: max[1] }
}

export function getModelViewSize(viewer: any): { width: number; height: number } {
    const activeView = viewer.activeView
    return { width: activeView.viewFieldWidth, height: activeView.viewFieldHeight }
}
