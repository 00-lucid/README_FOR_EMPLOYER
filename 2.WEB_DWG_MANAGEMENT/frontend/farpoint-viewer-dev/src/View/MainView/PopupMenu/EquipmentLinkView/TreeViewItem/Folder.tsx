import React from 'react'
import cn from 'classnames'

// Component
import TreeViewItemEl from '../../../../CommonView/TreeView/TreeViewItem'

export const Folder = ({ children, text, depth, isOpen, id, folderClick }: any) => {
    return (
        <div
            className="TreeViewItem"
            onClick={(e) => {
                e.stopPropagation()
                if (id !== 'key#8') folderClick(id)
            }}
        >
            <div
                className="Label"
                onClick={(e) => {
                    e.stopPropagation()
                    // if (id === 'key#8') folderClick(id)
                    folderClick(id)
                }}
            >
                {/* 화살표 아이콘 */}
                {TreeViewItemEl.arrowIcon(isOpen ? false : true, 'var(--icon-toolbar-foreground)', depth)}
                {/* 텍스트 */}
                <div
                    className="Text VerticalCenter"
                    style={{ left: `calc(0px + var(--TreeView-Indent-Width) * ${depth} + 24px)` }}
                >{`${text}`}</div>
            </div>

            <div className={cn('Children', isOpen ? 'SelectedFolder' : '')}>{children}</div>
        </div>
    )
}
