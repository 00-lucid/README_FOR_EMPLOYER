import React from 'react'
import {
    warning,
    isEqualEntities,
    Drawing,
    Entity,
    Equipment,
    AppContextType,
    getQuery,
    updateQuery,
    pushCommand,
    setHandler
} from '.'

// document: SelectedDocument | undefined
// libId: string | undefined
// x: number
// y: number
// equipmentLinks: EquipmentLink[]
// equipments: EquipmentKey[]
// notifications: EquipmentKey[]
// orders: EquipmentKey[]

export type SelectedItem = {
    drawing: Drawing | undefined
    equipments: Equipment[]
    equipmentTypeId: string | undefined
    orderEquipments: Equipment[]
    notiEquipments: Equipment[]
}

const nullSelectedItem = {
    drawing: undefined,
    equipments: [],
    equipmentTypeId: undefined,
    notiEquipments: [],
    orderEquipments: []
}

const makeString = (entities: Entity[]) => {
    const ids: string[] = []

    for (const entity of entities) {
        ids.push(entity.id)
    }

    return ids.join(',')
}

const makeEntities = (text: string) => {
    const values = text.split(',')
    const results: Entity[] = []

    for (const value of values) {
        results.push({ id: value })
    }

    return results
}

export function useSelectedItem(app: AppContextType) {
    const [selectedItem, setSelectedItem] = React.useState<SelectedItem>(nullSelectedItem)
    const [allEquipments, setAllEquipments] = React.useState<Map<string, Equipment>>(new Map<string, Equipment>())

    React.useEffect(() => {
        const drawingId = getQuery('drawing')

        if (drawingId) {
            const url = `/drawings/${drawingId}`

            const equipmentsQuery = getQuery('equipments')

            if (equipmentsQuery) {
                const equipments = makeEntities(equipmentsQuery)

                pushCommand([
                    { name: 'OpenDrawing', value: { drawingUrl: url } },
                    { name: 'selectEquipment', value: { equipments } },
                    { name: 'zoomEntity', value: { equipments } }
                ])
            } else {
                pushCommand([{ name: 'OpenDrawing', value: { drawingUrl: url } }, { name: 'zoomExtents' }])
            }
        }
    }, [])

    React.useEffect(() => {
        updateQuery('drawing', selectedItem.drawing?.id)
        updateQuery('equipmentType', selectedItem.equipmentTypeId)
        updateQuery('equipments', makeString(selectedItem.equipments))
        updateQuery('notiEquipments', makeString(selectedItem.notiEquipments))
        updateQuery('orderEquipments', makeString(selectedItem.orderEquipments))
    }, [selectedItem])

    React.useEffect(() => {
        setHandler('OpenDrawing', async (value: { drawingUrl: string }) => {
            const drawing = await app.repository.get(value.drawingUrl)

            pushCommand({ name: 'SelectDrawing', value: { drawing: drawing } }, 'first')
        })

        setHandler('SelectDrawing', async (value: { drawing: Drawing }) => {
            const drawing = value.drawing

            const newMap = new Map<string, Equipment>()

            for (const equipment of drawing.equipments) {
                newMap.set(equipment.id, equipment)
            }

            setAllEquipments(newMap)

            setSelectedItem({ ...nullSelectedItem, drawing })
        })
    }, [app.repository])

    const getEquipmentsById = React.useCallback(
        (equipments: Entity[]) => {
            const newEquipments: Equipment[] = []

            for (const equipment of equipments) {
                const value = allEquipments.get(equipment.id)

                if (value) {
                    newEquipments.push(value)
                } else {
                    warning("equipment doesn't exist.", equipment.id)
                }
            }

            return newEquipments
        },
        [allEquipments]
    )

    React.useEffect(() => {
        setHandler('selectEquipment', async (value: { equipments: Entity[] }) => {
            if (!isEqualEntities(selectedItem.equipments, value.equipments)) {
                const newEquipments = getEquipmentsById(value.equipments)

                setSelectedItem((prev) => {
                    return { ...prev, equipments: newEquipments }
                })
            }
        })

        setHandler('selectEquipmentTypeId', async (item: { equipmentTypeId: string | undefined }) => {
            setSelectedItem((prev) => {
                return {
                    ...prev,
                    equipmentTypeId: item.equipmentTypeId,
                    notiEquipments: [],
                    orderEquipments: []
                }
            })
        })

        setHandler('selectNotiEquipments', async (value: { equipments: Entity[] }) => {
            if (!isEqualEntities(selectedItem.notiEquipments, value.equipments)) {
                const newEquipments = getEquipmentsById(value.equipments)

                setSelectedItem((prev) => {
                    return {
                        ...prev,
                        notiEquipments: newEquipments,
                        equipmentTypeId: undefined
                    }
                })
            }
        })

        setHandler('selectOrderEquipments', async (value: { equipments: Entity[] }) => {
            if (!isEqualEntities(selectedItem.orderEquipments, value.equipments)) {
                const newEquipments = getEquipmentsById(value.equipments)

                setSelectedItem((prev) => {
                    return {
                        ...prev,
                        orderEquipments: newEquipments,
                        equipmentTypeId: undefined
                    }
                })
            }
        })
    }, [getEquipmentsById, selectedItem.equipments, selectedItem.notiEquipments, selectedItem.orderEquipments])

    return selectedItem
}
