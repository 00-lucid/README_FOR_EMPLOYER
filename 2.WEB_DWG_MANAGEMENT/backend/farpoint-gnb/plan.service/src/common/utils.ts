import { randomBytes } from 'crypto'

export class utils {
    public static uuid(): string {
        return randomBytes(16).toString('hex')
    }

    public static env(key: string): string | undefined {
        return process.env[key]
    }

    public static envs(keys: string[]): Map<string, string> | undefined {
        const map = new Map<string, string>()

        for (const key of keys) {
            const value = process.env[key]

            if (value === undefined) {
                return undefined
            } else {
                map.set(key, value)
            }
        }

        return map
    }

    public static async sleep(timeout: number): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, timeout))
    }
}
