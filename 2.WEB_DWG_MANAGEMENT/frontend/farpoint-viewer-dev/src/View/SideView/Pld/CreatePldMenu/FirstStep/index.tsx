import React from 'react'
import './FirstStep.css'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import { PldStore, StatusStore } from '../../../../../Store/statusStore'
import { TextField } from '../../../../CommonView/TextField'
// Component
import Select from '../../../../CommonView/Select'

export const FirstStep = ({ allClear, onStepChange }: StepProps) => {
    // 전역 Store
    const companyItems = useRecoilValue(StatusStore.companyItems)
    const [plantItems, setPlantItems] = useRecoilState(StatusStore.plantItems)
    const setHogiItems = useSetRecoilState(StatusStore.hogiItems)
    const mapFolderList = useRecoilValue(StatusStore.mapFolderList)
    const [companyValue, setCompanyValue] = useRecoilState(StatusStore.companyValue)
    const [plantValue, setPlantValue] = useRecoilState(StatusStore.plantValue)
    const setHogiValue = useSetRecoilState(StatusStore.hogiValue)

    const [procedureNumber, setProcedureNumber] = useRecoilState(PldStore.procedureNumber)
    const [procedureName, setProcedureName] = useRecoilState(PldStore.procedureName)
    const [pldNameValue, setPldNameValue] = useRecoilState(PldStore.pldNameValue)
    const [pldDescValue, setPldDescValue] = useRecoilState(PldStore.pldDescValue)

    // 사업소 셀렉트 변경 이벤트
    const companyValueChange = React.useCallback(
        (item: SelectItem) => {
            setCompanyValue(item)
            const newPlantItems = mapFolderList.get(item.value)
            if (newPlantItems) setPlantItems(newPlantItems)
            setHogiItems([])
            setHogiValue(undefined)
            setPlantValue(undefined)
        },
        [setCompanyValue, setHogiItems, setPlantItems, mapFolderList, setHogiValue, setPlantValue]
    )
    // 발전소 셀렉트 변경 이벤트
    const plantValueChange = React.useCallback(
        (item: SelectItem) => {
            setPlantValue(item)
            const newHogiItems = mapFolderList.get(item.value)
            if (newHogiItems) setHogiItems(newHogiItems)
            setHogiValue(undefined)
        },
        [setPlantValue, setHogiItems, mapFolderList, setHogiValue]
    )

    const isActive = React.useCallback(() => {
        if (companyValue && plantValue && procedureNumber && procedureName && pldNameValue) {
            return true
        } else {
            return false
        }
    }, [companyValue, plantValue, pldNameValue, procedureName, procedureNumber])

    return (
        <>
            <div className="ControlsView">
                <Select
                    id={'CompanyControl'}
                    items={companyItems}
                    placeHolder={'본부'}
                    value={companyValue?.value}
                    onChange={companyValueChange}
                />
                <Select
                    id={'PlantControl'}
                    items={plantItems}
                    placeHolder={'발전소'}
                    value={plantValue?.value}
                    onChange={plantValueChange}
                />
                <TextField
                    value={procedureNumber}
                    placeHolder={'절차서 번호'}
                    onChange={setProcedureNumber}
                    id={'procedureNumberControl'}
                />
                <TextField value={procedureName} placeHolder={'절차서 명'} onChange={setProcedureName} id={'procedureNameControl'} />
                <TextField value={pldNameValue} placeHolder={'PLD 명'} onChange={setPldNameValue} id={'pldNameControl'} />
                <TextField value={pldDescValue} placeHolder={'PLD 설명'} onChange={setPldDescValue} id={'pldDescControl'} />
            </div>

            <div className="ButtonView">
                <div className="CancelButton" onClick={allClear}>
                    취소
                </div>

                <div className={isActive() ? 'Enable NextButton' : 'Disable NextButton'} onClick={onStepChange}>
                    다음
                </div>
            </div>
        </>
    )
}
