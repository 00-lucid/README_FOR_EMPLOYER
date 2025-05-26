import { TreeViewItemLabel, TreeViewItemSource } from '../../common/TreeView'
import './TreeViewItem.css'
import { DocumentList, DocumentKey, pushCommand } from '../..'

export const makeFolderLabel = (text: string, depth: number): TreeViewItemLabel => {
    const labelHeight = 40

    const normalOpen = (
        <div className="Label" style={{ height: labelHeight + 'px' }}>
            {arrowIcon(false, 'var(--Icon-Normal)', depth)}
            {folderOpenIcon('var(--Icon-Normal)', depth)}
            {getNormalText(text, depth)}
        </div>
    )

    const normalClose = (
        <div className="Label" style={{ height: labelHeight + 'px' }}>
            {arrowIcon(true, 'var(--Icon-Normal)', depth)}
            {folderCloseIcon('var(--Icon-Normal)', depth)}
            {getNormalText(text, depth)}
        </div>
    )

    const selectedOpen = (
        <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
            {arrowIcon(false, 'var(--Icon-Highlight)', depth)}
            {folderOpenIcon('var(--Icon-Highlight)', depth)}
            {getSelectedText(text, depth)}
        </div>
    )

    const selectedClose = (
        <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
            {arrowIcon(true, 'var(--Icon-Highlight)', depth)}
            {folderCloseIcon('var(--Icon-Highlight)', depth)}
            {getSelectedText(text, depth)}
        </div>
    )

    return {
        height: labelHeight,
        heightUnit: 'px',
        selected: { open: selectedOpen, close: selectedClose },
        normal: { open: normalOpen, close: normalClose }
    }
}

const makeDocumentLabel = (text: string, depth: number): TreeViewItemLabel => {
    const labelHeight = 40

    const normal = (
        <div className="Label" style={{ height: labelHeight + 'px' }}>
            <div className="Image1" />
            {documentIcon('var(--Icon-Normal)', depth)}
            {getNormalText(text, depth)}
        </div>
    )

    const selected = (
        <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
            <div className="Image1" />
            {documentIcon('var(--Icon-Highlight)', depth)}
            {getSelectedText(text, depth)}
        </div>
    )

    return {
        height: labelHeight,
        heightUnit: 'px',
        selected: { open: selected, close: selected },
        normal: { open: normal, close: normal }
    }
}

export function makeDocumentItems(items: TreeViewItemSource[], list: DocumentList, depth: number, displayType: string) {
    for (const document of list.documents) {
        const labelText = displayType === 'number' ? document.docNumber : document.docName

        const item = {
            label: makeDocumentLabel(labelText, depth + 1),
            key: makeDocumentKey(document),
            items: [],
            onClick: () => {
                pushCommand({
                    name: 'requestOpenDocument',
                    value: {
                        selectedDocument: {
                            docKey: { docId: document.docId, docVer: document.docVer },
                            plantCode: document.plantCode
                        },
                        ok: () => {
                            pushCommand({ name: 'zoomExtents' })
                        }
                    }
                })
            }
        }

        items.push(item)
    }
}

export function makeDocumentKey(key: DocumentKey): string {
    return key.docId + '_' + key.docVer
}

function getNormalText(text: string, depth: number) {
    return (
        <div
            className="Text"
            style={{
                color: 'var(--Stroke-Normal)',
                left: `calc(55px + var(--TreeView-Indent-Width) * ${depth})`,
                width: `calc(100% - var(--TreeView-Indent-Width) * ${depth})`
            }}
        >{`${text}`}</div>
    )
}

function getSelectedText(text: string, depth: number) {
    return (
        <div
            className="Text"
            style={{
                color: 'var(--Stroke-Highlight)',
                left: `calc(55px + var(--TreeView-Indent-Width) * ${depth})`,
                width: `calc(100% - var(--TreeView-Indent-Width) * ${depth})`
            }}
        >{`${text}`}</div>
    )
}

function arrowIcon(
    isRightDirection: boolean,
    color: string,

    depth: number
): React.SVGProps<SVGSVGElement> {
    return (
        <svg
            className="Image1"
            fill={color}
            style={{
                transform: isRightDirection ? 'rotate(-90deg)' : 'rotate(0deg)',
                left: `calc(0px + var(--TreeView-Indent-Width) * ${depth})`
            }}
        >
            <path d="M12 15.001c-.495 0-.957-.192-1.301-.541l-3.555-3.609a.5.5 0 1 1 .712-.702l3.556 3.61c.307.31.869.31 1.176 0l3.556-3.61a.5.5 0 1 1 .712.702l-3.555 3.609a1.812 1.812 0 0 1-1.301.541" />
        </svg>
    )
}

