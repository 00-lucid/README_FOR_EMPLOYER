import { atom, selector } from 'recoil'
import { StatusStore } from './statusStore'
const AppStore = {
    userId: atom<string | undefined>({
        key: 'userId',
        default: '',
    }),
    userContext: atom<UserContext | undefined>({
        key: 'userContext',
        default: undefined,
    }),

    isFavorite: selector({
        key: 'isFavorite',
        get: ({ get }) => {
            const userContext = get(AppStore.userContext)
            const selectedCanvas = get(StatusStore.selectedCanvas)
            const selectEquipments = get(StatusStore.selectEquipments)
            if (userContext && selectedCanvas) {
                for (const value of userContext.favorite.equipments) {
                    if (
                        value.docId === selectedCanvas.documentCtx.docId &&
                        value.docVer === selectedCanvas.documentCtx.docVer &&
                        selectEquipments.has(value.tagId)
                    ) {
                        return true
                    }
                }
            }
            return false
        },
    }),
}

export default AppStore
