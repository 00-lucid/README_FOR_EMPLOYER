import React from 'react'
import './EquipmentMenu.css'
import { useNavigate } from 'react-router-dom'
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil'
// 전역 Store
import { MarkUpStore, StatusStore, PMDCStore } from '../../../Store/statusStore'
import { PainterContext } from '../../../Store/painterContext'
// Component
import { CloseSideMenuBtn } from '../Component/CloseSideMenuBtn'
import TreeViewItemEl from '../../CommonView/TreeView/TreeViewItem'
import { TreeView } from '../../CommonView/TreeView'
import EquitmentFolder from '../Component/Equipment/EquipmentFolder'
import Select from '../../CommonView/Select'
import { TextField } from '../../CommonView/TextField'
// Api
import Api from '../../../Api'
// Lib
import { global } from '../../../Lib/util'
import cn from 'classnames'
import commonFunc from '../../../Lib/commonFunc'
import ThemeStore from '../../../Store/ThemeStore'
import crypt from '../../../Lib/crypt'

export function EquipmentMenu() {
    global.log('EquipmentMenu create')

    // 라우터 경로 이동을 위한 네비게이터
    const navigate = useNavigate()

    // 전역 Store
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    const [libId, setLibId] = useRecoilState(StatusStore.libId)
    const currentMenu = useRecoilValue(StatusStore.currentMenu)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const setBanner = useSetRecoilState(StatusStore.banner)
    const colorElements = useRecoilValue(ThemeStore.colorElements)
    const selectEquipments = useRecoilValue(StatusStore.selectEquipments)
    const isMarkupChanged = useRecoilValue(MarkUpStore.isMarkupChanged)
    const setIsShowMarkupPopup = useSetRecoilState(MarkUpStore.isShowMarkupPopup)
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)
    const [controlMode, setControlMode] = useRecoilState(StatusStore.controlMode)
    const [isPMDC, setIsPMDC] = useRecoilState(PMDCStore.isPMDC)
    const setIsPMDCTagOn = useSetRecoilState(PMDCStore.isPMDCTagOn)
    const setSelPMDCEquipment = useSetRecoilState(PMDCStore.selPMDCEquipment)

    // 전역 컨텍스트
    const painterContext = React.useContext(PainterContext)
    if (!painterContext) throw new Error('Unhandled context')
    const { entityPainter } = painterContext

    const [innerDocSymbolItems, setInnerDocSymbolItems] = React.useState<SymbolResult[]>([])
    const [innerDocSymbolValue, setInnerDocSymbolValue] = React.useState('')
    const [tagValueInnerDoc, setTagValueInnerDoc] = React.useState('')

    const [equipSearchResults, setEquipSearchResults] = React.useState<EquipmentResult[]>([])

    // 도면내 검색 -----------
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

    const getSymbolItems = (symbolItems: SymbolResult[]): SelectItem[] => {
        const values: SelectItem[] = []

        if (0 < symbolItems.length) values.push({ value: '', text: '-심볼 전체-' })

        for (const item of symbolItems) {
            values.push({ value: item.libId, text: item.libName })
        }

        return values
    }
    const innerDocSymbolValueChange = (item: SelectItem) => {
        const { value } = item
        setInnerDocSymbolValue(value)
    }
    const tagValueChangeForDoc = (value: string) => {
        setTagValueInnerDoc(value)
    }

    const onSearchClick = React.useCallback(async () => {
        if (!selectedCanvas) return
        // 현재 도면내 검색
        setBanner(`설비 검색 중...`)
        const tag = 0 < tagValueInnerDoc.length ? tagValueInnerDoc : undefined
        const { docId, docVer } = selectedCanvas.documentCtx

        const symbol = 0 < innerDocSymbolValue.length ? innerDocSymbolValue : undefined

        const results = await Api.equipment.searchEquipmentInnerDoc(docId, docVer, symbol, tag, undefined)
        if (results.length === 0) {
            setOkPopupValue({ message: '검색 결과가 없습니다.', ok: () => {} })
        }
        setEquipSearchResults(results)
        setBanner(undefined)
    }, [setBanner, selectedCanvas, tagValueInnerDoc, innerDocSymbolValue])

    const onSearchItemClick = React.useCallback(
        async (e: React.MouseEvent<HTMLElement>, item: EquipmentResult) => {
            if (e) e.stopPropagation()
            
            if (controlMode === 'pmdc') {
                console.log("controlMode:", controlMode)
                setControlMode('select')
                setIsPMDC(false)
                setIsPMDCTagOn(false)
                setSelPMDCEquipment([])
            }
            // Event : MainView/Canvas/index.tsx -> 2. URL Params를 통해 도면 & 설비 설정
            commonFunc.changeDocument(
                crypt.encrypt(item.docId),
                crypt.encrypt(item.docVer),
                crypt.encrypt(item.plantCode),
                crypt.encrypt(item.tagId),
                isMarkupChanged,
                setIsShowMarkupPopup,
                navigate,
                setYesNoPopupValue
            )
        },
        [navigate, isMarkupChanged, setIsShowMarkupPopup, setYesNoPopupValue]
    )
    // 도면내 검색 ----------- end

    // 사이드바 설비 폴더 눈동자 클릭 처리
    const sideBarEquipmentFolderShowSelect = React.useCallback(
        async (
            oldLibId: string | undefined,
            newLibId: string | undefined,
            selectedCanvas: CanvasContext | undefined,
            setLibId: (valOrUpdater: string | ((currVal: string | undefined) => string | undefined) | undefined) => void,
            entityPainter: any,
            setBanner: (message: string | undefined) => void
        ) => {
            const libId = commonFunc.checkLibId(oldLibId, newLibId)

            if (selectedCanvas) {
                // 설비 눈동자 아이콘 선택
                setLibId(libId)

                let handles: string[] = []
                if (libId) handles = commonFunc.getHandlesByLibId(selectedCanvas, libId)

                // 색상을 변경할 핸들 값이 많으면 오래걸림. -> 프로그래스바 표시.
                setBanner('설비 색상 변경 중...')
                await global.wait(0)
                // 설비 색상 변경
                // entityPainter.setEquipmentLibHandles(handles)

                /**
                 * highlight 컬러는 6가지로 정의한다.
                 * 1. red 1
                 * 2. green 3
                 * 3. blue 5
                 * 4. wood 12
                 * 5. orange 30
                 * 6. pink 6
                 */
                global.log('handles::', handles)
                console.log('selectedCanvas:', selectedCanvas)
                entityPainter.setEquipmentLibHandlesByColor(handles, colorElements)
                setBanner(undefined)
                
                setTimeout(() => {
                    var can=document.getElementById('documentCanvas');
                    if(can)can.style.position='fixed';
                    setTimeout(()=>{
                        var can=document.getElementById('documentCanvas');
                        if(can)can.style.position='absolute'
                    }, 0);
                }, 0); 
                
            }
        },
        [colorElements]
    )

    // 설비 선택여부 확인
    const equipmentCheckSelected = React.useCallback(
        (tagId: string) => {
            if (selectEquipments.has(tagId)) return true
            return false
        },
        [selectEquipments]
    )

    // 눈 모양 아이콘 - 전체 설정
    const showAllBackground = (
        <div
            className="ShowAllBackground"
            onClick={React.useCallback(
                async (e: React.MouseEvent<HTMLElement>) => {
                    e.stopPropagation()
                    // 설비 눈동자 아이콘 선택 & 설비 색상 변경
                    sideBarEquipmentFolderShowSelect(libId, 'all', selectedCanvas, setLibId, entityPainter, setBanner)
                },
                [libId, setLibId, selectedCanvas, entityPainter, sideBarEquipmentFolderShowSelect, setBanner]
            )}
        />
    )

    const showAllIcon =
        libId === 'all' ? TreeViewItemEl.normalOnIcon('var(--Background-Highlight)') : TreeViewItemEl.normalOffIcon('var(--Icon-Normal)')

    return (
        <div className="EquipmentMenu SideViewShadow SideViewBackground" style={style(currentMenu)}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">설비</span>
            <CloseSideMenuBtn />
            {showAllIcon}
            {showAllBackground}
            {/* 사이드뷰 설비 메뉴 트리 목록 */}
            {selectedCanvas ? (
                <>
                    <TreeView id="equipmentMenuTreeView">
                        {
                            <EquitmentFolder
                                folderList={selectedCanvas.documentCtx.equipmentList}
                                depth={0}
                                keyIdx={0}
                                sideBarEquipmentFolderShowSelect={sideBarEquipmentFolderShowSelect}
                            />
                        }
                    </TreeView>

                    <div className="InnerSearchView">
                        <div className="ControlsView">
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
                                onChange={tagValueChangeForDoc}
                            />
                        </div>
                        <div className="SearchButton" onClick={onSearchClick}>
                            <div>검색</div>
                        </div>
                        {/* 도면내 검색 결과 리스트 */}
                        <div className="ListView">
                            {equipSearchResults.map((equipemntObj, index) => {
                                const checkRes = equipmentCheckSelected(equipemntObj.tagId)
                                return (
                                    <div
                                        className="TreeViewItem"
                                        key={index}
                                        onClick={(e) => {
                                            onSearchItemClick(e, equipemntObj)
                                        }}
                                    >
                                        {/* SelectedLabel */}
                                        <div className={cn('Label ', checkRes ? 'SelectedLabel' : '')}>
                                            {/* 설비 아이콘 */}
                                            {TreeViewItemEl.equipmentIcon2(checkRes ? 'var(--Icon-Highlight)' : 'var(--Icon-Normal)')}
                                            {/* 설비 텍스트 */}
                                            {checkRes
                                                ? TreeViewItemEl.getSelectedText(equipemntObj.function, 0, '8px')
                                                : TreeViewItemEl.getNormalText(equipemntObj.function, 0, '8px')}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    )
}

function style(currentMenu: string) {
    return 'equipment' === currentMenu ? { marginLeft: 'var(--SideMenuWidth)' } : { marginLeft: 'calc(var(--DocumentMenuWidth) * -1 )' }
}
