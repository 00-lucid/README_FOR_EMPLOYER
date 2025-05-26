import React from 'react'

// first, 순서를 뒤바꾸는 것은 문제를 일으킬 수 있다. 원인파악과 디버깅 어렵다.
// handler priority는 핸들러의 우선순위 또한 마찬가지다.
export function useCommandListener() {
    const [commands, setCommands] = React.useState(new Array<Command>())
    const [isRunning, setRunning] = React.useState(false)

    React.useEffect(() => {
        async function run() {
            setRunning(true)

            const newCommands = commands.slice()
            const command = newCommands.shift()

            let isComplete = true

            if (command) {
                setCommands(newCommands)

                const handlers = handlersMap.get(command.name)

                if (handlers) {
                    for (const handler of handlers) {
                        if (handler.command === command.name) {
                            const isDone = await handler.callback(command.value)

                            if (isDone === false) isComplete = false
                        }
                    }
                }
            }

            if (isComplete) setRunning(false)
        }

        if (!isRunning && 0 < commands.length) {
            run()
        }
    }, [commands, isRunning])

    React.useEffect(() => {
        const handler = (event: CustomEvent<PushCommandArg>) => {
            const value = event.detail
            const commands = value.commands

            setCommands((prev) => {
                const newValue = prev.slice()

                if (Array.isArray(commands)) {
                    newValue.push(...commands)
                } else {
                    newValue.push(commands)
                }

                return newValue
            })
        }

        const continueHandler = (event: CustomEvent<PushCommandArg>) => {
            setRunning(false)
        }

        document.addEventListener<any>('pushCommand', handler, { passive: false })
        document.addEventListener<any>('continueListener', continueHandler, { passive: false })

        return () => {
            document.removeEventListener<any>('pushCommand', handler)
            document.removeEventListener<any>('continueListener', continueHandler)
        }
    }, [])

    return {}
}

export type Command = {
    name: string
    value?: unknown
}

type CommandHandlerOption = {
    handlerId?: string
}

type Callback = (value?: any) => Promise<boolean | void>

type CommandHandler = {
    command: string
    callback: Callback
    handlerId: string
}

const handlersMap = new Map<string, CommandHandler[]>()

export const setHandler = (command: string, callback: Callback, option?: CommandHandlerOption) => {
    let handlerId = ''

    if (option && option.handlerId) handlerId = option.handlerId

    if (!handlersMap.has(command)) {
        handlersMap.set(command, new Array<CommandHandler>())
    }

    const handlers = handlersMap.get(command)

    if (handlers) {
        const value = { command, callback, handlerId }

        let found = false

        for (let i = 0; i < handlers.length; i++) {
            const element = handlers[i]

            if (element.handlerId === handlerId) {
                handlers[i] = value
                found = true
                break
            }
        }

        if (!found) {
            handlers.push(value)
        }
    }
}

export function pushCommand(commands: Command[] | Command) {
    var event = new CustomEvent('pushCommand', { detail: { commands } })

    document.dispatchEvent(event)
}

type PushCommandArg = { commands: Command[] | Command }

export function continueListener() {
    var event = new CustomEvent('continueListener', { detail: {} })

    document.dispatchEvent(event)
}
