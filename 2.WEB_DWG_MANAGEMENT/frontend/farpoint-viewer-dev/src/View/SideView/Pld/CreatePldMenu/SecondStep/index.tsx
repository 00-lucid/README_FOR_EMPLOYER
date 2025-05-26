import React from 'react'
import './SecondStep.css'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore, PldStore } from '../../../../../Store/statusStore'
import appStore from '../../../../../Store/appStore'
// Component
import { DocumentListView } from '../../../../CommonView/DocumentListView'
// Api
import Api from '../../../../../Api'
// Controller
import usePld from '../../../../../Controller/usePld'

export const SecondStep = ({ allClear, onStepChange }: StepProps) => {
    // 전역 Store
    const userId = useRecoilValue(appStore.userId)
    const setDocAndMarkupResetActive = useSetRecoilState(StatusStore.docAndMarkupResetActive)
    const setPldResetActive = useSetRecoilState(StatusStore.pldResetActive)
    const setWarningPopupValue = useSetRecoilState(StatusStore.warningPopupValue)
    const companyValue = useRecoilValue(StatusStore.companyValue)
    const plantValue = useRecoilValue(StatusStore.plantValue)
    const setBanner = useSetRecoilState(StatusStore.banner)

    const hogiItems = useRecoilValue(StatusStore.hogiItems)

    const [currentPld, setCurrentPld] = useRecoilState(PldStore.currentPld)
    const isChangedPld = useRecoilValue(PldStore.isChangedPld)

    const procedureNumber = useRecoilValue(PldStore.procedureNumber)
    const procedureName = useRecoilValue(PldStore.procedureName)
    const pldNameValue = useRecoilValue(PldStore.pldNameValue)
    const pldDescValue = useRecoilValue(PldStore.pldDescValue)

    // Pld에서 선택한 도면목록
    const [cpSelectedDocListSet, setCpSelectedDocListSet] = React.useState<Set<string>>(new Set<string>())

    // Pld Controller
    const usePldObj = usePld()

    const isActive = React.useCallback(() => {
        if (0 < cpSelectedDocListSet.size) return true
        return false
    }, [cpSelectedDocListSet])

    // PLD 생성
    const resisterPld = React.useCallback(() => {
        async function fetch() {
            setBanner('PLD를 등록합니다. . .')

            if (userId) {
                const selectItemtoArray = Array.from(cpSelectedDocListSet)

                if (plantValue && companyValue) {
                    const res = await Api.pld.resisterPld(
                        procedureNumber,
                        procedureName,
                        pldNameValue,
                        plantValue.value,
                        pldDescValue,
                        selectItemtoArray,
                        userId
                    )
                    const pldInfo = {
                        PLD_C_ID: res.PLD_C_ID,
                        PLD_C_VR: res.PLD_C_VR,
                        COMPANY: { company: companyValue.text, plant: plantValue.text },
                        PLD_P_NUMBER: procedureNumber,
                        PLD_P_NAME: procedureName,
                        PLD_C_NAME: pldNameValue,
                        FOLID: plantValue.value,
                        FOLPT: companyValue.value,
                    }
                    allClear()
                    setCurrentPld(pldInfo)
                }
            }

            setBanner(undefined)
        }

        if (companyValue && plantValue) {
            if (isChangedPld && currentPld) {
                // PLD 시작
                const confirmValue = {
                    title: 'PLD 모드',
                    message: '현재 작업중인 PLD를 저장할까요?',
                    submessage: '저장하지 않은 내용은 모두 취소됩니다.',
                    yes: async () => {
                        usePldObj.savePld()
                    },
                    no: () => {
                        fetch()
                        setDocAndMarkupResetActive(true)
                        setPldResetActive(true)
                    },
                }
                setWarningPopupValue(confirmValue)
            } else {
                setDocAndMarkupResetActive(true)
                setPldResetActive(true)
                fetch()
            }
        }
    }, [
        allClear,
        companyValue,
        currentPld,
        setDocAndMarkupResetActive,
        setPldResetActive,
        isChangedPld,
        plantValue,
        pldDescValue,
        pldNameValue,
        procedureName,
        procedureNumber,
        cpSelectedDocListSet,
        setCurrentPld,
        userId,
        setWarningPopupValue,
        usePldObj,
        setBanner,
    ])

    return (
        <>
            <div className="PldPreview">
                <table>
                    <tbody>
                        <tr>
                            <td className="Item">
                                <span>발전소</span>
                                <span>{`${companyValue?.text} > ${plantValue?.text}`}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className="Item">
                                <span>절차서 번호</span>
                                <span>{procedureNumber}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className="Item">
                                <span>절차서 명</span>
                                <span>{procedureName}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className="Item">
                                <span>PLD 명</span>
                                <span>{pldNameValue}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            {/* 체크박스 도면목록 */}
            <DocumentListView
                hogiItems={hogiItems}
                isPopup={false}
                selectedDocListSet={cpSelectedDocListSet}
                setSelectedDocListSet={setCpSelectedDocListSet}
            />
            <div className="ButtonView">
                <div className="PrevButton" onClick={onStepChange}>
                    이전
                </div>
                <div className="CancelButton" onClick={allClear}>
                    취소
                </div>
                <div
                    className={isActive() ? 'Enable SubmitButton' : 'Disable SubmitButton'}
                    onClick={() => {
                        resisterPld()
                    }}
                >
                    확인
                </div>
            </div>
        </>
    )
}
