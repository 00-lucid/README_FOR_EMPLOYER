import { useCallback, useEffect } from 'react'

/**
 * Debounce 기법을 활용한 useEffect
 *
 * delay 시간 안에 함수가 반복실행되면 이전 함수 실행을 취소하고 최근 함수를 delay 시간 이후에 실행한다.
 * @param func
 * @param delay
 * @param deps
 */
export const useDebouncedEffect = (func: any, delay: number, deps: any[]) => {
    const callback = useCallback(func, deps)

    useEffect(() => {
        const timer = setTimeout(() => {
            callback()
        }, delay)

        return () => {
            clearTimeout(timer)
        }
    }, [callback, delay])
}
