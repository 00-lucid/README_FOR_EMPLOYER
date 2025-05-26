import { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { PMDCStore, ProcedureStore, StatusStore } from '../../Store/statusStore'
import ThemeStore from '../../Store/ThemeStore'
import Api from '../../Api'

type Props = {
    value: any
    scale: number
    getPMDCUserListPopup: any
}

const ProcedurePopupContents = ({ value, scale, getPMDCUserListPopup }: Props) => {
    const theme = useRecoilValue(ThemeStore.theme)
    const controlMode = useRecoilValue(StatusStore.controlMode)

    const [procedureSteps, setProcedureSteps] = useRecoilState(ProcedureStore.procedureSteps)
    const [selProcedureEquipments, setSelProcedureEquipments] = useRecoilState(ProcedureStore.selProcedureEquipments)
    const cssClassName = theme.type === 'light' ? 'LightTheme' : 'DarkTheme'
    const [realTimeData, setRealTimeData]: any = useState<any>('')
    const [sensorData, setSensorData] = useState<any>([])

    useEffect(() => {
        const getProcedurePMDCData = async () => {
            const res = await Api.procedure.getProcedurePMDCData(value.PITAG, value.FUNCTION)
            console.log(res)
            setSensorData(res[0])
        }
        getProcedurePMDCData()
        return () => {
            setSensorData([])
        }
    }, [])

    // useEffect(() => {
    //     console.log(sensorData.ID)
    //     const username = 'kospoadmin';
    //     const password = 'Kospopiadmin!';
    //     const auth = btoa(`${username}:${password}`);
    //     if (sensorData.WEBID && controlMode !== 'pmdc') {
    //         const url =
    //             `wss://10.130.1.181/piwebapi/streams/${sensorData.WEBID}/channel?heartbeatRate=2&includeInitialValues=true`
    //         const socket = new WebSocket(url)

    //         socket.onopen = () => {
    //             if (sensorData.NAME_KEY) socket.send(JSON.stringify(sensorData.NAME_KEY))
    //         }

    //         socket.onerror = (error) => {
    //             console.log(error)
    //         }

    //         socket.onmessage = (message) => {
    //             if (message.data) {
    //                 const data = JSON.parse(message.data)
    //                 if (data.Items.length !== 0) {
    //                     const item = data.Items[0].Items[0].Value
    //                     setRealTimeData(item)
    //                 }
    //             }
    //         }
    //         return () => {
    //             socket.close()
    //         }
    //     } else {
    //         return
    //     }
    // }, [controlMode])

    const render = () => {
        let digitalData
        if (controlMode === 'procedure' || !realTimeData) {
            if (sensorData.POINTTYPE !== 'Digital') {
                return (
                    <span
                        style={{
                            fontSize: 2.5 * scale + 'px',
                            cursor: 'pointer',
                        }}
                    >
                        - {sensorData['ENGUNITS'] ? sensorData['ENGUNITS'] : ''}
                    </span>
                )
            } else {
                return (
                    <span
                        style={{
                            fontSize: 4.5 * scale + 'px',
                            cursor: 'pointer',
                        }}
                    >
                        {sensorData.DIGITALSET}
                    </span>
                )
            }
        }
        if (realTimeData) {
            if (sensorData.POINTTYPE === 'Digital') {
                const arr = sensorData.DIGITALSET.split('-')
                if (arr.length === 2) digitalData = realTimeData === 0 ? arr[0] : arr[1]
            }
            return (
                <div
                    style={{
                        color: digitalData ? (digitalData === 'ON' ? 'lime' : 'red') : cssClassName === 'DarkTheme' ? 'black' : 'white',
                        cursor: 'pointer',
                    }}
                >
                    <span
                        style={{
                            fontWeight: 'bold',
                            fontSize: `${4.5 * scale}px`,
                            cursor: 'pointer',
                        }}
                    >
                        {digitalData ? digitalData : realTimeData}
                    </span>
                    {sensorData['ENGUNITS'] && (
                        <span
                            style={{
                                fontSize: `${2.5 * scale}px`,
                                cursor: 'pointer',
                            }}
                        >
                            {sensorData['ENGUNITS']}
                        </span>
                    )}
                </div>
            )
        }
    }

    return (
        <>
            {value.PITAG && (
                <>
                    <div
                        style={{
                            fontSize: `${2.5 * scale}px`,
                            padding: `0 ${3 * scale}px`,
                            transition: 'margin 0s',
                            cursor: 'pointer',
                        }}
                    >
                        {value.PITAG}
                        <br />
                        {sensorData && render()}
                    </div>
                    <hr
                        style={{
                            border: 0,
                            height: 1,
                            background: cssClassName === 'DarkTheme' ? 'black' : 'white',
                            margin: `${3 * scale}px 0`,
                            transition: 'margin 0s',
                        }}
                    />
                </>
            )}
            <div
                style={{
                    transition: 'margin 0s',
                    display: 'flex',
                    padding: `0 ${3 * scale}px`,
                    fontSize: `${2.5 * scale}px`,
                    whiteSpace: 'pre',
                }}
            >
                {value.STPDESC}
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    transition: 'margin 0s',
                    padding: `${3 * scale}px ${3 * scale}px`,
                    fontSize: `${2.5 * scale}px`,
                    cursor: 'pointer',
                }}
                onClick={() => {
                    const newVal = selProcedureEquipments.filter((v: any) => {
                        return v.function !== value.FUNCTION
                    })
                    setSelProcedureEquipments(newVal)
                }}
            >
                닫기
            </div>
        </>
    )
}

export default ProcedurePopupContents
