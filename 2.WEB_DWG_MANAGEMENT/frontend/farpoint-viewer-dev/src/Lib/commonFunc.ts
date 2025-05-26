import { NavigateFunction } from 'react-router-dom'

const commonFunc = {
    // return 선택된 libId에 handles
    getHandlesByLibId: (selectedCanvas: CanvasContext, libId: string) => {
        const handles: string[] = []
        if (selectedCanvas) {
            if (libId === 'all') {
                handles.push(...Array.from(selectedCanvas.registeredHandles))
            } else if (libId) {
                const values = selectedCanvas.handlesByLibId.get(libId)

                if (values) {
                    handles.push(...values)
                }
            }
        }

        return handles
    },
    // return 변경할 libId
    checkLibId: (oldLibId: string | undefined, newLibId: string | undefined) => {
        let libId
        if (oldLibId !== newLibId) {
            libId = newLibId
        }
        return libId
    },
    // 설비 데이터 가공
    getEquipmentsByHandle: (lists: EquipmentList[], set: Map<string, EquipmentContext[]>) => {
        for (const list of lists) {
            for (const equip of list.equipments) {
                if (equip.handles) {
                    for (const eqHandle of equip.handles) {
                        const value = set.get(eqHandle.handle)

                        if (value) {
                            const newVal = value.slice()
                            newVal.push(equip)

                            set.set(eqHandle.handle, newVal)
                        } else {
                            set.set(eqHandle.handle, [equip])
                        }
                    }
                }
            }

            commonFunc.getEquipmentsByHandle(list.subfolders, set)
        }
    },

    getEquipmentByTagId: (lists: EquipmentList[], set: Map<string, EquipmentContext>) => {
        for (const list of lists) {
            for (const equip of list.equipments) {
                set.set(equip.tagId, equip)
            }

            commonFunc.getEquipmentByTagId(list.subfolders, set)
        }
    },

    getAllHandles: (lists: EquipmentList[], handles: Set<string>) => {
        for (const list of lists) {
            for (const equip of list.equipments) {
                if (equip.handles) {
                    for (const eqHandle of equip.handles) {
                        handles.add(eqHandle.handle)
                    }
                }
            }

            commonFunc.getAllHandles(list.subfolders, handles)
        }
    },

    getHandlesByEquipmentListAndLibId: (lists: EquipmentList[], set: Map<string, string[]>) => {
        for (const list of lists) {
            const handles: string[] = []

            for (const equip of list.equipments) {
                if (equip.handles) {
                    equip.handles.forEach((element) => {
                        handles.push(element.handle)
                    })
                }
            }

            const handleSet = new Set<string>()

            commonFunc.getAllHandles(list.subfolders, handleSet)
            handles.push(...Array.from(handleSet))

            set.set(list.libId, handles)

            commonFunc.getHandlesByEquipmentListAndLibId(list.subfolders, set)
        }
    },

    getParentIdByLibId: (lists: EquipmentList[], map: Map<string, string>) => {
        for (const list of lists) {
            map.set(list.libId, list.parentId)
            commonFunc.getParentIdByLibId(list.subfolders, map)
        }
    },

    updateEquipFolderIds: (selectedCanvas: CanvasContext, newSelectedIds: Set<string>, libId: string) => {
        const parentId = selectedCanvas.parentIdByLibId.get(libId)
        if (parentId) {
            const keyString = libId + parentId
            if (!newSelectedIds.has(keyString)) {
                newSelectedIds.add(keyString)
            }
            commonFunc.updateEquipFolderIds(selectedCanvas, newSelectedIds, parentId)
        }
    },
    changeDocument: (
        docId: string | undefined,
        docVer: string | undefined,
        plantCode: string | undefined,
        tagId: string | undefined,
        isMarkupChanged: boolean,
        setIsShowMarkupPopup: (
            valOrUpdater: MarkupPopupValue | ((currVal: MarkupPopupValue | undefined) => MarkupPopupValue | undefined) | undefined
        ) => void,
        navigate: NavigateFunction,
        setYesNoPopupValue: (
            valOrUpdater: YesNoPopupValue | ((currVal: YesNoPopupValue | undefined) => YesNoPopupValue | undefined) | undefined
        ) => void
    ) => {
        // Event : MainView/Canvas/index.tsx -> 2. URL Params를 통해 도면 & 설비 설정
        let location = `?drawing=${docId}&revision=${docVer}&plant=${plantCode}`
        if (tagId) location += `&equip=${tagId}`
        if (!docId || !docVer || !plantCode) location = '/'

        // 마크업 변경사항 있다면 저장후 이동.
        if (isMarkupChanged) {
            const confirmValue = {
                message: '변경된 마크업을 저장할까요?',
                yes: () => {
                    setIsShowMarkupPopup({
                        message: 'save',
                        nextAction: () => {
                            navigate(location)
                        },
                    })
                },
                no: () => {
                    navigate(location)
                },
            }
            setYesNoPopupValue(confirmValue)
        } else {
            navigate(location)
        }
    },

    changeDocumentForPld: (
        docId: string | undefined,
        docVer: string | undefined,
        plantCode: string | undefined,
        navigate: NavigateFunction
    ) => {
        // Event : MainView/Canvas/index.tsx -> 2. URL Params를 통해 도면 & 설비 설정
        let location = `?drawing=${docId}&revision=${docVer}&plant=${plantCode}`
        if (!docId || !docVer || !plantCode) location = '/'

        navigate(location)
    },
}
export default commonFunc
