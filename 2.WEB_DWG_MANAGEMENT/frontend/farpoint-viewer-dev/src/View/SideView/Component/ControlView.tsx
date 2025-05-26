import { useRecoilValue, useSetRecoilState } from 'recoil'
import { addMydocFolder, deleteMydocFolder, mydocFileUpload, renameMydocFolder } from '../../../Api/mydoc'
import AppStore from '../../../Store/appStore'
import { StatusStore } from '../../../Store/statusStore'
import './ControlView.css'

export function ControlView({
    selectedFolder,
    setSelectedFolder,
    reload,
}: {
    selectedFolder: MydocFolder | undefined
    setSelectedFolder: (list: MydocFolder | undefined) => void
    reload: () => Promise<void>
}) {
    const userId = useRecoilValue<string | undefined>(AppStore.userId)
    const setInputPopupValue = useSetRecoilState(StatusStore.inputPopupValue)
    const setWarningPopupValue = useSetRecoilState(StatusStore.warningPopupValue)
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    const setBanner = useSetRecoilState(StatusStore.banner)

    return (
        <div className="ControlView">
            <div
                className={selectedFolder ? 'Button' : 'DisableButton'}
                onClick={() => {
                    if (selectedFolder) {
                        setInputPopupValue({
                            title: '폴더 생성',
                            placeholder: '이름을 입력하세요.',
                            value: '',
                            ok: async (value: string) => {
                                if (userId && selectedFolder) {
                                    setBanner('생성 중...')
                                    await addMydocFolder(userId, selectedFolder.id, value)

                                    await reload()
                                }
                            },
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
                                if (userId) {
                                    setBanner('삭제 중...')
                                    await deleteMydocFolder(userId, selectedFolder.id)

                                    setSelectedFolder(undefined)

                                    await reload()
                                }
                            },
                            no: () => {},
                        }

                        setWarningPopupValue(confirmValue)
                    }
                }}
            >
                <div className="TextLabel">삭제</div>
            </div>
            <div
                className={selectedFolder && selectedFolder.id !== 'root' ? 'Button' : 'DisableButton'}
                onClick={() => {
                    if (selectedFolder && selectedFolder.id !== 'root') {
                        setInputPopupValue({
                            title: '폴더 변경',
                            placeholder: '이름을 입력하세요.',
                            value: selectedFolder.folderName,
                            ok: async (value: string) => {
                                if (userId) {
                                    setBanner('변경 중...')
                                    await renameMydocFolder(userId, selectedFolder.id, value)

                                    await reload()
                                }
                            },
                        })
                    }
                }}
            >
                <div className="TextLabel">변경</div>
            </div>
            <div className="SeparateLine" />
            <div className={selectedFolder && selectedFolder.folderName !== userId ? 'Button' : 'DisableButton'}>
                <label className="TextLabel" htmlFor="mydocUploadButton">
                    올리기
                </label>
                {selectedFolder && selectedFolder.folderName !== userId && (
                    <input
                        id="mydocUploadButton"
                        type="file"
                        onChange={async (e) => {
                            if (e.target.files && selectedFolder && userId) {
                                const file = e.target.files[0]
                                const rule = /^[a-zA-Z0-9\.\-_]*$/

                                if (!rule.test(file.name)) {
                                    setOkPopupValue({
                                        message: '파일명은 공백없이 숫자, 대소문자, -, _ 로만 구성되야 해요',
                                        ok: () => {},
                                    })
                                    e.target.value = ''
                                    return
                                }

                                if (file) {
                                    setBanner('업로드 중...')
                                    await mydocFileUpload(userId, selectedFolder.id, file)

                                    await reload()
                                }
                            }
                            e.target.value = ''
                        }}
                    />
                )}
            </div>
        </div>
    )
}
