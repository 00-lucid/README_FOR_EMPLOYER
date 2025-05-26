import React, { useEffect } from 'react'
import './MydocMenu.css'
import './MydocTreeView.css'
import { CloseSideMenuBtn } from '../Component/CloseSideMenuBtn'
import { deleteMydocFile, getMydocList, mydocFileDownload, mydocInformation } from '../../../Api/mydoc'
import { isMobile } from 'react-device-detect'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import AppStore from '../../../Store/appStore'
import { StatusStore } from '../../../Store/statusStore'
import TreeViewItemEl from '../../CommonView/TreeView/TreeViewItem'
import { ControlView } from '../Component/ControlView'
import { global } from '../../../Lib/util'

type TreeViewItemSource = {
    label: TreeViewItemLabel
    key: string
    items: TreeViewItemSource[]
    onClick: () => void
}

type Props = {
    id: string
    items: TreeViewItemSource[]
    extendedIds: Set<string>
    selectedIds: Set<string>
    style?: React.CSSProperties
}

type TreeViewItemProps = {
    children?: any
    label: TreeViewItemLabel
    offset: number
    childrenHeight: number
    onClick: () => void
    isExtended: boolean
    isSelected: boolean
}

type TreeViewItemValue = { elements: JSX.Element[]; height: number }

