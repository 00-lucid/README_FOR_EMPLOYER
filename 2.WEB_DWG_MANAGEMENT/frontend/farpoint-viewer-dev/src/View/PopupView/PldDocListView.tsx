import React from 'react'
// Component
import { DocumentListView } from '../CommonView/DocumentListView'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import { PldStore, StatusStore } from '../../Store/statusStore'
import AppStore from '../../Store/appStore'
// Lib
import { global } from '../../Lib/util'
// Api
import Api from '../../Api'

export function PldDocListView() {
    const mapFolderList = useRecoilValue(StatusStore.mapFolderList)
    const pldMode = useRecoilValue(StatusStore.pldMode)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)
    const setDocAndMarkupResetActive = useSetRecoilState(StatusStore.docAndMarkupResetActive)

    const [pldDocListPopupValue, setPldDocListPopupValue] = useRecoilState(PldStore.pldDocListPopupValue)
    const [pldDocumentList, setPldDocumentList] = useRecoilState(PldStore.pldDocumentList) // PLD 도면 리스트
    const currentPld = useRecoilValue(PldStore.currentPld)

    const userId = useRecoilValue(AppStore.userId)

    // Pld Process에서 현재 PLD의 도면목록
    const [ppSelectedDocListSet, setPpSelectedDocListSet] = React.useState<Set<string>>(new Set<string>())

    const [hogiItem, setHogiItem] = React.useState<SelectItem[] | undefined>(undefined)
    //const hogiItemsRef = React.useRef<SelectItem[] | undefined>(undefined)
    React.useEffect(() => {
        global.log('React.useEffect:setHogiItem:', currentPld, mapFolderList)
        if (currentPld) {
            setHogiItem(mapFolderList.get(currentPld.FOLID.toString()))
            //hogiItemsRef.current = mapFolderList.get(currentPld.FOLID.toString())
        }
    }, [currentPld, mapFolderList])

    // 체크박스 리스트의 상태 셋팅
    React.useEffect(() => {
        if (pldDocumentList.length > 0) {
            global.log('PldDocListView:useEffect:start:', pldDocumentList)
            const newSelectedItems = new Set<string>()

            pldDocumentList.forEach((pldDocument: PldDocument) => {
                const { DOCNO, DOCVR, PLANTCODE } = pldDocument
                newSelectedItems.add(DOCNO + '-' + DOCVR + '-' + PLANTCODE)
            })

            setPpSelectedDocListSet(newSelectedItems)
        }
    }, [pldDocumentList])

    const onChangeCanvas = React.useCallback(() => {
        async function onChange(pldCanvasList: any[]) {
            await Api.pld.changePldCanvas(pldCanvasList)
            ppSelectedDocListSet.clear()

            if (currentPld !== undefined && pldMode) {
                const res = await Api.pld.getPldDocumentList(currentPld?.PLD_C_ID, currentPld?.PLD_C_VR)
                setPldDocumentList(res)
            }
        }
        async function fetch() {
            if (userId) {
                const pldCanvasList: any[] = []
                const selectItemtoArray = Array.from(ppSelectedDocListSet)
                const { PLD_P_ID, PLD_C_ID, PLD_C_VR, CURRENT_YN } = pldDocumentList[0]
                let SEQ = 1

                let isDeleteCurrentDoc = true
                for (let index = 0; index < selectItemtoArray.length; index++) {
                    const docInfoArray = selectItemtoArray[index].toString().split('-')
                    const temp = {
                        PLD_P_ID,
                        PLD_C_ID,
                        PLD_C_VR,
                        DOCNO: docInfoArray[0],
                        DOCVR: docInfoArray[1],
                        PLD_DOC_DESC: '',
                        CURRENT_YN,
                        SEQ,
                        USER_ID: userId,
                    }

                    pldCanvasList.push(temp)
                    SEQ++

                    if (!selectedCanvas || !isDeleteCurrentDoc) continue
                    const { docId, docVer } = selectedCanvas.documentCtx
                    if (docInfoArray[0] === docId && docInfoArray[1] === docVer) isDeleteCurrentDoc = false
                }

                if (selectedCanvas && isDeleteCurrentDoc) {
                    // 현재 띄워진 도면이 PLD 도면 목록에서 삭제된다면
                    const confirmValue = {
                        message: '현재 작업중인 PLD 도면을 삭제하시겠습니까?',
                        yes: async () => {
                            // 현재 도면 띄워진것 삭제.
                            setDocAndMarkupResetActive(true)
                            await onChange(pldCanvasList)
                        },
                        no: () => {},
                    }
                    setYesNoPopupValue(confirmValue)
                } else {
                    await onChange(pldCanvasList)
                }

                setPldDocListPopupValue(undefined)
            }
        }
        fetch()
    }, [
        userId,
        currentPld,
        pldDocumentList,
        pldMode,
        ppSelectedDocListSet,
        setPldDocListPopupValue,
        setPldDocumentList,
        setDocAndMarkupResetActive,
        setYesNoPopupValue,
        selectedCanvas,
    ])

    return (
        <div className="SelectMarkupFrame" hidden={!pldDocListPopupValue}>
            <div className="SelectMarkup">
                <div className="Titlebar">
                    <div className="Text">PLD 도면 추가</div>
                </div>
                {/* 체크박스 도면목록 */}
                {hogiItem ? (
                    <DocumentListView
                        hogiItems={hogiItem}
                        isPopup={true}
                        selectedDocListSet={ppSelectedDocListSet}
                        setSelectedDocListSet={setPpSelectedDocListSet}
                    />
                ) : null}

                <div className="CancelLoadButton" onClick={() => setPldDocListPopupValue(undefined)}>
                    <div className="Text">취소</div>
                </div>
                <div className={ppSelectedDocListSet.size !== 0 ? 'LoadButton' : 'DisabledLoadButton'} onClick={onChangeCanvas}>
                    <div className="Text">확인</div>
                </div>
            </div>
        </div>
    )
}
