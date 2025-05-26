/**
 * ! 현재 setColor와 setHighlight를 같이 쓰면 highlight 했던 컬러의 잔상이 남는 버그 존재
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { getDocumentNotiorders } from '../../../Api/notiorder'
import useEquipment from '../../../Controller/useEquipment'
import dateFunc from '../../../Lib/dateFunc'
import { PainterContext } from '../../../Store/painterContext'
import { MainViewPopupStore, StatusStore } from '../../../Store/statusStore'
import TreeViewItemEl from '../../CommonView/TreeView/TreeViewItem'
import { CloseSideMenuBtn } from '../Component/CloseSideMenuBtn'
import { NotiorderTreeView } from '../Component/Notiorder/NotiorderTreeView'
import { NotiorderTypeSelect } from '../Component/Notiorder/NotiorderTypeSelect'
import { NotiorderView } from '../Component/Notiorder/NotiorderView'
import { TopLine } from '../Component/TopLine'
import './NotiorderMenu.css'

type TreeViewItemSource = {
    label: TreeViewItemLabel
    key: string
    items: TreeViewItemSource[]
    onClick: () => void
}

function selectedOnIcon(color: string): React.SVGProps<SVGSVGElement> {
    return (
        <svg className="SelectIcon">
            <g fill="none" fillRule="evenodd">
                <path d="M21.613 12.5s-4.253 6-9.5 6-9.5-6-9.5-6 4.253-6 9.5-6 9.5 6 9.5 6z" stroke={color} fill={color} />
                <path
                    d="M15.23 11.5a2 2 0 0 1-1.828-2.805A3.954 3.954 0 0 0 12.23 8.5a4 4 0 1 0 4 4c0-.411-.08-.799-.195-1.172a1.982 1.982 0 0 1-.805.172z"
                    stroke="var(--Background-Highlight)"
                    fill="var(--Background-Highlight)"
                />
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

function normalOnIcon(color: string): React.SVGProps<SVGSVGElement> {
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

const makeDocumentLabel = (text: string, depth: number): TreeViewItemLabel => {
    const labelHeight = 40

    const normal = (
        <div className="Label" style={{ height: labelHeight + 'px' }}>
            <div className="Image1" />
            {TreeViewItemEl.documentIcon('var(--Icon-Normal)', depth)}
            {TreeViewItemEl.getNormalText(text, depth, '55px')}
        </div>
    )

    const selected = (
        <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
            <div className="Image1" />
            {TreeViewItemEl.documentIcon('var(--Icon-Highlight)', depth)}
            {TreeViewItemEl.getSelectedText(text, depth, '55px')}
        </div>
    )

    return {
        height: labelHeight,
        heightUnit: 'px',
        selected: { open: selected, close: selected },
        normal: { open: normal, close: normal },
    }
}

export const makeFolderLabel = (text: string, depth: number, isShowAll: boolean, onClick: () => void, color: string): TreeViewItemLabel => {
    const labelHeight = 40

    const background = (
        <div
            className="ShowAllBackground Test"
            onClick={(e) => {
                onClick()
                e.stopPropagation()
            }}
        />
    )

    const normal = isShowAll ? normalOnIcon(color) : normalOffIcon('var(--Icon-Normal)')

    const selected = isShowAll ? selectedOnIcon('var(--Icon-Highlight)') : selectedOffIcon('var(--Icon-Highlight)')

    const normalOpen = (
        <div className="Label" style={{ height: labelHeight + 'px' }}>
            <>
                {TreeViewItemEl.arrowIcon(false, 'var(--Icon-Normal)', depth)}
                {TreeViewItemEl.getNormalText(text, depth, '24px')}
                {normal}
                {background}
            </>
        </div>
    )

    const normalClose = (
        <div className="Label" style={{ height: labelHeight + 'px' }}>
            <>
                {TreeViewItemEl.arrowIcon(true, 'var(--Icon-Normal)', depth)}
                {TreeViewItemEl.getNormalText(text, depth, '24px')}
                {normal}
                {background}
            </>
        </div>
    )

    const selectedOpen = (
        <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
            <>
                {TreeViewItemEl.arrowIcon(false, 'var(--Icon-Highlight)', depth)}
                {TreeViewItemEl.getSelectedText(text, depth, '24px')}
                {selected}
                {background}
            </>
        </div>
    )

    const selectedClose = (
        <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
            <>
                {TreeViewItemEl.arrowIcon(true, 'var(--Icon-Highlight)', depth)}
                {TreeViewItemEl.getSelectedText(text, depth, '24px')}
                {selected}
                {background}
            </>
        </div>
    )

    return {
        height: labelHeight,
        heightUnit: 'px',
        selected: { open: selectedOpen, close: selectedClose },
        normal: { open: normalOpen, close: normalClose },
    }
}

export function NotiorderMenu() {
    const equipmentObj = useEquipment('')

    const painterContext = React.useContext(PainterContext)
    if (!painterContext) throw new Error('Unhandled context')
    const { entityPainter } = painterContext

    // 모든/미결 통지오더
    const [notiorderType, setTypeValue] = useState('full')
    const [extendedIds, setExtendedIds] = useState(new Set<string>())
    const [notiorders, setNotiorders] = useState<EquipmentNotiOrder[]>([])
    const [currentNotiorder, setCurrentNotiorder] = useState<EquipmentNotiOrder>()
    const [currentNotiorderType, setCurrentNotiorderType] = useState<string | undefined>('')
    // const [orderEquipmentKeys, setOrderEquipmentKeys] = useState<EquipmentKey[]>([])
    // const [notiEquipmentKeys, setNotiEquipmentKeys] = useState<EquipmentKey[]>([])

    const [notifications, setNotificationsValue] = useRecoilState(StatusStore.notifications)
    const [orders, setOrdersValue] = useRecoilState(StatusStore.orders)
    const [selectEquipments, setSelectEquipmentsValue] = useRecoilState(StatusStore.selectEquipments)
    const [equipmentLinks, setEquipmentLinksValue] = useRecoilState(MainViewPopupStore.equipmentLinks)

    const canvasCtx = useRecoilValue(StatusStore.selectedCanvas)
    const [currentMenu, setCurrentMenu] = useRecoilState(StatusStore.currentMenu)

    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    const setLibIdValue = useSetRecoilState(StatusStore.libId)
    const setXValue = useSetRecoilState(MainViewPopupStore.x)
    const setYValue = useSetRecoilState(MainViewPopupStore.y)

    const start = new Date()
    start.setMonth(start.getMonth() - 6)
    const [startDate, setStartDate] = useState(start)
    const [endDate, setEndDate] = useState(new Date())

    useEffect(() => {
        setCurrentNotiorder(undefined)
        setCurrentNotiorderType(undefined)
        setNotiorders([])
    }, [canvasCtx?.documentCtx])

    useEffect(() => {
        const equipmentCtxs: EquipmentContext[] = []
        const result: string[] = []

        if (1 > orders.length) {
            entityPainter?.setOrderHandles(result)
        } else {
            setNotificationsValue([])

            if (canvasCtx) {
                for (const order of orders) {
                    const value = canvasCtx.equipmentByTagId.get(order.tagId)
                    if (value) equipmentCtxs.push(value)
                }
            }

            for (const equipmentCtx of equipmentCtxs) {
                for (const handleObj of equipmentCtx.handles) {
                    result.push(handleObj.handle)
                }
            }

            entityPainter?.setOrderHandles(result)
        }
    }, [orders, canvasCtx, entityPainter, setNotificationsValue])

    useEffect(() => {
        const equipmentCtxs: EquipmentContext[] = []
        const result: string[] = []

        if (1 > notifications.length) {
            entityPainter?.setNotificationHandles([])
        } else {
            setOrdersValue([])

            if (canvasCtx) {
                for (const notification of notifications) {
                    const value = canvasCtx.equipmentByTagId.get(notification.tagId)
                    if (value) equipmentCtxs.push(value)
                }
            }

            for (const equipmentCtx of equipmentCtxs) {
                for (const handleObj of equipmentCtx.handles) {
                    result.push(handleObj.handle)
                }
            }

            entityPainter?.setNotificationHandles(result)
        }
    }, [notifications, canvasCtx, entityPainter, setOrdersValue])

    /**
     * 통지/오더 조회
     */
    const onSearchClick = async () => {
        if (canvasCtx?.documentCtx) {
            setOkPopupValue({ message: '통지, 오더 검색은 도면 내 전체 설비 대상으로 진행합니다.', ok: () => {} })
            resetNotiorderMenuData()

            const start = dateFunc.dateToStringByFormatting(startDate, '')
            const end = dateFunc.dateToStringByFormatting(endDate, '')

            const results = await getDocumentNotiorders(canvasCtx?.documentCtx, notiorderType, start, end)

            setNotiorders(results)
            const newExtendedIds = new Set<string>()
            newExtendedIds.add('notiFolderKey')
            newExtendedIds.add('orderFolderKey')

            setExtendedIds(newExtendedIds)

            if (0 === results.length) setOkPopupValue({ message: '검색 결과가 없습니다.', ok: () => {} })
        }
    }

    /**
     * 통지/오더 종류 변경 시 실행
     */
    const setNotiorderType = useCallback(
        (value: string) => {
            // setCurrentNotiorder(undefined)
            // setCurrentNotiorderType(undefined)

            setLibIdValue(undefined)
            // setNotificationsValue([])
            // setOrdersValue([])

            setTypeValue(value)
        },
        [setLibIdValue]
    )

    /**
     * 조회로 인한, 통지/오더 메뉴 데이터 초기화
     */
    const resetNotiorderMenuData = useCallback(() => {
        setNotificationsValue([])
        setOrdersValue([])

        if (currentNotiorder && canvasCtx) {
            const result: string[] = []
            const equipmentCtx = canvasCtx.equipmentByTagId.get(currentNotiorder?.tagId)
            if (equipmentCtx) {
                for (const handleObj of equipmentCtx?.handles) {
                    result.push(handleObj.handle)
                }
                entityPainter.undoHighlight(result)
                equipmentObj.notiorderResetEquipment()
            }
        }

        setCurrentNotiorder(undefined)
        setCurrentNotiorderType(undefined)
        setLibIdValue(undefined)
    }, [currentNotiorder, canvasCtx, entityPainter, equipmentObj, setLibIdValue, setNotificationsValue, setOrdersValue])

    const makeOrderFolder = useCallback(
        (notiorders: EquipmentNotiOrder[]): TreeViewItemSource => {
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
                            const newSelectEquipment = new Set<string>().add(equipmentKey.tagId)
                            setSelectEquipmentsValue(newSelectEquipment)
                            setEquipmentLinksValue([])
                            setXValue(-1)
                            setYValue(-1)

                            setCurrentNotiorder(list)
                            setCurrentNotiorderType('order')
                            equipmentObj.notiorderMenuItemClick(list.tagId)

                            setCurrentMenu('notiorder-list')
                        },
                    }

                    items.push(item)
                    equipments.push(equipmentKey)
                    // setOrderEquipmentKeys(equipments)
                }
            }

            const key = 'orderFolderKey'

            const isShowAll = 0 < orders.length
            const item = {
                label: makeFolderLabel(
                    '오더',
                    0,
                    isShowAll,
                    () => {
                        if (isShowAll) {
                            // 꺼짐
                            setLibIdValue(undefined)
                            setOrdersValue([])
                        } else {
                            // 켜짐
                            setLibIdValue(undefined)
                            setOrdersValue(equipments)
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
                },
            }

            return item
        },
        [
            extendedIds,
            orders.length,
            equipmentObj,
            setEquipmentLinksValue,
            setLibIdValue,
            setOrdersValue,
            setSelectEquipmentsValue,
            setXValue,
            setYValue,
        ]
    )

    const makeNotiFolder = useCallback(
        (notiorders: EquipmentNotiOrder[]): TreeViewItemSource => {
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
                            const newSelectEquipment = new Set<string>().add(equipmentKey.tagId)
                            setSelectEquipmentsValue(newSelectEquipment)
                            setEquipmentLinksValue([])
                            setXValue(-1)
                            setYValue(-1)

                            setCurrentNotiorder(list)
                            setCurrentNotiorderType('noti')
                            equipmentObj.notiorderMenuItemClick(list.tagId)

                            setCurrentMenu('notiorder-list')
                        },
                    }

                    items.push(item)
                    equipments.push(equipmentKey)
                    // setNotiEquipmentKeys(equipments)
                }
            }

            const key = 'notiFolderKey'

            const isShowAll = 0 < notifications.length

            const item = {
                label: makeFolderLabel(
                    '통지',
                    0,
                    isShowAll,
                    () => {
                        if (isShowAll) {
                            setLibIdValue(undefined)
                            setNotificationsValue([])
                        } else {
                            setLibIdValue(undefined)
                            setNotificationsValue(equipments)
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
                },
            }

            return item
        },
        [
            extendedIds,
            notifications.length,
            equipmentObj,
            setEquipmentLinksValue,
            setLibIdValue,
            setNotificationsValue,
            setSelectEquipmentsValue,
            setXValue,
            setYValue,
        ]
    )

    const treeItems = useMemo((): TreeViewItemSource[] => {
        return [makeOrderFolder(notiorders), makeNotiFolder(notiorders)]
    }, [makeNotiFolder, makeOrderFolder, notiorders])

    const selectedIds = useMemo((): Set<string> => {
        const values = new Set<string>()

        if (canvasCtx?.documentCtx) {
            if (currentNotiorderType && currentNotiorder) {
                values.add(currentNotiorderType + currentNotiorder?.tagId)
            }
        }

        return values
    }, [currentNotiorderType, canvasCtx?.documentCtx, currentNotiorder])
    // status.equipments: EquipmentKey[]

    const onCloseView = () => {
        setCurrentNotiorder(undefined)
        setCurrentNotiorderType(undefined)
    }

    return (
        <div className="NotiorderMenu SideViewShadow" style={style(currentMenu)}>
            <NotiorderView
                hidden={'notiorder-list' !== currentMenu}
                onCloseView={onCloseView}
                notiorder={currentNotiorder}
                notiorderType={currentNotiorderType}
            />
            <div className="Background SideViewBackground" />
            <div className="VerticalLine" />
            <span className="SideMenuLabel">통지/오더</span>
            <CloseSideMenuBtn />
            <NotiorderTypeSelect notiorderType={notiorderType} setTypeValue={setNotiorderType} />
            <div className="SelectDate" hidden={notiorderType !== 'full'}>
                <div className="DateLabel">시작일</div>
                <input
                    className="DatePick"
                    type="date"
                    value={dateFunc.dateToStringByFormatting(startDate)}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                />
                <div />
                <div className="DateLabel">종료일</div>
                <input
                    className="DatePick"
                    type="date"
                    value={dateFunc.dateToStringByFormatting(endDate)}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                />
            </div>
            <div className={'SearchButton ' + (!canvasCtx?.documentCtx ? 'DisabledSearchButton' : '')} onClick={onSearchClick}>
                <div>조회</div>
            </div>
            <TopLine />
            <div className="TreeBack" style={{ marginTop: notiorderType === 'full' ? '285px' : '220px' }}>
                {canvasCtx && (
                    <NotiorderTreeView id="notiorderMenuTreeView" items={treeItems} extendedIds={extendedIds} selectedIds={selectedIds} />
                )}
            </div>
        </div>
    )
}

function style(currentMenu: string) {
    return 'notiorder' === currentMenu || 'notiorder-list' === currentMenu
        ? { transform: 'translateX(var(--SideMenuWidth))' }
        : { transform: 'translateX(calc(var(--NotiorderMenuWidth) * -1 ))' }
}
