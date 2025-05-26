import React from 'react'
import { CanvasContext } from '../useCanvasContext'
import { StatusContext } from '../..'

export function useSelectedHandles(current: CanvasContext | undefined) {
    const status = React.useContext(StatusContext)

    const [selectedHandles, setSelectedHandles] = React.useState<string[]>([])

    React.useEffect(() => {
        const handles: string[] = []

        if (current) {
            if (0 < status.equipments.length) {
                for (const equipment of status.equipments) {
                    const value = current.equipmentByTagId.get(equipment.tagId)

                    if (value) {
                        for (const handle of value.handles) {
                            handles.push(handle.handle)
                        }
                    }
                }
            }
        }
        setSelectedHandles(handles)
    }, [current, status.equipments])

    return selectedHandles
}

export function useEquipmentLibHandles(current: CanvasContext | undefined) {
    const status = React.useContext(StatusContext)
    const [selectedHandles, setSelectedHandles] = React.useState<string[]>([])

    React.useEffect(() => {
        const handles: string[] = []

        if (current) {
            if (status.libId === 'all') {
                handles.push(...Array.from(current.registeredHandles))
            } else if (status.libId) {
                const values = current.handlesByLibId.get(status.libId)

                if (values) {
                    handles.push(...values)
                }
            }
        }
        setSelectedHandles(handles)
    }, [current, status.libId])

    return selectedHandles
}

export function useNotificationHandles(current: CanvasContext | undefined) {
    const status = React.useContext(StatusContext)

    const [selectedHandles, setSelectedHandles] = React.useState<string[]>([])

    React.useEffect(() => {
        const handles: string[] = []

        if (current) {
            if (0 < status.notifications.length) {
                for (const equipment of status.notifications) {
                    const value = current.equipmentByTagId.get(equipment.tagId)

                    if (value) {
                        for (const handle of value.handles) {
                            handles.push(handle.handle)
                        }
                    }
                }
            }
        }

        setSelectedHandles(handles)
    }, [current, status.notifications])

    return selectedHandles
}

export function useOrderHandles(current: CanvasContext | undefined) {
    const status = React.useContext(StatusContext)

    const [selectedHandles, setSelectedHandles] = React.useState<string[]>([])

    React.useEffect(() => {
        const handles: string[] = []

        if (current) {
            if (0 < status.orders.length) {
                for (const equipment of status.orders) {
                    const value = current.equipmentByTagId.get(equipment.tagId)

                    if (value) {
                        for (const handle of value.handles) {
                            handles.push(handle.handle)
                        }
                    }
                }
            }
        }

        setSelectedHandles(handles)
    }, [current, status.orders])

    return selectedHandles
}

export function usePldHandle(current: CanvasContext | undefined) {
    const status = React.useContext(StatusContext)

    const [selectedHandles, setSelectedHandles] = React.useState<string[]>([])

    React.useEffect(() => {
        const handles: string[] = []

        if (current) {
            if (0 < status.pldHandle?.length) {
                handles.push(status.pldHandle)
            } else {
                handles.push('')
            }
        }
        setSelectedHandles(handles)
    }, [current, status.pldHandle])

    return selectedHandles
}

export function usePldHandleList(current: CanvasContext | undefined) {
    const status = React.useContext(StatusContext)

    const [selectedHandles, setSelectedHandles] = React.useState<string[]>([])

    React.useEffect(() => {
        const handles: string[] = []

        if (current) {
            for (const pldHandle of status.pldHandleList) {
                handles.push(pldHandle)
            }
        }
        setSelectedHandles(handles)
    }, [current, status.pldHandleList])

    return selectedHandles
}

export function usePldHandleListType(current: CanvasContext | undefined) {
    const status = React.useContext(StatusContext)

    const [types, setTypes] = React.useState<string[]>([])

    React.useEffect(() => {
        const types: string[] = []

        if (current) {
            for (const type of status.pldHandleListTypes) {
                types.push(type)
            }
        }
        setTypes(types)
    }, [current, status.pldHandleListTypes])

    return types
}
