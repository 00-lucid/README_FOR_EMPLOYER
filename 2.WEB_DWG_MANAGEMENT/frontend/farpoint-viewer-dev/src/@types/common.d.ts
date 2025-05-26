type SelectItem = {
    value: string
    text: string
}

type Option = {
    lineWidth: number
    isOriginalMode: boolean
    highlightColor: MixedColor
}

type MixedColor = {
    rgb: { r: number; g: number; b: number }
    index: number
}

type DBLog = {
    type: any
    value: any
}

type SelectProps = {
    id: string
    items: SelectItem[]
    placeHolder: string
    value: string | undefined
    onChange: (item: SelectItem) => void
}
