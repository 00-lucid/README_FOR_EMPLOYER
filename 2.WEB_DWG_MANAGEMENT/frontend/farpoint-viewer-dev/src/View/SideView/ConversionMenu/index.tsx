import React from 'react'
import './ConversionMenu.css'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { useNavigate } from 'react-router-dom'
// 전역 Store
import { StatusStore, MarkUpStore, PldStore } from '../../../Store/statusStore'
// Lib
import { global } from '../../../Lib/util'

export function ConversionMenu() {
    // 라우터 경로 이동을 위한 네비게이터
    const navigate = useNavigate()

    // 전역 Store
    const currentMenu = useRecoilValue(StatusStore.currentMenu)
    const [pldMode, setPldMode] = useRecoilState(StatusStore.pldMode)
    const setWarningPopupValue = useSetRecoilState(StatusStore.warningPopupValue)

    const [docAndMarkupResetActive, setDocAndMarkupResetActive] = useRecoilState(StatusStore.docAndMarkupResetActive)
    const [pldResetActive, setPldResetActive] = useRecoilState(StatusStore.pldResetActive)

    const setCompanyValue = useSetRecoilState(StatusStore.companyValue)
    const setPlantValue = useSetRecoilState(StatusStore.plantValue)
    const setHogiValue = useSetRecoilState(StatusStore.hogiValue)

    // document
    const setCanvases = useSetRecoilState(StatusStore.canvases)
    const setSelectedCanvas = useSetRecoilState(StatusStore.selectedCanvas)
    const setSelectedDocFile = useSetRecoilState(StatusStore.selectedDocFile)
    const setSelectedDocKey = useSetRecoilState(StatusStore.selectedDocKey)
    const setControlMode = useSetRecoilState(StatusStore.controlMode)

    // markup
    const setMarkupPaths = useSetRecoilState(MarkUpStore.markupPaths)
    const setIsMarkupChanged = useSetRecoilState(MarkUpStore.isMarkupChanged)
    const setSelectedMarkupItems = useSetRecoilState(MarkUpStore.selectedMarkupItems)
    const setIsEditMarkupView = useSetRecoilState(MarkUpStore.isEditMarkupView)

    // pld
    const setCurrentPld = useSetRecoilState(PldStore.currentPld)
    const setPldHandle = useSetRecoilState(PldStore.pldHandle)
    const setPldEquipList = useSetRecoilState(PldStore.pldEquipList)
    const setIsSavePld = useSetRecoilState(PldStore.isSavePld)
    const setIsChangedPld = useSetRecoilState(PldStore.isChangedPld)
    const setPldSimbolList = useSetRecoilState(PldStore.pldSimbolList)
    const setPivotSimbolListHash = useSetRecoilState(PldStore.pivotSimbolListHash)
    const setPivotProcessListHash = useSetRecoilState(PldStore.pivotProcessListHash)

    const setPldDocumentList = useSetRecoilState(PldStore.pldDocumentList)
    const setIsEditPld = useSetRecoilState(PldStore.isEditPld)

    // 도면, 마크업 초기화
    const resetViewMode = React.useCallback(async () => {
        navigate('/')
        // 도면
        setSelectedDocFile(undefined)
        setSelectedCanvas(undefined)
        setSelectedDocKey('')
        setCanvases([])

        // 마크업
        setMarkupPaths([])
        setIsMarkupChanged(false)
        setSelectedMarkupItems(new Set<string>())
        setIsEditMarkupView(false)

        setCompanyValue(undefined)
        setPlantValue(undefined)
        setHogiValue(undefined)
    }, [
        navigate,
        setCanvases,
        setIsMarkupChanged,
        setMarkupPaths,
        setSelectedCanvas,
        setSelectedDocFile,
        setSelectedDocKey,
        setSelectedMarkupItems,
        setCompanyValue,
        setPlantValue,
        setHogiValue,
        setIsEditMarkupView,
    ])
    // Pld 초기화
    const resetPld = React.useCallback(async () => {
        setPldHandle('')
        setPldEquipList([])
        setIsSavePld(false)
        setIsChangedPld(false)
        setPldSimbolList([])
        setPivotSimbolListHash('')
        setPivotProcessListHash('')
        setPldDocumentList([])
        setIsEditPld(false)
    }, [
        setIsChangedPld,
        setIsSavePld,
        setPivotSimbolListHash,
        setPivotProcessListHash,
        setPldHandle,
        setPldEquipList,
        setPldSimbolList,
        setPldDocumentList,
        setIsEditPld,
    ])

    // 도면, 마크업 초기화 실행
    React.useEffect(() => {
        const fetch = async () => {
            await resetViewMode()
        }
        if (docAndMarkupResetActive) {
            global.log('도면, 마크업 초기화 실행::')
            fetch()
            setDocAndMarkupResetActive(false)
        }
    }, [docAndMarkupResetActive, resetViewMode, setDocAndMarkupResetActive])

    // Pld 초기화 실행
    React.useEffect(() => {
        const fetch = async () => {
            await resetPld()
            setPldResetActive(false)
        }

        if (pldResetActive) {
            global.log('Pld 초기화 실행::')
            fetch()
            setPldResetActive(false)
        }
    }, [pldResetActive, resetPld, setPldResetActive])

    const initPldMode = React.useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation()
            if (!pldMode) {
                // PLD 시작
                const confirmValue = {
                    title: 'PLD 모드',
                    message: 'PLD모드를 시작합니다.',
                    submessage: '현재 작업 중이던 내용은 모두 취소됩니다.',
                    yes: async () => {
                        setCurrentPld(undefined)
                        setPldMode(true)
                        setControlMode('pldSelect')
                        resetViewMode()
                    },
                    no: () => {},
                }
                setWarningPopupValue(confirmValue)
            }
        },
        [pldMode, resetViewMode, setControlMode, setPldMode, setWarningPopupValue, setCurrentPld]
    )

    const initViewerMode = React.useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation()
            if (pldMode) {
                // VIEW 시작
                const confirmValue = {
                    title: 'PLD 모드',
                    message: 'PLD모드를 종료합니다.',
                    submessage: '',
                    yes: async () => {
                        setPldMode(false)
                        setControlMode('select')
                        resetViewMode()
                        resetPld()
                    },
                    no: () => {},
                }
                setWarningPopupValue(confirmValue)
            }
        },
        [pldMode, resetPld, resetViewMode, setControlMode, setPldMode, setWarningPopupValue]
    )

    return (
        <div
            style={{
                position: 'absolute',
                display: !currentMenu ? 'flex' : 'none',
                left: '80px',
                top: '0px',
                writingMode: 'vertical-rl',
                zIndex: '0',
            }}
        >
            <div className="side-button view bottom-right" onClick={initViewerMode}>
                VIEW
            </div>
            <div className="side-button pld bottom-right" onClick={initPldMode}>
                PLD
            </div>
        </div>
    )
}