function documentIcon(color: string, depth: number): React.SVGProps<SVGSVGElement> {
    return (
        <svg className="Image2" fill={color} style={{ left: `calc(24px + var(--TreeView-Indent-Width) * ${depth})` }}>
            <path d="M15.78 2C18.108 2 20 3.924 20 6.287v13.675C20 21.086 19.1 22 17.994 22H7.006C5.9 22 5 21.086 5 19.962V4.039C5 2.914 5.9 2 7.006 2zm-.984.952h-7.79c-.589 0-1.068.488-1.068 1.087v15.923c0 .598.479 1.086 1.068 1.086h10.988a1.08 1.08 0 0 0 1.069-1.086V7.279h-3.137c-.622 0-1.13-.507-1.13-1.13V2.952zm-3.484 6.532c1.34 0 2.444 1.001 2.647 2.305h1.845c.259 0 .469.213.469.476v4.709c0 .263-.21.476-.469.476h-4.759a.472.472 0 0 1-.468-.476v-1.872a2.717 2.717 0 0 1-2.272-2.69v-.196c0-1.507 1.207-2.732 2.69-2.732zm4.023 3.258H13.97c-.154 1.282-1.177 2.282-2.455 2.382v1.374h3.821v-3.756zm-4.023-2.306h-.317c-.966 0-1.752.799-1.752 1.78v.196c0 .981.786 1.78 1.752 1.78h.317c.965 0 1.752-.799 1.752-1.78v-.196c0-.981-.787-1.78-1.752-1.78zm4.469-7.484h-.047V6.15c0 .098.086.178.192.178h3.137v-.04c0-1.84-1.473-3.335-3.282-3.335z" />
        </svg>
    )
}

function folderOpenIcon(color: string, depth: number): React.SVGProps<SVGSVGElement> {
    return (
        <svg className="Image2" fill={color} style={{ left: `calc(24px + var(--TreeView-Indent-Width) * ${depth})` }}>
            <path d="M20.636 6C21.388 6 22 6.637 22 7.422v3.938a.435.435 0 0 1-.87 0V7.422c0-.305-.222-.552-.494-.552H7.437c-.273 0-.494.247-.494.552v.79c0 .144-.071.272-.18.351l2.065-.001c.168 0 .322.098.394.25l.574 1.23h8.069c.898 0 1.192.944 1.29 1.255l2.504 7.086a.463.463 0 0 1 .024.146c0 .763-.587 1.384-1.308 1.384h-1.812a.435.435 0 0 1 0-.87h1.812c.223 0 .408-.196.435-.45l-2.481-7.022c-.191-.613-.36-.656-.446-.66H9.52a.436.436 0 0 1-.395-.25L8.55 9.43H3.31c-.225 0-.41.199-.436.452l2.894 8.506c.26.608.278.651.426.654h6.483a.435.435 0 0 1 0 .87H6.229c-.757 0-.942-.435-1.248-1.155l-.038-.09-2.92-8.582A.426.426 0 0 1 2 9.946c0-.763.587-1.384 1.309-1.384l2.943.001a.434.434 0 0 1-.179-.352v-.79c0-.784.612-1.42 1.364-1.42h13.199zm-3.649 13.043a.435.435 0 0 1 0 .87H15.92a.435.435 0 0 1 0-.87h1.067zm-.244-4.584a.435.435 0 0 1 0 .87h-2.781a.434.434 0 1 1 0-.87h2.781zm4.822-1.762c.24 0 .435.194.435.435v1.181a.435.435 0 0 1-.87 0v-1.181c0-.241.195-.435.435-.435zm-5.604-.157a.435.435 0 0 1 0 .87h-4.173a.435.435 0 0 1 0-.87h4.173z" />
        </svg>
    )
}

function folderCloseIcon(color: string, depth: number): React.SVGProps<SVGSVGElement> {
    return (
        <svg className="Image2" fill={color} style={{ left: `calc(24px + var(--TreeView-Indent-Width) * ${depth})` }}>
            <path d="M9.979 5a.43.43 0 0 1 .384.236l1.026 2.045h8.287c.73 0 1.324.602 1.324 1.345v9.426c0 .742-.594 1.344-1.324 1.344H17.82a.429.429 0 0 1 0-.857h1.856a.478.478 0 0 0 .467-.487V8.626c0-.27-.21-.488-.467-.488h-8.552a.428.428 0 0 1-.383-.236L9.715 5.857h-5.39a.48.48 0 0 0-.468.488v11.707c0 .269.21.487.468.487h7.462a.429.429 0 0 1 0 .857H4.325A1.336 1.336 0 0 1 3 18.052V6.345C3 5.603 3.594 5 4.325 5H9.98zm6.226 13.54a.429.429 0 0 1 0 .856h-1.092a.428.428 0 1 1 0-.857h1.092zm1.52-6.997a.429.429 0 0 1 0 .857h-2.85a.428.428 0 1 1 0-.857h2.85zm0-1.852a.429.429 0 0 1 0 .857h-4.276a.428.428 0 1 1 0-.857h4.276z" />
        </svg>
    )
}
