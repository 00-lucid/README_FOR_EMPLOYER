import React from 'react'
import { setHandler } from '..'
import './YesNoPopup.css'

type YesNoPopupValue = {
    message: string
    yes: () => void
    no: () => void
}

export function YesNoPopup() {
    const [value, setValue] = React.useState<YesNoPopupValue>()

    React.useEffect(() => {
        setHandler('requestYesNo', async (value: YesNoPopupValue) => {
            setValue(value)
        })
    }, [])

    return (
        <div className="YesNoPopupFrame" hidden={!value}>
            <div className="YesNoPopup">
                <div className="Label">
                    <div>{value?.message}</div>
                </div>
                <div
                    className="YesButton"
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
                    className="NoButton"
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
