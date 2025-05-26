import React from 'react'
import {
    decrypt,
    DocumentKey,
    UserContext,
    FavoriteDocument,
    FavoriteEquipment,
    EquipmentKey,
    useCommandListener,
    PldInfo,
    pushCommand
} from '..'
import Repository from '../Repository'
import { PldDocument } from '../types'

export type AppContextType = {
    addDocumentFavorite: (value: FavoriteDocument) => void
    removeDocumentFavorite: (value: DocumentKey) => void
    addEquipmentFavorite: (value: FavoriteEquipment) => void
    removeEquipmentFavorite: (docKey: DocumentKey, value: EquipmentKey) => void
    userId: string | undefined
    userContext: UserContext | undefined
    currentMarkup: any
    setCurrentMarkup: (value: any) => void
    pldMode: boolean
    isMarkupChanged: boolean
    setMarkupChanged: (value: boolean) => void
    listener: {}
    togglePldMode: () => void
    currentPld: PldInfo | null
    setCurrentPld: (pld: PldInfo | null) => void
    // selectedItem: SelectedItem
    pldDocumentList: PldDocument[]
    setPldDocumentList: (list: any[]) => void
}

const defaultValue = {
    addDocumentFavorite: (value: FavoriteDocument) => {},
    removeDocumentFavorite: (value: DocumentKey) => {},
    addEquipmentFavorite: (value: FavoriteEquipment) => {},
    removeEquipmentFavorite: (docKey: DocumentKey, value: EquipmentKey) => {},
    userId: undefined,
    userContext: undefined,
    currentMarkup: [],
    setCurrentMarkup: (value: any) => {},
    pldMode: false,
    isMarkupChanged: false,
    setMarkupChanged: (value: boolean) => {},
    listener: {},
    togglePldMode: () => {},
    currentPld: {},
    setCurrentPld: (pld: PldInfo) => {},
    setPldDocumentList: (list: any[]) => {}
    // selectedItem: nullSelectedItem
} as AppContextType

export const AppContext = React.createContext(defaultValue)

