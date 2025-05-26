import React from 'react'
import { setHandler, TextField } from '..'
import './common.css'
import './InputView.css'

type Props = {
    title: string
    placeholder: string
    value: string
    ok: (value: string) => void
}

export function InputView() {
    const [value, setValue] = React.useState('')

    const [props, setProps] = React.useState<Props>()

    React.useEffect(() => {
        setHandler('showInputView', async (props) => {
            setProps(props)
            setValue(props.value)
        })
    }, [])

    return (
        <div
            className="InputViewFrame"
            hidden={!props}
            onClick={(e) => {
                e.stopPropagation()
            }}
        >
            <div className="InputView">
                <div className="Titlebar">
                    <div className="Text">{props?.title}</div>
                </div>

                <TextField
                    id="InputView"
                    value={value}
                    placeHolder={props ? props.placeholder : ''}
                    onChange={setValue}
                />
                <div
                    className="CancelButton"
                    onClick={(e) => {
                        setValue('')
                        setProps(undefined)

                        e.stopPropagation()
                    }}
                >
                    <div className="Text">취소</div>
                </div>
                <div
                    className={value.length !== 0 ? 'SaveButton' : 'DisabledSaveButton'}
                    onClick={(e) => {
                        if (0 < value.length) {
                            props?.ok(value)

                            setValue('')
                            setProps(undefined)
                        }

                        e.stopPropagation()
                    }}
                >
                    <div className="Text">확인</div>
                </div>
            </div>
        </div>
    )
}
