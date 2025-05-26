import React from 'react'
// Component
import TreeViewItemEl from '../../../CommonView/TreeView/TreeViewItem'
import EquipmentItem from './EquipmentItem'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore } from '../../../../Store/statusStore'
import { PainterContext } from '../../../../Store/painterContext'
// Lib
import { global } from '../../../../Lib/util'
import cn from 'classnames'

// Equitment TreeView - 폴더
function EquitmentFolder({ folderList, depth, keyIdx, sideBarEquipmentFolderShowSelect }: EquitmentFolders) {
    global.log('EquitmentFolder::', keyIdx)
    // 전역 Store
    const [selectedEquipFolderIds, setSelectedEquipFolderIds] = useRecoilState(StatusStore.selectedEquipFolderIds)
    const [libId, setLibId] = useRecoilState(StatusStore.libId)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const setBanner = useSetRecoilState(StatusStore.banner)

    // 전역 컨텍스트
    const painterContext = React.useContext(PainterContext)
    if (!painterContext) throw new Error('Unhandled context')
    const { entityPainter } = painterContext

    // 폴더 클릭
    const folderClick = React.useCallback(
        (e: React.MouseEvent<HTMLElement>, equipmentObj: EquipmentList) => {
            global.log('?folder Click', equipmentObj)
            if (e) e.stopPropagation()

            const newSelectedIds = new Set<string>(selectedEquipFolderIds)
            const keyString = equipmentObj.libId + equipmentObj.parentId
            if (newSelectedIds.has(keyString)) {
                newSelectedIds.delete(keyString)
            } else {
                newSelectedIds.add(keyString)
            }

            setSelectedEquipFolderIds(newSelectedIds)
        },
        [selectedEquipFolderIds, setSelectedEquipFolderIds]
    )

    // 눈동자 클릭
    const equipmentShowAllClick = React.useCallback(
        (e: React.MouseEvent<HTMLElement>, equipmentObj: EquipmentList) => {
            global.log('?equipmentShowAllClick Click', equipmentObj)
            if (e) e.stopPropagation()

            // 설비 눈동자 아이콘 선택 & 설비 색상 변경
            sideBarEquipmentFolderShowSelect(libId, equipmentObj.libId, selectedCanvas, setLibId, entityPainter, setBanner)
        },
        [libId, setLibId, selectedCanvas, entityPainter, sideBarEquipmentFolderShowSelect, setBanner]
    )

    return (
        <>
            {folderList.map((equipmentObj: EquipmentList) => {
                global.log('equipmentObj::', equipmentObj, keyIdx)
                keyIdx += 1
                const keyString = equipmentObj.libId + equipmentObj.parentId

                return (
                    <div className="TreeViewItem" key={keyIdx} onClick={(e) => folderClick(e, equipmentObj)}>
                        <div className="Label">
                            {/* 화살표 아이콘 */}
                            {TreeViewItemEl.arrowIcon(selectedEquipFolderIds.has(keyString) ? false : true, 'var(--Icon-Normal)', depth)}
                            {/* 폴더 이름 */}
                            {TreeViewItemEl.getNormalText(equipmentObj.libDesc, depth, '29px')}
                            {/* 눈동자 */}
                            {libId === equipmentObj.libId
                                ? TreeViewItemEl.normalOnIcon('var(--Background-Highlight)')
                                : TreeViewItemEl.normalOffIcon('var(--Icon-Normal)')}
                            {
                                <div
                                    className="ShowAllBackground"
                                    onClick={(e) => {
                                        equipmentShowAllClick(e, equipmentObj)
                                    }}
                                />
                            }
                        </div>

                        <div className={cn('Children', selectedEquipFolderIds.has(keyString) ? 'SelectedFolder' : '')}>
                            {
                                // 현재 폴더가 선택되어 있다면 -> 다음
                                selectedEquipFolderIds.has(keyString) ? (
                                    // 하위 폴더가 있다면 -> 폴더 리스트 생성
                                    equipmentObj.subfolders.length > 0 ? (
                                        <EquitmentFolder
                                            folderList={equipmentObj.subfolders}
                                            depth={depth + 1}
                                            keyIdx={0}
                                            sideBarEquipmentFolderShowSelect={sideBarEquipmentFolderShowSelect}
                                        />
                                    ) : // 하위 폴더가 없다면 도면이 있는지 확인 -> 설비 리스트 생성
                                    equipmentObj.equipments.length > 0 ? (
                                        <EquipmentItem
                                            equipmentList={equipmentObj.equipments}
                                            depth={depth + 1}
                                            keyIdx={0}
                                            parentId={equipmentObj.libId}
                                        />
                                    ) : null
                                ) : null
                            }
                        </div>
                    </div>
                )
            })}
        </>
    )
}

export default React.memo(EquitmentFolder)
