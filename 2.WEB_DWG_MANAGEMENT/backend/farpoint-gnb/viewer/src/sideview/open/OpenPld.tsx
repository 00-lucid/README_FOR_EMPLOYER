import React from 'react'
import './OpenPld.css'
import { CloseSideMenu } from '../CloseSideMenu'
import { Select, SelectItem } from '../../common/Select'
import Repository from '../../Repository'
import { DocFolder, PldList } from '../../types'
import PldSearchView from './PldSearchView'
import { setBanner } from '../..'
import { StatusContext, pushCommand } from '../..'

export const OpenPldMenu = () => {
    const status = React.useContext(StatusContext)

    const [pldSearchResults, setPldSearchResults] = React.useState<PldList[]>([])
    // 사업소명
    const [companyItems, setCompanyItems] = React.useState<DocFolder[]>([])
    const getCompanyItems = (): SelectItem[] => {
        return getItems(companyItems)
    }
    // 발전소명
    const [plantItems, setPlantItems] = React.useState<DocFolder[]>([])
    const getPlantItems = (): SelectItem[] => {
        return getItems(plantItems)
    }

    // 사업소 선택 값
    const [companyValue, setCompanyValue] = React.useState('')
    // 발전소 선택 값
    const [plantValue, setPlantValue] = React.useState('')

    // 사업소 선택 이벤트
    const companyValueChange = async (value: string) => {
        setPlantItems([])
        setPlantValue('')
        setCompanyValue(value)

        if (0 < value.length) {
            const values = await Repository.getFolders(value)
            setPlantItems(values)
            setPlantValue('')
        }
    }
    // 발전소 선택 이벤트
    const plantValueChange = async (value: string) => {
        setPlantValue(value)
    }

    // 닫기 화살표 선택 이벤트
    const onCloseView = () => {
        setPldSearchResults([])
    }

    // Init.
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

    const onOpenClick = async () => {
        setBanner(`PLD 조회 중...`)

        // PLD 서버 조회
        const results = await Repository.searchPld(companyValue, plantValue)

        if (results.length === 0) {
            pushCommand({ name: 'requestOk', value: { message: '검색 결과가 없습니다.', ok: () => {} } })
        }

        // PLD 검색 결과
        setPldSearchResults(results)

        setBanner(undefined)
    }

    const selectViewClosecase = (menuId: string) => {
        if (0 < pldSearchResults.length) {
            setPldSearchResults([])
        } else {
            status.onMenuChange(menuId)
        }
    }

    return (
        <div className="OpenPldMenu SideViewShadow SideViewBackground" style={style(status.currentMenu)}>
            <PldSearchView
                hidden={'open' !== status.currentMenu}
                onCloseView={onCloseView}
                results={pldSearchResults}
            />
            <div className="Background SideViewBackground" />
            <div className="VerticalLine" />

            <span className="SideMenuLabel">PLD 조회</span>

            <CloseSideMenu onMenuChange={selectViewClosecase} />

            <div className="space"></div>

            <div className="ControlsView">
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
            </div>

            <div className="OpenButton" onClick={onOpenClick}>
                <div>조회</div>
            </div>
        </div>
    )
}

function style(currentMenu: string) {
    return 'open' === currentMenu
        ? { marginLeft: 'var(--SideMenuWidth)' }
        : { marginLeft: 'calc(var(--OpenPldMenuWidth) * -1 )' }
}
