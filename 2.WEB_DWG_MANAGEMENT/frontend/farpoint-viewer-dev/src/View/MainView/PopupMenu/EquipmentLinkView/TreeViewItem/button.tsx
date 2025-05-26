export const Button = ({ text, depth, type, infoClick }: any) => {
    return (
        <div className="TreeViewItem">
            <div className="Label2">
                <div
                    className="Text VerticalCenter Btn"
                    style={{
                        left: `calc(0px + var(--TreeView-Indent-Width) * ${depth} + 24px - 10px)`,
                    }}
                    onClick={(e) => {
                        infoClick(type)
                        e.stopPropagation()
                    }}
                >{`${text}`}</div>
            </div>
        </div>
    )
}
