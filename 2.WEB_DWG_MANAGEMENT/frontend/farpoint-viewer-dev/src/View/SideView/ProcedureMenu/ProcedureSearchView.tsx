import React from 'react'
import './ProcedureSearchView.css'
import { useNavigate } from 'react-router-dom'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore, MarkUpStore, ProcedureStore } from '../../../Store/statusStore'
// Component
import { CloseSideMenuBtn } from '../Component/CloseSideMenuBtn'
// Lib
import crypt from '../../../Lib/crypt'
import commonFunc from '../../../Lib/commonFunc'
import AppStore from '../../../Store/appStore'
import Api from '../../../Api'

type Props = {
    results: any
    hidden: boolean
}

export const ProcedureSearchView = ({ hidden, results }: Props) => {
    // 전역 Store
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)
    const isMarkupChanged = useRecoilValue(MarkUpStore.isMarkupChanged)
    const userId = useRecoilValue(AppStore.userId)
    const setIsShowMarkupPopup = useSetRecoilState(MarkUpStore.isShowMarkupPopup)
    const setBanner = useSetRecoilState(StatusStore.banner)
    const [controlMode, setControlMode] = useRecoilState(StatusStore.controlMode)
    const [isHideSide, setIsHideSide] = useRecoilState(ProcedureStore.isHideSide)
    const [procedureSteps, setProcedureSteps] = useRecoilState(ProcedureStore.procedureSteps)
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)

    // 라우터 경로 이동을 위한 네비게이터
    const navigate = useNavigate()

    const onItemClick = React.useCallback(
        async (e: React.MouseEvent<HTMLElement>, item: any) => {
            if (e) e.stopPropagation()
            setBanner(`검색 중...`)
            console.log('ProcedureSerachView onItemClick 함수', item)
            const res = await Api.procedure.getProcedureRead(userId!, item.PROID)
            console.log('해당작업절차', res)
            if (res?.STEPS.length > 0) {
                const arr = res?.STEPS.map((v: any) => {
                    return { ...v, PRONO: res.PRONO, PRONM: res.PRONM, GUBUN: res.gubun }
                })
                setProcedureSteps(arr)
                setControlMode('procedure')
                setIsHideSide(true)
                commonFunc.changeDocument(
                    crypt.encrypt(arr[0].DOCNO),
                    crypt.encrypt(arr[0].DOCVR),
                    crypt.encrypt(arr[0].PLANTCODE),
                    undefined,
                    isMarkupChanged,
                    setIsShowMarkupPopup,
                    navigate,
                    setYesNoPopupValue
                )
            } else {
                setOkPopupValue({
                    message: '오류가 발생했습니다',
                    ok: () => {},
                })
            }
            setBanner(undefined)
        },
        [navigate, isMarkupChanged, setIsShowMarkupPopup, setYesNoPopupValue, setControlMode, userId, setIsHideSide]
    )

    const getItems = (): JSX.Element[] => {
        const element: JSX.Element[] = []
        for (let result of results) {
            const resultColumn = (
                <tr className="RowItem" key={result.PROID} onClick={(e) => onItemClick(e, result)}>
                    <td className="First"> {result.PATH} </td>
                    <td className="Second"> {result.PRONO} </td>
                    <td className="Third"> {result.PRONM} </td>
                </tr>
            )
            element.push(resultColumn)
        }

        return element
    }

    const leftPos = 'var(--SearchMenuWidth)'
    const hiddenPos = 'calc(var(--DocumentSearchResultWidth) * -1)'
    const style = results.length === 0 || hidden || isHideSide ? { marginLeft: hiddenPos } : { marginLeft: leftPos }

    return (
        <div className="DocumentSearchView SideViewShadow" style={style}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">작업절차관리서검색 결과 ({results.length} 건) </span>
            <CloseSideMenuBtn />
            <div className="ListView">
                <table>
                    <thead className="Header">
                        <tr>
                            <th className="First">유형</th>
                            <th className="Second">문서번호</th>
                            <th className="Third">문서명</th>
                        </tr>
                    </thead>
                    <tbody>{getItems()}</tbody>
                </table>
            </div>
        </div>
    )
}
