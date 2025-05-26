import React from 'react'
import { AppContext, StatusContext } from '../../context'
import './CreatePldMenu.css'
import { CloseSideMenu } from '../CloseSideMenu'
import Repository from '../../Repository'
import { DocFolder, DocumentResult } from '../../types'
import { FirstStep } from './FirstStep'
import { SecondStep } from './SecondStep'
import { pushCommand } from '../../common'
import { getCurDocumentPldSeq, resetPldData } from '../../mainview/canvas/Pld/PldUtil'
import { setBanner } from '../..'

export const CreatePldMenu = () => {
    const status = React.useContext(StatusContext)
    const app = React.useContext(AppContext)

    const [companyValue, setCompanyValue] = React.useState('')
    const [plantValue, setPlantValue] = React.useState('')
    const [hogiValue, setHogiValue] = React.useState('')
    const [companyItems, setCompanyItems] = React.useState<DocFolder[]>([])
    const [plantItems, setPlantItems] = React.useState<DocFolder[]>([])
    const [hogiItems, setHogiItems] = React.useState<DocFolder[]>([])
    const [procedureNumber, setProcedureNumber] = React.useState('')
    const [procedureName, setProcedureName] = React.useState('')
    const [pldNameValue, setPldName] = React.useState('')
    const [pldDescValue, setPldDesc] = React.useState('')
    const [registerStep, setRegisterStep] = React.useState(1)

    const [documentList, setDocumentList] = React.useState<DocumentResult[]>([])
    const [selectedItems, setSelectedItems] = React.useState(new Set<string>())

    const appContext = React.useContext(AppContext)

    React.useEffect(() => {
        async function fetchData() {
            const values = await Repository.getRootFolder()

            setCompanyItems(values)
        }

        fetchData()
    }, [])

    const companyValueChange = React.useCallback((value: string) => {
        setCompanyValue(value)

        async function fetch() {
            const values = await Repository.getFolders(value)
            setPlantItems(values)
            setHogiItems([])
        }

        fetch()
    }, [])

    const plantValueChange = React.useCallback((value: string) => {
        setPlantValue(value)

        async function fetch() {
            const values = await Repository.getFolders(value)
            setHogiItems(values)
        }

        fetch()
    }, [])

    const hogiValueChange = React.useCallback((value: string) => {
        setHogiValue(value)

        async function fetch() {
            const values = await Repository.searchDocument(value, undefined, undefined)

            setDocumentList(values)
        }
        fetch()
    }, [])

    const procedureNumberChange = React.useCallback((value: string) => {
        setProcedureNumber(value)
    }, [])

    const procedureNameChange = React.useCallback((value: string) => {
        setProcedureName(value)
    }, [])

    const pldNameChange = React.useCallback((value: string) => {
        setPldName(value)
    }, [])

    const pldDescChange = React.useCallback((value: string) => {
        setPldDesc(value)
    }, [])

    const onStepChange = React.useCallback(() => {
        setRegisterStep((prev) => (prev === 1 ? 2 : 1))
    }, [])

    const allClear = React.useCallback(() => {
        setCompanyValue('')
        setPlantValue('')
        setHogiValue('')
        setProcedureNumber('')
        setProcedureName('')
        setPldName('')
        setPldDesc('')
        setHogiItems([])
        setPlantItems([])
        setRegisterStep(1)
    }, [])

    const getText = (value: string | null, items: DocFolder[]) => {
        for (const item of items) {
            if (item.folderId === value) return item.folderName
        }

        return ''
    }

    const resisterPld = React.useCallback(() => {
        async function fetch() {
            setBanner('PLD를 등록합니다. . .')

            if (appContext.userId) {
                const selectItemtoArray = Array.from(selectedItems)
                const res = await Repository.resisterPld(
                    procedureNumber,
                    procedureName,
                    pldNameValue,
                    plantValue,
                    pldDescValue,
                    selectItemtoArray,
                    appContext.userId
                )
                allClear()

                const pldInfo = {
                    PLD_C_ID: res.PLD_C_ID,
                    PLD_C_VR: res.PLD_C_VR,
                    COMPANY: { company: getText(companyValue, companyItems), plant: getText(plantValue, plantItems) },
                    PLD_P_NUMBER: procedureNumber,
                    PLD_P_NAME: procedureName,
                    PLD_C_NAME: pldNameValue,
                    FOLID: res.FOLID,
                    FOLPT: res.FOLPT
                }
                appContext.setCurrentPld(pldInfo)
            }

            setBanner(undefined)
        }

        if (status.isChanged && app.currentPld) {
            const confirmValue = {
                title: 'PLD 모드',
                message: '현재 작업중인 PLD를 저장할까요?',
                submessage: '저장하지 않은 내용은 모두 취소됩니다.',
                yes: async () => {
                    const cSeq = getCurDocumentPldSeq(status, app)
                    pushCommand({ name: 'savePld', value: { currentPld: app.currentPld, cSeq } })

                    resetPldData(app)

                    fetch()
                },
                no: () => {
                    resetPldData(app)

                    fetch()
                }
            }

            pushCommand({ name: 'showWarningView', value: confirmValue })
        } else {
            resetPldData(app)

            fetch()
        }
    }, [
        allClear,
        appContext,
        companyItems,
        companyValue,
        plantItems,
        plantValue,
        pldDescValue,
        pldNameValue,
        procedureName,
        procedureNumber,
        selectedItems
    ])

    return (
        <div className="CreatePldMenu SideViewShadow SideViewBackground" style={style(status.currentMenu)}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">PLD 만들기</span>
            <CloseSideMenu onMenuChange={status.onMenuChange} />
            <TopLine />
            {registerStep === 1 ? (
                <FirstStep
                    companyValue={companyValue}
                    plantValue={plantValue}
                    hogiValue={hogiValue}
                    procedureNumber={procedureNumber}
                    procedureName={procedureName}
                    pldNameValue={pldNameValue}
                    pldDescValue={pldDescValue}
                    companyItems={companyItems}
                    plantItems={plantItems}
                    hogiItems={hogiItems}
                    companyValueChange={companyValueChange}
                    plantValueChange={plantValueChange}
                    hogiValueChange={hogiValueChange}
                    procedureNumberChange={procedureNumberChange}
                    procedureNameChange={procedureNameChange}
                    pldNameChange={pldNameChange}
                    pldDescChange={pldDescChange}
                    onStepChange={onStepChange}
                    allClear={allClear}
                ></FirstStep>
            ) : (
                <SecondStep
                    companyValue={getText(companyValue, companyItems)}
                    plantValue={getText(plantValue, plantItems)}
                    hogiValue={getText(hogiValue, hogiItems)}
                    procedureNumber={procedureNumber}
                    procedureName={procedureName}
                    pldNameValue={pldNameValue}
                    pldDescValue={pldDescValue}
                    documentList={documentList}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    onStepChange={onStepChange}
                    allClear={allClear}
                    resisterPld={resisterPld}
                ></SecondStep>
            )}
        </div>
    )
}

function TopLine() {
    return <div className="topline"></div>
}

function style(currentMenu: string) {
    return 'create' === currentMenu
        ? { marginLeft: 'var(--SideMenuWidth)' }
        : { marginLeft: 'calc(var(--CreatePldMenuWidth) * -1 )' }
}
