import React, { useEffect } from 'react'
import './Toolbar.css'
import * as icons from './ToolbarIcons'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import AppStore from '../../../Store/appStore'
import ThemeStore from '../../../Store/ThemeStore'
import { StatusStore, MarkUpStore, WCDStore, PMDCStore, PldStore, MainViewPopupStore, ProcedureStore } from '../../../Store/statusStore'
import { ControllerContext } from '../../../Store/controllerContext'
import { PainterContext } from '../../../Store/painterContext'
// Api
import Api from '../../../Api'
// Lib
import { global } from '../../../Lib/util'
import { getEntities } from '../../../Lib/canvasUtils'
import cn from 'classnames'
// Component
import {
    autoPath,
    choicePath,
    closeCloudPath,
    controlCloudPath,
    drainPath,
    openCloudPath,
    pldCheckedPath,
    pldCloseValvePath,
    pldControlValvePath,
    pldOpenValvePath,
    settingPath,
    vctPath,
    ventPath,
} from '../Canvas/Pld/PldIcons'
import MarkupPopup from '../../PopupView/MarkupPopup'
import commonActive from '../../../Controller/useCommonActive'
import { getAllDetail } from '../../../Api/pi'

type Props = {
    hideEditMarkup: () => void
    undo: () => void
    redo: () => void
    viewer: any
}

