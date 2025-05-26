import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSetRecoilState, useRecoilValue } from 'recoil'
// 전역 Store
import { PldStore, StatusStore } from '../../../../Store/statusStore'
// Lib
import { global } from '../../../../Lib/util'
import cn from 'classnames'
import commonFunc from '../../../../Lib/commonFunc'
import crypt from '../../../../Lib/crypt'
// Component
import TreeViewItemEl from '../../../CommonView/TreeView/TreeViewItem'
import PldEquipmentFolder from './PldEquipmentFolder'
// Controller
import useDocument from '../../../../Controller/useDocument'
import usePld from '../../../../Controller/usePld'

// PldDocumentFolder TreeView - 폴더
function PldDocumentFolder({ folderList, depth, keyIdx, currentPld }: PldDocumentFolders) {
    global.log('PldDocumentFolders::', folderList, keyIdx)
    // 전역 Store
    const [extended, setExtened] = React.useState(true)
    const isChangedPld = useRecoilValue(PldStore.isChangedPld) // PLD 변경사항 상태
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)

    // 라우터 경로 이동을 위한 네비게이터
    const navigate = useNavigate()

    // Controller
    const useDocumentObj = useDocument()
    const usePldObj = usePld()

    const folderClick = React.useCallback(
        async (e: React.MouseEvent<HTMLElement>, documentObj: PldDocument) => {
            if (e) e.stopPropagation()

            const { DOCNO, DOCVR, PLANTCODE } = documentObj

            const checkRes = useDocumentObj.documentCheckSelected(documentObj.DOCNO, documentObj.DOCVR)
            global.log('PldDocument?folder Click', documentObj, checkRes)
            if (!checkRes) {
                if (isChangedPld) {
                    // PLD 변경사항 여부 체크

                    // Save SimbolList & EntityList
                    const confirmValue = {
                        message: '변경된 도면을 저장할까요?',
                        yes: () => {
                            usePldObj.savePld()
                        },
                        no: () => {
                            // 도면 이동.
                            // Event : MainView/Canvas/index.tsx -> 2. URL Params를 통해 도면 & 설비 설정
                            commonFunc.changeDocumentForPld(crypt.encrypt(DOCNO), crypt.encrypt(DOCVR), crypt.encrypt(PLANTCODE), navigate)
                            // 드롭다움 펼침
                            setExtened(true)
                        },
                    }
                    setYesNoPopupValue(confirmValue)
                } else {
                    // 도면 이동.
                    // Event : MainView/Canvas/index.tsx -> 2. URL Params를 통해 도면 & 설비 설정
                    commonFunc.changeDocumentForPld(crypt.encrypt(DOCNO), crypt.encrypt(DOCVR), crypt.encrypt(PLANTCODE), navigate)
                    // 드롭다움 펼침
                    setExtened(true)
                }
            } else {
                setExtened((val) => {
                    return !val
                })
            }
        },
        [navigate, useDocumentObj, isChangedPld, setYesNoPopupValue, usePldObj]
    )

    return (
        <>
            {folderList.map((documentObj: PldDocument) => {
                keyIdx += 1
                const checkRes = useDocumentObj.documentCheckSelected(documentObj.DOCNO, documentObj.DOCVR)
                return (
                    <div className="TreeViewItem" key={keyIdx} onClick={(e) => folderClick(e, documentObj)}>
                        <div className={cn('Label ', checkRes ? 'SelectedLabel' : '')}>
                            {/* 화살표 아이콘 */}
                            {TreeViewItemEl.arrowIcon(
                                checkRes && extended ? false : true,
                                checkRes ? 'var(--Icon-Highlight)' : 'var(--Icon-Normal)',
                                depth
                            )}
                            {/* 폴더 아이콘 */}
                            {checkRes
                                ? TreeViewItemEl.pldIcon('var(--Icon-Highlight)', depth)
                                : TreeViewItemEl.pldIcon('var(--Icon-Normal)', depth)}
                            {/* 폴더 이름 */}
                            {checkRes
                                ? TreeViewItemEl.getPldSelectedText(documentObj.DOCNM, depth, '55px')
                                : TreeViewItemEl.getPldNomalText(documentObj.DOCNM, depth, '55px')}
                        </div>

                        <div className={cn('Children', checkRes ? 'SelectedFolder' : '')}>
                            {
                                // 현재 폴더가 선택되어 있다면 -> 다음
                                checkRes && extended ? <PldEquipmentFolder pldDocument={documentObj} depth={depth + 1} keyIdx={0} /> : null
                            }
                        </div>
                    </div>
                )
            })}
        </>
    )
}

export default React.memo(PldDocumentFolder)
