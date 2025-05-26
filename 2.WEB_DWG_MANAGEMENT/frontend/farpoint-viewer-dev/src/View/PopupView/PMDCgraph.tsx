import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { PMDCStore } from '../../Store/statusStore'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, Cell } from 'recharts'
type props = {}

const PMDCgraph = ({}: props) => {
    // const ws = useRecoilValue(PMDCStore.ws)
    const [PMGraph, setPMGraph] = useRecoilState(PMDCStore.PMGraph)
    const [alarmList, setAlarmList] = useRecoilState(PMDCStore.alarmList)
    const [testData, setTestData] = useRecoilState(PMDCStore.testData)

    // useEffect(() => {
    //     return () => {
    //         ws.send(JSON.stringify('stopData'))
    //     }
    // }, [])

    return (
        <div
            style={{
                display: 'flex',
                position: 'fixed',
                top: (window.innerHeight / 2) - 150,
                right: (window.innerWidth / 2) - 500,
                flexDirection: 'column',
                alignItems: 'flex-end',
                background: 'white',
                border: `2px solid black`,
                padding: '10px'
            }}
        >

            {testData.length > 0 ?  
                <>
                    <LineChart width={1000} height={300} data={testData} margin={{ left: 10 }}>
                        <XAxis
                            dataKey="time"
                            tickCount={15}
                            type="number"
                            domain={[
                                (dataMin: any) => {
                                    if (isFinite(dataMin)) {
                                        const tempDate = new Date(dataMin)
                                        tempDate.setSeconds(0)
                                        return tempDate.getTime()
                                    } else {
                                        return dataMin
                                    }
                                },
                                (dataMax: any) => {
                                    if (isFinite(dataMax)) {
                                        const tempDate = new Date(dataMax)
                                        tempDate.setMinutes(tempDate.getMinutes() + 1)
                                        tempDate.setSeconds(0)
                                        return tempDate.getTime()
                                    } else {
                                        return dataMax
                                    }
                                },
                            ]}
                            tickFormatter={(data, index) => {
                                const fullDate = new Date(data)
                                const day = ['일', '월', '화', '수', '목', '금', '토']
                                const year = fullDate.getFullYear().toString().substring(2)
                                const month = fullDate.getMonth() + 1
                                const date = fullDate.getDate()
                                const hours = fullDate.getHours()
                                const minute = fullDate.getMinutes()
                                const second = fullDate.getSeconds()
                                return `${year}-${month < 10 ? '0' + month : month} `
                                // ${hours}:${minute}:${second};
                                // return `${hours}:${minute}:${second}`
                            }}
                        />
                        <YAxis tickMargin={10} />
                        <CartesianGrid stroke="white" fill="#e1e9f4" />
                        <Tooltip labelFormatter={() => ''} />
                        <Line type="monotone" dot={false} dataKey="test" stroke="#8884d8" strokeWidth={3} />
                        <Line type="monotone" dot={false} dataKey="learn" stroke="#82ca9d" strokeWidth={3} />
                        <Line type="monotone" dot={false} dataKey="compare" stroke="#ffdda6" strokeWidth={3} />
                        <Line type="monotone" dot={false} dataKey="predict" stroke="#FFA9B0" strokeWidth={3} />
                        <Legend />
                    </LineChart>
                    <div
                        style={{
                            display: 'flex',
                        }}
                    >
                        {alarmList.has(PMGraph) && (
                            <div
                                style={{
                                    width: '80px',
                                    height: '40px',
                                    background: '#82ca9d',
                                    cursor: 'pointer',
                                    border: `2px solid black`,
                                    borderRadius: '3px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                onClick={() => {
                                    const obj = {
                                        id: PMGraph,
                                        command: 'delete',
                                    }
                                    // ws.send(JSON.stringify(obj))
                                    const set = new Set(alarmList)
                                    set.delete(PMGraph)
                                    setAlarmList(set)
                                }}
                            >
                                무시하기
                            </div>
                        )}
                        <div
                            style={{
                                width: '80px',
                                height: '40px',
                                background: 'red',
                                cursor: 'pointer',
                                border: `2px solid black`,
                                borderRadius: '3px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color:'white'
                            }}
                            onClick={() => {
                                setPMGraph('')
                            }}
                        >
                            닫기
                        </div>
                    </div>
                </>
            :
                <div>테스트 데이터가 없습니다</div>
            }
        </div>
    )
}

export default PMDCgraph