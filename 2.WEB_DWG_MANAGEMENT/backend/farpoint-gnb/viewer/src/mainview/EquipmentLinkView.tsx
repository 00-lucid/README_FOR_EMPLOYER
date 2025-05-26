import React from 'react'
import { DocumentContext, EquipmentContext } from '../types'
import { TreeView, TreeViewItemSource } from '../common'
import './EquipmentLinkView.css'
import { EquipmentLink } from '../types'
import Repository from '../Repository'
import { StatusContext, AppContext } from '..'
import { CanvasContext } from './useCanvasContext'

type Props = {
    equipmentLink: EquipmentLink | undefined
    document: DocumentContext | undefined
    canvasContext: CanvasContext | undefined
}

export function EquipmentLinkView({ equipmentLink, document, canvasContext }: Props) {
    const app = React.useContext(AppContext)
    const equipments = useSelectedEquipments(canvasContext)

    const tmStart = new Date()
    tmStart.setMonth(tmStart.getMonth() - 6)
    const orderStart = new Date()
    orderStart.setMonth(orderStart.getMonth() - 6)

    const [extendedIds, setExtendedIds] = React.useState(new Set<string>(['key#6', 'key#7', 'key#12', 'key#13']))
    const [tmStartDate, setTmStartDate] = React.useState(tmStart)
    const [tmEndDate, setTmEndDate] = React.useState(new Date())
    const [orderStartDate, setOrderStartDate] = React.useState(orderStart)
    const [orderEndDate, setOrderEndDate] = React.useState(new Date())

    const selectedIds = React.useMemo((): Set<string> => {
        const values = new Set<string>()

        return values
    }, [])

    const isFavorite = React.useMemo(() => {
        if (app.userContext) {
            for (const value of app.userContext.favorite.equipments) {
                if (document && 1 === equipments.length) {
                    if (
                        value.docId === document.docId &&
                        value.docVer === document.docVer &&
                        value.tagId === equipments[0].tagId
                    ) {
                        return true
                    }
                }
            }
        }

        return false
    }, [app.userContext, document, equipments])

    const toggleFavorite = () => {
        if (document && 1 === equipments.length) {
            const favorite = {
                docId: document.docId,
                docVer: document.docVer,
                plantCode: document.plantCode,
                docName: document.docName,
                docNumber: document.docNumber,
                tagId: equipments[0].tagId,
                function: equipments[0].function
            }

            isFavorite ? app.removeEquipmentFavorite(document, equipments[0]) : app.addEquipmentFavorite(favorite)
        }
    }

    const onFolderClick = React.useCallback(
        (key: string) => {
            const newValues = new Set<string>(extendedIds)

            if (newValues.has(key)) {
                newValues.delete(key)
            } else {
                newValues.add(key)
            }

            setExtendedIds(newValues)
        },
        [extendedIds]
    )

    const treeItems = React.useMemo((): TreeViewItemSource[] => {
        if (equipmentLink) {
            const linkId = equipmentLink.equipmentLinkId

            const value: TreeViewItemSource[] = []
            value.push(
                makeInfo(
                    equipmentLink.tagType === '001' ? '설비정보 조회' : '배관마스터 조회',
                    'key#1',
                    async () => {
                        if (linkId) {
                            const url = await Repository.getEquipmentInfoUrl(linkId)
                            openWindow(url)
                        }
                        // openWindow(
                        //     '?sap-client=100&sap-language=KO#ZEAM_F_EQUIPMENT_SEM-ListDisplay&/update/read/' + linkId
                        // )
                    },
                    0
                )
            )

            const tmChildren: TreeViewItemSource[] = []
            tmChildren.push(makeDate('시작일', 'key#2', tmStartDate, setTmStartDate, 2))
            tmChildren.push(makeDate('종료일', 'key#3', tmEndDate, setTmEndDate, 2))
            tmChildren.push(
                makeInfo(
                    '조회',
                    'key#4',
                    async () => {
                        if (linkId) {
                            const start = toStringByFormatting(tmStartDate, '')
                            const end = toStringByFormatting(tmEndDate, '')
                            const url = await Repository.getNotiRecordUrl(linkId, start, end)
                            openWindow(url)
                        }
                        // openWindow(
                        //     `#ZEAM_F_TMNotification_SEM-listdisplay&/list/${linkId}/${toStringByFormatting(
                        //         tmStartDate,
                        //         ''
                        //     )}/${toStringByFormatting(tmEndDate, '')}`
                        // )
                    },
                    2
                )
            )

            const childrenA: TreeViewItemSource[] = []
            childrenA.push(
                makeInfo(
                    'TM통지 발행',
                    'key#5',
                    async () => {
                        if (linkId) {
                            const url = await Repository.getNotiIssueUrl(linkId)
                            openWindow(url)
                        }
                    },
                    // () => openWindow('#ZEAM_F_TMNotification_SEM-listdisplay&/detail/new///' + linkId),
                    1
                )
            )
            childrenA.push(makeFolder('TM통지 이력조회', 'key#6', tmChildren, onFolderClick, 1))
            value.push(makeFolder('TM통지', 'key#7', childrenA, onFolderClick, 0))

            const orderChildren: TreeViewItemSource[] = []
            orderChildren.push(makeDate('시작일', 'key#8', orderStartDate, setOrderStartDate, 2))
            orderChildren.push(makeDate('종료일', 'key#9', orderEndDate, setOrderEndDate, 2))
            orderChildren.push(
                makeInfo(
                    '조회',
                    'key#10',
                    async () => {
                        if (linkId) {
                            const start = toStringByFormatting(orderStartDate, '')
                            const end = toStringByFormatting(orderEndDate, '')
                            const url = await Repository.getOrderRecordUrl(linkId, start, end)
                            openWindow(url)
                        }
                    },
                    // () =>
                    //     openWindow(
                    //         `#ZEAM_F_ORDCM01L_SEM-display&/${linkId}/${toStringByFormatting(
                    //             orderStartDate,
                    //             ''
                    //         )}/${toStringByFormatting(orderEndDate, '')}`
                    //     ),
                    2
                )
            )

            const childrenB: TreeViewItemSource[] = []
            childrenB.push(
                makeInfo(
                    '오더 발행',
                    'key#11',
                    async () => {
                        if (linkId) {
                            const url = await Repository.getOrderIssueUrl(linkId)
                            openWindow(url)
                        }
                    },
                    // () => openWindow('#ZEAM_F_ORDCM01_SEM-manage?orderType=CM01&equnr=' + linkId),
                    1
                )
            )
            childrenB.push(makeFolder('오더 이력조회', 'key#12', orderChildren, onFolderClick, 1))
            value.push(makeFolder('오더', 'key#13', childrenB, onFolderClick, 0))

            return value
        }

        return []
    }, [equipmentLink, onFolderClick, orderEndDate, orderStartDate, tmEndDate, tmStartDate])

    const title = equipmentLink ? `${equipmentLink.equipmentLinkId}(${equipmentLink.linkObject})` : ''

    return (
        <div hidden={!equipmentLink} className="EquipmentLinkView">
            <div>
                <div className="EquipmentLinkTitlebar">
                    <div className="Text">설비 정보 연계</div>
                </div>
                <div className="Subtitlebar">
                    <div className="Text">{title}</div>
                    <div className="FavoriteIcon" onClick={toggleFavorite}>
                        {favoriteImg(isFavorite)}
                    </div>
                </div>
                <TreeView
                    id="equipmentLinkTreeView"
                    items={treeItems}
                    extendedIds={extendedIds}
                    selectedIds={selectedIds}
                />
            </div>
        </div>
    )
}

