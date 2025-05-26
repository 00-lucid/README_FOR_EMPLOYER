import React from 'react'
import { getEntities, getModel, getHandle } from './utils'
import { Color } from '../../types'
import { ThemeContext, Theme, defaultTheme } from '../..'
import {
    useSelectedHandles,
    useNotificationHandles,
    useOrderHandles,
    useEquipmentLibHandles,
    usePldHandle,
    usePldHandleList,
    usePldHandleListType
} from './useSelectedHandles'
import { CanvasContext } from '../useCanvasContext'
import { StatusContext } from '../../context'

const black = { r: 0, g: 0, b: 0 }
const white = { r: 255, g: 255, b: 255 }

function isEqualColor(v1: Color, v2: Color): boolean {
    return v1.r === v2.r && v1.g === v2.g && v1.b === v2.b
}

/*
ptr.openObject().getColor(1).getType()

enum ColorType {
    kDefault = 0,
    kColor = 1,
    kInherited = 2,
    kIndexed = 3
  };

kDefault — Default color which has a zero uint color value.
kColor — Color that is set directly with R, G and B components.
kInherited — Color that is defined by a layer or block.
kIndexed — Color that corresponds to an integer value in a logical palette of a device.
*/
function getColor(entity: any, lib: any): Color {
    if (entity.getType() === 1) {
        const entityPtr = entity.openObject()
        const colorDef = entityPtr.getColor(1)

        let color = colorDef.getColor()

        if (colorDef.getInheritedColor() === 0) {
            color = entityPtr.getLayer(lib.GeometryTypes.kAll).openObject().getColor().getColor()
        }

        return { r: color[0], g: color[1], b: color[2] }
    } else if (entity.getType() === 2) {
        const entityPtr = entity.openObjectAsInsert()
        const colorDef = entityPtr.getColor()

        let color = colorDef.getColor()

        if (colorDef.getInheritedColor() === 0) {
            color = entityPtr.getLayer().openObject().getColor().getColor()
        }

        return { r: color[0], g: color[1], b: color[2] }
    }

    return { r: 128, g: 128, b: 128 }
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

function getColorEntities(viewer: any, lib: any): Map<string, Color> {
    const values = new Map<string, Color>()

    const itr = getModel(viewer).getEntitiesIterator()

    while (!itr.done()) {
        const entity = itr.getEntity()
        const color = getColor(entity, lib)

        if (!isEqualColor(color, black) && !isEqualColor(color, white)) {
            const handle = getHandle(entity)
            values.set(handle, color)
        }

        itr.step()
    }

    return values
}

class EntityPainter {
    private viewer: any
    private lib: any
    private theme: Theme

    private colorEntities = new Map<string, Color>()
    private mouseOverHandles = new Set<string>()
    private selectedHandles = new Set<string>()
    private notificationHandles = new Set<string>()
    private orderHandles = new Set<string>()
    private equipmentLibHandles = new Set<string>()
    private wcdHandles = new Set<string>()
    private pldHandle = new Set<string>()
    private pldHandleList = new Set<string>()

    public constructor(viewer: any, lib: any) {
        this.viewer = viewer
        this.lib = lib
        this.theme = defaultTheme
    }

    private frameId = -1
    private update() {
        const render = () => {
            this.frameId = -1
            this.viewer.update()
        }

        if (this.frameId === -1) {
            this.frameId = requestAnimationFrame(render)
        }
    }

    public reload() {
        this.mouseOverHandles = new Set<string>()
        this.selectedHandles = new Set<string>()
        this.equipmentLibHandles = new Set<string>()
        this.notificationHandles = new Set<string>()
        this.orderHandles = new Set<string>()
        this.pldHandle = new Set<string>()
        this.pldHandleList = new Set<string>()
        this.colorEntities = getColorEntities(this.viewer, this.lib)

        this.redraw(null)
    }

    public changeTheme(theme: Theme) {
        this.theme = theme

        this.redraw(null)
    }

    public setMouseOver(handles: string[]) {
        const entities = getEntities(this.viewer, handles)
        // 새로운 handle
        for (const entity of entities) {
            setColor(this.lib, entity, this.theme.mouseOverColor)
        }

        const newSet = new Set(handles)

        // 복구할 handle
        const restoreHandles: string[] = []

        this.mouseOverHandles.forEach((handle: string) => {
            if (!newSet.has(handle)) {
                restoreHandles.push(handle)
            }
        })

        const restoreEntities = getEntities(this.viewer, restoreHandles)

        for (const entity of restoreEntities) {
            const handle = getHandle(entity)

            let color = this.theme.strokeColor

            if (this.selectedHandles.has(handle)) {
                color = this.theme.selectedColor
            } else if (this.equipmentLibHandles.has(handle)) {
                color = this.theme.equipmentLibColor
            } else if (this.orderHandles.has(handle)) {
                color = this.theme.orderColor
            } else if (this.notificationHandles.has(handle)) {
                color = this.theme.notificationColor
            } else if (this.colorEntities.has(handle)) {
                color = this.colorEntities.get(handle)!
            } else if (this.wcdHandles.has(handle)) {
                color = this.theme.etgColor
            }

            setColor(this.lib, entity, color)
        }

        this.mouseOverHandles = newSet

        this.update()
    }

    public setSelectedHandles(handles: string[]) {
        const entities = getEntities(this.viewer, handles)

        for (const entity of entities) {
            const handle = getHandle(entity)

            if (!this.mouseOverHandles.has(handle)) {
                setColor(this.lib, entity, this.theme.selectedColor)
            }
        }

        const newSet = new Set(handles)

        // 복구할 handle
        const restoreHandles: string[] = []

        this.selectedHandles.forEach((handle: string) => {
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
            } else if (this.equipmentLibHandles.has(handle)) {
                color = this.theme.equipmentLibColor
            } else if (this.orderHandles.has(handle)) {
                color = this.theme.orderColor
            } else if (this.notificationHandles.has(handle)) {
                color = this.theme.notificationColor
            } else if (this.colorEntities.has(handle)) {
                color = this.colorEntities.get(handle)!
            } else if (this.wcdHandles.has(handle)) {
                color = this.theme.etgColor
            }

            setColor(this.lib, entity, color)
        }

        this.selectedHandles = newSet

        this.update()
    }

    public setEquipmentLibHandles(handles: string[]) {
        const entities = getEntities(this.viewer, handles)

        for (const entity of entities) {
            const handle = getHandle(entity)

            if (!this.mouseOverHandles.has(handle)) {
                setColor(this.lib, entity, this.theme.equipmentLibColor)
            }
        }

        const newSet = new Set(handles)

        // 복구할 handle
        const restoreHandles: string[] = []

        this.equipmentLibHandles.forEach((handle: string) => {
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
            } else if (this.orderHandles.has(handle)) {
                color = this.theme.orderColor
            } else if (this.notificationHandles.has(handle)) {
                color = this.theme.notificationColor
            } else if (this.colorEntities.has(handle)) {
                color = this.colorEntities.get(handle)!
            } else if (this.wcdHandles.has(handle)) {
                color = this.theme.etgColor
            }

            setColor(this.lib, entity, color)
        }

        this.equipmentLibHandles = newSet

        this.update()
    }

    public setOrderHandles(handles: string[]) {
        const entities = getEntities(this.viewer, handles)

        for (const entity of entities) {
            const handle = getHandle(entity)

            if (!this.mouseOverHandles.has(handle)) {
                setColor(this.lib, entity, this.theme.orderColor)
            }
        }

        const newSet = new Set(handles)

        // 복구할 handle
        const restoreHandles: string[] = []

        this.orderHandles.forEach((handle: string) => {
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
            } else if (this.equipmentLibHandles.has(handle)) {
                color = this.theme.equipmentLibColor
            } else if (this.notificationHandles.has(handle)) {
                color = this.theme.notificationColor
            } else if (this.colorEntities.has(handle)) {
                color = this.colorEntities.get(handle)!
            } else if (this.wcdHandles.has(handle)) {
                color = this.theme.etgColor
            }

            setColor(this.lib, entity, color)
        }

        this.orderHandles = newSet

        this.update()
    }

    public setNotificationHandles(handles: string[]) {
        const entities = getEntities(this.viewer, handles)

        for (const entity of entities) {
            const handle = getHandle(entity)

            if (!this.mouseOverHandles.has(handle)) {
                setColor(this.lib, entity, this.theme.notificationColor)
            }
        }

        const newSet = new Set(handles)

        // 복구할 handle
        const restoreHandles: string[] = []

        this.notificationHandles.forEach((handle: string) => {
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
            } else if (this.equipmentLibHandles.has(handle)) {
                color = this.theme.equipmentLibColor
            } else if (this.orderHandles.has(handle)) {
                color = this.theme.orderColor
            } else if (this.colorEntities.has(handle)) {
                color = this.colorEntities.get(handle)!
            } else if (this.wcdHandles.has(handle)) {
                color = this.theme.etgColor
            }

            setColor(this.lib, entity, color)
        }

        this.notificationHandles = newSet

        this.update()
    }

    public setWCDEquipment(handles: string[]) {
        console.log('handels:', handles)
        const entities = getEntities(this.viewer, handles)

        for (const entity of entities) {
            const handle = getHandle(entity)

            if (!this.mouseOverHandles.has(handle)) {
                setColor(this.lib, entity, this.theme.etgColor)
            }
        }

        const newSet = new Set(handles)

        // 복구할 handle
        const restoreHandles: string[] = []

        this.orderHandles.forEach((handle: string) => {
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
            } else if (this.equipmentLibHandles.has(handle)) {
                color = this.theme.equipmentLibColor
            } else if (this.notificationHandles.has(handle)) {
                color = this.theme.notificationColor
            } else if (this.colorEntities.has(handle)) {
                color = this.colorEntities.get(handle)!
            } else if (this.wcdHandles.has(handle)) {
                color = this.theme.etgColor
            }

            setColor(this.lib, entity, color)
        }

        this.orderHandles = newSet

        this.update()
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
            } else if (this.orderHandles.has(handle)) {
                setColor(this.lib, entity, this.theme.orderColor)
            } else if (this.notificationHandles.has(handle)) {
                setColor(this.lib, entity, this.theme.notificationColor)
            } else if (this.wcdHandles.has(handle)) {
                setColor(this.lib, entity, this.theme.etgColor)
            } else if (this.pldHandle.has(handle)) {
                setColor(this.lib, entity, this.theme.pldColor)
            } else if (this.pldHandleList.has(handle)) {
                if (null !== types) {
                    const type = types[i]

                    if (type === '003') {
                        setColor(this.lib, entity, this.theme.pldMainLineColor)
                    } else if (type === '004') {
                        setColor(this.lib, entity, this.theme.pldSubLineColor)
                    } else if (type === '001') {
                        setColor(this.lib, entity, this.theme.pldOpenValveColor)
                    } else if (type === '002') {
                        setColor(this.lib, entity, this.theme.pldCloseValveColor)
                    } else if (type === '005') {
                        setColor(this.lib, entity, this.theme.pldControlValveColor)
                    }
                }
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

        this.update()
    }

    public setPldHandle(handles: string[]) {
        const entities = getEntities(this.viewer, handles)

        for (const entity of entities) {
            const handle = getHandle(entity)
            const entityType = entity.getType()

            if (!this.mouseOverHandles.has(handle)) {
                if (entityType === 1) {
                    setColor(this.lib, entity, this.theme.pldColor)
                } else if (entityType === 2) {
                    setColor(this.lib, entity, this.theme.pldColor)
                }
            }
        }

        const newSet = new Set(handles)

        // 복구할 handle
        const restoreHandles: string[] = []

        this.pldHandle.forEach((handle: string) => {
            if (!newSet.has(handle)) {
                restoreHandles.push(handle)
            }
        })

        const restoreEntities = getEntities(this.viewer, restoreHandles)

        for (const entity of restoreEntities) {
            const handle = getHandle(entity)

            const entityType = entity.getType()

            if (entityType === 1) {
                const object = entity.openObject()
                const transparency = object.getTransparency(this.lib.GeometryTypes.kAll)
                transparency.setValue(0)
                object.setTransparency(transparency, this.lib.GeometryTypes.kAll)
                setColor(this.lib, entity, this.theme.pldColor)
            } else {
                setColor(this.lib, entity, this.theme.pldColor)
            }

            let color = this.theme.strokeColor

            if (this.mouseOverHandles.has(handle)) {
                color = this.theme.mouseOverColor
            } else if (this.selectedHandles.has(handle)) {
                color = this.theme.selectedColor
            } else if (this.orderHandles.has(handle)) {
                color = this.theme.orderColor
            } else if (this.notificationHandles.has(handle)) {
                color = this.theme.notificationColor
            } else if (this.colorEntities.has(handle)) {
                color = this.colorEntities.get(handle)!
            }

            setColor(this.lib, entity, color)
        }

        this.pldHandle = newSet

        this.update()
    }

    public setPldHandleList(handleList: string[], types: string[], setPldHandleList: any, setPldHandleListTypes: any) {
        const entities = getEntities(this.viewer, handleList)

        const newPldHandleList = []
        const newPldHandleListTypes = []

        for (let i = 0; i < handleList.length; i++) {
            const list = handleList[i]
            const type = types[i]

            const entities = getEntities(this.viewer, [list])

            if (!(entities.length === 0)) {
                newPldHandleList.push(list)
                newPldHandleListTypes.push(type)
            }
        }

        if (newPldHandleList.length !== handleList.length) {
            setPldHandleList(newPldHandleList)
            setPldHandleListTypes(newPldHandleListTypes)
        }

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i]
            const handle = getHandle(entity)
            const type = types[i]

            if (!this.mouseOverHandles.has(handle)) {
                if (type === '003') {
                    const object = entity.openObject()
                    const lineWeight = object.getLineWeight(this.lib.GeometryTypes.kAll)

                    if (entity.getType() === 1 && lineWeight.getValue() < 5) {
                        lineWeight.setValue(5)
                        object.setLineWeight(lineWeight, 1)
                    }

                    setColor(this.lib, entity, this.theme.pldMainLineColor)
                } else if (type === '004') {
                    setColor(this.lib, entity, this.theme.pldSubLineColor)
                } else if (type === '001') {
                    setColor(this.lib, entity, this.theme.pldOpenValveColor)
                } else if (type === '002') {
                    setColor(this.lib, entity, this.theme.pldCloseValveColor)
                } else if (type === '005') {
                    setColor(this.lib, entity, this.theme.pldControlValveColor)
                } else {
                    continue
                }
            }
        }

        const newSet = new Set(handleList)

        // 복구할 handle
        const restoreHandles: string[] = []

        this.pldHandleList.forEach((handle: string) => {
            if (!newSet.has(handle)) {
                restoreHandles.push(handle)
            }
        })

        const restoreEntities = getEntities(this.viewer, restoreHandles)
        for (let i = 0; i < restoreEntities.length; i++) {
            const entity = restoreEntities[i]
            const handle = getHandle(entity)
            const type = types[i]

            let color = this.theme.strokeColor

            if (entity.getType() === 1) {
                const object = entity.openObject()
                const lineWeight = object.getLineWeight(this.lib.GeometryTypes.kAll)

                lineWeight.setDefault()
                object.setLineWeight(lineWeight, 1)
            }

            if (this.mouseOverHandles.has(handle)) {
                color = this.theme.mouseOverColor
            } else if (this.selectedHandles.has(handle)) {
                color = this.theme.selectedColor
            } else if (this.orderHandles.has(handle)) {
                color = this.theme.orderColor
            } else if (this.notificationHandles.has(handle)) {
                color = this.theme.notificationColor
            } else if (this.colorEntities.has(handle)) {
                color = this.colorEntities.get(handle)!
            } else if (this.pldHandleList.has(handle)) {
                if (type === '003') {
                    setColor(this.lib, entity, this.theme.pldMainLineColor)
                } else if (type === '004') {
                    setColor(this.lib, entity, this.theme.pldSubLineColor)
                } else if (type === '001') {
                    setColor(this.lib, entity, this.theme.pldOpenValveColor)
                } else if (type === '002') {
                    setColor(this.lib, entity, this.theme.pldCloseValveColor)
                } else if (type === '005') {
                    setColor(this.lib, entity, this.theme.pldControlValveColor)
                }
            }

            setColor(this.lib, entity, color)
        }

        this.pldHandleList = newSet

        this.update()
    }
}

