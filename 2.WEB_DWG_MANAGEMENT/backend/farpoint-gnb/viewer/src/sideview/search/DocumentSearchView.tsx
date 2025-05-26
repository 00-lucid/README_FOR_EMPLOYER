import React from 'react'
import { pushCommand } from '../..'
import './DocumentSearchView.css'
import { DocumentResult } from '../../types'
import { CloseResultView } from './CloseResultView'

type Props = {
    results: DocumentResult[]
    hidden: boolean
    onCloseView: () => void
}

export default function DocumentSearchView({ hidden, onCloseView, results }: Props) {
    const onItemClick = async (item: DocumentResult) => {
        pushCommand({
            name: 'requestOpenDocument',
            value: {
                selectedDocument: {
                    docKey: { docId: item.docId, docVer: item.docVer },
                    plantCode: item.plantCode
                },
                ok: () => {
                    pushCommand({ name: 'zoomExtents' })
                }
            }
        })
    }

    const getItems = (): JSX.Element[] => {
        const element: JSX.Element[] = []

        for (let result of results) {
            const resultColumn = (
                <tr className="RowItem" key={result.docId + result.docName} onClick={() => onItemClick(result)}>
                    <td className="First"> {result.docNumber} </td>
                    <td className="Second"> {result.docName} </td>
                    <td className="Third"> {result.hogi} </td>
                </tr>
            )

            element.push(resultColumn)
        }
        return element
    }

    const leftPos = 'var(--SearchMenuWidth)'
    const hiddenPos = 'calc(var(--DocumentSearchResultWidth) * -1)'
    const style = results.length === 0 || hidden ? { marginLeft: hiddenPos } : { marginLeft: leftPos }

    return (
        <div className="DocumentSearchView SideViewShadow" style={style}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">도면검색 결과 ({getItems().length} 건) </span>
            <CloseResultView />
            <div className="ListView">
                <table>
                    <thead className="Header">
                        <tr>
                            <th className="First">도면번호</th>
                            <th className="Second">도면명</th>
                            <th className="Third">호기</th>
                        </tr>
                    </thead>
                    <tbody>{getItems()}</tbody>
                </table>
            </div>
        </div>
    )
}
