import React from 'react'
import { AppContext, StatusContext, pushCommand } from '../..'
import './PldSearchView.css'
import { PldList } from '../../types'
import { ClosePldResultView } from './ClosePldResultView'
import { getCurDocumentPldSeq, resetPldData } from '../../mainview/canvas/Pld/PldUtil'

type Props = {
    results: PldList[]
    hidden: boolean
    onCloseView: () => void
}

export default function PldSearchView({ hidden, onCloseView, results }: Props) {
    const status = React.useContext(StatusContext)

    //상세보기 선택한 Doc
    const [openDoc, setOpenDoc] = React.useState('')
    const app = React.useContext(AppContext)

    const onItemClick = (item: PldList) => {
        if (status.isChanged && app.currentPld) {
            const confirmValue = {
                title: 'PLD 모드',
                message: '현재 작업중인 PLD를 저장할까요?',
                submessage: '저장하지 않은 내용은 모두 취소됩니다.',
                yes: async () => {
                    const cSeq = getCurDocumentPldSeq(status, app)

                    pushCommand({ name: 'savePld', value: { currentPld: app.currentPld, cSeq } })

                    const pldInfo = {
                        PLD_C_ID: item.PLD_C_ID,
                        PLD_C_VR: item.PLD_C_VR,
                        COMPANY: { company: item.FOLPTNM, plant: item.FOLNM },
                        PLD_P_NUMBER: item.PLD_P_NUMBER,
                        PLD_P_NAME: item.PLD_P_NAME,
                        PLD_C_NAME: item.PLD_C_NAME,
                        FOLID: item.FOLID,
                        FOLPT: item.FOLPT
                    }

                    resetPldData(app)

                    app.setCurrentPld(pldInfo)
                },
                no: () => {
                    resetPldData(app)

                    const pldInfo = {
                        PLD_C_ID: item.PLD_C_ID,
                        PLD_C_VR: item.PLD_C_VR,
                        COMPANY: { company: item.FOLPTNM, plant: item.FOLNM },
                        PLD_P_NUMBER: item.PLD_P_NUMBER,
                        PLD_P_NAME: item.PLD_P_NAME,
                        PLD_C_NAME: item.PLD_C_NAME,
                        FOLID: item.FOLID,
                        FOLPT: item.FOLPT
                    }
                    app.setCurrentPld(pldInfo)
                }
            }

            pushCommand({ name: 'showWarningView', value: confirmValue })
        } else {
            resetPldData(app)

            const pldInfo = {
                PLD_C_ID: item.PLD_C_ID,
                PLD_C_VR: item.PLD_C_VR,
                COMPANY: { company: item.FOLPTNM, plant: item.FOLNM },
                PLD_P_NUMBER: item.PLD_P_NUMBER,
                PLD_P_NAME: item.PLD_P_NAME,
                PLD_C_NAME: item.PLD_C_NAME,
                FOLID: item.FOLID,
                FOLPT: item.FOLPT
            }
            app.setCurrentPld(pldInfo)
        }
    }

    const onDetailViewClick = async (item: PldList) => {
        setOpenDoc(openDoc !== item.PLD_C_ID + item.PLD_C_VR ? item.PLD_C_ID + item.PLD_C_VR : '')
    }

    const getItems = (): JSX.Element[] => {
        const element: JSX.Element[] = []

        for (let result of results) {
            // 상세 영역 클래스명 분기
            const classType = openDoc === result.PLD_C_ID + result.PLD_C_VR ? 'RowTable' : 'RowTable hidden'

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

            // 상세 영역 표시 유무
            if (classType !== 'RowTable') {
                const resultColumn = (
                    <>
                        <tr className="RowItem" key={result.PLD_C_NAME} onClick={() => onItemClick(result)}>
                            <td> {`${result.FOLPTNM}  ${result.FOLNM}`} </td>
                            <td> {result.PLD_C_NAME} </td>
                            <td> {result.PLD_P_NUMBER} </td>
                            <td onClick={(e) => e.stopPropagation()}>
                                <div className="DetailButton" onClick={() => onDetailViewClick(result)}>
                                    <div>상세</div>
                                </div>
                            </td>
                        </tr>
                    </>
                )
                element.push(resultColumn)
            } else {
                const resultColumn = (
                    <>
                        <tr className="RowItem" key={result.PLD_C_NAME} onClick={() => onItemClick(result)}>
                            <td> {`${result.FOLPTNM}  ${result.FOLNM}`} </td>
                            <td> {result.PLD_C_NAME} </td>
                            <td> {result.PLD_P_NUMBER} </td>
                            <td onClick={(e) => e.stopPropagation()}>
                                <div className="DetailButton" onClick={() => onDetailViewClick(result)}>
                                    <div>상세</div>
                                </div>
                            </td>
                        </tr>
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
                    </>
                )
                element.push(resultColumn)
            }
        }
        return element
    }

    const getDocItems = (docNm: String): JSX.Element[] => {
        const element: JSX.Element[] = []

        if (docNm != null && docNm.length > 0) {
            let result = docNm.split('/')
            for (let docNm of result) {
                const resultColumn = (
                    <>
                        <tr key={docNm}>
                            <td className="innerTd">{docNm}</td>
                        </tr>
                    </>
                )
                element.push(resultColumn)
            }
        }
        return element
    }

    const leftPos = 'var(--SearchMenuWidth)'
    const hiddenPos = 'calc(var(--PldSearchResultWidth) * -1)'
    const style = results.length === 0 || hidden ? { marginLeft: hiddenPos } : { marginLeft: leftPos }

    return (
        <div className="PldSearchView SideViewShadow" style={style}>
            <span className="SideMenuLabel">PLD 조회 결과 ({getItems().length} 건) </span>
            <ClosePldResultView />
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
                    <tbody>{getItems()}</tbody>
                </table>
            </div>
        </div>
    )
}
