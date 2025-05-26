import { Routes, Route } from 'react-router-dom'
import './Style/index.css'
import './Style/App.css'
import './Style/Color.css'
import './Style/ListView.css'

// View
import MainView from './View/MainView'
import SideView from './View/SideView'
import PopupView from './View/PopupView'
import ExternalSearchView from './View/ExternalSearchView'

// 전역 Store
import { ControllerContextProvider } from './Store/controllerContext'
import { PainterContextProvider } from './Store/painterContext'
// Controller
import useUserSetting from './Controller/UseSetting/useUserSetting'

function App() {
    useUserSetting()

    return (
        <PainterContextProvider>
            <ControllerContextProvider>
                <div className="App" onClick={() => {}}>
                    <PopupView />
                    <Routes>
                        <Route
                            path="/*"
                            element={
                                <>
                                    <MainView />
                                    <SideView />
                                </>
                            }
                        />
                        <Route path="/search" element={<ExternalSearchView />} />
                    </Routes>
                </div>
            </ControllerContextProvider>
        </PainterContextProvider>
    )
}

export default App
