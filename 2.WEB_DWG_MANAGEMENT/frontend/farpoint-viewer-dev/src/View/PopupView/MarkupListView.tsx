import React from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import { MarkUpStore, StatusStore } from '../../Store/statusStore'
import AppStore from '../../Store/appStore'
import Api from '../../Api'

const offImg = (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(-21 -155)" fill="none" fillRule="evenodd">
            <path fill="var(--icon-toolbar-foreground)" opacity=".15" d="M23.5 176.5h19v-19h-19z" />
            <path stroke="gray" d="M23.5 176.5h19v-19h-19z" />
        </g>
    </svg>
)

const onImg = (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(-21 -210)" fill="none" fillRule="evenodd">
            <path fill="var(--icon-toolbar-foreground)" opacity=".15" d="M23.5 231.5h19v-19h-19z" />
            <path stroke="gray" d="M23.5 231.5h19v-19h-19z" />
            <path stroke="var(--icon-toolbar-foreground)" d="m26.5 220.5 5.167 5.167L40 217.333" />
        </g>
    </svg>
)

function MarkupListView({ markups, selectedItems, setSelectedItems }: MarkupViewProps) {
    const isShowMarkupPopup = useRecoilValue(MarkUpStore.isShowMarkupPopup)
    const getItems = (): JSX.Element[] => {
        const result: JSX.Element[] = []

        for (const markup of markups) {
            result.push(
                <tr
                    key={markup.seq}
                    className="RowItem"
                    onClick={() => {
                        if (isShowMarkupPopup?.message !== 'load') {
                            const key = markup.seq
                            const newValues = new Set<string>(selectedItems)

                            if (newValues.has(key)) {
                                newValues.delete(key)
                            } else {
                                newValues.add(key)
                            }

                            setSelectedItems(newValues)
                        } else {
                            const key = markup.seq
                            const newValues = new Set<string>()

                            newValues.add(key)
                            setSelectedItems(newValues)
                        }
                    }}
                >
                    <td className="Item">
                        {selectedItems.has(markup.seq) ? onImg : offImg}
                        {/* <span>{markup.title}</span> */}
                    </td>
                    <td className="Item"> {markup.title} </td>
                    <td className="Item"> {markup.writer.userId} </td>
                    <td className="Item"> {markup.createDate} </td>
                </tr>
            )
        }

        return result
    }

    const onTotalChange = () => {
        if (selectedItems.size === markups.length) {
            setSelectedItems(new Set<string>())
        } else {
            const newValues = new Set<string>()

            for (const markup of markups) {
                newValues.add(markup.seq)
            }

            setSelectedItems(newValues)
        }
    }

    return (
        <div className="ListView">
            <table>
                <thead className="Header">
                    <tr>
                        {isShowMarkupPopup?.message !== 'load' ? (
                            <th className="Total" onClick={onTotalChange}>
                                {selectedItems.size === markups.length ? onImg : offImg}
                            </th>
                        ) : (
                            <th />
                        )}
                        <th className="Title">제목</th>
                        <th className="Writer">작성자</th>
                        <th className="Date">작성일시</th>
                    </tr>
                </thead>
                <tbody>{getItems()}</tbody>
            </table>
        </div>
    )
}

