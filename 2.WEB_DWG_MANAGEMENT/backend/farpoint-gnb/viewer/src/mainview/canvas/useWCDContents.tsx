import React from 'react'
import Repository from '../../Repository'
import {
    setBanner,
    pushCommand,
    setHandler,
    showConfirmMarkupSave,
    AppContext,
    DrawingPath,
    EquipmentsList,
    StatusContext
} from '../..'
import { getEntities, getModel, getHandle } from '../canvas/utils'
import { useEntityPainter } from './useEntityPainter';

export function useWCDContents(
    viewer: any,
    controlMode: string, 
    entityPainter: any
    // selectedItems: Set<string>,
    // loadMarkup: (markupPaths: DrawingPath[], selectedItems: Set<string>) => void
) {
    const appContext = React.useContext(AppContext)
    const status = React.useContext(StatusContext)

    const [wcdContents, setWCDContents] = React.useState<string[]>([])

    const getOrderEquipments = React.useCallback(async () => {
        setBanner(`WCD 데이터 갱신 중...`)

        try{
            if (status.document) {
                console.log('getOrderEquipment');
                if (appContext.userId) {
                    console.log('getOrderEquipment1');
                    const equipments = await Repository.getOrderEquipments(
                        status.document.docKey,
                    )
                    console.log('equip:', equipments);
                    setWCDContents(equipments)
                }
            }
        } catch (e) {
            console.log('equ:', e);
        }

        setBanner(undefined)
    }, [appContext.userId, status.document])

    React.useEffect(() => {
        getOrderEquipments()
    }, [getOrderEquipments])

    const requestOrderEquipmentList = React.useCallback(() => {
        const value = {
            equipments: wcdContents,
            // selectedItems,
            // onMarkupCancel: () => {
            //     loadMarkup([], new Set<string>())
            // },
            // onMarkupView: (selectedItems: Set<string>) => {
            //     const paths: DrawingPath[] = []

            //     for (const markup of markupContents) {
            //         if (selectedItems.has(markup.seq)) {
            //             paths.push(...markup.paths)
            //         }
            //     }

            //     loadMarkup(paths, selectedItems)
            // },
            // onMarkupDelete: async (selectedItems: Set<string>) => {
            //     if (status.document) {
            //         if (appContext.userId) {
            //             const values: string[] = []

            //             if (value) {
            //                 for (const markup of value.markups) {
            //                     if (selectedItems.has(markup.seq)) {
            //                         values.push(markup.seq)
            //                     }
            //                 }
            //             }

            //             const body = {
            //                 docId: status.document.docKey.docId,
            //                 docVer: status.document.docKey.docVer,
            //                 plantCode: status.document.plantCode,
            //                 userId: appContext.userId,
            //                 seqs: values
            //             }

            //             await Repository.deleteMarkup(body)

            //             getMarkups()
            //         }
            //     }

            //     loadMarkup([], new Set<string>())
            // }
        }

        const ok = () => pushCommand({ name: 'viewMarkupList', value })

        // showConfirmMarkupSave(appContext.isMarkupChanged, ok)
    }, [
        // appContext.isMarkupChanged,
        appContext.userId,
        getOrderEquipments,
        wcdContents,
        // selectedItems,
        status.document
    ])

    // const requestLoadMarkupList = React.useCallback((setUndoRedoList) => {
    //     const value = {
    //         markups: markupContents,
    //         onMarkupLoad: (paths: DrawingPath[]) => {
    //             loadMarkup(paths, new Set<string>())
    //         },
    //         setUndoList: setUndoRedoList.setUndoList,
    //         setRedoList: setUndoRedoList.setRedoList
    //     }

    //     const ok = () => {
    //         pushCommand({ name: 'loadMarkupList', value })
    //     }
    //     showConfirmMarkupSave(appContext.isMarkupChanged, ok)
    // }, [appContext, markupContents, loadMarkup])

    // const requestUpdateMarkup = React.useCallback(()=> {
    //     const ok = () => {};
    //     showConfirmMarkupSave(appContext.isMarkupChanged, ok, '기존 마크업에 저장할까요?')
    // }, [appContext, markupContents]);

    React.useEffect(() => {
        if (controlMode == 'wcd') {
            entityPainter.setWCDEquipment(wcdContents);
        }
    }, [controlMode]);
    
    React.useEffect(() => {

    }, [wcdContents]);
    //     setHandler('requestSaveMarkup', async (value: {
    //         setRedoList: any
    //         setUndoList: any
    //         ok: () => void
    //         isUpdate: boolean
    //     }) => {
    //         pushCommand({
    //             name: 'showSaveMarkupView',
    //             value: { 
    //                 markupPaths, 
    //                 selectedDocument: status.document, 
    //                 ok: value.ok,
    //                 setUndoList: value.setUndoList,
    //                 setRedoList: value.setRedoList,
    //                 isUpdate: value.isUpdate
    //             }
    //         })
    //     })

    //     setHandler('requestViewMarkupList', async () => {
    //         requestViewMarkupList();
    //     })

    //     setHandler('requestLoadMarkupList', async (setUndoRedoList: {
    //         setUndoLIst: any
    //         setRedoList: any
    //     }) => {
    //         requestLoadMarkupList(setUndoRedoList);
    //     })

    //     setHandler('MarkupContentsChanged', async () => {
    //         await getMarkups();
    //     })

    //     setHandler('requestUpdateMarkup', async () => {
    //         requestUpdateMarkup();
    //     })
    
    return wcdContents
}
