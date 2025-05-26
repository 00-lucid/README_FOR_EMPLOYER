import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { Repository } from './Repository'
import { getQuery } from './common'

export * from './common'
export * from './AppContext'
export * from './UserContext'
export * from './Repository'
export * from './useSelectedItem'
export * from './types'

ReactDOM.render(
    <React.StrictMode>
        <App repository={createRepository()} />
    </React.StrictMode>,
    document.getElementById('root')
)

function createRepository() {
    const host = getQuery('host')

    if (host === 'mock') {
        return Repository.mock()
    } else if (host === 'dev') {
        return Repository.create('http://localhost:4000')
    }

    return Repository.create('')
}
