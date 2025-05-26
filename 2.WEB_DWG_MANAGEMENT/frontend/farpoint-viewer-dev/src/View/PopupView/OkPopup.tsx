import React from 'react'
import './OkPopup.css'
// Lib
import { useRecoilState } from 'recoil'
// 전역 Store
import { StatusStore } from '../../Store/statusStore'

export function OkPopup() {
    // 전역 Store
    const [okPopupValue, setOkPopupValue] = useRecoilState(StatusStore.okPopupValue)

    return (
        <div className="OkPopupFrame" hidden={!okPopupValue}>
            <div className="OkPopup">
                <div className="Label">
                    <div>{okPopupValue?.message}</div>
                </div>
                <div
                    className="OkButton"
                    onClick={(e) => {
                        e.stopPropagation()
                        if (okPopupValue) {
                            okPopupValue.ok()
                            setOkPopupValue(undefined)
                        }
                    }}
                >
                    <div className="Text">확인</div>
                </div>
            </div>
        </div>
    )
}
