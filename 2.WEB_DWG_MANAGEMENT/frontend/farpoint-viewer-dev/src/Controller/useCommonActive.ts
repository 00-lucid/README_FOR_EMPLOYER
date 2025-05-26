import { global } from '../Lib/util'

const commonActive = {
    // 선택된 설비 캔버스 색상 변경 처리
    canvasHandlesPaint: async (
        selectedCanvas: CanvasContext,
        equipemntTagId: string,
        entityPainter: any,
        colorElements: Map<string, any>,
        canvasController?: any
    ) => {
        const handles: string[] = []

        const value = selectedCanvas.equipmentByTagId.get(equipemntTagId)
        if (value) {
            for (const handle of value.handles) {
                handles.push(handle.handle)
            }
        }
        // entityPainter.setSelectedHandles(handles)
        entityPainter.setSelectedHandlesByColor(handles, colorElements)

        if (canvasController) canvasController.zoomEntity(handles)
    },
    // 사이드 메뉴 변경 이벤트
    onMenuChange: (
        menuId: string,
        userId: string | undefined,
        setCurrentMenu: (valOrUpdater: string | ((currVal: string) => string)) => void
    ) => {
        global.log('onMenuChange', menuId, userId)

        if (userId && 0 < userId.length) {
            setCurrentMenu((prev: string) => {
                return prev === menuId ? '' : menuId
            })
        }
    },
    // 도면 즐겨찾기 삭제
    removeDocumentFavorite: async (
        docId: string,
        docVer: string,
        userContext: UserContext | undefined,
        userId: string | undefined,
        Api: any,
        setUserContext: any
    ) => {
        if (userContext && userId) {
            for (let i = 0; i < userContext.favorite.documents.length; i++) {
                const item = userContext.favorite.documents[i]

                if (item.docId === docId && item.docVer === docVer) {
                    const newDocs = userContext.favorite.documents.slice()
                    newDocs.splice(i, 1)

                    const newValue = { ...userContext, favorite: { ...userContext.favorite, documents: newDocs } }

                    await Api.auth.setUserContext(userId, newValue)
                    setUserContext(newValue)
                }
            }
        }
    },

    // 설비 즐겨찾기 삭제
    removeEquipmentFavorite: async (
        docId: string,
        docVer: string,
        userContext: UserContext | undefined,
        userId: string | undefined,
        Api: any,
        setUserContext: any,
        tagId: string
    ) => {
        if (!userContext || !userId) return

        global.log('removeDocumentFavorite:', docId, docVer, userContext, userId, Api, setUserContext, tagId)
        const newUserContext = {
            ...userContext,
            favorite: {
                ...userContext.favorite,
                equipments: userContext.favorite.equipments.filter(
                    (equipment) => !(equipment.docId === docId && equipment.docVer === docVer && equipment.tagId === tagId)
                ),
            },
        }
        await Api.auth.setUserContext(userId, newUserContext)
        setUserContext(newUserContext)
    },

    // PLD 도면 변경사항 저장
    savePld: async (
        documentCtx: DocumentContext,
        currentPld: PldInfo,
        pldDocumentList: PldDocument[],
        pldEquipList: PldEquipment[],
        pldSimbolList: pldSimbolList[],
        Api: any,
        crypt: any,
        setBanner: (message: string | undefined) => void,
        setPivotProcessListHash: (valOrUpdater: string | ((currVal: string) => string)) => void,
        setPivotSimbolListHash: (valOrUpdater: string | ((currVal: string) => string)) => void
    ) => {
        const { docId, docVer } = documentCtx
        const { PLD_C_ID, PLD_C_VR } = currentPld
        const pldDocument = pldDocumentList.filter((el) => el.DOCNO === docId && el.DOCVR === docVer)[0]

        setBanner('저장 중...')
        const entitiesList = []
        const simbolList = []

        for (let i = 0; i < pldEquipList.length; i++) {
            const handle = pldEquipList[i].handle
            const type = pldEquipList[i].type

            const temp: Entities = {
                PLD_C_ID,
                PLD_C_VR,
                PLD_C_SEQ: pldDocument.PLD_C_SEQ,
                DOCNO: docId,
                DOCVR: docVer,
                HANDLE: handle,
                HANDLE_TYPE: 'entity',
                TYPE: type,
                FUNCTION: handle,
            }

            entitiesList.push(temp)
        }

        for (let i = 0; i < pldSimbolList.length; i++) {
            const svg = pldSimbolList[i]
            const temp = {
                PLD_C_ID,
                PLD_C_VR,
                DOCNO: docId,
                DOCVR: docVer,
                SEQ: svg.seq,
                PLD_C_SEQ: pldDocument.PLD_C_SEQ,
                TYPE: svg.type,
                POINT1_X: svg.point1X,
                POINT1_Y: svg.point1Y - 2.8,
                POINT1_Z: 0,
                RADPT_X: svg.radptX / 10 > 0.1 ? svg.radptX / 10 : 0.1,
                RADPT_Y: svg.radptY / 10 > 0.1 ? svg.radptY / 10 : 0.1,
                RADPT_Z: 1,
                ROTATION: 0,
            }
            simbolList.push(temp)
        }

        global.log('savePld:', currentPld, entitiesList)

        if (entitiesList.length !== 0) {
            setBanner('엔티티 저장 중...')
            await Api.pld.addEntitiesList(entitiesList)
        }
        if (simbolList.length !== 0) {
            setBanner('심볼 저장 중...')
            await Api.pld.addSimbolList(simbolList)
        }

        // 저장할 때 피벗 초기화
        setPivotProcessListHash(crypt.CryptoJS.SHA256(JSON.stringify(pldEquipList)).toString())
        setPivotSimbolListHash(crypt.CryptoJS.SHA256(JSON.stringify(pldSimbolList)).toString())

        setBanner(undefined)
    },
}
export default commonActive
