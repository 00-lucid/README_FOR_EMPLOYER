import React from 'react'
import './PopupMenu.css'
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil'
import { useNavigate } from 'react-router-dom'
// 전역 Store
import { MainViewPopupStore, StatusStore, MarkUpStore, PMDCStore } from '../../../Store/statusStore'
import ThemeStore from '../../../Store/ThemeStore'
// Component
import Titlebar from './Titlebar'
import EquipmentLinkView from './EquipmentLinkView'
import WCDListView from '../../PopupView/WCDListView'
// Controller
import { PainterContext } from '../../../Store/painterContext'
import commonActive from '../../../Controller/useCommonActive'
// Lib
import crypt from '../../../Lib/crypt'
import commonFunc from '../../../Lib/commonFunc'

// PopupMenu - 메인뷰 오른쪽 위 화면
export default function PopupMenu() {
    // 전역 Store
    const [equipmentLinks, setEquipmentLinks] = useRecoilState(MainViewPopupStore.equipmentLinks)
    const setSelectEquipments = useSetRecoilState(StatusStore.selectEquipments)
    const x = useRecoilValue(MainViewPopupStore.x)
    const y = useRecoilValue(MainViewPopupStore.y)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const colorElements = useRecoilValue(ThemeStore.colorElements)
    const [controlMode, setControlMode] = useRecoilState(StatusStore.controlMode)
    const [isPMDC, setIsPMDC] = useRecoilState(PMDCStore.isPMDC)
    const setIsPMDCTagOn = useSetRecoilState(PMDCStore.isPMDCTagOn)
    const setSelPMDCEquipment = useSetRecoilState(PMDCStore.selPMDCEquipment)

    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)

    // MarkUp State
    const isMarkupChanged = useRecoilValue(MarkUpStore.isMarkupChanged)
    const setIsShowMarkupPopup = useSetRecoilState(MarkUpStore.isShowMarkupPopup)

    // 전역 컨텍스트
    const painterContext = React.useContext(PainterContext)

    if (!painterContext) throw new Error('Unhandled context')
    const { entityPainter } = painterContext

    // 라우터 경로 이동을 위한 네비게이터
    const navigate = useNavigate()

    const getPopupMenuItems = React.useMemo((): JSX.Element[] => {
        const elements: JSX.Element[] = []

        for (const link of equipmentLinks) {
            const isOpc = link.tagType === '002'

            if (isOpc) {
                if (link.opcDocId && link.opcDocVer && link.opcHogi && link.opcTagId && link.opcPlantCode && link.opcConnection) {
                    const title = `${link.opcHogi} ${link.opcConnection}`

                    elements.push(
                        <div
                            className="PopupItem"
                            key={link.opcDocId + link.opcDocVer + link.opcHogi}
                            onClick={() => {
                                if (controlMode === 'pmdc') {
                                    console.log("controlMode:", controlMode)
                                    setControlMode('select')
                                    setIsPMDC(false)
                                    setIsPMDCTagOn(false)
                                    setSelPMDCEquipment([])
                                }
                                // Event : MainView/Canvas/index.tsx -> 2. URL Params를 통해 도면 & 설비 설정
                                commonFunc.changeDocument(
                                    crypt.encrypt(link.opcDocId),
                                    crypt.encrypt(link.opcDocVer),
                                    crypt.encrypt(link.opcPlantCode),
                                    crypt.encrypt(link.opcTagId),
                                    isMarkupChanged,
                                    setIsShowMarkupPopup,
                                    navigate,
                                    setYesNoPopupValue
                                )
                            }}
                        >
                            <div className="Text">{title}</div>
                        </div>
                    )
                }
            } else {
                if (link.equipmentLinkId && link.funcDetail && link.linkObject) {
                    const title = `${link.equipmentLinkId}(${link.linkObject})`

                    elements.push(
                        <div
                            className="PopupItem"
                            key={link.equipmentLinkId + link.funcDetail + link.linkObject}
                            onClick={() => {
                                if (!selectedCanvas) return

                                // 사이드바 설비 아이템 선택 하이라이트
                                const newSelectEquipment = new Set<string>().add(link.tagId)
                                setSelectEquipments(newSelectEquipment)
                                // 캔버스 설비 페인팅
                                commonActive.canvasHandlesPaint(selectedCanvas, link.tagId, entityPainter, colorElements)

                                // 선택된 설비 팝업 띄움
                                setEquipmentLinks([link])
                            }}
                        >
                            <div className="Text">{title}</div>
                        </div>
                    )
                }
            }
        }

        return elements
    }, [
        equipmentLinks,
        entityPainter,
        selectedCanvas,
        setEquipmentLinks,
        setSelectEquipments,
        navigate,
        isMarkupChanged,
        setIsShowMarkupPopup,
        setYesNoPopupValue,
    ])

    const equipmentLink = equipmentLinks.length === 1 ? equipmentLinks[0] : undefined
    return (
        <>
            {controlMode === 'select' && (
                <div className="RightViewFrame">
                    {/* Titlebar - 도면 목록 드로우 */}
                    {selectedCanvas ? <Titlebar selectedCanvas={selectedCanvas} /> : null}
                    {/* quipmentLinkView - 설비 통지오더 팝업 */}
                    {selectedCanvas && equipmentLink ? (
                        <EquipmentLinkView equipmentLink={equipmentLink} selectedCanvas={selectedCanvas} />
                    ) : null}
                </div>
            )}

            {equipmentLinks.length > 1 ? (
                <div className="PopupMenu" tabIndex={3} style={{ left: x + 'px', top: y + 'px' }}>
                    {/*
                        getPopupMenuItems ->
                        클릭된 곳에 설비가 여러개 라면
                        설비 목록 팝업을 현재 마우스 좌표에 띄움.
                    */}
                    {getPopupMenuItems}
                </div>
            ) : null}

            <div className="CenterPopup">
                <WCDListView />
            </div>
        </>
    )
}
