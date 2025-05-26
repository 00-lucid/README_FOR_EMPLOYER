import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'

export * from './common'
export * from './context'
export * from './types'
export * from './popupview'

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
)
