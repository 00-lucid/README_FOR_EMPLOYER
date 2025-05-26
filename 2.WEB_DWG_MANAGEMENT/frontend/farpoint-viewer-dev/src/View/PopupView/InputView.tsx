import React from 'react'
import { useRecoilState } from 'recoil'
import { StatusStore } from '../../Store/statusStore'
import { TextField } from '../CommonView/TextField'
import './InputView.css'

type Props = {
    title: string
    placeholder: string
    value: string
    ok: (value: string) => void
}

export function InputView() {
    const [value, setValue] = React.useState('')

    // const [props, setProps] = React.useState<Props>()
    const [inputPopupValue, setInputPopupValue] = useRecoilState<InputPopupValue | undefined>(StatusStore.inputPopupValue)

    return (
        <div
            className="InputViewFrame"
            hidden={!inputPopupValue}
            onClick={(e) => {
                e.stopPropagation()
            }}
        >
            <div className="InputView">
                <div className="Titlebar">
                    <div className="Text">{inputPopupValue?.title}</div>
                </div>

                <TextField
                    id="InputView"
                    value={value}
                    placeHolder={inputPopupValue ? inputPopupValue.placeholder : ''}
                    onChange={setValue}
                />
                <div
                    className="CancelButton"
                    onClick={(e) => {
                        setValue('')
                        setInputPopupValue(undefined)

                        e.stopPropagation()
                    }}
                >
                    <div className="Text">취소</div>
                </div>
                <div
                    className={value.length !== 0 ? 'SaveButton' : 'DisabledSaveButton'}
                    onClick={(e) => {
                        if (0 < value.length) {
                            inputPopupValue?.ok(value)

                            setValue('')
                            setInputPopupValue(undefined)
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
