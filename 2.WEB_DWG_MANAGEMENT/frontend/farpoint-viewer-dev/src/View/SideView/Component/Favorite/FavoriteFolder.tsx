import React from 'react'
import { useRecoilValue } from 'recoil'
// 전역 Store
import AppStore from '../../../../Store/appStore'
// Component
import TreeViewItemEl from '../../../CommonView/TreeView/TreeViewItem'
import FavoriteDocItem from './FavoriteDocItem'
import FavoriteEquipItem from './FavoriteEquipItem'
// Lib
import { global } from '../../../../Lib/util'
import cn from 'classnames'

function FavoriteFolder({ depth, keyIdx }: { depth: number; keyIdx: number }) {
    // 전역 Stroe
    const userContext = useRecoilValue(AppStore.userContext)

    const [extendedIds, setExtendedIds] = React.useState(new Set<string>(['doc', 'equip']))

    const favoriteFolderList = React.useRef([
        {
            key: 'doc',
            name: '도면',
        },
        {
            key: 'equip',
            name: '설비',
        },
    ])

    // 폴더 클릭
    const folderClick = React.useCallback(
        (e: React.MouseEvent<HTMLElement>, key: string) => {
            global.log('?folder Click', key)
            if (e) e.stopPropagation()

            const newSelectedIds = new Set<string>(extendedIds)

            if (newSelectedIds.has(key)) {
                newSelectedIds.delete(key)
            } else {
                newSelectedIds.add(key)
            }

            setExtendedIds(newSelectedIds)
        },
        [extendedIds]
    )

    return (
        <>
            {favoriteFolderList.current.map((folderItem: { key: string; name: string }) => {
                keyIdx += 1
                return (
                    <div className="TreeViewItem" key={keyIdx} onClick={(e) => folderClick(e, folderItem.key)}>
                        <div className="Label">
                            {/* 화살표 아이콘 */}
                            {TreeViewItemEl.arrowIcon(extendedIds.has(folderItem.key) ? false : true, 'var(--Icon-Normal)', depth)}
                            {/* 폴더 이름 */}
                            {TreeViewItemEl.getNormalText(folderItem.name, depth, '29px')}
                        </div>

                        <div className={cn('Children', extendedIds.has(folderItem.key) ? 'SelectedFolder' : '')}>
                            {
                                // 현재 폴더가 선택되어 있다면 -> 다음
                                extendedIds.has(folderItem.key) && userContext ? (
                                    folderItem.key === 'doc' ? (
                                        <FavoriteDocItem docList={userContext.favorite.documents} depth={depth + 1} keyIdx={0} />
                                    ) : (
                                        // equip
                                        <FavoriteEquipItem equipList={userContext.favorite.equipments} depth={depth + 1} keyIdx={0} />
                                    )
                                ) : null
                            }
                        </div>
                    </div>
                )
            })}
        </>
    )
}

export default React.memo(FavoriteFolder)
