import React from 'react'
import './PiMimicListView.css'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore } from '../../Store/statusStore'

function MimicListView({ MimicList, selectedMimic, setSelectedMimic }: MimicViewProps) {
    const getItems = (): JSX.Element[] => {
        const result: JSX.Element[] = []

        for (const mimic of MimicList) {
            result.push(
                <tr
                    key={`${mimic.PI_URL} ${mimic.FOLDER_ID} ${mimic.PI_NM}`}
                    className={selectedMimic.has(`${mimic.PI_URL} ${mimic.FOLDER_ID} ${mimic.PI_NM}`) ? 'RowItem Focus' : 'RowItem'}
                    onClick={() => {
                        const key = `${mimic.PI_URL} ${mimic.FOLDER_ID} ${mimic.PI_NM}`
                        const newValues = new Set<string>(selectedMimic)
                        if (!newValues.has(key)) {
                            newValues.clear()
                            newValues.add(key)
                        }

                        setSelectedMimic(newValues)
                    }}
                >
                    <td className="Item First">
                        <span>{mimic.FOLDER_ID}</span>
                    </td>
                    <td className="Item Second"> {mimic.PI_NM} </td>
                    {/* <td className="Item Third"> {mimic.PI_NO} </td> */}
                </tr>
            )
        }

        return result
    }

    return (
        <div className="ListView">
            <table>
                <thead className="Header">
                    <tr>
                        <th className="Title">폴더번호</th>
                        <th className="Writer">이름</th>
                        {/* <th className="Date">번호</th> */}
                    </tr>
                </thead>
                <tbody>{getItems()}</tbody>
            </table>
        </div>
    )
}

export function ViewPiMimicList() {
    // 전역 Store
    const [isShowPiMimicPopup, setIsShowPiMimicPopup] = useRecoilState(StatusStore.isShowPiMimicPopup)
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)

    const MimicList = useRecoilValue(StatusStore.MimicList)
    const [selectedMimic, setSelectedMimic] = useRecoilState(StatusStore.selectMimic)

    const onClose = React.useCallback(() => {
        setIsShowPiMimicPopup(undefined)
        setSelectedMimic(new Set<string>())
    }, [setIsShowPiMimicPopup, setSelectedMimic])

    const openPiURL = () => {
        // Open PI_URL
        const [url] = Array.from(selectedMimic)[0].split(' ')
        window.open(url)
    }

    return (
        <div className="SelectMimicFrame" hidden={isShowPiMimicPopup?.message !== 'list'} onClick={onClose}>
            <div className="SelectMimic" onClick={(e) => e.stopPropagation()}>
                <div className="Titlebar">
                    <div className="Text">Mimic 보기</div>
                </div>
                {/* PI Mimic 리스트 */}
                <MimicListView MimicList={MimicList} selectedMimic={selectedMimic} setSelectedMimic={setSelectedMimic} />
                {/* 하단 버튼 */}
                {/* <div
                    className="InstallViewButton"
                    onClick={(e) => {
                        setOkPopupValue({
                            message: "그룹웨어 소프트웨어 프라자 자료실에서 설치 할 수 있어요",
                            ok: () => {}
                        })
                        e.stopPropagation()
                    }}
                >
                    <div className="Text">PI 시스템 설치</div>
                </div> */}
                <div
                    className="CancelViewButton"
                    onClick={(e) => {
                        onClose()
                        e.stopPropagation()
                    }}
                >
                    <div className="Text">닫기</div>
                </div>
                <div
                    className={selectedMimic.size !== 0 ? 'ViewButton' : 'DisabledViewButton'}
                    onClick={(e) => {
                        if (selectedMimic.size !== 0) {
                            openPiURL()
                            e.stopPropagation()
                        }
                    }}
                >
                    <div className="Text">보기</div>
                </div>
            </div>
        </div>
    )
}
