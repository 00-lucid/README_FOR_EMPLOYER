import './SignalSearchView.css'
import { CloseSideMenuBtn } from '../../Component/CloseSideMenuBtn'
import { useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore } from '../../../../Store/statusStore'

type Props = {
    results: SearchSignalResult[]
    cnt: number
    hidden: boolean
}

export default function SignalSearchView({ hidden, cnt, results }: Props) {
    // 전역 Store
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)

    const onItemClick = async (item: SearchSignalResult) => {
        const nameparts = item.FILENM.split('.')
        const ext = nameparts[1].toUpperCase()

        if (ext === 'HWP' || ext === 'JPG' || ext === 'XLS' || ext === 'PDF') {
            window.open(item.viewerUrl, 'FarpointExternalWindow')
        } else {
            setOkPopupValue({ message: `지원하지 않는 형식(${ext})입니다.`, ok: () => {} })
        }
    }

    const getItems = (): JSX.Element[] => {
        const element: JSX.Element[] = []

        for (let result of results) {
            const resultColumn = (
                <tr className="RowItem" key={result.SNO + result.TAG} onClick={() => onItemClick(result)}>
                    <td className="Column1"> {result.PLANTNM} </td>
                    <td className="Column2"> {result.DRAW_NM} </td>
                    <td className="Column3"> {result.TAG} </td>
                    <td className="Column4"> {result.PAGE} </td>
                </tr>
            )

            element.push(resultColumn)
        }
        return element
    }

    const leftPos = 'var(--SearchMenuWidth)'
    const hiddenPos = 'calc(var(--SignalSearchResultWidth) * -1)'
    const style = results.length === 0 || hidden ? { marginLeft: hiddenPos } : { marginLeft: leftPos }

    return (
        <div className="SignalSearchView SideViewShadow" style={style}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">
                시그널검색 결과 ({results.length} 건) / 총 ({cnt} 건)
            </span>
            <CloseSideMenuBtn />
            <div className="ListView">
                <table>
                    <thead className="Header">
                        <tr>
                            <th className="Column1">사업소</th>
                            <th className="Column2">도면명</th>
                            <th className="Column3">태그</th>
                            <th className="Column4">페이지</th>
                        </tr>
                    </thead>
                    <tbody>{getItems()}</tbody>
                </table>
            </div>
        </div>
    )
}
