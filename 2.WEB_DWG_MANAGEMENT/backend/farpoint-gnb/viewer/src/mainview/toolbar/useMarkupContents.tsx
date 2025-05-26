import React from 'react'
import Repository from '../../Repository'
import {
    setBanner,
    pushCommand,
    setHandler,
    showConfirmMarkupSave,
    AppContext,
    DrawingPath,
    MarkupContent,
    StatusContext
} from '../..'

export function useMarkupContents(
    markupPaths: DrawingPath[],
    selectedItems: Set<string>,
    loadMarkup: (markupPaths: DrawingPath[], selectedItems: Set<string>) => void
) {
    const appContext = React.useContext(AppContext)
    const status = React.useContext(StatusContext)

    const [markupContents, setMarkupContents] = React.useState<MarkupContent[]>([])

    const getMarkups = React.useCallback(async () => {
        if (status.document && !appContext.pldMode) {
            if (appContext.userId) {
                const markups = await Repository.getMarkups(
                    appContext.userId,
                    status.document.docKey,
                    status.document.plantCode
                )
                if (markups) {
                    setBanner(`마크업 갱신 중...`)
                    setMarkupContents(markups)
                    setBanner(undefined)
                }
            }
        }
    }, [appContext.pldMode, appContext.userId, status.document])

    React.useEffect(() => {
        getMarkups()
    }, [getMarkups])

    const requestViewMarkupList = React.useCallback(() => {
        const value = {
            markups: markupContents,
            selectedItems,
            onMarkupCancel: () => {
                loadMarkup([], new Set<string>())
            },
            onMarkupView: (selectedItems: Set<string>) => {
                const paths: DrawingPath[] = []

                for (const markup of markupContents) {
                    if (selectedItems.has(markup.seq)) {
                        paths.push(...markup.paths)
                    }
                }

                loadMarkup(paths, selectedItems)
            },
            onMarkupDelete: async (selectedItems: Set<string>) => {
                if (status.document) {
                    if (appContext.userId) {
                        const values: string[] = []

                        if (value) {
                            for (const markup of value.markups) {
                                if (selectedItems.has(markup.seq)) {
                                    values.push(markup.seq)
                                }
                            }
                        }

                        const body = {
                            docId: status.document.docKey.docId,
                            docVer: status.document.docKey.docVer,
                            plantCode: status.document.plantCode,
                            userId: appContext.userId,
                            seqs: values
                        }

                        await Repository.deleteMarkup(body)

                        getMarkups()
                    }
                }

                loadMarkup([], new Set<string>())
            }
        }

        const ok = () => pushCommand({ name: 'viewMarkupList', value })

        showConfirmMarkupSave(appContext.isMarkupChanged, ok)
    }, [
        appContext.isMarkupChanged,
        appContext.userId,
        getMarkups,
        loadMarkup,
        markupContents,
        selectedItems,
        status.document
    ])

    const requestLoadMarkupList = React.useCallback(
        (setUndoRedoList) => {
            const value = {
                markups: markupContents,
                onMarkupLoad: (paths: DrawingPath[]) => {
                    loadMarkup(paths, new Set<string>())
                },
                setUndoList: setUndoRedoList.setUndoList,
                setRedoList: setUndoRedoList.setRedoList
            }

            const ok = () => {
                pushCommand({ name: 'loadMarkupList', value })
            }
            showConfirmMarkupSave(appContext.isMarkupChanged, ok)
        },
        [appContext, markupContents, loadMarkup]
    )

    const requestUpdateMarkup = React.useCallback(() => {
        const ok = () => {}
        showConfirmMarkupSave(appContext.isMarkupChanged, ok, '기존 마크업에 저장할까요?')
    }, [appContext, markupContents])

    React.useEffect(() => {
        setHandler(
            'requestSaveMarkup',
            async (value: { setRedoList: any; setUndoList: any; ok: () => void; isUpdate: boolean }) => {
                pushCommand({
                    name: 'showSaveMarkupView',
                    value: {
                        markupPaths,
                        selectedDocument: status.document,
                        ok: value.ok,
                        setUndoList: value.setUndoList,
                        setRedoList: value.setRedoList,
                        isUpdate: value.isUpdate
                    }
                })
            }
        )

        setHandler('requestViewMarkupList', async () => {
            requestViewMarkupList()
        })

        setHandler('requestLoadMarkupList', async (setUndoRedoList: { setUndoLIst: any; setRedoList: any }) => {
            requestLoadMarkupList(setUndoRedoList)
        })

        setHandler('MarkupContentsChanged', async () => {
            await getMarkups()
        })

        setHandler('requestUpdateMarkup', async () => {
            requestUpdateMarkup()
        })
    }, [getMarkups, markupPaths, requestLoadMarkupList, requestViewMarkupList, status.document])

    return markupContents
}
