import React, { useContext } from 'react'
import { DocumentResult, PldInfo } from '../types'
import './MarkupListView.css'
import './common.css'
import { AppContext, pushCommand, setHandler, StatusContext } from '..'
import Repository from '../Repository'

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

export function ViewDocList() {
    const app = useContext(AppContext)
    const status = useContext(StatusContext)

    const [selectedItems, setSelectedItems] = React.useState(new Set<string>())
    const [value, setValue] = React.useState<string>()
    const [documentList, setDocumentList] = React.useState<DocumentResult[]>([])

    React.useEffect(() => {
        setHandler('addPldDoc', async (value: PldInfo) => {
            setValue(value.FOLID.toString())

            console.log(value)
        })
    }, [])

    React.useEffect(() => {
        async function fetch() {
            const values = await Repository.searchDocument(value, undefined, undefined)

            setDocumentList(values)
        }
        fetch()
    }, [value])

    const onClose = React.useCallback(() => {
        setValue(undefined)
    }, [])

    const onChangeCanvas = React.useCallback(() => {
        async function fetch() {
            if (app.userId) {
                const pldCanvasList = []
                const selectItemtoArray = Array.from(selectedItems)
                const { PLD_P_ID, PLD_C_ID, PLD_C_VR, DOCVR, CURRENT_YN, PLD_DOC_DESC } = app.pldDocumentList[0]
                let SEQ = app.pldDocumentList.length + 1

                for (let index = 0; index < selectItemtoArray.length; index++) {
                    const temp = {
                        PLD_P_ID,
                        PLD_C_ID,
                        PLD_C_VR,
                        DOCNO: selectItemtoArray[index].toString().split('-')[0],
                        DOCVR,
                        PLD_DOC_DESC: '',
                        CURRENT_YN,
                        SEQ,
                        USER_ID: app.userId
                    }

                    pldCanvasList.push(temp)
                    SEQ++
                }

                await Repository.changePldCanvas(pldCanvasList)
                selectedItems.clear()

                if (null !== app.currentPld && app.pldMode) {
                    Repository.getPldDocumentList(app.currentPld?.PLD_C_ID, app.currentPld?.PLD_C_VR).then((res) => {
                        app.setPldDocumentList(res)
                    })
                }

                status.onMenuChange('process')

                onClose()
            }
        }
        fetch()
    }, [app, selectedItems, value, status, onClose])

    return (
        <div className="SelectMarkupFrame" hidden={!value}>
            <div className="SelectMarkup">
                <div className="Titlebar">
                    <div className="Text">PLD 도면 추가</div>
                </div>

                <DocumentListView
                    documents={documentList}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                />

                <div className="CancelLoadButton" onClick={onClose}>
                    <div className="Text">취소</div>
                </div>
                <div
                    className={selectedItems.size !== 0 ? 'LoadButton' : 'DisabledLoadButton'}
                    onClick={onChangeCanvas}
                >
                    <div className="Text">확인</div>
                </div>
            </div>
        </div>
    )
}
