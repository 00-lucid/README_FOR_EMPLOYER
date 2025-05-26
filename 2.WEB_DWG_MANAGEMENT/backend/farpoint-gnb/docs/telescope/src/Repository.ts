import {
    DrawingList,
    Drawing,
    sleep,
    SearchOption,
    DrawingNotes,
    DocumentResult,
    EquipmentResult,
    SignalResult,
    RelatedSearchOption,
    RelatedResult
} from '.'

export abstract class Repository {
    public static create(host: string): Repository {
        return new RepositoryImpl(host)
    }

    public static mock(): Repository {
        return new RepositoryMock()
    }

    public abstract get<T>(path: string, option?: Map<string, string>): Promise<T>

    public async getDrawingList() {
        return await this.get<DrawingList[]>(`/drawings`)
    }

    public async getSearchOption() {
        return await this.get<SearchOption>(`/search/options`)
    }
    public async searchDocument(groupId?: string, docName?: string, docNumber?: string) {
        let query = '/search?type=drawing'

        if (groupId) query = query + `&group=${groupId}`
        if (docName) query = query + `&name=${docName}`
        if (docNumber) query = query + `&number=${docNumber}`

        return await this.get<DocumentResult[]>(query)
    }
    public async searchEquipment(groupId?: string, symbol?: string, equipmentName?: string) {
        let query = '/search?type=equipment'

        if (groupId) query = query + `&group=${groupId}`
        if (symbol) query = query + `&symbol=${symbol}`
        if (equipmentName) query = query + `&name=${equipmentName}`

        return await this.get<EquipmentResult[]>(query)
    }
    public async searchSignal(groupId?: string, docName?: string, equipmentName?: string) {
        let query = '/search?type=signal'

        if (groupId) query = query + `&group=${groupId}`
        if (docName) query = query + `&drawing=${docName}`
        if (equipmentName) query = query + `&equipment=${equipmentName}`

        return await this.get<SignalResult[]>(query)
    }
    public async getRelatedSearchOption() {
        return await this.get<RelatedSearchOption>(`/search/relatedOptions`)
    }
    public async searchRelated(groupIds: string[], docName?: string, docNumber?: string) {
        let query = '/search?type=related'

        if (0 < groupIds.length) {
            query = query + `&groups=${groupIds.join(',')}`
        }

        if (docName) query = query + `&name=${docName}`
        if (docNumber) query = query + `&number=${docNumber}`

        return await this.get<RelatedResult[]>(query)
    }
}

class RepositoryImpl extends Repository {
    private addr: string

    public constructor(addr: string) {
        super()
        this.addr = addr
    }

    public async get<T>(pathArg: string, option?: Map<string, string>): Promise<T> {
        let path = pathArg

        if (option) {
            option.forEach(function (value, key) {
                path = path.replaceAll(`{${key}}`, value)
            })
        }

        const res = await fetch(this.addr + path)

        return await res.json()
    }
}

class RepositoryMock extends Repository {
    public async get<T>(path: string): Promise<T> {
        await sleep(10)

        let value: unknown

        if (path.includes('/drawings/') && path.includes('/notes')) {
            value = RepositoryMock.getDrawingNotes()
        } else if (path.includes('/drawings/')) {
            const parts = path.split('/')

            if (parts.length < 3) alert(`drawings path(${path})에 id가 지정되어야 한다.`)

            const id = parts[2]
            value = RepositoryMock.getDrawing(id)
        } else if (path.includes('/drawings')) {
            value = RepositoryMock.getDrawingList()
        } else if (path.includes('/search/options')) {
            value = RepositoryMock.getSearchOption()
        } else if (path.includes('/search?type=drawing')) {
            value = RepositoryMock.getSearchDrawing()
        } else if (path.includes('/search?type=equipment')) {
            value = RepositoryMock.getSearchEquipment()
        } else if (path.includes('/search?type=signal')) {
            value = RepositoryMock.getSearchSignal()
        } else if (path.includes('/search/relatedOptions')) {
            value = RepositoryMock.getRelatedSearchOption()
        } else if (path.includes('/search?type=related')) {
            value = RepositoryMock.getSearchRelated()
        } else {
            alert(`정의되지 않은 url(${path})`)
        }

        return value as T
    }

