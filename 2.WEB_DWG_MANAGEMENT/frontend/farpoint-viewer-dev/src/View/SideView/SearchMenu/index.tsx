import React from 'react'
import './SearchMenu.css'
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil'
// 전역 Store
import AppStore from '../../../Store/appStore'
import { StatusStore } from '../../../Store/statusStore'
// Component
import { CloseSideResultBtn } from '../Component/CloseSideMenuBtn'
import Select from '../../CommonView/Select'
import { TextField } from '../../CommonView/TextField'
import DocumentSearchView from './DocumentSearchView'
import EquipmentSearchView from './EquipmentSearchView'
import SignalSearchView from './SignalSearchView'
import { CheckBox2 } from '../../CommonView/Icon'
// Api
import Api from '../../../Api'
// Controller
import commonActive from '../../../Controller/useCommonActive'
import auth from '../../../Api/auth'

export function SearchMenu() {
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

    const documentList = useRecoilValue(StatusStore.documentList)
    const mapFolderList = useRecoilValue(StatusStore.mapFolderList)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const mapDocItemList = useRecoilValue(StatusStore.mapDocItemList)
    const mapNameByPlantCode = useRecoilValue(StatusStore.mapNameByPlantCode)

    const [typeValue, setTypeValue] = React.useState('document')
    const [cntValue, setCntValue] = React.useState('100')
    const [symbolItems, setSymbolItems] = React.useState<SymbolResult[]>([])

    const [symbolValue, setSymbolValue] = React.useState('')
    const [tagValue, setTagValue] = React.useState('')
    const [docNumberValue, setDocNumberValue] = React.useState('')
    const [docNameValue, setDocNameValue] = React.useState('')
    const [signalDocValue, setSignalDocValue] = React.useState('')
    const [signalTagValue, setSignalTagValue] = React.useState('')
    const [docSearchResults, setDocSearchResults] = React.useState<DocumentResult[]>([])
    const [equipSearchResults, setEquipSearchResults] = React.useState<EquipmentResult[]>([])
    const [signalSearchResults, setSignalSearchResults] = React.useState<SearchSignalResult[]>([])

    const [innerSearchCheckBox, setInnerSearchCheckBox] = React.useState(false)
    const [tagValueInnerDoc, setTagValueInnerDoc] = React.useState('')
    const [innerDocSymbolItems, setInnerDocSymbolItems] = React.useState<SymbolResult[]>([])
    const [innerDocSymbolValue, setInnerDocSymbolValue] = React.useState('')
    const [searchTotalCnt, setSearchTotalCnt] = React.useState(0)

    React.useEffect(() => {
        const fetch = async () => {
            if (userId && mapNameByPlantCode.size > 0) {
                const data = await auth.getUserBySabun(userId)
                // const data = [{ PLANT: '2110', PLANT_T: '고리제1발전소', BONBU: '2100', BONBU_T: '고리' }]

                if (data[0].PLANT && data[0].PLANT_T && data[0].BONBU && data[0].BONBU_T) {
                    const { PLANT, PLANT_T, BONBU, BONBU_T } = data[0]
                    const fn = mapNameByPlantCode.get(PLANT)
                    companyValueChange({ text: BONBU_T, value: `00000000000000${BONBU}` })
                    if (fn) plantValueChange({ text: fn, value: `00000000000000${PLANT}` })
                }
            }
        }

        fetch()
    }, [mapNameByPlantCode])

    // 도면내 검색 심볼 아이템 셋팅
    React.useEffect(() => {
        // 도면내 검색 심볼
        if (selectedCanvas) {
            const innerDocSymbolItemsRes = selectedCanvas.documentCtx.equipmentList.map((equip) => {
                const { libId, libName, libDesc, parentId } = equip
                return { libId, libName, libDesc, parent: parentId }
            })
            setInnerDocSymbolItems(innerDocSymbolItemsRes)
        }
    }, [selectedCanvas])

    const TypeControlItems = React.useRef(
        process.env.REACT_APP_DB === '남부'
            ? [
                  { value: 'document', text: '도면' },
                  { value: 'equipment', text: '설비' },
                  { value: 'signal', text: '시그널' },
              ]
            : [
                  { value: 'document', text: '도면' },
                  { value: 'equipment', text: '설비' },
              ]
    )

    const cntItems = React.useRef([
        { value: '100', text: '100' },
        { value: '200', text: '200' },
        { value: '300', text: '300' },
        { value: '500', text: '500' },
        { value: '1000', text: '1000' },
    ])

    const onClear = () => {
        setCntValue('100')
        setTypeValue('document')
        setCompanyValue(undefined)
        setPlantValue(undefined)
        setHogiValue(undefined)
        setSymbolValue('')
        setInnerDocSymbolValue('')
        setTagValue('')
        setDocNumberValue('')
        setDocNameValue('')
        setSignalDocValue('')
        setSignalTagValue('')
        setTagValueInnerDoc('')

        setDocSearchResults([])
        setEquipSearchResults([])
        setSignalSearchResults([])

        setPlantItems([])
        setHogiItems([])
        setSymbolItems([])
    }

    const getSymbolItems = (symbolItems: SymbolResult[]): SelectItem[] => {
        const values: SelectItem[] = []

        if (0 < symbolItems.length) values.push({ value: '', text: '-심볼 전체-' })

        for (const item of symbolItems) {
            values.push({ value: item.libId, text: item.libName })
        }

        return values
    }

    const checkBoxChange = () => {
        setInnerSearchCheckBox(!innerSearchCheckBox)
    }

    const typeValueChange = (item: SelectItem) => {
        const { value } = item
        setTypeValue(value)
    }

    const cntValueChange = (item: SelectItem) => {
        const { value } = item
        setCntValue(value)
    }
    // 사업소 셀렉트 변경 이벤트
    const companyValueChange = React.useCallback(
        async (item: SelectItem) => {
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
                        setSymbolItems(results)
                    }
                }
            }
        },
        [setPlantValue, setHogiItems, mapFolderList, setHogiValue, mapDocItemList]
    )
    // 호기 셀렉트 변경 이벤트
    const hogiValueChange = React.useCallback(
        (item: SelectItem) => {
            setHogiValue(item)
        },
        [setHogiValue]
    )

    const innerDocSymbolValueChange = (item: SelectItem) => {
        const { value } = item
        setInnerDocSymbolValue(value)
    }

    const symbolValueChange = (item: SelectItem) => {
        const { value } = item
        setSymbolValue(value)
    }
    const tagValueChange = (value: string) => {
        setTagValue(value)
    }
    const docNumberValueChange = (value: string) => {
        setDocNumberValue(value)
    }
    const docNameValueChange = (value: string) => {
        setDocNameValue(value)
    }

    const signalDocValueChange = (value: string) => {
        setSignalDocValue(value)
    }
    const signalTagValueChange = (value: string) => {
        setSignalTagValue(value)
    }

    const TagValueChangeForDoc = (value: string) => {
        setTagValueInnerDoc(value)
    }

    const onSearchClick = React.useCallback(async () => {
        if (innerSearchCheckBox && selectedCanvas) {
            // 현재 도면내 검색
            setBanner(`설비 검색 중...`)
            const tag = 0 < tagValueInnerDoc.length ? tagValueInnerDoc : undefined
            const { docId, docVer } = selectedCanvas.documentCtx

            const symbol = 0 < innerDocSymbolValue.length ? innerDocSymbolValue : undefined

            const results = await Api.equipment.searchEquipmentInnerDoc(docId, docVer, symbol, tag, cntValue)
            if (results.length === 0) {
                setOkPopupValue({ message: '검색 결과가 없습니다.', ok: () => {} })
            }
            setEquipSearchResults(results)
            setDocSearchResults([])
            setSignalSearchResults([])
            setBanner(undefined)
        } else {
            // 전체 검색

            let folderId: string | undefined = undefined
            if (hogiValue && 0 < hogiValue.value.length) {
                folderId = hogiValue.value
            } else if (plantValue && 0 < plantValue.value.length) {
                folderId = plantValue.value
            } else if (companyValue && 0 < companyValue.value.length) {
                folderId = companyValue.value
            }

            const searchActive = async () => {
                if (typeValue === 'document') {
                    setBanner(`도면 검색 중...`)
                    const docName = 0 < docNameValue.length ? docNameValue : undefined
                    const docNumber = 0 < docNumberValue.length ? docNumberValue : undefined
                    const results = await Api.document.searchDocument(folderId, docName, docNumber, cntValue)
                    if (results) {
                        if (results.data.length === 0) {
                            setOkPopupValue({ message: '검색 결과가 없습니다.', ok: () => {} })
                        }
                        setSearchTotalCnt(results.cnt)
                        setDocSearchResults(results.data)
                        setEquipSearchResults([])
                        setSignalSearchResults([])
                    }
                } else if (typeValue === 'equipment') {
                    setBanner(`설비 검색 중...`)
                    const symbol = 0 < symbolValue.length ? symbolValue : undefined
                    const tag = 0 < tagValue.length ? tagValue : undefined
                    const results = await Api.equipment.searchEquipment(folderId, symbol, tag, cntValue)
                    if (results) {
                        if (results.data.length === 0) {
                            setOkPopupValue({ message: '검색 결과가 없습니다.', ok: () => {} })
                        }
                        setSearchTotalCnt(results.cnt)
                        setEquipSearchResults(results.data)
                        setDocSearchResults([])
                        setSignalSearchResults([])
                    }
                } else if (typeValue === 'signal') {
                    setBanner(`시그널 검색 중...`)
                    const signalDoc = 0 < signalDocValue.length ? signalDocValue : undefined
                    const signalTag = 0 < signalTagValue.length ? signalTagValue : undefined
                    if (userId) {
                        const results = await Api.document.searchSignal(folderId, signalDoc, signalTag, userId, cntValue)
                        if (results) {
                            if (results.data.length === 0) {
                                setOkPopupValue({ message: '검색 결과가 없습니다.', ok: () => {} })
                            }
                            setSearchTotalCnt(results.cnt)
                            setSignalSearchResults(results.data)
                        }
                    }
                    setEquipSearchResults([])
                    setDocSearchResults([])
                }
                setBanner(undefined)
            }

            if (typeValue === 'equipment' && (!folderId || !plantValue || !hogiValue)) {
                const confirmValue = {
                    title: '검색',
                    message: '검색량이 많아 다소 시간이 소요될 수 있습니다.',
                    submessage: '검색을 진행하시겠습니까?',
                    yes: searchActive,
                    no: () => {},
                }
                setWarningPopupValue(confirmValue)
            } else {
                searchActive()
            }
        }
    }, [
        cntValue,
        companyValue,
        docNameValue,
        docNumberValue,
        hogiValue,
        innerSearchCheckBox,
        plantValue,
        setBanner,
        setOkPopupValue,
        setWarningPopupValue,
        signalDocValue,
        signalTagValue,
        symbolValue,
        tagValue,
        typeValue,
        userId,
        selectedCanvas,
        tagValueInnerDoc,
        innerDocSymbolValue,
    ])

    // 사이드뷰 닫기 클릭
    const selectViewClosecase = () => {
        if (0 < docSearchResults.length || 0 < equipSearchResults.length || 0 < signalSearchResults.length) {
            setDocSearchResults([])
            setEquipSearchResults([])
            setSignalSearchResults([])
        } else {
            commonActive.onMenuChange('', userId, setCurrentMenu)
        }
    }

    function style(currentMenu: string) {
        return 'search' === currentMenu
            ? { transform: 'translateX(var(--SideMenuWidth))' }
            : { transform: 'translateX(calc(var(--SearchMenuWidth) * -1 ))' }
    }

    return (
        <div className="SearchMenu SideViewShadow" style={style(currentMenu)}>
            <DocumentSearchView hidden={'search' !== currentMenu} cnt={searchTotalCnt} results={docSearchResults} />
            <EquipmentSearchView hidden={'search' !== currentMenu} cnt={searchTotalCnt} results={equipSearchResults} />
            {/* 시그널 도면은 남부만 있다고함. */}
            {process.env.REACT_APP_DB === '남부' ? (
                <SignalSearchView hidden={'search' !== currentMenu} cnt={searchTotalCnt} results={signalSearchResults} />
            ) : null}

            <div className="Background SideViewBackground" />
            <div className="VerticalLine" />

            <span className="SideMenuLabel">검색설정</span>

            <CloseSideResultBtn onMenuChange={selectViewClosecase} />

            <div className="space"></div>

            {selectedCanvas ? (
                <div className="InnerSearchCheckBox" onClick={checkBoxChange}>
                    {innerSearchCheckBox ? CheckBox2.onImg : CheckBox2.offImg}
                    <div>현재 도면 내 검색</div>
                </div>
            ) : null}

            <div className="ControlsView">
                {selectedCanvas && innerSearchCheckBox ? (
                    <>
                        <Select
                            id="SymbolControlInnerDoc"
                            items={getSymbolItems(innerDocSymbolItems)}
                            placeHolder="심볼"
                            value={innerDocSymbolValue}
                            onChange={innerDocSymbolValueChange}
                        />
                        <TextField
                            id="TagValueInnerDoc"
                            value={tagValueInnerDoc}
                            placeHolder={process.env.REACT_APP_DB === '한수원' ? '기능위치' : '태그이름'}
                            onChange={TagValueChangeForDoc}
                        />
                    </>
                ) : (
                    <>
                        <Select
                            id="TypeControl"
                            items={TypeControlItems.current}
                            placeHolder="유형"
                            value={typeValue}
                            onChange={typeValueChange}
                        />
                        <Select
                            id="CompanyControl"
                            items={companyItems}
                            placeHolder="본부"
                            value={companyValue?.value}
                            onChange={companyValueChange}
                        />
                        <Select
                            id="PlantControl"
                            items={plantItems}
                            placeHolder="발전소"
                            value={plantValue?.value}
                            onChange={plantValueChange}
                        />

                        <Select id="HogiControl" items={hogiItems} placeHolder="호기" value={hogiValue?.value} onChange={hogiValueChange} />

                        <div hidden={typeValue !== 'equipment'}>
                            <Select
                                id="SymbolControl"
                                items={getSymbolItems(symbolItems)}
                                placeHolder="심볼"
                                value={symbolValue}
                                onChange={symbolValueChange}
                            />

                            <TextField
                                id="TagControl"
                                value={tagValue}
                                placeHolder={process.env.REACT_APP_DB === '한수원' ? '기능위치' : '태그이름'}
                                onChange={tagValueChange}
                            />
                        </div>
                        <div hidden={typeValue !== 'document'}>
                            <TextField
                                id="DocNumberControl"
                                value={docNumberValue}
                                placeHolder="도면번호"
                                onChange={docNumberValueChange}
                            />
                            <TextField id="DocNameControl" value={docNameValue} placeHolder="도면이름" onChange={docNameValueChange} />
                        </div>
                        <div hidden={typeValue !== 'signal'}>
                            <TextField
                                id="SignalDocControl"
                                value={signalDocValue}
                                placeHolder="도면이름"
                                onChange={signalDocValueChange}
                            />
                            <TextField
                                id="SignalTagControl"
                                value={signalTagValue}
                                placeHolder={process.env.REACT_APP_DB === '한수원' ? '기능위치' : '태그이름'}
                                onChange={signalTagValueChange}
                            />
                        </div>
                    </>
                )}

                <div className="CntTitle">
                    <div>적중 수</div>
                </div>
                <Select id="cnt" items={cntItems.current} placeHolder="적중 수" value={cntValue} onChange={cntValueChange} />
            </div>

            <div className="ResetButton" onClick={onClear}>
                {resetImage()}
                <div>검색 초기화</div>
            </div>

            <div className="SearchButton" onClick={onSearchClick}>
                <div>검색</div>
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
