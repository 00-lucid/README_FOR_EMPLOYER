import { useRecoilValue, useSetRecoilState } from 'recoil'
import { getNoticeUrl, getOrderUrl } from '../../../../Api/notiorder'
import commonActive from '../../../../Controller/useCommonActive'
import AppStore from '../../../../Store/appStore'
import { StatusStore } from '../../../../Store/statusStore'
import './NotiorderView.css'

type Props = {
    notiorder: EquipmentNotiOrder | undefined
    notiorderType: string | undefined
    hidden: boolean
    onCloseView: () => void
}

export function NotiorderView({ hidden, onCloseView, notiorder, notiorderType }: Props) {
    const userId = useRecoilValue(AppStore.userId)
    const setCurrentMenu = useSetRecoilState(StatusStore.currentMenu)

    // 통지 오더 목록 클릭
    const onItemClick = async (item: NotiOrder) => {
        let url: string | undefined

        if (item.type === 'order') {
            url = await getOrderUrl(item.id, item.tplnr)
        } else if (item.type === 'noti') {
            url = await getNoticeUrl(item.id, item.tplnr)
        }

        if (url) window.open(url, 'FarpointExternalWindow')
    }

    const getItems = (): JSX.Element[] => {
        const element: JSX.Element[] = []

        let items: NotiOrder[] = []

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
            <svg className="CloseSideMenu" onClick={() => commonActive.onMenuChange('notiorder', userId, setCurrentMenu)}>
                <path d="M19.908 5.167a.5.5 0 0 1-.038.706L5.875 18.426c-.407.366-.676.82-.785 1.315H36.5a.5.5 0 0 1 0 1l-31.41.001c.11.494.379.949.785 1.313L19.87 34.61a.5.5 0 1 1-.668.744L5.207 22.8c-.704-.63-1.113-1.463-1.165-2.36a.498.498 0 0 1-.001-.396l-.005.198c0-.973.416-1.88 1.171-2.559L19.202 5.128a.498.498 0 0 1 .706.04z" />
            </svg>
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
