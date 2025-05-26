import React from 'react'
import {
    setHandler,
    DocumentContext,
    SelectedDocument,
    EquipmentLink,
    EquipmentKey,
    updateQuery,
    getQuery,
    pushCommand,
    setBanner
} from '..'
import { showConfirmMarkupSave } from '../popupview'
import { isEqualDocument } from '..'
import { requestAddEntitiesList, requestAddSimbolList } from '../mainview/canvas/Pld/PldUtil'
import { Entities } from '../types'
import CryptoJS from 'crypto-js'

type StatusContextType = {
    document: SelectedDocument | undefined
    libId: string | undefined
    x: number
    y: number
    equipmentLinks: EquipmentLink[]
    equipments: EquipmentKey[]
    notifications: EquipmentKey[]
    orders: EquipmentKey[]
    documentContext: DocumentContext | undefined
    onDocumentChange: (value: DocumentContext | undefined) => void
    onMenuChange: (menuId: string) => void
    onTabChange: (tabId: string) => void
    currentTab: string
    wcdEquipments: EquipmentKey[]
    currentMenu: string
    pldHandle: string
    pldHandleList: string[]
    pldHandleListTypes: string[]
    pldSimbolList: any[]
    isSavePld: boolean
    setPldHandleList: (handle: string[]) => void
    setPldHandleListTypes: (type: string[]) => void
    isChanged: boolean
    setIsChanged: (is: boolean) => void
    pldHandleListEquipments: string[]
    setPldSimbolList: (simbolList: any[]) => void
    setPivotSimbolListHash: (hash: string) => void
    setPivotProcessListHash: (hash: any) => void
    setPldHandleListEquipments: (equipments: any[]) => void
    setPldHandleEntityType: (type: number) => void
    pldHandleEntityType: number
    setPldHandle: (handle: string) => void
}

const defaultValue = {
    document: undefined,
    libId: undefined,
    x: 0,
    y: 0,
    equipmentLinks: [],
    equipments: [],
    notifications: [],
    orders: [],
    documentContext: undefined,
    onDocumentChange: (value: DocumentContext | undefined) => {},
    onMenuChange: (menuId: string) => {},
    onTabChange: (menuId: string) => {},
    currentTab: 'viewer',
    wcdEquipments: [],
    currentMenu: '',
    pldHandle: '',
    pldHandleList: [],
    pldHandleListTypes: [],
    pldSimbolList: [],
    isSavePld: false,
    setPldHandleList: (handle: string[]) => {},
    setPldHandleListTypes: (type: string[]) => {},
    isChanged: false,
    setIsChanged: (is: boolean) => {},
    pldHandleListEquipments: [],
    setPldSimbolList: (simbolList: any[]) => {},
    setPivotProcessListHash: (hash: string) => {},
    setPivotSimbolListHash: (hash: string) => {},
    setPldHandleListEquipments: (equipments: any[]) => {},
    setPldHandleEntityType: (type: number) => {},
    pldHandleEntityType: 1,
    setPldHandle: (handle: string) => {}
} as StatusContextType

export const StatusContext = React.createContext(defaultValue)

