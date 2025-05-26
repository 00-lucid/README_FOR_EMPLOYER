import * as noderfc from 'node-rfc'
import { Shell, File } from 'common'
import {
    EquipmentLink,
    SymbolResult,
    EquipmentResult,
    DocFolder,
    DocumentContext,
    EquipmentList,
    DocumentList,
    DocumentResult,
    EquipmentHandle,
    MarkupContent,
    InsertMarkupValue,
    UpdateMarkupValue,
    DeleteMarkupValue,
    EquipmentNotiorder,
    Notiorder,
    RelatedFolder,
    RelatedSearchResult,
    SearchSignalResult,
    UserContext,
    RelatedFileInfo,
    Order,
    Taggings,
    OrderList
} from '../types'
import { DocumentRepository, NotiorderEquipment, replaceDns } from './'
import Cache from 'common/Cache'
import fs from 'fs'
import { encrypt as enc } from '../types'

type Folder = { folderId: string; parentId: string; subfolders: Folder[] }

type RfcNotiorder = {
    QMNUM?: string
    AUFNR?: string
    QMTXT?: string
    KTEXT?: string
    MAPAR?: string
    EQUNR?: string
    QMART?: string
    AUART?: string
    QMDAT?: string
    GSTRP?: string
    GLTRP?: string
    STATUS?: string
    TPLNR?: string
}

// type RfcOrder = {
//     AUART?: string
//     AUFNR?: string
//     KTEXT?: string
//     GSTRP?: string
//     GLTRP?: string
//     STATUS?: string
// }

type RfcCurrentOrder = {
    AUFNR?: string
    TGTXT?: string
    WAPINR?: string
    WCNR?: string
    WCD_SYSST?: string
    COBJ_TPLNR?: string
}

type RfcTagging = {
    SEQ?: string
    CCOBJ?: string
    TGSEQ?: string
    TGPROC?: string
    TGTXT?: string
    UNPROC?: string
    CONTROL?: string
    SYSST?: string
    DOCNUMBER?: string
}

type InsertPMDCUserType = {
    USERID: string
    MEMO: string
    POSITION: string
    ID: string
}

export class DocumentService {
    public static create(
        repo: DocumentRepository,
        docViewerUrl: string,
        signalPath: string,
        relatedPath: string
    ): DocumentService {
        return new DocumentService(repo, docViewerUrl, signalPath, relatedPath)
    }

    private readonly repo: DocumentRepository
    private readonly docViewerUrl: string
    private readonly signalPath: string
    private readonly relatedPath: string
    private pool: noderfc.Pool

    public constructor(repo: DocumentRepository, docViewerUrl: string, signalPath: string, relatedPath: string) {
        this.repo = repo
        this.docViewerUrl = docViewerUrl
        this.signalPath = signalPath
        this.relatedPath = relatedPath
        this.pool = this.initSAP()
    }

    public initSAP() {
        const param = { dest: 'ESP' } as noderfc.RfcConnectionParameters
        const pool = new noderfc.Pool({ connectionParameters: param })
        return pool
    }

    public async getDocumentList(isRefresh: string | undefined): Promise<DocumentList[]> {
        // set cache key
        const cacheKey = `document:list`
        if (!isRefresh) {
            // try to get from cache
            console.time('cached')
            const cacheValue = Cache.get(cacheKey)
            if (cacheValue) {
                console.timeEnd('cached')
                return JSON.parse(cacheValue) as DocumentList[]
            }
            console.timeEnd('cached')
            console.time('unCached')
        }

        const parentIds: string[] = []

        const map = new Map<string, DocumentList>()

        const folders = await this.repo.getAllFolders()

        for (const folder of folders) {
            if (folder.parent === null) {
                parentIds.push(folder.folderId)
            }

            map.set(folder.folderId, {
                folderName: folder.folderName,
                parentId: folder.parent,
                subfolders: [],
                documents: [],
                folderId: folder.folderId,
                plantCode: folder.plantCode
            })
        }

        const documents = await this.repo.getDocumentList()

        for (const document of documents) {
            if (null !== document.folderId) {
                const tree = map.get(document.folderId) as DocumentList
                tree.documents.push(document)
            }
        }

        for (const value of map.values()) {
            if (value.parentId !== null) {
                const tree = map.get(value.parentId) as DocumentList

                tree.subfolders.push(value)
            }
        }

        const result: DocumentList[] = []

        for (const parentId of parentIds) {
            const parent = map.get(parentId) as DocumentList

            result.push(parent)
        }

        // set cache
        Cache.set(cacheKey, JSON.stringify(result))
        console.timeEnd('unCached')

        return result
    }

    public async getDocument(docId: string, docVer: string, plantCode: string): Promise<DocumentContext> {
        const parentIds: string[] = []
        const map = new Map<string, EquipmentList>()
        console.log('getDocument::')
        const folders = await this.repo.getEquipmentFolders(docId, docVer, plantCode)
        console.log('getDocument::result::', folders)

        for (const folder of folders) {
            if (folder.parent === '00000000000000000001' && !parentIds.includes(folder.libId)) {
                parentIds.push(folder.libId)
            }

            map.set(folder.libId, {
                libId: folder.libId,
                libName: folder.libName,
                libDesc: folder.libDesc,
                parentId: folder.parent,
                subfolders: [],
                equipments: []
            })
            console.log('folder.libId', folder.libId, 'parent', folder.parent)

            if (folder.handle !== null) {
                for (const handle of folder.handle.split('/')) {
                    if (folder.newHandle) folder.newHandle.push({ handle: handle, tagType: folder.tagType })
                    else folder.newHandle = [{ handle: handle, tagType: folder.tagType }]
                }
            }
        }

        // const equipments = await this.repo.getEquipments(docId, docVer, plantCode)
        const equipments = folders.filter((x) => x.libDesc !== 'VALVE')

        for (const equipment of equipments) {
            const tree = map.get(equipment.libId) as EquipmentList

            // const handles = await this.repo.getHandles(docId, docVer, equipment.tagId)

            const context = {
                tagId: equipment.tagId,
                tagType: equipment.tagType,
                libDesc: equipment.libDesc,
                libId: equipment.libId,
                docVer: equipment.docVer,
                intelligent: equipment.intelligent,
                function: equipment.function,
                connection: equipment.connection,
                handles: equipment.newHandle
            }

            tree.equipments.push(context)
        }

        for (const value of map.values()) {
            if (value.parentId !== '00000000000000000001') {
                const tree = map.get(value.parentId) as EquipmentList

                if (tree) {
                    tree.subfolders.push(value)
                } else {
                    console.log('not exist folder.libId', value.parentId)
                }
            }
        }

        const equipmentList: EquipmentList[] = []

        for (const parentId of parentIds) {
            const parent = map.get(parentId)
            if (parent) {
                equipmentList.push(parent)
            } else {
                console.log('not exist folder.libId', parentId)
            }
        }

        // folder 오름차순
        equipmentList.sort(function (a, b) {
            // subfolder 오름차순
            if (a.subfolders.length > 0) {
                a.subfolders.sort(function (c, d) {
                    return c.libName < d.libName ? -1 : c.libName > d.libName ? 1 : 0
                })
            }
            return a.libName < b.libName ? -1 : a.libName > b.libName ? 1 : 0
        })

        const info = await this.repo.getDocumentInfo(docId, docVer, plantCode)

        return {
            docName: info.docName,
            docNumber: info.docNumber,
            docId,
            docVer,
            plantCode,
            equipmentList
        }
    }

    public async getMarkups(
        userId: string,
        docId: string,
        docVer: string,
        plantCode: string
    ): Promise<MarkupContent[]> {
        const values = await this.repo.getMarkups(userId, docId, docVer, plantCode)

        const results: MarkupContent[] = []

        for (const value of values) {
            const paths = JSON.parse(value.paths as unknown as string) as {
                type: string
                width: number
                color: string
                values: number[]
            }[]

            // ! 한수원은 인사테이블 조회가 다른 방식임
            // const userInfo = await this.repo.getUser(value.userId)

            // console.log('@USERINFO: ', userInfo)

            let writer = { userId: value.userId, deptCode: 'unknown', name: 'unknown' }

            // if (userInfo) writer = userInfo

            const result = {
                seq: value.seq,
                writer,
                docId: value.docId,
                docVer: value.docVer,
                plantCode: value.plantCode,
                title: value.title,
                paths,
                isPublic: value.isPublic,
                createDate: value.createDate
            }

            console.log('@RESULT: ', result)

            results.push(result)
        }

        return results
    }

    public async insertMarkup({
        docId,
        docVer,
        plantCode,
        userId,
        title,
        paths,
        isPublic
    }: InsertMarkupValue): Promise<boolean> {
        const pathText = JSON.stringify(paths)

        const value = [
            {
                USERID: userId,
                DOCID: docId,
                DOCVER: docVer,
                PLANTCODE: plantCode,
                TITLE: title,
                PATHS: pathText,
                ISPUBLIC: isPublic
            }
        ]
        return this.repo.insertMarkup(value)
    }

