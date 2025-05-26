import React, { Suspense } from 'react'
import './App.css'
import { BasicView } from './basicview/BasicView'
import { TabView } from './tabview/TabView'

import { useAppContext, AppContext, useThemeContext, ThemeContext, useStatus, StatusContext } from './context'

const MainView = React.lazy(() => {
    return import('./mainview/MainView').then(({ MainView }) => ({ default: MainView }))
})
const SideView = React.lazy(() => {
    return import('./sideview/SideView').then(({ SideView }) => ({ default: SideView }))
})
const PopupView = React.lazy(() => {
    return import('./popupview').then(({ PopupView }) => ({ default: PopupView }))
})

function App() {
    React.useEffect(() => {
        const resize = () => {
            const body = document.body as any

            body.height = window.innerHeight + 'px'
            body.style.height = window.innerHeight + 'px'

            body.width = window.innerWidth + 'px'
            body.style.width = window.innerWidth + 'px'
        }

        resize()

        window.addEventListener('resize', resize)
    }, [])

    const app = useAppContext()
    const theme = useThemeContext()
    const status = useStatus(app.userId, app.isMarkupChanged)

    const closeMenu = React.useCallback(() => {
        status.onMenuChange('')
    }, [status])

    const body = React.useMemo(() => {
        const urlParams = new URLSearchParams(window.location.search)

        if (urlParams.get('mode') === 'basic') {
            return (
                <div className="App" onClick={closeMenu}>
                    <BasicView />
                </div>
            )
        }

        return (
            <div className="App" onClick={closeMenu}>
                <Suspense fallback={false}>
                    <MainView />
                    <SideView />
                    <TabView />
                    <PopupView />
                </Suspense>
            </div>
        )
    }, [closeMenu])

    return (
        <AppContext.Provider value={app}>
            <ThemeContext.Provider value={theme}>
                <StatusContext.Provider value={status}>{body}</StatusContext.Provider>{' '}
            </ThemeContext.Provider>
        </AppContext.Provider>
    )
}

export default App
