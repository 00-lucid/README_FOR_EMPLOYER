type Props = {
    id: string
    items: SelectItem[]
    placeHolder: string
    value: string
    onChange: (value: string) => void
}

type RelatedFolder = {
    TEXT: string
    VALUE: string
    SEQ: string
}

type RelatedSearchResult = {
    DOKAR: string
    DOKNR: string
    DOKTL: string
    DOKVR: string
    DKTXT: string
    ZZCHANGEDATE: string
    EGUBUN: string
    FGUBUN: string
    DOKARNM: string
    // files: RelatedFileInfo[]
}

type RelatedFileInfo = {
    DOKAR: string
    DOKVR: string
    DOKTL: string
    DOKNR: string
    FILENAME: string
    DAPPL: string
    FILE_IDX: number
    viewerUrl?: string
}
