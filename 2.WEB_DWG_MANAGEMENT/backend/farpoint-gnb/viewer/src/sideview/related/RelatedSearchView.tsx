import React from 'react'
import './RelatedSearchView.css'
import { RelatedSearchResult } from '../../types'
import { CloseResultView } from './CloseResultView'
import { AppContext, pushCommand, RelatedFileInfo } from '../..'
import Repository from '../../Repository'

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
                        key={file.FILENAME}
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
    const appContext = React.useContext(AppContext)

    const [relatedDocument, setRelatedDocument] = React.useState<RelatedFileListValue>()

    const openDocument = (info: RelatedFileInfo) => {
        const ext = info.DAPPL.toUpperCase()

        if (ext === 'HWP' || ext === 'JPG' || ext === 'XLS' || ext === 'PDF') {
            window.open(info.viewerUrl, 'FarpointExternalWindow')
        } else {
            pushCommand({
                name: 'requestOk',
                value: { message: `지원하지 않는 형식(${info.DAPPL})입니다.`, ok: () => {} }
            })
        }
    }

    const onItemClick = async (e: React.MouseEvent<HTMLElement, MouseEvent>, item: RelatedSearchResult) => {
        if (appContext.userId) {
            const files = await Repository.getRelatedFileInfo(
                item.DOKAR,
                item.DOKVR,
                item.DOKTL,
                item.DOKNR,
                appContext.userId
            )

            if (1 === files.length) {
                const info = files[0]

                openDocument(info)
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
            <CloseResultView />
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
                onClick={(e, file) => {
                    openDocument(file)
                    setRelatedDocument(undefined)
                }}
                handleBlur={() => {
                    setRelatedDocument(undefined)
                }}
            />
        </div>
    )
}