    private static getSearchOption(): SearchOption {
        return {
            companies: [{ id: 'companyid#01', name: '안동' }],
            plants: [{ id: 'plant#01', name: 'GT', companyId: 'companyid#01' }],
            hogies: [{ id: 'hogi#01', name: '1호기', plantId: 'plant#01' }],
            symbols: [{ id: 'symbol#01', name: '모터', plantId: 'plant#01' }]
        }
    }

    private static getRelatedSearchOption(): RelatedSearchOption {
        return {
            companies: [{ id: 'companyid#01', name: '안동' }],
            categories: [{ id: 'category#01', name: 'category', companyId: 'companyid#01' }],
            types: [{ id: 'type#01', name: 'type', categoryId: 'category#01' }]
        }
    }

    private static getDrawingList(): DrawingList[] {
        return [
            {
                id: 'folderId#Root',
                name: 'folderName#Root',
                children: [
                    {
                        id: 'folderId#2',
                        name: 'folderName#2',
                        children: [],
                        items: [
                            {
                                id: 'drawingId#1',
                                name: 'drawingName#1',
                                number: 'drawingNumber#1',
                                link: {
                                    rel: 'self',
                                    href: '/drawings/drawingId#1'
                                }
                            },
                            {
                                id: 'drawingId#2',
                                name: 'drawingName#2',
                                number: 'drawingNumber#2',
                                link: {
                                    rel: 'self',
                                    href: '/drawings/drawingId#2'
                                }
                            }
                        ]
                    }
                ],
                items: [
                    {
                        id: 'drawingId#3',
                        name: 'drawingName#3',
                        number: 'drawingNumber#3',
                        link: {
                            rel: 'self',
                            href: '/drawings/drawingId#3'
                        }
                    },
                    {
                        id: 'drawingId#4',
                        name: 'drawingName#4',
                        number: 'drawingNumber#4',
                        link: {
                            rel: 'self',
                            href: '/drawings/drawingId#4'
                        }
                    }
                ]
            }
        ]
    }

    private static getDrawing(drawingId: string): Drawing {
        return {
            id: drawingId,
            name: drawingId + 'name',
            number: drawingId + 'number',
            notes: {
                links: [
                    {
                        rel: 'period',
                        href: '/drawings/drawingId/notes?type=period&start={start}&end={end}',
                        templated: true
                    },
                    {
                        rel: 'nocomplete',
                        href: '/drawings/drawingId/notes?type=nocomplete'
                    }
                ]
            },
            equipments: [
                {
                    id: 'equipId#1',
                    name: 'equipName#1',
                    handles: ['handle#1-1', 'handle#1-2']
                },
                {
                    id: 'equipId#2',
                    name: 'equipName#2',
                    handles: ['handle#2-1', 'handle#2-2']
                },
                {
                    id: 'equipId#3',
                    name: 'equipName#3',
                    handles: ['handle#3-1', 'handle#3-2']
                }
            ],
            equipmentList: [
                {
                    id: 'folderId#Root',
                    name: 'folderName#Root',
                    children: [
                        {
                            id: 'folderId#2',
                            name: 'folderName#2',
                            children: [],
                            items: [
                                {
                                    id: 'equipId#1',
                                    name: 'equipName#1'
                                },
                                {
                                    id: 'equipId#2',
                                    name: 'equipName#2'
                                }
                            ]
                        }
                    ],
                    items: [
                        {
                            id: 'equipId#3',
                            name: 'equipName#3'
                        }
                    ]
                }
            ]
        }
    }

