import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
// Lib
import { getEntities, getModel, getHandle } from '../../Lib/canvasUtils'
// 전역 Store
import { StatusStore, PMDCStore, ProcedureStore } from '../../Store/statusStore'
import { MarkupPainter } from './MarkupPainter'
export class ProcedurePainter {
    private viewer: any
    private lib: any
    private theme: Theme
    private path: any // highlight path

    private colorEntities = new Map<string, Color>()
    private mouseOverHandles = new Set<string>()
    private selectedHandles = new Set<string>()
    private procedureHandles: any = []
    private registeredHandles: string[] = []

    public constructor(viewer: any, lib: any, defaultTheme: Theme) {
        this.viewer = viewer
        this.lib = lib
        this.theme = defaultTheme
        this.path = new this.lib.OdTvSubItemPath()!
    }

    public changeTheme(theme: Theme) {
        this.theme = theme

        this.redraw(null)
    }

    public clearEquipments(): void {
        const itr = getModel(this.viewer).getEntitiesIterator()
        let i = 0

        while (!itr.done()) {
            const entity = itr.getEntity()
            const handle = getHandle(entity)
            const color = this.theme.strokeColor
            setColor(this.lib, entity, color)

            i++
            itr.step()
        }

        const color = this.theme.backgroundColor
        this.viewer.setBackgroundColor([color.r, color.g, color.b])
    }

    public setProcedureEquipment(procedureEquipments: any, current: CanvasContext) {
        this.clearEquipments()
        if (current) {
            const registeredHandls = Array.from(current.registeredHandles)
            registeredHandls.map((f: any) => {
                const entity = getEntities(this.viewer, [f])
                let color = this.theme.strokeColor
                if (procedureEquipments.some((g: any) => g.HANDLE === f)) color = { r: 0xfe, g: 0x02, b: 0x02 }
                setColor(this.lib, entity[0], color)
                return null
            })

            const newSet = [...procedureEquipments]

            this.procedureHandles = newSet
            this.registeredHandles = [...registeredHandls]
        }
    }

    public redraw(types: string[] | null): void {
        const itr = getModel(this.viewer).getEntitiesIterator()
        let i = 0
        while (!itr.done()) {
            const entity = itr.getEntity()
            const handle = getHandle(entity)

            if (this.mouseOverHandles.has(handle)) {
                setColor(this.lib, entity, this.theme.mouseOverColor)
            } else if (this.selectedHandles.has(handle)) {
                setColor(this.lib, entity, this.theme.selectedColor)
            } else {
                const color = this.colorEntities.get(handle)

                if (color) {
                    setColor(this.lib, entity, color)
                } else {
                    setColor(this.lib, entity, this.theme.strokeColor)
                }
            }

            i++
            itr.step()
        }

        const color = this.theme.backgroundColor
        this.viewer.setBackgroundColor([color.r, color.g, color.b])
    }

    public drawOrder(procedureSteps: any, viewer: any, canvas: HTMLCanvasElement, theme: Theme) {
        const painter = MarkupPainter.create(viewer, canvas)
        const ctx = canvas.getContext('2d')
        if (ctx && painter) {
            const scale = MarkupPainter.getScale(viewer, canvas)
            const screenHight = canvas.height
            const etgColor = { r: 0xfe, g: 0x02, b: 0x02 }
            if (procedureSteps[0].length === 0) return
            for (let i = 0; i < procedureSteps[0].length; i++) {
                // const entityId = getEntities(viewer, [tagList[0][i][0]]);
                if (procedureSteps[0].length === 0) continue
                const font = 15 * 0.2 * scale
                const position = procedureSteps[2][i]
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
                ctx.fillText(procedureSteps[0][i], x + width / 2, y - font * 0.2)
            }
        }
    }
}

export function useProcedurePainter(viewer: any, lib: any, theme: Theme, canvas: HTMLCanvasElement) {
    // 전역 컨텍스트
    const procedureSteps = useRecoilValue(ProcedureStore.procedureSteps)
    const controlMode = useRecoilValue(StatusStore.controlMode)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const [procedurePainter, setProcedurePainter] = React.useState<any>()

    useEffect(() => {
        if (viewer && lib) {
            setProcedurePainter(new ProcedurePainter(viewer, lib, theme))
        }
    }, [viewer, lib, theme, setProcedurePainter])

    useEffect(() => {
        if (procedurePainter && controlMode === 'procedure') {
            procedurePainter.setProcedureEquipment(procedureSteps, selectedCanvas)
        }
    }, [procedureSteps, controlMode])

    useEffect(() => {
        if (procedurePainter && controlMode === 'procedure') {
            procedurePainter.changeTheme(theme)
        }
    }, [procedurePainter, theme])

    return procedurePainter
}

function setColor(lib: any, ptr: any, color: any) {
    if (process.env.REACT_APP_DB === '남부') {
        setColorKospo(lib, ptr, color)
        return { r: 128, g: 128, b: 128 }
    } else {
        if (ptr.getType() === 1) {
            const entity = ptr.openObject()

            if (typeof color !== 'number') {
                entity.setColor(color.r, color.g, color.b)

                const geom_iter = entity.getGeometryDataIterator()
                for (; !geom_iter.done(); geom_iter.step()) {
                    const geoItr = geom_iter.getGeometryData()
                    const geometry = geoItr.openObject()
                    geometry.setColor(color.r, color.g, color.b)
                }
            } else {
                const colorObj = entity.getColor(lib.GeometryTypes.kAll)
                colorObj.setIndexedColor(color)

                entity.setColor(colorObj, lib.GeometryTypes.kAll)
            }
        } else if (ptr.getType() === 2) {
            if (typeof color !== 'number') {
                const entity = ptr.openObjectAsInsert()
                const itr = entity.getBlock().openObject().getEntitiesIterator()

                while (!itr.done()) {
                    const id = itr.getEntity()
                    const type = id.getType()
                    const entity = id.openObject()

                    if (type === 1) {
                        entity.setColor(color.r, color.g, color.b)
                    } else if (type === 2) {
                        setColor(lib, id, color)
                    }

                    itr.step()
                }
            }
        }

        return { r: 128, g: 128, b: 128 }
    }
}

function setColorKospo(lib: any, ptr: any, color: any) {
    if (ptr.getType() === 1) {
        // !
        const entity = ptr.openObject()

        if (typeof color !== 'number') {
            entity.setColor(color.r, color.g, color.b)

            const geom_iter = entity.getGeometryDataIterator()
            for (; !geom_iter.done(); geom_iter.step()) {
                const geoItr = geom_iter.getGeometryData()
                const geometry = geoItr.openObject()
                geometry.setColor(color.r, color.g, color.b)
            }
        } else {
            const colorObj = entity.getColor(lib.GeometryTypes.kAll)
            colorObj.setIndexedColor(color)

            entity.setColor(colorObj, lib.GeometryTypes.kAll)
        }
    } else if (ptr.getType() === 2) {
        if (typeof color !== 'number') {
            const entity = ptr.openObjectAsInsert()

            const newColor = new lib.OdTvColorDef(color.r, color.g, color.b)
            entity.setColor(newColor)
        } else {
            const entity = ptr.openObjectAsInsert()
            const colorObj = entity.getColor()
            colorObj.setIndexedColor(color)
            entity.setColor(colorObj)
        }
    }

    return { r: 128, g: 128, b: 128 }
}
