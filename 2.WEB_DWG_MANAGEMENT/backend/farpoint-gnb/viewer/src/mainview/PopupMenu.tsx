import React from 'react'
import { pushCommand, StatusContext } from '..'
import './PopupMenu.css'

export function PopupMenu() {
    const status = React.useContext(StatusContext)

    const getPopupMenuItems = React.useMemo((): JSX.Element[] => {
        const elements: JSX.Element[] = []

        if (1 < status.equipmentLinks.length) {
            for (const link of status.equipmentLinks) {
                const isOpc = link.tagType === '002'

                if (isOpc) {
                    if (
                        link.opcDocId &&
                        link.opcDocVer &&
                        link.opcHogi &&
                        link.opcTagId &&
                        link.opcPlantCode &&
                        link.opcConnection
                    ) {
                        const title = `${link.opcHogi} ${link.opcConnection}`

                        elements.push(
                            <div
                                className="PopupItem"
                                key={link.opcDocId + link.opcDocVer + link.opcHogi}
                                onClick={() => {
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
                                                    value: { equipments }
                                                })
                                            }
                                        }
                                    })
                                }}
                            >
                                <div className="Text">{title}</div>
                            </div>
                        )
                    }
                } else {
                    if (link.equipmentLinkId && link.funcDetail && link.linkObject) {
                        const title = `${link.equipmentLinkId}(${link.linkObject})`

                        elements.push(
                            <div
                                className="PopupItem"
                                key={link.equipmentLinkId + link.funcDetail + link.linkObject}
                                onClick={() => {
                                    pushCommand({
                                        name: 'selectEquipmentLink',
                                        value: {
                                            equipments: [{ tagId: link.tagId }],
                                            equipmentLinks: [link]
                                        }
                                    })
                                }}
                            >
                                <div className="Text">{title}</div>
                            </div>
                        )
                    }
                }
            }
        }

        return elements
    }, [status.equipmentLinks])

    return (
        <div
            className="PopupMenu"
            tabIndex={3}
            hidden={status.equipmentLinks.length < 2}
            style={{ left: status.x + 'px', top: status.y + 'px' }}
        >
            {getPopupMenuItems}
        </div>
    )
}
