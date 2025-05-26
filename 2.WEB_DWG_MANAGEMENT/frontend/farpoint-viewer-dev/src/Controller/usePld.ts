import React from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore, PldStore } from '../Store/statusStore'
// Api
import Api from '../Api'
// Lib
import crypt from '../Lib/crypt'
import { global } from '../Lib/util'

const usePld = () => {
    // 전역 Store
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const currentPld = useRecoilValue(PldStore.currentPld)
    const pldDocumentList = useRecoilValue(PldStore.pldDocumentList) // PLD 도면 리스트
    const setPivotSimbolListHash = useSetRecoilState(PldStore.pivotSimbolListHash) // PLD 심볼 hash (변경사항 확인 문자열)
    const setPivotProcessListHash = useSetRecoilState(PldStore.pivotProcessListHash) // PLD 심볼 hash (변경사항 확인 문자열)
    const pldEquipList = useRecoilValue(PldStore.pldEquipList)
    const pldSimbolList = useRecoilValue(PldStore.pldSimbolList)
    const setBanner = useSetRecoilState(StatusStore.banner)

    // PLD 도면 변경사항 저장
    const savePld = React.useCallback(async () => {
        const documentCtx = selectedCanvas?.documentCtx
        if (!documentCtx || currentPld === undefined) return

        const { docId, docVer } = documentCtx
        const { PLD_C_ID, PLD_C_VR } = currentPld
        const pldDocument = pldDocumentList.filter((el) => el.DOCNO === docId && el.DOCVR === docVer)[0]

        setBanner('저장 중...')
        const entitiesList = []
        const simbolList = []

        for (let i = 0; i < pldEquipList.length; i++) {
            const handle = pldEquipList[i].handle
            const type = pldEquipList[i].type

            const temp = {
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
                SEQ: svg.seq,
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

        setBanner('엔티티 저장 중...')
        await Api.pld.addEntitiesList({
            PLD_C_ID,
            PLD_C_VR,
            PLD_C_SEQ: pldDocument.PLD_C_SEQ,
            DOCNO: docId,
            DOCVR: docVer,
            entitiesList,
        })

        setBanner('심볼 저장 중...')
        await Api.pld.addSimbolList({
            PLD_C_ID,
            PLD_C_VR,
            PLD_C_SEQ: pldDocument.PLD_C_SEQ,
            DOCNO: docId,
            DOCVR: docVer,
            simbolList,
        })

        // 저장할 때 피벗 초기화
        setPivotProcessListHash(crypt.CryptoJS.SHA256(JSON.stringify(pldEquipList)).toString())
        setPivotSimbolListHash(crypt.CryptoJS.SHA256(JSON.stringify(pldSimbolList)).toString())

        setBanner(undefined)
    }, [
        selectedCanvas?.documentCtx,
        setPivotProcessListHash,
        setPivotSimbolListHash,
        pldSimbolList,
        currentPld,
        pldDocumentList,
        pldEquipList,
        setBanner,
    ])

    return { savePld }
}

export default usePld
