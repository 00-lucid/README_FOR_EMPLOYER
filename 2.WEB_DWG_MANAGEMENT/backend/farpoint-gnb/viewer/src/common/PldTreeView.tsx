import React from 'react'
import './TreeView.css'

export type TreeViewItemLabel = {
    height: number
    heightUnit: string
    selected: { open: JSX.Element; close: JSX.Element }
    normal: { open: JSX.Element; close: JSX.Element }
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

const TreeViewItem = ({
    children,
    childrenHeight,
    label,
    offset,
    isExtended,
    isSelected,
    onClick
}: TreeViewItemProps) => {
    const value = isSelected ? label.selected : label.normal
    const value2 = isExtended ? value.open : value.close

    return (
        <div
            className="TreeViewItem"
            style={{
                top: offset + label.heightUnit,
                height: childrenHeight + label.height + label.heightUnit
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
                    height: childrenHeight + label.heightUnit
                }}
            >
                {children}
            </div>
        </div>
    )
}

type TreeViewItemValue = { elements: JSX.Element[]; height: number }

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

export type TreeViewItemSource = {
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
    localLoading: boolean
}

export function PldTreeView({ id, items, extendedIds, selectedIds, style, localLoading }: Props) {
    const treeViewItems = React.useMemo((): TreeViewItemValue => {
        return makeTreeViewItem(items, 0, extendedIds, selectedIds, false)
    }, [items, extendedIds, selectedIds])

    return (
        <div className="CommonComponent" id={id} style={style}>
            <div className={`TreeViewComponent PldTreeViewComponent ${localLoading ? 'Loading' : ''}`}>
                {treeViewItems.elements}
            </div>
        </div>
    )
}