const Toolbar = ({ hideEditMarkup, undo, redo, viewer }: Props) => {
    // 전역 Stroe
    // User State
    const userId = useRecoilValue(AppStore.userId)
    const [userContext, setUserContext] = useRecoilState(AppStore.userContext)
    const toggleTheme = useRecoilValue(ThemeStore.toggleTheme)
    const setTheme = useSetRecoilState(ThemeStore.theme)
    const setMimicList = useSetRecoilState(StatusStore.MimicList)
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    const setIsPrintPopup = useSetRecoilState(StatusStore.isPrintPopup)

    // Status State
    const pldMode = useRecoilValue(StatusStore.pldMode)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const [controlMode, setControlMode] = useRecoilState(StatusStore.controlMode)
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)
    const okPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    const selectedDocKey = useRecoilValue(StatusStore.selectedDocKey)
    const selectHandleX = useRecoilValue(MainViewPopupStore.x)
    const selectHandleY = useRecoilValue(MainViewPopupStore.y)
    const setIsShowPiMimicPopup = useSetRecoilState(StatusStore.isShowPiMimicPopup)
    const setBanner = useSetRecoilState(StatusStore.banner)
    const [currentMenu, setCurrentMenu] = useRecoilState(StatusStore.currentMenu)

    // MarkUp State
    const [isEditMarkupView, setIsEditMarkupView] = useRecoilState(MarkUpStore.isEditMarkupView)
    const isMarkupChanged = useRecoilValue(MarkUpStore.isMarkupChanged)
    const undoList = useRecoilValue(MarkUpStore.undoList)
    const redoList = useRecoilValue(MarkUpStore.redoList)
    const selectedMarkupItems = useRecoilValue(MarkUpStore.selectedMarkupItems)

    const hasMarkups = useRecoilValue(MarkUpStore.hasMarkups)
    const setIsShowMarkupPopup = useSetRecoilState(MarkUpStore.isShowMarkupPopup)
    const [isZoomExtends, setIsZoomExtends] = useRecoilState(MarkUpStore.isZoomExtends)

    // Pld State
    const pldHandleEntityType = useRecoilValue(PldStore.pldHandleEntityType)
    const [pldHandle, setPldHandle] = useRecoilState(PldStore.pldHandle)
    const [pldEquipList, setPldEquipList] = useRecoilState(PldStore.pldEquipList)
    const pldDocumentList = useRecoilValue(PldStore.pldDocumentList)
    const [pldSimbolList, setPldSimbolList] = useRecoilState(PldStore.pldSimbolList)
    const setPldViewChange = useSetRecoilState(PldStore.pldViewChange)

    const [isEditPld, setIsEditPld] = useRecoilState(PldStore.isEditPld)

    // WCD
    const [wcdEquipments, setWCDEquipments] = useRecoilState(WCDStore.wcdEquipments)
    const [selWCDEquipment, setSelWCDEquipment] = useRecoilState(WCDStore.selWCDEquipment)
    const setWCDTagDoc = useSetRecoilState(WCDStore.wcdTagDoc)
    const setWCDTagItem = useSetRecoilState(WCDStore.wcdTagItem)

    // PMDC
    const [isPMDC, setIsPMDC] = useRecoilState(PMDCStore.isPMDC)
    const [isPMDCChanged, setIsPMDCChanged] = useRecoilState(PMDCStore.isPMDCChanged)
    const [PMGraph, setPMGraph] = useRecoilState(PMDCStore.PMGraph)
    const setPMDCEquipments = useSetRecoilState(PMDCStore.pmdcEquipments)
    const setSelPMDCEquipment = useSetRecoilState(PMDCStore.selPMDCEquipment)
    const setIsPMDCTagOn = useSetRecoilState(PMDCStore.isPMDCTagOn)
    const setProcedureSteps = useSetRecoilState(ProcedureStore.procedureSteps)
    const setSelProcedureEquipments = useSetRecoilState(ProcedureStore.selProcedureEquipments)
    const [isFix, setIsFix] = useRecoilState(ProcedureStore.isFix)

    //Procedure
    const [isProcedureManagerVisible, setIsProcedureManagerVisible] = useRecoilState(ProcedureStore.isProcedureManagerVisible)
    const [isHideSide, setIsHideSide] = useRecoilState(ProcedureStore.isHideSide)

    // 전역 컨텍스트
    const controllerContext = React.useContext(ControllerContext)
    const painterContext = React.useContext(PainterContext)
    const setIsShowOption = useSetRecoilState(StatusStore.isShowOption)

    if (!controllerContext || !painterContext) throw new Error('Unhandled context')
    // Canvas Controller
    const { canvasController } = controllerContext
    const { entityPainter } = painterContext

    const getWCDEquipments = React.useCallback(
        async (init: boolean) => {
            try {
                if (init) {
                    setWCDEquipments([])
                } else {
                    setBanner(`WCD 데이터 갱신 중...`)
                    try {
                        if (selectedCanvas) {
                            const getWCDEquipments = await Api.wcd.getWCDEquipments(selectedCanvas?.documentCtx)
                            if (getWCDEquipments.length === 0) {
                                okPopupValue({
                                    message: 'WCD 정보가 없습니다.',
                                    ok: () => {
                                        setControlMode('select')
                                        setBanner(undefined)
                                        return
                                    },
                                })
                            }
                            setWCDEquipments(getWCDEquipments)
                        }
                    } catch (e) {
                        console.log('equ:', e)
                    }

                    setBanner(undefined)
                }
            } catch (e) {
                console.log(e)
                setBanner(undefined)
            }
        },
        [selectedCanvas, setWCDEquipments]
    )

    // 도면 즐겨찾기 현재 상태
    const isFavorite = React.useMemo(() => {
        if (userContext) {
            for (const value of userContext.favorite?.documents) {
                if (value.docId === selectedCanvas?.documentCtx.docId) {
                    return true
                }
            }
        }

        return false
    }, [selectedCanvas?.documentCtx.docId, userContext])

    // 도면 즐겨찾기 토글 이벤트
    const toggleFavorite = () => {
        if (selectedCanvas?.documentCtx) {
            const documentCtx = selectedCanvas?.documentCtx
            const { docId, docVer } = documentCtx
            isFavorite
                ? // 도면 즐겨찾기 삭제
                  commonActive.removeDocumentFavorite(docId, docVer, userContext, userId, Api, setUserContext)
                : // 도면 즐겨찾기 추가
                  addDocumentFavorite(documentCtx)
            //isFavorite ? removeDocumentFavorite(documentCtx) : addDocumentFavorite(documentCtx)
        }
    }

    const addDocumentFavorite = React.useCallback(
        async (value: FavoriteDocument) => {
            if (userContext) {
                for (let i = 0; i < userContext.favorite.documents.length; i++) {
                    const item = userContext.favorite.documents[i]

                    if (item.docId === value.docId && item.docVer === value.docVer) return
                }

                const newDocs = userContext.favorite.documents.slice()
                newDocs.unshift(value)

                const newValue = { ...userContext, favorite: { ...userContext.favorite, documents: newDocs } }

                if (userId) {
                    await Api.auth.setUserContext(userId, newValue)
                }

                setUserContext(newValue)
            }
        },
        [userContext, userId, setUserContext]
    )

    // PLD 편집 버튼 클릭
    const toggleEditPld = React.useCallback(() => {
        if (isEditPld) {
            setPldHandle('')
            setControlMode('pldSelect')
            setIsEditPld(false)
        } else {
            setControlMode('pld')
            setIsEditPld(true)
        }
    }, [isEditPld, setIsEditPld, setControlMode, setPldHandle])

    // 마크업 리스트 버튼 클릭
    const markupListBtnClick = React.useCallback(() => {
        global.log('markupListBtnClick:', hasMarkups, isMarkupChanged)
        if (hasMarkups) {
            if (isMarkupChanged) {
                const confirmValue = {
                    message: '변경된 마크업을 저장할까요?',
                    yes: () => {
                        setIsShowMarkupPopup({
                            message: 'save',
                            nextAction: () => {
                                hideEditMarkup()
                                setIsEditMarkupView(false)
                                setIsShowMarkupPopup({ message: 'list', nextAction: hideEditMarkup })
                            },
                        })
                    },
                    no: () => {
                        hideEditMarkup()
                        setIsEditMarkupView(false)
                        setIsShowMarkupPopup({ message: 'list', nextAction: hideEditMarkup })
                    },
                }
                setYesNoPopupValue(confirmValue)
            } else {
                setIsShowMarkupPopup({ message: 'list', nextAction: hideEditMarkup })
            }
            if (isEditMarkupView) {
                setIsEditMarkupView(false)
            }
        }
    }, [hasMarkups, isEditMarkupView, isMarkupChanged, hideEditMarkup, setIsEditMarkupView, setYesNoPopupValue, setIsShowMarkupPopup])
    // 마크업 불러오기 버튼 클릭
    const markupLoadListBtnClick = React.useCallback(() => {
        global.log('markupLoadListBtnClick:')
        if (hasMarkups) {
            if (isMarkupChanged) {
                const confirmValue = {
                    message: '변경된 마크업을 저장할까요?',
                    yes: () => {
                        setIsShowMarkupPopup({
                            message: 'save',
                            nextAction: () => {
                                setIsShowMarkupPopup({ message: 'load', nextAction: () => {} })
                            },
                        })
                    },
                    no: () => {
                        hideEditMarkup()
                        setIsShowMarkupPopup({ message: 'load', nextAction: () => {} })
                    },
                    nextAction: () => {},
                }
                setYesNoPopupValue(confirmValue)
            } else {
                setIsShowMarkupPopup({ message: 'load', nextAction: () => {} })
            }
        }
    }, [hasMarkups, hideEditMarkup, isMarkupChanged, setYesNoPopupValue, setIsShowMarkupPopup])

    // 마크업 편집 클릭
    const toggleEditMarkup = React.useCallback(async () => {
        if (isEditMarkupView) {
            if (isMarkupChanged) {
                global.log('toggleEditMarkup:inner ')
                const confirmValue = {
                    message: '변경된 마크업을 저장할까요?',
                    yes: () => {
                        setIsShowMarkupPopup({
                            message: 'save',
                            nextAction: () => {
                                setIsEditMarkupView(true)
                            },
                        })
                    },
                    no: () => {
                        setIsEditMarkupView(false)
                        hideEditMarkup()
                    },
                }
                setYesNoPopupValue(confirmValue)
            } else {
                setIsEditMarkupView(false)
                hideEditMarkup()
            }
        } else if (controlMode === 'wcd') {
            await getWCDEquipments(true)
            if (selWCDEquipment) setSelWCDEquipment([])
            setWCDTagDoc([])
            setWCDTagItem([])
            hideEditMarkup()
            setIsEditMarkupView(true)
        } else if (controlMode === 'pmdc') {
            if (isPMDCChanged) {
                const confirmValue = {
                    message: 'PMDC 설정 내용을 저장하지 않고 나가시겠습니까?',
                    yes: async () => {
                        hideEditMarkup()
                        setIsEditMarkupView(true)
                        setIsPMDC(false)
                        setIsPMDCTagOn(false)
                        setSelPMDCEquipment([])
                    },
                    no: () => {},
                }
                setYesNoPopupValue(confirmValue)
            } else {
                hideEditMarkup()
                setIsEditMarkupView(true)
                setIsPMDC(false)
                setIsPMDCTagOn(false)
                setSelPMDCEquipment([])
            }
        } else {
            setIsEditMarkupView(true)
            hideEditMarkup()
        }
    }, [
        controlMode,
        isEditMarkupView,
        setIsEditMarkupView,
        hideEditMarkup,
        isMarkupChanged,
        setYesNoPopupValue,
        setIsShowMarkupPopup,
        setIsPMDCTagOn,
        isPMDCChanged,
        getWCDEquipments,
        selWCDEquipment,
        setIsPMDC,
        setSelPMDCEquipment,
        setSelWCDEquipment,
        setWCDTagDoc,
        setWCDTagItem,
    ])

    const toggleWCD = React.useCallback(async () => {
        if (controlMode === 'wcd') {
            setControlMode('select')
            await getWCDEquipments(true)
            if (selWCDEquipment) setSelWCDEquipment([])
            setWCDTagDoc([])
            setWCDTagItem([])
        } else if (controlMode === 'pmdc') {
            if (isPMDCChanged) {
                const confirmValue = {
                    message: 'PMDC 설정 내용을 저장하지 않고 나가시겠습니까?',
                    yes: async () => {
                        hideEditMarkup()
                        setControlMode('wcd')
                        setIsEditMarkupView(false)
                        setIsPMDC(false)
                        setIsPMDCTagOn(false)
                        setSelPMDCEquipment([])
                    },
                    no: () => {},
                }
                setYesNoPopupValue(confirmValue)
            } else {
                hideEditMarkup()
                setControlMode('wcd')
                setIsEditMarkupView(false)
                setIsPMDC(false)
                setIsPMDCTagOn(false)
                setSelPMDCEquipment([])
                await getWCDEquipments(false)
            }
        } else if (isEditMarkupView) {
            if (isMarkupChanged) {
                const confirmValue = {
                    message: '변경된 마크업을 저장할까요?',
                    yes: () => {
                        setIsShowMarkupPopup({
                            message: 'save',
                            nextAction: () => {
                                setIsEditMarkupView(true)
                            },
                        })
                    },
                    no: () => {
                        setIsEditMarkupView(false)
                        hideEditMarkup()
                    },
                }
                setYesNoPopupValue(confirmValue)
            } else {
                setIsEditMarkupView(false)
                hideEditMarkup()
            }
        } else {
            hideEditMarkup()
            setControlMode('wcd')
            setIsEditMarkupView(false)
            await getWCDEquipments(false)
        }
    }, [
        controlMode,
        setControlMode,
        hideEditMarkup,
        setIsEditMarkupView,
        setWCDTagDoc,
        setWCDTagItem,
        isPMDCChanged,
        getWCDEquipments,
        selWCDEquipment,
        setIsPMDC,
        setIsPMDCTagOn,
        setSelPMDCEquipment,
        setSelWCDEquipment,
        setYesNoPopupValue,
        isMarkupChanged,
        isEditMarkupView,
    ])

    const getPMDCEquipments = React.useCallback(
        async (selectedCanvas: any, userContext: any) => {
            setBanner(`PMDC 데이터 수신 중...`)
            try {
                if (selectedCanvas?.documentCtx) {
                    if (userContext?.userId) {
                        const getPMDCEquipments = await Api.pmdc.getPMDCEquipments(selectedCanvas.documentCtx, '')
                        setPMDCEquipments(getPMDCEquipments)
                    }
                }
            } catch (e) {
                console.log('equ:', e)
            }

            setBanner(undefined)
        },
        [setPMDCEquipments]
    )

    const togglePMDC = React.useCallback(async () => {
        if (controlMode === 'pmdc') {
            if (isPMDCChanged) {
                const confirmValue = {
                    message: 'PMDC 설정 내용을 저장하지 않고 나가시겠습니까?',
                    yes: async () => {
                        hideEditMarkup()
                        setIsEditMarkupView(false)
                        setIsPMDC(false)
                        setIsPMDCTagOn(false)
                        setSelPMDCEquipment([])
                    },
                    no: () => {},
                }
                setYesNoPopupValue(confirmValue)
            } else {
                hideEditMarkup()
                setIsEditMarkupView(false)
                setIsPMDC(false)
                setIsPMDCTagOn(false)
                setSelPMDCEquipment([])
            }
        } else if (isProcedureManagerVisible) {
            const confirmValue = {
                message: `작성중인 절차서가 모두 사라집니다.
                진행하시겠습니까?`,
                yes: async () => {
                    setIsProcedureManagerVisible(false)
                    setControlMode('select')
                    setIsHideSide(true)
                    setCurrentMenu('')
                    setProcedureSteps([])
                    setSelProcedureEquipments([])
                    setIsFix(false)
                    hideEditMarkup()
                    setIsPMDCChanged(false)
                    setIsPMDC(false)
                    setIsPMDCTagOn(true)
                    await getPMDCEquipments(selectedCanvas, userContext)
                    setControlMode('pmdc')
                    setIsEditMarkupView(false)
                },
                no: () => {},
            }
            setYesNoPopupValue(confirmValue)
        } else if (isEditMarkupView) {
            if (isMarkupChanged) {
                const confirmValue = {
                    message: '변경된 마크업을 저장할까요?',
                    yes: () => {
                        setIsShowMarkupPopup({
                            message: 'save',
                            nextAction: () => {
                                setIsEditMarkupView(true)
                            },
                        })
                    },
                    no: () => {
                        setIsEditMarkupView(false)
                        hideEditMarkup()
                    },
                }
                setYesNoPopupValue(confirmValue)
            } else {
                setIsEditMarkupView(false)
                hideEditMarkup()
            }
        } else {
            hideEditMarkup()
            setIsPMDCChanged(false)
            setIsPMDC(false)
            setIsPMDCTagOn(true)
            await getPMDCEquipments(selectedCanvas, userContext)
            setControlMode('pmdc')
            setIsEditMarkupView(false)
        }
    }, [
        controlMode,
        isPMDCChanged,
        hideEditMarkup,
        setIsEditMarkupView,
        setIsPMDC,
        setIsPMDCTagOn,
        setSelPMDCEquipment,
        setYesNoPopupValue,
        getPMDCEquipments,
        selectedCanvas,
        userContext,
        setControlMode,
        setIsPMDCChanged,
        isMarkupChanged,
        isEditMarkupView,
        isProcedureManagerVisible,
    ])

    // PLD 툴바 아이템 선택 이벤트 -> 심볼 생성
    const selectSvg = React.useCallback(
        (pldValuePath: pldOpenValvePath | undefined, type: string) => {
            if (selectedCanvas) {
                const { docId, docVer } = selectedCanvas.documentCtx
                const pldDocument = pldDocumentList.filter((el) => el.DOCNO === docId && el.DOCVR === docVer)[0]

                // 요소를 선택하지 않고 생성하는 SVG
                if (
                    type === '008' ||
                    type === '014' ||
                    type === '013' ||
                    type === '015' ||
                    type === '006' ||
                    type === '005' ||
                    type === '004' ||
                    type === '011' ||
                    type === '010' ||
                    type === '012'
                ) {
                    if (pldValuePath) {
                        const canvas = document.getElementById('documentCanvas')

                        if (canvas) {
                            const gePoint = viewer.screenToWorld(canvas?.clientWidth / 2, canvas?.clientHeight / 2)

                            const info = {
                                seq: pldSimbolList.length + 1,
                                type: pldValuePath.type,
                                point1X: gePoint[0],
                                point1Y: gePoint[1] + 2.8,
                                radptX: 0.1 * 10,
                                radptY: 0.1 * 10,
                                PLD_C_SEQ: pldDocument.PLD_C_SEQ,
                                svg: pldValuePath,
                            }

                            setPldSimbolList([...pldSimbolList, info])
                        }
                    }
                } else if (pldHandle) {
                    let chk = false
                    const newPldEquipList = pldEquipList.map((pldEquip) => {
                        if (pldEquip.handle === pldHandle) {
                            chk = true
                            return { handle: pldEquip.handle, type: type, function: pldEquip.function }
                        } else return pldEquip
                    })
                    if (!chk) {
                        newPldEquipList.push({ handle: pldHandle, type: type, function: pldHandle })
                        setPldHandle('')
                    }
                    setPldEquipList(newPldEquipList)
                    // (선택한 설비들) 색상변경
                    entityPainter.setPldHandleList(newPldEquipList)

                    // 캔버스에 SVG(열림 or 닫힘 or 조절) 추가
                    if (selectedCanvas && pldValuePath) {
                        let getPoint = [0, 0]
                        const entities = getEntities(viewer, [pldHandle])
                        if (entities[0].getType() === 2) {
                            getPoint = entities[0].openObjectAsInsert().getExtents().ext.center()
                        }

                        const info = {
                            seq: pldSimbolList.length + 1,
                            type: pldValuePath.type,
                            point1X: getPoint[0],
                            point1Y: getPoint[1] + 2.8,
                            radptX: 0.1 * 10,
                            radptY: 0.1 * 10,
                            PLD_C_SEQ: pldDocument.PLD_C_SEQ,
                            svg: pldValuePath,
                        }

                        setPldSimbolList([...pldSimbolList, info])
                        global.log('setPldSimbolList 추가::', info, getPoint)
                    }
                }
            }
        },
        [
            viewer,
            entityPainter,
            pldHandle,
            setPldHandle,
            pldDocumentList,
            pldSimbolList,
            selectHandleX,
            selectHandleY,
            selectedCanvas,
            setPldSimbolList,
            pldEquipList,
            setPldEquipList,
        ]
    )

    // PI mimic list 불러오기
    const getMimicList = React.useCallback(async () => {
        if (selectedCanvas) {
            return await getAllDetail(selectedCanvas.documentCtx.docId, selectedCanvas.documentCtx.docVer)
        }
    }, [selectedCanvas])

    const openPiMimicUI = React.useCallback(() => {
        getMimicList().then((mimicList) => {
            if (mimicList && mimicList.length > 0) {
                setMimicList(mimicList)
                setIsShowPiMimicPopup({
                    message: 'list',
                    nextAction: () => {},
                })
            } else {
                setOkPopupValue({
                    message: '본 도면에 해당하는 계통 Mimic 보기가 없습니다',
                    ok: () => {},
                })
            }
        })
    }, [getMimicList, setIsShowPiMimicPopup, setMimicList, setOkPopupValue])

    const openOption = React.useCallback(() => {
        setIsShowOption((old) => !old)
    }, [setIsShowOption])

    return (
        <div className="Toolbar">
            <div
                className="MenuToolbar"
                style={{
                    left:
                        process.env.REACT_APP_DB === '남부'
                            ? 'calc((100% - 12px - (53px * 10.7) - 45px) / 2)'
                            : 'calc((100% - 12px - (53px * 7.3) - 45px) / 2)',
                }}
            >
                {/* 이동 모드 */}
                {!pldMode && (
                    <div
                        className={cn('ToolItem', controlMode === 'select' ? 'selected' : '')}
                        id="Select"
                        onClick={async () => {
                            if (controlMode === 'wcd') {
                                await getWCDEquipments(true)
                                if (selWCDEquipment) setSelWCDEquipment([])
                                setWCDTagDoc([])
                                setWCDTagItem([])
                            } else if (controlMode === 'pmdc') {
                                if (isPMDCChanged) {
                                    const confirmValue = {
                                        message: 'PMDC 설정 내용을 저장하지 않고 나가시겠습니까?',
                                        yes: async () => {
                                            hideEditMarkup()
                                            setIsEditMarkupView(false)
                                            setIsPMDC(false)
                                            setIsPMDCTagOn(false)
                                            setSelPMDCEquipment([])
                                        },
                                        no: () => {
                                            setControlMode('pmdc')
                                        },
                                    }
                                    setYesNoPopupValue(confirmValue)
                                } else {
                                    hideEditMarkup()
                                    setIsEditMarkupView(false)
                                    setIsPMDC(false)
                                    setIsPMDCTagOn(false)
                                    setSelPMDCEquipment([])
                                }
                            } else if (controlMode === 'pmdc') {
                                if (isPMDCChanged) {
                                    const confirmValue = {
                                        message: 'PMDC 설정 내용을 저장하지 않고 나가시겠습니까?',
                                        yes: async () => {
                                            hideEditMarkup()
                                            setIsEditMarkupView(false)
                                            setIsPMDC(false)
                                            setIsPMDCTagOn(false)
                                            setSelPMDCEquipment([])
                                        },
                                        no: () => {
                                            setControlMode('pmdc')
                                        },
                                    }
                                    setYesNoPopupValue(confirmValue)
                                } else {
                                    hideEditMarkup()
                                    setIsEditMarkupView(false)
                                    setIsPMDC(false)
                                    setIsPMDCTagOn(false)
                                    setSelPMDCEquipment([])
                                }
                            }
                            if (controlMode !== 'select') setControlMode('select')
                        }}
                        title={'선택모드'}
                    >
                        {icons.markupSelect(controlMode === 'select')}
                    </div>
                )}
                {/* 도면 확장 zoomExtents */}
                <div
                    className="ToolItem"
                    id="zoomExtents"
                    onClick={() => {
                        viewer.zoomExtents()
                        setIsZoomExtends(!isZoomExtends)
                        setPldViewChange(true)
                    }}
                    title={'ZoomExtents'}
                >
                    {icons.zoomExtents()}
                </div>
                {/* 테마 모드 토글 */}
                <div className="ToolItem" id="changeTheme" onClick={() => setTheme(toggleTheme)} title={'테마 변경'}>
                    {icons.changeTheme()}
                </div>

                {/* 남부 PMDC 팝업 토글 */}
                {!pldMode && process.env.REACT_APP_DB === '남부' && (
                    <>
                        <div
                            className="ToolItem"
                            onClick={() => {
                                if (controlMode === 'select') {
                                    if (PMGraph !== '') {
                                        setPMGraph('')
                                    }
                                    setIsPMDC(!isPMDC)
                                } else if (controlMode === 'pmdc') {
                                    if (isPMDCChanged) {
                                        const confirmValue = {
                                            message: 'PMDC 설정 내용을 저장하지 않고 나가시겠습니까?',
                                            yes: async () => {
                                                hideEditMarkup()
                                                setIsEditMarkupView(false)
                                                setIsPMDC(true)
                                                setIsPMDCTagOn(false)
                                                setSelPMDCEquipment([])
                                            },
                                            no: () => {},
                                        }
                                        setYesNoPopupValue(confirmValue)
                                    } else {
                                        hideEditMarkup()
                                        setIsEditMarkupView(false)
                                        setIsPMDC(true)
                                        setIsPMDCTagOn(false)
                                        setSelPMDCEquipment([])
                                    }
                                }
                            }}
                            title={'PMDC'}
                        >
                            {icons.PMDCMode(isPMDC)}
                        </div>
                        <div className="ToolItem toolbar-vertical-line" />
                    </>
                )}
                {/* 
                    마크업 리스트 팝업 토글
                        팝업 위치: /View/PopupView/MarkupListView.tsx
                 */}
                {!pldMode && (
                    <div
                        className={'ToolItem ' + (hasMarkups ? '' : 'ToolbarItemDisable')}
                        id="showMarkupList"
                        onClick={markupListBtnClick}
                        title={'마크업 리스트'}
                    >
                        {icons.showMarkup(hasMarkups)}
                    </div>
                )}
                {/* 마크업 편집 메뉴 툴바 토글 */}
                <div className="ToolItemBackground" hidden={!isEditMarkupView}>
                    {icons.markupActive()}
                </div>
                {!pldMode && (
                    <>
                        <div
                            className="ToolItem"
                            id="editMarkup"
                            onClick={() => {
                                toggleEditMarkup()
                            }}
                            title={'마크업 편집모드'}
                        >
                            {icons.editMarkup()}
                        </div>
                        {process.env.REACT_APP_DB === '한수원' && (
                            <>
                                <div
                                    className="ToolItem"
                                    id="wcd"
                                    onClick={() => {
                                        toggleWCD()
                                    }}
                                    title={'WCD'}
                                >
                                    {icons.startWCD(controlMode === 'wcd')}
                                </div>
                                {/* 파이 미믹 */}
                                <div className="ToolItem" id="editPiMimic" onClick={openPiMimicUI} title={'PI Mimic'}>
                                    {icons.piMimic()}
                                </div>
                            </>
                        )}
                        {/* 옵션 */}
                        <div className="ToolItem" id="editOption" onClick={openOption} title={'옵션'}>
                            {icons.option()}
                        </div>
                    </>
                )}
                {!pldMode && process.env.REACT_APP_DB === '남부' && (
                    <div className="ToolItem" onClick={togglePMDC} title={'PMDC'}>
                        {icons.PMDCSettingMode(controlMode === 'pmdc')}
                    </div>
                )}
                <div className="PldItemBackground" hidden={!isEditPld}>
                    {icons.pldActive()}
                </div>
                {/* PLD 편집 메뉴 툴바 토글 */}
                {pldMode && (
                    <div className="ToolItem" onClick={toggleEditPld} title={'PLD 편집'}>
                        {icons.pldEdit()}
                    </div>
                )}
                <div className="ToolItem" id="favorite" onClick={toggleFavorite} title={'즐겨찾기'}>
                    {icons.favoriteImg(isFavorite)}
                </div>
                {/* 프린트 */}
                <div className="ToolItem" id="print" onClick={() => setIsPrintPopup(true)} title={'프린트'}>
                    {icons.printIcon()}
                </div>

                <div className="Rectangle" />
                <div className="DragItem">{icons.dragImg()}</div>
            </div>
            {/* 마크업 편집 툴바 */}
            <div className="MarkupToolbar" hidden={!isEditMarkupView}>
                <div className="Background"></div>

                {/* {마크업 편집} */}
                <div
                    className={cn('MarkupItem', controlMode === 'edit' ? 'selected' : '')}
                    id="Edit"
                    onClick={() => {
                        if (controlMode !== 'edit') setControlMode('edit')
                    }}
                    title={'마크업 편집'}
                >
                    {icons.editMode(controlMode === 'edit')}
                </div>

                {/* 마크업 팬 */}
                <div
                    className={cn('MarkupItem', controlMode === 'markup' ? 'selected' : '')}
                    id="Pen"
                    onClick={() => {
                        if (controlMode !== 'markup') setControlMode('markup')
                    }}
                    title={'마크업 팬'}
                >
                    {icons.markupPen(controlMode === 'markup')}
                </div>

                {/* 마크업 사각형 */}
                <div
                    className={cn('MarkupItem', controlMode === 'rect' ? 'selected' : '')}
                    id="rect"
                    onClick={() => {
                        if (controlMode !== 'rect') setControlMode('rect')
                    }}
                    title={'마크업 사각형'}
                >
                    {icons.markupRect(controlMode === 'rect')}
                </div>

                {/* 마크업 원 */}
                <div
                    className={cn('MarkupItem', controlMode === 'circle' ? 'selected' : '')}
                    id="circle"
                    onClick={() => {
                        if (controlMode !== 'circle') setControlMode('circle')
                    }}
                    title={'마크업 원'}
                >
                    {icons.markupCircle(controlMode === 'circle')}
                </div>

                {/* 마크업 텍스트 */}
                <div
                    className={cn('MarkupItem', controlMode === 'text' ? 'selected' : '')}
                    id="text"
                    onClick={() => {
                        if (controlMode !== 'text') setControlMode('text')
                    }}
                    title={'마크업 텍스트'}
                >
                    {icons.markupText(controlMode === 'text')}
                </div>

                {/* 마크업 폴리선 */}
                <div
                    className={cn('MarkupItem', controlMode === 'poli' ? 'selected' : '')}
                    id="poli"
                    onClick={() => {
                        if (controlMode !== 'poli') setControlMode('poli')
                    }}
                    title={'마크업 폴리선'}
                >
                    {icons.markupPoli(controlMode === 'poli')}
                </div>

                {/* 마크업 구름선 */}
                <div
                    className={cn('MarkupItem', controlMode === 'cloud' ? 'selected' : '')}
                    id="cloud"
                    onClick={() => {
                        if (controlMode !== 'cloud') setControlMode('cloud')
                    }}
                    title={'마크업 구름선'}
                >
                    {icons.markupCloud(controlMode === 'cloud')}
                </div>

                {/* 지우개 */}
                <div
                    className={cn('MarkupItem', controlMode === 'erase' ? 'selected' : '')}
                    id="Erase"
                    onClick={() => {
                        setControlMode('erase')
                    }}
                    title={'마크업 지우개'}
                >
                    {icons.markupErase(controlMode === 'erase')}
                </div>

                {/* 마크업 UNDO */}
                <div
                    className={cn('MarkupItem', undoList.length === 0 ? 'ToolbarItemDisable' : '')}
                    id="undo"
                    onClick={() => undo()}
                    title={'이전'}
                >
                    {icons.undo()}
                </div>

                {/* 마크업 REDO */}
                <div
                    className={'MarkupItem ' + (redoList.length === 0 ? 'ToolbarItemDisable' : '')}
                    id="redo"
                    onClick={() => redo()}
                    title={'이후'}
                >
                    {icons.redo()}
                </div>

                {/* 저장 */}
                <div
                    className={cn('MarkupItem', isMarkupChanged ? '' : 'ToolbarItemDisable')}
                    id="Save"
                    onClick={() => {
                        if (isMarkupChanged) {
                            if (selectedMarkupItems.size !== 0) {
                                const confirmValue = {
                                    message: '기존 마크업에 저장할까요?',
                                    yes: () => {
                                        setIsShowMarkupPopup({
                                            message: 'update',
                                            nextAction: () => {},
                                        })
                                    },
                                    no: () => {
                                        setIsShowMarkupPopup({ message: 'save', nextAction: () => {} })
                                    },
                                    nextAction: () => {},
                                }
                                setYesNoPopupValue(confirmValue)
                            } else {
                                setIsShowMarkupPopup({
                                    message: 'save',
                                    nextAction: () => {},
                                })
                            }
                        }
                    }}
                    title={'마크업 저장'}
                >
                    {icons.markupSave()}
                </div>
                {/* 불러오기 */}
                <div
                    className={'MarkupItem ' + (hasMarkups ? '' : 'ToolbarItemDisable')}
                    id="Load"
                    onClick={markupLoadListBtnClick}
                    title={'마크업 불러오기'}
                >
                    {icons.markupLoad()}
                </div>
            </div>
            {/* PLD 편집 툴바 */}
            <div className="PLDToolbar" hidden={!isEditPld}>
                <div className="Background"></div>
                {/* 열림 */}
                <div
                    className={`PLDItem ${(pldHandleEntityType === 1 || pldHandle === '') && 'disable'}`}
                    id="Open"
                    onClick={() => selectSvg(pldOpenValvePath, '001')}
                    title={'열림'}
                >
                    {icons.pldOpenValve()}
                </div>
                {/* 닫힘 */}
                <div
                    className={`PLDItem ${(pldHandleEntityType === 1 || pldHandle === '') && 'disable'}`}
                    id="Close"
                    onClick={() => selectSvg(pldCloseValvePath, '002')}
                    title={'닫힘'}
                >
                    {icons.pldCloseValve()}
                </div>
                {/* 조절 */}
                <div
                    className={`PLDItem ${(pldHandleEntityType === 1 || pldHandle === '') && 'disable'}`}
                    id="Control"
                    onClick={() => selectSvg(pldControlValvePath, '005')}
                    title={'조절'}
                >
                    {icons.pldControlValve()}
                </div>
                {/* 주유로 */}
                <div
                    className={`PLDItem ${(!pldHandle && 'disable') || (pldHandleEntityType === 2 && 'disable')}`}
                    id="Main"
                    onClick={() => selectSvg(undefined, '003')}
                    title={'주유로'}
                >
                    {icons.pldMainLine()}
                </div>
                {/* 보조유로 */}
                <div
                    className={`PLDItem ${(!pldHandle && 'disable') || (pldHandleEntityType === 2 && 'disable')}`}
                    id="Sub"
                    onClick={() => selectSvg(undefined, '004')}
                    title={'보조유로'}
                >
                    {icons.pldSubLine()}
                </div>
                {/* 작업확인서 */}
                <div className={`PLDItem`} id="Checked" onClick={() => selectSvg(pldCheckedPath, '008')} title={'작업확인서'}>
                    {icons.pldChecked()}
                </div>
                {/* 드레인 */}
                <div className={`PLDItem`} id="Checked" onClick={() => selectSvg(drainPath, '014')} title={'드레인'}>
                    {icons.drain()}
                </div>
                {/* vct */}
                <div className={`PLDItem`} id="Checked" onClick={() => selectSvg(vctPath, '013')} title={'vct'}>
                    {icons.vct()}
                </div>
                {/* vent */}
                <div className={`PLDItem`} id="Checked" onClick={() => selectSvg(ventPath, '015')} title={'vent'}>
                    {icons.vent()}
                </div>
                {/* controlCloud */}
                <div className={`PLDItem`} id="Checked" onClick={() => selectSvg(controlCloudPath, '006')} title={'controlCloud'}>
                    {icons.controlCloud()}
                </div>
                {/* openCloud */}
                <div className={`PLDItem`} id="Checked" onClick={() => selectSvg(openCloudPath, '004')} title={'openCloud'}>
                    {icons.openCloud()}
                </div>
                {/* closeCloud */}
                <div className={`PLDItem`} id="Checked" onClick={() => selectSvg(closeCloudPath, '005')} title={'closeCloud'}>
                    {icons.closeCloud()}
                </div>
                {/* choice */}
                <div className={`PLDItem`} id="Checked" onClick={() => selectSvg(choicePath, '005')} title={'choice'}>
                    {icons.choice()}
                </div>
                {/* setting */}
                <div className={`PLDItem`} id="Checked" onClick={() => selectSvg(settingPath, '010')} title={'setting'}>
                    {icons.setting()}
                </div>
                {/* auto */}
                <div className={`PLDItem`} id="Checked" onClick={() => selectSvg(autoPath, '012')} title={'auto'}>
                    {icons.auto()}
                </div>
                {/* 그림추가 아직 기능추가안되어 주석 */}
                {/*<div className={'PLDItem'} id="Picture">
                    {icons.pldPicture()}
                </div>*/}
            </div>

            {!pldMode && <MarkupPopup />}
        </div>
    )
}

export default Toolbar
