import React from 'react'
import { DocumentList } from '../..'
import './DocumentMenu.css'
import { CloseSideMenu } from '../CloseSideMenu'
import { ThemeContext, AppContext } from '../../context'
import { DocumentDisplaySelect } from './DocumentDisplaySelect'
import { StatusContext, TreeView, TreeViewItemSource } from '../..'
import Repository from '../../Repository'
import { makeFolderLabel, makeDocumentItems, makeDocumentKey } from './TreeViewItem'
import { RefreshSideMenu } from '../RefreshSideMenu'

export function DocumentMenu() {
    const app = React.useContext(AppContext)
    const context = React.useContext(ThemeContext)
    const status = React.useContext(StatusContext)

    const [extendedIds, setExtendedIds] = React.useState(new Set<string>())
    const [documentList, setDocumentList] = React.useState<DocumentList[]>([])

    React.useEffect(() => {
        async function fetchData() {
            if (app.userId) {
                // 현재날짜
                const today = new Date()
                const timeStamp =
                    String(today.getFullYear()) + String(`0${today.getMonth() + 1}`) + String(`0${today.getDate()}`)

                // 스토리지 도면 로드
                const documentVal = localStorage.getItem(`documentList_${timeStamp}`)

                if (!documentVal) {
                    const documentListRes = await Repository.getDocumentList()
                    setDocumentList(documentListRes)

                    // 스토리지 도면 초기화
                    localStorage.clear()
                    // 스토리지 도면 저장
                    localStorage.setItem(`documentList_${timeStamp}`, JSON.stringify(documentListRes))
                } else {
                    setDocumentList(JSON.parse(documentVal))
                }
            }
        }
        fetchData()
    }, [app.userId])

    const makeTreeItem = React.useCallback(
        (list: DocumentList, depth: number): TreeViewItemSource => {
            const items: TreeViewItemSource[] = []

            for (const subfolder of list.subfolders) {
                const item = makeTreeItem(subfolder, depth + 1)
                items.push(item)
            }

            makeDocumentItems(items, list, depth, context.documentDisplayType)

            const key = list.folderName + list.parentId ?? 'root'

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
                }
            }

            return item
        },
        [context.documentDisplayType, extendedIds]
    )

    const treeItems = React.useMemo((): TreeViewItemSource[] => {
        const value: TreeViewItemSource[] = []

        for (const list of documentList) {
            value.push(makeTreeItem(list, 0))
        }

        return value
    }, [documentList, makeTreeItem])

    const getAncestor = React.useCallback(
        (list: DocumentList): string[] => {
            if (status.documentContext) {
                for (const document of list.documents) {
                    if (
                        status.documentContext.docId === document.docId &&
                        status.documentContext.docId === document.docId
                    ) {
                        const key = list.folderName + list.parentId ?? 'root'
                        return [key]
                    }
                }

                for (const subfolder of list.subfolders) {
                    const value = getAncestor(subfolder)

                    if (0 < value.length) {
                        const key = list.folderName + list.parentId ?? 'root'
                        return [key, ...value]
                    }
                }
            }

            return []
        },
        [status.documentContext]
    )

    React.useEffect(() => {
        async function fetchData() {
            const values: string[] = []

            for (const list of documentList) {
                values.push(...getAncestor(list))
            }

            setExtendedIds(new Set<string>(values))
        }

        fetchData()
    }, [documentList, getAncestor])

    const selectedIds = React.useMemo((): Set<string> => {
        const values = new Set<string>()

        if (status.documentContext) {
            values.add(makeDocumentKey(status.documentContext))
        }

        return values
    }, [status.documentContext])

    return (
        <div className="DocumentMenu SideViewShadow SideViewBackground" style={style(status.currentMenu)}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">도면목록</span>
            <CloseSideMenu onMenuChange={status.onMenuChange} />
            <RefreshSideMenu setDocumentList={setDocumentList} />
            <DocumentDisplaySelect />
            <TopLine />
            <TreeView id="documentMenuTreeView" items={treeItems} extendedIds={extendedIds} selectedIds={selectedIds} />
        </div>
    )
}

function TopLine() {
    return <div className="topline"></div>
}

function style(currentMenu: string) {
    return 'document' === currentMenu
        ? { transform: 'translateX(var(--SideMenuWidth))' }
        : { transform: 'translateX(calc(var(--DocumentMenuWidth) * -1 ))' }
}