    public async updateMarkup({
        docId,
        docVer,
        plantCode,
        userId,
        title,
        paths,
        isPublic,
        seq
    }: UpdateMarkupValue): Promise<boolean> {
        const pathText = JSON.stringify(paths)

        const value = [
            {
                USERID: userId,
                DOCID: docId,
                DOCVER: docVer,
                PLANTCODE: plantCode,
                TITLE: title,
                PATHS: pathText,
                ISPUBLIC: isPublic,
                SEQ: seq
            }
        ]

        return this.repo.updateMarkup(value)
    }

    public async deleteMarkup(value: DeleteMarkupValue): Promise<boolean> {
        return this.repo.deleteMarkup(value)
    }

    public async getPMDCEquipments(docId: string, docVer: string, func: string) {
        return this.repo.getPMDCEquipments(docId, docVer, func)
    }

    public async getPMDCUser(userId: string, docId: string, docVer: string, func: string) {
        return this.repo.getPMDCUser(userId, docId, docVer, func)
    }

    public async getPMDCSearch(search: string, source: string) {
        return this.repo.getPMDCSearch(search, source)
    }

    public async getPMDCSource() {
        const result = await this.repo.getPMDCSource()
        const res = []
        for (const item of result) {
            res.push({ source: item.POINTSOURCE })
        }
        return res
    }

    public async insertPMDCUser(value: InsertPMDCUserType[]): Promise<boolean> {
        return this.repo.insertPMDCUser(value)
    }

    public async deletePMDCUser(value: { [key: string]: string }[]): Promise<boolean> {
        return this.repo.deletePMDCUser(value)
    }

    public async insertPMDCMaster(value: InsertPMDCUserType[]): Promise<boolean> {
        return this.repo.insertPMDCMaster(value)
    }

    public async deletePMDCMaster(value: { [key: string]: string }[]): Promise<boolean> {
        return this.repo.deletePMDCMaster(value)
    }

    public async getDocumentFilePath(docNo: string, docVer: string): Promise<string> {
        // 도커 환경
        if (process.env.DOCKER_ENV === 'true') {
            const workingDir = '/farpoint'

            const baseName = `${workingDir}/${docNo}_${docVer}`

            const exist = Path.exists(baseName)

            if (!exist) {
                const buffer = await this.repo.getDocumentFile(docNo, docVer)

                const srcPath = `${baseName}.dwg`

                File.write(srcPath, buffer)

                const outPath = `${baseName}.vsf`

                const hostPath = (process.env['DRAWING_FILE_PATH'] as string) ?? 'farpoint'
                const type = hostPath === 'farpoint' ? 'volume' : 'bind'

                await Shell.exec(
                    `docker run --rm --mount source=${hostPath},target=${workingDir},type=${type} farpoint/converter FileConverter ${srcPath} ${outPath}`
                )
                await Shell.exec(
                    `docker run --rm --mount source=${hostPath},target=${workingDir},type=${type} farpoint/converter mv ${outPath} ${baseName}`
                )
            }

            return baseName
        } else {
            const hostPath = process.env['DOC_PATH'] as string

            // Docker file sharing 필수
            const isExistHostPath = fs.existsSync(hostPath)
            if (!isExistHostPath) fs.mkdirSync(hostPath, { recursive: true })

            // .dwg & .vsf 를 저장할 로컬 경로
            const hostFilePath = `${hostPath}\\${docNo}_${docVer}`

            const exist = Path.exists(hostFilePath)

            if (!exist) {
                const buffer = await this.repo.getDocumentFile(docNo, docVer)
                let imgesRes = undefined
                try {
                    // IDS_DOC_IMG에서 DWG에 속하는 이미지 저장
                    imgesRes = await this.repo.getDocumentImg(docNo, docVer)
                    for (const key of Array.from(imgesRes.keys())) {
                        const imgBuffer = imgesRes.get(key)
                        if (imgBuffer) File.write(`${hostPath}\\${key}`, imgBuffer)
                    }
                } catch (e) {
                    console.error(e, 'Not Exist Table IDS_DOC_IMG')
                }

                File.write(`${hostFilePath}.dwg`, buffer)
                await Shell.exec(
                    `cd fileConverter && FileConverter ${hostFilePath}.dwg ${hostFilePath}.vsfx --multithreading=true`
                )
                await Shell.exec(`move ${hostFilePath}.vsfx ${hostFilePath}`)

                // DWG, IMG 삭제
                fs.rm(`${hostFilePath}.dwg`, (err) => {
                    console.log('fs.rm -> err: ', err)
                })
                if (imgesRes) {
                    for (const key of Array.from(imgesRes.keys())) {
                        fs.rm(`${hostPath}\\${key}`, (err) => {
                            console.log('fs.rm -> err: ', err)
                        })
                    }
                }
            }

            return hostFilePath
        }
    }

    public async setFontLog(fileName: string): Promise<void> {
        /* 
            FE에서 해당 이름의 폰트 파일이 없는 경우 
            로그 파일을 보고 해당 폰트를 추가하기위해 만든 API
        */
        const hostPath = 'C:\\farpoint\\Log'
        const logFn = 'font.log'
        const filePath = hostPath + '\\' + logFn

        // Log 폴더 없으면 생성
        const isExistHostPath = fs.existsSync(hostPath)
        if (!isExistHostPath) fs.mkdirSync(hostPath, { recursive: true })

        const isExistFilePath = fs.existsSync(filePath)
        if (isExistFilePath) {
            const fileContents = fs.readFileSync(filePath, 'utf8')
            console.log('fileContents::', fileContents)
            const fnArr = JSON.parse(fileContents)
            if (Array.isArray(fnArr)) {
                if (fnArr.indexOf(fileName) < 0) {
                    // 로그 파일에 입력된 파일이름이 아니라면 파일이름 추가
                    fnArr.push(fileName)
                    fs.writeFileSync(filePath, JSON.stringify(fnArr))
                }
            }
        } else {
            const fnArr = [fileName]
            fs.writeFileSync(filePath, JSON.stringify(fnArr))
        }
    }

    public getSubFolders(folderId: string): Promise<DocFolder[]> {
        return this.repo.getSubFolders(folderId)
    }

    public async searchDocument(
        folderId: string | undefined,
        docName: string | undefined,
        docNumber: string | undefined,
        cnt: string | undefined
    ): Promise<{ cnt: number; data: DocumentResult[] }> {
        const folders = folderId === undefined ? [] : await this.getAllSubfolders(folderId)

        return this.repo.searchDocument(folders, docName, docNumber, cnt)
    }

    public async searchEquipment(
        folderId: string | undefined,
        libId: string | undefined,
        tag: string | undefined,
        cnt: string | undefined
    ): Promise<{ cnt: number; data: EquipmentResult[] }> {
        const folders = folderId === undefined ? [] : await this.getAllSubfolders(folderId)

        return this.repo.searchEquipment(folders, libId, tag, cnt)
    }

    public async searchDocumentEquipment(
        docId: string,
        docVer: string,
        libId: string | undefined,
        tag: string | undefined,
        cnt: string | undefined
    ): Promise<EquipmentResult[]> {
        return this.repo.searchDocumentEquipment(docId, docVer, libId, tag, cnt)
    }

    public async getRelatedFileInfo(
        DOKAR: string,
        DOKVR: string,
        DOKTL: string,
        DOKNR: string,
        userId: string
    ): Promise<RelatedFileInfo[]> {
        const infos = await this.repo.getRelatedFileInfo(DOKAR, DOKVR, DOKTL, DOKNR)

        for (const info of infos) {
            const filepath = `filepath=${this.relatedPath}/${info.DOKAR}/${info.DOKAR}${info.DOKVR}${info.DOKTL}${info.DOKNR}_${info.FILENAME}.${info.DAPPL}&filename=${info.FILENAME}&fileext=${info.DAPPL}&viewerselect=image&username=${userId}`
            const url = this.docViewerUrl + '?' + filepath

            info.viewerUrl = url
        }

        return infos
    }

    public searchRelated(
        folders: string[],
        relatedName: string | undefined,
        relatedNumber: string | undefined
    ): Promise<RelatedSearchResult[]> {
        return this.repo.searchRelated(folders, relatedName, relatedNumber)
    }

    public async searchSignal(
        folderId: string | undefined,
        docname: string | undefined,
        tagname: string | undefined,
        userId: string,
        cnt: string | undefined
    ): Promise<{ cnt: number; data: SearchSignalResult[] }> {
        const folders = folderId === undefined ? [] : await this.getAllSubfolders(folderId)

        const results = await this.repo.searchSignal(folders, docname, tagname, cnt)

        for (const item of results.data) {
            const nameparts = item.FILENM.split('.')

            const filepath = `filepath=${this.signalPath}/${item.PLANTCODE}/${item.FILE_PATH}/${item.FILENM}&filename=${nameparts[0]}&fileext=${nameparts[1]}&viewerselect=image&username=${userId}`
            const url = this.docViewerUrl + '?' + filepath

            item.viewerUrl = url
        }

        return results
    }

    private getFolderIds(subfolders: Folder[], map: Map<string, Folder>): string[] {
        let result: string[] = []

        for (const folder of subfolders) {
            const value = this.getFolderIds(folder.subfolders, map)
            result.push(folder.folderId)
            result = result.concat(value)
        }

        return result
    }

