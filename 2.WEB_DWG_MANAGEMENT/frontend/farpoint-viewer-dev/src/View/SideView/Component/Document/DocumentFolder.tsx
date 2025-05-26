import React from 'react'
// Component
import DocumentItem from './DocumentItem'
import TreeViewItemEl from '../../../CommonView/TreeView/TreeViewItem'
import { useRecoilState } from 'recoil'
// 전역 Store
import { StatusStore } from '../../../../Store/statusStore'
// Lib
import { global } from '../../../../Lib/util'
import cn from 'classnames'

// Document TreeView - 폴더
function DocumentFolder({ folderList, depth, keyIdx }: DocumentFolders) {
    global.log('DocumentFolder::', folderList, keyIdx)
    // 전역 Store
    const [selectedDocFolderIds, setSelectedDocFolderIds] = useRecoilState(StatusStore.selectedDocFolderIds)

    const folderClick = React.useCallback(
        (e: React.MouseEvent<HTMLElement>, documentObj: DocumentList) => {
            global.log('?folder Click', documentObj)
            if (e) e.stopPropagation()

            const newSelectedIds = new Set<string>(selectedDocFolderIds)
            const keyString = documentObj.folderName + documentObj.parentId
            if (newSelectedIds.has(keyString)) {
                newSelectedIds.delete(keyString)
            } else {
                newSelectedIds.add(keyString)
            }

            setSelectedDocFolderIds(newSelectedIds)
        },
        [selectedDocFolderIds, setSelectedDocFolderIds]
    )

    React.useEffect(() => {
        if (keyIdx == 1){
            const newSelectedIds = new Set<string>(selectedDocFolderIds)
            const keyString = folderList[0].folderName + folderList[0].parentId
            if (newSelectedIds.has(keyString)) {
                newSelectedIds.delete(keyString)
            } else {
                newSelectedIds.add(keyString)
            }
            setSelectedDocFolderIds(newSelectedIds)
        }
    },[])
    

    return (
        <>
            {folderList.map((documentObj: DocumentList) => {
                keyIdx += 1
                const keyString = documentObj.folderName + documentObj.parentId

                return (
                    <div className="TreeViewItem" key={keyIdx} onClick={(e) => folderClick(e, documentObj)}>
                        <div className="Label">
                            {/* 화살표 아이콘 */}
                            {TreeViewItemEl.arrowIcon(selectedDocFolderIds.has(keyString) ? false : true, 'var(--Icon-Normal)', depth)}
                            {/* 폴더 아이콘 */}
                            {selectedDocFolderIds.has(keyString)
                                ? TreeViewItemEl.folderOpenIcon('var(--Icon-Normal)', depth)
                                : TreeViewItemEl.folderCloseIcon('var(--Icon-Normal)', depth)}
                            {/* 폴더 이름 */}
                            {TreeViewItemEl.getNormalText(documentObj.folderName, depth, '55px')}
                        </div>

                        <div className={cn('Children', selectedDocFolderIds.has(keyString) ? 'SelectedFolder' : '')}>
                            {
                                // 현재 폴더가 선택되어 있다면 -> 다음
                                selectedDocFolderIds.has(keyString) ? (
                                    // 하위 폴더가 있다면 -> 폴더 리스트 생성
                                    documentObj.subfolders.length > 0 ? (
                                        <DocumentFolder folderList={documentObj.subfolders} depth={depth + 1} keyIdx={0} />
                                    ) : // 하위 폴더가 없다면 도면이 있는지 확인 -> 도면 리스트 생성
                                    documentObj.documents.length > 0 ? (
                                        <DocumentItem documentList={documentObj.documents} depth={depth + 1} keyIdx={0} />
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

export default React.memo(DocumentFolder)
