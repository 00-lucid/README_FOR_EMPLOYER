import React from 'react'
import './PldSearchView.css'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore, PldStore } from '../../../../../Store/statusStore'
// Component
import { CloseSideMenuBtn } from '../../../Component/CloseSideMenuBtn'
import { global } from '../../../../../Lib/util'
// Controller
import usePld from '../../../../../Controller/usePld'

export default function PldSearchView({ hidden, pldSearchResults }: { hidden: boolean; pldSearchResults: PldList[] }) {
    // 전역 Store
    const setDocAndMarkupResetActive = useSetRecoilState(StatusStore.docAndMarkupResetActive)
    const setPldResetActive = useSetRecoilState(StatusStore.pldResetActive)
    const isChangedPld = useRecoilValue(PldStore.isChangedPld)
    const [currentPld, setCurrentPld] = useRecoilState(PldStore.currentPld)
    const setWarningPopupValue = useSetRecoilState(StatusStore.warningPopupValue)

    // 상세보기 선택한 PLD
    const [openDoc, setOpenDoc] = React.useState('')

    // Pld Controller
    const usePldObj = usePld()

    const onDetailViewClick = async (item: PldList) => {
        const pldKey = item.PLD_C_ID + item.PLD_C_VR + item.PLD_P_NUMBER 
        setOpenDoc(openDoc !== pldKey ? pldKey : '')
    }

    const changePld = (item: PldList) => {
        setDocAndMarkupResetActive(true)
        setPldResetActive(true)

        const pldInfo = {
            PLD_C_ID: item.PLD_C_ID,
            PLD_C_VR: item.PLD_C_VR,
            COMPANY: { company: item.FOLPTNM, plant: item.FOLNM },
            PLD_P_NUMBER: item.PLD_P_NUMBER,
            PLD_P_NAME: item.PLD_P_NAME,
            PLD_C_NAME: item.PLD_C_NAME,
            FOLID: item.FOLID,
            FOLPT: item.FOLPT,
        }
        global.log('pldInfo::', pldInfo)
        setCurrentPld(pldInfo)
    }

    const onItemClick = (item: PldList) => {
        global.log('onItemClick:: 실행', item, currentPld)
        if (currentPld && currentPld.PLD_C_ID === item.PLD_C_ID) return

        if (isChangedPld) {
            const confirmValue = {
                title: 'PLD 모드',
                message: '현재 작업중인 PLD를 저장할까요?',
                submessage: '저장하지 않은 내용은 모두 취소됩니다.',
                yes: async () => {
                    usePldObj.savePld()
                },
                no: () => {
                    changePld(item)
                },
            }
            setWarningPopupValue(confirmValue)
        } else {
            changePld(item)
        }
    }

    // PLD 아이템 상세 정보
    const getDocItems = (docNm: String): JSX.Element[] => {
        let element: JSX.Element[] = []

        if (docNm != null && docNm.length > 0) {
            let results = docNm.split('/')

            element = results.map((docNmValue, index) => {
                return (
                    <React.Fragment key={index}>
                        <tr>
                            <td className="innerTd">{docNmValue}</td>
                        </tr>
                    </React.Fragment>
                )
            })
        }

        return element
    }

    const leftPos = 'var(--SearchMenuWidth)'
    const hiddenPos = 'calc(var(--PldSearchResultWidth) * -1)'
    const style = pldSearchResults.length === 0 || hidden ? { marginLeft: hiddenPos } : { marginLeft: leftPos }

    return (
        <div className="PldSearchView SideViewShadow" style={style}>
            <span className="SideMenuLabel">PLD 조회 결과 ({pldSearchResults.length} 건) </span>
            <CloseSideMenuBtn />
            <div className="ListView">
                <table className="Main">
                    <thead className="Header">
                        <tr className="RowItem">
                            <th className="First">발전소</th>
                            <th className="Second">절차서 번호</th>
                            <th className="Third">PLD명</th>
                            <th className="Fourth"></th>
                        </tr>
                    </thead>
                    {/* 조회 결과 리스트 */}
                    <tbody>
                        {pldSearchResults.map((result, index) => {
                            // 상세 영역 클래스명 분기
                            let classType = openDoc === result.PLD_C_ID + result.PLD_C_VR + result.PLD_P_NUMBER ? 'RowTable' : 'RowTable hidden'

                            // 날짜 포맷 정렬화
                            if (!result.REGDT.includes('/')) {
                                if (result.REGDT.includes('-')) {
                                    let tempDt = result.REGDT.split('-')
                                    result.REGDT = `${tempDt[0]}/${tempDt[1]}/${tempDt[2]}`
                                } else {
                                    let tempDt = result.REGDT
                                    result.REGDT = `${tempDt.substring(0, 4)}/${tempDt.substring(4, 6)}/${tempDt.substring(6, 8)}`
                                }
                            }

                            return (
                                <React.Fragment key={index}>
                                    <tr className="RowItem" onClick={() => onItemClick(result)}>
                                        <td> {`${result.FOLPTNM}  ${result.FOLNM}`} </td>
                                        <td> {result.PLD_C_NAME} </td>
                                        <td> {result.PLD_P_NUMBER} </td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <div className="DetailButton" onClick={() => onDetailViewClick(result)}>
                                                <div>상세</div>
                                            </div>
                                        </td>
                                    </tr>

                                    {
                                        // 상세 영역 표시 유무
                                        classType === 'RowTable' ? (
                                            <tr className={classType}>
                                                <td colSpan={4}>
                                                    <table className="Sub">
                                                        <thead></thead>
                                                        <tbody>
                                                            <tr className="First">
                                                                <td className="ColorType">PLD Name</td>
                                                                <td>{result.PLD_C_NAME}</td>
                                                                <td className="ColorType">버전</td>
                                                                <td>{result.PLD_C_VR}</td>
                                                            </tr>
                                                            <tr className="Second">
                                                                <td className="ColorType">PLD 설명</td>
                                                                <td className="LeftAlign" colSpan={3}>
                                                                    {result.PLD_C_DESC}
                                                                </td>
                                                            </tr>
                                                            <tr className="Third">
                                                                <td className="ColorType">절차서 No.</td>
                                                                <td>{result.PLD_P_NUMBER}</td>
                                                                <td className="ColorType">절차서 이름</td>
                                                                <td>{result.PLD_P_NAME}</td>
                                                            </tr>
                                                            <tr className="Fourth">
                                                                <td className="ColorType">등록일</td>
                                                                <td>{result.REGDT}</td>
                                                                <td className="ColorType">등록자</td>
                                                                <td>{result.USER_ID}</td>
                                                            </tr>
                                                            <tr className="Last">
                                                                <td className="ColorType">관련도면</td>
                                                                <td className="BothAlign" colSpan={3}>
                                                                    <table className="RelDrawing">
                                                                        <thead></thead>
                                                                        <tbody>{getDocItems(result.DOCNM)}</tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        ) : null
                                    }
                                </React.Fragment>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
