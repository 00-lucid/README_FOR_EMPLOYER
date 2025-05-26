import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
// Lib
import { getModel, getHandle } from '../../Lib/canvasUtils'
// 전역 Store
import { PainterContext } from '../../Store/painterContext'
import ThemeStore from '../../Store/ThemeStore'
import { StatusStore } from '../../Store/statusStore'
export class EntityPainter {
    private viewer: any
    private lib: any
    private theme: Theme
    private path: any // highlight path
    private hColorStyles: ColorStyles = {}
    private entityMap = new Map<string, any>()
    private exHandles: string[] = []

    private colorEntities = new Map<string, Color>()
    private mouseOverHandles = new Set<string>()
    private selectedHandles = new Set<string>()
    private notificationHandles = new Set<string>()
    private orderHandles = new Set<string>()
    private pldHandle = new Set<string>()
    private pldHandleList = new Set<string>()
    private equipmentLibHandles = new Set<string>()

    // Default style
    private defaultWeight = new Map<string, number>()

    public pldMode = false

    public constructor(viewer: any, lib: any, defaultTheme: Theme, hColorStyles: ColorStyles) {
        this.viewer = viewer
        this.lib = lib
        this.theme = defaultTheme
        this.path = new this.lib.OdTvSubItemPath()
        this.hColorStyles = hColorStyles
    }

    public setEntityMap(entityMap: Map<string, any>) {
        this.entityMap = entityMap
    }

    public reload() {
        this.mouseOverHandles = new Set<string>()
        this.selectedHandles = new Set<string>()
        this.equipmentLibHandles = new Set<string>()
        this.notificationHandles = new Set<string>()
        this.orderHandles = new Set<string>()
        this.pldHandle = new Set<string>()
        // this.pldHandleList = new Set<string>()
    }

    public changeTheme(theme: Theme, colorElements: Map<string, any>, setColorElements: (defaultColor: Map<string, any>) => void) {
        this.theme = theme

        this.redraw(null, colorElements, setColorElements)
    }

    public async setHighlight(handles: string[], eventHandles: Set<string>, type: string) {
        const newSet = new Set(handles)

        const { hover, select, notification, order, sideEquip } = this.hColorStyles

        handles.map(async (handle) => {
            const entity = this.entityMap.get(handle)
            if (!entity) return

            if (this.selectedHandles.has(handle) || type === 'mouseSelect') {
                this.viewer.activeView.highlight(entity, this.path, true, select.index)
                console.log('mouseSelect active ::', handle)
            } else if (this.notificationHandles.has(handle) || type == 'sideNoti') {
                console.log('notificationHandles active ::', handle)
                this.viewer.activeView.highlight(entity, this.path, true, notification.index)
            } else if (this.orderHandles.has(handle) || type == 'sideOrder') {
                console.log('orderHandles active ::', handle)
                this.viewer.activeView.highlight(entity, this.path, true, order.index)
            } else if (type === 'mouseOver') {
                console.trace('mouseOver active ::', handle)
                this.viewer.activeView.highlight(entity, this.path, true, hover.index)
            } else if (type === 'sideEquipment') {
                this.viewer.activeView.highlight(entity, this.path, true, sideEquip.index)
                console.log('sideEquipment active ::', handle)
            }
        })

        // 복구할 handle
        eventHandles.forEach(async (handle: string) => {
            let check: boolean = false

            const entity = this.entityMap.get(handle)
            if (!entity) return

            if (
                type === 'mouseOver' &&
                !newSet.has(handle) &&
                !this.selectedHandles.has(handle) &&
                !this.notificationHandles.has(handle) &&
                !this.orderHandles.has(handle)
            )
                check = true
            else if (type === 'mouseSelect' && !newSet.has(handle)) {
                if (this.notificationHandles.has(handle)) {
                    this.viewer.activeView.highlight(entity, this.path, false, 0)
                    this.viewer.activeView.highlight(entity, this.path, true, notification.index)
                } else if (this.orderHandles.has(handle)) {
                    this.viewer.activeView.highlight(entity, this.path, false, 0)
                    this.viewer.activeView.highlight(entity, this.path, true, order.index)
                } else check = true
            } else if ((type === 'sideNoti' || type === 'sideOrder') && !newSet.has(handle) && !this.selectedHandles.has(handle))
                check = true

            if (check) {
                this.viewer.activeView.highlight(entity, this.path, false, 0)
            }
        })

        if (type === 'mouseOver') this.mouseOverHandles = newSet
        else if (type === 'mouseSelect') this.selectedHandles = newSet
        else if (type === 'sideEquipment') this.equipmentLibHandles = newSet
        else if (type === 'sideNoti') this.notificationHandles = newSet
        else if (type === 'sideOrder') this.orderHandles = newSet
    }