    private static getDrawingNotes(): DrawingNotes {
        return {
            notifications: [
                {
                    equipment: {
                        id: 'equipId#1',
                        name: 'equipName#1'
                    },
                    notes: [
                        {
                            id: '10140159',
                            detail: 'GT Temp TURB OUTLET 오지시',
                            period: { start: '20211103', end: '20221212' },
                            status: '발행완료',
                            category: 'M1',
                            url: 'http://test.url/1'
                        },
                        {
                            id: '10140160',
                            detail: 'GT Temp TURB OUTLET 오지시',
                            period: { start: '20211103', end: '20221212' },
                            status: '발행완료',
                            category: 'M1',
                            url: 'http://test.url/2'
                        }
                    ]
                },
                {
                    equipment: {
                        id: 'equipId#2',
                        name: 'equipName#2'
                    },
                    notes: [
                        {
                            id: '10140159',
                            detail: 'GT Temp TURB OUTLET 오지시',
                            period: { start: '20211103', end: '20221212' },
                            status: '발행완료',
                            category: 'M1',
                            url: 'http://test.url/3'
                        },
                        {
                            id: '10140160',
                            detail: 'GT Temp TURB OUTLET 오지시',
                            period: { start: '20211103', end: '20221212' },
                            status: '발행완료',
                            category: 'M1',
                            url: 'http://test.url/4'
                        }
                    ]
                }
            ],
            orders: [
                {
                    equipment: {
                        id: 'equipId#2',
                        name: 'equipName#2'
                    },
                    notes: [
                        {
                            id: '10140162',
                            detail: 'GT Temp TURB OUTLET 오지시',
                            period: { start: '20211103', end: '20221212' },
                            status: '발행',
                            category: 'C1',
                            url: 'http://test.url/5'
                        }
                    ]
                },
                {
                    equipment: {
                        id: 'equipId#3',
                        name: 'equipName#3'
                    },
                    notes: [
                        {
                            id: '10140162',
                            detail: 'GT Temp TURB OUTLET 오지시',
                            period: { start: '20211103', end: '20221212' },
                            status: '발행',
                            category: 'C1',
                            url: 'http://test.url/6'
                        }
                    ]
                }
            ]
        }
    }

    private static getSearchDrawing(): DocumentResult[] {
        return [
            {
                hogi: '1호기',
                docNumber: 'drawing#1number',
                docName: 'drawing#1name',
                link: {
                    rel: 'self',
                    href: '/drawings/drawingId#1'
                }
            },
            {
                hogi: '2호기',
                docNumber: 'drawing#1number',
                docName: 'drawing#1name',
                link: {
                    rel: 'self',
                    href: '/drawings/drawingId#2'
                }
            }
        ]
    }

    private static getSearchEquipment(): EquipmentResult[] {
        return [
            {
                hogi: '1호기',
                docNumber: 'drawing#1number',
                docName: 'drawing#1name',
                function: 'equipId#1',
                equipment: { id: 'equipId#1' },
                link: {
                    rel: 'drawing',
                    href: '/drawings/drawingId#1'
                }
            },
            {
                hogi: '2호기',
                docNumber: 'drawing#1number',
                docName: 'drawing#1name',
                function: 'equipId#2',
                equipment: { id: 'equipId#2' },
                link: {
                    rel: 'drawing',
                    href: '/drawings/drawingId#2'
                }
            }
        ]
    }

    private static getSearchSignal(): SignalResult[] {
        return [
            {
                PLANTNM: '안동 GT',
                DRAW_NM: '지원하는 형식(jpg)',
                TAG: '10MBA30GH001',
                PAGE: '1',
                contentType: 'jpg',
                url: 'http://test.com/signals/jpg'
            },
            {
                PLANTNM: '미지원',
                DRAW_NM: '지원하지 않는 형식',
                TAG: '10MBA30GH001',
                PAGE: '2',
                contentType: 'notsupport',
                url: 'http://test.com/signals/notsupport'
            }
        ]
    }

    private static getSearchRelated(): RelatedResult[] {
        return [
            {
                DOKAR: 'string',
                DOKNR: 'string',
                DOKTL: 'string',
                DOKVR: 'string',
                DKTXT: 'string',
                ZZCHANGEDATE: 'string',
                EGUBUN: 'string',
                FGUBUN: 'string',
                DOKARNM: 'string'
            }
        ]
    }
}
