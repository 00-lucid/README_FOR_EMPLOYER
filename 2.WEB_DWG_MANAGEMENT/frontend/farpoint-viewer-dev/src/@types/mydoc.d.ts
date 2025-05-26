type MydocFolder = {
    id: string
    folderName: string
    subfolders: MydocList[]
    documents: Mydoc[]
}

type Mydoc = {
    id: string
    filename: string
    size: number
    viewerUrl?: string
}