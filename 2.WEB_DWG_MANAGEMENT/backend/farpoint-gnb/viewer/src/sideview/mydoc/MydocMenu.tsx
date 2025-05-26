import React from 'react'
import './MydocMenu.css'
import { CloseSideMenu } from '../CloseSideMenu'
import { ControlView } from './ControlView'
import { setBanner, MydocList, AppContext, StatusContext, TreeView, TreeViewItemSource } from '../..'
import Repository from '../../Repository'
import { makeFolderLabel, makeDocumentItems } from './TreeViewItem'
import { isMobile } from 'react-device-detect'
// Lib
import { serviceConfig } from '../../Lib/util'

export function MydocMenu() {
    const app = React.useContext(AppContext)
    const status = React.useContext(StatusContext)

    const [extendedIds, setExtendedIds] = React.useState(new Set<string>())
    const [mydocList, setMydocList] = React.useState<MydocList[]>([])
    const [selectedIds, setSelectedIds] = React.useState(new Set<string>())
    const [selectedFolder, setSelectedFolder] = React.useState<MydocList>()

    const [editable, setEditable] = React.useState(false)

    React.useEffect(() => {
        async function fetchData() {
            const res = await Repository.mydocInformation()

            setEditable(res.editable)
        }

        if (!isMobile) fetchData()
    }, [])

    const reload = React.useCallback(async () => {
        if (serviceConfig.db === '남부') {
            if (app.userId) {
                setMydocList(await Repository.getMydocList(app.userId))
            }
            setBanner(undefined)
        }
    }, [app.userId])

    React.useEffect(() => {
        reload()
    }, [reload])

    const makeTreeItem = React.useCallback(
        (list: MydocList, depth: number): TreeViewItemSource => {
            const items: TreeViewItemSource[] = []

            if (app.userId) {
                for (const subfolder of list.subfolders) {
                    const item = makeTreeItem(subfolder, depth + 1)
                    items.push(item)
                }

                makeDocumentItems(items, list, depth, app.userId, reload, editable)
            }
            const key = list.id

            const item = {
                label: makeFolderLabel(list.folderName, depth),
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
                    setSelectedIds(new Set<string>([key]))
                    setSelectedFolder(list)
                }
            }

            return item
        },
        [app.userId, editable, extendedIds, reload]
    )

    const treeItems = React.useMemo((): TreeViewItemSource[] => {
        const value: TreeViewItemSource[] = []

        for (const list of mydocList) {
            value.push(makeTreeItem(list, 0))
        }

        return value
    }, [mydocList, makeTreeItem])

    return (
        <div className="MydocMenu SideViewShadow SideViewBackground" style={style(status.currentMenu)}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">내 문서</span>
            <CloseSideMenu onMenuChange={status.onMenuChange} />
            <div hidden={!editable}>
                <ControlView selectedFolder={selectedFolder} setSelectedFolder={setSelectedFolder} reload={reload} />
                <TopLine />
            </div>
            <TreeView
                id="mydocMenuTreeView"
                items={treeItems}
                extendedIds={extendedIds}
                selectedIds={selectedIds}
                style={editable ? { marginTop: '50px' } : {}}
            />
        </div>
    )
}

function TopLine() {
    return <div className="topline"></div>
}

function style(currentMenu: string) {
    return 'mydoc' === currentMenu
        ? { transform: 'translateX(var(--SideMenuWidth))' }
        : { transform: 'translateX(calc(var(--MydocMenuWidth) * -1 ))' }
}
