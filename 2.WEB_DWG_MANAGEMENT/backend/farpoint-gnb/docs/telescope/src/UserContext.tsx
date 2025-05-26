import React from 'react'
import { Repository } from './Repository'

type DisplayType = 'name' | 'number'

export function useUserContext(repository: Repository) {
    const [userId, setUserId] = React.useState<string>()
    // const [userContext, setUserContext] = React.useState<UserContext>()

    React.useEffect(() => {
        async function fetchData(userId: string) {
            // const res = await Repository.getUserContext(userId)
            // setUserContext(res)
        }

        // user는 로딩 시 지정된다. 중간에 변경되는 경우가 없다.
        const urlParams = new URLSearchParams(window.location.search)
        const userId = urlParams.get('user')

        if (userId) {
            setUserId(userId)
            fetchData(userId)
        }
    }, [])

    const [drawingDisplayType, setDrawingDisplayType] = React.useState<DisplayType>('number')

    // 사용자 정보
    // 테마, 이것도 사용자가 선택한 거

    return { userId, drawingDisplayType, setDrawingDisplayType }
}

export type UserContextType = {
    userId: string | undefined
    drawingDisplayType: string
    setDrawingDisplayType: (type: DisplayType) => void
}

const defaultValue = {
    userId: '',
    drawingDisplayType: '',
    setDrawingDisplayType: (type: DisplayType) => {}
} as UserContextType

export const UserContext = React.createContext(defaultValue)
