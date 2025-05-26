import './index.css'
import { encrypt, decrypt } from '..'

export * from './Calendar'
export * from './fullScreen'
export * from './Select'
export * from './SelectDate'
export * from './TextField'
export * from './TreeView'
export * from './CommandListener'

export function updateQuery(key: string, value: string | undefined) {
    const urlParams = new URLSearchParams(window.location.search)
    const encValue = encrypt(value)

    if (encValue) {
        urlParams.set(key, decodeURIComponent(encValue))
    } else {
        urlParams.delete(key)
    }

    const newUrl = '?' + urlParams.toString()

    window.history.pushState(null, '', newUrl)
}

export function getQuery(key: string) {
    const urlParams = new URLSearchParams(window.location.search)
    const value = urlParams.get(key)

    return decrypt(value)
}
