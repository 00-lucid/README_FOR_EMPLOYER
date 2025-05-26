import {
    SymbolResult,
    DocumentResult,
    EquipmentResult,
    DocFolder,
    DocumentKey,
    DocumentContext,
    DocumentList,
    EquipmentHandle,
    EquipmentLink,
    MarkupContent,
    InsertMarkupValue,
    UpdateMarkupValue,
    DeleteMarkupValue,
    EquipmentNotiorder,
    SearchSignalResult,
    RelatedSearchResult,
    RelatedFolder,
    UserContext,
    RelatedFileInfo,
    encrypt as enc,
    MydocList,
    OrderListFlag,
    EquipmentsList,
    OrderList,
    TagginItemList,
    PldList
} from './types'
// Lib
import { serviceConfig } from './Lib/util'

abstract class RepositoryBase {
    public static create(addr: string): RepositoryBase {
        if (addr === 'mock') return new RepositoryMock()

        return new RepositoryImpl(addr)
    }

    public abstract getDocumentList(): Promise<DocumentList[]>
    public abstract setUserContext(userId: string, value: UserContext): Promise<void>
    public abstract getUserContext(userId: string): Promise<UserContext>
    public abstract getDocument(key: DocumentKey, plantCode: string): Promise<DocumentContext>
    public abstract getDocumentFile(key: DocumentKey): Promise<Uint8Array>
    public abstract getFolders(parentId: string): Promise<DocFolder[]>
    public abstract getRootFolder(): Promise<DocFolder[]>
    public abstract searchDocument(
        folderId: string | undefined,
        docName: string | undefined,
        docNumber: string | undefined
    ): Promise<DocumentResult[]>
    public abstract searchEquipment(
        folderId: string | undefined,
        libId: string | undefined,
        tag: string | undefined
    ): Promise<EquipmentResult[]>
    public abstract searchSignal(
        folderId: string | undefined,
        docname: string | undefined,
        tagname: string | undefined,
        userId: string
    ): Promise<SearchSignalResult[]>

    public abstract hasAuthorization(userId: string): Promise<boolean>
    public abstract getSymbolsByPlant(plantCode: string): Promise<SymbolResult[]>
    public abstract getHandles(docId: string, docVer: string, tagId: string): Promise<EquipmentHandle[]>
    public abstract getEquipmentLinks(docKey: DocumentKey, plantCode: string, handle: string): Promise<EquipmentLink[]>
    public abstract getMarkups(userId: string, key: DocumentKey, plantCode: string): Promise<MarkupContent[]>
    public abstract insertMarkup(values: InsertMarkupValue): Promise<void>
    public abstract updateMarkup(values: UpdateMarkupValue): Promise<void>
    public abstract deleteMarkup(values: DeleteMarkupValue): Promise<void>
    public abstract getDocumentNotiorders(
        key: DocumentKey,
        requestType: string,
        startDate?: string,
        endDate?: string
    ): Promise<EquipmentNotiorder[]>
    public abstract searchRelated(
        folders: string[],
        docName: string | undefined,
        docNumber: string | undefined
    ): Promise<RelatedSearchResult[]>
    public abstract getRelatedFolders(parentId: string): Promise<RelatedFolder[]>
    public abstract getRelatedRoot(): Promise<RelatedFolder[]>

    public abstract getOrderUrl(id: string): Promise<string>
    public abstract getNoticeUrl(id: string): Promise<string>
    public abstract getEquipmentInfoUrl(equnr: string): Promise<string>
    public abstract getNotiIssueUrl(equnr: string): Promise<string>
    public abstract getOrderIssueUrl(equnr: string): Promise<string>
    public abstract getNotiRecordUrl(equnr: string, startDate: string, endDate: string): Promise<string>
    public abstract getOrderRecordUrl(equnr: string, startDate: string, endDate: string): Promise<string>
    public abstract getRelatedFileInfo(
        DOKAR: string,
        DOKVR: string,
        DOKTL: string,
        DOKNR: string,
        userId: string
    ): Promise<RelatedFileInfo[]>

    public abstract getMydocList(userId: string): Promise<MydocList[]>
    public abstract deleteMydocFolder(userId: string, folderId: string): Promise<void>
    public abstract addMydocFolder(userId: string, parentId: string, folderName: string): Promise<void>
    public abstract renameMydocFolder(userId: string, folderId: string, newName: string): Promise<void>
    public abstract deleteMydocFile(userId: string, fileId: string): Promise<void>
    public abstract mydocFileUpload(userId: string, folderId: string, file: Blob): Promise<void>
    public abstract mydocInformation(): Promise<{ editable: boolean }>
    public abstract getOrderEquipments(docKey: DocumentKey): Promise<string[]>
    public abstract getOrderListFlag(func: string): Promise<any>
    public abstract getOrderList(id: string): Promise<any>
    public abstract getTaggingItemList(id: string, func: string, wcdNo: string, docKey: any): Promise<any>
    public abstract getAllSimbol(): Promise<any>
    public abstract getAllSimbolList(data: {
        cId: number | undefined
        cVr: string | undefined
        docNo: string
        docVr: string
        cSeq: number
    }): Promise<any>
    public abstract getEntitiesList(data: {
        cId: number | undefined
        cVr: string | undefined
        docNo: string
        docVr: string
        cSeq: number
    }): Promise<any>
    public abstract resisterPld(
        procedureNumber: string,
        procedureName: string,
        pldName: string,
        plantValue: string,
        pldDESC: string,
        selectedItems: string[],
        userId: string
    ): Promise<any>
    public abstract changePldCanvas(pldList: any[]): Promise<any>
    public abstract addSimbolList(simbolList: any[]): Promise<any>
    public abstract getPldDocumentList(c_id: number, c_vr: string): Promise<any>
    public abstract addEntitiesList(entitiesList: any[]): Promise<any>
    public abstract searchPld(companyValue: string, plantValue: string): Promise<any>
    public abstract refreshDocumentListCash(): Promise<DocumentList[]>
}

class RepositoryImpl implements RepositoryBase {
    private addr: string

    public constructor(addr: string) {
        this.addr = addr
    }

