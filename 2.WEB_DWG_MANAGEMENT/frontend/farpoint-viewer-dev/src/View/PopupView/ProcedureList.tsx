import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { ProcedureStore } from '../../Store/statusStore'

type Props = {
    isList: boolean
    setIsList: any
}

const ProcedureList = ({ isList, setIsList }: Props) => {
    const [procedureSteps, setProcedureSteps] = useRecoilState(ProcedureStore.procedureSteps)

    return (
        <div className="procedure-container">
            <div className="procedure-header">{procedureSteps[0].PRONO}</div>
            <div
                className="procedure-table"
                style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                }}
            >
                <table>
                    <thead
                        style={{
                            position: 'sticky',
                            top: 0,
                            background: '#8e8e8e',
                        }}
                    >
                        <tr>
                            <th>작업순서</th>
                            <th>절차제목</th>
                            <th>설비명</th>
                            <th>PMDC센서</th>
                            <th>도면</th>
                        </tr>
                    </thead>
                    <tbody>
                        {procedureSteps.map((v: any) => {
                            return (
                                <>
                                    <tr>
                                        <td>{v.STPORDER}</td>
                                        <td>{v.PRONM}</td>
                                        <td>{v.FUNCTION}</td>
                                        <td>{v.PITAG}</td>
                                        <td>{v.DOCNUMBER}</td>
                                    </tr>
                                    <tr>
                                        <td
                                            style={{
                                                verticalAlign: 'top',
                                            }}
                                        >
                                            작업내용
                                        </td>
                                        <td
                                            colSpan={4}
                                            style={{
                                                paddingLeft: '15px',
                                                textAlign: 'start',
                                                whiteSpace: 'pre',
                                            }}
                                        >
                                            {v.STPDESC}
                                        </td>
                                    </tr>
                                </>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div
                className="procedure-footer"
                onClick={() => {
                    setIsList(false)
                }}
            >
                <div className="procedure-footer-btn">닫기</div>
            </div>
        </div>
    )
}

export default ProcedureList
