import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import './PldProcessMenu.css'
import { AppContext, StatusContext } from '../../context'
import { CloseSideMenu } from '../CloseSideMenu'
import { pushCommand, TreeViewItemSource } from '../../common'
import { PldDocument, ProcessList } from '../../types'
import { makeFolderLabel, makeProcessItems } from './TreeViewItem'
import { setBanner } from '../..'
import { PldTreeView } from '../../common/PldTreeView'
import { requestEntitiesList } from '../../mainview/canvas/Pld/PldUtil'
import CryptoJS from 'crypto-js'

export const PldProcessMenu = () => {
    const status = useContext(StatusContext)
    const app = useContext(AppContext)

    const [processList, setProcessList] = useState<ProcessList[]>([])
    const [editable, setEditable] = useState(true)
    const [extendedIds, setExtendedIds] = useState(new Set<string>([]))
    const [selectedIds, setSelectedIds] = useState(new Set<string>([]))
    const [selectedFolder, setSelectedFolder] = useState<ProcessList>()
    const [localLoding, setLocalLoading] = useState<boolean>(false)

    useEffect(() => {
        if (processList.length > 0) {
            for (let i = 0; i < processList.length; i++) {
                if (status.documentContext?.docId === processList[i].id) {
                    processList[i].callback()
                    setExtendedIds(new Set([processList[i].id]))
                    setSelectedIds(new Set<string>([processList[i].id]))
                    setSelectedFolder(processList[i])
                }
            }
        }
    }, [status.documentContext])

    function pldDocumentToTreeTemplate(pldDocument: PldDocument) {
        const tempOpen: ProcessList = {
            id: `open${pldDocument.PLD_C_SEQ}`,
            name: '열림밸브',
            subFolders: [],
            processes: [],
            type: 'openValve',
            callback: null,
            status: 'close',
            plantcode: '',
            docvr: ''
        }

        const tempClose: ProcessList = {
            id: `close${pldDocument.PLD_C_SEQ}`,
            name: '닫힘밸브',
            subFolders: [],
            processes: [],
            type: 'closeValve',
            callback: null,
            status: 'close',
            plantcode: '',
            docvr: ''
        }

        const tempControl: ProcessList = {
            id: `control${pldDocument.PLD_C_SEQ}`,
            name: '조절밸브',
            subFolders: [],
            processes: [],
            type: 'controlValve',
            callback: null,
            status: 'close',
            plantcode: '',
            docvr: ''
        }

        const tempMain: ProcessList = {
            id: `main${pldDocument.PLD_C_SEQ}`,
            name: '주유로',
            subFolders: [],
            processes: [],
            type: 'main',
            callback: null,
            status: 'close',
            plantcode: '',
            docvr: ''
        }

        const tempSub: ProcessList = {
            id: `sub${pldDocument.PLD_C_SEQ}`,
            name: '보조유로',
            subFolders: [],
            processes: [],
            type: 'sub',
            callback: null,
            status: 'close',
            plantcode: '',
            docvr: ''
        }

        const tempDocument: ProcessList = {
            id: pldDocument.DOCNO,
            name: pldDocument.DOCNM,
            subFolders: [tempOpen, tempClose, tempControl, tempMain, tempSub],
            processes: [],
            type: 'document',
            callback: () => {
                status.setPldSimbolList([])
                status.setPldHandleList([])
                status.setPldHandleListTypes([])

                const { PLD_C_ID, PLD_C_VR, PLD_C_SEQ, DOCNO, DOCVR } = pldDocument

                setLocalLoading(true)
                requestEntitiesList({
                    cId: PLD_C_ID,
                    cVr: PLD_C_VR,
                    docNo: DOCNO,
                    docVr: DOCVR,
                    cSeq: PLD_C_SEQ
                }).then((data: any[]) => {
                    const defaultHandleList = []
                    const defaultHandleListTypes = []

                    for (let i = 0; i < data.length; i++) {
                        const entities = data[i]
                        const type = entities.TYPE
                        if (type === '001') {
                            tempOpen.processes.push({
                                id: `${entities.HANDLE} ${entities.TYPE}`,
                                handle: entities.HANDLE,
                                equipment: entities.FUNCTION,
                                status: 'load'
                            })
                        } else if (type === '002') {
                            tempClose.processes.push({
                                id: `${entities.HANDLE} ${entities.TYPE}`,
                                handle: entities.HANDLE,
                                equipment: entities.FUNCTION,
                                status: 'load'
                            })
                        } else if (type === '005') {
                            tempControl.processes.push({
                                id: `${entities.HANDLE} ${entities.TYPE}`,
                                handle: entities.HANDLE,
                                equipment: entities.FUNCTION,
                                status: 'load'
                            })
                        } else if (type === '003') {
                            tempMain.processes.push({
                                id: `${entities.HANDLE} ${entities.TYPE}`,
                                handle: entities.HANDLE,
                                equipment: entities.FUNCTION,
                                status: 'load'
                            })
                        } else if (type === '004') {
                            tempSub.processes.push({
                                id: `${entities.HANDLE} ${entities.TYPE}`,
                                handle: entities.HANDLE,
                                equipment: entities.FUNCTION,
                                status: 'load'
                            })
                        }

                        defaultHandleList.push(entities.HANDLE)
                        defaultHandleListTypes.push(type)
                    }

                    if (defaultHandleList.length === 0 && defaultHandleListTypes.length === 0) {
                        const curProcessHash = CryptoJS.SHA256(JSON.stringify({ handle: [], type: [] })).toString()

                        status.setPivotProcessListHash(curProcessHash)
                    } else {
                        // 불러올 때 피벗 초기화
                        status.setPivotProcessListHash(
                            CryptoJS.SHA256(
                                JSON.stringify({
                                    handle: defaultHandleList,
                                    type: defaultHandleListTypes
                                })
                            ).toString()
                        )
                    }

                    status.setPldHandleList(defaultHandleList)
                    status.setPldHandleListTypes(defaultHandleListTypes)

                    setLocalLoading(false)
                })
            },
            status: 'close',
            plantcode: pldDocument.PLANTCODE,
            docvr: pldDocument.DOCVR
        }

        return tempDocument
    }

    useEffect(() => {
        if (processList.length < 1) {
            return
        }

        let openValve = []
        let closeValve = []
        let controlValve = []
        let main = []
        let sub = []

        for (let i = 0; i < status.pldHandleList.length; i++) {
            let equipment = status.pldHandleListEquipments[i]

            if (undefined === equipment) {
                equipment = status.pldHandleList[i]
            }

            const handle = status.pldHandleList[i]
            const equipmentName = equipment
            const type = status.pldHandleListTypes[i]

            if (type === '001') {
                openValve.push({ id: `${i}`, handle, equipment: equipmentName, status: 'load' })
            } else if (type === '002') {
                closeValve.push({ id: `${i}`, handle, equipment: equipmentName, status: 'load' })
            } else if (type === '005') {
                controlValve.push({ id: `${i}`, handle, equipment: equipmentName, status: 'load' })
            } else if (type === '003') {
                main.push({ id: `${i}`, handle, equipment, status: 'load' })
            } else if (type === '004') {
                sub.push({ id: `${i}`, handle, equipment, status: 'load' })
            }
        }

        const processList_ = [...processList]
        for (let i = 0; i < processList_.length; i++) {
            if (processList_[i].id === status.documentContext?.docId) {
                const process = processList_[i]
                if (undefined !== process) {
                    process.subFolders[0].processes = openValve
                    process.subFolders[1].processes = closeValve
                    process.subFolders[2].processes = controlValve
                    process.subFolders[3].processes = main
                    process.subFolders[4].processes = sub

                    setProcessList(processList_)
                }
            }
        }
    }, [status.pldHandleList, status.pldHandleListTypes, status.pldHandleListEquipments])

    const reload = useCallback(async () => {
        // setProcessList([])
        setBanner(undefined)
    }, [])

    useEffect(() => {
        reload()
    }, [reload])

    useEffect(() => {
        const result = []
        for (const pldDocument of app.pldDocumentList) {
            const temp = pldDocumentToTreeTemplate(pldDocument)
            result.push(temp)
        }

        setProcessList(result)
    }, [app.pldDocumentList])

    const onDocumentClick = useCallback(async (item: ProcessList) => {
        pushCommand({
            name: 'requestOpenDocument',
            value: {
                selectedDocument: {
                    docKey: { docId: item.id, docVer: item.docvr },
                    plantCode: item.plantcode
                },
                ok: () => {
                    pushCommand({ name: 'zoomExtents' })
                }
            }
        })
    }, [])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const pldHandleListChange = (handle: string) => {
        const idx = status.pldHandleList.indexOf(handle)

        const newPldList = status.pldHandleList.slice()
        newPldList.splice(idx, 1)
        status.setPldHandleList(newPldList)

        const newPldType = status.pldHandleListTypes.slice()
        newPldType.splice(idx, 1)
        status.setPldHandleListTypes(newPldType)
    }

    const makeTreeItem = useCallback(
        (list: ProcessList, depth: number): TreeViewItemSource => {
            const items: TreeViewItemSource[] = []

            for (const subFolder of list.subFolders) {
                const item = makeTreeItem(subFolder, depth + 1)
                items.push(item)
            }

            makeProcessItems(items, list, depth, reload, editable, pldHandleListChange)

            const key = list.id

            const item = {
                label: makeFolderLabel(list.name, depth, list.type),
                key,
                items,
                onClick: () => {
                    // setPivotProcessListHash('')

                    if (status.isChanged && list.type === 'document') {
                        const confirmValue = {
                            message: '변경된 도면을 저장할까요?',
                            yes: async () => {
                                const cSeq = app.pldDocumentList.filter(
                                    (el) => el.DOCNM === status.documentContext?.docName
                                )[0].PLD_C_SEQ
                                pushCommand({ name: 'savePld', value: { currentPld: app.currentPld, cSeq } })
                            },
                            no: () => {
                                const newValues = new Set<string>(extendedIds)

                                let isInDocument = false

                                for (const pldDocument of app.pldDocumentList) {
                                    if (newValues.has(pldDocument.DOCNO)) {
                                        isInDocument = newValues.has(pldDocument.DOCNO)
                                        if (pldDocument.DOCNO === key) {
                                            setExtendedIds(new Set())
                                            setSelectedIds(new Set<string>([key]))
                                            setSelectedFolder(list)
                                            if (depth === 0) onDocumentClick(list)
                                            return
                                        }
                                    }
                                }

                                if (key.length < 10) {
                                    if (newValues.has(key)) {
                                        newValues.delete(key)
                                    } else {
                                        newValues.add(key)
                                    }

                                    setExtendedIds(newValues)
                                    setSelectedIds(new Set<string>([key]))
                                    setSelectedFolder(list)
                                    if (depth === 0) onDocumentClick(list)
                                    return
                                }

                                if (newValues.has(key)) {
                                    newValues.delete(key)
                                } else {
                                    if (!isInDocument) {
                                        newValues.add(key)
                                    } else {
                                        const arr = Array.from(newValues)
                                        arr[0] = key
                                        const newSet = new Set([arr[0]])

                                        setExtendedIds(newSet)
                                        setSelectedIds(new Set<string>([key]))
                                        setSelectedFolder(list)
                                        if (depth === 0) onDocumentClick(list)
                                        return
                                    }
                                }
                                setExtendedIds(newValues)
                                setSelectedIds(new Set<string>([key]))
                                setSelectedFolder(list)
                                if (depth === 0) onDocumentClick(list)
                            }
                        }

                        pushCommand({ name: 'requestYesNo', value: confirmValue })
                        return
                    }

                    const newValues = new Set<string>(extendedIds)

                    let isInDocument = false

                    for (const pldDocument of app.pldDocumentList) {
                        if (newValues.has(pldDocument.DOCNO)) {
                            isInDocument = newValues.has(pldDocument.DOCNO)
                            if (pldDocument.DOCNO === key) {
                                setExtendedIds(new Set())
                                setSelectedIds(new Set<string>([key]))
                                setSelectedFolder(list)
                                if (depth === 0) onDocumentClick(list)
                                return
                            }
                        }
                    }

                    if (key.length < 10) {
                        if (newValues.has(key)) {
                            newValues.delete(key)
                        } else {
                            newValues.add(key)
                        }

                        setExtendedIds(newValues)
                        setSelectedIds(new Set<string>([key]))
                        setSelectedFolder(list)
                        if (depth === 0) onDocumentClick(list)
                        return
                    }

                    if (newValues.has(key)) {
                        newValues.delete(key)
                    } else {
                        if (!isInDocument) {
                            newValues.add(key)
                        } else {
                            const arr = Array.from(newValues)
                            arr[0] = key
                            const newSet = new Set([arr[0]])

                            setExtendedIds(newSet)
                            setSelectedIds(new Set<string>([key]))
                            setSelectedFolder(list)
                            if (depth === 0) onDocumentClick(list)
                            return
                        }
                    }
                    setExtendedIds(newValues)
                    setSelectedIds(new Set<string>([key]))
                    setSelectedFolder(list)
                    if (depth === 0) onDocumentClick(list)
                }
            }

            return item
        },
        [
            app.currentPld,
            app.pldDocumentList,
            editable,
            extendedIds,
            onDocumentClick,
            pldHandleListChange,
            reload,
            status.documentContext?.docName,
            status.isChanged
        ]
    )

    const treeItems = useMemo((): TreeViewItemSource[] => {
        const value: TreeViewItemSource[] = []

        for (const list of processList) {
            value.push(makeTreeItem(list, 0))
        }

        return value
    }, [processList, makeTreeItem])

    return (
        <div className="PldProcessMenu SideViewShadow SideViewBackground" style={style(status.currentMenu)}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">PROCESS Line-Up</span>
            <CloseSideMenu onMenuChange={status.onMenuChange} />
            <div className="topline"></div>
            <section id="pld-preview">
                <section className="info">
                    <label className="name">발전소</label>
                    <p style={{ width: '10%' }}>:</p>
                    <p className="content">{app.currentPld?.COMPANY.company + ' ' + app.currentPld?.COMPANY.plant}</p>
                </section>

                <section className="info">
                    <label className="name">절차서 번호</label>
                    <p style={{ width: '10%' }}>:</p>
                    <p className="content">{app.currentPld?.PLD_P_NUMBER}</p>
                </section>

                <section className="info">
                    <label className="name">절차서 명</label>
                    <p style={{ width: '10%' }}>:</p>
                    <p className="content">{app.currentPld?.PLD_P_NAME}</p>
                </section>

                <section className="info">
                    <label className="name">PLD 명</label>
                    <p style={{ width: '10%' }}>:</p>
                    <p className="content">{app.currentPld?.PLD_C_NAME}</p>
                </section>
            </section>
            <div className="bottomline"></div>
            <section className="PldProcessTree">
                <PldTreeView
                    id="processMenuTreeView"
                    items={treeItems}
                    extendedIds={extendedIds}
                    selectedIds={selectedIds}
                    localLoading={localLoding}
                />
            </section>
            <section id="buttons">
                <button
                    className="button"
                    onClick={() => {
                        pushCommand({ name: 'addPldDoc', value: app.currentPld })
                    }}
                >
                    도면변경
                </button>
                <button
                    className="button"
                    onClick={(e: any) => {
                        const confirmValue = {
                            title: 'PLD 모드',
                            message: 'PLD 수정을 취소할까요?',
                            submessage: '저장하지 않은 내용은 모두 취소됩니다.',
                            yes: async () => {
                                pushCommand({ name: 'allDocumentClose' })
                                pushCommand({ name: 'resetPld' })
                                app.setCurrentPld(null)
                                app.setPldDocumentList([])
                                e.stopPropagation()
                            },
                            no: () => {}
                        }

                        pushCommand({ name: 'showWarningView', value: confirmValue })
                    }}
                >
                    취소
                </button>
                <button
                    className={`button blue ${status.isChanged && !localLoding ? '' : 'disable'}`}
                    onClick={(e) => {
                        // Save SimbolList & EntityList

                        const confirmValue = {
                            message: '변경된 도면을 저장할까요?',
                            yes: async () => {
                                const cSeq = app.pldDocumentList.filter(
                                    (el) => el.DOCNM === status.documentContext?.docName
                                )[0].PLD_C_SEQ
                                pushCommand({ name: 'savePld', value: { currentPld: app.currentPld, cSeq } })
                                e.stopPropagation()
                            },
                            no: () => {}
                        }

                        pushCommand({ name: 'requestYesNo', value: confirmValue })
                    }}
                >
                    저장
                </button>
            </section>
        </div>
    )
}

function style(currentMenu: string) {
    return 'process' === currentMenu
        ? { marginLeft: 'var(--SideMenuWidth)' }
        : { marginLeft: 'calc(var(--PldProcessMenuWidth) * -1 )' }
}