    public setHighlightByColor(handles: string[], eventHandles: Set<string>, type: string, colorElements: Map<any, any>) {
        const optionJSON: string | null = localStorage.getItem('option')
        const option: Option = JSON.parse(optionJSON || '{}')

        const newSet = new Set(handles)

        handles.map(async (handle) => {
            // if (handle == '129450' || handle == '20114') return;
            const entity = this.entityMap.get(handle)
            if (!entity) return
            if (newSet.has(handle)) {
                if (undefined !== colorElements.get(handle)) {
                    // colorful
                    setColor(this.lib, entity, option.highlightColor.index)
                } else {
                    // black & white
                    setColor(this.lib, entity, option.highlightColor.rgb)
                }
            }
        })
        // 복구할 handle
        eventHandles.forEach(async (handle: string) => {
            const entity = this.entityMap.get(handle)
            let check: boolean = false
            if (type === 'mouseOver') {
                if (!this.selectedHandles.has(handle) && !this.equipmentLibHandles.has(handle)) check = true
            } else if (type === 'mouseSelect') {
                if (!this.mouseOverHandles.has(handle) && !this.equipmentLibHandles.has(handle)) check = true
            } else if (type === 'sideEquipment') {
                if (!this.mouseOverHandles.has(handle) && !this.selectedHandles.has(handle)) check = true
            }

            if (check) {
                if (undefined !== colorElements.get(handle)) {
                    // colorful
                    setColor(this.lib, entity, colorElements.get(handle))
                } else {
                    // black & white
                    setColor(this.lib, entity, this.theme.strokeColor)
                }
            }
        })

        if (type === 'mouseOver') this.mouseOverHandles = newSet
        else if (type === 'mouseSelect') this.selectedHandles = newSet
        else if (type === 'sideEquipment') this.equipmentLibHandles = newSet
    }

    // 마우스 호버한 설비 페인트
    public setMouseOverByColor(handles: string[], colorElements: Map<string, any>) {
        this.setHighlight(handles, this.mouseOverHandles, 'mouseOver')
        // this.setHighlightByColor(handles, this.mouseOverHandles, 'mouseOver', colorElements)
    }

    // 클릭한 설비 페인트
    public setSelectedHandlesByColor(handles: string[], colorElements: Map<string, any>) {
        this.setHighlight(handles, this.selectedHandles, 'mouseSelect')
        // this.setHighlightByColor(handles, this.selectedHandles, 'mouseSelect', colorElements)
    }

    // 사이드뷰 눈 표시 설비 페인트
    public setEquipmentLibHandlesByColor(handles: string[], colorElements: Map<string, any>) {
        //this.setHighlight(handles, this.equipmentLibHandles, 'sideEquipment')
        this.setHighlightByColor(handles, this.equipmentLibHandles, 'sideEquipment', colorElements)
    }
    // 오더 눈 표시 설비 페인트
    public setOrderHandles(handles: string[]) {
        this.setHighlight(handles, this.orderHandles, 'sideOrder')
    }
    // 통지 눈 표시 설비 페인트
    public setNotificationHandles(handles: string[]) {
        this.setHighlight(handles, this.notificationHandles, 'sideNoti')
    }

