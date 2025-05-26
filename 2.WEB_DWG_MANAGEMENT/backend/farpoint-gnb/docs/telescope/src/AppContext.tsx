import React from 'react'
import { Repository, useCommandListener } from '.'

export function useAppContext(repository: Repository) {
    const listener = useCommandListener()

    return { listener, repository }
}

export type AppContextType = { listener: {}; repository: Repository }

export const AppContext = React.createContext({
    listener: {},
    repository: Repository.mock()
})
