import React from 'react'
import './EquipmentMenu.css'
import { CloseSideMenu } from '../CloseSideMenu'
import { EquipmentList } from '../../types'
import { TreeView, TreeViewItemSource } from '../../common/TreeView'
import { makeFolderLabel, makeEquipmentItems, normalOnIcon, normalOffIcon } from './TreeViewItem'
import { StatusContext, pushCommand } from '../..'

export function EquipmentMenu() {
    const status = React.useContext(StatusContext)

    const [extendedIds, setExtendedIds] = React.useState(new Set<string>())

    React.useEffect(() => {
        setExtendedIds(new Set<string>())
    }, [status.documentContext])

    const makeTreeItem = React.useCallback(
        (list: EquipmentList, depth: number): TreeViewItemSource => {
            const items: TreeViewItemSource[] = []

            for (const subfolder of list.subfolders) {
                const item = makeTreeItem(subfolder, depth + 1)
                items.push(item)
            }

            if (status.documentContext) {
                makeEquipmentItems(items, list, depth)
            }

            const isShowAll = status.libId === list.libId

            const equipmentLibClick = () => {
                if (isShowAll) {
                    pushCommand({ name: 'selectEquipmentGroup', value: { libId: undefined } })
                } else {
                    pushCommand({ name: 'selectEquipmentGroup', value: { libId: list.libId } })
                }
            }

            const key = list.libId

            // libName과 libDesc가 다르다면 libDesc를 설비 심볼 이름으로 사용함
            const libName = list.libName !== list.libDesc ? list.libDesc : list.libName

            const item = {
                label: makeFolderLabel(libName, depth, isShowAll, equipmentLibClick),
                key,
                items,
                onClick: () => {
                    const newValues = new Set<string>(extendedIds)

                    if (newValues.has(key)) {
                        newValues.delete(key)
                    } else {
                        newValues.add(key)
                    }

                    setExtendedIds(newValues)
                }
            }

            return item
        },
        [status.documentContext, extendedIds, status.libId]
    )

    const treeItems = React.useMemo((): TreeViewItemSource[] => {
        const value: TreeViewItemSource[] = []

        if (status.documentContext) {
            for (const list of status.documentContext.equipmentList) {
                value.push(makeTreeItem(list, 0))
            }
        }

        return value
    }, [status.documentContext, makeTreeItem])

    const getAncestor = React.useCallback(
        (list: EquipmentList): string[] => {
            const values: string[] = []

            if (status.documentContext) {
                for (const equipment of list.equipments) {
                    for (const selectedEquipment of status.equipments) {
                        if (equipment.tagId === selectedEquipment.tagId) {
                            const key = list.libId
                            return [key]
                        }
                    }
                }

                for (const subfolder of list.subfolders) {
                    const value = getAncestor(subfolder)

                    if (0 < value.length) {
                        const key = list.libId
                        values.push(key)
                        values.push(...value)
                    }
                }
            }

            return values
        },
        [status.documentContext, status.equipments]
    )

    React.useEffect(() => {
        async function fetchData() {
            const values: string[] = []

            if (status.documentContext) {
                for (const list of status.documentContext.equipmentList) {
                    values.push(...getAncestor(list))
                }
            }

            setExtendedIds(new Set<string>(values))
        }

        fetchData()
    }, [status.documentContext, getAncestor])

    const selectedIds = React.useMemo((): Set<string> => {
        const values = new Set<string>()

        for (const equipment of status.equipments) {
            values.add(equipment.tagId)
        }

        return values
    }, [status.equipments])

    const showAllBackground = (
        <div
            className="ShowAllBackground"
            onClick={(e) => {
                if (status.libId === 'all') {
                    pushCommand({ name: 'selectEquipmentGroup', value: { libId: undefined } })
                } else {
                    pushCommand({ name: 'selectEquipmentGroup', value: { libId: 'all' } })
                }
                e.stopPropagation()
            }}
        />
    )

    const showAllIcon =
        status.libId === 'all' ? normalOnIcon('var(--Background-Highlight)') : normalOffIcon('var(--Icon-Normal)')

    return (
        <div className="EquipmentMenu SideViewShadow SideViewBackground" style={style(status.currentMenu)}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">설비</span>
            <CloseSideMenu onMenuChange={status.onMenuChange} />
            {showAllIcon}
            {showAllBackground}
            <TreeView
                id="equipmentMenuTreeView"
                items={treeItems}
                extendedIds={extendedIds}
                selectedIds={selectedIds}
            />
        </div>
    )
}

function style(currentMenu: string) {
    return 'equipment' === currentMenu
        ? { transform: 'translateX(var(--SideMenuWidth))' }
        : { transform: 'translateX(calc(var(--DocumentMenuWidth) * -1 ))' }
}