    private async sleep(timeout: number): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, timeout))
    }

    private get(path: string): Promise<Response> {
        return fetch(this.addr + path)
    }

    private delete(path: string): Promise<Response> {
        return fetch(this.addr + path, {
            method: 'DELETE',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    private put(path: string, body: string): Promise<Response> {
        return fetch(this.addr + path, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body
        })
    }

    private post(path: string, body: string): Promise<Response> {
        return fetch(this.addr + path, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body
        })
    }

    public async getDocumentList(): Promise<DocumentList[]> {
        const res = await this.get('/documents')

        return await res.json()
    }

    public async setUserContext(userId: string, value: UserContext): Promise<void> {
        const body = JSON.stringify(value)

        await this.put(`/users/${enc(userId)}/context`, body)
    }

    public async getUserContext(userId: string): Promise<UserContext> {
        const res = await this.get(`/users/${enc(userId)}/context`)

        return await res.json()
    }

    public async getDocument(key: DocumentKey, plantCode: string): Promise<DocumentContext> {
        const res = await this.get(`/documents/${enc(key.docId)}?docVer=${enc(key.docVer)}&plantCode=${enc(plantCode)}`)

        return await res.json()
    }

    public async getDocumentFile(key: DocumentKey): Promise<Uint8Array> {
        const res = await this.get(`/documents/${enc(key.docId)}/file?docVer=${enc(key.docVer)}`)

        const buffer = await res.arrayBuffer()

        return new Uint8Array(buffer)
    }

    public async getDocumentNotiorders(
        key: DocumentKey,
        requestType: string,
        startDate?: string,
        endDate?: string
    ): Promise<EquipmentNotiorder[]> {
        const res = await this.get(
            `/documents/${enc(key.docId)}/notiorders?docVer=${enc(key.docVer)}&type=${enc(requestType)}&startDate=${enc(
                startDate
            )}&endDate=${enc(endDate)}`
        )

        return await res.json()
    }

    public async getFolders(parentId: string): Promise<DocFolder[]> {
        const res = await this.get(`/folders?parentId=${enc(parentId)}`)

        return await res.json()
    }

    public async getRootFolder(): Promise<DocFolder[]> {
        return this.getFolders('000000000000000001')
    }

    public async searchDocument(
        folderId: string | undefined,
        docName: string | undefined,
        docNumber: string | undefined
    ): Promise<DocumentResult[]> {
        let url = `/search/documents?`

        if (folderId !== undefined) {
            url = url + `folderId=${enc(folderId)}&`
        }

        if (docName !== undefined) {
            url = url + `docName=${enc(docName)}&`
        }

        if (docNumber !== undefined) {
            url = url + `docNumber=${enc(docNumber)}&`
        }

        url = url.slice(0, -1)

        const res = await this.get(url)

        return await res.json()
    }

    public async searchEquipment(
        folderId: string | undefined,
        libId: string | undefined,
        tag: string | undefined
    ): Promise<EquipmentResult[]> {
        let url = `/search/equipments?`

        if (folderId !== undefined) {
            url = url + `folderId=${enc(folderId)}&`
        }

        if (libId !== undefined) {
            url = url + `libId=${enc(libId)}&`
        }

        if (tag !== undefined) {
            url = url + `tag=${enc(tag)}&`
        }

        url = url.slice(0, -1)

        const res = await this.get(url)

        return await res.json()
    }

    public async searchSignal(
        folderId: string | undefined,
        docname: string | undefined,
        tagname: string | undefined,
        userId: string
    ): Promise<SearchSignalResult[]> {
        let url = `/search/signal?userId=${enc(userId)}`

        if (folderId !== undefined) {
            url = url + `&folderId=${enc(folderId)}&`
        }

        if (docname !== undefined) {
            url = url + `&docname=${enc(docname)}&`
        }

        if (tagname !== undefined) {
            url = url + `&tagname=${enc(tagname)}`
        }

        const res = await this.get(url)

        return await res.json()
    }

    public async searchRelated(
        folders: string[],
        docName: string | undefined,
        docNumber: string | undefined
    ): Promise<RelatedSearchResult[]> {
        let url = `/search/related?`

        if (0 < folders.length) {
            url = url + `folders=${enc(folders.join(','))}&`
        }

        if (docName !== undefined) {
            url = url + `name=${enc(docName)}&`
        }

        if (docNumber !== undefined) {
            url = url + `number=${enc(docNumber)}&`
        }

        url = url.slice(0, -1)

        const res = await this.get(url)

        return await res.json()
    }

    public async getRelatedFolders(parentId: string): Promise<RelatedFolder[]> {
        const res = await this.get(`/relatedFolders?parentId=${enc(parentId)}`)

        return await res.json()
    }

    public async getRelatedRoot(): Promise<RelatedFolder[]> {
        const res = await this.get(`/relatedRoot`)

        return await res.json()
    }

    public async getSymbolsByPlant(plantCode: string): Promise<SymbolResult[]> {
        const res = await this.get(`/symbols?plantCode=${enc(plantCode)}`)

        return await res.json()
    }

    public async hasAuthorization(userId: string): Promise<boolean> {
        const res = await this.get(`/users/${enc(userId)}/exists`)
        const status = await res.status
        return status === 200
    }

    public async getHandles(docId: string, docVer: string, tagId: string): Promise<EquipmentHandle[]> {
        const res = await this.get(`/handles?docId=${enc(docId)}&docVer=${enc(docVer)}&tagId=${enc(tagId)}`)

        return await res.json()
    }

    public async getEquipmentLinks(docKey: DocumentKey, plantCode: string, handle: string): Promise<EquipmentLink[]> {
        const res = await this.get(
            `/equipmentLinks?docId=${enc(docKey.docId)}&docVer=${enc(docKey.docVer)}&plantCode=${enc(
                plantCode
            )}&handle=${enc(handle)}`
        )

        return await res.json()
    }

    public async getMarkups(userId: string, key: DocumentKey, plantCode: string): Promise<MarkupContent[]> {
        const res = await this.get(
            `/markups?docId=${enc(key.docId)}&docVer=${enc(key.docVer)}&plantCode=${enc(plantCode)}&userId=${enc(
                userId
            )}`
        )

        const results = (await res.json()) as MarkupContent[]

        return results
    }

    public async insertMarkup(value: InsertMarkupValue): Promise<void> {
        const body = JSON.stringify(value)

        await this.post(`/markups`, body)
    }

    public async updateMarkup(value: UpdateMarkupValue): Promise<void> {
        const body = JSON.stringify(value)

        await this.post(`/markups/update`, body)
    }

    public async deleteMarkup(value: DeleteMarkupValue): Promise<void> {
        const body = JSON.stringify(value)

        await this.put(`/markups`, body)
    }

    public async getOrderUrl(id: string): Promise<string> {
        const res = await this.get(`/orderUrl?id=${enc(id)}`)
        const result = (await res.json()) as { url: string }
        return result.url
    }

    public async getNoticeUrl(id: string): Promise<string> {
        const res = await this.get(`/noticeUrl?id=${enc(id)}`)
        const result = (await res.json()) as { url: string }
        return result.url
    }

    // A:설비정보
    public async getEquipmentInfoUrl(equnr: string): Promise<string> {
        const res = await this.get(`/equipmentInfoUrl?equnr=${enc(equnr)}`)
        const result = (await res.json()) as { url: string }
        return result.url
    }
    // C:통지발행
    public async getNotiIssueUrl(equnr: string): Promise<string> {
        const res = await this.get(`/notiIssueUrl?equnr=${enc(equnr)}`)
        const result = (await res.json()) as { url: string }
        return result.url
    }
    // D:오더발행
    public async getOrderIssueUrl(equnr: string): Promise<string> {
        const res = await this.get(`/orderIssueUrl?equnr=${enc(equnr)}`)
        const result = (await res.json()) as { url: string }
        return result.url
    }
    // E:통지이력조회
    public async getNotiRecordUrl(equnr: string, startDate: string, endDate: string): Promise<string> {
        const res = await this.get(
            `/notiRecordUrl?equnr=${enc(equnr)}&startDate=${enc(startDate)}&endDate=${enc(endDate)}`
        )
        const result = (await res.json()) as { url: string }
        return result.url
    }
    // F:오더이력조회
    public async getOrderRecordUrl(equnr: string, startDate: string, endDate: string): Promise<string> {
        const res = await this.get(
            `/orderRecordUrl?equnr=${enc(equnr)}&startDate=${enc(startDate)}&endDate=${enc(endDate)}`
        )
        const result = (await res.json()) as { url: string }
        return result.url
    }

    public async getOrderEquipments(docKey: DocumentKey): Promise<string[]> {
        console.log('실행되라')
        const res = await this.get(`/wcd?docId=${enc(docKey.docId)}&docVer=${enc(docKey.docVer)}`)
        const result = (await res.json()) as { handles: string[] }
        // return ['100229', '100233', '100237'];
        return result.handles
    }

    public async getOrderListFlag(func: string): Promise<OrderListFlag[]> {
        // await this.sleep(100)
        // const res = [{
        //     taskType:'PM02',
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     startDate:'2021-04-15',
        //     endDate:'2021-04-15',
        //     status:'확인'
        // }, {
        //     taskType:'PM02',
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     startDate:'2021-04-15',
        //     endDate:'2021-04-15',
        //     status:'확인'
        // },{
        //     taskType:'PM02',
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     startDate:'2021-04-15',
        //     endDate:'2021-04-15',
        //     status:'확인'
        // },{
        //     taskType:'PM02',
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     startDate:'2021-04-15',
        //     endDate:'2021-04-15',
        //     status:'확인'
        // },{
        //     taskType:'PM02',
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     startDate:'2021-04-15',
        //     endDate:'2021-04-15',
        //     status:'확인'
        // },{
        //     taskType:'PM02',
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     startDate:'2021-04-15',
        //     endDate:'2021-04-15',
        //     status:'확인'
        // },{
        //     taskType:'PM02',
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     startDate:'2021-04-15',
        //     endDate:'2021-04-15',
        //     status:'확인'
        // },{
        //     taskType:'PM02',
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     startDate:'2021-04-15',
        //     endDate:'2021-04-15',
        //     status:'확인'
        // },{
        //     taskType:'PM02',
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     startDate:'2021-04-15',
        //     endDate:'2021-04-15',
        //     status:'확인'
        // },{
        //     taskType:'PM02',
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     startDate:'2021-04-15',
        //     endDate:'2021-04-15',
        //     status:'확인'
        // },{
        //     taskType:'PM02',
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     startDate:'2021-04-15',
        //     endDate:'2021-04-15',
        //     status:'확인'
        // }];
        const res = await this.get(`/wcdOrder?func=${enc(func)}`)
        const result = (await res.json()) as OrderListFlag[]
        return result
    }

    public async getOrderList(func: string): Promise<OrderList[]> {
        // await this.sleep(100)
        // const res = [{
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     wcaNo:'2021-04-15',
        //     wcdNo:'2021-04-15',
        //     status:'CLSD 종료',
        //     object:'2435-431-M-PP018'
        // }, {
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     wcaNo:'2021-04-15',
        //     wcdNo:'2021-04-15',
        //     status:'CLSD 종료',
        //     object:'2435-431-M-PP018'
        // },{
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     wcaNo:'2021-04-15',
        //     wcdNo:'2021-04-15',
        //     status:'CLSD 종료',
        //     object:'2435-431-M-PP018'
        // },{
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     wcaNo:'2021-04-15',
        //     wcdNo:'2021-04-15',
        //     status:'CLSD 종료',
        //     object:'2435-431-M-PP018'
        // },{
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     wcaNo:'2021-04-15',
        //     wcdNo:'2021-04-15',
        //     status:'CLSD 종료',
        //     object:'2435-431-M-PP018'
        // },{
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     wcaNo:'2021-04-15',
        //     wcdNo:'2021-04-15',
        //     status:'CLSD 종료',
        //     object:'2435-431-M-PP018'
        // },{
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     wcaNo:'2021-04-15',
        //     wcdNo:'2021-04-15',
        //     status:'CLSD 종료',
        //     object:'2435-431-M-PP018'
        // },{
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     wcaNo:'2021-04-15',
        //     wcdNo:'2021-04-15',
        //     status:'CLSD 종료',
        //     object:'2435-431-M-PP018'
        // },{
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     wcaNo:'2021-04-15',
        //     wcdNo:'2021-04-15',
        //     status:'CLSD 종료',
        //     object:'2435-431-M-PP018'
        // },{
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     wcaNo:'2021-04-15',
        //     wcdNo:'2021-04-15',
        //     status:'CLSD 종료',
        //     object:'2435-431-M-PP018'
        // },{
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     wcaNo:'2021-04-15',
        //     wcdNo:'2021-04-15',
        //     status:'CLSD 종료',
        //     object:'2435-431-M-PP018'
        // },{
        //     id:'000030410772',
        //     detail:'점검을 위한 오더 내역 A-001',
        //     wcaNo:'2021-04-15',
        //     wcdNo:'2021-04-15',
        //     status:'CLSD 종료',
        //     object:'2435-431-M-PP018'
        // }];
        const res = await this.get(`/wcdOrderList?func=${enc(func)}`)
        const result = (await res.json()) as OrderList[]
        return result
    }

    public async getTaggingItemList(
        id: string,
        func: string,
        wcdNo: string,
        docKey: DocumentKey
    ): Promise<TagginItemList[]> {
        // await this.sleep(100)
        // const res = [{
        //     counter:'000010',
        //     object:'증기발생기 #02 냉각 환기 시스템',
        //     order:'000000',
        //     setOption:'주석참조',
        //     setCaution:'Line-up 전 S/G 주의사항 참고',
        //     resetOption:'주석참조',
        //     resetCaution:'Line-up 전 S/G 주의사항 참고',
        //     line:'EUG',
        //     docNo:'123-45-678-DWG',
        //     handle:'93882'
        // }, {
        //     counter:'000020',
        //     object:'2436-521-J-HS-0108-AA',
        //     order:'000000',
        //     setOption:'CLOSE',
        //     setCaution:'',
        //     resetOption:'CLOSE',
        //     resetCaution:'',
        //     line:'EUG',
        //     docNo:'234-56-789-DWG',
        //     handle:'97842'
        // }, {
        //     counter:'000030',
        //     object:'2436-521-J-HS-0108-AA',
        //     order:'000000',
        //     setOption:'CLOSE',
        //     setCaution:'',
        //     resetOption:'CLOSE',
        //     resetCaution:'',
        //     line:'EUG',
        //     docNo:'345-67-890-DWG',
        //     handle:'97838'
        // }, {
        //     counter:'000040',
        //     object:'2436-521-J-HS-0108-AA',
        //     order:'000000',
        //     setOption:'CLOSE',
        //     setCaution:'',
        //     resetOption:'CLOSE',
        //     resetCaution:'',
        //     line:'EUG',
        //     docNo:'456-78-901-DWG',
        //     handle:'100649'
        // }, {
        //     counter:'000050',
        //     object:'2436-521-J-HS-0108-AA',
        //     order:'000000',
        //     setOption:'CLOSE',
        //     setCaution:'',
        //     resetOption:'CLOSE',
        //     resetCaution:'',
        //     line:'EUG',
        //     docNo:'567-89-012-DWG',
        //     handle:''
        // }, {
        //     counter:'000060',
        //     object:'2436-521-J-HS-0108-AA',
        //     order:'000000',
        //     setOption:'CLOSE',
        //     setCaution:'',
        //     resetOption:'CLOSE',
        //     resetCaution:'',
        //     line:'EUG',
        //     docNo:'678-90-123-DWG',
        //     handle:''
        // }, {
        //     counter:'000070',
        //     object:'2436-521-J-HS-0108-AA',
        //     order:'000000',
        //     setOption:'CLOSE',
        //     setCaution:'',
        //     resetOption:'CLOSE',
        //     resetCaution:'',
        //     line:'EUG',
        //     docNo:'',
        //     handle:''
        // }, {
        //     counter:'000080',
        //     object:'2436-521-J-HS-0108-AA',
        //     order:'000000',
        //     setOption:'CLOSE',
        //     setCaution:'',
        //     resetOption:'CLOSE',
        //     resetCaution:'',
        //     line:'EUG',
        //     docNo:'',
        //     handle:''
        // }, {
        //     counter:'000090',
        //     object:'2436-521-J-HS-0108-AA',
        //     order:'000000',
        //     setOption:'CLOSE',
        //     setCaution:'',
        //     resetOption:'CLOSE',
        //     resetCaution:'',
        //     line:'EUG',
        //     docNo:'',
        //     handle:''
        // }, {
        //     counter:'000100',
        //     object:'2436-521-J-HS-0108-AA',
        //     order:'000000',
        //     setOption:'CLOSE',
        //     setCaution:'',
        //     resetOption:'CLOSE',
        //     resetCaution:'',
        //     line:'EUG',
        //     docNo:'',
        //     handle:''
        // }, {
        //     counter:'000110',
        //     object:'2436-521-J-HS-0108-AA',
        //     order:'000000',
        //     setOption:'CLOSE',
        //     setCaution:'',
        //     resetOption:'CLOSE',
        //     resetCaution:'',
        //     line:'EUG',
        //     docNo:'',
        //     handle:''
        // }, {
        //     counter:'000120',
        //     object:'2436-521-J-HS-0108-AA',
        //     order:'000000',
        //     setOption:'CLOSE',
        //     setCaution:'',
        //     resetOption:'CLOSE',
        //     resetCaution:'',
        //     line:'EUG',
        //     docNo:'',
        //     handle:''
        // }];
        // return res;
        console.log(
            'getTagginItelList => id:',
            id,
            ' func:',
            func,
            ' wcdNo:',
            wcdNo,
            ' docId:',
            docKey.docId,
            ' docVer:',
            docKey.docVer
        )
        const res = await this.get(
            `/wcdTagging?id=${enc(id)}&func=${enc(func)}&wcdNo=${enc(wcdNo)}&docId=${enc(docKey.docId)}&docVer=${enc(
                docKey.docVer
            )}`
        )
        const result = (await res.json()) as TagginItemList[]
        return result
    }

    public async getRelatedFileInfo(
        DOKAR: string,
        DOKVR: string,
        DOKTL: string,
        DOKNR: string,
        userId: string
    ): Promise<RelatedFileInfo[]> {
        const res = await this.get(
            `/relatedFileInfo?userId=${enc(userId)}&DOKAR=${enc(DOKAR)}&DOKVR=${enc(DOKVR)}&DOKTL=${enc(
                DOKTL
            )}&DOKNR=${enc(DOKNR)}`
        )

        return await res.json()
    }

    public async getMydocList(userId: string): Promise<MydocList[]> {
        const res = await this.get(`/mydocs/folders?userId=${enc(userId)}`)

        return await res.json()
    }

    public async addMydocFolder(userId: string, folderId: string, folderName: string): Promise<void> {
        const data = {
            folderName
        }

        const body = JSON.stringify(data)

        await this.post(`/mydocs/folders/${enc(folderId)}?userId=${enc(userId)}`, body)
    }

    public async deleteMydocFolder(userId: string, folderId: string): Promise<void> {
        await this.delete(`/mydocs/folders/${enc(folderId)}?userId=${enc(userId)}`)
    }

    public async deleteMydocFile(userId: string, fileId: string): Promise<void> {
        await this.delete(`/mydocs/files/${enc(fileId)}?userId=${enc(userId)}`)
    }

    public async renameMydocFolder(userId: string, folderId: string, newName: string): Promise<void> {
        const data = { newName }

        const body = JSON.stringify(data)

        await this.put(`/mydocs/folders/${enc(folderId)}?userId=${enc(userId)}`, body)
    }

    public async mydocFileUpload(userId: string, folderId: string, file: Blob): Promise<void> {
        var data = new FormData()
        data.append('mydocFile', file)
        data.append('folderId', enc(folderId) ?? '')

        await fetch(this.addr + `/mydocs/files?userId=${enc(userId)}`, {
            method: 'POST',
            mode: 'cors',
            body: data
        })
    }

    public async mydocInformation(): Promise<{ editable: boolean }> {
        const res = await this.get(`/mydocs/info`)

        return await res.json()
    }

    public async getAllSimbol(): Promise<any> {
        const res = await this.get('/pld/simbol')

        return await res.json()
    }

    public async getAllSimbolList(data: {
        cId: number | undefined
        cVr: string | undefined
        docNo: string
        docVr: string
        cSeq: number
    }): Promise<any> {
        const { cId, cVr, docNo, docVr, cSeq } = data
        const res = await this.get(`/pld/simbol-list/${cId}/${cVr}/${docNo}/${docVr}/${cSeq}`)

        return await res.json()
    }

    public async getEntitiesList(data: {
        cId: number | undefined
        cVr: string | undefined
        docNo: string
        docVr: string
        cSeq: number
    }): Promise<any> {
        const { cId, cVr, docNo, docVr, cSeq } = data
        const res = await this.get(`/pld/entities-list/${cId}/${cVr}/${docNo}/${docVr}/${cSeq}`)

        return await res.json()
    }

    public async resisterPld(
        procedureNumber: string,
        procedureName: string,
        pldName: string,
        plantValue: string,
        pldDESC: string,
        selectedItems: string[],
        userId: string
    ): Promise<any> {
        const data = { procedureNumber, procedureName, pldName, plantValue, pldDESC, selectedItems }
        const body = JSON.stringify(data)

        const res = await this.post(`/pld/resister/?userId=${enc(userId)}`, body)

        return await res.json()
    }

    public async changePldCanvas(pldList: any): Promise<any> {
        const body = JSON.stringify({ pldList })

        await this.post(`/pld/changePldCanvas`, body)
    }

    public async addSimbolList(simbolList: any): Promise<any> {
        const body = JSON.stringify({ simbolList })

        await this.post('/pld/simbol-list', body)
    }

    public async getPldDocumentList(c_id: number, c_vr: string): Promise<any> {
        const res = await this.get(`/pld/document-list/${c_id}/${c_vr}`)

        return await res.json()
    }

    public async addEntitiesList(entitiesList: any[]): Promise<void> {
        const body = JSON.stringify({ entitiesList })

        await this.post('/pld/entities-list', body)
    }

    public async searchPld(companyValue: string, plantValue: string): Promise<any> {
        if (companyValue === '') companyValue = 'all'

        if (plantValue === '') plantValue = 'all'

        const res = await this.get(`/pld/open/${companyValue}/${plantValue}`)

        return await res.json()
    }

    public async refreshDocumentListCash(): Promise<any> {
        const res = await this.get(`/documents?isRefresh=${enc('true')}`)

        // const res = await this.get(`/folders?isRefresh=${enc(parentId)}`)

        return await res.json()
    }
}

