import React from 'react'
import './NotiorderMenu.css'
import { CloseSideMenu } from '../CloseSideMenu'
import { NotiorderTypeSelect } from './NotiorderTypeSelect'
import { TreeView, TreeViewItemSource, pushCommand } from '../..'
import Repository from '../../Repository'
import { makeFolderLabel, makeDocumentLabel } from './TreeViewItem'
import { StatusContext, EquipmentNotiorder, EquipmentKey } from '../../'
import { NotiorderView } from './NotiorderView'

function TopLine() {
    return <div className="topline"></div>
}

function style(currentMenu: string) {
    return 'notiorder' === currentMenu
        ? { transform: 'translateX(var(--SideMenuWidth))' }
        : { transform: 'translateX(calc(var(--NotiorderMenuWidth) * -1 ))' }
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

export function NotiorderMenu() {
    const status = React.useContext(StatusContext)

    const [notiorderType, setTypeValue] = React.useState('full')
    const [extendedIds, setExtendedIds] = React.useState(new Set<string>())
    const [notiorders, setNotiorders] = React.useState<EquipmentNotiorder[]>([])
    const [currentNotiorder, setCurrentNotiorder] = React.useState<EquipmentNotiorder>()
    const [currentNotiorderType, setCurrentNotiorderType] = React.useState<string>()

    const start = new Date()
    start.setMonth(start.getMonth() - 6)
    const [startDate, setStartDate] = React.useState(start)
    const [endDate, setEndDate] = React.useState(new Date())

    React.useEffect(() => {
        setCurrentNotiorder(undefined)
        setCurrentNotiorderType(undefined)
        setNotiorders([])
    }, [status.documentContext])

    const onSearchClick = async () => {
        if (status.documentContext) {
            const start = toStringByFormatting(startDate, '')
            const end = toStringByFormatting(endDate, '')
            const results = await Repository.getDocumentNotiorders(status.documentContext, notiorderType, start, end)
            setNotiorders(results)

            const newExtendedIds = new Set<string>()
            newExtendedIds.add('notiFolderKey')
            newExtendedIds.add('orderFolderKey')

            setExtendedIds(newExtendedIds)

            if (0 === results.length)
                pushCommand({ name: 'requestOk', value: { message: '검색 결과가 없습니다.', ok: () => {} } })
        }
    }

    const setNotiorderType = React.useCallback((value: string) => {
        setCurrentNotiorder(undefined)
        setCurrentNotiorderType(undefined)
        pushCommand({ name: 'selectNotificationGroup', value: { notifications: [] } })
        pushCommand({ name: 'selectOrderGroup', value: { orders: [] } })

        setTypeValue(value)
    }, [])

    const makeOrderFolder = React.useCallback(
        (notiorders: EquipmentNotiorder[]): TreeViewItemSource => {
            const items: TreeViewItemSource[] = []
            const equipments: EquipmentKey[] = []
            for (const list of notiorders) {
                if (0 < list.orders.length) {
                    const equipmentKey = { tagId: list.tagId }

                    const item = {
                        label: makeDocumentLabel(list.function, 1),
                        key: 'order' + list.tagId,
                        items: [],
                        onClick: () => {
                            pushCommand({
                                name: 'selectEquipment',
                                value: {
                                    equipments: [equipmentKey],
                                    equipmentLinks: []
                                }
                            })
                            pushCommand({ name: 'zoomEntity', value: { equipments: [equipmentKey] } })

                            setCurrentNotiorder(list)
                            setCurrentNotiorderType('order')
                        }
                    }

                    items.push(item)
                    equipments.push(equipmentKey)
                }
            }

            const key = 'orderFolderKey'

            const isShowAll = 0 < status.orders.length
            const item = {
                label: makeFolderLabel(
                    '오더',
                    0,
                    isShowAll,
                    () => {
                        if (isShowAll) {
                            pushCommand({ name: 'selectOrderGroup', value: { orders: [] } })
                        } else {
                            pushCommand({ name: 'selectOrderGroup', value: { orders: equipments } })
                        }
                    },
                    'var(--order-showall-icon)'
                ),
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
                }
            }

            return item
        },
        [extendedIds, status.orders.length]
    )

    const makeNotiFolder = React.useCallback(
        (notiorders: EquipmentNotiorder[]): TreeViewItemSource => {
            const items: TreeViewItemSource[] = []
            const equipments: EquipmentKey[] = []
            for (const list of notiorders) {
                if (0 < list.notifications.length) {
                    const equipmentKey = { tagId: list.tagId }

                    const item = {
                        label: makeDocumentLabel(list.function, 1),
                        key: 'noti' + list.tagId,
                        items: [],
                        onClick: () => {
                            pushCommand({
                                name: 'selectEquipment',
                                value: {
                                    equipments: [equipmentKey],
                                    equipmentLinks: []
                                }
                            })
                            pushCommand({ name: 'zoomEntity', value: { equipments: [equipmentKey] } })

                            setCurrentNotiorder(list)
                            setCurrentNotiorderType('noti')
                        }
                    }

                    items.push(item)
                    equipments.push(equipmentKey)
                }
            }

            const key = 'notiFolderKey'

            const isShowAll = 0 < status.notifications.length

            const item = {
                label: makeFolderLabel(
                    '통지',
                    0,
                    isShowAll,
                    () => {
                        if (isShowAll) {
                            pushCommand({ name: 'selectNotificationGroup', value: { notifications: [] } })
                        } else {
                            pushCommand({ name: 'selectNotificationGroup', value: { notifications: equipments } })
                        }
                    },
                    'var(--noti-showall-icon)'
                ),
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
                }
            }

            return item
        },
        [extendedIds, status.notifications.length]
    )

    const treeItems = React.useMemo((): TreeViewItemSource[] => {
        return [makeOrderFolder(notiorders), makeNotiFolder(notiorders)]
    }, [makeNotiFolder, makeOrderFolder, notiorders])

    const selectedIds = React.useMemo((): Set<string> => {
        const values = new Set<string>()

        for (const equipment of status.equipments) {
            values.add(currentNotiorderType + equipment.tagId)
        }

        return values
    }, [currentNotiorderType, status.equipments])

    const onCloseView = () => {
        setCurrentNotiorder(undefined)
        setCurrentNotiorderType(undefined)
    }

    return (
        <div className="NotiorderMenu SideViewShadow" style={style(status.currentMenu)}>
            <NotiorderView
                hidden={'notiorder' !== status.currentMenu}
                onCloseView={onCloseView}
                notiorder={currentNotiorder}
                notiorderType={currentNotiorderType}
            />
            <div className="Background SideViewBackground" />
            <div className="VerticalLine" />
            <span className="SideMenuLabel">통지/오더</span>
            <CloseSideMenu onMenuChange={status.onMenuChange} />
            <NotiorderTypeSelect notiorderType={notiorderType} setTypeValue={setNotiorderType} />
            <div className="SelectDate" hidden={notiorderType !== 'full'}>
                <div className="DateLabel">시작일</div>
                <input
                    className="DatePick"
                    type="date"
                    value={toStringByFormatting(startDate)}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                />
                <div />
                <div className="DateLabel">종료일</div>
                <input
                    className="DatePick"
                    type="date"
                    value={toStringByFormatting(endDate)}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                />
            </div>
            <div
                className={'SearchButton ' + (!status.documentContext ? 'DisabledSearchButton' : '')}
                onClick={onSearchClick}
            >
                <div>조회</div>
            </div>
            <TopLine />
            <div className="TreeBack" style={{ marginTop: notiorderType === 'full' ? '285px' : '220px' }}>
                <TreeView
                    id="notiorderMenuTreeView"
                    items={treeItems}
                    extendedIds={extendedIds}
                    selectedIds={selectedIds}
                />
            </div>
        </div>
    )
}
