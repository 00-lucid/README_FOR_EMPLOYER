import { DocumentKey } from '../types'
export * from './AppContext'
export * from './useStatus'
export * from './ThemeContext'

export type SelectedDocument = {
    docKey: DocumentKey
    plantCode: string
}

export function isEqualDocument(left: SelectedDocument | undefined, right: SelectedDocument | undefined): boolean {
    if (!left || !right) return false
    if (left.docKey.docId !== right.docKey.docId) return false
    if (left.docKey.docVer !== right.docKey.docVer) return false
    if (left.plantCode !== right.plantCode) return false

    return true
}
