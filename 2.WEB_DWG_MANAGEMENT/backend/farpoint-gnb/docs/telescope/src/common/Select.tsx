import React from 'react'
import './Select.css'

export type SelectItem = {
    value: string
    text: string
}

type Props = {
    id: string
    items: SelectItem[]
    placeHolder: string
    value: string | undefined
    onChange: (value: string) => void
}

export function Select({ id, items, placeHolder, value, onChange }: Props) {
    const [isActive, setActive] = React.useState(false)
    const [isHolder, setHoldState] = React.useState(true)

    React.useEffect(() => {
        for (const item of items) {
            if (item.value === value) {
                setHoldState(false)
                return
            }
        }

        setHoldState(true)
    }, [items, value])

    const getText = (value: string | undefined): string => {
        for (const item of items) {
            if (item.value === value) return item.text
        }

        return placeHolder
    }

    const getItems = React.useMemo((): JSX.Element[] => {
        const elements: JSX.Element[] = []

        for (const item of items) {
            elements.push(
                <div
                    key={item.value}
                    className="SelectItem"
                    onClick={() => {
                        onChange(item.value)
                    }}
                >
                    <div className="Topline"></div>
                    <div className="Text">{item.text}</div>
                </div>
            )
        }

        return elements
    }, [items, onChange])

    // css에서도 max-height 바꿔야 한다.
    const maxHeight = 250
    const selectItemHeight = 35

    //이건 useMemo 하면 안 된다. document.body가 변하는 걸 알 수 없다.
    const getTop = () => {
        const body = document.body.getBoundingClientRect()
        const element = document.getElementById(id)
        const rect = element?.getBoundingClientRect()

        const targetHeight = Math.min(items.length * selectItemHeight, maxHeight)

        if (rect && body.height < rect.top + targetHeight) {
            const oversize = rect.top + targetHeight - body.height

            return -oversize - 20 + 'px'
        }

        return '0px'
    }

    const hideListView = () => {
        const element = document.getElementById(id + 'body')
        element?.scrollTo(0, 0)

        setActive(false)
    }

    const showListView = () => {
        if (0 < items.length) setActive(true)
    }

    return (
        <div className="CommonComponent" id={id}>
            <div className="SelectControl" tabIndex={0} onBlur={hideListView}>
                <div onClick={showListView} className={'Text ' + (isHolder ? 'HolderText' : 'LabelText')}>
                    {getText(value)}
                </div>
                {openButton}
                <div
                    hidden={!isActive}
                    className="SelectItemList"
                    id={id + 'body'}
                    style={{ top: getTop(), maxHeight: maxHeight + 'px' }}
                    onClick={hideListView}
                >
                    {getItems}
                </div>
            </div>
        </div>
    )
}

const openButton = (
    <svg className="Arrow" width="24" height="25" fill="#5E6467">
        <path d="M12 15.1c-.495 0-.957-.193-1.301-.544l-3.555-3.633a.505.505 0 0 1 .005-.712.497.497 0 0 1 .707.005l3.556 3.634c.307.312.869.312 1.176 0l3.556-3.634a.497.497 0 0 1 .707-.005.505.505 0 0 1 .005.712l-3.555 3.633A1.806 1.806 0 0 1 12 15.1" />
    </svg>
)
