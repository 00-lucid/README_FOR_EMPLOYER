import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil'
// 전역 Store
import AppStore from '../../../../Store/appStore'
import { StatusStore, MarkUpStore, PMDCStore } from '../../../../Store/statusStore'
import ThemeStore from '../../../../Store/ThemeStore'
// Lib
import { global } from '../../../../Lib/util'
import cn from 'classnames'
import crypt from '../../../../Lib/crypt'
import commonFunc from '../../../../Lib/commonFunc'
import commonActive from '../../../../Controller/useCommonActive'
// Component
import TreeViewItemEl from '../../../CommonView/TreeView/TreeViewItem'
// Api
import Api from '../../../../Api'

// TreeView - 설비
function FavoriteDocItem({ docList, depth, keyIdx }: DocFavoriteItemProps) {
    global.log('FavoriteItem::')

    // 전역 Store
    const favoriteDocumentDisplayType = useRecoilValue(ThemeStore.favoriteDocumentDisplayType)
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)
    const [userContext, setUserContext] = useRecoilState(AppStore.userContext)
    const userId = useRecoilValue(AppStore.userId)

    // MarkUp State
    const isMarkupChanged = useRecoilValue(MarkUpStore.isMarkupChanged)
    const setIsShowMarkupPopup = useSetRecoilState(MarkUpStore.isShowMarkupPopup)

    const [controlMode, setControlMode] = useRecoilState(StatusStore.controlMode)
    const [isPMDC, setIsPMDC] = useRecoilState(PMDCStore.isPMDC)
    const setIsPMDCTagOn = useSetRecoilState(PMDCStore.isPMDCTagOn)
    const setSelPMDCEquipment = useSetRecoilState(PMDCStore.selPMDCEquipment)

    // 라우터 경로 이동을 위한 네비게이터
    const navigate = useNavigate()

    const onDocumentClick = React.useCallback(
        async (item: FavoriteDocument) => {
            if (controlMode === 'pmdc') {
                console.log("controlMode:", controlMode)
                setControlMode('select')
                setIsPMDC(false)
                setIsPMDCTagOn(false)
                setSelPMDCEquipment([])
            }
            commonFunc.changeDocument(
                crypt.encrypt(item.docId),
                crypt.encrypt(item.docVer),
                crypt.encrypt(item.plantCode),
                undefined,
                isMarkupChanged,
                setIsShowMarkupPopup,
                navigate,
                setYesNoPopupValue
            )
        },
        [navigate, isMarkupChanged, setIsShowMarkupPopup, setYesNoPopupValue]
    )

    return (
        <>
            {docList.map((docItem: FavoriteDocument) => {
                keyIdx += 1
                return (
                    <div
                        className="TreeViewItem"
                        key={keyIdx}
                        onClick={(e) => {
                            e.stopPropagation()
                            onDocumentClick(docItem)
                        }}
                    >
                        {/* SelectedLabel */}
                        <div className={cn('Label ')}>
                            <div className="Image1" />
                            {/* 도면 아이콘 */}
                            {TreeViewItemEl.documentIcon('var(--Icon-Normal)', depth)}
                            {/* 도면 텍스트 */}
                            {TreeViewItemEl.getNormalText(
                                favoriteDocumentDisplayType === 'number' ? docItem.docNumber : docItem.docName,
                                depth,
                                '29px'
                            )}
                            {/* 도면 삭제 버튼 */}
                            <div
                                className="CloseButton"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    commonActive.removeDocumentFavorite(
                                        docItem.docId,
                                        docItem.docVer,
                                        userContext,
                                        userId,
                                        Api,
                                        setUserContext
                                    )
                                }}
                            >
                                {TreeViewItemEl.closeIcon}
                            </div>
                        </div>
                    </div>
                )
            })}
        </>
    )
}

export default React.memo(FavoriteDocItem)
