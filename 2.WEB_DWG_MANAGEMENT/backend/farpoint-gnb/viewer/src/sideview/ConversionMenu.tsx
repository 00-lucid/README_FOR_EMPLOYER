import { useContext, useEffect, useState } from 'react'
import { pushCommand } from '../common'
import { AppContext, StatusContext } from '../context'
import { resetPldData } from '../mainview/canvas/Pld/PldUtil'
import './ConversionMenu.css'

export function ConversionMenu() {
    const [visible, setVisible] = useState<boolean>(true)

    const app = useContext(AppContext)
    const status = useContext(StatusContext)

    useEffect(() => {
        setVisible(status.currentMenu ? false : true)
    }, [status.currentMenu])

    const initPldMode = (e: any) => {
        if (!app.pldMode) {
            const confirmValue = {
                title: 'PLD 모드',
                message: 'PLD모드를 시작합니다.',
                submessage: '현재 작업 중이던 내용은 모두 취소됩니다.',
                yes: async () => {
                    app.togglePldMode()
                    pushCommand({ name: 'allDocumentClose' })
                    e.stopPropagation()
                },
                no: () => {}
            }

            pushCommand({ name: 'showWarningView', value: confirmValue })
        }
    }

    const initViewerMode = (e: any) => {
        if (app.pldMode) {
            const confirmValue = {
                title: 'PLD 모드',
                message: 'PLD모드를 종료합니다.',
                yes: async () => {
                    app.togglePldMode()

                    resetPldData(app)

                    e.stopPropagation()
                },
                no: () => {}
            }
            pushCommand({ name: 'showWarningView', value: confirmValue })
        }
    }

    return (
        <div
            style={{
                position: 'absolute',
                display: visible ? 'flex' : 'none',
                left: '80px',
                top: '0px',
                writingMode: 'vertical-rl',
                zIndex: '0'
            }}
        >
            <div className="side-button view bottom-right" onClick={initViewerMode}>
                VIEW
            </div>
            <div className="side-button pld bottom-right" onClick={initPldMode}>
                PLD
            </div>
        </div>
    )
}
