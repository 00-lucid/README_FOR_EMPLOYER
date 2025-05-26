import React from 'react'
import { useRecoilState } from 'recoil'
// Component
import TreeViewItemEl from '../../../CommonView/TreeView/TreeViewItem'
import PldEquipmentItem from './PldEquipmentItem'
// 전역 Store
import { StatusStore } from '../../../../Store/statusStore'
// Lib
import { global } from '../../../../Lib/util'
import cn from 'classnames'

// PldEquipmentFolder - TreeView>PldDocumentFolder> - 폴더
function PldEquipmentFolder({ pldDocument, depth, keyIdx }: PldEquipmentFolders) {
    // 전역 Store
    const [selectedEquipFolderIds, setSelectedEquipFolderIds] = useRecoilState(StatusStore.selectedEquipFolderIds)

    const pldEquipmentFolderTypeList = React.useRef([
        {
            type: 'openValve',
            name: '열림밸브',
            code: '001',
        },
        {
            type: 'closeValve',
            name: '닫힘밸브',
            code: '002',
        },
        {
            type: 'controlValve',
            name: '조절밸브',
            code: '005',
        },
        {
            type: 'main',
            name: '주유로',
            code: '003',
        },
        {
            type: 'sub',
            name: '보조유로',
            code: '004',
        },
    ])

    const folderClick = React.useCallback(
        async (e: React.MouseEvent<HTMLElement>, equipFolder: PldEquipmentFolderType) => {
            global.log('PldEquipmentFolder Click')
            if (e) e.stopPropagation()

            const newSelectedIds = new Set<string>(selectedEquipFolderIds)
            const keyString = pldDocument.DOCNO + pldDocument.DOCVR + equipFolder.type
            if (newSelectedIds.has(keyString)) {
                newSelectedIds.delete(keyString)
            } else {
                newSelectedIds.add(keyString)
            }

            setSelectedEquipFolderIds(newSelectedIds)
        },
        [pldDocument, selectedEquipFolderIds, setSelectedEquipFolderIds]
    )

    return (
        <>
            {pldEquipmentFolderTypeList.current.map((equipFolder: PldEquipmentFolderType) => {
                keyIdx += 1
                const keyString = pldDocument.DOCNO + pldDocument.DOCVR + equipFolder.type
                const selectChkRes = selectedEquipFolderIds.has(keyString)
                return (
                    // PLD->프로세스->도면 드롭다운 폴더->설비폴더(열림밸브 등)
                    <div className="TreeViewItem" key={keyIdx} onClick={(e) => folderClick(e, equipFolder)}>
                        <div className={cn('Label ', selectChkRes ? 'SelectedLabel' : '')}>
                            {/* 화살표 아이콘 */}
                            {TreeViewItemEl.arrowIcon(
                                selectChkRes ? false : true,
                                selectChkRes ? 'var(--Icon-Highlight)' : 'var(--Icon-Normal)',
                                depth
                            )}
                            {/* 폴더 아이콘 */}
                            {TreeViewItemEl.pldEquipfolderIcon('', depth, equipFolder.type)}
                            {/* 폴더 이름 */}
                            {selectChkRes
                                ? TreeViewItemEl.getPldSelectedText(equipFolder.name, depth, '55px')
                                : TreeViewItemEl.getPldNomalText(equipFolder.name, depth, '55px')}
                            {/*{TreeViewItemEl.getPldSelectedText(selectChkRes, equipFolder.name, depth, '55px')}*/}
                        </div>

                        <div className={cn('Children', selectChkRes ? 'SelectedFolder' : '')}>
                            {
                                // 현재 폴더가 선택되어 있다면 -> 다음
                                selectChkRes ? (
                                    <PldEquipmentItem depth={depth + 1} keyIdx={0} type={equipFolder.code} /> // 여기부터 진행~
                                ) : null
                            }
                        </div>
                    </div>
                )
            })}
        </>
    )
}

export default React.memo(PldEquipmentFolder)
