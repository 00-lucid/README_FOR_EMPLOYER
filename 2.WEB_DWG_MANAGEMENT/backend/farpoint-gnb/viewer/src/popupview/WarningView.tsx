import React from 'react'
import { setHandler } from '..'
import './common.css'
import './InputView.css'
import './WarningView.css'

type YesNoPopupValue = {
    title: string
    message: string
    submessage: string
    yes: () => void
    no: () => void
}

export function WarningView() {
    const [value, setValue] = React.useState<YesNoPopupValue>()

    React.useEffect(() => {
        setHandler('showWarningView', async (value: YesNoPopupValue) => {
            setValue(value)
        })
    }, [])

    return (
        <div
            className="WarningViewFrame"
            hidden={!value}
            onClick={(e) => {
                e.stopPropagation()
            }}
        >
            <div className="WarningView">
                <div className="Titlebar">
                    <div className="Text">{value?.title}</div>
                </div>

                <div className="MessageBox">
                    <div className="Message">{value?.message}</div>
                    <div className="Message">{value?.submessage}</div>
                </div>

                <div
                    className="SaveButton"
                    onClick={(e) => {
                        if (value) {
                            value.yes()
                            setValue(undefined)
                        }

                        e.stopPropagation()
                    }}
                >
                    <div className="Text">예</div>
                </div>

                <div
                    className="CancelButton"
                    onClick={(e) => {
                        if (value) {
                            value.no()
                            setValue(undefined)
                        }

                        e.stopPropagation()
                    }}
                >
                    <div className="Text">아니오</div>
                </div>
            </div>
        </div>
    )
}
