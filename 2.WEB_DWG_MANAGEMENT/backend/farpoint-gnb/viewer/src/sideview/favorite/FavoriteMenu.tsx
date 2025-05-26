import React from 'react'
import './FavoriteMenu.css'
import { CloseSideMenu } from '../CloseSideMenu'
import { FavoriteDocument, FavoriteEquipment } from '../../types'
import { AppContext, ThemeContext } from '../../context'
import { TreeView, TreeViewItemSource } from '../../common/TreeView'
import { makeFolderLabel, makeDocumentLabel, makeEquipmentLabel } from './TreeViewItem'
import { StatusContext, pushCommand } from '../..'

export function FavoriteMenu() {
    const appContext = React.useContext(AppContext)
    const theme = React.useContext(ThemeContext)
    const status = React.useContext(StatusContext)

    const [extendedIds, setExtendedIds] = React.useState(
        new Set<string>(['documentFavoriteKey', 'equipmentFavoriteKey'])
    )

    const onDocumentClick = React.useCallback(async (item: FavoriteDocument) => {
        pushCommand({
            name: 'requestOpenDocument',
            value: {
                selectedDocument: {
                    docKey: { docId: item.docId, docVer: item.docVer },
                    plantCode: item.plantCode
                },
                ok: () => {
                    pushCommand({ name: 'zoomExtents' })
                }
            }
        })
    }, [])

    const makeDocumentFolder = React.useCallback((): TreeViewItemSource => {
        const items: TreeViewItemSource[] = []

        if (appContext.userContext) {
            for (const value of appContext.userContext.favorite.documents) {
                const key = value.docId + value.docVer
                const text = theme.documentDisplayType === 'name' ? value.docName : value.docNumber

                const onRemoveClick = () => appContext.removeDocumentFavorite(value)
                const item = {
                    label: makeDocumentLabel(text, 1, onRemoveClick),
                    key,
                    items: [],
                    onClick: () => onDocumentClick(value)
                }

                items.push(item)
            }
        }

        const key = 'documentFavoriteKey'

        const item = {
            label: makeFolderLabel('도면', 0),
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
    }, [appContext, extendedIds, onDocumentClick, theme.documentDisplayType])

    const onEquipmentClick = React.useCallback(async (item: FavoriteEquipment) => {
        pushCommand({
            name: 'requestOpenDocument',
            value: {
                selectedDocument: {
                    docKey: { docId: item.docId, docVer: item.docVer },
                    plantCode: item.plantCode
                },
                ok: () => {
                    pushCommand({
                        name: 'selectEquipment',
                        value: { equipments: [{ tagId: item.tagId }], equipmentLinks: [] }
                    })
                    pushCommand({ name: 'zoomEntity', value: { equipments: [{ tagId: item.tagId }] } })
                }
            }
        })
    }, [])

    const makeEquipmentFolder = React.useCallback((): TreeViewItemSource => {
        const items: TreeViewItemSource[] = []

        if (appContext.userContext) {
            for (const value of appContext.userContext.favorite.equipments) {
                const key = value.docId + value.docVer + value.tagId
                const text = value.function

                const onRemoveClick = () => appContext.removeEquipmentFavorite(value, value)
                const item = {
                    label: makeEquipmentLabel(text, 1, onRemoveClick),
                    key,
                    items: [],
                    onClick: () => onEquipmentClick(value)
                }

                items.push(item)
            }
        }

        const key = 'equipmentFavoriteKey'

        const item = {
            label: makeFolderLabel('설비', 0),
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
    }, [appContext, extendedIds, onEquipmentClick])

    const treeItems = React.useMemo((): TreeViewItemSource[] => {
        return [makeDocumentFolder(), makeEquipmentFolder()]
    }, [makeDocumentFolder, makeEquipmentFolder])

    const selectedIds = React.useMemo((): Set<string> => {
        return new Set<string>()
    }, [])

    function style(currentMenu: string) {
        return 'favorite' === currentMenu
            ? { transform: 'translateX(var(--SideMenuWidth))' }
            : { transform: 'translateX(calc(var(--FavoriteMenuWidth) * -1 ))' }
    }

    return (
        <div className="FavoriteMenu SideViewShadow SideViewBackground" style={style(status.currentMenu)}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">즐겨찾기</span>
            <CloseSideMenu onMenuChange={status.onMenuChange} />
            <TreeView
                id="favoriteMenuTreeView"
                items={treeItems}
                extendedIds={extendedIds}
                selectedIds={selectedIds}
            />{' '}
        </div>
    )
}
