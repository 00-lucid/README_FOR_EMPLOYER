import React from 'react'
import './DocumentListView.css'
import { useRecoilState, useRecoilValue } from 'recoil'
// 전역 Store
import { StatusStore, PldStore } from '../../Store/statusStore'
// Component
import Select from '../CommonView/Select'
// Lib
import cn from 'classnames'

// 공용(PLD생성 도면목록 선택, PLD 도면변경 리스트)
export function DocumentListView({
    hogiItems,
    isPopup,
    selectedDocListSet,
    setSelectedDocListSet,
}: {
    hogiItems: SelectItem[]
    isPopup: boolean
    selectedDocListSet: Set<string>
    setSelectedDocListSet: React.Dispatch<React.SetStateAction<Set<string>>>
}) {
    // 전역 Store
    const [documentListFiltered, setDocumentListFiltered] = useRecoilState(PldStore.documentListFiltered)
    const [hogiValue, setHogiValue] = React.useState<SelectItem | undefined>(undefined)
    const [hogiSubCtgValue, setHogiSubCtgValue] = React.useState<SelectItem | undefined>(undefined)
    const [hogiSubCtgItems, setHogiSubCtgItems] = React.useState<SelectItem[]>([])

    const mapFolderList = useRecoilValue(StatusStore.mapFolderList)
    const mapDocItemList = useRecoilValue(StatusStore.mapDocItemList)
    const currentPld = useRecoilValue(PldStore.currentPld)

    const currentPldRef = React.useRef<PldInfo | undefined>(undefined)

    // 초기화
    React.useEffect(() => {
        if (currentPldRef.current !== currentPld) {
            currentPldRef.current = currentPld
            setHogiValue(undefined)
            setHogiSubCtgValue(undefined)
            setHogiSubCtgItems([])
            setDocumentListFiltered([])
        }
    }, [currentPld, setDocumentListFiltered])

    // 호기 셀렉트 변경 이벤트
    const hogiValueChange = React.useCallback(
        (item: SelectItem) => {
            setHogiValue(item)
            const newFolderList = mapFolderList.get(item.value)
            if (newFolderList) {
                setHogiSubCtgItems(newFolderList)
                setHogiSubCtgValue(undefined)
                setDocumentListFiltered([])
            } else {
                const newDocumentList = mapDocItemList.get(item.value)
                if (newDocumentList) setDocumentListFiltered(newDocumentList)
            }
        },
        [setDocumentListFiltered, setHogiValue, setHogiSubCtgItems, mapDocItemList, setHogiSubCtgValue, mapFolderList]
    )

    const subSelectValueChange = React.useCallback(
        (item: SelectItem) => {
            setHogiSubCtgValue(item)
            const newDocumentList = mapDocItemList.get(item.value)
            if (newDocumentList) setDocumentListFiltered(newDocumentList)
        },
        [setDocumentListFiltered, setHogiSubCtgValue, mapDocItemList]
    )

    return (
        <div className="ListView">
            <Select id={'Hogi'} items={hogiItems} placeHolder={'호기'} value={hogiValue?.value} onChange={hogiValueChange} />
            {hogiSubCtgItems.length > 0 ? (
                <Select
                    id={'Hogi'}
                    items={hogiSubCtgItems}
                    placeHolder={'계통'}
                    value={hogiSubCtgValue?.value}
                    onChange={subSelectValueChange}
                />
            ) : null}
            {/* 도면 체크박스 리스트 */}
            <table>
                <tbody>
                    {documentListFiltered.map((docItem) => {
                        const { docId, docVer, plantCode, docName } = docItem
                        const key = docId + '-' + docVer + '-' + plantCode
                        return (
                            <tr
                                key={docId}
                                className="RowItem"
                                onClick={() => {
                                    const newValues = new Set<string>(selectedDocListSet)

                                    if (newValues.has(key)) {
                                        newValues.delete(key)
                                    } else {
                                        newValues.add(key)
                                    }

                                    setSelectedDocListSet(newValues)
                                }}
                            >
                                <td className={cn('checkBoxItem', 'Item', isPopup ? 'popup' : '')}>
                                    {selectedDocListSet.has(docId + '-' + docVer + '-' + plantCode) ? onImg : offImg}
                                    <span title={docName}>{docName}</span>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

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
            <path stroke="black" fill="var(--icon-toolbar-foreground)" opacity=".15" d="M23.5 231.5h19v-19h-19z" />
            <path stroke="black" d="M23.5 231.5h19v-19h-19z" />
            <path stroke="black" d="m26.5 220.5 5.167 5.167L40 217.333" />
        </g>
    </svg>
)
