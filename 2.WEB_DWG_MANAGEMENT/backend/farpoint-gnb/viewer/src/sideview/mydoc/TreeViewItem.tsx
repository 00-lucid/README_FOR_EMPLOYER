import { TreeViewItemLabel, TreeViewItemSource } from '../../common/TreeView'
import './TreeViewItem.css'
import { setBanner, MydocList, Mydoc, pushCommand } from '../..'
import Repository from '../../Repository'

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

const makeDocumentLabel = (
    text: string,
    depth: number,
    onRemoveClick: () => void,
    editable: boolean
): TreeViewItemLabel => {
    const labelHeight = 40

    const normal = (
        <div className="Label" style={{ height: labelHeight + 'px' }}>
            <div className="Image1" />
            {documentIcon('var(--Icon-Normal)', depth)}
            {getNormalText(text, depth)}
            <div
                hidden={!editable}
                className="CloseButton"
                onClick={(e) => {
                    onRemoveClick()
                    e.stopPropagation()
                }}
            >
                {closeIcon}
            </div>
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

const openDocument = (info: Mydoc) => {
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
        window.open(info.viewerUrl, 'FarpointExternalWindow')
    } else {
        pushCommand({
            name: 'requestOk',
            value: { message: `지원하지 않는 형식(${ext})입니다.`, ok: () => {} }
        })
    }
}

export function makeDocumentItems(
    items: TreeViewItemSource[],
    list: MydocList,
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

                    await Repository.deleteMydocFile(userId, mydoc.id)

                    await reload()
                },
                no: () => {}
            }

            pushCommand({ name: 'requestYesNo', value: confirmValue })
        }

        const item = {
            label: makeDocumentLabel(mydoc.filename, depth + 1, onRemoveClick, editable),
            key: mydoc.id,
            items: [],
            onClick: () => {
                openDocument(mydoc)
            }
        }

        items.push(item)
    }
}

