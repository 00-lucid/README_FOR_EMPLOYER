import React from 'react'
import { Select, SelectItem, TextField } from '../../common'
import { DocFolder } from '../../types'
import './FirstStep.css'

type Props = {
    companyValue: string
    plantValue: string
    hogiValue: string
    procedureNumber: string
    procedureName: string
    pldNameValue: string
    pldDescValue: string
    companyItems: DocFolder[]
    plantItems: DocFolder[]
    hogiItems: DocFolder[]
    companyValueChange: (value: string) => void
    plantValueChange: (value: string) => void
    hogiValueChange: (value: string) => void
    procedureNumberChange: (value: string) => void
    procedureNameChange: (value: string) => void
    pldNameChange: (value: string) => void
    pldDescChange: (value: string) => void
    onStepChange: () => void
    allClear: () => void
}
export const FirstStep = ({
    companyValue,
    plantValue,
    hogiValue,
    procedureNumber,
    procedureName,
    companyItems,
    plantItems,
    hogiItems,
    pldNameValue,
    pldDescValue,
    companyValueChange,
    plantValueChange,
    hogiValueChange,
    procedureNumberChange,
    procedureNameChange,
    pldNameChange,
    pldDescChange,
    onStepChange,
    allClear
}: Props) => {
    const getItems = React.useCallback((items: DocFolder[]) => {
        const values: SelectItem[] = []

        for (const item of items) {
            values.push({ value: item.folderId, text: item.folderName })
        }

        return values
    }, [])

    const getCompanyItems = (): SelectItem[] => {
        return getItems(companyItems)
    }
    const getPlantItems = (): SelectItem[] => {
        return getItems(plantItems)
    }

    const getHogiItems = (): SelectItem[] => {
        return getItems(hogiItems)
    }

    const isActive = React.useCallback(() => {
        if (companyValue && plantValue && hogiValue && procedureNumber && procedureName && pldNameValue) {
            return true
        } else {
            return false
        }
    }, [companyValue, hogiValue, plantValue, pldNameValue, procedureName, procedureNumber])

    return (
        <>
            <div className="ControlsView">
                <Select
                    id={'CompanyControl'}
                    items={getCompanyItems()}
                    placeHolder={'본부'}
                    value={companyValue}
                    onChange={companyValueChange}
                />
                <Select
                    id={'PlantControl'}
                    items={getPlantItems()}
                    placeHolder={'발전소'}
                    value={plantValue}
                    onChange={plantValueChange}
                />
                <Select
                    id={'Hogi'}
                    items={getHogiItems()}
                    placeHolder={'호기'}
                    value={hogiValue}
                    onChange={hogiValueChange}
                />

                <TextField
                    value={procedureNumber}
                    placeHolder={'절차서 번호'}
                    onChange={procedureNumberChange}
                    id={'procedureNumberControl'}
                />
                <TextField
                    value={procedureName}
                    placeHolder={'절차서 명'}
                    onChange={procedureNameChange}
                    id={'procedureNameControl'}
                />
                <TextField value={pldNameValue} placeHolder={'PLD 명'} onChange={pldNameChange} id={'pldNameControl'} />
                <TextField
                    value={pldDescValue}
                    placeHolder={'PLD 설명'}
                    onChange={pldDescChange}
                    id={'pldDescControl'}
                />
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
