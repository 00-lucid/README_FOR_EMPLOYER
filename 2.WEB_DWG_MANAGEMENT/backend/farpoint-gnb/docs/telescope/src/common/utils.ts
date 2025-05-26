export function sleep(timeout: number) {
    return new Promise((resolve) => setTimeout(resolve, timeout))
}

export function toStringByFormatting(source: Date, delimiter = '-') {
    const leftPad = (value: number) => {
        if (value >= 10) {
            return value
        }
        return `0${value}`
    }

    const year = source.getFullYear()
    const month = leftPad(source.getMonth() + 1)
    const day = leftPad(source.getDate())
    return [year, month, day].join(delimiter)
}

export function isEqualArray(array1: unknown[], array2: unknown[]) {
    if (array1.length !== array2.length) return false

    return array1.every((value, index) => value === array2[index])
}

export function hasEqualValues(array1: unknown[], array2: unknown[]) {
    if (array1.length !== array2.length) return false

    const sorted1 = array1.slice().sort()
    const sorted2 = array2.slice().sort()

    return sorted1.every((value, index) => value === sorted2[index])
}

export function warning(...args: any) {
    console.log(...args)
}

export function openUrl(url: string) {
    window.open(url, 'OpenUrlWindow')
}

export function updateQuery(key: string, value: string | undefined) {
    const urlParams = new URLSearchParams(window.location.search)
    if (value) {
        urlParams.set(key, value)
    } else {
        urlParams.delete(key)
    }

    const newUrl = '?' + urlParams.toString()

    window.history.pushState(null, '', newUrl)
}

export function getQuery(key: string) {
    const urlParams = new URLSearchParams(window.location.search)

    return urlParams.get(key)
}
