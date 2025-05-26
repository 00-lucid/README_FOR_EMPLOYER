import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import ThemeStore from '../../../../Store/ThemeStore'
import { StatusStore, MarkUpStore, PMDCStore } from '../../../../Store/statusStore'
// Lib
import { global } from '../../../../Lib/util'
import cn from 'classnames'
import crypt from '../../../../Lib/crypt'
import commonFunc from '../../../../Lib/commonFunc'
// Controller
import useDocument from '../../../../Controller/useDocument'
// Component
import TreeViewItemEl from '../../../CommonView/TreeView/TreeViewItem'

// TreeView - 도면
function DocumentItem({ documentList, depth, keyIdx }: DocumentItemProps) {
    global.log('DocumentItem::', documentList, keyIdx)
    // 전역 Store
    const documentDisplayType = useRecoilValue(ThemeStore.documentDisplayType)
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)
    const [controlMode, setControlMode] = useRecoilState(StatusStore.controlMode)
    const [isPMDC, setIsPMDC] = useRecoilState(PMDCStore.isPMDC)
    const setIsPMDCTagOn = useSetRecoilState(PMDCStore.isPMDCTagOn)
    const setSelPMDCEquipment = useSetRecoilState(PMDCStore.selPMDCEquipment)

    // MarkUp State
    const isMarkupChanged = useRecoilValue(MarkUpStore.isMarkupChanged)
    const setIsShowMarkupPopup = useSetRecoilState(MarkUpStore.isShowMarkupPopup)

    // 라우터 경로 이동을 위한 네비게이터
    const navigate = useNavigate()

    // Controller
    const useDocumentObj = useDocument()

    const documentMenuItemClick = React.useCallback(
        async (e: React.MouseEvent<HTMLElement>, documentObj: DocumentItem) => {
            if (e) e.stopPropagation()
            global.log('documentMenuItemClick Click', documentObj)
            // Event : MainView/Canvas/index.tsx -> 2. URL Params를 통해 도면 & 설비 설정
            if (controlMode === 'pmdc') {
                console.log("controlMode:", controlMode)
                setControlMode('select')
                setIsPMDC(false)
                setIsPMDCTagOn(false)
                setSelPMDCEquipment([])
            }
            commonFunc.changeDocument(
                crypt.encrypt(documentObj.docId),
                crypt.encrypt(documentObj.docVer),
                crypt.encrypt(documentObj.plantCode),
                undefined,
                isMarkupChanged,
                setIsShowMarkupPopup,
                navigate,
                setYesNoPopupValue,
            )
        },
        [navigate, isMarkupChanged, setIsShowMarkupPopup, setYesNoPopupValue]
    )

    return (
        <>
            {documentList.map((documentObj: DocumentItem) => {
                keyIdx += 1
                const checkRes = useDocumentObj.documentCheckSelected(documentObj.docId, documentObj.docVer)
                return (
                    <div className="TreeViewItem" key={keyIdx} onClick={(e) => documentMenuItemClick(e, documentObj)}>
                        {/* SelectedLabel */}
                        <div className={cn('Label ', checkRes ? 'SelectedLabel' : '')}>
                            <div className="Image1" />
                            {/* 도면 아이콘 */}
                            {TreeViewItemEl.documentIcon(checkRes ? 'var(--Icon-Highlight)' : 'var(--Icon-Normal)', depth)}
                            {/* 도면 텍스트 */}
                            {checkRes
                                ? TreeViewItemEl.getSelectedText(
                                      documentDisplayType === 'number' ? documentObj.docNumber : documentObj.docName,
                                      depth,
                                      '29px'
                                  )
                                : TreeViewItemEl.getNormalText(
                                      documentDisplayType === 'number' ? documentObj.docNumber : documentObj.docName,
                                      depth,
                                      '29px'
                                  )}
                        </div>
                    </div>
                )
            })}
            {}
        </>
    )
}

export default React.memo(DocumentItem)