    public redraw(
        types: string[] | null,
        colorElements: Map<string, any>,
        setColorElements: (colorElements: Map<string, any>) => void
    ): void {
        const itr = getModel(this.viewer).getEntitiesIterator()
        let i = 0
        const RGBs = new Map<string, any>()
        const black = JSON.stringify({ r: 0, g: 0, b: 0 })
        const white = JSON.stringify({ r: 240, g: 240, b: 240 })

        const optionJSON: string | null = localStorage.getItem('option')
        const option: Option = JSON.parse(optionJSON || '{}')

        while (!itr.done()) {
            let isColorful = false

            const entity = itr.getEntity()
            const type = entity.getType()
            const handle = getHandle(entity)
            const defaultColor = colorElements.has(handle) && colorElements.get(handle)

            // * TEST
            // if (handle === '13315') {
            //     let rgb = JSON.stringify(getColor(entity, this.lib))
            //     let index = getIndexedColor(entity, this.lib)
            //     console.log('@RGB: ', rgb)
            //     console.log('@INDEX: ', index)
            //     if (type === 1) {
            //         console.log('@TYPE_1')
            //         if ((index !== 0 && index !== 7) || (rgb !== black && rgb !== white)) {
            //             console.log('@COLORFUL')
            //             if (rgb === black || rgb === white) {
            //                 // RGBs.set(handle, JSON.parse(index))
            //                 console.log('@SET_INDEX')
            //             } else {
            //                 // RGBs.set(handle, JSON.parse(rgb))
            //                 console.log('@SET_RGB')
            //             }
            //             isColorful = true
            //         }
            //     } else {
            //         console.log('@TYPE_2')
            //         const colorObj = entity.openObjectAsInsert().getColor()
            //         const [r, g, b] = colorObj.getColor()
            //         rgb = JSON.stringify({ r, g, b })

            //         if (rgb !== black && rgb !== white) {
            //             // RGBs.set(handle, JSON.parse(rgb))
            //             console.log('@COLORFUL')
            //             console.log('@SET_RGB')
            //             isColorful = true
            //         }
            //     }
            // }
            // *

            // 검정 또는 흰 색인지 확인
            let RGB
            if (type === 1) {
                RGB = JSON.stringify(getColor(entity, this.lib))
                const INDEX_RGB = getIndexedColor(entity, this.lib)
                // Check index color && color
                // 색과 숫자가 1:n 매칭이다
                // 따라서 더 많은 검정색을 찾아 조건에 포함시켜야 한다 (ex: 17)
                if ((INDEX_RGB !== 0 && INDEX_RGB !== 7) || (RGB !== black && RGB !== white)) {
                    if (RGB === black || RGB === white) {
                        RGBs.set(handle, JSON.parse(INDEX_RGB))
                    } else {
                        RGBs.set(handle, JSON.parse(RGB))
                    }
                    isColorful = true
                }
            } else {
                RGB = JSON.stringify(getColor(entity, this.lib))

                // Check color
                if (RGB !== black && RGB !== white) {
                    RGBs.set(handle, JSON.parse(RGB))
                    isColorful = true
                }
            }

            if (this.mouseOverHandles.has(handle)) {
                setColor(this.lib, entity, this.theme.mouseOverColor)
            } else if (this.selectedHandles.has(handle)) {
                setColor(this.lib, entity, this.theme.selectedColor)
            } else if (this.orderHandles.has(handle)) {
                setColor(this.lib, entity, this.theme.orderColor)
            } else if (this.notificationHandles.has(handle)) {
                setColor(this.lib, entity, this.theme.notificationColor)
            } else if (this.pldHandle.has(handle)) {
                if (typeof defaultColor === 'number') {
                    setColor(this.lib, entity, 30)
                } else {
                    setColor(this.lib, entity, this.theme.pldColor)
                }
            } else if (this.pldHandleList.has(handle)) {
                if (null !== types) {
                    const type = types[i]

                    if (type === '003') {
                        if (undefined !== defaultColor) {
                            if (typeof defaultColor === 'number') {
                                setColor(this.lib, entity, 6)
                            } else {
                                setColor(this.lib, entity, this.theme.pldMainLineColor)
                            }
                        }
                    } else if (type === '004') {
                        if (undefined !== defaultColor) {
                            if (typeof defaultColor === 'number') {
                                setColor(this.lib, entity, 4)
                            } else {
                                setColor(this.lib, entity, this.theme.pldSubLineColor)
                            }
                        }
                    } else if (type === '001') {
                        setColor(this.lib, entity, this.theme.pldOpenValveColor)
                    } else if (type === '002') {
                        setColor(this.lib, entity, this.theme.pldCloseValveColor)
                    } else if (type === '005') {
                        setColor(this.lib, entity, this.theme.pldControlValveColor)
                    }
                }
            } else if (this.equipmentLibHandles.has(handle) || this.selectedHandles.has(handle) || this.mouseOverHandles.has(handle)) {
                if (colorElements.has(handle)) {
                    setColor(this.lib, entity, option.highlightColor.index)
                } else {
                    setColor(this.lib, entity, option.highlightColor.rgb)
                }
            } else {
                /* 
                    한수원 신한울의 경우 - vsd -> pdf -> dwg로 컨버팅된 도면으로 
                    배경색이 들어간 핸들이 존재함.
                    모든 설비를 strokeColor로 변경하는게 아닌 배경 핸들은 backgroundColor로 변경
                */
                let selectColor = this.theme.strokeColor
                // ! 모든 entity의 레이어 이름을 검사하기 때문에 속도 이슈가 있을 수 있음
                if (process.env.REACT_APP_DB === '한수원') {
                    console.log('getName!!')
                    let layerNm = undefined
                    if (type === 1) {
                        layerNm = entity.openObject().getLayer().openObject().getName()
                    } else if (type === 2) {
                        layerNm = entity.openObjectAsInsert().getLayer().openObject().getName()
                    }
                    if (layerNm === 'CFF-FF-FF') {
                        selectColor = this.theme.backgroundColor
                    }
                }

                if (option.isOriginalMode) {
                    if (!isColorful) {
                        setColor(this.lib, entity, selectColor)
                    } else {
                        const color = RGBs.get(handle)
                        if (typeof color === 'number') {
                            setColor(this.lib, entity, color)
                        } else if (typeof color.r === 'number') {
                            setColor(this.lib, entity, color)
                        }
                    }
                } else {
                    if (!isColorful) {
                        setColor(this.lib, entity, selectColor)
                    } else {
                        // ! 리팩토링 예정
                        const color = RGBs.get(handle)
                        if (typeof color === 'number') {
                            if (this.theme.type === 'light') {
                                setColor(this.lib, entity, 7)
                                RGBs.delete(handle)
                                RGBs.set(handle, 7)
                            } else {
                                setColor(this.lib, entity, 0)
                                RGBs.delete(handle)
                                RGBs.set(handle, 0)
                            }
                        } else if (typeof color.r === 'number') {
                            if (this.theme.type === 'light') {
                                setColor(this.lib, entity, { r: 0, g: 0, b: 0 })
                                RGBs.delete(handle)
                                RGBs.set(handle, { r: 0, g: 0, b: 0 })
                            } else {
                                setColor(this.lib, entity, { r: 255, g: 255, b: 255 })
                                RGBs.delete(handle)
                                RGBs.set(handle, { r: 255, g: 255, b: 255 })
                            }
                        }
                    }
                }
            }

            i++
            itr.step()
        }

        console.log('@RGBs: ', RGBs)
        if (RGBs.size > 0) setColorElements(RGBs)

        const color = this.theme.backgroundColor
        this.viewer.setBackgroundColor([color.r, color.g, color.b])
    }