const makeFolder = (
    text: string,
    key: string,
    children: TreeViewItemSource[],
    onClick: (key: string) => void,
    depth: number
): TreeViewItemSource => {
    const open = (
        <div className="Label">
            <svg
                className="FolderIcon"
                fill="var(--icon-toolbar-foreground)"
                style={{ transform: 'rotate(0deg)', left: `calc(0px + var(--TreeView-Indent-Width) * ${depth})` }}
            >
                <path d="M12 15.001c-.495 0-.957-.192-1.301-.541l-3.555-3.609a.5.5 0 1 1 .712-.702l3.556 3.61c.307.31.869.31 1.176 0l3.556-3.61a.5.5 0 1 1 .712.702l-3.555 3.609a1.812 1.812 0 0 1-1.301.541" />
            </svg>
            <div
                className="Text VerticalCenter"
                style={{ left: `calc(0px + var(--TreeView-Indent-Width) * ${depth} + 24px)` }}
            >{`${text}`}</div>
        </div>
    )

    const close = (
        <div className="Label">
            <svg
                className="FolderIcon"
                fill="var(--icon-toolbar-foreground)"
                style={{ transform: 'rotate(-90deg)', left: `calc(0px + var(--TreeView-Indent-Width) * ${depth})` }}
            >
                <path d="M12 15.001c-.495 0-.957-.192-1.301-.541l-3.555-3.609a.5.5 0 1 1 .712-.702l3.556 3.61c.307.31.869.31 1.176 0l3.556-3.61a.5.5 0 1 1 .712.702l-3.555 3.609a1.812 1.812 0 0 1-1.301.541" />
            </svg>
            <div
                className="Text VerticalCenter"
                style={{ left: `calc(0px + var(--TreeView-Indent-Width) * ${depth} + 24px)` }}
            >{`${text}`}</div>
        </div>
    )

    const label = {
        height: 30,
        heightUnit: 'px',
        selected: { open, close },
        normal: { open, close }
    }

    return { label, key, items: children, onClick: () => onClick(key) }
}

