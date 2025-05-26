import React, { useEffect, useState, Suspense } from 'react'
import { ViewParams } from './canvas/MarkupPainter'
import { ThemeContext, AppContext, setHandler } from '..'
import { DocumentKey, EquipmentKey } from '../types'
import { useCanvasContext, CanvasContext } from './useCanvasContext'
import { DrawingPath } from '../types'
import './MainView.css'
import { pushCommand, continueListener, StatusContext } from '..'
import { OrderListFlagView } from './OrderListFlagView'

const Titlebar = React.lazy(() => {
    return import('./Titlebar').then(({ Titlebar }) => ({ default: Titlebar }))
})
const Toolbar = React.lazy(() => {
    return import('./toolbar/Toolbar').then(({ Toolbar }) => ({ default: Toolbar }))
})
const PopupMenu = React.lazy(() => {
    return import('./PopupMenu').then(({ PopupMenu }) => ({ default: PopupMenu }))
})
const EquipmentLinkView = React.lazy(() => {
    return import('./EquipmentLinkView').then(({ EquipmentLinkView }) => ({ default: EquipmentLinkView }))
})
const Canvas = React.lazy(() => {
    return import('./canvas/Canvas').then(({ Canvas }) => ({ default: Canvas }))
})

type CanvasRef = {
    zoomExtents(): void
    zoomEntity(handles: string[]): void
    restoreState(params: ViewParams | undefined): void
    redraw(): void
}

