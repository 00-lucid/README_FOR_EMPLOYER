interface CacheContent {
    value: string
    expires: number
}

class Cache {
    cache: { [key: string]: CacheContent }

    constructor() {
        this.cache = {}
    }

    // expires: 1h 40m
    set = (key: string, value: string, expires = 100 * 60) => {
        const content: CacheContent = {
            value,
            expires: new Date().getTime() + expires * 1000
        }
        this.cache[key] = content
    }

    get = (key: string | number) => {
        if (!this.cache[key]) return null
        if (this.cache[key].expires < new Date().getTime()) return null
        return this.cache[key].value
    }
}

export default new Cache()