    private async getAllSubfolders(folderId: string): Promise<string[]> {
        const map = new Map<string, Folder>()

        const folders = await this.repo.getAllFolders()

        for (const folder of folders) {
            if (folder.parent !== null) {
                map.set(folder.folderId, {
                    folderId: folder.folderId,
                    parentId: folder.parent,
                    subfolders: []
                })
            }
        }

        for (const value of map.values()) {
            const tree = map.get(value.parentId) as Folder

            if (tree !== undefined) tree.subfolders.push(value)
        }

        const root = map.get(folderId) as Folder
        const result = this.getFolderIds(root.subfolders, map)
        result.push(folderId)

        return result
    }

    public getSymbolsByPlant(plantCode: string): Promise<SymbolResult[]> {
        return this.repo.getSymbolsByPlant(plantCode)
    }

    public getRelatedRoot(): Promise<RelatedFolder[]> {
        return this.repo.getRelatedRoot()
    }

    public getRelatedFolders(parentId: string): Promise<RelatedFolder[]> {
        return this.repo.getRelatedFolders(parentId)
    }

    public getHandles(docId: string, docVer: string, tagId: string): Promise<EquipmentHandle[]> {
        return this.repo.getHandles(docId, docVer, tagId)
    }

    private async getPlantInfoByDeptCode(deptCode: string): Promise<{ plantCode: string; plantName: string }> {
        const plantInfos = (await this.repo.getDeptInfo(deptCode)) as {
            DEPT_CODE: string
            UP_CODE: string
            DEPT_NAME: string
        }[]
        const { DEPT_CODE, UP_CODE, DEPT_NAME } = plantInfos[0]

        if (UP_CODE === 'A000' || UP_CODE === '0000' || UP_CODE === '') {
            return { plantCode: DEPT_CODE, plantName: DEPT_NAME }
        } else {
            const parentInfo = await this.getPlantInfoByDeptCode(UP_CODE)

            return { plantCode: parentInfo.plantCode + DEPT_CODE, plantName: parentInfo.plantName }
        }
    }

    public async existsUser(userId: string, clientIp: string): Promise<boolean> {
        try {
            const user = await this.repo.getUser(userId)

            if (user) {
                const plantInfo = await this.getPlantInfoByDeptCode(user.deptCode)

                const { plantCode, plantName } = plantInfo

                const loginInfo = await this.repo.getLoginCount(userId, plantCode)

                if (0 < loginInfo.length) {
                    const count = loginInfo[0].count
                    await this.repo.updateLoginCount(userId, plantCode, count + 1)
                } else {
                    await this.repo.createLoginCount(userId, plantCode, plantName, '102')
                }

                await this.repo.writeLoginHistory(
                    userId,
                    '102',
                    clientIp.toString().replace('::ffff:', ''),
                    plantCode,
                    plantName
                )

                return true
            }
        } catch (error) {
            console.log(error)
        }

        return false
    }

    public async getContext(userId: string): Promise<UserContext> {
        // 언제 user를 만들지 미정이라 무조건 만든다.
        try {
            await this.repo.addUserContext(userId)
        } catch (err) {
            console.log(`already exists userId ${userId}`)
        }

        return this.repo.getUserContext(userId)
    }

    public async setContext(userId: string, context: UserContext): Promise<void> {
        await this.repo.updateUserContext(userId, context)
    }

    // 한수원에서만 사용. (desc. 어디호기로 도면으로 이동할지 결정)
    protected async fOPC(sFolderId: string, sDoc1: DocByOpc, sDoc2: DocByOpc): Promise<DocByOpc> {
        //출발지 호기
        const sHogi = await this.repo.getDocumentHogiByFolId(sFolderId)

        //공용에서 공통으로 무조건 첫번째 호기로 이동
        if (sHogi === '0') {
            return sDoc1
        }
        //공통에서 공통으로 이동
        else {
            if (sHogi === sDoc1.hogi) {
                return sDoc1
            } else {
                //공통 도면 중 두번째 호기로 이동
                return sDoc2
            }
        }
    }
    // 문자열 뒤에서 부터 반복 -> 문자가 나오는 데까지 문자열 자름
    protected cutFromBackToBeforeText(sString: string) {
        let i_tmp = 20
        for (let i_cnt = sString.length - 1; i_cnt >= 0; i_cnt--) {
            if (!Number(sString.slice(i_cnt, i_cnt + 1))) {
                // 문자라면
                i_tmp = i_cnt
                break
            }
        }
        return sString.slice(0, i_tmp)
    }

