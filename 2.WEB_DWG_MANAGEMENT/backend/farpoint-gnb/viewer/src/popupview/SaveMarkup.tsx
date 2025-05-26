import { useEffect, useCallback, useState, useContext } from 'react'
import Repository from '../Repository'
import { setBanner, setHandler, TextField, AppContext, DrawingPath, pushCommand, SelectedDocument } from '..'
import './common.css'
import './SaveMarkup.css'

type Value = {
    markupPaths: DrawingPath[]
    selectedDocument: SelectedDocument
    ok: () => void
    setUndoList: any
    setRedoList: any
    isUpdate: boolean
}

export function SaveMarkup() {
    const appContext = useContext(AppContext)
    const [title, setTitle] = useState('')
    const [isPublic, setPublic] = useState(false)
    const [value, setValue] = useState<Value>()

    useEffect(() => {
        if (value?.isUpdate) {
            setTitle(appContext.currentMarkup[1])
        } else {
            setTitle('')
        }
    }, [value])

    useEffect(() => {
        setHandler('showSaveMarkupView', async (value) => {
            setValue(value)
        })
    }, [])

    const onClose = useCallback(() => {
        setTitle('')
        if (value) value.ok()
        setValue(undefined)
    }, [value])

    const onMarkupSave = useCallback(
        async (title: string, isPublic: boolean) => {
            if (value) {
                const paths = value.markupPaths

                if (appContext.userId) {
                    setBanner(`저장 중...`)

                    const body = {
                        docId: value.selectedDocument.docKey.docId,
                        docVer: value.selectedDocument.docKey.docVer,
                        plantCode: value.selectedDocument.plantCode,
                        userId: appContext.userId,
                        title,
                        paths,
                        isPublic: isPublic ? 1 : 0
                    }
                    console.log(body)
                    await Repository.insertMarkup(body)

                    setBanner(undefined)

                    appContext.setMarkupChanged(false)

                    pushCommand({ name: 'MarkupContentsChanged' })
                }
                value.setUndoList([])
                value.setRedoList([])
            }

            onClose()
        },
        [appContext, onClose, value]
    )

    const onMarkupUpdate = useCallback(
        async (title: string, isPublic: boolean, seq: number) => {
            if (value) {
                const paths = value.markupPaths

                if (appContext.userId) {
                    setBanner(`저장 중...`)

                    const body = {
                        docId: value.selectedDocument.docKey.docId,
                        docVer: value.selectedDocument.docKey.docVer,
                        plantCode: value.selectedDocument.plantCode,
                        userId: appContext.userId,
                        title,
                        paths,
                        isPublic: isPublic ? 1 : 0,
                        seq: seq
                    }
                    console.log(body)
                    await Repository.updateMarkup(body)

                    setBanner(undefined)

                    appContext.setMarkupChanged(false)

                    pushCommand({ name: 'MarkupContentsChanged' })
                }
            }

            onClose()
        },
        [appContext, onClose, value]
    )

    const onMarkupCancel = useCallback(() => {
        onClose()
    }, [onClose])

    return (
        <div className="SaveMarkupFrame" hidden={!value}>
            <div className="SaveMarkup">
                <div className="Titlebar">
                    <div className="Text">마크업 저장하기</div>
                </div>
                <div className="Label01">제목</div>

                <TextField id="saveMarkup" value={title} placeHolder="제목을 입력하세요." onChange={setTitle} />
                <div className="Label02">공유</div>
                <div
                    className="CancelButton"
                    onClick={(e) => {
                        onMarkupCancel()

                        e.stopPropagation()
                    }}
                >
                    <div className="Text">취소</div>
                </div>
                <div
                    className={title.length !== 0 ? 'SaveButton' : 'DisabledSaveButton'}
                    onClick={(e) => {
                        if (0 < title.length) {
                            if (value?.isUpdate) {
                                onMarkupUpdate(title, isPublic, appContext.currentMarkup[0])
                            } else {
                                onMarkupSave(title, isPublic)
                            }
                        }
                        // else if (appContext.currentMarkup)

                        e.stopPropagation()
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
                            setPublic(true)
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
