import { useState, useEffect } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import ThemeStore from '../../Store/ThemeStore'
import { PMDCStore } from '../../Store/statusStore'
import Api from '../../Api'

type Props = {
    sensorData: any
    scale: number
    controlMode: string
}

const PMDCPopupContents = ({ sensorData, scale, controlMode }: Props) => {
    // RECOIL
    const theme = useRecoilValue(ThemeStore.theme)
    // const ws = useRecoilValue(PMDCStore.ws)
    const alarmList = useRecoilValue(PMDCStore.alarmList)
    const [PMGraph, setPMGraph] = useRecoilState(PMDCStore.PMGraph)

    // STATE
    const cssClassName = theme.type === 'light' ? 'LightTheme' : 'DarkTheme'
    const [realTimeData, setRealTimeData]: any = useState<any>('')
    const [isHover, setIsHover] = useState<boolean>(false)

    useEffect(() => {
        // console.log(sensorData.ID)
        // const username = 'kospoadmin';
        // const password = 'Kospopiadmin!';
        // const auth = btoa(`${username}:${password}`);
        // if (sensorData.WEBID && controlMode !== 'pmdc') {
        //     const url =
        //         `wss://10.130.1.181/piwebapi/streams/${sensorData.WEBID}/channel?heartbeatRate=2&includeInitialValues=true`
        //     const socket = new WebSocket(url)

        //     socket.onopen = () => {
        //         if (sensorData.NAME_KEY) socket.send(JSON.stringify(sensorData.NAME_KEY))
        //     }

        //     socket.onerror = (error) => {
        //         console.log(error)
        //     }

        //     socket.onmessage = (message) => {
        //         if (message.data) {
        //             const data = JSON.parse(message.data)
        //             if (data.Items.length !== 0) {
        //                 const item = data.Items[0].Items[0].Value
        //                 setRealTimeData(item)
        //             }
        //         }
        //     }
        //     return () => {
        //         socket.close()
        //     }
        // } else {
        //     return
        // }
        if (sensorData.WEBID && controlMode !== 'pmdc') {
            const getPMDCValueNow = async () => {
                const result: any = await Api.pmdc.getPMDCValue(sensorData.WEBID)
                const item = result.Value.Value == undefined ? result.Value : result.Value.Value;
                setRealTimeData(item)
            }
            getPMDCValueNow()
            const inter = setInterval(async () => {
                getPMDCValueNow()
            }, 5000)
            return () => {
                clearInterval(inter)
            }
        }
    }, [controlMode])

    //  useEffect(() => {
    //     const socket = new WebSocket('ws://dev.hj:4004')

    //     socket.onopen = () => {
    //         if (sensorData.NAME_KEY) socket.send(JSON.stringify(sensorData.NAME_KEY))
    //     }

    //     socket.onerror = (error) => {
    //         console.log(error)
    //     }

    //     socket.onmessage = (message) => {
    //         if (message.data) {
    //             const socketData = JSON.parse(message.data)
    //             setRealTimeData(socketData.value)
    //         }
    //     }
    //     return () => {
    //         socket.close()
    //     }
    // }, [])

    const render = () => {
        let digitalData
        if (controlMode === 'pmdc' || !realTimeData) {
            if (sensorData.POINTTYPE !== 'Digital') {
                return (
                    <span
                        style={{
                            // fontSize: 2.5 * scale + 'px',
                            fontSize: `${scale / 4}rem`,
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
                            // fontSize: 4.5 * scale + 'px',
                            fontSize: `${scale / 4}rem`,
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
                            // fontSize: `${4.5 * scale}px`,
                            fontSize: `${scale / 4}rem`,
                            cursor: 'pointer',
                        }}
                    >
                        {digitalData ? digitalData : realTimeData}
                    </span>
                    {sensorData['ENGUNITS'] && (
                        <span
                            style={{
                                // fontSize: `${2.5 * scale}px`,
                                fontSize: `${scale / 4}rem`,
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
        <div
            style={
                alarmList.has(sensorData.NAME_KEY)
                    ? { background: alarmList.has(sensorData.NAME_KEY) ? 'blue' : '' }
                    : {
                          background: isHover ? 'black' : '',
                          borderRadius: '3px',
                          cursor: 'pointer',
                      }
            }
            // onClick={() => {
            //     if (PMGraph !== '') {
            //         setPMGraph('')
            //     } else {
            //         setPMGraph(sensorData.NAME_KEY)
            //         const obj = {
            //             id: sensorData.NAME_KEY,
            //             command: 'getData',
            //         }
            //         ws.send(JSON.stringify(obj))
            //     }
            // }}
            onMouseOver={() => {
                setIsHover(true)
            }}
            onMouseOut={() => {
                setIsHover(false)
            }}
        >
            {/* 센서 키 이름 */}
            <div
                style={{
                    // fontSize: `${2.5 * scale}px`,
                    fontSize: `${scale / 4}rem`,
                    padding: `${3 * scale}px 0 ${1.5 * scale}px`,
                    transition: 'margin 0s',
                    cursor: 'pointer',
                }}
            >
                {sensorData.NAME_KEY}
            </div>

            <div style={{ cursor: 'pointer' }}>{render()}</div>
        </div>
    )
}

export default PMDCPopupContents
