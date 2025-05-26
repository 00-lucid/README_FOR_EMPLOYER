import React, { useState } from 'react'
import './Toolbar.css'
import * as icons from './ToolbarIcons'
import { useMarkupContents } from './useMarkupContents'
import { CanvasContext } from '../useCanvasContext'
import { showConfirmMarkupSave, ThemeContext, AppContext, pushCommand, DrawingPath, StatusContext } from '../..'
import { pldCloseValvePath, pldControlValvePath, pldOpenValvePath } from '../canvas/Pld/PldIcons'
import MarkupPopup from './MarkupPopup'

type Props = {
    canvasContext: CanvasContext | undefined
    isEditMarkup: boolean
    isEditPld: boolean
    controlMode: string
    setControlMode: (cmd: string) => void
    zoomExtents: () => void
    markupPaths: DrawingPath[]
    setMarkupPaths: any
    selectedMarkupItems: Set<string>
    loadMarkup: (markupPaths: DrawingPath[], selectedMarkupItems: Set<string>) => void
    clearMarkup: () => void
    showEditMarkup: () => void
    hideEditMarkup: () => void
    showEditPld: () => void
    hideEditPld: () => void
    setCurSvg: (svg: any) => void
    drawingStyle: Object
    undo: (markupPaths: DrawingPath[]) => void
    redo: (markupPaths: DrawingPath[]) => void
    undoList: Array<any>
    setUndoList: any
    redoList: Array<any>
    setRedoList: any
    editMarkupIdx: number
}

