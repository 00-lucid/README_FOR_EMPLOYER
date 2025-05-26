import React from 'react'
import Repository from '../Repository'
import { ViewParams } from './canvas/MarkupPainter'
import {
    DocumentContext,
    DocumentKey,
    EquipmentContext,
    EquipmentList,
    SelectedDocument,
    showConfirmMarkupSave,
    setBanner,
    pushCommand,
    setHandler,
    AppContext
} from '..'

export type CanvasContext = {
    documentCtx: DocumentContext
    docFile: Uint8Array
    equipmentsByHandle: Map<string, EquipmentContext[]>
    equipmentByTagId: Map<string, EquipmentContext>
    handlesByLibId: Map<string, string[]>
    state: ViewParams | undefined
    registeredHandles: Set<string>
}

export function useCanvasContext(
    onCanvasChange: (canvasCtx: CanvasContext | undefined) => void,
    onDocFileChange: (docFile: Uint8Array, dockey: DocumentKey) => void,
    currentDocument: DocumentKey | undefined
) {
    const appContext = React.useContext(AppContext)

    const [canvases, setCanvases] = React.useState<CanvasContext[]>([])

    const closeAllDocument = React.useCallback(() => {
        setCanvases([])

        onCanvasChange(undefined)
    }, [onCanvasChange])

    const closeDocument = React.useCallback(
        (docKey: DocumentKey) => {
            if (currentDocument) {
                const ok = () => {
                    //여기로 오는 것은 selectDocument 필요 없이 그냥 제거하면 된다는 뜻이다.
                    const newCanvases: CanvasContext[] = []

                    for (const canvas of canvases) {
                        if (canvas.documentCtx.docId !== docKey.docId) {
                            newCanvases.push(canvas)
                        }
                    }

                    setCanvases(newCanvases)

                    if (newCanvases.length === 0) {
                        onCanvasChange(undefined)
                    } else if (currentDocument.docId === docKey.docId) {
                        // 현재 열려있는 것을 바로 닫으면, canvases에는 없는데 현재 문서에는 남아있게 된다.
                        // 그러면 다시 canvases에 추가가 되기 때문에,
                        // 일단 다음 문서를 선택한 후 닫도록 한다.
                        const item = newCanvases[0].documentCtx

                        pushCommand({
                            name: 'requestOpenDocument',
                            value: {
                                selectedDocument: {
                                    docKey: { docId: item.docId, docVer: item.docVer },
                                    plantCode: item.plantCode
                                },
                                ok: () => {
                                    pushCommand({ name: 'restoreCanvasState' })
                                }
                            }
                        })
                    }
                }

                showConfirmMarkupSave(appContext.isMarkupChanged, ok)
            }
        },
        [appContext.isMarkupChanged, canvases, currentDocument, onCanvasChange]
    )

    const openDocument = React.useCallback(
        async (selectedDocument: SelectedDocument) => {
            if (currentDocument?.docId === selectedDocument.docKey.docId) return

            for (const canvas of canvases) {
                if (
                    canvas.documentCtx.docId === selectedDocument.docKey.docId &&
                    canvas.documentCtx.docVer === selectedDocument.docKey.docVer
                ) {
                    onCanvasChange(canvas)
                    return false
                }
            }

            setBanner(`도면 로딩 중...`)
            const docFile = await Repository.getDocumentFile(selectedDocument.docKey)
            setBanner(undefined)
            onDocFileChange(docFile, selectedDocument.docKey)

            // 설비 비동기로 변경해서 인디케이터 주석..
            // setBanner(`설비 로딩 중...`)
            Repository.getDocument(selectedDocument.docKey, selectedDocument.plantCode).then((documentCtx) => {
                if (0 === documentCtx.equipmentList.length) {
                    pushCommand({
                        name: 'requestOk',
                        value: { message: '해당 도면에는 지능화 설비가 없습니다.', ok: () => {} }
                    })
                }

                const equipmentsByHandle = new Map<string, EquipmentContext[]>()
                getEquipmentsByHandle(documentCtx.equipmentList, equipmentsByHandle)

                const equipmentByTagId = new Map<string, EquipmentContext>()
                getEquipmentByTagId(documentCtx.equipmentList, equipmentByTagId)

                const registeredHandles = new Set<string>()
                getAllHandles(documentCtx.equipmentList, registeredHandles)

                const handlesByLibId = new Map<string, string[]>()
                getHandlesByLibId(documentCtx.equipmentList, handlesByLibId)

                const canvas = {
                    documentCtx,
                    docFile,
                    equipmentsByHandle,
                    equipmentByTagId,
                    state: undefined,
                    registeredHandles,
                    handlesByLibId
                }

                const newCanvases = canvases.slice()

                if (5 <= newCanvases.length) {
                    newCanvases.pop()
                }
                newCanvases.unshift(canvas)

                setCanvases(newCanvases)

                onCanvasChange(canvas)
            })

            return false
        },
        [canvases, currentDocument?.docId, onCanvasChange, onDocFileChange]
    )

    React.useEffect(() => {
        setHandler('openDocument', async (value: SelectedDocument) => {
            return await openDocument(value)
        })
        setHandler('closeDocument', async (value: DocumentKey) => {
            closeDocument(value)
        })
        setHandler('allDocumentClose', async () => {
            closeAllDocument()
        })
    }, [openDocument, closeDocument, closeAllDocument])

    return canvases
}

function getEquipmentsByHandle(lists: EquipmentList[], set: Map<string, EquipmentContext[]>) {
    for (const list of lists) {
        for (const equip of list.equipments) {
            for (const eqHandle of equip.handles) {
                const value = set.get(eqHandle.handle)

                if (value) {
                    const newVal = value.slice()
                    newVal.push(equip)

                    set.set(eqHandle.handle, newVal)
                } else {
                    set.set(eqHandle.handle, [equip])
                }
            }
        }

        getEquipmentsByHandle(list.subfolders, set)
    }
}

function getEquipmentByTagId(lists: EquipmentList[], set: Map<string, EquipmentContext>) {
    for (const list of lists) {
        for (const equip of list.equipments) {
            set.set(equip.tagId, equip)
        }

        getEquipmentByTagId(list.subfolders, set)
    }
}

function getAllHandles(lists: EquipmentList[], handles: Set<string>) {
    for (const list of lists) {
        for (const equip of list.equipments) {
            for (const eqHandle of equip.handles) {
                handles.add(eqHandle.handle)
            }
        }

        getAllHandles(list.subfolders, handles)
    }
}

function getHandlesByLibId(lists: EquipmentList[], set: Map<string, string[]>) {
    for (const list of lists) {
        const handles: string[] = []

        for (const item of list.equipments) {
            item.handles.forEach((element) => {
                handles.push(element.handle)
            })
        }

        const handleSet = new Set<string>()

        getAllHandles(list.subfolders, handleSet)
        handles.push(...Array.from(handleSet))

        set.set(list.libId, handles)

        getHandlesByLibId(list.subfolders, set)
    }
}
