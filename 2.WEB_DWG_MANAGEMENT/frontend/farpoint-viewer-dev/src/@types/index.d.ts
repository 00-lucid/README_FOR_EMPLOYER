// Props children
type Children = {
    children: JSX.Element
}

type Point2d = {
    x: number
    y: number
}

type Color = { r: number; g: number; b: number }

type ViewParams = {
    position: any
    target: any
    upVector: any
    viewFieldWidth: any
    viewFieldHeight: any
    perspective: any
}

type MenuItemProps = {
    menuId: string
    label: string
    icon: { on: JSX.Element; off: JSX.Element }
    userId: string | undefined
}

type TreeViewProps = {
    children: JSX.Element
    id: string
    className?: string | undefined
}

type YesNoPopupValue = {
    message: string
    yes: () => void
    no: () => void
}
type OkPopupValue = {
    message: string
    ok: () => void
}

type WarningPopupValue = {
    title: string
    message: string
    submessage: string
    yes: () => void
    no: () => void
}

type InputPopupValue = {
    title: string
    placeholder: string
    value: string
    ok: (value: string) => void
}

type PicturePopupValue = {
    SERIAL: string
    FUNCTION: string
    PBS: string
    TAG: string
    NAME: string
    CONNECTION: any
    PICCT: any
    PICNAME: string
    PICEXT: string
    REGDT: string
}

type PldDocListPopupValue = {
    folderId: string
}

type TitleBarProps = {
    selectedCanvas: CanvasContext
}
type CanvasProps = {
    hideEditMarkup: () => void
    viewer: any
    setViewer: React.Dispatch<any>
    lib: any
    setLib: React.Dispatch<any>
}