    public async getEquipmentLinks(
        docId: string,
        docVer: string,
        plantCode: string,
        handle: string
    ): Promise<EquipmentLink[]> {
        const linkList = await this.repo.getEquipmentLinkList(docId, docVer, handle)
        console.log('getEquipmentLinkList =>', JSON.stringify(linkList))

        const values: EquipmentLink[] = []
        for (const link of linkList) {
            if (link.TAG_TYPE === '002') {
                const region = process.env.REGION as string
                const selectDB = region === 'kospo' ? '남부' : '한수원'

                let intelligent_tmp1 = link.INTELLIGENT.replace(/-/gi, '')

                if (selectDB === '남부') {
                    console.log('selectDB::', selectDB)
                    const targetDocNum = intelligent_tmp1.slice(0, -2)
                    let items = await this.repo.getDocumentByOpc(docId, docVer, targetDocNum)
                    console.log('getDocumentByOpc1 => ', JSON.stringify(items), targetDocNum)

                    if (items.length === 0) {
                        items = await this.repo.getDocumentByOpc(docId, docVer, intelligent_tmp1)
                        console.log('getDocumentByOpc2 => ', JSON.stringify(items))
                    }

                    if (items.length === 0) {
                        const targetDocNum = intelligent_tmp1.slice(0, -3)
                        items = await this.repo.getDocumentByOpc(docId, docVer, targetDocNum)
                        console.log('getDocumentByOpc3 => ', JSON.stringify(items))
                    }
                    // 원칙은 FOLID가 같아야 한다.
                    // 그러나 예외적으로 null인 경우에는 무조건 1개의 결과만 나온다고 한다.
                    // 이유는 이태희 팀장에게 확인하자.
                    for (const item of items) {
                        if (link.FOLID === null || link.FOLID === item.FOLID) {
                            const tagId = await this.repo.getTagId(
                                item.docId,
                                item.docVer,
                                link.INTELLIGENT,
                                link.CONNECTION
                            )
                            console.log('getTagId => ', JSON.stringify(tagId))

                            const value = {
                                tagId: link.TAGNO,
                                tagType: link.TAG_TYPE,
                                equipmentLinkId: undefined,
                                funcDetail: undefined,
                                linkObject: undefined,
                                opcDocId: item.docId,
                                opcDocVer: item.docVer,
                                opcPlantCode: item.plantCode,
                                opcHogi: item.hogi === '0' ? '공용' : item.hogi + '호기',
                                opcTagId: tagId ? tagId : 'notExist',
                                opcConnection: link.CONNECTION
                            }

                            // tagId가 없으면 실제로 연결된 opc가 없는 것이다.
                            // 해당 문서로 이동하도록 오류 처리를 제거한다.
                            // if (tagId || hasOpcEquipment) {
                            values.push(value)
                            // }
                        }
                    }
                } else {
                    // 한수원 OPC
                    let selectedDocItem: DocByOpc | undefined = undefined

                    const docInfo = await this.repo.getDocumentInfo(docId, docVer, plantCode)

                    if (link.INTELLIGENT.length === 10) {
                        let items = await this.repo.getDocumentByOpcFromHansuwon_1(docId, docVer, link.INTELLIGENT)
                        //공용인 경우
                        if (items.length === 1) {
                            selectedDocItem = items[0]
                        } else if (items.length === 2) {
                            //공통인 경우
                            selectedDocItem = await this.fOPC(docInfo.folderId, items[0], items[1])
                        }
                    } else {
                        //OPC가 10자리보다 크거나 작은 경우(뒷 영역 제거 후 검색)
                        //도면명이 전체로 써있는경우
                        let intelligent_tmp2 = ''
                        switch (docInfo.folderId.slice(0, 17)) {
                            case '00000000000000211': {
                                intelligent_tmp2 = this.cutFromBackToBeforeText(intelligent_tmp1)
                                break
                            }
                            default: {
                                intelligent_tmp2 = intelligent_tmp1.slice(0, intelligent_tmp1.length - 2)
                                break
                            }
                        }
                        let items = await this.repo.getDocumentByOpc(docId, docVer, intelligent_tmp2)

                        //공용
                        if (items.length === 1) {
                            selectedDocItem = items[0]
                        } else if (items.length === 2) {
                            //공통
                            selectedDocItem = await this.fOPC(docInfo.folderId, items[0], items[1])
                        } else {
                            //OPC 뒷 영역 안 자르고 검색(도면명으로만 지능화한 경우)
                            items = await this.repo.getDocumentByOpc(docId, docVer, intelligent_tmp1)

                            if (items.length === 1) {
                                selectedDocItem = items[0]
                            } else if (items.length === 2) {
                                //공통
                                selectedDocItem = await this.fOPC(docInfo.folderId, items[0], items[1])
                            } else {
                                //없을경우
                                items = await this.repo.getDocumentByOpc(docId, docVer, intelligent_tmp1.slice(0, -3))

                                if (items.length === 1) {
                                    selectedDocItem = items[0]
                                } else {
                                    items = await this.repo.getDocumentByOpc(
                                        docId,
                                        docVer,
                                        intelligent_tmp1.slice(0, -2)
                                    )
                                    if (items.length === 1) {
                                        selectedDocItem = items[0]
                                    } else {
                                        //전체 사업소에서 검색
                                        items = await this.repo.getDocumentByOpcFromHansuwon_2(intelligent_tmp1)
                                        if (items.length === 1) {
                                            selectedDocItem = items[0]
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (selectedDocItem) {
                        let tagId: string | undefined = undefined

                        tagId = await this.repo.getTagIdFromHansuwon(
                            selectedDocItem.docId,
                            selectedDocItem.docVer,
                            link.INTELLIGENT,
                            link.CONNECTION
                        )
                        const value = {
                            tagId: link.TAGNO,
                            tagType: link.TAG_TYPE,
                            equipmentLinkId: undefined,
                            funcDetail: undefined,
                            linkObject: undefined,
                            opcDocId: selectedDocItem.docId,
                            opcDocVer: selectedDocItem.docVer,
                            opcPlantCode: selectedDocItem.plantCode,
                            opcHogi: selectedDocItem.hogi === '0' ? '공용' : selectedDocItem.hogi + '호기',
                            opcTagId: tagId ? tagId : 'notExist',
                            opcConnection: link.CONNECTION
                        }
                        values.push(value)
                    }
                }
            } else {
                const items = await this.repo.getEquipmentLink(plantCode, link.FUNCTION)
                console.log('getEquipmentLink => ', JSON.stringify(items))

                for (const item of items) {
                    values.push({
                        tagId: link.TAGNO,
                        tagType: link.TAG_TYPE,
                        equipmentLinkId: item.equipmentLinkId,
                        funcDetail: item.funcDetail,
                        linkObject: item.linkObject,
                        opcDocId: undefined,
                        opcDocVer: undefined,
                        opcPlantCode: undefined,
                        opcHogi: undefined,
                        opcTagId: undefined,
                        opcConnection: undefined
                    })
                }
            }
        }

        return values
    }

    // notice url
    public async getNoticeUrl(id: string, tplnr: string | undefined): Promise<{ url: string }> {
        return this.getExternalUrl('S', undefined, id, undefined, undefined, undefined, tplnr)
    }

    // order url
    public async getOrderUrl(id: string, tplnr: string | undefined): Promise<{ url: string }> {
        return this.getExternalUrl('T', undefined, undefined, id, undefined, undefined, tplnr)
    }

    // A:설비정보
    public async getEquipmentInfoUrl(equnr: string, tplnr: string | undefined): Promise<{ url: string }> {
        return this.getExternalUrl('A', equnr, undefined, undefined, undefined, undefined, tplnr)
    }
    // C:통지발행
    public async getNotiIssueUrl(equnr: string, tplnr: string | undefined): Promise<{ url: string }> {
        return this.getExternalUrl('C', equnr, undefined, undefined, undefined, undefined, tplnr)
    }
    // D:오더발행
    public async getOrderIssueUrl(equnr: string, tplnr: string | undefined): Promise<{ url: string }> {
        return this.getExternalUrl('D', equnr, undefined, undefined, undefined, undefined, tplnr)
    }
    // E:통지이력조회
    public async getNotiRecordUrl(
        equnr: string,
        startDate: string,
        endDate: string,
        tplnr: string | undefined
    ): Promise<{ url: string }> {
        return this.getExternalUrl('E', equnr, undefined, undefined, startDate, endDate, tplnr)
    }
    // F:오더이력조회
    public async getOrderRecordUrl(
        equnr: string,
        startDate: string,
        endDate: string,
        tplnr: string | undefined
    ): Promise<{ url: string }> {
        return this.getExternalUrl('F', equnr, undefined, undefined, startDate, endDate, tplnr)
    }

    /**
     * 아래 3개 관련문서 함수는 한수원에서만 사용합니다.
     */
    // Q:관련문서검색
    // ? 리턴 값이 URL이 아닐 수 있음
    // ! 사용여부 미정 함수
    // public async getRelateFilesUrl(equnr: string, tplnr: string | undefined) {
    //     return this.getExternalUrl('Q', equnr, undefined, undefined, undefined, undefined, tplnr)
    // }
    // P:관련문서조회
    public async getRelateFileInfoUrl(equnr: string, tplnr: string | undefined) {
        return this.getExternalUrl('P', equnr, undefined, undefined, undefined, undefined, tplnr)
    }
    // O:관련문서등록
    // ? 리턴 값이 URL이 아닐 수 있음
    // ! 사용여부 미정 함수
    // public async registerRelateFileInfo(equnr: string, tplnr: string | undefined) {
    //     return this.getExternalUrl('O', equnr, undefined, undefined, undefined, undefined, tplnr)
    // }

    private async getExternalUrl(
        requestType: string,
        equnr: string | undefined,
        qmnum: string | undefined,
        aufnr: string | undefined,
        startDate: string | undefined,
        endDate: string | undefined,
        tplnr: string | undefined
    ): Promise<{ url: string }> {
        //const param = { dest: 'ESP' } as noderfc.RfcConnectionParameters
        //const pool = new noderfc.Pool({ connectionParameters: param })
        const client = await this.pool.acquire()
        // const client = true
        const sapType = process.env.SAP_TYPE
        const region = process.env.REGION

        if (client) {
            /**
             * 남부/한수원 SAP 인터페이스의 간극으로 인한 분기처리
             */
            let result, url
            if (tplnr && region !== 'kospo') {
                // 한수원
                if (sapType === 'URL') {
                    switch (requestType) {
                        // https://top.khnp.auth/SAP/fiori.jsp?URL=https://khnpprd.khnp.se.hn:24300/sap/bc/ui5_ui5/sap/zcapui_popup/index.html%23/NOTIFITEM?qmart=M1%26equnr=equnr%26eqtxt=desc
                        // https://top.khnp.auth/SAP/fiori.jsp?URL=https://khnpprd.khnp.se.hn:24300/sap/bc/gui/sap/its/webgui?~transaction=*ZPMLD0102%20MODE=E;P_RFCFL=${requestType}
                        // 설비정보조회
                        case 'A':
                            result = `https://top.khnp.auth/SAP/fiori.jsp?URL=https://khnpprd.khnp.se.hn:24300/sap/bc/gui/sap/its/webgui?~transaction=*ZPMLD0102%20MODE=E;P_RFCFL=${requestType};P_TPLNR=${tplnr};P_EQUNR=${equnr}`
                            break
                        // 통지발행 (기타유형)
                        case 'C':
                            result = `https://top.khnp.auth/SAP/fiori.jsp?URL=https://khnpprd.khnp.se.hn:24300/sap/bc/gui/sap/its/webgui?~transaction=*ZPMLD0102%20MODE=E;P_RFCFL=${requestType};P_TPLNR=${tplnr};P_EQUNR=${equnr}`
                            break
                        // 오더발행
                        case 'D':
                            result = `https://top.khnp.auth/SAP/fiori.jsp?URL=https://khnpprd.khnp.se.hn:24300/sap/bc/gui/sap/its/webgui?~transaction=*ZPMLD0102%20MODE=E;P_RFCFL=${requestType};P_TPLNR=${tplnr};P_EQUNR=${equnr}`
                            break
                        // 통지이력조회
                        case 'E':
                            result = `https://top.khnp.auth/SAP/fiori.jsp?URL=https://khnpprd.khnp.se.hn:24300/sap/bc/gui/sap/its/webgui?~transaction=*ZPMLD0102%20MODE=E;P_RFCFL=${requestType};P_TPLNR=${tplnr};P_EQUNR=${equnr};P_DATUV=${startDate};P_DATUB=${endDate}`
                            break
                        // 오더이력조회
                        case 'F':
                            result = `https://top.khnp.auth/SAP/fiori.jsp?URL=https://khnpprd.khnp.se.hn:24300/sap/bc/gui/sap/its/webgui?~transaction=*ZPMLD0102%20MODE=E;P_RFCFL=${requestType};P_TPLNR=${tplnr};P_EQUNR=${equnr};P_DATUV=${startDate};P_DATUB=${endDate}`
                            break
                        // 관련문서조회
                        case 'P':
                            result = `https://top.khnp.auth/SAP/fiori.jsp?URL=https://khnpprd.khnp.se.hn:24300/sap/bc/gui/sap/its/webgui?~transaction=*ZPMLD0102%20MODE=E;P_RFCFL=${requestType};P_EQUNR=${equnr}`
                            break
                        // 통지열기
                        case 'S':
                            // result = `https://top.khnp.auth/SAP/fiori.jsp?URL=https://khnpprd.khnp.se.hn:24300/sap/bc/gui/sap/its/webgui?~transaction=*ZPMLD0102%20MODE=E;P_RFCFL=${requestType};P_AUFNR=${qmnum}`
                            result = `https://top.khnp.auth/SAP/fiori.jsp?URL=https://khnpprd.khnp.se.hn:24300/sap/bc/gui/sap/its/webgui?~transaction=*ZPMLD0102%20MODE=E;P_RFCFL=${requestType};P_QMNUM=${qmnum}`
                            break
                        // 오더열기
                        case 'T':
                            // result = `https://top.khnp.auth/SAP/fiori.jsp?URL=https://khnpprd.khnp.se.hn:24300/sap/bc/gui/sap/its/webgui?~transaction=*ZPMLD0102%20MODE=E;P_RFCFL=${requestType};P_QMNUM=${aufnr}`
                            result = `https://top.khnp.auth/SAP/fiori.jsp?URL=https://khnpprd.khnp.se.hn:24300/sap/bc/gui/sap/its/webgui?~transaction=*ZPMLD0102%20MODE=E;P_RFCFL=${requestType};P_AUFNR=${aufnr}`
                            break
                        default:
                            result = ''
                            break
                    }
                } else {
                    result = await client.call('Z_PM_IF_SAP_CALL', {
                        RFCFL: requestType,
                        TPLNR: tplnr ?? '',
                        EQUNR: equnr ?? ''
                    })

                    result = result.toString()
                    // result = ''
                }

                /**
                 * result를 기반으로 url을 만들어주는 로직은 짜야됨 (SAP_TYPE = RFC일 경우만)
                 */

                url = result
            } else {
                // 남부
                // 설비정보를 조회할 때 설비번호만을 가지고 함
                result = (await client.call('Z_PM_IF_SAP_CALL', {
                    I_EQUNR: equnr ?? '', // 설비번호
                    I_RFCFL: requestType ?? '', // 구분자
                    I_QMNUM: qmnum ?? '', // 통지번호
                    I_AUFNR: aufnr ?? '', // 오더번호
                    I_SDATE: startDate ?? '', // 조회기간 - 시작
                    I_EDATE: endDate ?? '' // 조회기간 - 종료
                })) as { E_URL: string }

                url = replaceDns(result.E_URL)
                // url = ''
            }

            console.log('Z_PM_IF_SAP_CALL', JSON.stringify(result))

            client.release()

            return { url }
        } else {
            error('RFC 연결 실패. undefined client')
        }
    }

    public async getDocumentNotiorders(
        docId: string,
        docVer: string,
        requestType: string,
        startDate?: string,
        endDate?: string
    ): Promise<SafeObj[]> {
        /**
         * 도면번호와 도면버전으로 OPC를 제외한 기능위치를 가져온다.
         */
        const equipments = await this.repo.getNotiorderEquipments(docId, docVer)

        /**
         * {
         *  EQUIPMENT: '11408099',
         *  TAGNO: '00000000000000000022',
         *  FUNCTION: '2435-472-V-1283'
         * }
         */

        const param = { dest: 'ESP' } as noderfc.RfcConnectionParameters
        const pool = new noderfc.Pool({ connectionParameters: param })
        const client = await pool.acquire()
        const region = process.env.REGION as string

        let rfcResults = { notifications: new Array<Notiorder>(), orders: new Array<Notiorder>() }

        if (client) {
            if (requestType === 'full') {
                if (startDate && endDate) {
                    if (region === 'khnp') {
                        rfcResults = await this.getNotiordersFull(client, equipments, startDate, endDate)
                    } else {
                        rfcResults = await this.getNotiordersFullKospo(client, equipments, startDate, endDate)
                    }
                } else {
                    error('startDate && endDate이 올바르지 않음.')
                }
            } else if (requestType === 'nocomplete') {
                if (region === 'khnp') {
                    rfcResults = await this.getNotiordersNocomplete(client, equipments)
                } else {
                    rfcResults = await this.getNotiordersNocompleteKospo(client, equipments)
                }
            } else {
                error('requestType이 올바르지 않음.' + requestType)
            }
        } else {
            error('RFC 연결 실패.' + JSON.stringify(param))
        }

        const results = new Map<string, EquipmentNotiorder>()

        for (const notiorder of rfcResults.notifications) {
            let value
            if (region === 'khnp') {
                value = this.getValidNotiorderEquipments(equipments, notiorder.tplnr, results)
            } else {
                value = this.getValidNotiorderEquipmentsKospo(equipments, notiorder.equipmentExtId, results)
            }

            if (value) {
                value.notifications.push(notiorder)
            }
        }

        for (const notiorder of rfcResults.orders) {
            let value
            if (region === 'khnp') {
                value = this.getValidNotiorderEquipments(equipments, notiorder.tplnr, results)
            } else {
                value = this.getValidNotiorderEquipmentsKospo(equipments, notiorder.equipmentExtId, results)
            }

            if (value) {
                value.orders.push(notiorder)
            }
        }

        // ! value
        client.release()

        return Array.from(results, ([_name, value]) => value)
    }

    private getValidNotiorderEquipments(
        equipments: NotiorderEquipment[],
        externalId: string,
        results: Map<string, EquipmentNotiorder>
    ): EquipmentNotiorder | undefined {
        for (const item of equipments) {
            const exist = externalId.includes(item.FUNCTION)

            if (exist) {
                if (!results.has(externalId)) {
                    const value = {
                        tagId: item.TAGNO,
                        function: item.FUNCTION,
                        notifications: [],
                        orders: []
                    }

                    results.set(externalId, value)
                }

                const value = results.get(externalId)

                return value
            }
        }

        return undefined
    }

    private getValidNotiorderEquipmentsKospo(
        equipments: NotiorderEquipment[],
        externalId: string,
        results: Map<string, EquipmentNotiorder>
    ): EquipmentNotiorder | undefined {
        for (const item of equipments) {
            const exist = externalId.includes(item.EQUIPMENT)

            if (exist) {
                if (!results.has(externalId)) {
                    const value = {
                        tagId: item.TAGNO,
                        function: item.FUNCTION,
                        notifications: [],
                        orders: []
                    }

                    results.set(externalId, value)
                }

                const value = results.get(externalId)

                return value
            }
        }

        return undefined
    }

    private async getNotiordersFull(
        client: noderfc.Client,
        equipments: NotiorderEquipment[],
        startDate: string,
        endDate: string
    ): Promise<{ notifications: Notiorder[]; orders: Notiorder[] }> {
        // 기능위치 테이블
        // const equipmentList: { EQUNR: string; TPLNR: string }[] = []
        const equipmentList: { TPLNR: string }[] = []

        for (const equipment of equipments) {
            // equipmentList.push({ EQUNR: equipment.EQUIPMENT, TPLNR: equipment.FUNCTION })
            equipmentList.push({ TPLNR: equipment.FUNCTION })
        }

        const result = (await client.call('Z_PM_IF_GET_LIST', {
            IV_DATE_FROM: startDate,
            IV_DATE_TO: endDate,
            IV_TIME_FROM: '0000',
            IV_TIME_TO: '2359',
            IT_TPLNR: equipmentList
        })) as { ET_NOTICE: RfcNotiorder[]; ET_ORDER: RfcNotiorder[] }

        console.log('Z_PM_IF_GET_LIST', JSON.stringify(result))

        const notifications: Notiorder[] = []

        for (const item of result.ET_NOTICE) {
            /**
             * {
             *  TPLNR
             *  QNUM
             *  QMTXT
             *  QMART
             *  QMDAT
             *  STATUS
             *  OBJNR
             *  EQUNR
             *  MZEIT
             * }
             */
            const notiorder = {
                type: 'noti',
                id: item.QMNUM ?? '', //qmnum/aufnr
                detail: item.QMTXT ?? '', //qmtxt/ktext
                function: item.MAPAR ?? '', //mapar
                equipmentExtId: item.EQUNR ?? '', //equnr
                taskType: item.QMART ?? '', //qmart
                startDate: item.QMDAT ?? '', //qmdate
                endDate: item.QMDAT ?? '', //qmdate
                status: item.STATUS ?? '', //status
                tplnr: item.TPLNR ?? '' // tplnr
            }
            notifications.push(notiorder)
        }

        const orders: Notiorder[] = []

        for (const item of result.ET_ORDER) {
            const notiorder = {
                type: 'order',
                id: item.AUFNR ?? '', //qmnum/aufnr
                detail: item.KTEXT ?? '', //qmtxt/ktext
                function: item.MAPAR ?? '', //mapar
                equipmentExtId: item.EQUNR ?? '', //equnr
                taskType: item.AUART ?? '', //qmart
                startDate: item.GSTRP ?? '', //qmdate
                endDate: item.GLTRP ?? '', //qmdate
                status: item.STATUS ?? '', //status
                tplnr: item.TPLNR ?? '' // tplnr
            }
            orders.push(notiorder)
        }

        return { notifications, orders }
    }

    private async getNotiordersFullKospo(
        client: noderfc.Client,
        equipments: NotiorderEquipment[],
        startDate: string,
        endDate: string
    ): Promise<{ notifications: Notiorder[]; orders: Notiorder[] }> {
        const equipmentList: { EQUNR: string; TPLNR: string }[] = []

        for (const equipment of equipments) {
            equipmentList.push({ EQUNR: equipment.EQUIPMENT, TPLNR: '' })
        }

        const result = (await client.call('Z_PM_IF_GET_LIST', {
            IV_DATE_FROM: startDate,
            IV_DATE_TO: endDate,
            IV_TIME_FROM: '0000',
            IV_TIME_TO: '2359',
            IT_TPLNR: equipmentList
        })) as { ET_NOTICE: RfcNotiorder[]; ET_ORDER: RfcNotiorder[] }

        console.log('Z_PM_IF_GET_LIST', JSON.stringify(result))

        const notifications: Notiorder[] = []

        for (const item of result.ET_NOTICE) {
            const notiorder = {
                type: 'noti',
                id: item.QMNUM ?? '', //qmnum/aufnr
                detail: item.QMTXT ?? '', //qmtxt/ktext
                function: item.MAPAR ?? '', //mapar
                equipmentExtId: item.EQUNR ?? '', //equnr
                taskType: item.QMART ?? '', //qmart
                startDate: item.QMDAT ?? '', //qmdate
                endDate: item.QMDAT ?? '', //qmdate
                status: item.STATUS ?? '', //status
                tplnr: item.TPLNR ?? ''
            }
            notifications.push(notiorder)
        }

        const orders: Notiorder[] = []

        for (const item of result.ET_ORDER) {
            const notiorder = {
                type: 'order',
                id: item.AUFNR ?? '', //qmnum/aufnr
                detail: item.KTEXT ?? '', //qmtxt/ktext
                function: item.MAPAR ?? '', //mapar
                equipmentExtId: item.EQUNR ?? '', //equnr
                taskType: item.AUART ?? '', //qmart
                startDate: item.GSTRP ?? '', //qmdate
                endDate: item.GLTRP ?? '', //qmdate
                status: item.STATUS ?? '', //status
                tplnr: item.TPLNR ?? ''
            }
            orders.push(notiorder)
        }

        return { notifications, orders }
    }

    private async getNotiordersNocomplete(
        client: noderfc.Client,
        equipments: NotiorderEquipment[]
    ): Promise<{ notifications: Notiorder[]; orders: Notiorder[] }> {
        // const equipmentList: { EQUNR: string; TPLNR: string; WAPINR: string }[] = []
        const equipmentList: { TPLNR: string }[] = []

        for (const equipment of equipments) {
            // equipmentList.push({ EQUNR: equipment.EQUIPMENT, TPLNR: '', WAPINR: '' })
            equipmentList.push({ TPLNR: equipment.FUNCTION })
        }

        const result = (await client.call('Z_PM_IF_GET_NOTI_ORDER_FLAG', {
            LT_TPLNR: equipmentList
        })) as { LT_NOTI: RfcNotiorder[]; LT_ORDER: RfcNotiorder[] }

        console.log('Z_PM_IF_GET_NOTI_ORDER_FLAG', JSON.stringify(result))

        const notifications: Notiorder[] = []

        for (const item of result.LT_NOTI) {
            if (!item.TPLNR) continue

            const option = {
                ZTPLNR: item.TPLNR ?? '',
                ZFLAG: 'N' // N(통지),O(오더)
            }
            // ZEQUNR: item.EQUNR,
            // ZGUBUN: 'I' //미결(I) 완료(E) 구분자

            const itemDetailData = (await client.call('Z_PM_IF_GET_NOTI_ORDER_NEW', option)) as {
                LT_NOTI: RfcNotiorder[]
                LT_ORDER: RfcNotiorder[]
            }

            console.log('Z_PM_IF_GET_NOTI_ORDER_NEW', JSON.stringify(option), JSON.stringify(itemDetailData))

            if (0 === itemDetailData.LT_NOTI.length) continue

            const itemDetail = itemDetailData.LT_NOTI[0]

            const notiorder = {
                type: 'noti',
                id: itemDetail.QMNUM ?? '', //qmnum/aufnr
                detail: itemDetail.QMTXT ?? '', //qmtxt/ktext
                function: itemDetail.MAPAR ?? '', //mapar
                equipmentExtId: itemDetail.EQUNR ?? '', //equnr
                taskType: itemDetail.QMART ?? '', //qmart
                startDate: itemDetail.QMDAT ?? '', //qmdate
                endDate: itemDetail.QMDAT ?? '', //qmdate
                status: itemDetail.STATUS ?? '', //status
                tplnr: itemDetail.TPLNR ?? '' // tplnr
            }

            notifications.push(notiorder)
        }

        const orders: Notiorder[] = []

        for (const item of result.LT_ORDER) {
            if (!item.TPLNR) continue

            const option = {
                ZTPLNR: item.TPLNR ?? '',
                ZFLAG: 'O' // N(통지),O(오더)
            }
            // ZEQUNR: item.EQUNR,
            // ZFLAG: 'O', // N(통지),O(오더)
            // ZGUBUN: 'I' //미결(I) 완료(E) 구분자

            const itemDetailData = (await client.call('Z_PM_IF_GET_NOTI_ORDER_NEW', option)) as {
                LT_NOTI: RfcNotiorder[]
                LT_ORDER: RfcNotiorder[]
            }

            console.log('Z_PM_IF_GET_NOTI_ORDER_NEW', JSON.stringify(option), JSON.stringify(itemDetailData))

            if (0 === itemDetailData.LT_ORDER.length) continue

            const itemDetail = itemDetailData.LT_ORDER[0]

            const notiorder = {
                type: 'order',
                id: itemDetail.AUFNR ?? '', //qmnum/aufnr
                detail: itemDetail.KTEXT ?? '', //qmtxt/ktext
                function: itemDetail.MAPAR ?? '', //mapar
                equipmentExtId: itemDetail.EQUNR ?? '', //equnr
                taskType: itemDetail.AUART ?? '', //qmart
                startDate: itemDetail.GSTRP ?? '', //qmdate
                endDate: itemDetail.GLTRP ?? '', //qmdate
                status: itemDetail.STATUS ?? '', //status
                tplnr: itemDetail.TPLNR ?? '' // tplnr
            }

            orders.push(notiorder)
        }

        return { notifications, orders }
    }

    private async getNotiordersNocompleteKospo(
        client: noderfc.Client,
        equipments: NotiorderEquipment[]
    ): Promise<{ notifications: Notiorder[]; orders: Notiorder[] }> {
        const equipmentList: { EQUNR: string; TPLNR: string; WAPINR: string }[] = []

        for (const equipment of equipments) {
            equipmentList.push({ EQUNR: equipment.EQUIPMENT, TPLNR: '', WAPINR: '' })
        }

        const result = (await client.call('Z_PM_IF_GET_NOTI_ORDER_FLAG', {
            LT_TPLNR: equipmentList
        })) as { LT_NOTI: RfcNotiorder[]; LT_ORDER: RfcNotiorder[] }

        console.log('Z_PM_IF_GET_NOTI_ORDER_FLAG', JSON.stringify(result))

        const notifications: Notiorder[] = []

        for (const item of result.LT_NOTI) {
            if (!item.EQUNR) continue

            const option = {
                ZEQUNR: item.EQUNR,
                ZFLAG: 'N', // N(통지),O(오더)
                ZGUBUN: 'I' //미결(I) 완료(E) 구분자
            }

            const itemDetailData = (await client.call('Z_PM_IF_GET_NOTI_ORDER_NEW', option)) as {
                LT_NOTI: RfcNotiorder[]
                LT_ORDER: RfcNotiorder[]
            }

            console.log('Z_PM_IF_GET_NOTI_ORDER_NEW', JSON.stringify(option), JSON.stringify(itemDetailData))

            if (0 === itemDetailData.LT_NOTI.length) continue

            const itemDetail = itemDetailData.LT_NOTI[0]

            const notiorder = {
                type: 'noti',
                id: itemDetail.QMNUM ?? '', //qmnum/aufnr
                detail: itemDetail.QMTXT ?? '', //qmtxt/ktext
                function: itemDetail.MAPAR ?? '', //mapar
                equipmentExtId: itemDetail.EQUNR ?? '', //equnr
                taskType: itemDetail.QMART ?? '', //qmart
                startDate: itemDetail.QMDAT ?? '', //qmdate
                endDate: itemDetail.QMDAT ?? '', //qmdate
                status: itemDetail.STATUS ?? '', //status
                tplnr: item.TPLNR ?? ''
            }

            notifications.push(notiorder)
        }

        const orders: Notiorder[] = []

        for (const item of result.LT_ORDER) {
            if (!item.EQUNR) continue

            const option = {
                ZEQUNR: item.EQUNR,
                ZFLAG: 'O', // N(통지),O(오더)
                ZGUBUN: 'I' //미결(I) 완료(E) 구분자
            }

            const itemDetailData = (await client.call('Z_PM_IF_GET_NOTI_ORDER_NEW', option)) as {
                LT_NOTI: RfcNotiorder[]
                LT_ORDER: RfcNotiorder[]
            }

            console.log('Z_PM_IF_GET_NOTI_ORDER_NEW', JSON.stringify(option), JSON.stringify(itemDetailData))

            if (0 === itemDetailData.LT_ORDER.length) continue

            const itemDetail = itemDetailData.LT_ORDER[0]

            const notiorder = {
                type: 'order',
                id: itemDetail.AUFNR ?? '', //qmnum/aufnr
                detail: itemDetail.KTEXT ?? '', //qmtxt/ktext
                function: itemDetail.MAPAR ?? '', //mapar
                equipmentExtId: itemDetail.EQUNR ?? '', //equnr
                taskType: itemDetail.AUART ?? '', //qmart
                startDate: itemDetail.GSTRP ?? '', //qmdate
                endDate: itemDetail.GLTRP ?? '', //qmdate
                status: itemDetail.STATUS ?? '', //status
                tplnr: item.TPLNR ?? ''
            }

            orders.push(notiorder)
        }

        return { notifications, orders }
    }

    public async getISOFile(dokar: string, doknr: string): Promise<any> {
        const param = { dest: 'ESP' } as noderfc.RfcConnectionParameters
        const pool = new noderfc.Pool({ connectionParameters: param })
        const client = await pool.acquire()

        if (client) {
            /**
             * 파일이 다운로드 된다고 전해 들음, 우리는 그것을 열기만 하면 된다.
             */
            const result = await client.call('Z_PM_IF_EPID_ISODWG_URL', {
                DOKAR: dokar,
                DOKNR: doknr
            })

            console.log('Z_PM_IF_EPID_ISODWG_URL', JSON.stringify(result))

            /**
             * result를 기반으로 url을 만들어주는 로직은 짜야됨
             */
            client.release()

            const url = result.ZURL as string
            return { url }
        }

        return { url: 'about:blank' }
    }

    public async getM1NotiIssueUrl(equnr: string, tplnr: string, userId: string): Promise<{ url: string }> {
        let url = 'about:blank'

        url = `https://top.khnp.auth/SAP/fiori.jsp?URL=https://khnpprd.khnp.se.hn:24300/sap/bc/ui5_ui5/sap/zcapui_popup/index.html%23/NOTIFITEM?qmart=M1%26equnr=${equnr}%26eqtxt=${'desc'}%26${tplnr}`

        return { url }
    }

    public async getM2NotiIssueUrl(equnr: string, tplnr: string, userId: string): Promise<{ url: string }> {
        let url = 'about:blank'

        url = `https://top.khnp.auth/SAP/fiori.jsp?URL=https://khnpprd.khnp.se.hn:24300/sap/bc/ui5_ui5/sap/zcapui_popup/index.html%23/NOTIFITEM?qmart=M2%26equnr=${equnr}%26eqtxt=${'desc'}%26${tplnr}`

        return { url }
    }

    public async getISODrawList(tplnr: string): Promise<any> {
        return await this.repo.findISODrawList(tplnr)
    }

    public async getECMRelatedFileInfo(file: {
        I_DOKAR: string
        I_DOKNR: string
        I_DOKTL: string
        I_DOKVR: string
        I_FILENM: string
    }): Promise<{ url: string }> {
        const client = await this.pool.acquire()

        let url = 'about:blank'

        if (client) {
            const result = await client.call('Z_PM_IF_EPID_DRAW_LIST', file)

            client.release()

            return { url: result.ZURL as string }
        }

        return { url }
    }

    public async getWcd(docId: string, docVer: string): Promise<{ handles: string[] }> {
        const arr: string[] = []
        const funcs = await this.repo.getFuncs(docId, docVer)
        const funcArr: string[] = []
        funcs.map((v: { [key: string]: string }) => {
            funcArr.push(v['FUNCTION'])
        })

        const client = await this.pool.acquire()
        if (client) {
            const result = (await client.call('Z_PM_IF_GET_ORDER_WCD', {
                LT_TPLNR: funcArr
            })) as { LT_TPLNR_WCD: [{ [key: string]: string }] }

            for (const item of result.LT_TPLNR_WCD) {
                // 핸들 말고 기능위치로 전달할수 있으면 전달 확실해지면 나중에 말씀 주시기로 함
                const FData = item.TPLNR.substring(0, 3)
                const LData = item.TPLNR.substring(4)
                // const tagNo:[{[key: string]: string}] = await this.repo.getTagNo(FData, LData, docId, docVer);
                // const wcdHandle:[{[key: string]: string}] = await this.repo.getHandle(tagNo[0]['TAGNO'], FData, LData, docId, docVer);
                const tagNo: any = await this.repo.getTagNo(FData, LData, docId, docVer)
                const wcdHandle: any = await this.repo.getHandle(tagNo[0]['TAGNO'], FData, LData, docId, docVer)
                wcdHandle.map((v: { [key: string]: string }) => {
                    arr.push(v['TAGHANDLE'])
                })
            }

            client.release()

            return { handles: arr }
        } else {
            error('RFC 연결 실패.')
        }

        // TEST 용

        // await new Promise((resolve) => {
        //     resolve(console.log('실행'))
        // })
        // console.log(docId, docVer)
        // const result = {
        //     handles: ['21946']
        //     // handles: ['8462']
        // }
        // console.log('result1111111111111', result)
        // return result
    }

    public async getOrderList(func: string): Promise<OrderList[]> {
        const client = await this.pool.acquire()
        const res: OrderList[] = []

        if (client) {
            const result = (await client.call('Z_PM_IF_WCD_STATUS', {
                I_TPLNR: func ?? ''
            })) as { LT_DATA: RfcCurrentOrder[] }

            client.release()

            result.LT_DATA.map((v) => {
                const order = {
                    id: v.AUFNR ?? '',
                    detail: v.TGTXT ?? '',
                    wcaNo: v.WAPINR ?? '',
                    wcdNo: v.WCNR ?? '',
                    status: v.WCD_SYSST ?? '',
                    object: v.COBJ_TPLNR ?? ''
                }
                res.push(order)
            })
            return res
        } else {
            error('RFC 연결 실패.')
        }

        // TEST용

        // Promise.resolve(console.log('실행'))

        // const result: OrderList[] = [
        //     {
        //         id: '000030410772',
        //         detail: '점검을 위한 오더 내역 A-001',
        //         wcaNo: '2021-04-15',
        //         wcdNo: '2021-04-15',
        //         status: 'CLSD 종료',
        //         object: 'asdf'
        //     },
        //     {
        //         id: '000030410772',
        //         detail: '점검을 위한 오더 내역 A-001',
        //         wcaNo: '2021-04-15',
        //         wcdNo: '2021-04-15',
        //         status: 'CLSD 종료',
        //         object: 'asdf'
        //     }
        // ]
        // return result
    }

    public async getTagging(docId: string, docVer: string, id = '', func: string, wcdNo: string): Promise<any> {
        let str: string = ''
        let num: number = 0
        const arr = []
        const client = await this.pool.acquire()

        if (client) {
            const result = (await client.call('Z_PM_IF_WCD_ITEM', {
                I_AUFNR: id ?? '',
                I_TPLNR: func ?? '',
                I_WCD: wcdNo ?? ''
            })) as { LT_DATA: RfcTagging[] }

            client.release()

            for (const item of result.LT_DATA) {
                if (item.CCOBJ?.includes(`\'`)) item.CCOBJ = item.CCOBJ?.replace(/'/gi, '')
                if (item.CCOBJ?.includes(`\"`)) item.CCOBJ = item.CCOBJ?.replace(/"/gi, '')
                const handle = await this.repo.getTaggingHandle(docId, docVer, item.CCOBJ as string)
                const order = {
                    counter: item.SEQ ?? '',
                    object: item.CCOBJ ?? '',
                    order: item.TGSEQ ?? '',
                    setOption: item.TGPROC ?? '',
                    setCaution: item.TGTXT ?? '',
                    resetOption: item.UNPROC ?? '',
                    resetCaution: item.CONTROL ?? '',
                    line: item.SYSST ?? '',
                    docNumber: item.DOCNUMBER ?? '',
                    handle: handle ?? ''
                }

                str += `'${item.CCOBJ}'`
                if (num !== result.LT_DATA.length - 1) {
                    str += `,`
                    num += 1
                }
                arr.push(order)
            }

            const refDoc = await this.repo.getRefDoc(str)
            return { tagList: arr, refDoc: refDoc }
        } else {
            error('RFC 연결 실패.')
        }

        // TEST 용

        // await new Promise((resolve) => {
        //     resolve(console.log('실행'))
        // })
        // console.log(docId, docVer, id, func, wcdNo)
        // const result = [
        //     {
        //         counter: '000010',
        //         object: '증기발생기 #02 냉각 환기 시스템',
        //         order: '000000',
        //         setOption: '주석참조',
        //         setCaution: 'Line-up 전 S/G 주의사항 참고',
        //         resetOption: '주석참조',
        //         resetCaution: 'Line-up 전 S/G 주의사항 참고',
        //         line: 'EUG',
        //         docNumber: '',
        //         handle: [{TAGHANDLE: '93882'}]
        //     },
        //     {
        //         counter: '000010',
        //         object: '증기발생기 #02 냉각 환기 시스템',
        //         order: '000000',
        //         setOption: '주석참조',
        //         setCaution: 'Line-up 전 S/G 주의사항 참고',
        //         resetOption: '주석참조',
        //         resetCaution: 'Line-up 전 S/G 주의사항 참고',
        //         line: 'EUG',
        //         docNumber: '',
        //         handle: [{TAGHANDLE: '97838'}]
        //     },
        //     {
        //         counter: '000010',
        //         object: '증기발생기 #02 냉각 환기 시스템',
        //         order: '000000',
        //         setOption: '주석참조',
        //         setCaution: 'Line-up 전 S/G 주의사항 참고',
        //         resetOption: '주석참조',
        //         resetCaution: 'Line-up 전 S/G 주의사항 참고',
        //         line: 'EUG',
        //         docNumber: '',
        //         handle: [{TAGHANDLE: '100649'}]
        //     },
        //     {
        //         counter: '000010',
        //         object: '증기발생기 #02 냉각 환기 시스템',
        //         order: '000000',
        //         setOption: '주석참조',
        //         setCaution: 'Line-up 전 S/G 주의사항 참고',
        //         resetOption: '주석참조',
        //         resetCaution: 'Line-up 전 S/G 주의사항 참고',
        //         line: 'EUG',
        //         docNumber: '',
        //         handle: [{TAGHANDLE: '97838'}]
        //     },
        //     {
        //         counter: '000010',
        //         object: '증기발생기 #02 냉각 환기 시스템',
        //         order: '000000',
        //         setOption: '주석참조',
        //         setCaution: 'Line-up 전 S/G 주의사항 참고',
        //         resetOption: '주석참조',
        //         resetCaution: 'Line-up 전 S/G 주의사항 참고',
        //         line: 'EUG',
        //         docNumber: '',
        //         handle: [{TAGHANDLE: '21946'}]
        //     },
        // ]
        // return {
        //     tagList: result,
        //     refDoc: [
        //         {
        //             DOCNO: '000000000000000000000000002508',
        //             DOCVR: '001',
        //             DOCNUMBER: '8610-11500-OM-105-902',
        //             DOCNM: 'P&ID-Instrument Air System Ash Transfer Area Unit 1&2',
        //             FOLID: '000000000000002111',
        //             PLANTCODE: '5100'
        //         },
        //         {
        //             DOCNO: '000000000000000000000000002502',
        //             DOCVR: '001',
        //             DOCNUMBER: '8610-11510-OM-105-904',
        //             DOCNM: 'P&ID-Fly Ash Slio Unit 1&2',
        //             FOLID: '000000000000002111',
        //             PLANTCODE: '5100'
        //         },
        //         {
        //             DOCNO: '000000000000000000000000002504',
        //             DOCVR: '001',
        //             DOCNUMBER: '8610-11540-OM-105-901',
        //             DOCNM: 'P&ID-Ash Transfer System Unit 1&2',
        //             FOLID: '000000000000002111',
        //             PLANTCODE: '5100'
        //         },
        //         {
        //             DOCNO: '000000000000000000000000002510',
        //             DOCVR: '001',
        //             DOCNUMBER: '8611-11510-OM-105-901-01',
        //             DOCNM: 'P&ID-Fly Ash System Unit 1',
        //             FOLID: '000000000000002111',
        //             PLANTCODE: '5100'
        //         }
        // ]
        // }
    }

    public async PMDCPopupPosSave(userId: string, posArr: string, idArr: string): Promise<boolean> {
        try {
            await this.repo.PMDCPopupPosSave(userId, posArr, idArr)
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    public async getPMDCRealTimeData(name: string): Promise<{ [key: string]: string }[]> {
        const result = (await this.repo.getPMDCRealTimeData(name)) as { [key: string]: string }[]
        return result
    }

    public async updateIspm(list: string): Promise<boolean> {
        try {
            await this.repo.updateIspm(list)
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    public async NotiOrderSync(startDate: string, endDate: string): Promise<any> {
        try {
            const client = await this.pool.acquire()
            if (client) {
                const result = (await client.call('Z_PM_IF_EPID_NO_LIST', {
                    I_FROM: startDate,
                    I_TO: endDate
                })) as {
                    IT_NOTIDRAW: [{ [key: string]: string }]
                    IT_ORDERDRAW: [{ [key: string]: string }]
                }

                client.release()

                const obj = {
                    data: {
                        noti: result.IT_NOTIDRAW,
                        order: result.IT_ORDERDRAW
                    }
                }
                return obj
            }
        } catch (error) {
            console.log(error)
            return false
        }
    }

    public async EquipSync(startDate: string, endDate: string, type: string): Promise<any> {
        try {
            const client = await this.pool.acquire()
            if (client) {
                const result = (await client.call('Z_PM_IF_EPID_EQUI_TABLE', {
                    I_FLAG: type,
                    I_STR_DATE: startDate,
                    I_END_DATE: endDate
                })) as { T_ZSEPID0001: [{ [key: string]: string }] }

                client.release()

                return { data: result.T_ZSEPID0001 }
            }
        } catch (error) {
            console.log(error)
            return false
        }
    }

    public async logUser(value: any): Promise<boolean> {
        try {
            return await this.repo.addLogUser(value)
        } catch (error) {
            console.log(error)
            return false
        }
    }

    public async logDocument(value: any): Promise<boolean> {
        try {
            return await this.repo.addLogDocument(value)
        } catch (error) {
            console.log(error)
            return false
        }
    }

    public async procedureList(value: any): Promise<any> {
        const _list = await this.repo.getProcedureList(value)
        return _list
    }

    public async procedureRead(userId: string, proId: string): Promise<any> {
        const _list = await this.repo.getProcedureRead(proId)
        return _list
    }

    public async insertProcedure(value: any): Promise<boolean> {
        return this.repo.insertProcedure(value)
    }

    public async getProcedureEquipHandle(func: string, docId: string): Promise<any> {
        try {
            const res = await this.repo.getProcedureEquipHandle(func, docId)
            return res
        } catch (e) {
            console.log('service getProcedurePMDCData 함수 에러', e)
        }
    }

    public async getUrlByfunctionName(userId: string, functionName: string): Promise<string> {
        const res = await this.repo.getUrlByfunctionName(functionName)

        if (res) {
            const base64EncodedUserId = Buffer.from(userId, 'utf8').toString('base64')
            // ! 배포환경에서는 도메인 사용
            const region = process.env.REGION as string
            const fePath =
                region === 'kospo' ? (process.env.KOSPO_FE_PATH as String) : (process.env.KHNP_FE_PATH as String)
            return `${fePath}?sUserId=${base64EncodedUserId}&drawing=${enc(res.docId)}&revision=${enc(
                res.docVer
            )}&plant=${enc(res.plantCode)}&equip=${enc(res.tagId)}`
        } else {
            throw new Error('Not Found Data')
        }
    }

    public async getUrlByEquipNo(userId: string, equipNo: string): Promise<string> {
        const res = await this.repo.getUrlByEquipNo(equipNo)

        if (res) {
            const base64EncodedUserId = Buffer.from(userId, 'utf8').toString('base64')
            // ! 배포환경에서는 도메인 사용
            const region = process.env.REGION as string
            const fePath =
                region === 'kospo' ? (process.env.KOSPO_FE_PATH as String) : (process.env.KHNP_FE_PATH as String)
            return `${fePath}?sUserId=${base64EncodedUserId}&drawing=${enc(res.docId)}&revision=${enc(
                res.docVer
            )}&plant=${enc(res.plantCode)}&equip=${enc(res.tagId)}`
        } else {
            throw new Error('Not Found Data')
        }
    }

    public async getFolderIdsByPlantCode(plantCode: string): Promise<selectItem[]> {
        const result: selectItem[] = []
        const res = await this.repo.getFolderIdsByPlantCode(plantCode)
        if (res) {
            for await (const folderId of res.split('/')) {
                if (folderId != '000000000000000001') {
                    const subRes = await this.repo.getFolderNameByFolderId(folderId)
                    if (subRes) {
                        const selectItem = {
                            text: subRes,
                            value: folderId
                        }
                        result.push(selectItem)
                    }
                }
            }
        }
        return result
    }

    public async testImgInsert(): Promise<any> {
        const hostPath = process.env['DOC_PATH'] as string

        var imageBuffer = fs.readFileSync(`${hostPath}\\RD19-431-N105-00106001-1-1-5.jpg`)

        const opts = {
            SEQ: '5',
            DOCNO: '123123',
            DOCVR: '001',
            IMGNM: 'IMGNM',
            IMGEXT: 'IMGEXT',
            IMG: imageBuffer
        }

        await this.repo.testImgInsert(imageBuffer, opts)
    }

    public async getLastDocumentInfo(userId: string): Promise<any> {
        return await this.repo.findLastDocumentInfo(userId)
    }

    public async getEquipmentImage(tplnr: string): Promise<any> {
        return await this.repo.findEquipmentImageInfo(tplnr)
    }

    public async getEquipmentImageData(serial: string): Promise<any> {
        const path = `${process.env['IMAGE_PATH'] as string}\\${serial}`
        const exist = Path.exists(path)

        if (exist) {
            return fs.createReadStream(path)
        } else {
            const imageBuffer = await this.repo.findEquipmentImageBySerial(serial)
            if (imageBuffer) File.write(path, imageBuffer)
            return fs.createReadStream(path)
        }
    }

    public async deleteEquipmentImageData(serial: string): Promise<any> {
        return await this.repo.deleteEquipmentImage(serial)
    }

    public async addEquipmentImage(body: any): Promise<any> {
        let i = 0

        const processFiles = async () => {
            const file = body.files[`image_${i}`]

            if (undefined !== file) {
                const data = fs.readFileSync(file.tempFilePath)

                file.data = data
                body.file = file

                console.log('@BODY.FILE: ', body.file)

                await this.repo.saveEquipmentImage(body)

                i++

                await processFiles()
            } else {
                return true
            }
        }

        await processFiles()
        return true
    }

    public async getUserBySabun(sabun: string): Promise<any> {
        return await this.repo.findUserBySabun(sabun)
    }
}
