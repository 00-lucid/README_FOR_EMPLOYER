/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as NodeAssert from 'assert'

declare global {
    type SafeObj = Record<string, unknown>
    type Success = <T>(value: T) => void
    type Fail = (err?: Error) => void

    function error(msg: string, reject?: (reason?: any) => void): never
    function assert(value: boolean, msg?: string): void
    function notUsed(...args: unknown[]): void
    function empty(): void
}

const g = global as any

g.error = (msg: string, reject?: (reason?: any) => void): never => {
    if (reject === undefined) {
        throw new Error(msg)
    }

    const neverCall = reject as (reason?: any) => never

    return neverCall(msg)
}

g.assert = (value: boolean, msg?: string) => {
    if (!value) {
        throw new Error(msg ?? 'assert fail')
    }
}

g.notUsed = (..._: unknown[]) => {
    NodeAssert.ok(true)
}

g.empty = () => {
    NodeAssert.ok(true)
}