export const MainView = () => {
    const canvasRef = React.useRef<CanvasRef>()
    const theme = React.useContext(ThemeContext)
    const app = React.useContext(AppContext)
    const status = React.useContext(StatusContext)

    const [undoList, setUndoList] = useState<Array<any>>([])
    const [redoList, setRedoList] = useState<Array<any>>([])
    const [editMarkupIdx, setEditMarkupIdx] = useState(-1)
    let tempUndoList: any = []
    let tempRedoList: any = []
    const [controlMode, setControlMode] = React.useState<string>(app.pldMode ? 'pld' : 'select')
    const [isEditMarkup, setEditMarkup] = React.useState<boolean>(false)
    const [isEditPld, setEditPld] = React.useState<boolean>(false)
    const [markupPaths, setMarkupPaths] = React.useState<DrawingPath[]>([])
    const [current, setCurrentContext] = React.useState<CanvasContext>()
    const [curSvg, setCurSvg] = React.useState<{ path: JSX.Element; viewBox: string; type: string } | null>(null)
    const [handleStep, setHandleStep] = React.useState<boolean>(false)

    React.useEffect(() => {
        if (current?.equipmentsByHandle) {
            const handleListEquipments = status.pldHandleList.map((handle) => {
                const equipmentList = current.equipmentsByHandle.get(handle)
                if (equipmentList !== undefined) {
                    return equipmentList[0].function
                } else {
                    return undefined
                }
            })

            status.setPldHandleListEquipments(handleListEquipments)
        }
    }, [status.pldHandleList])

    React.useEffect(() => {
        if (app.pldMode) {
            setControlMode('pldSelect')
        }
    }, [status.documentContext])

    const zoomExtents = React.useCallback(() => {
        setHandleStep((old) => !old)
        canvasRef.current?.zoomExtents()
    }, [])

    const zoomEntity = React.useCallback(
        (value: { equipments: EquipmentKey[] }) => {
            if (current) {
                const handles: string[] = []

                for (const equipment of value.equipments) {
                    const value = current.equipmentByTagId.get(equipment.tagId)

                    if (value) {
                        for (const handle of value.handles) {
                            handles.push(handle.handle)
                        }
                    } else {
                        handles.push(equipment.tagId)
                    }
                }
                setHandleStep((old) => !old)

                canvasRef.current?.zoomEntity(handles)
            }
        },
        [current]
    )

    const hideEditMarkup = React.useCallback(() => {
        setControlMode('select')
        setEditMarkup(false)
        setMarkupPaths([])
        setSelectedMarkupItems(new Set<string>())
        setUndoList([])
        setRedoList([])
        app.setMarkupChanged(false)
    }, [app])

    const showEditMarkup = React.useCallback(() => {
        setMarkupPaths([])
        setSelectedMarkupItems(new Set<string>())
        setEditMarkup(true)
    }, [])

    const hideEditPld = React.useCallback(() => {
        pushCommand({ name: 'resetEditPldMode' })
        setControlMode('pldSelect')
        setEditPld(false)
    }, [app])

    const showEditPld = React.useCallback(() => {
        setControlMode('pld')
        setEditPld(true)
    }, [app])

    const [selectedMarkupItems, setSelectedMarkupItems] = React.useState(new Set<string>())

    const loadMarkup = React.useCallback(
        (markupPaths: DrawingPath[], selectedItems: Set<string>) => {
            app.setMarkupChanged(false)
            setMarkupPaths(markupPaths)
            setSelectedMarkupItems(selectedItems)
        },
        [app]
    )

    const clearMarkup = React.useCallback(() => {
        app.setMarkupChanged(false)
        setMarkupPaths([])
        setSelectedMarkupItems(new Set<string>())
    }, [app])

    React.useEffect(() => {
        setHandler('zoomEntity', async (value: { equipments: EquipmentKey[] }) => {
            zoomEntity(value)
        })
        setHandler('zoomExtents', async () => {
            zoomExtents()
        })
        setHandler('restoreCanvasState', async () => {
            if (current && current.state) {
                canvasRef.current?.restoreState(current.state)
            }
        })
        setHandler('clearMarkup', async () => {
            clearMarkup()
        })
    }, [clearMarkup, current, zoomEntity, zoomExtents, markupPaths])

    /* 
        도면 파일 변경 적용
        desc. 도면 먼저 화면에 적용하고, 비동기로 설비 불러와서 적용하기 위해 만든 함수.
    */
    const onDocFileChange = React.useCallback(
        (docFile: Uint8Array, docKey: DocumentKey) => {
            hideEditMarkup()
            if (current) {
                // 도면 변경
                setCurrentContext({ ...current, docFile: docFile })
                // 사이드바 도면 선택 색상 변경
                status.onDocumentChange({
                    ...current.documentCtx,
                    docId: docKey.docId,
                    docVer: docKey.docVer
                })
            }
        },
        [current, hideEditMarkup, status]
    )
    const onCanvasChange = React.useCallback(
        (canvasCtx: CanvasContext | undefined) => {
            hideEditMarkup()

            setCurrentContext(canvasCtx)

            status.onDocumentChange(canvasCtx?.documentCtx)
        },
        [hideEditMarkup, status]
    )

    const canvases = useCanvasContext(onCanvasChange, onDocFileChange, status.document?.docKey)

    const onCanvasLoad = React.useCallback(() => {
        continueListener()
    }, [])

    const onCanvasMove = React.useCallback(
        (params: ViewParams) => {
            if (current) {
                current.state = params
            }

            const isPopup = 1 < status.equipmentLinks.length

            if (isPopup) {
                pushCommand({ name: 'selectHandle', value: { equipments: [], x: 0, y: 0, equipmentLinks: [] } })
            }
        },
        [current, status.equipmentLinks.length]
    )

    const cssClassName = theme.theme.type === 'light' ? 'LightTheme' : 'DarkTheme'

    const equipmentLink = status.equipmentLinks.length === 1 ? status.equipmentLinks[0] : undefined
    const equipments = status.wcdEquipments.length === 1 ? status.wcdEquipments[0] : undefined

    const undo = (currentPath: DrawingPath[]) => {
        try {
            if ((currentPath.length === 0 && !undoList[undoList.length - 1]?.cmd) || undoList.length == 0) return
            tempUndoList = JSON.parse(JSON.stringify(undoList))
            setEditMarkupIdx(-1)
            let undo_tempUndoList = JSON.parse(JSON.stringify(undoList))
            // setRedoList([...redoList, tempUndoList[tempUndoList.length-1]])
            if (tempUndoList.at(-1).cmd && tempUndoList[tempUndoList.length - 1].cmd == 'edit') {
                const idx = tempUndoList.at(-1).idx
                const tempPath = JSON.parse(JSON.stringify(currentPath[idx]))
                const path = {
                    type: tempPath.type,
                    color: tempPath.color,
                    width: tempPath.width,
                    texts: tempPath.texts,
                    values: tempPath.values,
                    area: tempPath.area,
                    dash: [],
                    idx: idx,
                    cmd: 'edit'
                }
                setRedoList([...redoList, path])
            } else setRedoList([...redoList, undo_tempUndoList[undo_tempUndoList.length - 1]])
            if (tempUndoList.at(-1)?.cmd === 'delete') {
                delete tempUndoList.at(-1).cmd
                currentPath.push(tempUndoList.pop())
            } else if (tempUndoList.at(-1)?.cmd === 'edit') {
                const lastUndoList = tempUndoList.at(-1)
                const tempPath = JSON.parse(JSON.stringify(currentPath))
                console.log('beforePath:', tempPath)
                tempPath[lastUndoList.idx].type = lastUndoList.type
                tempPath[lastUndoList.idx].color = lastUndoList.color
                tempPath[lastUndoList.idx].width = lastUndoList.width
                tempPath[lastUndoList.idx].texts = lastUndoList.texts
                tempPath[lastUndoList.idx].values = lastUndoList.values
                tempPath[lastUndoList.idx].area = lastUndoList.area
                tempPath[lastUndoList.idx].dash = lastUndoList.dash
                console.log('tempPath:', tempPath)
                setMarkupPaths(tempPath)
                tempUndoList.pop()
            } else {
                currentPath.pop()
                tempUndoList.pop()
            }
            setUndoList([...tempUndoList])
        } catch (error) {
            console.log(error)
        }
    }

    const redo = (currentPath: DrawingPath[]) => {
        try {
            if (redoList.length === 0) return
            console.log(redoList)
            setEditMarkupIdx(-1)
            tempRedoList = JSON.parse(JSON.stringify(redoList))
            if (tempRedoList[tempRedoList.length - 1]?.cmd === 'delete') {
                currentPath.pop()
                setUndoList([...undoList, tempRedoList.pop()])
            } else if (tempRedoList[tempRedoList.length - 1]?.cmd === 'edit') {
                const lastRedoList = tempRedoList[tempRedoList.length - 1]
                const tempPath = JSON.parse(JSON.stringify(currentPath[lastRedoList.idx]))
                tempPath.cmd = 'edit'
                tempPath.idx = lastRedoList.idx
                const tempUndoList = JSON.parse(JSON.stringify(undoList))
                setUndoList([...tempUndoList, tempPath])

                currentPath[lastRedoList.idx].type = lastRedoList.type
                currentPath[lastRedoList.idx].color = lastRedoList.color
                currentPath[lastRedoList.idx].width = lastRedoList.width
                currentPath[lastRedoList.idx].texts = lastRedoList.texts
                currentPath[lastRedoList.idx].values = lastRedoList.values
                currentPath[lastRedoList.idx].area = lastRedoList.area
                currentPath[lastRedoList.idx].dash = lastRedoList.dash
                tempRedoList.pop()
            } else {
                setUndoList([...undoList, tempRedoList[tempRedoList.length - 1]])
                currentPath.push(tempRedoList.pop())
            }
            setRedoList([...tempRedoList])
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        console.log('언도리스트', undoList)
        console.log('리도리스트', redoList)
    }, [undoList, redoList])

    return (
        <div className={'MainView ' + cssClassName}>
            <Suspense fallback={false}>
                {current?.docFile && (
                    <Canvas
                        docFile={current?.docFile}
                        controlMode={controlMode}
                        drawingStyle={drawingStyle}
                        onCanvasMove={onCanvasMove}
                        onLoad={onCanvasLoad}
                        canvasContext={current}
                        markupPaths={markupPaths}
                        ref={canvasRef}
                        curSvg={curSvg}
                        setCurSvg={setCurSvg}
                        handleStep={handleStep}
                        equipmentsByHandle={current.equipmentsByHandle}
                        undoList={undoList}
                        setUndoList={setUndoList}
                        setRedoList={setRedoList}
                        editMarkupIdx={editMarkupIdx}
                        setEditMarkupIdx={setEditMarkupIdx}
                    />
                )}
                <div className="CenterPopup">
                    <OrderListFlagView
                        equipments={equipments}
                        document={current?.documentCtx}
                        canvasContext={current}
                    />
                </div>
                <div className="RightViewFrame">
                    {canvases && status.document && <Titlebar canvases={canvases} selectedDocument={status.document} />}
                    {equipmentLink && current?.documentCtx && (
                        <EquipmentLinkView
                            equipmentLink={equipmentLink}
                            document={current?.documentCtx}
                            canvasContext={current}
                        />
                    )}
                </div>
                {current && (
                    <Toolbar
                        selectedMarkupItems={selectedMarkupItems}
                        canvasContext={current}
                        isEditMarkup={isEditMarkup}
                        isEditPld={isEditPld}
                        controlMode={controlMode}
                        setControlMode={setControlMode}
                        zoomExtents={zoomExtents}
                        markupPaths={markupPaths}
                        loadMarkup={loadMarkup}
                        clearMarkup={clearMarkup}
                        showEditMarkup={showEditMarkup}
                        hideEditMarkup={hideEditMarkup}
                        showEditPld={showEditPld}
                        hideEditPld={hideEditPld}
                        setCurSvg={setCurSvg}
                        setMarkupPaths={setMarkupPaths}
                        drawingStyle={drawingStyle}
                        undo={undo}
                        redo={redo}
                        undoList={undoList}
                        setUndoList={setUndoList}
                        redoList={redoList}
                        setRedoList={setRedoList}
                        editMarkupIdx={editMarkupIdx}
                    />
                )}
                {status.equipmentLinks.length > 0 && <PopupMenu />}
                <BackgroundView hidden={status.document !== undefined} />
            </Suspense>
        </div>
    )
}

const drawingStyle = { type: 'line', width: 10, color: '#ff0000', texts: ['', '', '', '', 'left', ''] } // 0. shift모드,text모드 문자, 1. bold 2. italic 3. underline, 4. textAlign

const BackgroundView = ({ hidden }: { hidden: boolean }) => {
    return (
        <div hidden={hidden}>
            <img alt="" src="img/bg.webp" srcSet="img/bg@2x.webp 2x, img/bg@3x.webp 3x" className="Background" />
            <img
                alt=""
                src="img/intro-logo.png"
                srcSet="img/intro-logo@2x.png 2x, img/intro-logo@3x.png 3x"
                className="BackgroundLogo"
            />
        </div>
    )
}
