import { Shell } from 'common/Shell'
import { utils } from 'common/utils'
import { MydocList, Mydoc } from '../types'
import { MydocsRepository } from './'

const mydocLocalPath = process.env['MydocLocalPath'] as string

export class MydocsService {
    public static create(
        repo: MydocsRepository,
        docViewerUrl: string,
        mydocPath: string,
        mydocLocalPath: string,
        enableMydoc: boolean
    ): MydocsService {
        return new MydocsService(repo, docViewerUrl, mydocPath, mydocLocalPath, enableMydoc)
    }

    private readonly repo: MydocsRepository
    private readonly docViewerUrl: string
    private readonly mydocPath: string
    private readonly mydocLocalPath: string
    private readonly enableMydoc: boolean

    private constructor(
        repo: MydocsRepository,
        docViewerUrl: string,
        mydocPath: string,
        mydocLocalPath: string,
        enableMydoc: boolean
    ) {
        this.repo = repo
        this.docViewerUrl = docViewerUrl
        this.mydocPath = mydocPath
        this.mydocLocalPath = mydocLocalPath
        this.enableMydoc = enableMydoc
    }

    public canEdit(): boolean {
        return this.enableMydoc
    }

    public async getMydocs(userId: string): Promise<MydocList[]> {
        // 언제 user를 만들지 미정이라 무조건 만든다.
        try {
            await this.repo.addMydocs(userId)
        } catch (err) {
            console.log('already exists userId')
        }

        const allList = await this.repo.getMydocs(userId)

        updateViewerUrl(allList, userId, this.docViewerUrl, this.mydocPath)

        return allList
    }

    public async addFolder(userId: string, parentId: string, folderName: string): Promise<boolean> {
        if (!this.enableMydoc) return false

        const allList = await this.repo.getMydocs(userId)

        const folder = findFolder(allList, parentId)

        if (folder) {
            folder.subfolders.push({
                id: utils.uuid(),
                folderName,
                subfolders: [],
                documents: []
            })
        }

        return await this.repo.updateMydocs(userId, allList)
    }

    public async deleteFolder(userId: string, folderId: string): Promise<boolean> {
        if (!this.enableMydoc) return false

        const allList = await this.repo.getMydocs(userId)

        for (const list of allList) {
            const parent = findParentFolder(list, folderId)

            if (parent) {
                const newValue: MydocList[] = []

                for (const list of parent.subfolders) {
                    if (list.id !== folderId) {
                        newValue.push(list)
                    }
                }

                parent.subfolders = newValue

                return await this.repo.updateMydocs(userId, allList)
            }
        }

        return false
    }

    public async deleteFile(userId: string, fileId: string): Promise<boolean> {
        const allList = await this.repo.getMydocs(userId)

        const folder = findFolderByFileId(allList, fileId)

        if (folder) {
            const newValue: Mydoc[] = []

            for (const file of folder.documents) {
                if (file.id === fileId) {
                    const list = file.filename.split('.')
                    const ext = list.pop() ?? ''
                    const path = mydocFilePath(file.id, ext)

                    Path.remove(path)
                } else {
                    newValue.push(file)
                }
            }

            folder.documents = newValue

            return await this.repo.updateMydocs(userId, allList)
        }

        return false
    }

    public async renameFolder(userId: string, folderId: string, newName: string): Promise<boolean> {
        if (!this.enableMydoc) return false

        const allList = await this.repo.getMydocs(userId)

        const folder = findFolder(allList, folderId)

        if (folder) {
            folder.folderName = newName
        }

        return await this.repo.updateMydocs(userId, allList)
    }

    public async uploadFile(
        userId: string,
        folderId: string,
        tempFilePath: string,
        filename: string,
        size: number
    ): Promise<boolean> {
        if (!this.enableMydoc) return false

        const allList = await this.repo.getMydocs(userId)

        const folder = findFolder(allList, folderId)

        if (folder) {
            const id = utils.uuid()

            let uniqueName = filename

            for (let i = 1; i < 100; i++) {
                let exist = false

                for (const file of folder.documents) {
                    if (file.filename === uniqueName) {
                        exist = true
                        break
                    }
                }

                if (exist) {
                    const list = filename.split('.')
                    const ext = list.pop() ?? ''
                    const onlyname = list.join('.')

                    uniqueName = `${onlyname}(${i}).${ext}`
                } else {
                    break
                }
            }

            folder.documents.push({
                id,
                filename: uniqueName,
                size,
                viewerUrl: ''
            })

            const extension = filename.slice(filename.indexOf('.'))

            // Renaming files cannot be done cross-device.
            // My guess is that your upload directory (which by default is /tmp)
            // is on another partition/drive as your target directory (contained in the dir variable).
            // 위의 이유로 아래 코드는 에러 가능성이 있음
            // Path.move(tempFilePath, Path.join(this.mydocLocalPath, id + '.far'))
            const outputPath = Path.join(this.mydocLocalPath, id + extension)
            await Shell.exec(`move ${tempFilePath} ${outputPath}`)
        }

        return await this.repo.updateMydocs(userId, allList)
    }

    public async downloadFile(userId: string, id: string, filename: string): Promise<string> {
        // 파라미터 userId는 인증 작업을 위해 남겨 놓는다.
        let ext = filename.split('.').pop() as string
        return Path.join(this.mydocLocalPath, `${id}.${ext}`)
    }
}

const findFolder = (allList: MydocList[], folderId: string): MydocList | undefined => {
    for (const list of allList) {
        if (list.id === folderId) {
            return list
        } else {
            const res = findFolder(list.subfolders, folderId)

            if (res) return res
        }
    }

    return undefined
}

const findParentFolder = (parent: MydocList, childId: string): MydocList | undefined => {
    for (const list of parent.subfolders) {
        if (list.id === childId) {
            return parent
        } else {
            const res = findParentFolder(list, childId)

            if (res) return res
        }
    }

    return undefined
}

const findFolderByFileId = (allList: MydocList[], fileId: string): MydocList | undefined => {
    for (const list of allList) {
        for (const file of list.documents) {
            if (file.id === fileId) {
                return list
            }
        }

        const res = findFolderByFileId(list.subfolders, fileId)

        if (res) return res
    }

    return undefined
}

const updateViewerUrl = (allList: MydocList[], userId: string, docViewerUrl: string, mydocPath: string) => {
    for (const list of allList) {
        for (const info of list.documents) {
            let ext = info.filename.split('.').pop()

            if (ext) {
                ext = ext.toUpperCase()
            } else {
                ext = ''
            }

            const filepath = `filepath=${mydocPath}/${info.id + '.' + ext}&filename=${
                info.id
            }&fileext=${ext}&viewerselect=image&username=${userId}`

            const url = docViewerUrl + '?' + filepath
            info.viewerUrl = url
        }

        updateViewerUrl(list.subfolders, userId, docViewerUrl, mydocPath)
    }
}

function mydocFilePath(fileId: string, ext: string): string {
    return Path.join(mydocLocalPath, fileId + '.' + ext)
}
