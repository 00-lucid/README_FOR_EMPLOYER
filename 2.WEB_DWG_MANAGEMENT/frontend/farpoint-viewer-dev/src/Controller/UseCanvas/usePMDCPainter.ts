import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
// Lib
import { getEntities, getModel, getHandle } from '../../Lib/canvasUtils'
// 전역 Store
import { StatusStore, PMDCStore } from '../../Store/statusStore'
export class PMDCPainter {
    private viewer: any
    private lib: any
    private theme: Theme
    private path: any // highlight path

    private colorEntities = new Map<string, Color>()
    private mouseOverHandles = new Set<string>()
    private selectedHandles = new Set<string>()
    private pmdcHandles: any = []
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

    public setPMDCEquipment(sensorList: any, current: CanvasContext) {
        this.clearEquipments()
        const registeredHandls = Array.from(current.registeredHandles)
        registeredHandls.map((f: any) => {
            const entity = getEntities(this.viewer, [f])
            let color = this.theme.strokeColor
            if (sensorList.some((g: any) => g.HANDLE === f)) color = { r: 0x06, g: 0xbc, b: 0x09 }
            else color = { r: 0xfe, g: 0x02, b: 0x02 }
            setColor(this.lib, entity[0], color)
            return null
        })

        const newSet = [...sensorList]

        this.pmdcHandles = newSet
        this.registeredHandles = [...registeredHandls]
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
}

export function usePMDCPainter(viewer: any, lib: any, theme: Theme, canvas: HTMLCanvasElement) {
    // 전역 컨텍스트
    const pmdcEquipments = useRecoilValue(PMDCStore.pmdcEquipments)
    const controlMode = useRecoilValue(StatusStore.controlMode)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const isPMDCTagOn = useRecoilValue(PMDCStore.isPMDCTagOn)
    const [pmdcPainter, setPMDCPainter] = React.useState<any>()

    useEffect(() => {
        if (viewer && lib) {
            setPMDCPainter(new PMDCPainter(viewer, lib, theme))
        }
    }, [viewer, lib, theme, setPMDCPainter])

    useEffect(() => {
        if (pmdcPainter) {
            if (isPMDCTagOn) pmdcPainter.setPMDCEquipment(pmdcEquipments, selectedCanvas)
            else pmdcPainter.clearEquipments()
        }
    }, [pmdcEquipments, isPMDCTagOn])

    useEffect(() => {
        if (pmdcPainter && controlMode === 'pmdc') {
            pmdcPainter.changeTheme(theme)
        }
    }, [pmdcPainter, theme])

    return pmdcPainter
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
