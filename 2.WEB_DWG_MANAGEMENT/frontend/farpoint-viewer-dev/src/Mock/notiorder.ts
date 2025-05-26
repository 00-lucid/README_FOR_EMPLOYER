export function getDocumentNotiordersMock(key: DocumentKey, requestType: string, startDate: string, endDate: string) {
    return  [
                {
                    tagId: '00000000000000000383',
                    function: '9431-002A3',
                    notifications: [
                        {
                            function: '10MBA10CG102',
                            id: '10309060',
                            detail: 'GT Temp TURB OUTLET #2',
                            equipmentExtId: '10311565',
                            startDate: '20211103',
                            endDate: '20221212',
                            type: 'noti',
                            status: '발행완료',
                            taskType: 'M1',
                            tplnr: '기능위치가 들어갈 자리'
                        },
                        {
                            function: '10MBA10CG102',
                            id: '10140158',
                            detail: 'GT Temp TURB OUTLET #4',
                            equipmentExtId: '10311565',
                            startDate: '20211103',
                            endDate: '20221212',
                            type: 'noti',
                            status: '발행완료',
                            taskType: 'M1',
                            tplnr: '기능위치가 들어갈 자리'
                        },
                    ],
                    orders: []
                },
                {
                    tagId: '00000000000000000382',
                    function: '9431-002B8',
                    notifications: [
                        {
                            function: '10MBA11CG103-U01',
                            id: '10140150',
                            detail: 'GT Temp TURB OUTLET #3',
                            equipmentExtId: '10311565',
                            startDate: '20211103',
                            endDate: '20221212',
                            type: 'noti',
                            status: '발행완료',
                            taskType: 'M1',
                            tplnr: '기능위치가 들어갈 자리'
                        }
                    ],
                    orders: []
                },
                {
                    tagId: '00000000000000000004',
                    function: '9431-004E6',
                    notifications: [],
                    orders: [
                        {
                            function: '10MBA10CG102',
                            id: '10140159',
                            detail: 'GT Temp TURB OUTLET #1',
                            equipmentExtId: '10311565',
                            startDate: '20211103',
                            endDate: '20221212',
                            type: 'order',
                            status: '발행완료',
                            taskType: 'M1',
                            tplnr: '기능위치가 들어갈 자리'
                        }
                    ]
                },
                {
                    tagId: '00000000000000000003',
                    function: '9431-004E8',
                    notifications: [],
                    orders: [
                        {
                            function: '10MBA10CG102',
                            id: '10140159',
                            detail: 'GT Temp TURB OUTLET #1',
                            equipmentExtId: '10311565',
                            startDate: '20211103',
                            endDate: '20221212',
                            type: 'order',
                            status: '발행완료',
                            taskType: 'M1',
                            tplnr: '기능위치가 들어갈 자리'
                        }
                    ]
                },
        
            ]
}

export function getOrderUrlMock(id: string, tplnr: string) {
    return `https://top.khnp.auth/SAP/fiori.jsp?URL=https://khnpprd.khnp.se.hn:24300/sap/bc/gui/sap/its/webgui?~transaction=*ZPMLD0102%20MODE=E;P_RFCFL=T;P_QMNUM=${id}`
}

export function getNoticeUrlMock(id: string, tplnr: string) {
    return `https://top.khnp.auth/SAP/fiori.jsp?URL=https://khnpprd.khnp.se.hn:24300/sap/bc/gui/sap/its/webgui?~transaction=*ZPMLD0102%20MODE=E;P_RFCFL=S;P_AUFNR=${id}`
}