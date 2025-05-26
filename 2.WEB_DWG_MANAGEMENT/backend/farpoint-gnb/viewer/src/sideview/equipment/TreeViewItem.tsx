import { TreeViewItemLabel, TreeViewItemSource } from '../../common/TreeView'
import './TreeViewItem.css'
import { EquipmentList, pushCommand } from '../..'

export const makeFolderLabel = (
    text: string,
    depth: number,
    isShowAll: boolean,
    onClick: () => void
): TreeViewItemLabel => {
    const labelHeight = 40

    const background = (
        <div
            className="ShowAllBackground"
            onClick={(e) => {
                onClick()
                e.stopPropagation()
            }}
        />
    )

    const normal = isShowAll ? normalOnIcon('var(--Background-Highlight)') : normalOffIcon('var(--Icon-Normal)')
    const selected = isShowAll ? selectedOnIcon('var(--Icon-Highlight)') : selectedOffIcon('var(--Icon-Highlight)')

    const normalOpen = (
        <div className="Label" style={{ height: labelHeight + 'px' }}>
            {arrowIcon(false, 'var(--Icon-Normal)', depth)}
            {getNormalText(text, depth)}
            {normal}
            {background}
        </div>
    )

    const normalClose = (
        <div className="Label" style={{ height: labelHeight + 'px' }}>
            {arrowIcon(true, 'var(--Icon-Normal)', depth)}
            {getNormalText(text, depth)}
            {normal}
            {background}
        </div>
    )

    const selectedOpen = (
        <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
            {arrowIcon(false, 'var(--Icon-Highlight)', depth)}
            {getSelectedText(text, depth)}
            {selected}
            {background}
        </div>
    )

    const selectedClose = (
        <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
            {arrowIcon(true, 'var(--Icon-Highlight)', depth)}
            {getSelectedText(text, depth)}
            {selected}
            {background}
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

export function makeEquipmentItems(items: TreeViewItemSource[], list: EquipmentList, depth: number) {
    for (const equipment of list.equipments) {
        const item = {
            label: makeDocumentLabel(equipment.function, depth + 1),
            key: equipment.tagId,
            items: [],
            onClick: () => {
                pushCommand({ name: 'selectEquipment', value: { equipments: [equipment], equipmentLinks: [] } })
                pushCommand({ name: 'zoomEntity', value: { equipments: [equipment] } })
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
                left: `calc(29px + var(--TreeView-Indent-Width) * ${depth})`,
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
                left: `calc(29px + var(--TreeView-Indent-Width) * ${depth})`,
                width: `calc(100% - var(--TreeView-Indent-Width) * ${depth})`
            }}
        >{`${text}`}</div>
    )
}

function arrowIcon(isRightDirection: boolean, color: string, depth: number): React.SVGProps<SVGSVGElement> {
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
        <svg className="Image1" fill={color} style={{ left: `calc(0px + var(--TreeView-Indent-Width) * ${depth})` }}>
            <path d="M17.22 3c1.157 0 2.099.92 2.099 2.053v.675a.45.45 0 0 1-.453.447.45.45 0 0 1-.452-.447v-.675c0-.64-.537-1.159-1.195-1.159H8c-.66 0-1.197.52-1.197 1.159v13.631c0 1.233-1.095 2.278-2.406 2.315a.295.295 0 0 1-.026 0h-.046l-.029-.002-.087-.002C2.976 20.913 2 19.908 2 18.685v-3.502c0-.535.444-.971.99-.971l2.907-.001V5.053C5.897 3.92 6.84 3 7.998 3h9.221zm1.646 15.093c.25 0 .452.2.452.447v.407c0 1.132-.941 2.053-2.099 2.053H11.2a.45.45 0 0 1-.453-.447.45.45 0 0 1 .452-.447h6.021c.659 0 1.195-.52 1.195-1.16v-.406a.45.45 0 0 1 .452-.447zm-9.171 2.013c.25 0 .452.2.452.447a.45.45 0 0 1-.452.447H8.102a.45.45 0 0 1-.453-.447.45.45 0 0 1 .453-.447h1.593zm-3.798-5.001H2.991c-.047 0-.086.036-.086.078v3.501c0 .777.644 1.41 1.441 1.422h-.022c.839 0 1.573-.665 1.573-1.422v-3.58zm9.87-8.94a.45.45 0 0 1 .441.349l.345 1.506c.054.02.105.042.158.065l1.321-.825a.455.455 0 0 1 .561.061l1.236 1.223c.15.147.176.378.063.554l-.834 1.306.066.156 1.523.34a.448.448 0 0 1 .353.436v1.728c0 .209-.146.391-.353.436l-1.523.341-.066.156.694 1.085a.761.761 0 0 1-.108.959l-.865.856a.79.79 0 0 1-.967.107l-1.101-.687a4.827 4.827 0 0 1-.158.065l-.345 1.506a.45.45 0 0 1-.44.348h-1.75a.45.45 0 0 1-.44-.348l-.344-1.506a4.165 4.165 0 0 1-.159-.065l-1.322.825a.457.457 0 0 1-.56-.063l-1.236-1.221a.443.443 0 0 1-.063-.555l.833-1.306-.065-.156L9.14 13.5a.447.447 0 0 1-.353-.436v-1.728c0-.208.146-.39.353-.435l1.523-.341.065-.156-.833-1.306a.443.443 0 0 1 .063-.554l1.235-1.223a.455.455 0 0 1 .561-.061l1.322.825c.053-.023.104-.044.158-.065l.345-1.506a.45.45 0 0 1 .44-.349h1.75zm-.361.894H14.38l-.32 1.397a.447.447 0 0 1-.3.325 3.66 3.66 0 0 0-.512.211.46.46 0 0 1-.447-.02l-1.225-.766-.726.718.775 1.211a.444.444 0 0 1 .02.441 3.41 3.41 0 0 0-.212.505.45.45 0 0 1-.33.297l-1.413.316v1.014l1.413.315a.45.45 0 0 1 .33.296c.057.175.128.344.213.507a.446.446 0 0 1-.021.441l-.775 1.21.726.718 1.225-.765a.462.462 0 0 1 .447-.021c.163.082.334.153.51.21.152.048.267.173.302.326l.32 1.397h1.025l.32-1.397a.447.447 0 0 1 .302-.327c.176-.056.346-.127.509-.21a.458.458 0 0 1 .447.022l1.225.765.726-.717-.775-1.21a.448.448 0 0 1-.02-.442c.083-.163.155-.332.213-.507a.45.45 0 0 1 .33-.296l1.412-.315v-1.014l-1.413-.316a.45.45 0 0 1-.33-.297 3.41 3.41 0 0 0-.212-.505.444.444 0 0 1 .02-.44l.775-1.212-.726-.718-1.225.766a.46.46 0 0 1-.447.02 3.459 3.459 0 0 0-.511-.21.446.446 0 0 1-.3-.326l-.32-1.397zm.49 3.096c.932.436 1.456 1.401 1.302 2.402a.453.453 0 0 1-.894-.136 1.379 1.379 0 0 0-.795-1.459 1.464 1.464 0 0 0-1.402.083c-.427.266-.672.73-.672 1.27 0 .247.088.5.245.693.262.322.6.524.976.583.247.04.414.268.376.512a.452.452 0 0 1-.519.371 2.455 2.455 0 0 1-1.538-.907 1.987 1.987 0 0 1-.445-1.252c0-.854.399-1.592 1.094-2.026a2.363 2.363 0 0 1 2.272-.134zm.727 2.905c.19.16.213.442.05.63a2.283 2.283 0 0 1-.414.376.45.45 0 0 1-.63-.103c-.146-.2-.1-.48.103-.623.093-.066.179-.144.254-.231a.457.457 0 0 1 .637-.05z" />
        </svg>
    )
}

export function normalOffIcon(color: string): React.SVGProps<SVGSVGElement> {
    return (
        <svg className="ShowAllIcon">
            <g stroke={color} fill="none" fillRule="evenodd">
                <path d="M15.23 10.854a2 2 0 0 1-1.828-2.805 3.954 3.954 0 0 0-1.172-.195 4 4 0 1 0 4 4c0-.412-.08-.8-.195-1.172a1.982 1.982 0 0 1-.805.171zM3.613 20.354l16-16z" />
                <path d="M15.113 6.478c-.943-.384-1.95-.624-3-.624-5.247 0-9.5 6-9.5 6s1.99 2.802 4.923 4.577M9.113 17.23c.943.383 1.952.623 3 .623 5.247 0 9.5-6 9.5-6s-1.99-2.802-4.923-4.577" />
            </g>
        </svg>
    )
}

export function normalOnIcon(color: string): React.SVGProps<SVGSVGElement> {
    return (
        <svg className="ShowAllIcon">
            <g stroke={color} fill="none" fillRule="evenodd">
                <path
                    d="M15.23 11.5a2 2 0 0 1-1.828-2.805A3.954 3.954 0 0 0 12.23 8.5a4 4 0 1 0 4 4c0-.411-.08-.799-.195-1.172a1.982 1.982 0 0 1-.805.172z"
                    fill={color}
                />
                <path d="M21.613 12.5s-4.253 6-9.5 6-9.5-6-9.5-6 4.253-6 9.5-6 9.5 6 9.5 6z" />
            </g>
        </svg>
    )
}

function selectedOffIcon(color: string): React.SVGProps<SVGSVGElement> {
    return (
        <svg className="SelectIcon">
            <g stroke={color} fill="none" fillRule="evenodd">
                <path d="M15.23 10.854a2 2 0 0 1-1.828-2.805 3.954 3.954 0 0 0-1.172-.195 4 4 0 1 0 4 4c0-.412-.08-.8-.195-1.172a1.982 1.982 0 0 1-.805.171zM3.613 20.354l16-16z" />
                <path d="M15.113 6.478c-.943-.384-1.95-.624-3-.624-5.247 0-9.5 6-9.5 6s1.99 2.802 4.923 4.577M9.113 17.23c.943.383 1.952.623 3 .623 5.247 0 9.5-6 9.5-6s-1.99-2.802-4.923-4.577" />
            </g>
        </svg>
    )
}

function selectedOnIcon(color: string): React.SVGProps<SVGSVGElement> {
    return (
        <svg className="SelectIcon">
            <g fill="none" fillRule="evenodd">
                <path
                    d="M21.613 12.5s-4.253 6-9.5 6-9.5-6-9.5-6 4.253-6 9.5-6 9.5 6 9.5 6z"
                    stroke={color}
                    fill={color}
                />
                <path
                    d="M15.23 11.5a2 2 0 0 1-1.828-2.805A3.954 3.954 0 0 0 12.23 8.5a4 4 0 1 0 4 4c0-.411-.08-.799-.195-1.172a1.982 1.982 0 0 1-.805.172z"
                    stroke="var(--Background-Highlight)"
                    fill="var(--Background-Highlight)"
                />
            </g>
        </svg>
    )
}
