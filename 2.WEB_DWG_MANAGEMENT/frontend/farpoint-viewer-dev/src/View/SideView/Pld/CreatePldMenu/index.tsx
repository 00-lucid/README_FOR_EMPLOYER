import React from 'react'
import './CreatePldMenu.css'
import { useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore, PldStore } from '../../../../Store/statusStore'
// Component
import { CloseSideMenuBtn } from '../../Component/CloseSideMenuBtn'
import { TopLine } from '../../Component/TopLine'
import { FirstStep } from './FirstStep'
import { SecondStep } from './SecondStep'
// Lib
import { global } from '../../../../Lib/util'

export const CreatePldMenu = () => {
    global.log('CreatePldMenu create')

    // 전역 Store
    const currentMenu = useRecoilValue(StatusStore.currentMenu)
    const setCompanyValue = useSetRecoilState(StatusStore.companyValue)
    const setPlantValue = useSetRecoilState(StatusStore.plantValue)
    const setHogiValue = useSetRecoilState(StatusStore.hogiValue)

    const registerStep = useRecoilValue(PldStore.registerStep)
    const setProcedureNumber = useSetRecoilState(PldStore.procedureNumber)
    const setProcedureName = useSetRecoilState(PldStore.procedureName)
    const setPldNameValue = useSetRecoilState(PldStore.pldNameValue)
    const setPldDescValue = useSetRecoilState(PldStore.pldDescValue)
    const setPlantItems = useSetRecoilState(StatusStore.plantItems)
    const setHogiItems = useSetRecoilState(StatusStore.hogiItems)
    const setRegisterStep = useSetRecoilState(PldStore.registerStep)

    // 초기화
    const allClear = () => {
        setCompanyValue(undefined)
        setPlantValue(undefined)
        setHogiValue(undefined)
        setHogiValue(undefined)

        setProcedureNumber('')
        setProcedureName('')
        setPldNameValue('')
        setPldDescValue('')
        setPlantItems([])
        setHogiItems([])
        setRegisterStep(1)
    }
    // 절차 단계 변경
    const onStepChange = React.useCallback(() => {
        setRegisterStep((prev) => (prev === 1 ? 2 : 1))
    }, [setRegisterStep])

    return (
        <div className="CreatePldMenu SideViewShadow SideViewBackground" style={style(currentMenu)}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">PLD 만들기</span>
            <CloseSideMenuBtn />
            <TopLine />
            {registerStep === 1 ? (
                <FirstStep allClear={allClear} onStepChange={onStepChange} />
            ) : (
                <SecondStep allClear={allClear} onStepChange={onStepChange} />
            )}
        </div>
    )
}

function style(currentMenu: string) {
    return 'create' === currentMenu ? { marginLeft: 'var(--SideMenuWidth)' } : { marginLeft: 'calc(var(--CreatePldMenuWidth) * -1 )' }
}