export function MydocMenu() {
    const userId = useRecoilValue<string | undefined>(AppStore.userId)
    // const status = React.useContext(StatusContext)

    const [extendedIds, setExtendedIds] = React.useState(new Set<string>())
    const [mydocList, setMydocList] = React.useState<MydocFolder[]>([])
    const [selectedIds, setSelectedIds] = React.useState(new Set<string>())
    const [selectedFolder, setSelectedFolder] = React.useState<MydocFolder>()
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    const setBanner = useSetRecoilState(StatusStore.banner)
    const currentMenu = useRecoilValue<string>(StatusStore.currentMenu)

    const [editable, setEditable] = React.useState(false)

    useEffect(() => {
        global.log('@MYDOCLIST: ', mydocList)
    }, [mydocList])

    const TreeViewItem = ({ children, childrenHeight, label, offset, isExtended, isSelected, onClick }: TreeViewItemProps) => {
        const value = isSelected ? label.selected : label.normal
        const value2 = isExtended ? value.open : value.close

        return (
            <div
                className="TreeViewItem"
                style={{
                    top: offset + label.heightUnit,
                    height: childrenHeight + label.height + label.heightUnit,
                }}
                onClick={(e) => {
                    onClick()
                    e.stopPropagation()
                }}
            >
                {value2}
                <div
                    className="Children"
                    style={{
                        top: label.height + label.heightUnit,
                        height: childrenHeight + label.heightUnit,
                    }}
                >
                    {children}
                </div>
            </div>
        )
    }

    const makeTreeViewItem = (
        items: TreeViewItemSource[],
        offset: number,
        extendedIds: Set<string>,
        selectedIds: Set<string>,
        isLeafNode: boolean
    ): TreeViewItemValue => {
        const elements: JSX.Element[] = []
        let height = 0

        for (let i = 0; i < items.length; i++) {
            const item = items[i]

            const isExtended = extendedIds.has(item.key)
            const isSelected = selectedIds.has(item.key)

            let children: TreeViewItemValue

            // isLeafNode는 애니메이션 때문에 넣었다.
            // 노드 확장 할 때(isExtended === true) 애니메이션이 진행되는 동안 children은 빈칸으로 나온다.
            // 그래서 마지막 노드를 강제로 그리고 숨긴다.
            if (isExtended || !isLeafNode) {
                children = makeTreeViewItem(item.items, 0, extendedIds, selectedIds, !isExtended)
            } else {
                children = { elements: [], height: 0 }
            }

            const childrenHeight = isExtended ? children.height : 0

            const element = (
                <TreeViewItem
                    key={item.key}
                    offset={offset + height}
                    label={item.label}
                    isExtended={isExtended}
                    isSelected={isSelected}
                    onClick={item.onClick}
                    childrenHeight={childrenHeight}
                >
                    {children.elements}
                </TreeViewItem>
            )

            elements.push(element)

            height = height + (isExtended ? children.height : 0) + item.label.height
        }

        return { elements, height }
    }

    function TreeView({ id, items, extendedIds, selectedIds, style }: Props) {
        global.log('@TREEVIEW: ', items)

        const treeViewItems = React.useMemo((): TreeViewItemValue => {
            return makeTreeViewItem(items, 0, extendedIds, selectedIds, false)
        }, [items, extendedIds, selectedIds])

        return (
            <div className="CommonComponent" id={id} style={style}>
                <div className="MydocTreeViewComponent">{treeViewItems.elements}</div>
            </div>
        )
    }

    const makeDocumentLabel = (text: string, depth: number, onRemoveClick: () => void, editable: boolean): TreeViewItemLabel => {
        const labelHeight = 40

        const normal = (
            <div className="Label" style={{ height: labelHeight + 'px' }}>
                <div className="Image1" />
                {TreeViewItemEl.documentIcon('var(--Icon-Normal)', depth)}
                {TreeViewItemEl.getNormalText(text, depth, '55px')}
                <div
                    hidden={!editable}
                    className="CloseButton"
                    onClick={(e) => {
                        onRemoveClick()
                        e.stopPropagation()
                    }}
                >
                    <svg className="CloseIcon" width="24" height="24">
                        <g fill="none" fillRule="evenodd">
                            <path
                                d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10"
                                fill="var(--CloseIcon-Fill)"
                            />
                            <path stroke="var(--CloseIcon-Stroke)" strokeLinecap="round" d="m16 8-8 8M16 16 8 8" />
                        </g>
                    </svg>
                </div>
            </div>
        )

        const selected = (
            <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
                <div className="Image1" />
                {TreeViewItemEl.documentIcon('var(--Icon-Highlight)', depth)}
                {TreeViewItemEl.getSelectedText(text, depth, '55px')}
            </div>
        )

        return {
            height: labelHeight,
            heightUnit: 'px',
            selected: { open: selected, close: selected },
            normal: { open: normal, close: normal },
        }
    }

    const openDocument = (info: Mydoc) => {
        let ext = info.filename.split('.').pop()

        global.log('@EXT: ', ext)
        global.log('@VIEWERURL: ', info.viewerUrl)

        if (ext) {
            ext = ext.toUpperCase()
        } else {
            ext = ''
        }

        if (
            ext === 'DOCX' ||
            ext === 'PPT' ||
            ext === 'PNG' ||
            ext === 'PPTX' ||
            ext === 'HWP' ||
            ext === 'JPG' ||
            ext === 'JPEG' ||
            ext === 'XLS' ||
            ext === 'PDF' ||
            ext === 'GIF' ||
            ext === 'BMP'
        ) {
            window.open(info.viewerUrl, 'FarpointExternalWindow')
        } else {
            setOkPopupValue({ message: `지원하지 않는 형식(${ext})입니다.`, ok: () => {} })
        }
    }

    const openDocumentKhnp = (info: Mydoc) => {
        let ext = info.filename.split('.').pop()

        if (ext) {
            ext = ext.toUpperCase()
        } else {
            ext = ''
        }

        if (
            ext === 'DOCX' ||
            ext === 'PPT' ||
            ext === 'PNG' ||
            ext === 'PPTX' ||
            ext === 'HWP' ||
            ext === 'JPG' ||
            ext === 'JPEG' ||
            ext === 'XLS' ||
            ext === 'PDF' ||
            ext === 'GIF' ||
            ext === 'BMP'
        ) {
            // window.open(info.viewerUrl, 'FarpointExternalWindow')
            if (userId) mydocFileDownload(userId, info.id, info.filename)
        } else {
            setOkPopupValue({ message: `지원하지 않는 형식(${ext})입니다.`, ok: () => {} })
        }
    }

    function makeDocumentItems(
        items: TreeViewItemSource[],
        list: MydocFolder,
        depth: number,
        userId: string,
        reload: () => Promise<void>,
        editable: boolean
    ) {
        for (const mydoc of list.documents) {
            const onRemoveClick = async () => {
                const confirmValue = {
                    message: '파일을 삭제할까요?',
                    yes: async () => {
                        setBanner('삭제 중...')

                        await deleteMydocFile(userId, mydoc.id)

                        await reload()
                    },
                    no: () => {},
                }

                setYesNoPopupValue(confirmValue)
            }

            const item = {
                label: makeDocumentLabel(mydoc.filename, depth + 1, onRemoveClick, editable),
                key: mydoc.id,
                items: [],
                onClick: () => {
                    // 내문서 파일 열기
                    if (process.env.REACT_APP_DB === '한수원') {
                        openDocumentKhnp(mydoc)
                    } else {
                        openDocument(mydoc)
                    }
                },
            }

            items.push(item)
        }
    }

    const makeFolderLabel = (text: string, depth: number): TreeViewItemLabel => {
        const labelHeight = 40

        const normalOpen = (
            <div className="Label" style={{ height: labelHeight + 'px' }}>
                {TreeViewItemEl.arrowIcon(false, 'var(--Icon-Normal)', depth)}
                {TreeViewItemEl.folderOpenIcon('var(--Icon-Normal)', depth)}
                {TreeViewItemEl.getNormalText(text, depth, '55px')}
            </div>
        )

        const normalClose = (
            <div className="Label" style={{ height: labelHeight + 'px' }}>
                {TreeViewItemEl.arrowIcon(true, 'var(--Icon-Normal)', depth)}
                {TreeViewItemEl.folderCloseIcon('var(--Icon-Normal)', depth)}
                {TreeViewItemEl.getNormalText(text, depth, '55px')}
            </div>
        )

        const selectedOpen = (
            <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
                {TreeViewItemEl.arrowIcon(false, 'var(--Icon-Highlight)', depth)}
                {TreeViewItemEl.folderOpenIcon('var(--Icon-Highlight)', depth)}
                {TreeViewItemEl.getSelectedText(text, depth, '55px')}
            </div>
        )

        const selectedClose = (
            <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
                {TreeViewItemEl.arrowIcon(true, 'var(--Icon-Highlight)', depth)}
                {TreeViewItemEl.folderCloseIcon('var(--Icon-Highlight)', depth)}
                {TreeViewItemEl.getSelectedText(text, depth, '55px')}
            </div>
        )

        return {
            height: labelHeight,
            heightUnit: 'px',
            selected: { open: selectedOpen, close: selectedClose },
            normal: { open: normalOpen, close: normalClose },
        }
    }

    React.useEffect(() => {
        async function fetchData() {
            const res = await mydocInformation()

            setEditable(res.editable)
        }

        if (!isMobile) fetchData()
    }, [])

    const reload = React.useCallback(async () => {
        if (userId) {
            setMydocList(await getMydocList(userId))
        }

        setBanner(undefined)
    }, [userId])

    React.useEffect(() => {
        reload()
    }, [reload])

    const makeTreeItem = React.useCallback(
        (list: MydocFolder, depth: number): TreeViewItemSource => {
            const items: TreeViewItemSource[] = []

            if (userId) {
                for (const subfolder of list.subfolders) {
                    const item = makeTreeItem(subfolder, depth + 1)
                    items.push(item)
                }

                makeDocumentItems(items, list, depth, userId, reload, editable)
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
                },
            }

            global.log('@ITEM: ', item)

            return item
        },
        [userId, editable, extendedIds, reload]
    )

    const treeItems = React.useMemo((): TreeViewItemSource[] => {
        const value: TreeViewItemSource[] = []

        for (const list of mydocList) {
            value.push(makeTreeItem(list, 0))
        }

        global.log('@TREEITEMSVAL: ', value)

        return value
    }, [mydocList, makeTreeItem])

    return (
        <div className="MydocMenu SideViewShadow SideViewBackground" style={style(currentMenu)}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">내 문서</span>
            <CloseSideMenuBtn />
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
    return 'mydoc' === currentMenu ? { marginLeft: 'var(--SideMenuWidth)' } : { marginLeft: 'calc(var(--MydocMenuWidth) * -1 )' }
}
