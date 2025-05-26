import React from 'react'
import { setHandler } from '..'
import './OkPopup.css'

type OkPopupValue = {
    message: string
    ok: () => void
}

export function OkPopup() {
    const [value, setValue] = React.useState<OkPopupValue>()

    React.useEffect(() => {
        setHandler('requestOk', async (value: OkPopupValue) => {
            setValue(value)
        })
    }, [])

    return (
        <div className="OkPopupFrame" hidden={!value}>
            <div className="OkPopup">
                <div className="Label">
                    <div>{value?.message}</div>
                </div>
                <div
                    className="OkButton"
                    onClick={(e) => {
                        value?.ok()

                        setValue(undefined)

                        e.stopPropagation()
                    }}
                >
                    <div className="Text">확인</div>
                </div>
            </div>
        </div>
    )
}
