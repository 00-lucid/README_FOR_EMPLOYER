import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
// 전역 Store
import { StatusStore } from '../../Store/statusStore'
import Api from '../../Api'

function ISOListView({ ISODrawList, selectedISODraw, setSelectedISODraw }: ISOViewProps) {
    const getItems = (): JSX.Element[] => {
        const result: JSX.Element[] = []

        for (const info of ISODrawList) {
            result.push(
                <tr
                    key={info.FUCNTION + ' ' + info.DRAW + ' ' + info.OBJ}
                    className={selectedISODraw.has(info.FUCNTION + ' ' + info.DRAW + ' ' + info.OBJ) ? 'RowItem Focus' : 'RowItem'}
                    onClick={() => {
                        const key = info.FUCNTION + ' ' + info.DRAW + ' ' + info.OBJ
                        const newValues = new Set<string>(selectedISODraw)
                        if (!newValues.has(key)) {
                            newValues.clear()
                            newValues.add(key)
                        }

                        setSelectedISODraw(newValues)
                    }}
                >
                    <td className="Item First">
                        <span>{info.OBJ}</span>
                    </td>
                    <td className="Item Second"> {info.DRAW} </td>
                    <td className="Item Third"> {info.EQUIPMENT} </td>
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
                        <th className="Title">유형</th>
                        <th className="Writer">도면</th>
                        <th className="Date">설비번호</th>
                    </tr>
                </thead>
                <tbody>{getItems()}</tbody>
            </table>
        </div>
    )
}

export function ViewISOList() {
    // 전역 Store
    const [isShowISOPopup, setIsShowISOPopup] = useRecoilState(StatusStore.isShowISOPopup)
    // const ISOList = useRecoilValue(StatusStore.ISOList)
    const ISODrawList = useRecoilValue(StatusStore.ISODrawList)
    const [selectedISODraw, setSelectedISODraw] = useRecoilState(StatusStore.selectISOInfo)

    const onClose = React.useCallback(() => {
        setIsShowISOPopup(undefined)
        setSelectedISODraw(new Set<string>())
    }, [setIsShowISOPopup, setSelectedISODraw])

    const loadISOFile = () => {
        // DOKAR = 문서유형 = OBJ
        // DOKNR = 문서번호 = DRAW
        const [tplnr, doknr, dokar] = Array.from(selectedISODraw)[0].split(' ')
        const fetch = async () => {
            const { url } = await Api.equipment.getISOFile(dokar, doknr)
            window.open(url)
        }

        fetch()
    }

    return (
        <div className="SelectMarkupFrame" hidden={isShowISOPopup?.message !== 'list'} onClick={onClose}>
            <div className="SelectMarkup" onClick={(e) => e.stopPropagation()}>
                <div className="Titlebar">
                    <div className="Text">ISO 보기</div>
                </div>
                {/* ISO 리스트 */}
                <ISOListView ISODrawList={ISODrawList} selectedISODraw={selectedISODraw} setSelectedISODraw={setSelectedISODraw} />
                {/* 하단 버튼 */}
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
                    className={selectedISODraw.size !== 0 ? 'ViewButton' : 'DisabledViewButton'}
                    onClick={(e) => {
                        loadISOFile()
                        e.stopPropagation()
                    }}
                >
                    <div className="Text">보기</div>
                </div>
            </div>
        </div>
    )
}
