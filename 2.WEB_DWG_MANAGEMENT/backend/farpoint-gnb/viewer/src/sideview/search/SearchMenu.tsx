import React from 'react'
import './SearchMenu.css'
import { CloseSideMenu } from '../CloseSideMenu'
import { Select, SelectItem } from '../../common/Select'
import { TextField } from '../../common/TextField'
import Repository from '../../Repository'
import { DocFolder, EquipmentResult, DocumentResult, SymbolResult, SearchSignalResult } from '../../types'
import DocumentSearchView from './DocumentSearchView'
import EquipmentSearchView from './EquipmentSearchView'
import SignalSearchView from './SignalSearchView'
import { setBanner } from '../..'
import { StatusContext, pushCommand } from '../..'
import { AppContext } from '../../'

export function SearchMenu() {
    const status = React.useContext(StatusContext)
    const appContext = React.useContext(AppContext)

    const [typeValue, setTypeValue] = React.useState('document')
    const [companyValue, setCompanyValue] = React.useState('')
    const [plantValue, setPlantValue] = React.useState('')
    const [hogiValue, setHogiValue] = React.useState('')
    const [symbolValue, setSymbolValue] = React.useState('')
    const [tagValue, setTagValue] = React.useState('')
    const [docNumberValue, setDocNumberValue] = React.useState('')
    const [docNameValue, setDocNameValue] = React.useState('')
    const [signalDocValue, setSignalDocValue] = React.useState('')
    const [signalTagValue, setSignalTagValue] = React.useState('')
    const [docSearchResults, setDocSearchResults] = React.useState<DocumentResult[]>([])
    const [equipSearchResults, setEquipSearchResults] = React.useState<EquipmentResult[]>([])
    const [signalSearchResults, setSignalSearchResults] = React.useState<SearchSignalResult[]>([])

    const onClear = () => {
        setTypeValue('document')
        setCompanyValue('')
        setPlantValue('')
        setHogiValue('')
        setSymbolValue('')
        setTagValue('')
        setDocNumberValue('')
        setDocNameValue('')
        setSignalDocValue('')
        setSignalTagValue('')

        setDocSearchResults([])
        setEquipSearchResults([])
        setSignalSearchResults([])

        // setCompanyItems([])
        setPlantItems([])
        setHogiItems([])
        setSymbolItems([])
    }

    const onCloseView = () => {
        setDocSearchResults([])
        setEquipSearchResults([])
        setSignalSearchResults([])
    }

    React.useEffect(() => {
        async function fetchData() {
            const values = await Repository.getRootFolder()
            setCompanyItems(values)
        }

        // if (companyItems.length === 0) {
        fetchData()
        // }
    }, [])

    function getItems(items: DocFolder[]): SelectItem[] {
        const values: SelectItem[] = []

        if (0 < items.length) values.push({ value: '', text: '-전체-' })

        for (const item of items) {
            values.push({ value: item.folderId, text: item.folderName })
        }

        return values
    }

    const [companyItems, setCompanyItems] = React.useState<DocFolder[]>([])
    const getCompanyItems = (): SelectItem[] => {
        return getItems(companyItems)
    }

    const [plantItems, setPlantItems] = React.useState<DocFolder[]>([])
    const getPlantItems = (): SelectItem[] => {
        return getItems(plantItems)
    }

    const [hogiItems, setHogiItems] = React.useState<DocFolder[]>([])
    const getHogiItems = (): SelectItem[] => {
        return getItems(hogiItems)
    }

    const [symbolItems, setSymbolItems] = React.useState<SymbolResult[]>([])
    const getSymbolItems = (): SelectItem[] => {
        const values: SelectItem[] = []

        if (0 < symbolItems.length) values.push({ value: '', text: '-전체-' })

        for (const item of symbolItems) {
            values.push({ value: item.libId, text: item.libName })
        }

        return values
    }

    const typeValueChange = (value: string) => {
        setTypeValue(value)
    }
    const companyValueChange = async (value: string) => {
        setPlantItems([])
        setPlantValue('')
        setHogiItems([])
        setHogiValue('')
        setSymbolItems([])
        setSymbolValue('')

        setCompanyValue(value)

        if (0 < value.length) {
            const values = await Repository.getFolders(value)
            setPlantItems(values)
        }
    }
    const plantValueChange = async (value: string) => {
        setHogiItems([])
        setHogiValue('')
        setSymbolItems([])
        setSymbolValue('')

        setPlantValue(value)

        for (const item of plantItems) {
            if (item.folderId === value) {
                const results = await Repository.getSymbolsByPlant(item.plantCode)
                setSymbolItems(results)
            }
        }

        if (0 < value.length) {
            const values = await Repository.getFolders(value)
            setHogiItems(values)
        }
    }

    const hogiValueChange = async (value: string) => {
        setHogiValue(value)
    }
    const symbolValueChange = (value: string) => {
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

    const onSearchClick = async () => {
        let folderId: string | undefined = undefined

        if (0 < hogiValue.length) {
            folderId = hogiValue
        } else if (0 < plantValue.length) {
            folderId = plantValue
        } else if (0 < companyValue.length) {
            folderId = companyValue
        }

        if (typeValue === 'document') {
            setBanner(`도면 검색 중...`)
            const docName = 0 < docNameValue.length ? docNameValue : undefined
            const docNumber = 0 < docNumberValue.length ? docNumberValue : undefined

            const results = await Repository.searchDocument(folderId, docName, docNumber)

            if (results.length === 0) {
                pushCommand({ name: 'requestOk', value: { message: '검색 결과가 없습니다.', ok: () => {} } })
            }

            setDocSearchResults(results)
            setEquipSearchResults([])
            setSignalSearchResults([])
        } else if (typeValue === 'equipment') {
            setBanner(`설비 검색 중...`)
            const symbol = 0 < symbolValue.length ? symbolValue : undefined
            const tag = 0 < tagValue.length ? tagValue : undefined

            const results = await Repository.searchEquipment(folderId, symbol, tag)

            if (results.length === 0) {
                pushCommand({ name: 'requestOk', value: { message: '검색 결과가 없습니다.', ok: () => {} } })
            }

            setEquipSearchResults(results)
            setDocSearchResults([])
            setSignalSearchResults([])
        } else if (typeValue === 'signal') {
            setBanner(`시그널 검색 중...`)
            const signalDoc = 0 < signalDocValue.length ? signalDocValue : undefined
            const signalTag = 0 < signalTagValue.length ? signalTagValue : undefined

            if (appContext.userId) {
                const results = await Repository.searchSignal(folderId, signalDoc, signalTag, appContext.userId)

                if (results.length === 0) {
                    pushCommand({ name: 'requestOk', value: { message: '검색 결과가 없습니다.', ok: () => {} } })
                }

                setSignalSearchResults(results)
            }

            setEquipSearchResults([])
            setDocSearchResults([])
        }

        setBanner(undefined)
    }

    const selectViewClosecase = (menuId: string) => {
        if (0 < docSearchResults.length || 0 < equipSearchResults.length || 0 < signalSearchResults.length) {
            setDocSearchResults([])
            setEquipSearchResults([])
            setSignalSearchResults([])
        } else {
            status.onMenuChange(menuId)
        }
    }

    function style(currentMenu: string) {
        return 'search' === currentMenu
            ? { transform: 'translateX(var(--SideMenuWidth))' }
            : { transform: 'translateX(calc(var(--SearchMenuWidth) * -1 ))' }
    }

    return (
        <div className="SearchMenu SideViewShadow" style={style(status.currentMenu)}>
            <DocumentSearchView
                hidden={'search' !== status.currentMenu}
                onCloseView={onCloseView}
                results={docSearchResults}
            />
            <EquipmentSearchView
                hidden={'search' !== status.currentMenu}
                onCloseView={onCloseView}
                results={equipSearchResults}
            />
            <SignalSearchView
                hidden={'search' !== status.currentMenu}
                onCloseView={onCloseView}
                results={signalSearchResults}
            />

            <div className="Background SideViewBackground" />
            <div className="VerticalLine" />

            <span className="SideMenuLabel">검색설정</span>

            <CloseSideMenu onMenuChange={selectViewClosecase} />
            <div className="space"></div>

            <div className="ControlsView">
                <Select
                    id="TypeControl"
                    items={[
                        { value: 'document', text: '도면' },
                        { value: 'equipment', text: '설비' },
                        { value: 'signal', text: '시그널' }
                    ]}
                    placeHolder="유형"
                    value={typeValue}
                    onChange={typeValueChange}
                />
                <Select
                    id="CompanyControl"
                    items={getCompanyItems()}
                    placeHolder="본부"
                    value={companyValue}
                    onChange={companyValueChange}
                />
                <Select
                    id="PlantControl"
                    items={getPlantItems()}
                    placeHolder="발전소"
                    value={plantValue}
                    onChange={plantValueChange}
                />

                <Select
                    id="HogiControl"
                    items={getHogiItems()}
                    placeHolder="호기"
                    value={hogiValue}
                    onChange={hogiValueChange}
                />

                <div hidden={typeValue !== 'equipment'}>
                    <Select
                        id="SymbolControl"
                        items={getSymbolItems()}
                        placeHolder="심볼"
                        value={symbolValue}
                        onChange={symbolValueChange}
                    />

                    <TextField id="TagControl" value={tagValue} placeHolder="태그이름" onChange={tagValueChange} />
                </div>
                <div hidden={typeValue !== 'document'}>
                    <TextField
                        id="DocNumberControl"
                        value={docNumberValue}
                        placeHolder="도면번호"
                        onChange={docNumberValueChange}
                    />
                    <TextField
                        id="DocNameControl"
                        value={docNameValue}
                        placeHolder="도면이름"
                        onChange={docNameValueChange}
                    />
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
                        placeHolder="태그이름"
                        onChange={signalTagValueChange}
                    />
                </div>
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
