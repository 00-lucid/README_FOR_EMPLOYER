import { pushCommand } from '..'

export * from './PopupView'
export * from './BannerView'

export const showConfirmMarkupSave = (isMarkupChanged: boolean, ok: () => void, isUpdate?: string) => {
    const okWrap = () => {
        if (isUpdate) pushCommand({ name: 'clearMarkup' })
        ok()
    }

    if (isMarkupChanged) {
        if (isUpdate) {
            const confirmValue = {
                message: isUpdate,
                yes: () => pushCommand({ name: 'requestSaveMarkup', value: { ok: ok, isUpdate: true } }),
                no: () => pushCommand({ name: 'requestSaveMarkup', value: { ok: ok, isUpdate: false } })
            }
            pushCommand({ name: 'requestYesNo', value: confirmValue })
        } else {
            const confirmValue = {
                message: '변경된 마크업을 저장할까요?',
                yes: () => {
                    pushCommand({ name: 'requestSaveMarkup', value: { ok: okWrap } })
                },
                no: okWrap
            }

            pushCommand({ name: 'requestYesNo', value: confirmValue })
        }
    } else {
        okWrap()
    }
}
