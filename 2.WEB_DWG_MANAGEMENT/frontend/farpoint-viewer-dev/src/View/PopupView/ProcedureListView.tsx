import { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { MarkUpStore, ProcedureStore, StatusStore, WCDStore, PMDCStore } from '../../Store/statusStore'
import commonFunc from '../../Lib/commonFunc'
import crypt from '../../Lib/crypt'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ProcedurePopup from './ProcedurePopup'
import './ProcedureListView.css'
import ProcedureList from './ProcedureList'
import ProcedureManager from './ProcedureManager'

type Props = {
    viewer: any
    markupCanvas: any
    getPMDCUserListPopup: any
}

const ProcedureListView = ({ viewer, markupCanvas, getPMDCUserListPopup }: Props) => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)
    const isMarkupChanged = useRecoilValue(MarkUpStore.isMarkupChanged)
    const setIsShowMarkupPopup = useSetRecoilState(MarkUpStore.isShowMarkupPopup)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const docId = selectedCanvas?.documentCtx.docId
    const docVer = selectedCanvas?.documentCtx.docVer
    const setIsRelativeDoc = useSetRecoilState(WCDStore.isRelativeDoc)

    const [controlMode, setControlMode] = useRecoilState(StatusStore.controlMode)
    const [isPMDC, setIsPMDC] = useRecoilState(PMDCStore.isPMDC)
    const setIsPMDCTagOn = useSetRecoilState(PMDCStore.isPMDCTagOn)
    const setSelPMDCEquipment = useSetRecoilState(PMDCStore.selPMDCEquipment)

    const [procedureSteps, setProcedureSteps] = useRecoilState(ProcedureStore.procedureSteps)
    const [selProcedureEquipments, setSelProcedureEquipments] = useRecoilState(ProcedureStore.selProcedureEquipments)
    const [isFix, setIsFix] = useRecoilState(ProcedureStore.isFix)

    const [isList, setIsList] = useState(false)
    const [docList, setDocList] = useState<any>([])

    const onClose = () => {
        setProcedureSteps([])
        setSelProcedureEquipments([])
        setControlMode('select')
    }

    useEffect(() => {
        procedureSteps.filter((item: any) => {
            let result = procedureSteps.filter((item: any, i: number) => {
                return (
                    procedureSteps.findIndex((item2: any, j: number) => {
                        return item.DOCNUMBER === item2.DOCNUMBER
                    }) === i
                )
            })
            setDocList(result)
        })
    }, [])

    return (
        <>
            <div className="ProcedureView">
                <div>
                    <div className="OrderListFlagTitlebar">
                        <div className="Text">작업절차 관리서</div>
                    </div>
                    <div className="Subtitlebar">
                        <div className="Text">{procedureSteps[0].PRONO}</div>
                        <div className="Text">{procedureSteps[0].PRONM}</div>
                    </div>
                    <div className="Buttons">
                        <div
                            className="Icon"
                            onClick={() => {
                                setIsList(true)
                            }}
                        >
                            <div>{svg()}</div>
                            <div style={{ marginBottom: '5px' }}>절차목록 보기</div>
                        </div>
                        <div
                            className="Icon"
                            onClick={() => {
                                setIsFix(true)
                            }}
                        >
                            <div>{svg()}</div>
                            <div style={{ marginBottom: '5px' }}>수정하기</div>
                        </div>
                    </div>
                    <div className="ListView">
                        <table style={{ maxWidth: '800px' }}>
                            <thead className="Header">
                                <tr>
                                    <th className="Item">참조도면</th>
                                </tr>
                            </thead>
                            <tbody>
                                {docList.map((v: any) => {
                                    return (
                                        <tr
                                            key={v.STPORDER}
                                            className="RowItem"
                                            onClick={() => {
                                                console.log('row:', v)
                                                if (v.DOCNO && crypt.decrypt(searchParams.get('drawing')) !== v.DOCNO) {
                                                    setIsRelativeDoc(true)
                                                    if (controlMode === 'pmdc') {
                                                        console.log("controlMode:", controlMode)
                                                        setControlMode('select')
                                                        setIsPMDC(false)
                                                        setIsPMDCTagOn(false)
                                                        setSelPMDCEquipment([])
                                                    }
                                                    commonFunc.changeDocument(
                                                        crypt.encrypt(v.DOCNO),
                                                        crypt.encrypt(v.DOCVR),
                                                        crypt.encrypt(v.PLANTCODE),
                                                        undefined,
                                                        isMarkupChanged,
                                                        setIsShowMarkupPopup,
                                                        navigate,
                                                        setYesNoPopupValue
                                                    )
                                                }
                                            }}
                                        >
                                            <td className="Item" style={{ padding: '0px 0px 0px 5px' }}>
                                                {docId == v.DOCNO && docVer == v.DOCVR && '▶'}
                                            </td>
                                            <td className="Item" style={{ textAlign: 'left' }}>
                                                <span className="DocNo">{v.DOCNUMBER}</span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        <div className="Footer">
                            <div className="CancelLoadButton" onClick={onClose}>
                                <div className="Text">나가기</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {selProcedureEquipments.length > 0 &&
                selProcedureEquipments.map((v: any, i: number) => {
                    const value = procedureSteps.filter((item: any) => item.FUNCTION === v.function)
                    return (
                        <ProcedurePopup
                            key={value[0].STPORDER}
                            i={i}
                            x={v.x}
                            y={v.y}
                            viewer={viewer}
                            markupCanvas={markupCanvas}
                            value={value[0]}
                            getPMDCUserListPopup={getPMDCUserListPopup}
                        />
                    )
                })}
            {isList && <ProcedureList isList={isList} setIsList={setIsList} />}
            {isFix && <ProcedureManager />}
        </>
    )
}

const svg = () => {
    return (
        <svg
            width="36"
            height="36"
            viewBox="0 0 566.93 566.93"
            xmlns="http://www.w3.org/2000/svg"
            // fill="#4A70F7"
            fill="var(--Menu-Toolbar-Item-Stroke)"
            fillOpacity=".9"
            stroke="var(--Menu-Toolbar-Item-Stroke)"
        >
            <path d="M186.37,482c-7.69-3.52-10.05-9.74-9.64-17.82.39-7.61.09-7.62-7.65-7.62-3.25,0-6.49,0-9.73,0-8.12,0-13.56-5.25-13.95-13.36-.05-1,0-2,0-3q0-133,0-266a14.93,14.93,0,0,1,.44-5.18,5.63,5.63,0,0,1,10.7-.05,14.93,14.93,0,0,1,.46,5.18q0,132.84,0,265.67c0,5.56,0,5.56,5.44,5.56H394.81c5,0,5,0,5-4.86q0-147.61.07-295.23c0-3.11-.73-3.83-3.83-3.83q-117.68.15-235.36,0c-3.18,0-3.92.81-3.78,3.87.19,4.36-2.09,6.86-5.59,6.94-3.65.09-5.92-2.51-5.94-7-.05-10.85-.11-21.7,0-32.55.1-8.38,5.63-13.79,13.87-13.79q94.85,0,189.7,0c4.81,0,7.86,2.7,7.1,6.42-.55,2.65-2.14,4.48-5,4.76-1.11.11-2.24,0-3.36,0H162.12c-5.1,0-5.11,0-5.11,5.14a107.61,107.61,0,0,1-.09,11.22c-.37,3.56,1.09,3.93,4.14,3.91,20.7-.13,41.41-.06,62.11-.06q86.43,0,172.87.07c3,0,4.1-.61,3.86-3.8a124.25,124.25,0,0,1,0-13.09c.08-2.66-1-3.47-3.54-3.43-7.11.12-14.22.06-21.33,0-4,0-6.57-2.17-6.66-5.48s2.58-5.72,6.79-5.73q11.22,0,22.45,0c8.06,0,13.53,5.3,13.85,13.45.13,3.24.12,6.49,0,9.73-.07,1.81.51,2.34,2.31,2.3,5.11-.11,10.22-.06,15.34,0,7.78,0,13.11,5,13.79,12.75.08,1,0,2,0,3V430.76a13.76,13.76,0,0,1-.44,4.81,5.67,5.67,0,0,1-10.71.11,14.2,14.2,0,0,1-.46-5.18q0-129.64.08-259.3c0-3.71-1-4.64-4.47-4.34a86.94,86.94,0,0,1-12,0c-2.66-.15-3.64.41-3.54,3.37.25,7.72.08,15.46.08,23.19V441.15c0,7.92-3.11,12.7-9.39,14.87a16.32,16.32,0,0,1-5.54.52q-102,0-203.92-.06c-3.33,0-4.66.71-4.21,4.18a43.27,43.27,0,0,1,0,7.11c-.09,2.29,1,3.19,3.15,3,.62,0,1.25,0,1.87,0H426.17c5.08,0,5.08,0,5.09-5.17,0-2.49-.12-5,.05-7.48.24-3.4,2.66-5.84,5.61-5.93a6,6,0,0,1,5.91,6c.17,3.73.17,7.49,0,11.22-.33,6.26-4.3,9.9-9.48,12.57Z" />
            <path d="M324.46,205c-14.82,0-29.65,0-44.47,0-5.49,0-8.54-3.63-6.81-7.9,1.09-2.68,3.29-3.61,5.95-3.66,3.36-.06,6.73,0,10.09,0h77c.75,0,1.5,0,2.24,0,5,0,8,2.28,7.89,5.92s-3,5.67-7.78,5.67Z" />
            <path d="M324.37,181.15c-15.2,0-30.4,0-45.6,0-3.43,0-5.45-1.74-6-4.94a5.22,5.22,0,0,1,3.51-5.91,8.91,8.91,0,0,1,3.28-.38H369.3c4.33,0,6.93,2,7,5.46s-2.62,5.76-7.12,5.76Z" />
            <path d="M324.28,406.4H279.81c-4.48,0-7.24-2.27-7.15-5.79s2.65-5.5,7-5.5q44.83,0,89.69,0c4.31,0,6.93,2.18,7,5.57s-2.7,5.72-7.21,5.72Z" />
            <path d="M324.4,294.21q22.61,0,45.22,0c2.72,0,4.82.87,6.1,3.4a5.21,5.21,0,0,1-.53,5.62c-1.32,2-3.36,2.41-5.56,2.42H281.44c-5.92,0-8.78-1.87-8.78-5.7s2.91-5.73,8.77-5.73Z" />
            <path d="M324.39,270.59h43a33.13,33.13,0,0,1,3.73.12,5.36,5.36,0,0,1,5.16,5.4c.16,3.12-1.8,5.06-4.76,5.83a11.79,11.79,0,0,1-3,.15h-88.2c-.5,0-1,0-1.49,0-3.57-.25-6.15-2.66-6.17-5.76s2.45-5.62,6.14-5.69c7.09-.14,14.2-.06,21.3-.06Z" />
            <path d="M324.73,371.32q22.42,0,44.85,0c4,0,6.59,2.23,6.76,5.5s-2.41,5.67-6.29,6c-1.12.08-2.24,0-3.36,0H302.78c-8,0-15.95,0-23.92,0-3.25,0-5.54-1.63-6.05-4.94-.43-2.75.92-4.74,3.43-6a8.53,8.53,0,0,1,4-.54Z" />
            <rect x="185.9" y="161.07" width="54.05" height="54.05" rx="12" />
            <rect x="185.54" y="260.31" width="54.05" height="54.05" rx="12" />
            <rect x="186.54" y="359.31" width="54.05" height="54.05" rx="12" />

            {/* <g fillRule="evenodd" fill="none" transform="matrix(0.77777785 0 0 0.77777785 0 0)">
                    <path
                        d="M13.748 12.896L4.075 14.302L11.075 21.125L9.423 30.758999L18.073 26.210999L26.727001 30.758999L25.074001 21.125L32.074 14.302L22.401001 12.896L18.074001 4.13L13.748 12.896z"
                        fill="#4A70F7"
                        fillOpacity=".9"
                    />
                    <path
                        d="M4.074 14.301L13.747999 12.8949995L18.074999 4.1289997L22.401 12.8949995L32.074997 14.301L25.074997 21.124L26.726997 30.759L18.074997 26.210001L9.4229965 30.760002L11.074997 21.124002L4.074 14.301z"
                        stroke="#4A70F7"
                    />
                </g> */}
        </svg>
    )
}

export default ProcedureListView
