import React from 'react'
import Repository from '../../Repository'
import { EquipmentKey, EquipmentLink, StatusContext, pushCommand } from '../..'
import { CanvasContext } from '../useCanvasContext'

export function useOnSelectHandle(current: CanvasContext | undefined, controlMode: string) {
    const status = React.useContext(StatusContext)

    const onSelectHandle = React.useCallback(
        async (handles: string[], x: number, y: number, controlMode: string) => {
            const allEquipments: EquipmentKey[] = []
            const equipmentLinks: EquipmentLink[] = []
            if (current && status.document) {
                for (const handle of handles) {
                    const equipments = current.equipmentsByHandle.get(handle)

                    if (equipments) {
                        allEquipments.push(...equipments)

                        const links = await Repository.getEquipmentLinks(
                            status.document.docKey,
                            status.document.plantCode,
                            handle
                        )

                        if (1 === links.length) {
                            const link = links[0]
                            const isOpc = link.tagType === '002'

                            //이거 루프 밖으로 빼라. 마지막에 체크하는게 맞다.
                            if (isOpc) {
                                if (link.opcDocId && link.opcDocVer && link.opcPlantCode && link.opcTagId) {
                                    pushCommand({
                                        name: 'requestOpenDocument',
                                        value: {
                                            selectedDocument: {
                                                docKey: { docId: link.opcDocId, docVer: link.opcDocVer },
                                                plantCode: link.opcPlantCode
                                            },
                                            ok: () => {
                                                const equipments = [{ tagId: link.opcTagId }]

                                                pushCommand({
                                                    name: 'selectEquipment',
                                                    value: { equipments, equipmentLinks: [] }
                                                })
                                                pushCommand({ name: 'zoomEntity', value: { equipments } })
                                            }
                                        }
                                    })

                                    return
                                }
                            } else {
                                equipmentLinks.push(link)
                            }
                        } else if (1 < links.length) {
                            equipmentLinks.push(...links)
                        }
                    }
                }
            }
            console.log('controlMode:', controlMode)
            if (controlMode == 'select')
                pushCommand({ name: 'selectHandle', value: { equipments: allEquipments, x, y, equipmentLinks } })
            else if (controlMode == 'wcd') {
                pushCommand({ name: 'selectWCDHandle', value: { equipments: allEquipments, x, y } })
            }
        },
        [current, status.document, controlMode]
    )

    return onSelectHandle
}
