import { Logger, moduleName } from '.'

test('jest 실행', () => {
    const actual = moduleName()

    expect(actual).toEqual('common')
})

describe('typescript examples', () => {
    test('옵셔널 프로퍼티', () => {
        function printName(obj: { first: string; last?: string }) {
            if (obj.last !== undefined) {
                console.log(obj.last.toUpperCase())
            }
        }

        printName({ first: 'val1', last: 'val2' })
    })

    test('유니언 타입', () => {
        function printId(id: number | string) {
            if (typeof id === 'string') {
                // 이 분기에서 id는 'string' 타입을 가집니다
                console.log(id.toUpperCase())
            } else {
                // 여기에서 id는 'number' 타입을 가집니다
                console.log(id)
            }
        }
        printId('a')
        printId(1)
    })

    test('유니언 타입(array)', () => {
        function welcomePeople(x: string[] | string) {
            if (Array.isArray(x)) {
                // 여기에서 'x'는 'string[]' 타입입니다
                console.log('Hello, ' + x.join(' and '))
            } else {
                // 여기에서 'x'는 'string' 타입입니다
                console.log('Welcome lone traveler ' + x)
            }
        }

        welcomePeople(['a', 'b'])
        welcomePeople('a')
    })

    test('typeof', () => {
        function check(strs: string | number | boolean | undefined | string[] | number[] | Logger): string {
            if (Array.isArray(strs)) {
                if (typeof strs[0] === 'number') {
                    return (strs[0] + 100).toString()
                } else {
                    return strs[0].toLocaleUpperCase()
                }
            }

            return typeof strs
        }

        expect(check('str')).toEqual('string')
        expect(check(1)).toEqual('number')
        expect(check(true)).toEqual('boolean')
        expect(check(undefined)).toEqual('undefined')
        expect(check(['a', 'b'])).toEqual('A')
        expect(check([1, 2])).toEqual('101')
        expect(check(log)).toEqual('object')
    })

    test('instanceof', () => {
        function logValue(x: unknown) {
            if (x instanceof Date) {
                console.log(x.toUTCString())
            } else if (typeof x === 'string') {
                console.log(x.toUpperCase())
            }
        }

        logValue('str')
    })

    test('Function Overloads', () => {
        function makeDate(timestamp: number): Date
        function makeDate(m: number, d: number, y: number): Date
        function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
            if (d !== undefined && y !== undefined) {
                return new Date(y, mOrTimestamp, d)
            } else {
                return new Date(mOrTimestamp)
            }
        }

        console.log(makeDate(12345678))
        console.log(makeDate(5, 5, 5))
    })

    test('Rest Parameters', () => {
        function multiply(n: number, ...m: number[]) {
            return m.map((x) => n * x)
        }
        // 'a' gets value [10, 20, 30, 40]
        console.log(multiply(10, 1, 2, 3, 4))
    })

    test('object 합치기', () => {
        const obj1 = { title: 'abc', detail: 123 }
        const merged = { ...obj1, title: '가나다', body: 'xyz' }

        expect(merged.title).toEqual('가나다')
        expect(merged.detail).toEqual(123)
        expect(merged.body).toEqual('xyz')
    })
})
