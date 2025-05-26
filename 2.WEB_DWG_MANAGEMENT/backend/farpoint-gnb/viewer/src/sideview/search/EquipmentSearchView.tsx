import React from 'react'
import './EquipmentSearchView.css'
import { EquipmentResult, pushCommand } from '../..'
import { CloseResultView } from './CloseResultView'

type Props = {
    results: EquipmentResult[]
    hidden: boolean
    onCloseView: () => void
}

export default function EquipmentSearchView({ hidden, onCloseView, results }: Props) {
    const onItemClick = async (item: EquipmentResult) => {
        pushCommand({
            name: 'requestOpenDocument',
            value: {
                selectedDocument: {
                    docKey: { docId: item.docId, docVer: item.docVer },
                    plantCode: item.plantCode
                },
                ok: () => {
                    pushCommand({
                        name: 'selectEquipment',
                        value: { equipments: [{ tagId: item.tagId }], equipmentLinks: [] }
                    })
                    pushCommand({ name: 'zoomEntity', value: { equipments: [{ tagId: item.tagId }] } })
                }
            }
        })
    }

    const getItems = (): JSX.Element[] => {
        const element: JSX.Element[] = []

        for (let result of results) {
            const resultColumn = (
                <tr className="RowItem" key={result.docId + result.tagId} onClick={() => onItemClick(result)}>
                    <td className="First"> {result.function} </td>
                    <td className="Second"> {result.docNumber} </td>
                    <td className="Third"> {result.hogi} </td>
                </tr>
            )

            element.push(resultColumn)
        }
        return element
    }

    const leftPos = 'var(--SearchMenuWidth)'
    const hiddenPos = 'calc(var(--EquipmentSearchResultWidth) * -1)'
    const style = results.length === 0 || hidden ? { marginLeft: hiddenPos } : { marginLeft: leftPos }

    return (
        <div className="EquipmentSearchView SideViewShadow" style={style}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">설비검색 결과 ({getItems().length} 건)</span>
            <CloseResultView />
            <div className="ListView">
                <table>
                    <thead className="Header">
                        <tr>
                            <th className="First">태그</th>
                            <th className="Second">도면번호</th>
                            <th className="Third">호기</th>
                        </tr>
                    </thead>
                    <tbody>{getItems()}</tbody>
                </table>
            </div>
        </div>
    )
}