export function useAppContext() {
    const [userContext, setUserContext] = React.useState<UserContext>()
    const [userId, setUserId] = React.useState<string>()
    const [isMarkupChanged, setMarkupChanged] = React.useState(false)
    const [currentMarkup, setCurrentMarkup] = React.useState([])
    const [pldMode, setPldMode] = React.useState(false)
    const [currentPld, setCurrentPld] = React.useState<PldInfo | null>(null)
    const [pldDocumentList, setPldDocumentList] = React.useState<PldDocument[]>([])

    const urlParams = new URLSearchParams(window.location.search)
    const value = urlParams.get('user')

    if (value) {
        const output = decrypt(value)

        if (userId !== output) {
            setUserId(output)
        }
    }

    React.useEffect(() => {
        if (null !== currentPld && pldMode) {
            Repository.getPldDocumentList(currentPld?.PLD_C_ID, currentPld?.PLD_C_VR).then((res) => {
                setPldDocumentList(res)
            })
        }
    }, [currentPld, pldMode])

    React.useEffect(() => {
        if (0 < pldDocumentList.length) {
            pushCommand({
                name: 'requestOpenDocument',
                value: {
                    selectedDocument: {
                        docKey: { docId: pldDocumentList[0].DOCNO, docVer: pldDocumentList[0].DOCVR },
                        plantCode: pldDocumentList[0].PLANTCODE
                    },
                    ok: () => {
                        pushCommand({ name: 'zoomExtents' })
                    }
                }
            })
        }
    }, [pldDocumentList])

    React.useEffect(() => {
        async function fetchData() {
            if (userId) {
                const res = await Repository.getUserContext(userId)
                setUserContext(res)

                await Repository.hasAuthorization(userId)
            }
        }

        // fetchData()
    }, [userId])

    const togglePldMode = React.useCallback(() => {
        setPldMode((prev) => !prev)
    }, [])

    const addDocumentFavorite = React.useCallback(
        async (value: FavoriteDocument) => {
            if (userContext) {
                for (let i = 0; i < userContext.favorite.documents.length; i++) {
                    const item = userContext.favorite.documents[i]

                    if (item.docId === value.docId && item.docVer === value.docVer) return
                }

                const newDocs = userContext.favorite.documents.slice()
                newDocs.unshift(value)

                const newValue = { ...userContext, favorite: { ...userContext.favorite, documents: newDocs } }

                if (userId) {
                    await Repository.setUserContext(userId, newValue)
                }

                setUserContext(newValue)
            }
        },
        [userContext, userId]
    )

    const removeDocumentFavorite = React.useCallback(
        async (value: DocumentKey) => {
            if (userContext) {
                for (let i = 0; i < userContext.favorite.documents.length; i++) {
                    const item = userContext.favorite.documents[i]

                    if (item.docId === value.docId && item.docVer === value.docVer) {
                        const newDocs = userContext.favorite.documents.slice()
                        newDocs.splice(i, 1)

                        const newValue = { ...userContext, favorite: { ...userContext.favorite, documents: newDocs } }

                        if (userId) {
                            await Repository.setUserContext(userId, newValue)
                        }
                        setUserContext(newValue)
                    }
                }
            }
        },
        [userContext, userId]
    )

    const addEquipmentFavorite = React.useCallback(
        async (value: FavoriteEquipment) => {
            if (userContext) {
                for (let i = 0; i < userContext.favorite.equipments.length; i++) {
                    const item = userContext.favorite.equipments[i]

                    if (item.docId === value.docId && item.docVer === value.docVer && item.tagId === value.tagId) return
                }

                const newDocs = userContext.favorite.equipments.slice()
                newDocs.unshift(value)

                const newValue = { ...userContext, favorite: { ...userContext.favorite, equipments: newDocs } }

                if (userId) {
                    await Repository.setUserContext(userId, newValue)
                }

                setUserContext(newValue)
            }
        },
        [userContext, userId]
    )

    const removeEquipmentFavorite = React.useCallback(
        async (docKey: DocumentKey, value: EquipmentKey) => {
            if (userContext) {
                for (let i = 0; i < userContext.favorite.equipments.length; i++) {
                    const item = userContext.favorite.equipments[i]

                    if (item.docId === docKey.docId && item.docVer === docKey.docVer && item.tagId === value.tagId) {
                        const newDocs = userContext.favorite.equipments.slice()
                        newDocs.splice(i, 1)

                        const newValue = { ...userContext, favorite: { ...userContext.favorite, equipments: newDocs } }

                        if (userId) {
                            await Repository.setUserContext(userId, newValue)
                        }

                        setUserContext(newValue)
                    }
                }
            }
        },
        [userContext, userId]
    )

    const listener = useCommandListener()

    // const selectedItem = useSelectedItem()

    // React.useEffect(() => {
    //     setHandler(
    //         'requestOpenDocument',
    //         async (value: { selectedDocument: SelectedDocument | undefined; ok?: () => void }) => {
    //             const isEqual = isEqualDocument(value.selectedDocument, selectedItem.document)

    //             if (isEqual) {
    //                 if (value.ok) {
    //                     value.ok()
    //                 }
    //             } else if (value.selectedDocument) {
    //                 const ok = () => {
    //                     pushCommand({ name: 'openDocument', value: value.selectedDocument })

    //                     if (value.ok) value.ok()
    //                 }

    //                 showConfirmMarkupSave(isMarkupChanged, ok)
    //             }
    //         }
    //     )
    // }, [isMarkupChanged, selectedItem.document])

    return {
        addDocumentFavorite,
        removeDocumentFavorite,
        addEquipmentFavorite,
        removeEquipmentFavorite,
        userId,
        pldMode,
        userContext,
        isMarkupChanged,
        setMarkupChanged,
        listener,
        currentMarkup,
        setCurrentMarkup,
        currentPld,
        togglePldMode,
        setCurrentPld,
        // selectedItem
        pldDocumentList,
        setPldDocumentList
    }
}
