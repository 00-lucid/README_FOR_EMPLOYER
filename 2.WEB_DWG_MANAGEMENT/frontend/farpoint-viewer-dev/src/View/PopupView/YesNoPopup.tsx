import React from 'react'
import './YesNoPopup.css'
// Lib
import { useRecoilState } from 'recoil'
// 전역 Store
import { StatusStore } from '../../Store/statusStore'

export function YesNoPopup() {
    // 전역 Store
    const [yesNoPopupValue, setYesNoPopupValue] = useRecoilState(StatusStore.yesNoPopupValue)

    return (
        <div className="YesNoPopupFrame" hidden={!yesNoPopupValue}>
            <div className="YesNoPopup">
                <div className="Label">
                    <div>
                        <span>{yesNoPopupValue?.message}</span>
                    </div>
                </div>
                <div
                    className="YesButton"
                    onClick={(e) => {
                        e.stopPropagation()
                        if (yesNoPopupValue) {
                            yesNoPopupValue.yes()
                            setYesNoPopupValue(undefined)
                        }
                    }}
                >
                    <div className="Text">예</div>
                </div>
                <div
                    className="NoButton"
                    onClick={(e) => {
                        e.stopPropagation()
                        if (yesNoPopupValue) {
                            yesNoPopupValue.no()
                            setYesNoPopupValue(undefined)
                        }
                    }}
                >
                    <div className="Text">아니오</div>
                </div>
            </div>
        </div>
    )
}