export function useStatus(userId: string | undefined, isMarkupChanged: boolean) {
    const [document, setDocument] = React.useState<SelectedDocument>()
    const [documentContext, setDocumentContext] = React.useState<DocumentContext>()
    const [libId, setLibId] = React.useState<string>()
    const [x, setX] = React.useState(-1)
    const [y, setY] = React.useState(-1)
    const [equipmentLinks, setEquipmentLinks] = React.useState<EquipmentLink[]>([])
    const [equipments, setEquipments] = React.useState<EquipmentKey[]>([])
    const [notifications, setNotifications] = React.useState<EquipmentKey[]>([])
    const [orders, setOrders] = React.useState<EquipmentKey[]>([])

    const [currentTab, setCurrentTab] = React.useState('viewer')

    const [wcdEquipments, setWCDEquipments] = React.useState<EquipmentKey[]>([])
    const [pldHandle, setPldHandle] = React.useState<string>('')
    const [pldHandleEntityType, setPldHandleEntityType] = React.useState<number>(1)
    const [pldHandleList, setPldHandleList] = React.useState<string[]>([])
    const [pldHandleListTypes, setPldHandleListTypes] = React.useState<string[]>([])
    const [pldHandleListEquipments, setPldHandleListEquipments] = React.useState<any[]>([])
    const [pldSimbolList, setPldSimbolList] = React.useState<any[]>([])
    const [isSavePld, setIsSavePld] = React.useState<boolean>(false)
    const [isChanged, setIsChanged] = React.useState<boolean>(false)
    const [currentMenu, setCurrentMenu] = React.useState('')
    const [pivotSimbolListHash, setPivotSimbolListHash] = React.useState<string>('')
    const [pivotProcessListHash, setPivotProcessListHash] = React.useState<string>('')

    const resetPld = () => {
        setPldHandle('')
        setPldHandleList([])
        setPldHandleListTypes([])
        setIsSavePld(false)
        setIsChanged(false)
        setPldSimbolList([])
        setPivotSimbolListHash('')
    }

    const resetEditPldMode = () => {
        setPldHandle('')
    }

    React.useEffect(() => {
        if (pldSimbolList.length > 0) {
            const curSimbolHash = CryptoJS.SHA256(JSON.stringify(pldSimbolList)).toString()

            const isEqual = curSimbolHash === pivotSimbolListHash
            !isEqual ? setIsChanged(true) : setIsChanged(false)
        }
    }, [pldSimbolList, pivotSimbolListHash])

    React.useEffect(() => {
        const curProcessHash = CryptoJS.SHA256(
            JSON.stringify({ handle: pldHandleList, type: pldHandleListTypes })
        ).toString()

        const isEqual = curProcessHash === pivotProcessListHash

        !isEqual ? setIsChanged(true) : setIsChanged(false)
    }, [pldHandleList, pldHandleListTypes, pivotProcessListHash])

    React.useEffect(() => {
        const menu = getQuery('menu')

        const drawing = getQuery('drawing')
        const revision = getQuery('revision')
        const plant = getQuery('plant')

        if (drawing && revision && plant) {
            const value = { docKey: { docId: drawing, docVer: revision }, plantCode: plant }

            pushCommand({ name: 'openDocument', value })

            const equipmentQuery = getQuery('equipments')

            if (equipmentQuery) {
                const equipments = makeEntities(equipmentQuery)

                pushCommand({ name: 'selectEquipment', value: { equipments } })
                pushCommand({ name: 'zoomEntity', value: { equipments } })
            } else {
                pushCommand({ name: 'zoomExtents' })
            }
        }

        if (menu) setCurrentMenu(menu)
    }, [])

    React.useEffect(() => {
        updateQuery('menu', currentMenu)
        updateQuery('drawing', document?.docKey.docId)
        updateQuery('revision', document?.docKey.docVer)
        updateQuery('plant', document?.plantCode)
        updateQuery('equipmentType', libId)
        updateQuery('equipments', makeString(equipments))
        updateQuery('notiEquipments', makeString(notifications))
        updateQuery('orderEquipments', makeString(orders))
    }, [currentMenu, document, equipments, libId, notifications, orders])

    React.useEffect(() => {
        setHandler(
            'requestOpenDocument',
            async (value: { selectedDocument: SelectedDocument | undefined; ok?: () => void }) => {
                const isEqual = isEqualDocument(value.selectedDocument, document)

                if (isEqual) {
                    if (value.ok) {
                        value.ok()
                    }
                } else if (value.selectedDocument) {
                    const ok = () => {
                        pushCommand({ name: 'openDocument', value: value.selectedDocument })

                        if (value.ok) value.ok()
                    }

                    showConfirmMarkupSave(isMarkupChanged, ok)
                }
            }
        )
    }, [isMarkupChanged, document])

    const onMenuChange = React.useCallback(
        (menuId: string) => {
            if (userId && 0 < userId.length) {
                setCurrentMenu((prev: string) => {
                    return prev === menuId ? '' : menuId
                })
            }
        },
        [userId]
    )

    const onTabChange = React.useCallback(
        (tabId: string) => {
            // console.log('tabId:', tabId);
            if (userId && 0 < userId.length) setCurrentTab(tabId)
        },
        [userId]
    )

    const onDocumentChange = React.useCallback((value: DocumentContext | undefined) => {
        let document = undefined

        if (value) {
            document = {
                docKey: { docId: value.docId, docVer: value.docVer },
                plantCode: value.plantCode
            }
        }

        setDocument(document)
        setDocumentContext(value)
        setX(-1)
        setY(-1)
        setEquipmentLinks([])
        setEquipments([])
        setLibId(undefined)
        setNotifications([])
        setOrders([])
    }, [])

    const savePld = React.useCallback(
        async (currentPld: any, cSeq: number) => {
            setBanner('저장 중...')

            const entitiesList = []
            const simbolList = []

            for (let i = 0; i < pldHandleList.length; i++) {
                if (null !== currentPld && undefined !== documentContext) {
                    const { PLD_C_ID, PLD_C_VR } = currentPld
                    const { docId, docVer } = documentContext

                    const handle = pldHandleList[i]
                    const type = pldHandleListTypes[i]

                    const temp: Entities = {
                        PLD_C_ID,
                        PLD_C_VR,
                        PLD_C_SEQ: cSeq,
                        DOCNO: docId,
                        DOCVR: docVer,
                        HANDLE: handle,
                        HANDLE_TYPE: 'entity',
                        TYPE: type,
                        FUNCTION: handle
                    }

                    entitiesList.push(temp)
                }
            }

            for (let i = 0; i < pldSimbolList.length; i++) {
                if (null !== currentPld && undefined !== documentContext) {
                    const { PLD_C_ID, PLD_C_VR } = currentPld
                    const { docId, docVer } = documentContext

                    const svg = pldSimbolList[i]

                    const temp = {
                        PLD_C_ID,
                        PLD_C_VR,
                        DOCNO: docId,
                        DOCVR: docVer,
                        SEQ: svg.seq,
                        PLD_C_SEQ: cSeq,
                        TYPE: svg.type,
                        POINT1_X: svg.point1X,
                        POINT1_Y: svg.point1Y,
                        POINT1_Z: 0,
                        RADPT_X: svg.radptX / 10 > 0.1 ? svg.radptX / 10 : 0.1,
                        RADPT_Y: svg.radptY / 10 > 0.1 ? svg.radptY / 10 : 0.1,
                        RADPT_Z: 1,
                        ROTATION: 0
                    }

                    simbolList.push(temp)
                }
            }

            if (entitiesList.length !== 0) {
                setBanner('엔티티 저장 중...')
                await requestAddEntitiesList(entitiesList)
            }
            if (simbolList.length !== 0) {
                setBanner('심볼 저장 중...')
                await requestAddSimbolList(simbolList)
            }

            // 저장할 때 피벗 초기화
            setPivotProcessListHash(
                CryptoJS.SHA256(
                    JSON.stringify({ handle: JSON.stringify(pldHandleList), type: JSON.stringify(pldHandleListTypes) })
                ).toString()
            )
            setPivotSimbolListHash(CryptoJS.SHA256(JSON.stringify(pldSimbolList)).toString())

            setIsChanged(false)

            setBanner(undefined)
        },
        [documentContext, pldHandleList, pldHandleListTypes, pldSimbolList]
    )

    React.useEffect(() => {
        setHandler('selectEquipment', async (value: { equipments: EquipmentKey[] }) => {
            setEquipments(value.equipments)
            setEquipmentLinks([])
            setX(-1)
            setY(-1)
        })

        setHandler(
            'selectHandle',
            async (value: { x: number; y: number; equipmentLinks: EquipmentLink[]; equipments: EquipmentKey[] }) => {
                setEquipments(value.equipments)
                setEquipmentLinks(value.equipmentLinks)
                setX(value.x)
                setY(value.y)
            }
        )

        setHandler('selectWCDHandle', async (value: { x: number; y: number; equipments: EquipmentKey[] }) => {
            console.log('selectWCDHandle:', value.equipments)
            setWCDEquipments(value.equipments)
            setX(value.x)
            setY(value.y)
        })

        setHandler(
            'selectEquipmentLink',
            async (value: { equipmentLinks: EquipmentLink[]; equipments: EquipmentKey[] }) => {
                setEquipments(value.equipments)
                setEquipmentLinks(value.equipmentLinks)
                setX(-1)
                setY(-1)
            }
        )

        setHandler('selectEquipmentGroup', async (value: { libId: string | undefined }) => {
            setLibId(value.libId)
            setNotifications([])
            setOrders([])
        })

        setHandler('selectNotificationGroup', async (value: { notifications: EquipmentKey[] }) => {
            setLibId(undefined)
            setNotifications(value.notifications)
        })

        setHandler('selectOrderGroup', async (value: { orders: EquipmentKey[] }) => {
            setLibId(undefined)
            setOrders(value.orders)
        })

        setHandler('selectPldHandle', async (value: { handle: string; x: number; y: number }) => {
            setPldHandle(value.handle)
            setX(value.x)
            setY(value.y)
        })

        setHandler('savePld', async (value: { currentPld: any; cSeq: number }) => {
            await savePld(value.currentPld, value.cSeq)
        })

        setHandler('resetEditPldMode', async () => {
            resetEditPldMode()
        })

        setHandler('resetPld', async () => {
            resetPld()
        })
    }, [savePld])

    React.useEffect(() => {
        setHandler('selectLine', async (value: { type: string }) => {
            const target = pldHandleList.indexOf(pldHandle)

            if (target !== -1) {
                const temp = [
                    ...pldHandleListTypes.slice(0, target),
                    value.type,
                    ...pldHandleListTypes.slice(target + 1)
                ]

                setPldHandleListTypes(temp)
            } else {
                setPldHandleList([...pldHandleList, pldHandle])
                setPldHandleListTypes([...pldHandleListTypes, value.type])
                setPldHandle('')
            }
        })

        setHandler('selectSvg', async (value: { type: string }) => {
            const target = pldHandleList.indexOf(pldHandle)

            if (target !== -1) {
                const temp = [
                    ...pldHandleListTypes.slice(0, target),
                    value.type,
                    ...pldHandleListTypes.slice(target + 1)
                ]

                setPldHandleListTypes(temp)
            } else {
                setPldHandleListTypes([...pldHandleListTypes, value.type])
                setPldHandleList([...pldHandleList, pldHandle])
                setPldHandle('')
            }
        })
    }, [pldHandle, pldHandleList, pldHandleListTypes])

    return {
        document,
        notifications,
        orders,
        equipments,
        libId,
        x,
        y,
        equipmentLinks,
        documentContext,
        onDocumentChange,
        onMenuChange,
        onTabChange,
        currentTab,
        wcdEquipments,
        currentMenu,
        pldHandle,
        pldHandleList,
        pldHandleListTypes,
        pldSimbolList,
        isSavePld,
        setPldHandleList,
        setPldHandleListTypes,
        isChanged,
        setIsChanged,
        pldHandleListEquipments,
        setPldSimbolList,
        setPivotSimbolListHash,
        setPivotProcessListHash,
        setPldHandleListEquipments,
        setPldHandleEntityType,
        pldHandleEntityType,
        setPldHandle
    }
}

const makeString = (entities: EquipmentKey[]) => {
    const ids: string[] = []

    for (const entity of entities) {
        ids.push(entity.tagId)
    }

    return ids.join(',')
}

const makeEntities = (text: string) => {
    const values = text.split(',')
    const results: EquipmentKey[] = []

    for (const value of values) {
        results.push({ tagId: value })
    }

    return results
}