export function ViewMarkupList() {
    // 전역 Store
    const [isShowMarkupPopup, setIsShowMarkupPopup] = useRecoilState(MarkUpStore.isShowMarkupPopup)
    const markupContents = useRecoilValue(MarkUpStore.markupContents)
    const [selectedMarkupItems, setSelectedMarkupItems] = useRecoilState(MarkUpStore.selectedMarkupItems)

    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const userId = useRecoilValue(AppStore.userId)
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)

    const setMarkupPaths = useSetRecoilState(MarkUpStore.markupPaths)
    const setMarkupContents = useSetRecoilState(MarkUpStore.markupContents)

    const onClose = React.useCallback(() => {
        setIsShowMarkupPopup(undefined)
    }, [setIsShowMarkupPopup])

    const onMarkupDelete = React.useCallback(
        async (selectedItems: Set<string>) => {
            if (selectedCanvas?.documentCtx) {
                if (userId) {
                    const values: string[] = []
                    for (const markup of markupContents) {
                        if (selectedItems.has(markup.seq)) {
                            values.push(markup.seq)
                        }
                    }

                    const body = {
                        docId: selectedCanvas.documentCtx.docId,
                        docVer: selectedCanvas.documentCtx.docVer,
                        plantCode: selectedCanvas.documentCtx.plantCode,
                        userId: userId,
                        seqs: values,
                    }

                    const res = await Api.markup.deleteMarkup(body)
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
                            isShowMarkupPopup?.nextAction()
                        }
                    }
                }
            }
        },
        [markupContents, setMarkupContents, userId, selectedCanvas?.documentCtx, isShowMarkupPopup]
    )

    const viewMarkups = React.useCallback(() => {
        const values: DrawingPath[] = []
        if (selectedMarkupItems.size === 0) return
        for (const markup of markupContents) {
            if (selectedMarkupItems.has(markup.seq)) {
                values.push(...markup.paths)
            }
        }
        setMarkupPaths(values)
        onClose()
    }, [markupContents, onClose, selectedMarkupItems, setMarkupPaths])

    const deleteMarkups = React.useCallback(() => {
        if (0 < selectedMarkupItems.size) {
            const confirmValue = {
                message: '삭제하시겠습니까?',
                yes: () => {
                    onMarkupDelete(selectedMarkupItems)
                    onClose()
                },
                no: () => {},
                nextAction: () => {},
            }
            setYesNoPopupValue(confirmValue)
        }
    }, [onClose, onMarkupDelete, selectedMarkupItems, setYesNoPopupValue])

    return (
        <div className="SelectMarkupFrame" hidden={isShowMarkupPopup?.message !== 'list'} onClick={onClose}>
            <div className="SelectMarkup" onClick={(e) => e.stopPropagation()}>
                <div className="Titlebar">
                    <div className="Text">마크업 보기</div>
                </div>
                {/* 마크업 리스트 */}
                <MarkupListView markups={markupContents} selectedItems={selectedMarkupItems} setSelectedItems={setSelectedMarkupItems} />
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
                    className={selectedMarkupItems.size !== 0 ? 'DeleteButton ' : 'DisabledDeleteButton'}
                    onClick={(e) => {
                        deleteMarkups()
                        e.stopPropagation()
                    }}
                >
                    <div className="Text">삭제</div>
                </div>
                <div
                    className={selectedMarkupItems.size !== 0 ? 'ViewButton' : 'DisabledViewButton'}
                    onClick={(e) => {
                        viewMarkups()
                        e.stopPropagation()
                    }}
                >
                    <div className="Text">보기</div>
                </div>
            </div>
        </div>
    )
}

export function LoadMarkupList() {
    // 전역 Store
    const [isShowMarkupPopup, setIsShowMarkupPopup] = useRecoilState(MarkUpStore.isShowMarkupPopup)
    const [selectedMarkupItems, setSelectedMarkupItems] = useRecoilState(MarkUpStore.selectedMarkupItems)
    const markupContents = useRecoilValue(MarkUpStore.markupContents)

    const setCurrentMarkupTitle = useSetRecoilState(MarkUpStore.currentMarkupTitle)
    const setMarkupPaths = useSetRecoilState(MarkUpStore.markupPaths)

    const onClose = React.useCallback(() => {
        setIsShowMarkupPopup(undefined)
    }, [setIsShowMarkupPopup])

    // 불러오기 선택한 마크업 데이터 적용.
    const loadMarkups = React.useCallback(() => {
        const values: DrawingPath[] = []
        if (selectedMarkupItems.size === 0) return
        for (const markup of markupContents) {
            if (selectedMarkupItems.has(markup.seq)) {
                values.push(...markup.paths)
                setCurrentMarkupTitle(markup.title)
            }
        }
        setMarkupPaths(values)
        onClose()
    }, [markupContents, onClose, selectedMarkupItems, setMarkupPaths, setCurrentMarkupTitle])

    return (
        <div className="SelectMarkupFrame" hidden={isShowMarkupPopup?.message !== 'load'}>
            <div className="SelectMarkup">
                <div className="Titlebar">
                    <div className="Text">마크업 불러오기</div>
                </div>

                {/* 마크업 리스트 */}
                <MarkupListView markups={markupContents} selectedItems={selectedMarkupItems} setSelectedItems={setSelectedMarkupItems} />

                <div className="CancelLoadButton" onClick={onClose}>
                    <div className="Text">취소</div>
                </div>
                <div className={selectedMarkupItems.size !== 0 ? 'LoadButton' : 'DisabledLoadButton'} onClick={loadMarkups}>
                    <div className="Text">확인</div>
                </div>
            </div>
        </div>
    )
}
