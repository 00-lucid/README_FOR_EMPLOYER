import React from 'react'
import './SaveMarkup.css'
// Lib
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore, MarkUpStore } from '../../Store/statusStore'
// Component
import { TextField } from '../CommonView/TextField'
import AppStore from '../../Store/appStore'
// Api
import Api from '../../Api'

export function SaveMarkup() {
    // 전역 Store
    const [isShowMarkupPopup, setIsShowMarkupPopup] = useRecoilState(MarkUpStore.isShowMarkupPopup)

    const markupPaths = useRecoilValue(MarkUpStore.markupPaths)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const currentMarkupTitle = useRecoilValue(MarkUpStore.currentMarkupTitle)
    const selectedMarkupItems = useRecoilValue(MarkUpStore.selectedMarkupItems)
    const userId = useRecoilValue(AppStore.userId)
    const setBanner = useSetRecoilState(StatusStore.banner)

    const setIsMarkupChanged = useSetRecoilState(MarkUpStore.isMarkupChanged)
    const setMarkupContents = useSetRecoilState(MarkUpStore.markupContents)
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)

    // State
    const [title, setTitle] = React.useState('') // 저장할 마크업 제목
    const [isPublic, setPublic] = React.useState(false) // 공개

    const onClose = React.useCallback(async () => {
        setTitle('')
        setPublic(false)
        setIsShowMarkupPopup(undefined)
    }, [setIsShowMarkupPopup])

    const onMarkupSave = React.useCallback(
        async (title: string, isPublic: boolean) => {
            if (isShowMarkupPopup) {
                if (userId && selectedCanvas) {
                    setBanner(`저장 중...`)
                    const body = {
                        docId: selectedCanvas.documentCtx.docId,
                        docVer: selectedCanvas.documentCtx.docVer,
                        plantCode: selectedCanvas.documentCtx.plantCode,
                        userId,
                        title,
                        paths: markupPaths,
                        isPublic: isPublic ? 1 : 0,
                    }
                    // 저장
                    const res = await Api.markup.insertMarkup(body)

                    setBanner(undefined)
                    setIsMarkupChanged(false)
                    onClose()

                    if (res) {
                        // 최신화 된 마크업 리스트 다시 불러오기
                        const markups = await Api.markup.getMarkups(
                            userId,
                            selectedCanvas.documentCtx.docId,
                            selectedCanvas.documentCtx.docVer,
                            selectedCanvas.documentCtx.plantCode
                        )
                        if (markups) {
                            setMarkupContents(markups)
                        }
                    }
                }
            }
        },
        [setMarkupContents, setIsMarkupChanged, isShowMarkupPopup, markupPaths, onClose, selectedCanvas, userId, setBanner]
    )

    const onMarkupUpdate = React.useCallback(
        async (title: string, isPublic: boolean, seq: number) => {
            if (isShowMarkupPopup) {
                if (userId && selectedCanvas) {
                    setBanner(`저장 중...`)
                    const body = {
                        docId: selectedCanvas.documentCtx.docId,
                        docVer: selectedCanvas.documentCtx.docVer,
                        plantCode: selectedCanvas.documentCtx.plantCode,
                        userId,
                        title,
                        paths: markupPaths,
                        isPublic: isPublic ? 1 : 0,
                        seq: seq,
                    }
                    // 저장
                    const res = await Api.markup.updateMarkup(body)

                    setBanner(undefined)
                    setIsMarkupChanged(false)
                    onClose()

                    if (res) {
                        // 최신화 된 마크업 리스트 다시 불러오기
                        const markups = await Api.markup.getMarkups(
                            userId,
                            selectedCanvas.documentCtx.docId,
                            selectedCanvas.documentCtx.docVer,
                            selectedCanvas.documentCtx.plantCode
                        )
                        if (markups) {
                            setMarkupContents(markups)
                        }
                    }
                }
            }
        },
        [setMarkupContents, setIsMarkupChanged, isShowMarkupPopup, markupPaths, onClose, selectedCanvas, userId, setBanner]
    )

    React.useEffect(() => {
        if (isShowMarkupPopup?.message === 'update') setTitle(currentMarkupTitle)
    }, [isShowMarkupPopup])

    return (
        <div className="SaveMarkupFrame" hidden={isShowMarkupPopup?.message !== 'save' && isShowMarkupPopup?.message !== 'update'}>
            <div className="SaveMarkup">
                <div className="Titlebar">
                    <div className="Text">{isShowMarkupPopup?.message === 'save' ? '마크업 저장하기' : '마크업 덮어쓰기'}</div>
                </div>
                <div className="Label01">제목</div>

                <TextField id="saveMarkup" value={title} placeHolder="제목을 입력하세요." onChange={setTitle} />
                <div className="Label02">공유</div>
                <div
                    className="CancelButton"
                    onClick={async (e) => {
                        e.stopPropagation()
                        await onClose()
                        isShowMarkupPopup?.nextAction()
                    }}
                >
                    <div className="Text">취소</div>
                </div>
                <div
                    className={title.length !== 0 ? 'SaveButton' : 'DisabledSaveButton'}
                    onClick={async (e) => {
                        // 저장 클릭
                        e.stopPropagation()
                        if (0 < title.length) {
                            if (isShowMarkupPopup?.message === 'save') {
                                await onMarkupSave(title, isPublic)
                            } else {
                                await onMarkupUpdate(title, isPublic, Number(Array.from(selectedMarkupItems)[0]))
                            }
                            isShowMarkupPopup?.nextAction()
                        }
                    }}
                >
                    <div className="Text">저장</div>
                </div>
                <div id="number">
                    <CheckBox
                        id="public"
                        label="공개"
                        isOn={isPublic}
                        onClickMenu={() => {
                            setYesNoPopupValue({
                                message: '모든 사람에게 정말 공개 하시겠습니까?',
                                yes: () => {
                                    setPublic(true)
                                },
                                no: () => {
                                },
                            })
                        }}
                    />
                </div>
                <div id="name">
                    <CheckBox
                        id="private"
                        label="비공개"
                        isOn={!isPublic}
                        onClickMenu={() => {
                            setPublic(false)
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

type CheckBoxProps = {
    id: string
    label: string
    isOn: boolean
    onClickMenu: () => void
}

function CheckBox({ id, label, isOn, onClickMenu }: CheckBoxProps) {
    const on = (
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
                <path
                    d="M22 12.5a9.5 9.5 0 0 1-9.5 9.5A9.5 9.5 0 0 1 3 12.5 9.5 9.5 0 0 1 12.5 3a9.5 9.5 0 0 1 9.5 9.5"
                    stroke="var(--Dialogue-CheckBox-Stroke)"
                    fill="var(--Dialogue-CheckBox-Fill)"
                />
                <path d="M17.5 12.5a5 5 0 1 1-10 0 5 5 0 0 1 10 0" fill="var(--Text-Normal)" />
            </g>
        </svg>
    )

    const off = (
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M22 12.5a9.5 9.5 0 0 1-9.5 9.5A9.5 9.5 0 0 1 3 12.5 9.5 9.5 0 0 1 12.5 3a9.5 9.5 0 0 1 9.5 9.5"
                fill="var(--Dialogue-CheckBox-Fill)"
                stroke="var(--Dialogue-CheckBox-Stroke)"
                fillRule="evenodd"
            />
        </svg>
    )

    return (
        <div className="CheckBox" id={id} onClick={() => onClickMenu()}>
            <div className={isOn ? 'Selected' : 'Normal'}>
                {isOn ? on : off}
                <span>{label}</span>
            </div>
        </div>
    )
}
