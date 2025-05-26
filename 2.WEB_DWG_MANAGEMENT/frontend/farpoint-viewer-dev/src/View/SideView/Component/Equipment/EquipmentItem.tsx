import React from 'react'
// Lib
import { global } from '../../../../Lib/util'
import cn from 'classnames'
// Controller
import useEquipment from '../../../../Controller/useEquipment'
// Component
import TreeViewItemEl from '../../../CommonView/TreeView/TreeViewItem'

// TreeView - 설비
function EquitmentItem({ equipmentList, depth, keyIdx, parentId }: EquipmentItemProps) {
    global.log('EquitmentItem::', equipmentList, keyIdx)

    // Controller
    const useEquipmentObj = useEquipment(parentId)
    const refs = useEquipmentObj.refs

    return (
        <>
            {equipmentList.map((equipemntObj: EquipmentContext) => {
                keyIdx += 1
                const checkRes = useEquipmentObj.equipmentCheckSelected(equipemntObj)
                return (
                    <div
                        className="TreeViewItem"
                        ref={(el) => {
                            refs.current.set(equipemntObj.tagId, el)
                        }}
                        key={keyIdx}
                        onClick={(e) => useEquipmentObj.equipmentMenuItemClick(e, equipemntObj)}
                    >
                        {/* SelectedLabel */}
                        <div className={cn('Label ', checkRes ? 'SelectedLabel' : '')}>
                            {/* 설비 아이콘 */}
                            {TreeViewItemEl.equipmentIcon(checkRes ? 'var(--Icon-Highlight)' : 'var(--Icon-Normal)', depth)}
                            {/* 설비 텍스트 */}
                            {checkRes
                                ? TreeViewItemEl.getSelectedText(equipemntObj.function, depth, '29px')
                                : TreeViewItemEl.getNormalText(equipemntObj.function, depth, '29px')}
                        </div>
                    </div>
                )
            })}
        </>
    )
}

export default React.memo(EquitmentItem)
