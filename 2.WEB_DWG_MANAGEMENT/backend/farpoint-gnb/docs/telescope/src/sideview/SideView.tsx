import React from 'react'
import './SideView.css'
import { SelectedItem } from '..'
import { MenuBar } from './MenuBar'
import { DrawingListMenu } from './drawing'
import { EquipmentMenu } from './equipment'
import { NoteMenu } from './note'
import { SearchMenu } from './search'

type Props = {
    currentMenu: string
    onMenuChange: (menuId: string) => void
    selectedItem: SelectedItem
}

export const SideView = ({ currentMenu, onMenuChange, selectedItem }: Props) => {
    return (
        <div className={'SideView SideViewShadow'} onClick={(e) => e.stopPropagation()}>
            <DrawingListMenu
                currentMenu={currentMenu}
                onMenuChange={onMenuChange}
                selectedItem={selectedItem}
            />
            <EquipmentMenu
                currentMenu={currentMenu}
                onMenuChange={onMenuChange}
                selectedItem={selectedItem}
            />
            <NoteMenu currentMenu={currentMenu} onMenuChange={onMenuChange} selectedItem={selectedItem} />
            <SearchMenu currentMenu={currentMenu} onMenuChange={onMenuChange} />
            <div className="Background"></div>
            <MenuBar currentMenu={currentMenu} onMenuChange={onMenuChange} />
        </div>
    )
}
