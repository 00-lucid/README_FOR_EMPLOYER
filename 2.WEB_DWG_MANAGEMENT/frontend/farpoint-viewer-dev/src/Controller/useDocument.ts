import React from 'react'
import { useRecoilValue } from 'recoil'
// 전역 Store
import { StatusStore } from '../Store/statusStore'
// Lib
import { global } from '../Lib/util'

const useDocument = () => {
    global.log('useDocument.ts 읽힘')
    // 전역 Store
    const selectedDocKey = useRecoilValue(StatusStore.selectedDocKey)

    const documentCheckSelected = React.useCallback(
        (docId: string, docVer: string) => {
            if (docId + '_' + docVer === selectedDocKey) return true
            return false
        },
        [selectedDocKey]
    )

    return { documentCheckSelected }
}

export default useDocument
