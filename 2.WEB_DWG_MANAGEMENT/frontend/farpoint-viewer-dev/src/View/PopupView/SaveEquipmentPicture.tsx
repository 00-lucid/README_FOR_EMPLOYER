import React, { useState } from 'react'
import './SaveMarkup.css'
// Lib
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore, MarkUpStore, PictureStore } from '../../Store/statusStore'
// Component
import { TextField } from '../CommonView/TextField'
import AppStore from '../../Store/appStore'
// Api
import Api from '../../Api'

export function SaveEquipmentPicture() {
    const [title, setTitle] = useState<string>('')
    const [isShowPicturePopup, setIsShowPicturePopup] = useRecoilState<any>(PictureStore.isShowPicturePopup)
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    const setBanner = useSetRecoilState(StatusStore.banner)

    return (
        <div className="SaveMarkupFrame" hidden={isShowPicturePopup === undefined}>
            <div className="SaveMarkup">
                <div className="Titlebar">
                    <div className="Text">이미지 저장하기</div>
                </div>
                {/* <div className="Label01">제목</div>
                <TextField id="saveMarkup" value={title} placeHolder="제목을 입력하세요." onChange={setTitle} /> */}
                <div className="UploadFrame">
                    <input
                        id="equipmentPictureUploadButton"
                        type="file"
                        multiple
                        onChange={async (e) => {
                            if (e.target.files) {
                                const formData = new FormData()
                                const rule = /^[a-zA-Z0-9\.\-_]*$/

                                for (let i = 0; i < e.target.files.length; i++) {
                                    const file = e.target.files[i]

                                    if (!rule.test(file.name)) {
                                        setOkPopupValue({
                                            message: '파일명은 공백없이 숫자, 대소문자, -, _ 로만 구성되야 해요',
                                            ok: () => {},
                                        })
                                        e.target.value = ''
                                        return
                                    }

                                    formData.append(`image_${i}`, file)
                                }

                                if (e.target.files[0]) {
                                    setBanner('저장 중...')
                                    await isShowPicturePopup.ok(formData)
                                    setBanner(undefined)
                                }
                            }
                            e.target.value = ''
                        }}
                    />
                </div>
                <div
                    className="CancelButton"
                    onClick={async (e) => {
                        await isShowPicturePopup.no()
                        e.stopPropagation()
                    }}
                >
                    <div className="Text">취소</div>
                </div>
                <div
                    className={title.length !== 0 ? 'SaveButton' : 'DisabledSaveButton'}
                    onClick={async (e) => {
                        // 저장 클릭
                        if (title.length !== 0) {
                            isShowPicturePopup.ok()
                            e.stopPropagation()
                        }
                    }}
                >
                    <div className="Text">저장</div>
                </div>
            </div>
        </div>
    )
}
