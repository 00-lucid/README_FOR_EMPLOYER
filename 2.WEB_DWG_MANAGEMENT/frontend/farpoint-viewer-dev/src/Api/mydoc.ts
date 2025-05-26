import crypt from '../Lib/crypt'
import api from './init'

export function mydocInformation(): Promise<{ editable: boolean }> {
    return api
        .get('/mydocs/info')
        .then(({ data }) => {
            return data
        })
        .catch((err) => {
            console.log(err)
            return null
        })
}

export function getMydocList(userId: string): Promise<MydocFolder[]> {
    return api
        .get(`mydocs/folders?userId=${crypt.encrypt(userId)}`)
        .then(({ data }) => {
            return data
        })
        .catch((err) => {
            console.log(err)
            return null
        })
}

export function deleteMydocFile(userId: string, fileId: string): Promise<void> {
    return api.delete(`/mydocs/files/${crypt.encrypt(fileId)}?userId=${crypt.encrypt(userId)}`)
}

export function addMydocFolder(userId: string, folderId: string, folderName: string): Promise<void> {
    const data = {
        folderName,
    }

    const body = JSON.stringify(data)

    return api
        .post(`/mydocs/folders/${crypt.encrypt(folderId)}?userId=${crypt.encrypt(userId)}`, body)
        .then(({ data }) => {
            return data
        })
        .catch((err) => {
            console.log(err)
            return null
        })
}

export function deleteMydocFolder(userId: string, folderId: string): Promise<void> {
    return api.delete(`/mydocs/folders/${crypt.encrypt(folderId)}?userId=${crypt.encrypt(userId)}`)
}

export function renameMydocFolder(userId: string, folderId: string, newName: string): Promise<void> {
    const data = {
        newName,
    }

    const body = JSON.stringify(data)

    return api.put(`/mydocs/folders/${crypt.encrypt(folderId)}?userId=${crypt.encrypt(userId)}`, body)
}

export function mydocFileUpload(userId: string, folderId: string, file: Blob): Promise<void> {
    var data = new FormData()
    data.append('mydocFile', file)
    data.append('folderId', crypt.encrypt(folderId) ?? '')

    return api.post(`/mydocs/files?userId=${crypt.encrypt(userId)}`, data)
}

export function mydocFileDownload(userId: string, id: string, fileName: string): void {
    window.open(
        `${api.getUri()}/mydocs/download/files?userId=${crypt.encrypt(userId)}&id=${crypt.encrypt(id)}&filename=${crypt.encrypt(fileName)}`
    )
}
