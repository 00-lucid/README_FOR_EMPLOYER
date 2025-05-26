import React from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
// Lib
import { getEntities, getModel, getHandle } from '../../Lib/canvasUtils'
import { MarkupPainter } from './MarkupPainter'
// 전역 Store
import { StatusStore, WCDStore } from '../../Store/statusStore'
// import { PainterContext } from '../../Store/painterContext'
export class WCDPainter {
    private viewer: any
    private lib: any
    private theme: Theme
    private path: any // highlight path

    private colorEntities = new Map<string, Color>()
    private mouseOverHandles = new Set<string>()
    private selectedHandles = new Set<string>()
    private wcdHandles = new Set<string>()
    private wcdDocHandles: any
    public constructor(viewer: any, lib: any, defaultTheme: Theme) {
        this.viewer = viewer
        this.lib = lib
        this.theme = defaultTheme
        this.path = new this.lib.OdTvSubItemPath()!
    }

    public clearEquipments(): void {
        const itr = getModel(this.viewer).getEntitiesIterator()

        while (!itr.done()) {
            const entity = itr.getEntity()
            const color = this.theme.strokeColor
            setColor(this.lib, entity, color)

            itr.step()
        }

        const color = this.theme.backgroundColor
        this.viewer.setBackgroundColor([color.r, color.g, color.b])
    }

    public setWCDHighlight(handles: string[], eventHandles: Set<string>, type: string) {
        const entities = getEntities(this.viewer, handles)

        // 아래 코드로 조회 한 설비와 getEntities()로 찾은 설비가 다름 / getEntities() 로 찾은 설비가 맞음.
        //const entityId = this.viewer.getActiveModel().findEntity(handles[0])

        for (const entity of entities) {
            // 하이라이트 적용.
            this.viewer.activeView.highlight(entity, this.path, true, 0)
        }

        const newSet = new Set(handles)

        //// 복구할 handle
        const restoreHandles: string[] = []

        eventHandles.forEach((handle: string) => {
            if (!newSet.has(handle)) {
                restoreHandles.push(handle)
            }
        })

        const restoreEntities = getEntities(this.viewer, restoreHandles)

        for (const entity of restoreEntities) {
            const handle = getHandle(entity)

            let check: boolean = false
            if (type === 'mouseOver') {
                if (!this.selectedHandles.has(handle) && !this.wcdHandles.has(handle)) check = true
            } else if (type === 'mouseSelect') {
                if (!this.mouseOverHandles.has(handle) && !this.wcdHandles.has(handle)) check = true
            } else if (type === 'sideEquipment') {
                if (!this.mouseOverHandles.has(handle) && !this.selectedHandles.has(handle)) {
                    check = true
                }
            }
            if (check) {
                this.viewer.activeView.highlight(entity, this.path, false, 0)
            }
        }

        if (type === 'mouseOver') this.mouseOverHandles = newSet
        else if (type === 'mouseSelect') this.selectedHandles = newSet
        else if (type === 'sideEquipment') this.wcdHandles = newSet
    }

    // 마우스 호버한 설비 페인트
    public setWCDMouseOver(handles: string[]) {
        // const sumHandles = [...Array.from(this.selectedHandles), ...handles]
        // //console.log('sumHandles:1:', sumHandles.length)
        // if (this.wcdHandles.size > 0) {
        //     if (this.exHandles.length > 0 && handles.length > 0) {
        //         if (this.exHandles[0] !== handles[0]) sumHandles.push(...Array.from(this.wcdHandles))
        //     }
        // }
        // this.exHandles = handles
        // //console.log('sumHandles:2:', sumHandles.length)
        // this.setWCDHighlight(sumHandles, this.mouseOverHandles, 'mouseOver')
    }

    public setWCDHandles(handles: string[]) {
        this.clearEquipments()
        const entities = getEntities(this.viewer, handles)
        const color = { r: 0xfe, g: 0x02, b: 0x02 }

        for (const entity of entities) {
            setColor(this.lib, entity, color)
        }

        const newSet = new Set(handles)

        // 복구할 handle
        const restoreHandles: string[] = []

        this.wcdHandles.forEach((handle: string) => {
            if (!newSet.has(handle)) {
                restoreHandles.push(handle)
            }
        })

        const restoreEntities = getEntities(this.viewer, restoreHandles)

        for (const entity of restoreEntities) {
            const handle = getHandle(entity)

            let color = this.theme.strokeColor

            if (this.mouseOverHandles.has(handle)) {
                color = this.theme.mouseOverColor
            } else if (this.selectedHandles.has(handle)) {
                color = this.theme.selectedColor
            } else if (this.colorEntities.has(handle)) {
                color = this.colorEntities.get(handle)!
            }

            setColor(this.lib, entity, color)
        }

        this.wcdHandles = newSet
    }

