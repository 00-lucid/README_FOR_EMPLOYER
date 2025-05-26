import React from 'react'
import './TreeView.css'
import './TreeViewItem.css'
import cn from 'classnames'
{
    /* 트리 목록 */
}
export const TreeView = ({ children, id, className }: TreeViewProps) => {
    return (
        <div className="CommonComponent" id={id}>
            <div className={cn('TreeViewComponent', className)}>{children}</div>
        </div>
    )
}
