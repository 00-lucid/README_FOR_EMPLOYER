export const Info = ({ text, depth, type, infoClick }: any) => {
    return (
        <div
            className="TreeViewItem"
            onClick={(e) => {
                infoClick(type)
                e.stopPropagation()
            }}
        >
            <div className="Label">
                <div
                    className="Text VerticalCenter"
                    style={{ left: `calc(0px + var(--TreeView-Indent-Width) * ${depth} + 24px)` }}
                >{`${text}`}</div>
            </div>
        </div>
    )
}