    public setWCDDocHandles(tagList: any, canvas: HTMLCanvasElement, controlMode: string, setBanner: any) {
        if (controlMode !== 'wcd') return
        if (!tagList || !tagList[0]) return
        const crteColor = { r: 0xfe, g: 0xff, b: 0x01 }
        const itgColor = { r: 0x05, g: 0xff, b: 0xfc }
        const ptagColor = { r: 0xfc, g: 0x80, b: 0x04 }
        const etgColor = { r: 0xfe, g: 0x02, b: 0x02 }
        const ptstColor = { r: 0xbf, g: 0x34, b: 0x37 }
        const etugColor = { r: 0x7e, g: 0x34, b: 0xe7 }
        const eugColor = { r: 0x02, g: 0x24, b: 0xfd }
        const inacColor = { r: 0xb3, g: 0xb2, b: 0xbd }
        this.clearEquipments()
        // const handles = [];
        for (let i = 0; i < tagList[0].length; i++) {
            if (!tagList[0][i]) continue
            tagList[0][i].map((f: any) => {
                const entity = getEntities(this.viewer, [f])
                if (entity.length != 0) {
                    // const handle = getHandle(entity[0]);
                    let color = this.theme.strokeColor
                    if (tagList[1][i] == 'CRTE') color = crteColor
                    else if (tagList[1][i] == 'ITG') color = itgColor
                    else if (tagList[1][i] == 'PTAG') color = ptagColor
                    else if (tagList[1][i] == 'ETG') color = etgColor
                    else if (tagList[1][i] == 'PTST') color = ptstColor
                    else if (tagList[1][i] == 'ETUG') color = etugColor
                    else if (tagList[1][i] == 'EUG') color = eugColor
                    else if (tagList[1][i] == 'INAC') color = inacColor
                    setColor(this.lib, entity[0], color)
                    // handles.push(handle);
                }
            })
        }
        const newSet = [...tagList]
        this.wcdDocHandles = newSet
        setBanner(undefined)
    }

    public drawOrder(tagList: any, viewer: any, canvas: HTMLCanvasElement, theme: Theme) {
        const painter = MarkupPainter.create(viewer, canvas)
        const ctx = canvas.getContext('2d')
        if (ctx && painter) {
            const scale = MarkupPainter.getScale(viewer, canvas)
            const screenHight = canvas.height
            const etgColor = { r: 0xfe, g: 0x02, b: 0x02 }
            if (tagList[0].length == 0) return
            for (let i = 0; i < tagList[0].length; i++) {
                // const entityId = getEntities(viewer, [tagList[0][i][0]]);
                if (tagList[0][i].length == 0) continue
                const font = 15 * 0.2 * scale
                const position = tagList[2][i]
                const startX = position[0]
                const startY = position[1]
                const x = (startX + MarkupPainter.getX(viewer)) * scale
                const y = screenHight - (startY + MarkupPainter.getY(viewer)) * scale - font / 3
                const bgColor = etgColor
                const color = theme.backgroundColor
                ctx.fillStyle = `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 1)`
                ctx.textAlign = 'center'
                ctx.font = `${font}px sans-serif`
                const width = ctx.measureText('10000').width
                const rect = new Path2D()
                rect.rect(x, y + 0.5 * scale, width, -font * 1.4)
                ctx.fill(rect)
                ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b}, 1)`
                ctx.fillText((i + 1).toString(), x + width / 2, y - font * 0.2)
            }
        }
    }
}

export function useWCDPainter(viewer: any, lib: any, theme: Theme, canvas: HTMLCanvasElement) {
    // 전역 컨텍스트
    const wcdEquipments = useRecoilValue(WCDStore.wcdEquipments)
    const controlMode = useRecoilValue(StatusStore.controlMode)
    const wcdTagDoc = useRecoilValue(WCDStore.wcdTagDoc)
    const setBanner = useSetRecoilState(StatusStore.banner)

    const [wcdPainter, setWCDPainter] = React.useState<any>()
    const wcdHandles = wcdEquipments
    React.useEffect(() => {
        if (viewer && lib) {
            setWCDPainter(new WCDPainter(viewer, lib, theme))
        }
    }, [viewer, lib, theme, setWCDPainter])

    React.useEffect(() => {
        if (wcdPainter) wcdPainter.setWCDHandles(wcdHandles)
    }, [wcdEquipments])

    React.useEffect(() => {
        if (wcdPainter) {
            const handles: any = [[], []]
            if (wcdTagDoc && wcdTagDoc.length > 0) {
                const sortedTag = wcdTagDoc.sort(function (a: any, b: any) {
                    return a.counter - b.counter
                })
                for (const item of sortedTag) {
                    if (item.handle.length > 0) {
                        const arry: any = []
                        item.handle.map((f: any) => {
                            arry.push(f.TAGHANDLE)
                        })
                        handles[0].push(arry)
                        handles[1].push(item.line)
                    }
                }
            }
            if (handles[0] && handles[0].length !== 0) {
                wcdPainter.setWCDDocHandles(handles, canvas, controlMode, setBanner)
            } else {
                wcdPainter.setWCDDocHandles(handles, canvas, controlMode, setBanner)
                if (controlMode === 'wcd') {
                    wcdPainter.setWCDHandles(wcdEquipments)
                }
            }
        }
    }, [wcdPainter, wcdTagDoc, controlMode])

    return wcdPainter
}

function setColor(lib: any, ptr: any, color: Color) {
    if (ptr.getType() === 1) {
        const entity = ptr.openObject()

        entity.setColor(color.r, color.g, color.b)

        const geom_iter = entity.getGeometryDataIterator()
        for (; !geom_iter.done(); geom_iter.step()) {
            const geoItr = geom_iter.getGeometryData()
            const geometry = geoItr.openObject()
            geometry.setColor(color.r, color.g, color.b)
        }
    } else if (ptr.getType() === 2) {
        const entity = ptr.openObjectAsInsert()

        const newColor = new lib.OdTvColorDef(color.r, color.g, color.b)
        entity.setColor(newColor)
    }

    return { r: 128, g: 128, b: 128 }
}
