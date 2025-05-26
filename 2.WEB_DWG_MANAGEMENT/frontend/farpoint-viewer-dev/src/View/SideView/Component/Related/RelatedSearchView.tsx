import React from 'react'
import './RelatedSearchView.css'
import { useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore } from '../../../../Store/statusStore'
import AppStore from '../../../../Store/appStore'
// Api
import Api from '../../../../Api'
import related from '../../../../Api/related'

type RelatedFileListValue = {
    files: RelatedFileInfo[]
    x: number
    y: number
}

type FileSelectViewProps = {
    value: RelatedFileListValue | undefined
    handleBlur: () => void
    onClick: (e: React.MouseEvent<HTMLElement, MouseEvent>, file: RelatedFileInfo) => void
}

export function FileSelectView({ value, handleBlur, onClick }: FileSelectViewProps) {
    const hidden = value === undefined || value.files.length < 2

    const getItems = (): JSX.Element[] => {
        const element: JSX.Element[] = []

        if (value) {
            for (let file of value.files) {
                const resultColumn = (
                    <div
                        key={file.FILE_IDX}
                        className="FileSelectViewItem"
                        onClick={(e) => {
                            onClick(e, file)
                            e.stopPropagation()
                        }}
                    >
                        {`${file.FILENAME}.${file.DAPPL}`}
                        <div className="Underline" />
                    </div>
                )

                element.push(resultColumn)
            }
        }

        return element
    }

    const inputRef = React.createRef<HTMLDivElement>()

    React.useEffect(() => {
        if (!hidden) inputRef.current?.focus()
    })

    return (
        <div
            ref={inputRef}
            className="FileSelectView"
            hidden={hidden}
            style={{ left: value?.x + 'px', top: value?.y + 'px' }}
            tabIndex={0}
            onBlur={() => {
                handleBlur()
            }}
        >
            {getItems()}
        </div>
    )
}

type Props = {
    results: RelatedSearchResult[]
    hidden: boolean
    onCloseView: () => void
}

export default function RelatedSearchView({ hidden, onCloseView, results }: Props) {
    const [relatedDocument, setRelatedDocument] = React.useState<RelatedFileListValue>()
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    const userId = useRecoilValue(AppStore.userId)

    const openDocument = (info: RelatedFileInfo) => {
        const ext = info.DAPPL.toUpperCase()

        if (ext === 'HWP' || ext === 'JPG' || ext === 'XLS' || ext === 'PDF' || ext === 'TIF') {
            window.open(info.viewerUrl, 'FarpointExternalWindow')
        } else {
            setOkPopupValue({ message: `지원하지 않는 형식(${info.DAPPL})입니다.`, ok: () => {} })
        }
    }

    const onItemClick = async (e: React.MouseEvent<HTMLElement, MouseEvent>, item: RelatedSearchResult) => {
        // const userId = useRecoilValue(AppStore.userId)

        if (userId) {
            const files = await Api.related.getRelatedFileInfo(item.DOKAR, item.DOKVR, item.DOKTL, item.DOKNR, userId)

            if (1 === files.length) {
                const info = files[0]
                console.log('info1:', info);
                if (process.env.REACT_APP_DB === '한수원') {
                    const { url } = await related.openRelatedFileInfo(info)
                    setRelatedDocument(undefined)
                    window.open(url)
                } else {
                    openDocument(info)
                }
            } else if (1 < files.length) {
                const x = e.pageX
                const y = e.pageY

                setRelatedDocument({ files, x, y })
            }
        }
    }

    const getItems = (): JSX.Element[] => {
        const element: JSX.Element[] = []

        for (let result of results) {
            const resultColumn = (
                <tr
                    className="RowItem"
                    key={result.DOKAR + result.DOKNR + result.DOKVR + result.DOKTL}
                    onClick={(e) => onItemClick(e, result)}
                >
                    <td className="First"> {result.DOKARNM} </td>
                    <td className="Second"> {result.DOKNR} </td>
                    <td className="Third"> {result.DKTXT} </td>
                </tr>
            )

            element.push(resultColumn)
        }
        return element
    }

    const leftPos = 'var(--SearchMenuWidth)'
    const hiddenPos = 'calc(var(--RelatedSearchResultWidth) * -1)'
    const style = results.length === 0 || hidden ? { marginLeft: hiddenPos } : { marginLeft: leftPos }

    const setTitle = () => {
        const itemCount = getItems().length

        if (1000 <= itemCount) return itemCount + '건 이상'

        return itemCount + '건'
    }

    return (
        <div className="RelatedSearchView SideViewShadow" style={style} tabIndex={0}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">관련문서검색 결과 ({setTitle()}) </span>
            <div className="ListView">
                <table>
                    <thead className="Header">
                        <tr>
                            <th className="First">유형</th>
                            <th className="Second">문서번호</th>
                            <th className="Third">문서명</th>
                        </tr>
                    </thead>
                    <tbody>{getItems()}</tbody>
                </table>
            </div>
            <FileSelectView
                value={relatedDocument}
                onClick={async (e, file) => {
                    if (process.env.REACT_APP_DB === '한수원') {
                        const { url } = await related.openRelatedFileInfo(file)
                        setRelatedDocument(undefined)
                        window.open(url)
                    }
                    else{
                        const info = file
                        console.log('info2:', info);
                        setRelatedDocument(undefined)
                        openDocument(info)
                    }
                }}
                handleBlur={() => {
                    setRelatedDocument(undefined)
                }}
            />
        </div>
    )
}

const openButton = (
    <svg className="Arrow" width="24" height="25" fill="#5E6467">
        <path d="M12 15.1c-.495 0-.957-.193-1.301-.544l-3.555-3.633a.505.505 0 0 1 .005-.712.497.497 0 0 1 .707.005l3.556 3.634c.307.312.869.312 1.176 0l3.556-3.634a.497.497 0 0 1 .707-.005.505.505 0 0 1 .005.712l-3.555 3.633A1.806 1.806 0 0 1 12 15.1" />
    </svg>
)
