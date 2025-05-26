import * as icons from './TreeViewIcons'
import { TreeViewItemLabel } from '..'
import './TreeViewLables.css'

export type SelectAllIconOption = {
    isShowAll: boolean
    onShowAll: () => void
    onHideAll: () => void
    color: string
}

function makeSelectAllIcon(option: SelectAllIconOption, isSelected: boolean) {
    const background = (
        <div
            className="ShowAllBackground"
            onClick={(e) => {
                if (option.isShowAll) {
                    option.onHideAll()
                } else {
                    option.onShowAll()
                }

                e.stopPropagation()
            }}
        />
    )

    const selected = option.isShowAll
        ? icons.selectedOnIcon('var(--Icon-Highlight)')
        : icons.selectedOffIcon('var(--Icon-Highlight)')

    const normal = option.isShowAll
        ? icons.normalOnIcon(option.color)
        : icons.normalOffIcon('var(--Icon-Normal)')

    return (
        <>
            {isSelected ? selected : normal}
            {background}
        </>
    )
}

type TreeViewFolderOption = {
    folderIcon?: boolean
    selectAllIcon?: SelectAllIconOption
}

export const makeFolderLabel = (
    text: string,
    depth: number,
    option: TreeViewFolderOption = {}
): TreeViewItemLabel => {
    const labelHeight = 40

    const normalOpen = (
        <div className="Label" style={{ height: labelHeight + 'px' }}>
            {icons.arrowIcon(false, 'var(--Icon-Normal)', depth)}
            {option.folderIcon ? icons.folderOpenIcon('var(--Icon-Normal)', depth) : <></>}
            {option.folderIcon ? icons.getNormalText2(text, depth) : icons.getNormalText(text, depth)}
            {option.selectAllIcon ? makeSelectAllIcon(option.selectAllIcon, false) : <></>}
        </div>
    )

    const normalClose = (
        <div className="Label" style={{ height: labelHeight + 'px' }}>
            {icons.arrowIcon(true, 'var(--Icon-Normal)', depth)}
            {option.folderIcon ? icons.folderCloseIcon('var(--Icon-Normal)', depth) : <></>}
            {option.folderIcon ? icons.getNormalText2(text, depth) : icons.getNormalText(text, depth)}
            {option.selectAllIcon ? makeSelectAllIcon(option.selectAllIcon, false) : <></>}
        </div>
    )

    const selectedOpen = (
        <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
            {icons.arrowIcon(false, 'var(--Icon-Highlight)', depth)}
            {option.folderIcon ? icons.folderOpenIcon('var(--Icon-Highlight)', depth) : <></>}
            {option.folderIcon ? icons.getSelectedText2(text, depth) : icons.getNormalText(text, depth)}
            {option.selectAllIcon ? makeSelectAllIcon(option.selectAllIcon, true) : <></>}
        </div>
    )

    const selectedClose = (
        <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
            {icons.arrowIcon(true, 'var(--Icon-Highlight)', depth)}
            {option.folderIcon ? icons.folderCloseIcon('var(--Icon-Highlight)', depth) : <></>}
            {option.folderIcon ? icons.getSelectedText2(text, depth) : icons.getNormalText(text, depth)}
            {option.selectAllIcon ? makeSelectAllIcon(option.selectAllIcon, true) : <></>}
        </div>
    )

    return {
        height: labelHeight,
        heightUnit: 'px',
        selected: { open: selectedOpen, close: selectedClose },
        normal: { open: normalOpen, close: normalClose }
    }
}

type TreeViewItemOption = { folderIcon?: boolean }

const makeItemLabel = (text: string, depth: number, option: TreeViewItemOption = {}) => {
    const labelHeight = 40

    const normal = (
        <div className="Label" style={{ height: labelHeight + 'px' }}>
            <div className="Image1" />
            {option.folderIcon
                ? icons.documentIcon2('var(--Icon-Normal)', depth)
                : icons.equipmentIcon('var(--Icon-Normal)', depth)}
            {option.folderIcon ? icons.getNormalText2(text, depth) : icons.getNormalText(text, depth)}
        </div>
    )

    const selected = (
        <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
            <div className="Image1" />
            {option.folderIcon
                ? icons.documentIcon2('var(--Icon-Highlight)', depth)
                : icons.equipmentIcon('var(--Icon-Highlight)', depth)}
            {option.folderIcon ? icons.getSelectedText2(text, depth) : icons.getSelectedText(text, depth)}
        </div>
    )

    return {
        height: labelHeight,
        heightUnit: 'px',
        selected: { open: selected, close: selected },
        normal: { open: normal, close: normal }
    }
}

export const makeDocumentLabel = (text: string, depth: number, option: TreeViewItemOption = {}) => {
    return makeItemLabel(text, depth, option)
}

export const makeEquipmentLabel = (text: string, depth: number, option: TreeViewItemOption = {}) => {
    return makeItemLabel(text, depth, option)
}
