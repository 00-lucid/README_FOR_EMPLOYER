import React from 'react'
import './NotiorderView.css'
import { Notiorder, EquipmentNotiorder } from '../../types'
import { CloseResultView } from './CloseResultView'
import Repository from '../../Repository'

type Props = {
    notiorder: EquipmentNotiorder | undefined
    notiorderType: string | undefined
    hidden: boolean
    onCloseView: () => void
}

export function NotiorderView({ hidden, onCloseView, notiorder, notiorderType }: Props) {
    const onItemClick = async (item: Notiorder) => {
        let url: string | undefined

        if (item.type === 'order') {
            url = await Repository.getOrderUrl(item.id)
        } else if (item.type === 'noti') {
            url = await Repository.getNoticeUrl(item.id)
        }

        if (url) window.open(url, 'FarpointExternalWindow')
    }

    const getItems = (): JSX.Element[] => {
        const element: JSX.Element[] = []

        let items: Notiorder[] = []

        if (notiorderType && notiorder) {
            if (notiorderType === 'order') {
                items = notiorder.orders
            } else if (notiorderType === 'noti') {
                items = notiorder.notifications
            }
        }

        for (let result of items) {
            const resultColumn = (
                <tr className="RowItem" key={result.id} onClick={() => onItemClick(result)}>
                    <td className="First"> {result.taskType} </td>
                    <td className="Column2"> {result.id} </td>
                    <td className="Column3"> {result.detail} </td>
                    <td className="Column4"> {result.startDate} </td>
                    <td className="Column5"> {result.endDate} </td>
                    <td className="Last"> {result.status} </td>
                </tr>
            )

            element.push(resultColumn)
        }
        return element
    }

    const leftPos = 'var(--NotiorderMenuWidth)'
    const hiddenPos = 'calc(var(--NotiorderViewWidth) * -1)'
    const style = notiorder === undefined || hidden ? { marginLeft: hiddenPos } : { marginLeft: leftPos }

    return (
        <div className="NotiorderView SideViewShadow" style={style}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">통지/오더 목록 ({getItems().length} 건) </span>
            <CloseResultView />
            <div className="ListView">
                <table>
                    <thead className="Header">
                        <tr>
                            <th className="First">분류</th>
                            <th className="Column2">번호</th>
                            <th className="Column3">상세</th>
                            <th className="Column4">시작</th>
                            <th className="Column5">종료</th>
                            <th className="Last">상태</th>
                        </tr>
                    </thead>
                    <tbody>{getItems()}</tbody>
                </table>
            </div>
        </div>
    )
}
