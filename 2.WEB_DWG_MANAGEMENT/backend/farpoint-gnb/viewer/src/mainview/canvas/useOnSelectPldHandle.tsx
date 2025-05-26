import React from 'react'
import { StatusContext, pushCommand } from '../..'
import { CanvasContext } from '../useCanvasContext'

export function useOnSelectPldHandle(current: CanvasContext | undefined) {
    const status = React.useContext(StatusContext)

    const onSelectHandle = React.useCallback(
        async (handles: string[], x: number, y: number) => {
            pushCommand({ name: 'selectPldHandle', value: { handle: handles[0], x, y } })
        },
        [current, status.document]
    )

    return onSelectHandle
}