function getNormalText(text: string, depth: number) {
    return (
        <div
            className="Text"
            style={{
                color: 'var(--Stroke-Normal)',
                left: `calc(55px + var(--TreeView-Indent-Width) * ${depth})`,
                width: `calc(75% - var(--TreeView-Indent-Width) * ${depth})`
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
            {/* <path d="M15.78 2C18.108 2 20 3.924 20 6.287v13.675C20 21.086 19.1 22 17.994 22H7.006C5.9 22 5 21.086 5 19.962V4.039C5 2.914 5.9 2 7.006 2zm-.984.952h-7.79c-.589 0-1.068.488-1.068 1.087v15.923c0 .598.479 1.086 1.068 1.086h10.988a1.08 1.08 0 0 0 1.069-1.086V7.279h-3.137c-.622 0-1.13-.507-1.13-1.13V2.952zm-3.484 6.532c1.34 0 2.444 1.001 2.647 2.305h1.845c.259 0 .469.213.469.476v4.709c0 .263-.21.476-.469.476h-4.759a.472.472 0 0 1-.468-.476v-1.872a2.717 2.717 0 0 1-2.272-2.69v-.196c0-1.507 1.207-2.732 2.69-2.732zm4.023 3.258H13.97c-.154 1.282-1.177 2.282-2.455 2.382v1.374h3.821v-3.756zm-4.023-2.306h-.317c-.966 0-1.752.799-1.752 1.78v.196c0 .981.786 1.78 1.752 1.78h.317c.965 0 1.752-.799 1.752-1.78v-.196c0-.981-.787-1.78-1.752-1.78zm4.469-7.484h-.047V6.15c0 .098.086.178.192.178h3.137v-.04c0-1.84-1.473-3.335-3.282-3.335z" /> */}
            <path d="M 17.808594 4.335938 C 17.804688 4.328125 17.804688 4.320312 17.804688 4.3125 C 17.804688 4.3125 17.804688 4.308594 17.800781 4.304688 C 17.800781 4.296875 17.796875 4.289062 17.796875 4.28125 C 17.796875 4.28125 17.796875 4.28125 17.796875 4.277344 C 17.792969 4.269531 17.789062 4.261719 17.785156 4.253906 C 17.785156 4.253906 17.785156 4.253906 17.785156 4.25 C 17.78125 4.242188 17.777344 4.238281 17.773438 4.230469 C 17.773438 4.226562 17.773438 4.226562 17.773438 4.226562 C 17.769531 4.21875 17.765625 4.210938 17.761719 4.207031 C 17.761719 4.203125 17.761719 4.203125 17.757812 4.199219 C 17.753906 4.195312 17.75 4.1875 17.746094 4.183594 C 17.746094 4.179688 17.742188 4.179688 17.742188 4.175781 C 17.734375 4.171875 17.730469 4.164062 17.722656 4.15625 L 13.652344 0.0859375 C 13.652344 0.0859375 13.648438 0.0859375 13.648438 0.0820312 C 13.644531 0.078125 13.636719 0.0703125 13.628906 0.0664062 C 13.628906 0.0664062 13.625 0.0625 13.625 0.0625 C 13.617188 0.0585938 13.613281 0.0546875 13.609375 0.0507812 C 13.605469 0.046875 13.601562 0.046875 13.601562 0.046875 C 13.59375 0.0429688 13.589844 0.0390625 13.582031 0.0351562 C 13.582031 0.0351562 13.578125 0.0351562 13.578125 0.03125 C 13.570312 0.0273438 13.5625 0.0273438 13.558594 0.0234375 C 13.554688 0.0234375 13.554688 0.0234375 13.554688 0.0195312 C 13.546875 0.0195312 13.539062 0.015625 13.53125 0.0117188 C 13.527344 0.0117188 13.527344 0.0117188 13.527344 0.0117188 C 13.519531 0.0078125 13.511719 0.0078125 13.503906 0.00390625 C 13.5 0.00390625 13.496094 0.00390625 13.496094 0.00390625 C 13.488281 0.00390625 13.480469 0.00390625 13.472656 0 C 13.464844 0 13.453125 0 13.445312 0 L 3.738281 0 C 2.886719 0 2.191406 0.695312 2.191406 1.546875 L 2.191406 18.453125 C 2.191406 19.304688 2.886719 20 3.738281 20 L 16.261719 20 C 17.113281 20 17.808594 19.304688 17.808594 18.453125 L 17.808594 4.363281 C 17.808594 4.355469 17.808594 4.34375 17.808594 4.335938 Z M 13.738281 1.003906 L 16.804688 4.070312 L 14.695312 4.070312 C 14.167969 4.070312 13.738281 3.640625 13.738281 3.113281 Z M 16.261719 19.414062 L 3.738281 19.414062 C 3.210938 19.414062 2.777344 18.984375 2.777344 18.453125 L 2.777344 1.546875 C 2.777344 1.015625 3.210938 0.585938 3.738281 0.585938 L 13.152344 0.585938 L 13.152344 3.113281 C 13.152344 3.964844 13.84375 4.65625 14.695312 4.65625 L 17.222656 4.65625 L 17.222656 18.453125 C 17.222656 18.984375 16.789062 19.414062 16.261719 19.414062 Z M 16.261719 19.414062 " />
            <path d="M 15.324219 9.707031 L 13.445312 9.707031 C 13.28125 9.707031 13.152344 9.835938 13.152344 10 C 13.152344 10.164062 13.28125 10.292969 13.445312 10.292969 L 15.324219 10.292969 C 15.484375 10.292969 15.617188 10.164062 15.617188 10 C 15.617188 9.835938 15.484375 9.707031 15.324219 9.707031 Z M 15.324219 9.707031 " />
            <path d="M 4.675781 10.292969 L 12.191406 10.292969 C 12.355469 10.292969 12.484375 10.164062 12.484375 10 C 12.484375 9.835938 12.355469 9.707031 12.191406 9.707031 L 4.675781 9.707031 C 4.515625 9.707031 4.382812 9.835938 4.382812 10 C 4.382812 10.164062 4.515625 10.292969 4.675781 10.292969 Z M 4.675781 10.292969 " />
            <path d="M 15.324219 5.949219 L 7.496094 5.949219 C 7.332031 5.949219 7.203125 6.082031 7.203125 6.242188 C 7.203125 6.40625 7.332031 6.535156 7.496094 6.535156 L 15.324219 6.535156 C 15.484375 6.535156 15.617188 6.40625 15.617188 6.242188 C 15.617188 6.082031 15.484375 5.949219 15.324219 5.949219 Z M 15.324219 5.949219 " />
            <path d="M 4.675781 6.535156 L 6.242188 6.535156 C 6.40625 6.535156 6.535156 6.40625 6.535156 6.242188 C 6.535156 6.082031 6.40625 5.949219 6.242188 5.949219 L 4.675781 5.949219 C 4.515625 5.949219 4.382812 6.082031 4.382812 6.242188 C 4.382812 6.40625 4.515625 6.535156 4.675781 6.535156 Z M 4.675781 6.535156 " />
            <path d="M 15.324219 13.464844 L 9.375 13.464844 C 9.210938 13.464844 9.082031 13.59375 9.082031 13.757812 C 9.082031 13.917969 9.210938 14.050781 9.375 14.050781 L 15.324219 14.050781 C 15.484375 14.050781 15.617188 13.917969 15.617188 13.757812 C 15.617188 13.59375 15.484375 13.464844 15.324219 13.464844 Z M 15.324219 13.464844 " />
            <path d="M 8.121094 13.464844 L 4.675781 13.464844 C 4.515625 13.464844 4.382812 13.59375 4.382812 13.757812 C 4.382812 13.917969 4.515625 14.050781 4.675781 14.050781 L 8.121094 14.050781 C 8.285156 14.050781 8.414062 13.917969 8.414062 13.757812 C 8.414062 13.59375 8.285156 13.464844 8.121094 13.464844 Z M 8.121094 13.464844 " />
            <path d="M 15.324219 7.828125 L 4.675781 7.828125 C 4.515625 7.828125 4.382812 7.960938 4.382812 8.121094 C 4.382812 8.285156 4.515625 8.414062 4.675781 8.414062 L 15.324219 8.414062 C 15.484375 8.414062 15.617188 8.285156 15.617188 8.121094 C 15.617188 7.960938 15.484375 7.828125 15.324219 7.828125 Z M 15.324219 7.828125 " />
            <path d="M 15.324219 11.585938 L 4.675781 11.585938 C 4.515625 11.585938 4.382812 11.714844 4.382812 11.878906 C 4.382812 12.039062 4.515625 12.171875 4.675781 12.171875 L 15.324219 12.171875 C 15.484375 12.171875 15.617188 12.039062 15.617188 11.878906 C 15.617188 11.714844 15.484375 11.585938 15.324219 11.585938 Z M 15.324219 11.585938 " />
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

const closeIcon = (
    <svg className="CloseIcon" width="24" height="24">
        <g fill="none" fillRule="evenodd">
            <path
                d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10"
                fill="var(--CloseIcon-Fill)"
            />
            <path stroke="var(--CloseIcon-Stroke)" strokeLinecap="round" d="m16 8-8 8M16 16 8 8" />
        </g>
    </svg>
)
