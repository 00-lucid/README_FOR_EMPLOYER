import React from 'react'
import './WarningPopup.css'
// Lib
import { useRecoilState } from 'recoil'
// 전역 Store
import { StatusStore } from '../../Store/statusStore'

export function WarningPopup() {
    // 전역 Store
    const [warningPopupValue, setWarningPopupValue] = useRecoilState(StatusStore.warningPopupValue)

    return (
        <div
            className="WarningViewFrame"
            hidden={!warningPopupValue}
            onClick={(e) => {
                e.stopPropagation()
            }}
        >
            <div className="WarningView">
                <div className="Titlebar">
                    <div className="Text">{warningPopupValue?.title}</div>
                </div>

                <div className="MessageBox">
                    <div className="Message">{warningPopupValue?.message}</div>
                    <div className="Message">{warningPopupValue?.submessage}</div>
                </div>

                <div
                    className="SaveButton"
                    onClick={(e) => {
                        e.stopPropagation()
                        if (warningPopupValue) {
                            warningPopupValue.yes()
                            setWarningPopupValue(undefined)
                        }
                    }}
                >
                    <div className="Text">예</div>
                </div>

                <div
                    className="CancelButton"
                    onClick={(e) => {
                        e.stopPropagation()
                        if (warningPopupValue) {
                            warningPopupValue.no()
                            setWarningPopupValue(undefined)
                        }
                    }}
                >
                    <div className="Text">아니오</div>
                </div>
            </div>
        </div>
    )
}
