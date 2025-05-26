import React from 'react'
import './OpenPld.css'
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore, PldStore } from '../../../../Store/statusStore'
import AppStore from '../../../../Store/appStore'
// Component
import Select from '../../../CommonView/Select'
import PldSearchView from './PldSearchView'
import { CloseSideResultBtn } from '../../Component/CloseSideMenuBtn'
// Api
import Api from '../../../../Api'
// Controller
import commonActive from '../../../../Controller/useCommonActive'

export const OpenPldMenu = () => {
    // 전역 Store
    const [currentMenu, setCurrentMenu] = useRecoilState(StatusStore.currentMenu)
    const userId = useRecoilValue(AppStore.userId)
    const mapFolderList = useRecoilValue(StatusStore.mapFolderList)
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    const setBanner = useSetRecoilState(StatusStore.banner)

    const [openPlantValue, setOpenPlantValue] = useRecoilState(PldStore.openPlantValue)
    const [openCompanyValue, setOpenCompanyValue] = useRecoilState(PldStore.openCompanyValue)
    const [openPlantItems, setOpenPlantItems] = useRecoilState(PldStore.openPlantItems)
    const openCompanyItems = useRecoilValue(PldStore.openCompanyItems)

    // State
    const [pldSearchResults, setPldSearchResults] = React.useState<PldList[]>([])

    // 사업소 셀렉트 변경 이벤트
    const companyValueChange = React.useCallback(
        (item: SelectItem) => {
            setOpenCompanyValue(item.value)
            setOpenPlantValue('')
            const newPlantItems = mapFolderList.get(item.value)
            if (newPlantItems) {
                setOpenPlantItems([{ value: '', text: '-전체-' }, ...newPlantItems])
            }
        },
        [mapFolderList, setOpenCompanyValue, setOpenPlantItems, setOpenPlantValue]
    )

    // 발전소 선택 이벤트
    const plantValueChange = async (item: SelectItem) => {
        setOpenPlantValue(item.value)
    }

    // PLD 조회
    const onOpenClick = async () => {
        setBanner(`PLD 조회 중...`)
        // PLD 서버 조회
        const results = await Api.pld.searchPld(openCompanyValue, openPlantValue)
        if (results === false) {
            setOkPopupValue({ message: 'PLD 검색 API ERROR', ok: () => {} })
        } else if (results.length === 0) {
            setOkPopupValue({ message: '검색 결과가 없습니다.', ok: () => {} })
        }
        // PLD 검색 결과
        setPldSearchResults(results)
        setBanner(undefined)
    }

    // PLD 조회 사이드뷰 닫기 클릭
    const selectViewClosecase = () => {
        if (0 < pldSearchResults.length) {
            setPldSearchResults([])
        } else {
            commonActive.onMenuChange('', userId, setCurrentMenu)
        }
    }

    return (
        <div className="OpenPldMenu SideViewShadow SideViewBackground" style={style(currentMenu)}>
            {/* PLD 조회 결과 사이드뷰 */}
            <PldSearchView hidden={'open' !== currentMenu} pldSearchResults={pldSearchResults} />
            <div className="Background SideViewBackground" />
            <div className="VerticalLine" />

            <span className="SideMenuLabel">PLD 조회</span>

            <CloseSideResultBtn onMenuChange={selectViewClosecase} />

            <div className="space"></div>

            <div className="ControlsView">
                <Select
                    id="CompanyControl"
                    items={openCompanyItems}
                    placeHolder="본부"
                    value={openCompanyValue}
                    onChange={companyValueChange}
                />
                <Select id="PlantControl" items={openPlantItems} placeHolder="발전소" value={openPlantValue} onChange={plantValueChange} />
            </div>

            <div className="OpenButton" onClick={onOpenClick}>
                <div>조회</div>
            </div>
        </div>
    )
}

function style(currentMenu: string) {
    return 'open' === currentMenu ? { marginLeft: 'var(--SideMenuWidth)' } : { marginLeft: 'calc(var(--OpenPldMenuWidth) * -1 )' }
}
