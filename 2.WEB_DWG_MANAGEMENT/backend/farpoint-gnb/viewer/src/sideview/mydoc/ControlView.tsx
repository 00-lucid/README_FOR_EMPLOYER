import React from 'react'
import { pushCommand, AppContext } from '../..'
import Repository from '../../Repository'
import { MydocList, setBanner } from '../..'
import './ControlView.css'

export function ControlView({
    selectedFolder,
    setSelectedFolder,
    reload
}: {
    selectedFolder: MydocList | undefined
    setSelectedFolder: (list: MydocList | undefined) => void
    reload: () => Promise<void>
}) {
    const app = React.useContext(AppContext)

    return (
        <div className="ControlView">
            <div
                className={selectedFolder ? 'Button' : 'DisableButton'}
                onClick={() => {
                    if (selectedFolder) {
                        pushCommand({
                            name: 'showInputView',
                            value: {
                                title: '폴더 생성',
                                placeholder: '이름을 입력하세요.',
                                value: '',
                                ok: async (value: string) => {
                                    if (app.userId && selectedFolder) {
                                        setBanner('생성 중...')
                                        await Repository.addMydocFolder(app.userId, selectedFolder.id, value)

                                        await reload()
                                    }
                                }
                            }
                        })
                    }
                }}
            >
                <div className="TextLabel">생성</div>
            </div>
            <div
                className={selectedFolder && selectedFolder.id !== 'root' ? 'Button' : 'DisableButton'}
                onClick={() => {
                    if (selectedFolder && selectedFolder.id !== 'root') {
                        const confirmValue = {
                            title: '폴더 삭제',
                            message: '삭제할까요?',
                            submessage: '폴더 안의 모든 내용이 삭제됩니다.',
                            yes: async () => {
                                if (app.userId) {
                                    setBanner('삭제 중...')
                                    await Repository.deleteMydocFolder(app.userId, selectedFolder.id)

                                    setSelectedFolder(undefined)

                                    await reload()
                                }
                            },
                            no: () => {}
                        }

                        pushCommand({ name: 'showWarningView', value: confirmValue })
                    }
                }}
            >
                <div className="TextLabel">삭제</div>
            </div>
            <div
                className={selectedFolder && selectedFolder.id !== 'root' ? 'Button' : 'DisableButton'}
                onClick={() => {
                    if (selectedFolder && selectedFolder.id !== 'root') {
                        pushCommand({
                            name: 'showInputView',
                            value: {
                                title: '폴더 변경',
                                placeholder: '이름을 입력하세요.',
                                value: selectedFolder.folderName,
                                ok: async (value: string) => {
                                    if (app.userId) {
                                        setBanner('변경 중...')
                                        await Repository.renameMydocFolder(app.userId, selectedFolder.id, value)

                                        await reload()
                                    }
                                }
                            }
                        })
                    }
                }}
            >
                <div className="TextLabel">변경</div>
            </div>
            <div className="SeparateLine" />
            <div className={selectedFolder ? 'Button' : 'DisableButton'}>
                <label className="TextLabel" htmlFor="mydocUploadButton">
                    올리기
                </label>
                <input
                    id="mydocUploadButton"
                    type="file"
                    disabled={selectedFolder === undefined}
                    onChange={async (e) => {
                        if (e.target.files && selectedFolder && app.userId) {
                            const file = e.target.files[0]

                            if (file) {
                                setBanner('업로드 중...')
                                await Repository.mydocFileUpload(app.userId, selectedFolder.id, file)

                                await reload()
                            }
                        }
                        e.target.value = ''
                    }}
                />
            </div>
        </div>
    )
}