    // PLD - 선택한 설비 페인트
    public setPldHandle(handles: string[], equipList: PldEquipment[]) {
        const newSet = new Set(handles)
        const { pldColor, pldMainLineColor, pldSubLineColor, pldOpenValveColor, pldCloseValveColor, pldControlValveColor } =
            this.hColorStyles
        handles.map(async (handle) => {
            const entity = this.entityMap.get(handle)
            if (!entity) return
            this.viewer.activeView.highlight(entity, this.path, true, pldColor.index)
        })

        const equipMap = equipList.reduce((map: Map<string, PldEquipment>, obj: PldEquipment) => {
            map.set(obj.handle, obj)
            return map
        }, new Map())

        // 복구할 handle
        this.pldHandle.forEach((handle: string) => {
            if (!newSet.has(handle)) {
                const entity = this.entityMap.get(handle)
                if (!entity) return
                const equip = equipMap.get(handle)
                if (equip) {
                    const type = equip.type
                    this.viewer.activeView.highlight(entity, this.path, false, 0)

                    if (type === '003') this.viewer.activeView.highlight(entity, this.path, true, pldMainLineColor.index)
                    else if (type === '004') this.viewer.activeView.highlight(entity, this.path, true, pldSubLineColor.index)
                    else if (type === '001') this.viewer.activeView.highlight(entity, this.path, true, pldOpenValveColor.index)
                    else if (type === '002') this.viewer.activeView.highlight(entity, this.path, true, pldCloseValveColor.index)
                    else if (type === '005') this.viewer.activeView.highlight(entity, this.path, true, pldControlValveColor.index)
                } else this.viewer.activeView.highlight(entity, this.path, false, 0)
            }
        })
        this.pldHandle = newSet
    }

