import React from 'react'
import './PldProcessMenu.css'
import './TreeViewItem.css'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore, PldStore } from '../../../../Store/statusStore'
// Component
import { CloseSideMenuBtn } from '../../Component/CloseSideMenuBtn'
import { TreeView } from '../../../CommonView/TreeView'
import PldDocumentFolder from '../../Component/PldDocument/PldDocumentFolder'
// Api
import Api from '../../../../Api'
// Lib
import crypt from '../../../../Lib/crypt'
import { global } from '../../../../Lib/util'
// Controller
import usePld from '../../../../Controller/usePld'

export const PldProcessMenu = ({ currentPld }: { currentPld: PldInfo }) => {
    // 전역 Store
    const currentMenu = useRecoilValue(StatusStore.currentMenu)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)

    const [pldDocumentList, setPldDocumentList] = useRecoilState(PldStore.pldDocumentList) // PLD 도면 리스트

    const pivotSimbolListHash = useRecoilValue(PldStore.pivotSimbolListHash) // PLD 심볼 hash (변경사항 확인 문자열)
    const pivotProcessListHash = useRecoilValue(PldStore.pivotProcessListHash) // PLD 심볼 hash (변경사항 확인 문자열)

    const [isChangedPld, setIsChangedPld] = useRecoilState(PldStore.isChangedPld) // PLD 변경사항 상태
    const setPldDocListPopupValue = useSetRecoilState(PldStore.pldDocListPopupValue) // 도면변경 리스트 팝업 상태
    const setCurrentPld = useSetRecoilState(PldStore.currentPld)
    const pldEquipList = useRecoilValue(PldStore.pldEquipList)
    const pldSimbolList = useRecoilValue(PldStore.pldSimbolList)

    const setPldResetActive = useSetRecoilState(StatusStore.pldResetActive)
    const setDocAndMarkupResetActive = useSetRecoilState(StatusStore.docAndMarkupResetActive)
    const setWarningPopupValue = useSetRecoilState(StatusStore.warningPopupValue)

    const currentPldRef = React.useRef<PldInfo | undefined>(undefined)

    // Pld Controller
    const usePldObj = usePld()

    // PLD 도면 리스트 셋팅
    React.useEffect(() => {
        async function fetchData() {
            const res = await Api.pld.getPldDocumentList(currentPld?.PLD_C_ID, currentPld?.PLD_C_VR)
            setPldDocumentList(res)
        }
        if (currentPldRef.current !== currentPld) {
            currentPldRef.current = currentPld
            fetchData()
        }
    }, [currentPld, setPldDocumentList])

    // PLD 변경사항 상태 변경 이벤트
    React.useEffect(() => {
        const documentCtx = selectedCanvas?.documentCtx
        if (!documentCtx || currentPld === undefined) return

        const curProcessHash = crypt.CryptoJS.SHA256(JSON.stringify(pldEquipList)).toString()
        const curSimbolHash = crypt.CryptoJS.SHA256(JSON.stringify(pldSimbolList)).toString()
        const isEqualSimbol = pivotSimbolListHash === '' ? true : curSimbolHash === pivotSimbolListHash
        const isEqualProcess = pivotProcessListHash === '' ? true : curProcessHash === pivotProcessListHash
        global.log('PLD 변경사항 상태 변경 이벤트:', isChangedPld, isEqualSimbol, isEqualProcess)

        if (isEqualProcess && isEqualSimbol) {
            // 변경사항 없다면
            if (isChangedPld) setIsChangedPld(false)
        } else {
            // 변경사항 있다면
            if (!isChangedPld) setIsChangedPld(true)
        }
    }, [
        currentPld,
        selectedCanvas?.documentCtx,
        isChangedPld,
        setIsChangedPld,
        pldEquipList,
        pldSimbolList,
        pivotProcessListHash,
        pivotSimbolListHash,
    ])

    return (
        <div className="PldProcessMenu SideViewShadow SideViewBackground" style={style(currentMenu)}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">PROCESS Line-Up</span>
            <CloseSideMenuBtn />
            <div className="topline"></div>
            <section id="pld-preview">
                <section className="info">
                    <label className="name">발전소</label>
                    <p style={{ width: '10%' }}>:</p>
                    <p className="content">{currentPld.COMPANY.company + ' ' + currentPld.COMPANY.plant}</p>
                </section>

                <section className="info">
                    <label className="name">절차서 번호</label>
                    <p style={{ width: '10%' }}>:</p>
                    <p className="content">{currentPld.PLD_P_NUMBER}</p>
                </section>

                <section className="info">
                    <label className="name">절차서 명</label>
                    <p style={{ width: '10%' }}>:</p>
                    <p className="content">{currentPld.PLD_P_NAME}</p>
                </section>

                <section className="info">
                    <label className="name">PLD 명</label>
                    <p style={{ width: '10%' }}>:</p>
                    <p className="content">{currentPld.PLD_C_NAME}</p>
                </section>
            </section>
            <div className="bottomline"></div>

            {/* PLD 심볼 트리뷰 */}
            <section className="PldProcessTree">
                <TreeView id="processMenuTreeView" className="PldTreeViewComponent">
                    {<PldDocumentFolder folderList={pldDocumentList} depth={0} keyIdx={0} currentPld={currentPld}></PldDocumentFolder>}
                </TreeView>
            </section>

            {/* 하단 버튼 섹션 */}
            <section id="buttons">
                <button
                    className="button"
                    onClick={() => {
                        const confirmValue = {
                            folderId: currentPld.FOLID.toString(),
                        }

                        setPldDocListPopupValue(confirmValue)
                    }}
                >
                    도면변경
                </button>
                <button
                    className="button"
                    onClick={(e: any) => {
                        const confirmValue = {
                            title: 'PLD 모드',
                            message: 'PLD 수정을 취소할까요?',
                            submessage: '저장하지 않은 내용은 모두 취소됩니다.',
                            yes: async () => {
                                setDocAndMarkupResetActive(true)
                                setPldResetActive(true)
                                setCurrentPld(undefined)
                            },
                            no: () => {},
                        }
                        setWarningPopupValue(confirmValue)
                    }}
                >
                    취소
                </button>
                <button
                    className={`button blue ${isChangedPld ? '' : 'disable'}`}
                    onClick={(e) => {
                        if (isChangedPld) {
                            // Save SimbolList & EntityList
                            const confirmValue = {
                                message: '변경된 도면을 저장할까요?',
                                yes: () => {
                                    usePldObj.savePld()
                                },
                                no: () => {},
                            }
                            setYesNoPopupValue(confirmValue)
                        }
                    }}
                >
                    저장
                </button>
            </section>
        </div>
    )
}

function style(currentMenu: string) {
    return 'process' === currentMenu ? { marginLeft: 'var(--SideMenuWidth)' } : { marginLeft: 'calc(var(--PldProcessMenuWidth) * -1 )' }
}
