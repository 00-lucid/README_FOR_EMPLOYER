import React, { createContext } from 'react'
// Lib
import crypt from '../Lib/crypt'
// Api
import Api from '../Api'

const AppContext = createContext<AppContextType | null>(null)
/*
  description : 사용자, 사용자 컨텍스트(정보), 
*/
const AppContextProvider = ({ children }: Children) => {
    const [userContext, setUserContext] = React.useState<UserContext>()
    const [userId, setUserId] = React.useState<string>()
    const [isMarkupChanged, setMarkupChanged] = React.useState(false)
    const [pldMode, setPldMode] = React.useState(false)
    const [currentPld, setCurrentPld] = React.useState<PldInfo | null>(null)
    const [pldDocumentList, setPldDocumentList] = React.useState<PldDocument[]>([])

    const [controlMode, setControlMode] = React.useState<string>(pldMode ? 'pld' : 'select')

    const urlParams = new URLSearchParams(window.location.search)
    const userParam = urlParams.get('user')

    // 사용자 --
    // 사용자 설정. -> value from full.html
    if (userParam) {
        const output = crypt.decrypt(userParam)

        if (userId !== output) {
            setUserId(output)
        }
    }
    // 사용자 정보 설정
    React.useEffect(() => {
        async function fetchData() {
            if (userId) {
                const res = await Api.auth.getUserContext(userId)
                setUserContext(res)
                // ?? 아래 행위는 왜 하는거죠?..
                // await Api.auth.hasAuthorization(userId)
            }
        }
        fetchData()
    }, [userId])

    // PLD --
    // PLD 도면 리스트 셋팅 -> 어디에 사용하는지 아직 모름..
    React.useEffect(() => {
        async function fetchData() {
            if (null !== currentPld && pldMode) {
                //const res = await Api.document.getPldDocumentList(currentPld?.PLD_C_ID, currentPld?.PLD_C_VR)
                //setPldDocumentList(res)
            }
        }
        fetchData()
    }, [currentPld, pldMode])
    // PLD 도면중 가장 첫번째 도면을 로드
    React.useEffect(() => {
        if (0 < pldDocumentList.length) {
            // pushCommand({
            //   name: 'requestOpenDocument',
            //   value: {
            //     selectedDocument: {
            //       docKey: { docId: pldDocumentList[0].DOCNO, docVer: pldDocumentList[0].DOCVR },
            //       plantCode: pldDocumentList[0].PLANTCODE
            //     },
            //     ok: () => {
            //       pushCommand({ name: 'zoomExtents' })
            //     }
            //   }
            // })
        }
    }, [pldDocumentList])

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
                    await Api.auth.setUserContext(userId, newValue)
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
                            await Api.auth.setUserContext(userId, newValue)
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
                    await Api.auth.setUserContext(userId, newValue)
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
                            await Api.auth.setUserContext(userId, newValue)
                        }

                        setUserContext(newValue)
                    }
                }
            }
        },
        [userContext, userId]
    )

    const value = {
        AppCtxStates: { userId, pldMode, userContext, isMarkupChanged, currentPld, pldDocumentList, controlMode },
        AppCtxActions: {
            addDocumentFavorite,
            removeDocumentFavorite,
            addEquipmentFavorite,
            removeEquipmentFavorite,
            setMarkupChanged,
            togglePldMode,
            setCurrentPld,
            setPldDocumentList,
            setControlMode,
        },
    }
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
export { AppContext, AppContextProvider }