class RepositoryMock implements RepositoryBase {
    private async sleep(timeout: number): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, timeout))
    }

    private get(path: string): Promise<Response> {
        return fetch(path)
    }

    public async setUserContext(userId: string, value: UserContext): Promise<void> {}
    public async getUserContext(userId: string): Promise<UserContext> {
        return {
            userId,
            favorite: {
                documents: [
                    {
                        docId: '000000000000000000000000002508',
                        docVer: '001',
                        docName: 'P&ID-Instrument Air System Ash Transfer Area Unit 1&2',
                        docNumber: '8610-11500-OM-105-902',
                        plantCode: '5100'
                    },
                    {
                        docId: '000000000000000000000000002502',
                        docVer: '001',
                        docName: 'P&ID-Fly Ash Slio Unit 1&2',
                        docNumber: '8610-11510-OM-105-904',
                        plantCode: '5100'
                    },
                    {
                        docId: '000000000000000000000000002504',
                        docVer: '001',
                        docName: 'P&ID-Ash Transfer System Unit 1&2',
                        docNumber: '8610-11540-OM-105-901',
                        plantCode: '5100'
                    },
                    {
                        docId: '000000000000000000000000002505',
                        docVer: '001',
                        docName: 'P&ID-Ash Transfer System Unit 1&2',
                        docNumber: '8610-11540-OM-105-902',
                        plantCode: '5100'
                    },
                    {
                        docId: '000000000000000000000000002507',
                        docVer: '001',
                        docName: 'P&ID-Instrument Air System Precipitator Area Unit 1',
                        docNumber: '8611-11500-OM-105-901',
                        plantCode: '5100'
                    }
                ],
                equipments: [
                    {
                        docId: '000000000000000000000000002507',
                        docVer: '001',
                        docName: 'P&ID-Instrument Air System Precipitator Area Unit 1',
                        docNumber: '8611-11500-OM-105-901',
                        plantCode: '5100',
                        tagId: '00000000000000000012',
                        function: '1-15100-J-FW-FCV-01A'
                    }
                ]
            }
        }
    }

    public async getDocumentList(): Promise<DocumentList[]> {
        const res = await this.get(`/mock/documentList.json`)

        return await res.json()
    }

    public async getDocument(docKey: DocumentKey, plantCode: string): Promise<DocumentContext> {
        const res = await this.get(`/mock/color.json`)
        const document = await res.json()

        document.docId = docKey.docId
        document.docVer = docKey.docVer
        document.docName = 'DocName#' + docKey.docId
        document.docNumber = 'DocNumber#' + docKey.docId
        document.plantCode = plantCode

        return document
    }

    public async getDocumentFile(_key: DocumentKey): Promise<Uint8Array> {
        const res = await this.get('/mock/color.vsf')

        const buffer = await res.arrayBuffer()

        return new Uint8Array(buffer)
    }

    public async getRootFolder(): Promise<DocFolder[]> {
        return this.getFolders('000000000000000001')
    }

    public async getFolders(_parentId: string): Promise<DocFolder[]> {
        await this.sleep(10)

        return [
            {
                folderId: '000000000000002100',
                plantCode: '1',
                folderName: '하동',
                parent: '000000000000000001'
            },
            {
                folderId: '000000000000002200',
                plantCode: '1',
                folderName: '신인천',
                parent: '000000000000000001'
            },
            {
                folderId: '000000000000002300',
                plantCode: '1',
                folderName: '부산',
                parent: '000000000000000001'
            },
            {
                folderId: '000000000000002400',
                plantCode: '1',
                folderName: '남제주',
                parent: '000000000000000001'
            },
            {
                folderId: '000000000000002626',
                plantCode: '1',
                folderName: '영월',
                parent: '000000000000000001'
            },
            {
                folderId: '000000000000002700',
                plantCode: '1',
                folderName: '삼척',
                parent: '000000000000000001'
            },
            {
                folderId: '000000000000002800',
                plantCode: '1',
                folderName: '안동',
                parent: '000000000000000001'
            }
        ]
    }

    public async searchDocument(
        _folderId: string | undefined,
        _docName: string | undefined,
        _docNumber: string | undefined
    ): Promise<DocumentResult[]> {
        await this.sleep(2000)

        return [
            {
                plantCode: '5100',
                hogi: '1',
                docNumber: '8619-31160-L-106-001-01',
                docName: 'Diagram of Turbine Steam Drains',
                docId: '000000000000000000000000002563',
                docVer: '001',
                folderId: '000000000000002111'
            },
            {
                plantCode: '5100',
                hogi: '2',
                docNumber: '8619-31160-L-106-001-01',
                docName: 'Diagram of Turbine Steam Drains',
                docId: '000000000000000000000000004629',
                docVer: '001',
                folderId: '000000000000002112'
            },
            {
                plantCode: '5100',
                hogi: '1',
                docNumber: '8619-31420-L-106-001-01',
                docName: 'Lube Oil Diagram',
                docId: '000000000000000000000000002567',
                docVer: '001',
                folderId: '000000000000002111'
            },
            {
                plantCode: '5100',
                hogi: '2',
                docNumber: '8619-31420-L-106-001-01',
                docName: 'Lube Oil Diagram',
                docId: '000000000000000000000000004633',
                docVer: '001',
                folderId: '000000000000002112'
            },
            {
                plantCode: '5100',
                hogi: '1',
                docNumber: '8619-31420-L-106-001-02',
                docName: 'Lube Oil Diagram',
                docId: '000000000000000000000000002568',
                docVer: '001',
                folderId: '000000000000002111'
            }
        ]
    }

    public async getSymbolsByPlant(plantCode: string): Promise<SymbolResult[]> {
        await this.sleep(10)

        return [
            {
                libId: '00000000000000000562',
                libName: 'GLOBE',
                libDesc: 'GLOBE',
                parent: '00000000000000000519'
            },
            {
                libId: '00000000000000000534',
                libName: 'HEAT EXCHANGER HEAT EXCHANGER',
                libDesc: 'HEAT EXCHANGER HEAT EXCHANGER',
                parent: '00000000000000000001'
            },
            {
                libId: '00000000000000000583',
                libName: 'HEATER',
                libDesc: 'HEATER',
                parent: '00000000000000000001'
            },
            {
                libId: '00000000000000000583',
                libName: 'HEATER',
                libDesc: 'HEATER',
                parent: '00000000000000000001'
            },
            {
                libId: '00000000000000000583',
                libName: 'HEATER',
                libDesc: 'HEATER',
                parent: '00000000000000000001'
            }
        ]
    }

    public async searchEquipment(
        folderId: string | undefined,
        libId: string | undefined,
        tag: string | undefined
    ): Promise<EquipmentResult[]> {
        await this.sleep(10)

        return [
            {
                plantCode: '5100',
                docNumber: '8619-11130-Z-105-101',
                hogi: '1',
                function: '1-15100-J-FW-FCV-01A',
                docId: '000000000000000000000000002550',
                docVer: '001',
                docName: 'P&I Diagram Feed Water And Injection Water(1/2)',
                folderId: '000000000000002111',
                tagId: '00000000000000001017'
            },
            {
                plantCode: '5100',
                docNumber: '8629-15100-M-105-001',
                hogi: '1',
                function: '1-15100-J-FW-FCV-01A',
                docId: '000000000000000000000000002752',
                docVer: '001',
                docName: 'P&I Diagram Feedwater System(1/2)',
                folderId: '000000000000002111',
                tagId: '00000000000000001106'
            },
            {
                plantCode: '5100',
                docNumber: '8619-11130-Z-105-101',
                hogi: '1',
                function: '1-15100-J-FW-FCV-01A-AC',
                docId: '000000000000000000000000002550',
                docVer: '001',
                docName: 'P&I Diagram Feed Water And Injection Water(1/2)',
                folderId: '000000000000002111',
                tagId: '00000000000000001202'
            },
            {
                plantCode: '5100',
                docNumber: '8629-15100-M-105-001',
                hogi: '1',
                function: '1-15100-J-FW-PSH-01A',
                docId: '000000000000000000000000002752',
                docVer: '001',
                docName: 'P&I Diagram Feedwater System(1/2)',
                folderId: '000000000000002111',
                tagId: '00000000000000001096'
            },
            {
                plantCode: '5100',
                docNumber: '8619-11130-Z-105-101',
                hogi: '1',
                function: '1-15100-J-FW-PT-01A',
                docId: '000000000000000000000000002550',
                docVer: '001',
                docName: 'P&I Diagram Feed Water And Injection Water(1/2)',
                folderId: '000000000000002111',
                tagId: '00000000000000001108'
            }
        ]
    }

    public async getHandles(docId: string, docVer: string, tagId: string): Promise<EquipmentHandle[]> {
        await this.sleep(10)

        return [
            { handle: '65069', tagType: '001' },
            { handle: '68760', tagType: '001' }
        ]
    }

    public async hasAuthorization(userId: string): Promise<boolean> {
        await this.sleep(10)
        return true
    }

    public async getEquipmentLinks(docKey: DocumentKey, plantCode: string, handle: string): Promise<EquipmentLink[]> {
        await this.sleep(10)

        // return [
        //     {
        //         tagType: '001',
        //         equipmentLinkId: 'equipmentLinkId#1',
        //         funcDetail: 'funcDetail#1',
        //         linkObject: 'linkObject#1',
        //         opcDocId: undefined,
        //         opcDocVer: undefined,
        //         opcPlantCode: undefined,
        //         opcHogi: undefined,
        //         opcTagId: undefined,
        //         opcConnection: undefined
        //     }
        // ]

        return [
            {
                tagId: '00000000000000000011',
                tagType: '001',
                equipmentLinkId: '10115268',
                funcDetail: '#6 HRSG HP Attemp Line TEMP TE-2332',
                linkObject: 'IELT',
                opcDocId: undefined,
                opcDocVer: undefined,
                opcPlantCode: undefined,
                opcHogi: undefined,
                opcTagId: undefined,
                opcConnection: undefined
            },
            {
                tagId: '00000000000000000012',
                tagType: '001',
                equipmentLinkId: '10105280',
                funcDetail: '#2 HRSG HP Attemp Line TEMP TE-2332',
                linkObject: 'IELT',
                opcDocId: undefined,
                opcDocVer: undefined,
                opcPlantCode: undefined,
                opcHogi: undefined,
                opcTagId: undefined,
                opcConnection: undefined
            },
            {
                tagId: '00000000000000000010',
                tagType: '001',
                equipmentLinkId: '10107955',
                funcDetail: '#3 HRSG HP Attemp Line TEMP TE-3332',
                linkObject: 'IELT',
                opcDocId: undefined,
                opcDocVer: undefined,
                opcPlantCode: undefined,
                opcHogi: undefined,
                opcTagId: undefined,
                opcConnection: undefined
            },
            {
                tagId: '00000000000000000014',
                tagType: '002',
                equipmentLinkId: undefined,
                funcDetail: undefined,
                linkObject: undefined,
                opcDocId: '000000000000000000000000004315',
                opcDocVer: '001',
                opcPlantCode: '5200',
                opcHogi: '2호기',
                opcTagId: '00000000000000001210',
                opcConnection: '15100-OJ-105-001H7'
            },
            {
                tagId: '00000000000000000015',
                tagType: '002',
                equipmentLinkId: undefined,
                funcDetail: undefined,
                linkObject: undefined,
                opcDocId: '000000000000000000000000002100',
                opcDocVer: '001',
                opcPlantCode: '5200',
                opcHogi: '1호기',
                opcTagId: '00000000000000001207',
                opcConnection: '15100-OJ-105-001H7'
            },
            {
                tagId: '00000000000000000016',
                tagType: '002',
                equipmentLinkId: undefined,
                funcDetail: undefined,
                linkObject: undefined,
                opcDocId: '000000000000000000000000004321',
                opcDocVer: '001',
                opcPlantCode: '5200',
                opcHogi: '3호기',
                opcTagId: '00000000000000001207',
                opcConnection: '15100-OJ-105-001H7'
            }
        ]
    }

    public async getMarkups(userId: string, key: DocumentKey, plantCode: string): Promise<MarkupContent[]> {
        await this.sleep(10)

        return [
            {
                seq: 'seq1',
                writer: { userId: 'string', name: 'string' },
                docId: 'string',
                docVer: 'string',
                plantCode: 'string',
                title: 'string',
                paths: [
                    {
                        type: 'string',
                        width: 100,
                        color: 'red',
                        values: [],
                        texts: [],
                        dash: [],
                        area: []
                    }
                ],
                isPublic: 1,
                createDate: '2021-10-10 10:10'
            },
            {
                seq: 'seq2',
                writer: { userId: 'string', name: 'string' },
                docId: 'string',
                docVer: 'string',
                plantCode: 'string',
                title: 'string',
                paths: [
                    {
                        type: 'string',
                        width: 100,
                        color: 'red',
                        values: [],
                        texts: [],
                        dash: [],
                        area: []
                    }
                ],
                isPublic: 1,
                createDate: '2021-10-10 10:10'
            },
            {
                seq: 'seq3',
                writer: { userId: 'string', name: 'string' },
                docId: 'string',
                docVer: 'string',
                plantCode: 'string',
                title: 'string',
                paths: [
                    {
                        type: 'string',
                        width: 100,
                        color: 'red',
                        values: [],
                        texts: [],
                        dash: [],
                        area: []
                    }
                ],
                isPublic: 1,
                createDate: '2021-10-10 10:10'
            },
            {
                seq: 'seq4',
                writer: { userId: 'string', name: 'string' },
                docId: 'string',
                docVer: 'string',
                plantCode: 'string',
                title: 'string',
                paths: [
                    {
                        type: 'string',
                        width: 100,
                        color: 'red',
                        values: [],
                        texts: [],
                        dash: [],
                        area: []
                    }
                ],
                isPublic: 1,
                createDate: '2021-10-10 10:10'
            },
            {
                seq: 'seq5',
                writer: { userId: 'string', name: 'string' },
                docId: 'string',
                docVer: 'string',
                plantCode: 'string',
                title: 'string',
                paths: [
                    {
                        type: 'string',
                        width: 100,
                        color: 'red',
                        values: [],
                        texts: [],
                        dash: [],
                        area: []
                    }
                ],
                isPublic: 1,
                createDate: '2021-10-10 10:10'
            }
        ]
    }

    public async insertMarkup(values: InsertMarkupValue): Promise<void> {
        const body = JSON.stringify(values)
        console.log(body)

        await this.sleep(10)
    }

    public async updateMarkup(values: UpdateMarkupValue): Promise<void> {
        const body = JSON.stringify(values)
        console.log(body)

        await this.sleep(10)
    }

    public async deleteMarkup(value: DeleteMarkupValue): Promise<void> {
        const body = JSON.stringify(value)
        console.log(body)

        await this.sleep(10)
    }

    public async getDocumentNotiorders(
        key: DocumentKey,
        requestType: string,
        startDate?: string,
        endDate?: string
    ): Promise<EquipmentNotiorder[]> {
        await this.sleep(10)

        return [
            {
                tagId: '00000000000000000018',
                function: '10MBM12GT007',
                notifications: [
                    {
                        function: '10MBA28CT103',
                        id: '10140159',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311565',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행완료',
                        taskType: 'M1'
                    }
                ],
                orders: []
            },
            {
                tagId: '00000000000000000016',
                function: '10MBM12GT008',
                notifications: [
                    {
                        function: '10MBA28CT103',
                        id: '10140159',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311565',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행완료',
                        taskType: 'M1'
                    }
                ],
                orders: []
            },
            {
                tagId: '00000000000000000002',
                function: '10MBM12GT010',
                notifications: [
                    {
                        function: '10MBA28CT103',
                        id: '10140159',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311565',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행완료',
                        taskType: 'M1'
                    }
                ],
                orders: []
            },
            {
                tagId: '00000000000000000004',
                function: '10MBM12AV012',
                notifications: [
                    {
                        function: '10MBA28CT103',
                        id: '10140159',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311565',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행완료',
                        taskType: 'M1'
                    }
                ],
                orders: []
            },
            {
                tagId: '00000000000000000003',
                function: '10MBM12AV011',
                notifications: [
                    {
                        function: '10MBA28CT103',
                        id: '10140159',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311565',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행완료',
                        taskType: 'M1'
                    }
                ],
                orders: []
            },
            {
                tagId: '00000000000000000001',
                function: '10MBM12AV010',
                notifications: [
                    {
                        function: '10MBA28CT103',
                        id: '10140159',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311565',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행완료',
                        taskType: 'M1'
                    }
                ],
                orders: []
            },
            {
                tagId: '00000000000000000017',
                function: '10MBM12AV007',
                notifications: [
                    {
                        function: '10MBA28CT103',
                        id: '10140159',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311565',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행완료',
                        taskType: 'M1'
                    }
                ],
                orders: []
            },
            {
                tagId: '00000000000000000023',
                function: '10MBM12AV006',
                notifications: [
                    {
                        function: '10MBA28CT103',
                        id: '10140159',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311565',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행완료',
                        taskType: 'M1'
                    }
                ],
                orders: []
            },
            {
                tagId: '00000000000000000012',
                function: '10MBM12CP412',
                notifications: [
                    {
                        function: '10MBA28CT103',
                        id: '10140159',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311565',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행완료',
                        taskType: 'M1'
                    }
                ],
                orders: []
            },
            {
                tagId: '00000000000000000011',
                function: '10MBM12CP412',
                notifications: [
                    {
                        function: '10MBA28CT103',
                        id: '10140162',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311565',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행완료',
                        taskType: 'M1'
                    }
                ],
                orders: [
                    {
                        function: '10MBA28CT104',
                        id: '10140162',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311560',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행',
                        taskType: 'C1'
                    }
                ]
            },
            {
                tagId: '00000000000000000022',
                function: '10MBM12GT007',
                notifications: [],
                orders: [
                    {
                        function: '10MBA28CT104',
                        id: '10140160',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311560',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행',
                        taskType: 'C1'
                    },
                    {
                        function: '10MBA28CT1024',
                        id: '1014016011',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311560',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행',
                        taskType: 'C1'
                    }
                ]
            },
            {
                tagId: '00000000000000000006',
                function: '10MBM12GT012',
                notifications: [],
                orders: [
                    {
                        function: '10MBA28CT104',
                        id: '10140160',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311560',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행',
                        taskType: 'C1'
                    },
                    {
                        function: '10MBA28CT1024',
                        id: '1014016011',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311560',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행',
                        taskType: 'C1'
                    }
                ]
            },
            {
                tagId: '00000000000000000010',
                function: '10MBM12AV001',
                notifications: [],
                orders: [
                    {
                        function: '10MBA28CT104',
                        id: '10140160',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311560',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행',
                        taskType: 'C1'
                    },
                    {
                        function: '10MBA28CT1024',
                        id: '1014016011',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311560',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행',
                        taskType: 'C1'
                    }
                ]
            },
            {
                tagId: '00000000000000000008',
                function: '10MBM12AV003',
                notifications: [],
                orders: [
                    {
                        function: '10MBA28CT104',
                        id: '10140160',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311560',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행',
                        taskType: 'C1'
                    },
                    {
                        function: '10MBA28CT1024',
                        id: '1014016011',
                        detail: 'GT Temp TURB OUTLET 오지시',
                        equipmentExtId: '10311560',
                        startDate: '20211103',
                        endDate: '20221212',
                        type: 'order',
                        status: '발행',
                        taskType: 'C1'
                    }
                ]
            }
        ]
    }

    public async getOrderUrl(id: string): Promise<string> {
        await this.sleep(10)

        return 'http://test.url/getOrderUrl'
    }

    public async getNoticeUrl(id: string): Promise<string> {
        await this.sleep(10)

        return 'http://test.url/getNoticeUrl'
    }

    public async getEquipmentInfoUrl(equnr: string): Promise<string> {
        await this.sleep(10)

        return `http://test.url/getEquipmentInfoUrl/${equnr}`
    }
    public async getNotiIssueUrl(equnr: string): Promise<string> {
        await this.sleep(10)

        return `http://test.url/getNotiIssueUrl/${equnr}`
    }
    public async getOrderIssueUrl(equnr: string): Promise<string> {
        await this.sleep(10)

        return `http://test.url/getOrderIssueUrl/${equnr}`
    }
    public async getNotiRecordUrl(equnr: string, startDate: string, endDate: string): Promise<string> {
        await this.sleep(10)

        return `http://test.url/getNotiRecordUrl/${equnr}/${startDate}/${endDate}`
    }
    public async getOrderRecordUrl(equnr: string, startDate: string, endDate: string): Promise<string> {
        await this.sleep(10)

        return `http://test.url/getOrderRecordUrl/${equnr}/${startDate}/${endDate}`
    }

    public async getOrderEquipments(docKey: DocumentKey): Promise<string[]> {
        await this.sleep(10)
        return ['a', 'b']
    }

    public async getOrderListFlag(func: string): Promise<OrderListFlag[]> {
        await this.sleep(100)
        const res = [
            {
                taskType: 'PM02',
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                startDate: '2021-04-15',
                endDate: '2021-04-15',
                status: '확인'
            },
            {
                taskType: 'PM02',
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                startDate: '2021-04-15',
                endDate: '2021-04-15',
                status: '확인'
            },
            {
                taskType: 'PM02',
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                startDate: '2021-04-15',
                endDate: '2021-04-15',
                status: '확인'
            },
            {
                taskType: 'PM02',
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                startDate: '2021-04-15',
                endDate: '2021-04-15',
                status: '확인'
            },
            {
                taskType: 'PM02',
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                startDate: '2021-04-15',
                endDate: '2021-04-15',
                status: '확인'
            },
            {
                taskType: 'PM02',
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                startDate: '2021-04-15',
                endDate: '2021-04-15',
                status: '확인'
            },
            {
                taskType: 'PM02',
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                startDate: '2021-04-15',
                endDate: '2021-04-15',
                status: '확인'
            },
            {
                taskType: 'PM02',
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                startDate: '2021-04-15',
                endDate: '2021-04-15',
                status: '확인'
            },
            {
                taskType: 'PM02',
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                startDate: '2021-04-15',
                endDate: '2021-04-15',
                status: '확인'
            },
            {
                taskType: 'PM02',
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                startDate: '2021-04-15',
                endDate: '2021-04-15',
                status: '확인'
            },
            {
                taskType: 'PM02',
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                startDate: '2021-04-15',
                endDate: '2021-04-15',
                status: '확인'
            }
        ]
        return res
    }

    public async getOrderList(func: string): Promise<OrderList[]> {
        await this.sleep(100)
        const res = [
            {
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                wcaNo: '2021-04-15',
                wcdNo: '2021-04-15',
                status: 'CLSD 종료',
                object: '2435-431-M-PP018'
            },
            {
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                wcaNo: '2021-04-15',
                wcdNo: '2021-04-15',
                status: 'CLSD 종료',
                object: '2435-431-M-PP018'
            },
            {
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                wcaNo: '2021-04-15',
                wcdNo: '2021-04-15',
                status: 'CLSD 종료',
                object: '2435-431-M-PP018'
            },
            {
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                wcaNo: '2021-04-15',
                wcdNo: '2021-04-15',
                status: 'CLSD 종료',
                object: '2435-431-M-PP018'
            },
            {
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                wcaNo: '2021-04-15',
                wcdNo: '2021-04-15',
                status: 'CLSD 종료',
                object: '2435-431-M-PP018'
            },
            {
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                wcaNo: '2021-04-15',
                wcdNo: '2021-04-15',
                status: 'CLSD 종료',
                object: '2435-431-M-PP018'
            },
            {
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                wcaNo: '2021-04-15',
                wcdNo: '2021-04-15',
                status: 'CLSD 종료',
                object: '2435-431-M-PP018'
            },
            {
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                wcaNo: '2021-04-15',
                wcdNo: '2021-04-15',
                status: 'CLSD 종료',
                object: '2435-431-M-PP018'
            },
            {
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                wcaNo: '2021-04-15',
                wcdNo: '2021-04-15',
                status: 'CLSD 종료',
                object: '2435-431-M-PP018'
            },
            {
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                wcaNo: '2021-04-15',
                wcdNo: '2021-04-15',
                status: 'CLSD 종료',
                object: '2435-431-M-PP018'
            },
            {
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                wcaNo: '2021-04-15',
                wcdNo: '2021-04-15',
                status: 'CLSD 종료',
                object: '2435-431-M-PP018'
            },
            {
                id: '000030410772',
                detail: '점검을 위한 오더 내역 A-001',
                wcaNo: '2021-04-15',
                wcdNo: '2021-04-15',
                status: 'CLSD 종료',
                object: '2435-431-M-PP018'
            }
        ]
        return res
    }

    public async getTaggingItemList(id: string, func: string, wcdNo: string, docKey: any): Promise<TagginItemList[]> {
        await this.sleep(100)
        const res = [
            {
                counter: '000010',
                object: '증기발생기 #02 냉각 환기 시스템',
                order: '000000',
                setOption: '주석참조',
                setCaution: 'Line-up 전 S/G 주의사항 참고',
                resetOption: '주석참조',
                resetCaution: 'Line-up 전 S/G 주의사항 참고',
                line: 'EUG',
                docNo: '123-45-678-DWG'
            },
            {
                counter: '000020',
                object: '2436-521-J-HS-0108-AA',
                order: '000000',
                setOption: 'CLOSE',
                setCaution: '',
                resetOption: 'CLOSE',
                resetCaution: '',
                line: 'EUG',
                docNo: ''
            },
            {
                counter: '000030',
                object: '2436-521-J-HS-0108-AA',
                order: '000000',
                setOption: 'CLOSE',
                setCaution: '',
                resetOption: 'CLOSE',
                resetCaution: '',
                line: 'EUG',
                docNo: ''
            },
            {
                counter: '000040',
                object: '2436-521-J-HS-0108-AA',
                order: '000000',
                setOption: 'CLOSE',
                setCaution: '',
                resetOption: 'CLOSE',
                resetCaution: '',
                line: 'EUG',
                docNo: ''
            },
            {
                counter: '000050',
                object: '2436-521-J-HS-0108-AA',
                order: '000000',
                setOption: 'CLOSE',
                setCaution: '',
                resetOption: 'CLOSE',
                resetCaution: '',
                line: 'EUG',
                docNo: ''
            },
            {
                counter: '000060',
                object: '2436-521-J-HS-0108-AA',
                order: '000000',
                setOption: 'CLOSE',
                setCaution: '',
                resetOption: 'CLOSE',
                resetCaution: '',
                line: 'EUG',
                docNo: ''
            },
            {
                counter: '000070',
                object: '2436-521-J-HS-0108-AA',
                order: '000000',
                setOption: 'CLOSE',
                setCaution: '',
                resetOption: 'CLOSE',
                resetCaution: '',
                line: 'EUG',
                docNo: ''
            },
            {
                counter: '000080',
                object: '2436-521-J-HS-0108-AA',
                order: '000000',
                setOption: 'CLOSE',
                setCaution: '',
                resetOption: 'CLOSE',
                resetCaution: '',
                line: 'EUG',
                docNo: ''
            },
            {
                counter: '000090',
                object: '2436-521-J-HS-0108-AA',
                order: '000000',
                setOption: 'CLOSE',
                setCaution: '',
                resetOption: 'CLOSE',
                resetCaution: '',
                line: 'EUG',
                docNo: ''
            },
            {
                counter: '000100',
                object: '2436-521-J-HS-0108-AA',
                order: '000000',
                setOption: 'CLOSE',
                setCaution: '',
                resetOption: 'CLOSE',
                resetCaution: '',
                line: 'EUG',
                docNo: ''
            },
            {
                counter: '000110',
                object: '2436-521-J-HS-0108-AA',
                order: '000000',
                setOption: 'CLOSE',
                setCaution: '',
                resetOption: 'CLOSE',
                resetCaution: '',
                line: 'EUG',
                docNo: ''
            },
            {
                counter: '000120',
                object: '2436-521-J-HS-0108-AA',
                order: '000000',
                setOption: 'CLOSE',
                setCaution: '',
                resetOption: 'CLOSE',
                resetCaution: '',
                line: 'EUG',
                docNo: ''
            }
        ]
        return res
    }

    public async searchSignal(
        folderId: string | undefined,
        docname: string | undefined,
        tagname: string | undefined,
        userId: string
    ): Promise<SearchSignalResult[]> {
        await this.sleep(10)

        return [
            {
                SNO: 298,
                TAG: '10MKG55CT001A',
                DRAW_NM: 'TEMP AIR HEATER',
                PAGE: '1',
                FILE_PATH: 'GT',
                PLANTCODE: '6000',
                FILENM: 'GT_Interconnection_part321.pdf',
                PLANTNM: '안동 GT',
                viewerUrl: ''
            }
        ]
    }

    public async searchRelated(
        folders: string[],
        docName: string | undefined,
        docNumber: string | undefined
    ): Promise<RelatedSearchResult[]> {
        await this.sleep(10)

        return [
            {
                DOKAR: 'C12',
                DOKNR: '7473-41320-0101',
                DOKTL: '000',
                DOKVR: 'F0',
                DKTXT: 'ASSEMBLY DIAGRAM FOR 6.9KV SWGR 3SW001-0',
                ZZCHANGEDATE: '2010-07-19',
                EGUBUN: 'null',
                FGUBUN: 'F',
                DOKARNM: '신인천:공급사도면'
            }
        ]
    }
    public async getRelatedFolders(parentId: string): Promise<RelatedFolder[]> {
        await this.sleep(10)

        return []
    }
    public async getRelatedRoot(): Promise<RelatedFolder[]> {
        await this.sleep(10)

        return []
    }

    public async getRelatedFileInfo(
        DOKAR: string,
        DOKVR: string,
        DOKTL: string,
        DOKNR: string,
        userId: string
    ): Promise<RelatedFileInfo[]> {
        await this.sleep(10)

        return [
            {
                DOKAR: 'B11',
                DOKVR: 'F0',
                DOKTL: '000',
                DOKNR: '8623-71210-P-183-006',
                FILENAME: '06010020',
                DAPPL: 'TIF',
                FILE_IDX: 1,
                viewerUrl: ''
            },
            {
                DOKAR: 'B11',
                DOKVR: 'F0',
                DOKTL: '000',
                DOKNR: '8623-71210-P-183-006',
                FILENAME: '(2)',
                DAPPL: 'TIF',
                FILE_IDX: 1,
                viewerUrl: ''
            }
        ]
    }

    public async getMydocList(userId: string): Promise<MydocList[]> {
        await this.sleep(10)

        return [
            {
                id: 'root',
                folderName: '사용자',
                subfolders: [
                    {
                        id: 'folder#2',
                        folderName: '폴더이름#2',
                        subfolders: [],
                        documents: [
                            {
                                id: 'doc#2',
                                filename: 'filename#2',
                                size: 123456,
                                viewerUrl: 'http://localhost/'
                            }
                        ]
                    }
                ],
                documents: [
                    {
                        id: 'doc#1',
                        filename: 'filename#1',
                        size: 890123,
                        viewerUrl: 'http://localhost/'
                    }
                ]
            }
        ]
    }

    public async deleteMydocFolder(userId: string, folderId: string): Promise<void> {
        await this.sleep(10)

        alert(userId + ' ' + folderId)
    }

    public async deleteMydocFile(userId: string, fileId: string): Promise<void> {
        await this.sleep(10)
        alert(userId + ' ' + fileId)
    }

    public async addMydocFolder(userId: string, parentId: string, folderName: string): Promise<void> {
        await this.sleep(10)
        alert(userId + ' ' + parentId + ' ' + folderName)
    }
    public async renameMydocFolder(userId: string, folderId: string, newName: string): Promise<void> {
        await this.sleep(10)
        alert(userId + ' ' + folderId + ' ' + newName)
    }

    public async mydocFileUpload(userId: string, folderId: string, file: Blob): Promise<void> {
        await this.sleep(10)
    }

    public async mydocInformation(): Promise<{ editable: boolean }> {
        await this.sleep(10)

        return { editable: true }
    }

    public async getAllSimbol(): Promise<any> {
        await this.sleep(10)
    }

    public async getAllSimbolList(): Promise<any> {
        await this.sleep(10)
    }

    public async getEntitiesList(): Promise<any> {
        await this.sleep(10)
    }

    public async resisterPld(
        procedureNumber: string,
        procedureName: string,
        pldName: string,
        plantValue: string,
        pldDESC: string,
        selectedItems: string[],
        userId: string
    ): Promise<any> {
        await this.sleep(10)
    }

    public async changePldCanvas(pldList: any): Promise<any> {
        await this.sleep(10)
    }

    public async addSimbolList(simbolList: any): Promise<any> {
        await this.sleep(10)
    }

    public async getPldDocumentList(c_id: number, c_vr: string): Promise<any> {
        await this.sleep(10)
    }

    public async addEntitiesList(entitiesList: any[]) {
        await this.sleep(10)
    }

    public async searchPld(companyValue: string, plantValue: string): Promise<PldList[]> {
        await this.sleep(10)

        return [] as PldList[]
    }

    public async refreshDocumentListCash(): Promise<any> {
        await this.sleep(10)
    }
}
// 서버 URL 환경변수 설정
const { env, localUrl, devUrl, prodUrl } = serviceConfig
const addr = env === 'dev' ? devUrl : env === 'local' ? localUrl : prodUrl

const Repository = RepositoryBase.create(addr ?? '')

export default Repository