    public setPldHandleList(equipList: PldEquipment[], colorElements: Map<string, any>) {
        const { pldMainLineColor, pldSubLineColor, pldOpenValveColor, pldCloseValveColor, pldControlValveColor } = this.hColorStyles

        const handles = equipList.map((equip) => equip.handle)
        const newSet = new Set(handles)

        equipList.map(async (equip) => {
            const { type, handle } = equip
            const entity = this.entityMap.get(handle)
            if (!entity) return

            if (this.pldHandle.has(handle)) this.viewer.activeView.highlight(entity, this.path, false, 0)

            if (type === '003') this.viewer.activeView.highlight(entity, this.path, true, pldMainLineColor.index)
            else if (type === '004') this.viewer.activeView.highlight(entity, this.path, true, pldSubLineColor.index)
            else if (type === '001') this.viewer.activeView.highlight(entity, this.path, true, pldOpenValveColor.index)
            else if (type === '002') this.viewer.activeView.highlight(entity, this.path, true, pldCloseValveColor.index)
            else if (type === '005') this.viewer.activeView.highlight(entity, this.path, true, pldControlValveColor.index)
        })

        // 복구할 handle
        this.pldHandleList.forEach((handle: string) => {
            if (!newSet.has(handle)) {
                const entity = this.entityMap.get(handle)
                if (!entity) return
                this.viewer.activeView.highlight(entity, this.path, false, 0)
            }
        })

        this.pldHandleList = newSet
    }

    // public setPMDCPopupHandle(entity: any) {
    //     setColor(this.lib, entity, { r: 0x06, g: 0xbc, b: 0x09 })
    // }

    // public setPMDCPopupUnHandle(entity: any) {
    //     setColor(this.lib, entity, { r: 0, g: 0, b: 0 })
    // }

    // 툴바 - 옵션 - 색상변경
    public updateHighlightColor(colorElements: Map<string, any>) {
        const handles = Array.from(this.equipmentLibHandles.keys())

        this.setEquipmentLibHandlesByColor(handles, colorElements)
    }

    public updateLineWeight() {
        adjustLineWidth(this.viewer, this.lib, this.defaultWeight)
    }

    public getDefaultWeight() {
        const itr = getModel(this.viewer).getEntitiesIterator()
        while (!itr.done()) {
            const entityId = itr.getEntity()
            const entity = entityId.openObject()
            if (entityId.getType() === 1) {
                const value = entity.getLineWeight(this.lib.GeometryTypes.kAll).getValue()
                if (value >= 4) {
                    this.defaultWeight.set(getHandle(entityId), value)
                }
            }

            itr.step()
        }
    }
}

