import React, { createContext } from 'react'
import { global } from '../Lib/util'
const MenuContext = createContext<MenuContextType | null>(null)

/*
  description : 현재 상태 컨텍스트, 
*/
const MenuContextProvider = ({ children }: Children) => {
    const [currentMenu, setCurrentMenu] = React.useState('') // 선택된 사이드 메뉴

    // Event
    // 사이드 선택 메뉴 변경
    const onMenuChange = React.useCallback((menuId: string, userId: string | undefined) => {
        global.log('onMenuChange', menuId, userId)
        if (userId && 0 < userId.length) {
            setCurrentMenu((prev: string) => {
                return prev === menuId ? '' : menuId
            })
        }
    }, [])

    const value = {
        currentMenu,
        onMenuChange,
    }
    return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export { MenuContext, MenuContextProvider }
