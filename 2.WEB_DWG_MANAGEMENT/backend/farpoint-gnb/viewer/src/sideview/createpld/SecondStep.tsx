import React from 'react'
import { DocumentResult } from '../../types'
import './SecondStep.css'

type DocumentViewProps = {
    documents: DocumentResult[]
    selectedItems: Set<string>
    setSelectedItems: (set: Set<string>) => void
}

function DocumentListView({ documents, selectedItems, setSelectedItems }: DocumentViewProps) {
    // TODO:
    // 바깥에서 markup를 가져오는 게 아니라 Repository에서 직접 markup을 가져와야 한다.
    const getItems = (): JSX.Element[] => {
        const result: JSX.Element[] = []
        for (const document of documents) {
            result.push(
                <tr
                    key={document.docId}
                    className="RowItem"
                    onClick={() => {
                        const key = document.docId + '-' + document.docVer + '-' + document.plantCode
                        const newValues = new Set<string>(selectedItems)

                        if (newValues.has(key)) {
                            newValues.delete(key)
                        } else {
                            newValues.add(key)
                        }

                        setSelectedItems(newValues)
                    }}
                >
                    <td className="Item">
                        {selectedItems.has(document.docId + '-' + document.docVer + '-' + document.plantCode)
                            ? onImg
                            : offImg}
                        <span>{document.docName}</span>
                    </td>
                </tr>
            )
        }

        return result
    }

    return (
        <div className="ListView">
            <table>
                <tbody>{getItems()}</tbody>
            </table>
        </div>
    )
}
type Props = {
    documentList: DocumentResult[]
    selectedItems: Set<string>
    companyValue: string
    plantValue: string
    hogiValue: string
    procedureNumber: string
    procedureName: string
    pldNameValue: string
    pldDescValue: string
    setSelectedItems: (set: Set<string>) => void
    onStepChange: () => void
    allClear: () => void
    resisterPld: () => void
}

export const SecondStep = ({
    documentList,
    selectedItems,
    companyValue,
    plantValue,
    hogiValue,
    procedureNumber,
    procedureName,
    pldNameValue,
    pldDescValue,
    setSelectedItems,
    onStepChange,
    allClear,
    resisterPld
}: Props) => {
    const isActive = React.useCallback(() => {
        if (0 < selectedItems.size) return true

        return false
    }, [selectedItems.size])

    return (
        <>
            <div className="PldPreview">
                <table>
                    <tbody>
                        <tr>
                            <td className="Item">
                                <span>발전소</span>
                                <span>{`${companyValue} > ${plantValue} > ${hogiValue}`}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className="Item">
                                <span>절차서 번호</span>
                                <span>{procedureNumber}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className="Item">
                                <span>절차서 명</span>
                                <span>{procedureName}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className="Item">
                                <span>PLD 명</span>
                                <span>{pldNameValue}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <DocumentListView
                documents={documentList}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
            />
            <div className="ButtonView">
                <div className="PrevButton" onClick={onStepChange}>
                    이전
                </div>
                <div className="CancelButton" onClick={allClear}>
                    취소
                </div>
                <div
                    className={isActive() ? 'Enable SubmitButton' : 'Disable SubmitButton'}
                    onClick={() => {
                        resisterPld()
                    }}
                >
                    확인
                </div>
            </div>
        </>
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