export function useEntityPainter(viewer: any, lib: any, canvasContext: CanvasContext | undefined) {
    const status = React.useContext(StatusContext)

    const selectedHandles = useSelectedHandles(canvasContext)
    const equipmentLibHandles = useEquipmentLibHandles(canvasContext)
    const notificationHandles = useNotificationHandles(canvasContext)
    const orderHandles = useOrderHandles(canvasContext)
    const pldHandle = usePldHandle(canvasContext)
    const pldHandleList = usePldHandleList(canvasContext)
    const pldHandleListTypes = usePldHandleListType(canvasContext)

    const [painter, setPainter] = React.useState<EntityPainter>()

    const context = React.useContext(ThemeContext)

    React.useEffect(() => {
        if (viewer && lib) {
            setPainter(new EntityPainter(viewer, lib))
        }
    }, [viewer, lib])

    React.useEffect(() => {
        if (painter) {
            painter.changeTheme(context.theme)
        }
    }, [painter, context.theme])

    React.useEffect(() => {
        if (painter) {
            painter.setSelectedHandles(selectedHandles)
        }
    }, [painter, selectedHandles])

    React.useEffect(() => {
        if (painter) {
            painter.setEquipmentLibHandles(equipmentLibHandles)
        }
    }, [painter, equipmentLibHandles])

    React.useEffect(() => {
        if (painter) {
            painter.setOrderHandles(orderHandles)
        }
    }, [painter, orderHandles])

    React.useEffect(() => {
        if (painter) {
            painter.setNotificationHandles(notificationHandles)
        }
    }, [painter, notificationHandles])

    React.useEffect(() => {
        if (painter) {
            painter.redraw(pldHandleListTypes)
        }
    }, [painter])

    React.useEffect(() => {
        if (painter) {
            painter.setPldHandle(pldHandle)
        }
    }, [painter, pldHandle])

    React.useEffect(() => {
        if (painter) {
            painter.setPldHandleList(
                pldHandleList,
                pldHandleListTypes,
                status.setPldHandleList,
                status.setPldHandleListTypes
            )
        }
    }, [painter, pldHandle, pldHandleList, pldHandleListTypes])

    return painter
}
