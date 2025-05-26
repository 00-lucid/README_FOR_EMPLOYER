import React from 'react'
import './EquipmentSearchView.css'
import { useNavigate } from 'react-router-dom'
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil'
// 전역 Store
import { StatusStore, MarkUpStore, PMDCStore } from '../../../../Store/statusStore'
// Component
import { CloseSideMenuBtn } from '../../Component/CloseSideMenuBtn'
// Lib
import crypt from '../../../../Lib/crypt'
import commonFunc from '../../../../Lib/commonFunc'
import { global } from '../../../../Lib/util'

type Props = {
    results: EquipmentResult[]
    cnt: number
    hidden: boolean
}

export default function EquipmentSearchView({ hidden, cnt, results }: Props) {
    // 전역 Store
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)
    const isMarkupChanged = useRecoilValue(MarkUpStore.isMarkupChanged)
    const setIsShowMarkupPopup = useSetRecoilState(MarkUpStore.isShowMarkupPopup)
    const [controlMode, setControlMode] = useRecoilState(StatusStore.controlMode)
    const [isPMDC, setIsPMDC] = useRecoilState(PMDCStore.isPMDC)
    const setIsPMDCTagOn = useSetRecoilState(PMDCStore.isPMDCTagOn)
    const setSelPMDCEquipment = useSetRecoilState(PMDCStore.selPMDCEquipment)

    // 라우터 경로 이동을 위한 네비게이터
    const navigate = useNavigate()

    const onItemClick = React.useCallback(
        async (e: React.MouseEvent<HTMLElement>, item: EquipmentResult) => {
            if (e) e.stopPropagation()
            global.log('EquipmentSearchView onItemClick Click', item)
            if (controlMode === 'pmdc') {
                console.log("controlMode:", controlMode)
                setControlMode('select')
                setIsPMDC(false)
                setIsPMDCTagOn(false)
                setSelPMDCEquipment([])
            }
            // Event : MainView/Canvas/index.tsx -> 2. URL Params를 통해 도면 & 설비 설정
            commonFunc.changeDocument(
                crypt.encrypt(item.docId),
                crypt.encrypt(item.docVer),
                crypt.encrypt(item.plantCode),
                crypt.encrypt(item.tagId),
                isMarkupChanged,
                setIsShowMarkupPopup,
                navigate,
                setYesNoPopupValue
            )
        },
        [navigate, isMarkupChanged, setIsShowMarkupPopup, setYesNoPopupValue]
    )

    const getItems = (): JSX.Element[] => {
        const element: JSX.Element[] = []

        for (let result of results) {
            const resultColumn = (
                <tr className="RowItem" key={result.docId + result.tagId} onClick={(e) => onItemClick(e, result)}>
                    <td className="First"> {result.function} </td>
                    <td className="Second"> {result.docNumber} </td>
                    <td className="Third"> {result.hogi === '0' ? '공용' : result.hogi} </td>
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
            <span className="SideMenuLabel">
                설비검색 결과 ({results.length} 건) / 총 ({cnt} 건)
            </span>
            <CloseSideMenuBtn />
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
