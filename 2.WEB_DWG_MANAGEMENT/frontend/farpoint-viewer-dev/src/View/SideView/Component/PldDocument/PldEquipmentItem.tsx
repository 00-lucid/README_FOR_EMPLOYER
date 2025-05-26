import React from 'react'
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil'
// 전역 Store
import { PldStore, StatusStore } from '../../../../Store/statusStore'
import { ControllerContext } from '../../../../Store/controllerContext'
import { PainterContext } from '../../../../Store/painterContext'
// Lib
import { global } from '../../../../Lib/util'
import cn from 'classnames'
// Controller
// Component
import TreeViewItemEl from '../../../CommonView/TreeView/TreeViewItem'
import ThemeStore from '../../../../Store/ThemeStore'

// TreeView - 설비
function PldEquitmentItem({ depth, keyIdx, type }: { depth: number; keyIdx: number; type: string }) {
    global.log('Pld EquitmentItem::', keyIdx)

    // 전역 Store
    const [pldEquipList, setPldEquipList] = useRecoilState(PldStore.pldEquipList)
    const pldHandle = useRecoilValue(PldStore.pldHandle)
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)
    const setPldViewChange = useSetRecoilState(PldStore.pldViewChange)

    // 전역 컨텍스트
    const controllerContext = React.useContext(ControllerContext)
    const painterContext = React.useContext(PainterContext)

    if (!controllerContext || !painterContext) throw new Error('Unhandled context')
    // Canvas Controller
    const { canvasController } = controllerContext
    const { entityPainter } = painterContext

    const itemClick = React.useCallback(
        async (e: React.MouseEvent<HTMLElement>, handle: string) => {
            global.log('PldEquipmentitem Click')
            if (e) e.stopPropagation()

            if (canvasController) canvasController.zoomEntity([handle])
            setPldViewChange(true)
        },
        [canvasController, setPldViewChange]
    )
    // Pld 핸들 삭제
    const pldHandleListChange = React.useCallback(
        (handle: string) => {
            const newPldEquipList = pldEquipList.filter((pldEquip) => {
                return pldEquip.handle !== handle
            })

            setPldEquipList(newPldEquipList)

            // (선택한 설비들) 색상변경
            entityPainter.setPldHandleList(newPldEquipList)
        },
        [pldEquipList, setPldEquipList, entityPainter]
    )

    return (
        <>
            {pldEquipList.map((pldEquip: PldEquipment, idx: number) => {
                keyIdx += 1
                const checkRes = pldEquip.handle === pldHandle
                return pldEquip.type === type ? (
                    <div className="TreeViewItem" key={keyIdx} onClick={(e) => itemClick(e, pldEquip.handle)}>
                        {/* SelectedLabel */}
                        <div className={cn('Label ', checkRes ? 'SelectedLabel' : '')}>
                            <div className="Image1" />
                            {/* PLD 설비 아이콘 */}
                            {TreeViewItemEl.pldEquipPocessIcon(checkRes ? 'var(--Icon-Highlight)' : 'var(--Icon-Normal)', depth)}
                            {/* 설비 텍스트 */}
                            {TreeViewItemEl.getPldNomalText(pldEquip.function, depth, '55px')}
                            {/* X 버튼 */}
                            <div
                                className="CloseButton"
                                onClick={(e) => {
                                    e.stopPropagation()

                                    const confirmValue = {
                                        message: '프로세스를 삭제할까요?',
                                        yes: () => {
                                            pldHandleListChange(pldEquip.handle)
                                        },
                                        no: () => {},
                                    }
                                    setYesNoPopupValue(confirmValue)
                                }}
                            >
                                {TreeViewItemEl.pldCloseIcon()}
                            </div>
                        </div>
                    </div>
                ) : null
            })}
        </>
    )
}

export default React.memo(PldEquitmentItem)