export function useEntityPainter(viewer: any, lib: any, theme: Theme) {
    // 전역 컨텍스트
    const painterContext = React.useContext(PainterContext)
    if (!painterContext) throw new Error('Unhandled context')
    const { entityPainter, setEntityPainter } = painterContext

    // 전역 Store
    const [colorElements, setColorElements] = useRecoilState(ThemeStore.colorElements)
    const pldMode = useRecoilValue(StatusStore.pldMode)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const hColorStyles = useRecoilValue(ThemeStore.hColorStyles)

    // 초기화
    React.useEffect(() => {
        if (viewer && lib) {
            setEntityPainter(new EntityPainter(viewer, lib, theme, hColorStyles))
        }
        // theme 의존성이 있으면 반전기능이 두번 실행 됨
    }, [viewer, lib, setEntityPainter])

    // Canvas 테마 변경 이벤트.
    React.useEffect(() => {
        if (entityPainter && selectedCanvas) {
            entityPainter.changeTheme(theme, colorElements, setColorElements)
        }
    }, [entityPainter, theme])

    React.useEffect(() => {
        if (entityPainter) {
            entityPainter.pldMode = pldMode
        }
    }, [entityPainter, pldMode])

    return entityPainter
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
// function getColor(entity: any, lib: any): Color {
//     if (entity.getType() === 1) {
//         const obj = entity.openObject()
//         const color = obj.getColor(lib.GeometryTypes.kAll).getColor()
//         return { r: color[0], g: color[1], b: color[2] }
//     } else if (entity.getType() === 2) {
//         const insert = entity.openObjectAsInsert()
//         const itr = insert.getBlock().openObject().getEntitiesIterator()

//         while (!itr.done()) {
//             const entity = itr.getEntity()
//             const type = entity.getType()
//             const obj = entity.openObject()

//             if (type === 1) {
//                 const color = obj.getColor(lib.GeometryTypes.kAll).getColor()
//                 return { r: color[0], g: color[1], b: color[2] }
//             } else if (type === 2) {
//                 return getColor(entity, lib)
//             }

//             itr.step()
//         }
//     }

//     return { r: 128, g: 128, b: 128 }
// }

function getIndexedColor(entity: any, lib: any) {
    const obj = entity.openObject()
    const colorObj = obj.getColor(lib.GeometryTypes.kAll)
    return colorObj.getIndexedColor()
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

const adjustLineWidth = (viewer: any, lib: any, defaultWeight: Map<string, number>) => {
    const optionJSON: string | null = localStorage.getItem('option')

    if (null !== optionJSON) {
        const option: Option = JSON.parse(optionJSON)
        // option 의 lineWidth 만큼 일정굵기 이상인 선의 굵기를 조절합니다.
        if (undefined !== viewer) {
            const itr = getModel(viewer).getEntitiesIterator()
            while (!itr.done()) {
                const entity = itr.getEntity()
                const handle = getHandle(entity)

                if (defaultWeight.has(handle)) {
                    const value = defaultWeight.get(handle)
                    if (value) {
                        setLineWeight(lib, entity, option.lineWidth, value)
                    }
                }
                itr.step()
            }
        }
    }
}

const setLineWeight = (lib: any, entity: any, lineWidth: number, defaultLineWeight: number) => {
    const entityPtr = entity.openObject()

    if (entity.getType() === 1) {
        const lineWeightObj = entityPtr.getLineWeight(lib.GeometryTypes.kAll)
        // option.lineWidth는 100일 때 1, 90일 때 0.9의 곱연산을 한다
        const afterWeight = defaultLineWeight * (lineWidth / 100)
        lineWeightObj.setValue(afterWeight < 2 ? 2 : afterWeight)
        entityPtr.setLineWeight(lineWeightObj, 1)
    }
}
