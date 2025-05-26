import React from 'react'
import {
    UserContext,
    useUserContext,
    Repository,
    useAppContext,
    AppContext,
    useSelectedItem,
    updateQuery,
    getQuery
} from '.'
import { SideView } from './sideview'
import './App.css'

type Props = {
    repository: Repository
}

function App({ repository }: Props) {
    const app = useAppContext(repository)
    const user = useUserContext(repository)
    const selectedItem = useSelectedItem(app)

    const [currentMenu, setCurrentMenu] = React.useState('')

    React.useEffect(() => {
        const menu = getQuery('menu')

        if (menu) {
            setCurrentMenu(menu)
        }
    }, [])

    const onMenuChange = React.useCallback((menuId: string) => {
        updateQuery('menu', menuId)

        setCurrentMenu((prev: string) => {
            return prev === menuId ? '' : menuId
        })
    }, [])

    const closeMenu = React.useCallback(() => {
        setCurrentMenu('')
    }, [])

    return (
        <AppContext.Provider value={app}>
            <UserContext.Provider value={user}>
                <div className="App LightTheme" onClick={closeMenu}>
                    <SideView
                        currentMenu={currentMenu}
                        onMenuChange={onMenuChange}
                        selectedItem={selectedItem}
                    />
                </div>
            </UserContext.Provider>
        </AppContext.Provider>
    )
}

export default App