const makeInfo = (text: string, key: string, onClick = () => {}, depth: number): TreeViewItemSource => {
    const open = (
        <div className="Label">
            <div
                className="Text VerticalCenter"
                style={{ left: `calc(0px + var(--TreeView-Indent-Width) * ${depth} + 24px)` }}
            >{`${text}`}</div>
        </div>
    )

    const label = {
        height: 30,
        heightUnit: 'px',
        selected: { open, close: open },
        normal: { open, close: open }
    }

    return { label, key, items: [], onClick }
}

const makeDate = (
    text: string,
    key: string,
    value: Date,
    onChange: (date: Date) => void,
    depth: number
): TreeViewItemSource => {
    const open = (
        <div className="Label">
            <div
                className="Text VerticalCenter"
                style={{ left: `calc(0px + var(--TreeView-Indent-Width) * ${depth} + 24px)` }}
            >
                {text}
            </div>
            <div className="Date" style={{ left: `calc(0px + var(--TreeView-Indent-Width) * ${depth} + 70px)` }}>
                {/* <SelectDate id={key} date={value} onChange={(value) => onChange(value)} /> */}
                <input
                    className="DatePick"
                    type="date"
                    value={toStringByFormatting(value)}
                    onChange={(e) => onChange(new Date(e.target.value))}
                ></input>
            </div>
        </div>
    )

    const label = {
        height: 30,
        heightUnit: 'px',
        selected: { open, close: open },
        normal: { open, close: open }
    }

    return { label, key, items: [], onClick: () => {} }
}

const toStringByFormatting = (source: Date, delimiter = '-') => {
    const leftPad = (value: number) => {
        if (value >= 10) {
            return value
        }
        return `0${value}`
    }

    const year = source.getFullYear()
    const month = leftPad(source.getMonth() + 1)
    const day = leftPad(source.getDate())
    return [year, month, day].join(delimiter)
}

const openWindow = (url: string) => {
    console.log(url)
    window.open(url, 'FarpointExternalWindow')
}

function favoriteImg(isActive: boolean): JSX.Element {
    const fill = (
        <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
            <g fillRule="evenodd" fill="none" transform="matrix(0.77777785 0 0 0.77777785 0 0)">
                <path
                    d="M13.748 12.896L4.075 14.302L11.075 21.125L9.423 30.758999L18.073 26.210999L26.727001 30.758999L25.074001 21.125L32.074 14.302L22.401001 12.896L18.074001 4.13L13.748 12.896z"
                    fill="#4A70F7"
                    fillOpacity=".9"
                />
                <path
                    d="M4.074 14.301L13.747999 12.8949995L18.074999 4.1289997L22.401 12.8949995L32.074997 14.301L25.074997 21.124L26.726997 30.759L18.074997 26.210001L9.4229965 30.760002L11.074997 21.124002L4.074 14.301z"
                    stroke="#4A70F7"
                />
            </g>
        </svg>
    )

    const empty = (
        <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
            <path
                transform="matrix(0.77777785 0 0 0.77777785 0 0)"
                d="M7.487 18.571L7 18.096L6 17.122002L4 15.172002L13.674 13.766002L18 5L22.326 13.766L32 15.172L25 21.994999L26.652 31.63L18 27.081L9.348 31.63L11 21.995L10 21.021"
                stroke="var(--Menu-Toolbar-Item-Stroke)"
                opacity=".9"
                fill="none"
            />
        </svg>
    )

    return isActive ? fill : empty
}

function useSelectedEquipments(current: CanvasContext | undefined) {
    const status = React.useContext(StatusContext)

    const [selectedEquipments, setSelectedEquipments] = React.useState<EquipmentContext[]>([])

    React.useEffect(() => {
        const handles: EquipmentContext[] = []

        if (current) {
            if (0 < status.equipments.length) {
                for (const equipment of status.equipments) {
                    const value = current.equipmentByTagId.get(equipment.tagId)

                    if (value) {
                        handles.push(value)
                    }
                }
            }
        }

        setSelectedEquipments(handles)
    }, [current, status.equipments])

    return selectedEquipments
}
