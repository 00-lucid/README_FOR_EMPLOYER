import React, { createContext } from 'react'
import { global } from '../Lib/util'
const StatusContext = createContext<StatusContextType | null>(null)

/*
  description : 현재 상태 컨텍스트, 
*/
const StatusContextProvider = ({ children }: Children) => {
    const [currentMenu, setCurrentMenu] = React.useState('') // 선택된 사이드 메뉴
    const [canvases, setCanvases] = React.useState<CanvasContext[]>([]) // 저장하고 있을 도면 목록
    const [selectedCanvas, setSelectedCanvas] = React.useState<CanvasContext>() // 선택된 도면 정보
    const [selectedDocFile, setSelectedDocFile] = React.useState<Uint8Array>() // 선택된 도면
    const [selectEquipment, setSelectEquipment] = React.useState<EquipmentContext>()

    /*
        selectedIds => 
            도면 폴더 : (key : documentObj.folderName + documentObj.parentId)
            설비 폴더 : (key : equipmentObj.libId + equipmentObj.parentId)
            도면 : (key : 'document', value: docId + '_' + docVer)
            설비 : (key : 'equipment', value: equipment.tagId)
        desc. 현재 선택한 (폴더, 도면, 설비)를 저장하기 위한 상태값.
    */
    const [selectedIds, setSelectedIds] = React.useState(new Set<string>()) // 사이드 도면 메뉴/트리뷰/선택ID(key : documentObj.folderName + documentObj.parentId)

    // libId => (선택된 설비 ID) || 'all' || undefined
    // desc. 선택된 카테고리의 설비들의 색상을 변경하기 위한 상태값
    const [libId, setLibId] = React.useState<string>()

    // Event
    // 사이드 선택 메뉴 변경
    const onMenuChange = React.useCallback((menuId: string, userId: string | undefined) => {
        global.log('onMenuChange', menuId, userId)
        if (userId && 0 < userId.length) {
            setCurrentMenu((prev: string) => {
                return prev === menuId ? '' : menuId
            })
        }
    }, [])

    const value = {
        StatusCtxStates: { currentMenu, selectedIds, canvases, selectedCanvas, selectedDocFile, libId, selectEquipment },
        StatusCtxActions: {
            setCurrentMenu,
            onMenuChange,
            setSelectedIds,
            setCanvases,
            setSelectedCanvas,
            setSelectedDocFile,
            setLibId,
            setSelectEquipment,
        },
    }
    return <StatusContext.Provider value={value}>{children}</StatusContext.Provider>
}

export { StatusContext, StatusContextProvider }
