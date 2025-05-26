import { useEffect, useState, useCallback } from 'react'
import { constSelector, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { ProcedureStore, StatusStore } from '../../Store/statusStore'
import './ProcedureManager.css'
import Select from '../CommonView/Select'
import Api from '../../Api'
import { TextField } from '../CommonView/TextField'
import ProcedureAdd from './ProcedureAdd'
import AppStore from '../../Store/appStore'

const ProcedureManager = () => {
    const userId = useRecoilValue(AppStore.userId)
    const [procedureSteps, setProcedureSteps] = useRecoilState(ProcedureStore.procedureSteps)
    const [isProcedureManagerVisible, setIsProcedureManagerVisible] = useRecoilState(ProcedureStore.isProcedureManagerVisible)
    const [isHideSide, setIsHideSide] = useRecoilState(ProcedureStore.isHideSide)
    const [isFix, setIsFix] = useRecoilState(ProcedureStore.isFix)
    const [tempStep, setTempStep] = useRecoilState(ProcedureStore.tempStep)
    const [isStepFix, setIsStepFix] = useRecoilState(ProcedureStore.isStepFix)
    const [procedureSourceInfo, setProcedureSourceInfo] = useRecoilState(ProcedureStore.procedureSourceInfo)

    const [companyValue, setCompanyValue] = useRecoilState(StatusStore.companyValue)
    const [plantValue, setPlantValue] = useRecoilState(StatusStore.plantValue)
    const [hogiValue, setHogiValue] = useRecoilState(StatusStore.hogiValue)
    const documentList = useRecoilValue(StatusStore.documentList)
    const companyItems = useRecoilValue(StatusStore.companyItems)
    const [plantItems, setPlantItems] = useRecoilState(StatusStore.plantItems)
    const [hogiItems, setHogiItems] = useRecoilState(StatusStore.hogiItems)
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)

    const mapFolderList = useRecoilValue(StatusStore.mapFolderList)
    const mapDocItemList = useRecoilValue(StatusStore.mapDocItemList)

    const [procedureNum, setProcedureNum] = useState('')
    const [procedureName, setProcedureName] = useState('')
    const [addMode, setAddMode] = useState<boolean>(false)

    useEffect(() => {
        setTempStep([...procedureSteps])
    }, [procedureSteps])

    useEffect(() => {
        if (isFix) {
            setProcedureNum(procedureSteps[0].PRONO)
            setProcedureName(procedureSteps[0].PRONM)
            let obj = { ...procedureSteps[0].GUBUN }
            setCompanyValue(obj.site)
            setProcedureSourceInfo(obj.site.text)
            const newPlantItems = mapFolderList.get(obj.site.value)
            if (newPlantItems) setPlantItems(newPlantItems)
            setPlantValue(obj.bal)
            const newHogiItems = mapFolderList.get(obj.bal.value)
            if (newHogiItems) {
                setHogiItems(newHogiItems)
                setHogiValue(obj.hogi)
            }
        }
    }, [])

    useEffect(() => {
        console.log('스텝', tempStep)
    }, [tempStep])

    return (
        <>
            <div className="procedure-container">
                <div className="procedure-header">{isFix ? '절차서 수정' : '신규 절차서 등록'}</div>
                <div className="procedure-body">
                    <div className="procedure-input-body">
                        <div className="procedure-input">
                            <div className="procedure-input-div">절차서 번호</div>
                            <TextField
                                id="DocNumberControl"
                                value={procedureNum}
                                placeHolder="절차서번호"
                                onChange={(value: string) => {
                                    setProcedureNum(value)
                                }}
                            />
                        </div>

                        <div className="procedure-input">
                            <div className="procedure-input-div">절차서 이름</div>
                            <TextField
                                id="DocNameControl"
                                value={procedureName}
                                placeHolder="절차서이름"
                                onChange={(value: string) => {
                                    setProcedureName(value)
                                }}
                            />
                        </div>

                        <div className="procedure-select">
                            <div className="procedure-select-div">구분</div>
                            <Select
                                id="CompanyControl"
                                items={companyItems}
                                placeHolder="본부"
                                value={companyValue?.value}
                                onChange={useCallback(
                                    (item: SelectItem) => {
                                        setCompanyValue(item)
                                        const newPlantItems = mapFolderList.get(item.value)
                                        if (newPlantItems) setPlantItems(newPlantItems)
                                        setHogiItems([])
                                        setHogiValue(undefined)
                                        setPlantValue(undefined)
                                        setProcedureSourceInfo(item.text)
                                        console.log(item.text)
                                    },
                                    [setCompanyValue, setHogiItems, setPlantItems, mapFolderList, setHogiValue, setPlantValue]
                                )}
                            />
                            <Select
                                id="PlantControl"
                                items={plantItems}
                                placeHolder="발전소"
                                value={plantValue?.value}
                                onChange={useCallback(
                                    async (item: SelectItem) => {
                                        setPlantValue(item)
                                        const newHogiItems = mapFolderList.get(item.value)
                                        setHogiValue(undefined)
                                        if (newHogiItems) {
                                            setHogiItems(newHogiItems)
                                            if (newHogiItems.length > 0) {
                                                let newDocumentList: DocumentItem[] | undefined

                                                const newFolderList = mapFolderList.get(newHogiItems[0].value)
                                                if (newFolderList && newFolderList.length > 0) {
                                                    newDocumentList = mapDocItemList.get(newFolderList[0].value)
                                                } else {
                                                    newDocumentList = mapDocItemList.get(newHogiItems[0].value)
                                                }
                                                if (newDocumentList && newDocumentList.length > 0) {
                                                    const plantCode = newDocumentList[0].plantCode
                                                    // 설비 조회
                                                    const results = await Api.equipment.getSymbolsByPlant(plantCode)
                                                    console.log('plantValueChange:inner:', newDocumentList, plantCode, results)
                                                }
                                            }
                                        }
                                        console.log('plantValueChange:', newHogiItems)
                                    },
                                    [setPlantValue, setHogiItems, mapFolderList, setHogiValue, mapDocItemList]
                                )}
                            />
                            <Select
                                id="HogiControl"
                                items={hogiItems}
                                placeHolder="호기"
                                value={hogiValue?.value}
                                onChange={useCallback(
                                    (item: SelectItem) => {
                                        setHogiValue(item)
                                    },
                                    [setHogiValue]
                                )}
                            />
                        </div>
                    </div>

                    <div
                        className="procedure-table"
                        style={{
                            maxHeight: '400px',
                            overflowY: 'auto',
                        }}
                    >
                        <table>
                            <thead>
                                <tr>
                                    <th>작업순서</th>
                                    <th>절차제목</th>
                                    <th>설비명</th>
                                    <th>PMDC센서</th>
                                    <th>도면</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tempStep.length > 0 &&
                                    tempStep.map((v: any, i: number) => {
                                        return (
                                            <>
                                                <tr key={v.STPORDER.toString()}>
                                                    <td>{v.STPORDER}</td>
                                                    <td>{v.STPNM}</td>
                                                    <td>{v.FUNCTION}</td>
                                                    <td>{v.NAME_KEY}</td>
                                                    <td>{v.DOCNUMBER}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ verticalAlign: 'top' }}>작업내용</td>
                                                    <td
                                                        colSpan={3}
                                                        style={{
                                                            paddingLeft: '15px',
                                                            textAlign: 'start',
                                                            whiteSpace: 'pre',
                                                        }}
                                                    >
                                                        {v.STPDESC}
                                                    </td>
                                                    <td
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <div
                                                            className="procedure-table-btn"
                                                            style={{
                                                                width: '70px',
                                                                padding: `3px 0`,
                                                                marginRight: '10px',
                                                                borderRadius: '5px',
                                                            }}
                                                            onClick={() => {
                                                                setIsStepFix({ ...v })
                                                                setAddMode(true)
                                                            }}
                                                        >
                                                            수정
                                                        </div>
                                                        <div
                                                            className="procedure-table-btn"
                                                            style={{
                                                                width: '70px',
                                                                padding: `3px 0`,
                                                                marginRight: '10px',
                                                                borderRadius: '5px',
                                                            }}
                                                            onClick={() => {
                                                                let arr = tempStep
                                                                    .filter((item: any) => item.STPORDER !== v.STPORDER)
                                                                    .map((item2: any, index: number) => {
                                                                        let obj = { ...item2 }
                                                                        obj.STPORDER = index + 1
                                                                        return obj
                                                                    })
                                                                setTempStep(arr)
                                                            }}
                                                        >
                                                            삭제
                                                        </div>
                                                    </td>
                                                </tr>
                                            </>
                                        )
                                    })}
                            </tbody>
                        </table>
                        <div
                            className="procedure-table-btn"
                            onClick={() => {
                                if (!procedureSourceInfo) {
                                    setOkPopupValue({
                                        message: '구분을 선택하세요',
                                        ok: () => {},
                                    })
                                    return
                                }
                                setAddMode(true)
                            }}
                            style={{
                                margin: `20px 0 30px`,
                            }}
                        >
                            + 절차추가
                        </div>
                    </div>
                </div>

                <div className="procedure-footer">
                    <div
                        className="procedure-footer-btn"
                        onClick={async () => {
                            if (!procedureNum || !procedureName) {
                                setOkPopupValue({
                                    message: '절차서 번호와 이름을 입력하세요',
                                    ok: () => {},
                                })
                                return
                            }

                            if (!companyValue || !hogiValue || !plantValue) {
                                setOkPopupValue({
                                    message: '구분을 정해주세요',
                                    ok: () => {},
                                })
                                return
                            }

                            if (tempStep.length === 0) {
                                setOkPopupValue({
                                    message: '절차를 추가하세요',
                                    ok: () => {},
                                })
                                return
                            }
                            const obj = {
                                USERID: userId,
                                PROID: tempStep[0].PROID ?? '',
                                PRONO: procedureNum,
                                PRONM: procedureName,
                                FOLID: hogiValue.value,
                                STEPS: tempStep,
                            }
                            console.log(obj)
                            const res = await Api.procedure.setProcedure(obj)
                            if (res === 200) {
                                setOkPopupValue({
                                    message: tempStep[0].PROID ? '수정되었습니다' : '추가되었습니다',
                                    ok: async () => {
                                        setIsFix(false)
                                        setIsProcedureManagerVisible(false)
                                        setIsHideSide(true)
                                        setAddMode(false)
                                        setTempStep([])
                                        setHogiValue(undefined)
                                        setPlantValue(undefined)
                                        setCompanyValue(undefined)
                                        setProcedureSourceInfo('')
                                        if (isFix) {
                                            const res = await Api.procedure.getProcedureRead(userId!, tempStep[0].PROID)
                                            const arr = res?.STEPS.map((v: any) => {
                                                return { ...v, PRONO: res.PRONO, PRONM: res.PRONM, GUBUN: res.gubun }
                                            })
                                            setProcedureSteps(arr)
                                        }
                                    },
                                })
                                return
                            } else {
                                setOkPopupValue({
                                    message: '예기치 않은 오류가 발생했습니다',
                                    ok: async () => {},
                                })
                            }
                        }}
                    >
                        등록
                    </div>
                    <div
                        className="procedure-footer-btn"
                        onClick={() => {
                            if (isFix) {
                                setIsFix(false)
                            } else {
                                setIsProcedureManagerVisible(false)
                                setIsHideSide(false)
                                setAddMode(false)
                            }
                            setTempStep([])
                            setHogiValue(undefined)
                            setPlantValue(undefined)
                            setCompanyValue(undefined)
                            setProcedureSourceInfo('')
                        }}
                    >
                        취소
                    </div>
                </div>
            </div>
            {addMode && <ProcedureAdd addMode={addMode} setAddMode={setAddMode} />}
        </>
    )
}

export default ProcedureManager