export const Toolbar = ({
    canvasContext,
    isEditMarkup,
    isEditPld,
    controlMode,
    setControlMode,
    zoomExtents,
    markupPaths,
    setMarkupPaths,
    selectedMarkupItems,
    loadMarkup,
    clearMarkup,
    showEditMarkup,
    hideEditMarkup,
    drawingStyle,
    undo,
    redo,
    undoList,
    setUndoList,
    redoList,
    setRedoList,
    editMarkupIdx,
    showEditPld,
    hideEditPld,
    setCurSvg
}: Props) => {
    const theme = React.useContext(ThemeContext)
    const app = React.useContext(AppContext)
    const status = React.useContext(StatusContext)

    const favorite = canvasContext?.documentCtx

    const markupContents = useMarkupContents(markupPaths, selectedMarkupItems, loadMarkup)

    const hasMarkups = 0 < markupContents.length

    const isFavorite = React.useMemo(() => {
        if (app.userContext) {
            for (const value of app.userContext.favorite.documents) {
                if (value.docId === favorite?.docId) {
                    return true
                }
            }
        }

        return false
    }, [app.userContext, favorite?.docId])

    const toggleFavorite = () => {
        if (favorite) {
            isFavorite && favorite ? app.removeDocumentFavorite(favorite) : app.addDocumentFavorite(favorite)
        }
    }

    const toggleEditMarkup = React.useCallback(() => {
        if (isEditMarkup) {
            const ok = () => {
                hideEditMarkup()
            }

            showConfirmMarkupSave(app.isMarkupChanged, ok)
        } else {
            showEditMarkup()
        }
    }, [app.isMarkupChanged, hideEditMarkup, isEditMarkup, showEditMarkup])

    const toggleWCD = React.useCallback(() => {
        // console.log('controlMode:', controlMode);
        if (controlMode == 'wcd') {
            setControlMode('select')
        } else {
            // console.log('getOrderEquipment & Color change!!');
            setControlMode('wcd')
            console.log('notification:', status.notifications, ' equipments:', status.equipments)
        }
    }, [controlMode])

    const toggleEditPld = React.useCallback(() => {
        if (isEditPld) {
            hideEditPld()
        } else {
            showEditPld()
        }
    }, [hideEditPld, isEditPld, showEditPld])

    React.useEffect(() => {
        if (app.pldMode) {
            hideEditPld()
        }
    }, [status.documentContext])

    return (
        <div className="Toolbar">
            <div className="MenuToolbar">
                <div className="ToolItem" id="Select" onClick={() => setControlMode('select')}>
                    {icons.markupSelect(controlMode === 'select')}
                </div>
                <div className="ToolItem" id="zoomExtents" onClick={() => zoomExtents()}>
                    {icons.zoomExtents()}
                </div>
                <div className="ToolItem" id="changeTheme" onClick={() => theme.toggleTheme()}>
                    {icons.changeTheme()}
                </div>
                {!app.pldMode && (
                    <div
                        className={'ToolItem ' + (hasMarkups ? '' : 'ToolbarItemDisable')}
                        id="showMarkup"
                        onClick={() => {
                            if (hasMarkups) {
                                if (isEditMarkup) {
                                    const ok = () => {
                                        hideEditMarkup()
                                        pushCommand({ name: 'requestViewMarkupList' })
                                    }

                                    showConfirmMarkupSave(app.isMarkupChanged, ok)
                                } else {
                                    pushCommand({ name: 'requestViewMarkupList' })
                                }
                            }
                        }}
                    >
                        {icons.showMarkup(hasMarkups)}
                    </div>
                )}
                <div className="ToolItemBackground" hidden={!isEditMarkup}>
                    {icons.markupActive()}
                </div>
                <div className="PldItemBackground" hidden={!isEditPld}>
                    {icons.pldActive()}
                </div>
                {!app.pldMode && (
                    <>
                        <div
                            className="ToolItem"
                            id="editMarkup"
                            onClick={() => {
                                toggleEditMarkup()
                                // pushCommand({ name: 'requestEditMarkup' })
                            }}
                        >
                            {icons.editMarkup()}
                        </div>
                        <div
                            className="ToolItem"
                            id="wcd"
                            onClick={() => {
                                toggleWCD()
                            }}
                        >
                            {icons.startWCD(controlMode == 'wcd')}
                        </div>
                    </>
                )}
                {app.pldMode && (
                    <>
                        <div
                            className="ToolItem"
                            onClick={() => {
                                toggleEditPld()
                            }}
                        >
                            {icons.pldEdit()}
                        </div>
                        <div
                            className="ToolItem"
                            id="wcd"
                            onClick={() => {
                                toggleWCD()
                            }}
                        >
                            {icons.startWCD(controlMode == 'wcd')}
                        </div>
                    </>
                )}
                <div className="ToolItem" id="favorite" onClick={toggleFavorite}>
                    {icons.favoriteImg(isFavorite)}
                </div>
                <div className="Rectangle" />
                <div className="DragItem">{icons.dragImg()}</div>
            </div>
            <div className="MarkupToolbar" hidden={!isEditMarkup}>
                <div className="Background"></div>
                <div className="MarkupItem" id="Edit" onClick={() => setControlMode('edit')}>
                    {icons.editMode(controlMode === 'edit')}
                </div>
                <div
                    className="MarkupItem"
                    id="Pen"
                    onClick={() => {
                        setControlMode('markup')
                    }}
                >
                    {icons.markupPen(controlMode === 'markup')}
                </div>

                <div
                    className="MarkupItem"
                    id="rect"
                    onClick={() => {
                        setControlMode('rect')
                    }}
                >
                    {icons.markupRect(controlMode === 'rect')}
                </div>
                <div
                    className="MarkupItem"
                    id="circle"
                    onClick={() => {
                        setControlMode('circle')
                    }}
                >
                    {icons.markupCircle(controlMode === 'circle')}
                </div>
                <div
                    className="MarkupItem"
                    id="text"
                    onClick={() => {
                        setControlMode('text')
                    }}
                >
                    {icons.markupText(controlMode === 'text')}
                </div>
                <div
                    className="MarkupItem"
                    id="poli"
                    onClick={() => {
                        setControlMode('poli')
                    }}
                >
                    {icons.markupPoli(controlMode === 'poli')}
                </div>
                <div
                    className="MarkupItem"
                    id="cloud"
                    onClick={() => {
                        setControlMode('cloud')
                    }}
                >
                    {icons.markupCloud(controlMode === 'cloud')}
                </div>
                <div
                    className="MarkupItem"
                    id="Erase"
                    onClick={() => {
                        setControlMode('erase')
                    }}
                >
                    {icons.markupErase(controlMode === 'erase')}
                </div>
                <div
                    className={'MarkupItem ' + (undoList.length === 0 ? 'ToolbarItemDisable' : '')}
                    id="undo"
                    onClick={() => {
                        undo(markupPaths)
                    }}
                >
                    {icons.undo()}
                </div>
                <div
                    className={'MarkupItem ' + (redoList.length === 0 ? 'ToolbarItemDisable' : '')}
                    id="redo"
                    onClick={() => {
                        redo(markupPaths)
                    }}
                >
                    {icons.redo()}
                </div>
                <div
                    className={'MarkupItem ' + (app.isMarkupChanged ? '' : 'ToolbarItemDisable')}
                    id="Save"
                    onClick={() => {
                        if (app.isMarkupChanged) {
                            if (app.currentMarkup[0]) {
                                pushCommand({
                                    name: 'requestUpdateMarkup'
                                })
                            } else {
                                pushCommand({
                                    name: 'requestSaveMarkup',
                                    value: { ok: () => {}, setUndoList: setUndoList, setRedoList: setRedoList }
                                })
                            }
                        }
                    }}
                >
                    {icons.markupSave()}
                </div>
                <div
                    className={'MarkupItem ' + (hasMarkups ? '' : 'ToolbarItemDisable')}
                    id="Load"
                    onClick={() => {
                        if (hasMarkups) {
                            pushCommand({
                                name: 'requestLoadMarkupList',
                                value: { setUndoList: setUndoList, setRedoList: setRedoList }
                            })
                        }
                    }}
                >
                    {icons.markupLoad()}
                </div>
            </div>
            {/* <div className="PLDToolbar" hidden={!isEditPld}>
                <div className="Background"></div>
                <div
                    className={`PLDItem ${(status.pldHandleEntityType === 1 || status.pldHandle === '') && 'disable'}`}
                    id="Open"
                    onClick={() => {
                        if (!status.pldHandle) {
                            setCurSvg(pldOpenValvePath)
                        } else {
                            setCurSvg(pldOpenValvePath)
                            pushCommand({ name: 'selectSvg', value: { type: '001' } })
                        }
                    }}
                >
                    {icons.pldOpenValve()}
                </div>
                <div
                    className={`PLDItem ${(status.pldHandleEntityType === 1 || status.pldHandle === '') && 'disable'}`}
                    id="Close"
                    onClick={() => {
                        if (!status.pldHandle) {
                            setCurSvg(pldCloseValvePath)
                        } else {
                            setCurSvg(pldCloseValvePath)
                            pushCommand({ name: 'selectSvg', value: { type: '002' } })
                        }
                    }}
                >
                    {icons.pldCloseValve()}
                </div>
                <div
                    className={`PLDItem ${(status.pldHandleEntityType === 1 || status.pldHandle === '') && 'disable'}`}
                    id="Control"
                    onClick={() => {
                        if (!status.pldHandle) {
                            setCurSvg(pldControlValvePath)
                        } else {
                            setCurSvg(pldControlValvePath)
                            pushCommand({ name: 'selectSvg', value: { type: '005' } })
                        }
                    }}
                >
                    {icons.pldControlValve()}
                </div>
                <div
                    className={`PLDItem ${
                        (!status.pldHandle && 'disable') || (status.pldHandleEntityType === 2 && 'disable')
                    }`}
                    id="Main"
                    onClick={() => {
                        pushCommand({ name: 'selectLine', value: { type: '003' } })
                    }}
                >
                    {icons.pldMainLine()}
                </div>
                <div
                    className={`PLDItem ${
                        (!status.pldHandle && 'disable') || (status.pldHandleEntityType === 2 && 'disable')
                    }`}
                    id="Sub"
                    onClick={() => {
                        pushCommand({ name: 'selectLine', value: { type: '004' } })
                    }}
                >
                    {icons.pldSubLine()}
                </div>
                <div className={'PLDItem'} id="Picture">
                    {icons.pldPicture()}
                </div>
            </div> */}
            <MarkupPopup
                controlMode={controlMode}
                markupPaths={markupPaths}
                setMarkupPaths={setMarkupPaths}
                drawingStyle={drawingStyle}
                editMarkupIdx={editMarkupIdx}
                undoList={undoList}
                setUndoList={setUndoList}
                redoList={redoList}
                setRedoList={setRedoList}
            />
        </div>
    )
}
