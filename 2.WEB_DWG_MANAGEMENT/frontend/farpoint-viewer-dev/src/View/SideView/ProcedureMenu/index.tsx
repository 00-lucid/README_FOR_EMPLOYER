import { useCallback, useState } from 'react'
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil'
// 전역 Store
import AppStore from '../../../Store/appStore'
import { StatusStore, ProcedureStore } from '../../../Store/statusStore'
// Component
import { CloseSideResultBtn } from '../Component/CloseSideMenuBtn'
import Select from '../../CommonView/Select'
import { TextField } from '../../CommonView/TextField'
import { ProcedureSearchView } from './ProcedureSearchView'
// Api
import Api from '../../../Api'
// Controller
import commonActive from '../../../Controller/useCommonActive'

export const ProcedureMenu = () => {
    // 전역 Store
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    const setWarningPopupValue = useSetRecoilState(StatusStore.warningPopupValue)

    const userId = useRecoilValue(AppStore.userId)
    const setBanner = useSetRecoilState(StatusStore.banner)
    const [currentMenu, setCurrentMenu] = useRecoilState(StatusStore.currentMenu)
    const companyItems = useRecoilValue(StatusStore.companyItems)
    const [plantItems, setPlantItems] = useRecoilState(StatusStore.plantItems)
    const [hogiItems, setHogiItems] = useRecoilState(StatusStore.hogiItems)

    const [companyValue, setCompanyValue] = useRecoilState(StatusStore.companyValue)
    const [plantValue, setPlantValue] = useRecoilState(StatusStore.plantValue)
    const [hogiValue, setHogiValue] = useRecoilState(StatusStore.hogiValue)
    const [isHideSide, setIsHideSide] = useRecoilState(ProcedureStore.isHideSide)
    const [isProcedureManagerVisible, setIsProcedureManagerVisible] = useRecoilState(ProcedureStore.isProcedureManagerVisible)

    const mapFolderList = useRecoilValue(StatusStore.mapFolderList)
    const mapDocItemList = useRecoilValue(StatusStore.mapDocItemList)
    const controlMode = useRecoilValue(StatusStore.controlMode)

    const [procedureNum, setProcedureNum] = useState('')
    const [procedureName, setProcedureName] = useState('')
    const [procedureSearchResults, setProcedureSearchResults] = useState<ProcedureList[]>([])

    const style = (currentMenu: string) => {
        return 'procedure' === currentMenu && !isHideSide
            ? { transform: 'translateX(var(--SideMenuWidth))' }
            : { transform: 'translateX(calc(var(--SearchMenuWidth) * -1 ))' }
    }

    return (
        <div className="SearchMenu SideViewShadow" style={style(currentMenu)}>
            <ProcedureSearchView hidden={currentMenu !== 'procedure'} results={procedureSearchResults} />
            <div className="Background SideViewBackground" />
            <div className="VerticalLine" />

            <span className="SideMenuLabel">작업절차관리서</span>

            <CloseSideResultBtn
                onMenuChange={() => {
                    if (0 < procedureSearchResults.length) {
                        setProcedureSearchResults([])
                    } else {
                        commonActive.onMenuChange('', userId, setCurrentMenu)
                    }
                }}
            />

            <div className="space" />

            <div className="ControlsView">
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

                <div>
                    <TextField
                        id="DocNumberControl"
                        value={procedureNum}
                        placeHolder="절차서번호"
                        onChange={(value: string) => {
                            setProcedureNum(value)
                        }}
                    />
                    <TextField
                        id="DocNameControl"
                        value={procedureName}
                        placeHolder="절차서이름"
                        onChange={(value: string) => {
                            setProcedureName(value)
                        }}
                    />
                </div>
            </div>

            <div
                className="ResetButton"
                onClick={() => {
                    setCompanyValue(undefined)
                    setPlantValue(undefined)
                    setHogiValue(undefined)
                    setProcedureNum('')
                    setProcedureName('')
                    setProcedureSearchResults([])
                    setPlantItems([])
                    setHogiItems([])
                }}
            >
                {resetImage()}
                <div>검색 초기화</div>
            </div>

            <div
                className="SearchButton"
                onClick={async () => {
                    let folderId: string | undefined = undefined
                    if (hogiValue && 0 < hogiValue.value.length) folderId = hogiValue.value
                    else if (plantValue && 0 < plantValue.value.length) folderId = plantValue.value
                    else if (companyValue && 0 < companyValue.value.length) folderId = companyValue.value
                    let fullId: string | undefined = `${companyValue ? companyValue.value : ''}${plantValue ? '/' + plantValue.value : ''}${
                        hogiValue ? '/' + hogiValue.value : ''
                    }`
                    if (fullId === '') fullId = ''

                    const searchActive = async () => {
                        setBanner(`검색 중...`)
                        const num = 0 < procedureNum.length ? procedureNum : ''
                        const name = 0 < procedureName.length ? procedureName : ''
                        let obj = {
                            userId,
                            prono: `*${num}*`,
                            pronm: `*${name}*`,
                            folph: `*${fullId}*`,
                        }
                        const results = await Api.procedure.getProcedureList(obj)
                        console.log('작업절차관리서 리스트', results)
                        if (results.length === 0) setOkPopupValue({ message: '검색 결과가 없습니다.', ok: () => {} })
                        setProcedureSearchResults(results)
                        setBanner(undefined)
                    }
                    setWarningPopupValue({
                        title: '검색',
                        message: '검색량이 많아 다소 시간이 소요될 수 있습니다.',
                        submessage: '검색을 진행하시겠습니까?',
                        yes: searchActive,
                        no: () => {},
                    })
                }}
            >
                <div>검색</div>
            </div>

            <div
                className="SearchButton"
                onClick={() => {
                    setIsHideSide(true)
                    setIsProcedureManagerVisible(true)
                }}
            >
                <div>신규관리서 등록</div>
            </div>
        </div>
    )
}

const resetImage = () => {
    return (
        <svg width="22" height="22">
            <path d="M18.677 6.827c.121.24.233.489.334.742l1.106-3.405a.452.452 0 1 1 .86.28l-1.14 3.503a1.4 1.4 0 0 1-.714.826 1.411 1.411 0 0 1-1.091.076l-3.486-1.192a.451.451 0 0 1-.281-.574.45.45 0 0 1 .574-.282l3.347 1.145a8.057 8.057 0 0 0-.317-.709c-1.973-3.89-6.745-5.453-10.632-3.477-3.89 1.972-5.45 6.742-3.477 10.632 1.973 3.891 6.744 5.453 10.632 3.478a7.905 7.905 0 0 0 1.349-.865.453.453 0 1 1 .564.709 8.92 8.92 0 0 1-1.503.963 8.763 8.763 0 0 1-3.973.952c-3.218 0-6.324-1.766-7.876-4.827-2.2-4.335-.461-9.65 3.874-11.85 4.335-2.199 9.65-.459 11.85 3.875zm-.132 7.21c.226.108.32.379.212.604a8.94 8.94 0 0 1-.926 1.515.455.455 0 0 1-.635.087.453.453 0 0 1-.087-.634 7.98 7.98 0 0 0 .833-1.36.451.451 0 0 1 .603-.212z" />
        </svg>
    )
}
