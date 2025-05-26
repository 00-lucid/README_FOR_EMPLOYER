import React, { useDebugValue, useEffect } from 'react'
import { DrawingPath, MarkupContent } from '../types'
import './MarkupListView.css'
import './common.css'
import { pushCommand, setHandler, AppContext } from '..'

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

type MarkupViewProps = {
    markups: MarkupContent[]
    selectedItems: Set<string>
    setSelectedItems: (set: Set<string>) => void
    isLoad: boolean
}

function MarkupListView({ markups, selectedItems, setSelectedItems, isLoad }: MarkupViewProps) {
    // TODO:
    // 바깥에서 markup를 가져오는 게 아니라 Repository에서 직접 markup을 가져와야 한다.
    const getItems = (): JSX.Element[] => {
        const result: JSX.Element[] = []

        for (const markup of markups) {
            result.push(
                <tr
                    key={markup.seq}
                    className="RowItem"
                    onClick={() => {
                        if (isLoad) {
                            const key = markup.seq
                            const newValues = new Set<string>()

                            newValues.add(key)
                            console.log('newValues:', newValues)
                            setSelectedItems(newValues)
                        } else {
                            const key = markup.seq
                            const newValues = new Set<string>(selectedItems)

                            if (newValues.has(key)) {
                                newValues.delete(key)
                            } else {
                                newValues.add(key)
                            }
                            console.log('newValues:', newValues)
                            setSelectedItems(newValues)
                        }
                    }}
                >
                    <td className="Item">
                        {selectedItems.has(markup.seq) ? onImg : offImg}
                        <span>{markup.title}</span>
                    </td>
                    <td className="Item"> {markup.writer.name} </td>
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
                        <th className="Title">제목</th>
                        <th className="Writer">작성자</th>
                        <th className="Date">작성일시</th>
                    </tr>
                </thead>
                <tbody>{getItems()}</tbody>
            </table>
            {!isLoad ? (
                <div className="Total" onClick={onTotalChange}>
                    {selectedItems.size === markups.length ? onImg : offImg}
                </div>
            ) : (
                <div></div>
            )}
        </div>
    )
}

type ViewMarkupListValue = {
    markups: MarkupContent[]
    selectedItems: Set<string>
    onMarkupView: (selectedItems: Set<string>) => void
    onMarkupDelete: (selectedItems: Set<string>) => void
    onMarkupCancel: () => void
}

export function ViewMarkupList() {
    const [value, setValue] = React.useState<ViewMarkupListValue>()
    const [selectedItems, setSelectedItems] = React.useState(new Set<string>())

    React.useEffect(() => {
        setHandler('viewMarkupList', async (value: ViewMarkupListValue) => {
            setValue(value)

            setSelectedItems(new Set<string>(value.selectedItems))
        })
    }, [])

    const onClose = React.useCallback(() => {
        setValue(undefined)
    }, [])

    const cancelMarkups = () => {
        if (value) {
            value.onMarkupCancel()
        }

        onClose()
    }

    const viewMarkups = () => {
        if (value) {
            const values: string[] = []

            for (const markup of value.markups) {
                if (selectedItems.has(markup.seq)) {
                    values.push(markup.seq)
                }
            }

            value.onMarkupView(selectedItems)
        }

        onClose()
    }

    const deleteMarkups = () => {
        if (0 < selectedItems.size) {
            const confirmValue = {
                message: '삭제하시겠습니까?',
                yes: () => {
                    if (value) {
                        value.onMarkupDelete(selectedItems)
                        onClose()
                    }
                },
                no: () => {}
            }

            pushCommand({ name: 'requestYesNo', value: confirmValue })
        }
    }

    return (
        <div className="SelectMarkupFrame" hidden={!value}>
            <div className="SelectMarkup">
                <div className="Titlebar">
                    <div className="Text">마크업 보기</div>
                </div>

                <MarkupListView
                    markups={value ? value.markups : []}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    isLoad={false}
                />
                <div
                    className="CancelViewButton"
                    onClick={(e) => {
                        cancelMarkups()

                        e.stopPropagation()
                    }}
                >
                    <div className="Text">닫기</div>
                </div>
                <div
                    className={selectedItems.size !== 0 ? 'DeleteButton ' : 'DisabledDeleteButton'}
                    onClick={(e) => {
                        deleteMarkups()

                        e.stopPropagation()
                    }}
                >
                    <div className="Text">삭제</div>
                </div>
                <div
                    className={selectedItems.size !== 0 ? 'ViewButton' : 'DisabledViewButton'}
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

type LoadMarkupListValue = {
    markups: MarkupContent[]
    onMarkupLoad: (values: DrawingPath[]) => void
    setUndoList: any
    setRedoList: any
}

export function LoadMarkupList() {
    const appContext = React.useContext(AppContext)
    const [value, setValue] = React.useState<LoadMarkupListValue>()
    const [selectedItems, setSelectedItems] = React.useState(new Set<string>())

    React.useEffect(() => {
        setHandler('loadMarkupList', async (value: LoadMarkupListValue) => {
            setValue(value)
            setSelectedItems(new Set<string>())
        })
    }, [])

    const onClose = React.useCallback(() => {
        setValue(undefined)
    }, [])

    const loadMarkups = () => {
        let arr = []
        const values: DrawingPath[] = []
        if (selectedItems.size === 0) return

        if (value) {
            for (const markup of value.markups) {
                if (selectedItems.has(markup.seq)) {
                    values.push(...markup.paths)
                    arr.push(Number(Array.from(selectedItems)[0]), markup.title)
                }
            }
        }
        value?.onMarkupLoad(values)
        appContext.setCurrentMarkup([...arr])
        value?.setUndoList([])
        value?.setRedoList([])
        onClose()
    }

    return (
        <div className="SelectMarkupFrame" hidden={!value}>
            <div className="SelectMarkup">
                <div className="Titlebar">
                    <div className="Text">마크업 불러오기</div>
                </div>

                <MarkupListView
                    markups={value ? value.markups : []}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    isLoad={true}
                />

                <div className="CancelLoadButton" onClick={onClose}>
                    <div className="Text">취소</div>
                </div>
                <div
                    className={selectedItems.size !== 0 ? 'LoadButton' : 'DisabledLoadButton'}
                    onClick={() => {
                        loadMarkups()
                    }}
                >
                    <div className="Text">확인</div>
                </div>
            </div>
        </div>
    )
}
