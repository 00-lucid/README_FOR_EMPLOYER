import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil'
// 전역 Store
import AppStore from '../../../../Store/appStore'
import { StatusStore, MarkUpStore, PMDCStore } from '../../../../Store/statusStore'
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
function FavoriteEquipItem({ equipList, depth, keyIdx }: EquipFavoriteItemProps) {
    global.log('FavoriteEquipItem::')

    // 전역 Store
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)
    const [userContext, setUserContext] = useRecoilState(AppStore.userContext)
    const userId = useRecoilValue(AppStore.userId)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)

    // MarkUp State
    const isMarkupChanged = useRecoilValue(MarkUpStore.isMarkupChanged)
    const setIsShowMarkupPopup = useSetRecoilState(MarkUpStore.isShowMarkupPopup)

    const [controlMode, setControlMode] = useRecoilState(StatusStore.controlMode)
    const [isPMDC, setIsPMDC] = useRecoilState(PMDCStore.isPMDC)
    const setIsPMDCTagOn = useSetRecoilState(PMDCStore.isPMDCTagOn)
    const setSelPMDCEquipment = useSetRecoilState(PMDCStore.selPMDCEquipment)

    // 라우터 경로 이동을 위한 네비게이터
    const navigate = useNavigate()

    const onEquipmentClick = React.useCallback(
        async (item: FavoriteEquipment) => {
            if (controlMode === 'pmdc') {
                console.log("controlMode:", controlMode)
                setControlMode('select')
                setIsPMDC(false)
                setIsPMDCTagOn(false)
                setSelPMDCEquipment([])
            }
            // 도면 변경
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
        [navigate, isMarkupChanged, setIsShowMarkupPopup, setYesNoPopupValue, selectedCanvas]
    )

    return (
        <>
            {equipList.map((equipItem: FavoriteEquipment) => {
                keyIdx += 1
                //const checkRes = useEquipmentObj.equipmentCheckSelected(equipemntObj)
                return (
                    <div
                        className="TreeViewItem"
                        key={keyIdx}
                        onClick={(e) => {
                            e.stopPropagation()
                            onEquipmentClick(equipItem)
                        }}
                    >
                        {/* SelectedLabel */}
                        <div className={cn('Label ')}>
                            <div className="Image1" />
                            {/* 설비 아이콘 */}
                            {TreeViewItemEl.equipmentIcon('var(--Icon-Normal)', depth)}
                            {/* 설비 텍스트 */}
                            {TreeViewItemEl.getNormalText(equipItem.function, depth, '29px')}
                            {/* 설비 삭제 버튼 */}
                            <div
                                className="CloseButton"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    commonActive.removeEquipmentFavorite(
                                        equipItem.docId,
                                        equipItem.docVer,
                                        userContext,
                                        userId,
                                        Api,
                                        setUserContext,
                                        equipItem.tagId
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

export default React.memo(FavoriteEquipItem)
