import 'dotenv/config'
import { HttpServer } from 'common'
import {
    DocumentRepository,
    DocumentService,
    SystemRepository,
    MydocsService,
    MydocsRepository,
    PLDRepository,
    PLDService,
    PIService,
    PIRepository,
    ConvertRepository,
    ConvertService
} from './application'
import * as routes from './application'
import { Oracledb, OracledbCfg } from './infra'

export function close(): void {
    server.stop()
}

export function port(): number {
    const envValue = process.env['SERVICE_PORT'] as string
    console.log('PORT: ', envValue)

    assert(envValue !== undefined, 'missing SERVICE_PORT')

    const port = parseInt(envValue)

    assert(!isNaN(port), `wrong SERVICE_PORT, '${envValue}'`)

    return port
}

let server = HttpServer.prototype
const region = process.env.REGION as string
console.log('REGION: ', region)
console.log('SAP_TYPE: ', process.env.SAP_TYPE)
const cfgText = region === 'kospo' ? (process.env['KOSPO_DB_CFG'] as string) : (process.env['KHNP_DB_CFG'] as string)
let dbCfg = JSON.parse(cfgText) as OracledbCfg

const docViewerUrl = process.env['DocViewerUrl'] as string
const mydocPath = process.env['MydocPath'] as string
const signalPath = process.env['SignalPath'] as string
const relatedPath = process.env['RelatedPath'] as string
const mydocLocalPath = process.env['MydocLocalPath'] as string
const enableMydoc = process.env['EnableMydoc'] as string

if (dbCfg && mydocPath && signalPath && relatedPath && docViewerUrl && mydocLocalPath) {
    dbCfg["user"]=atob(dbCfg["user"])
    dbCfg["password"]=atob(dbCfg["password"])

    void Oracledb.create(dbCfg)
        .then((db: Oracledb) => {
            const repo = DocumentRepository.create(db)
            const service = DocumentService.create(repo, docViewerUrl, signalPath, relatedPath)

            const mydocsRepo = MydocsRepository.create(db)
            const mydocsService = MydocsService.create(
                mydocsRepo,
                docViewerUrl,
                mydocPath,
                mydocLocalPath,
                enableMydoc === 'true'
            )

            const systemRepo = SystemRepository.create(db)

            const pldRepo = PLDRepository.create(db)
            const pldSevice = PLDService.create(pldRepo)

            const piRepo = PIRepository.create(db)
            const piService = PIService.create(piRepo)

            const ConvertRepo = ConvertRepository.create(db)
            const convertService = ConvertService.create(ConvertRepo)

            const routers = [
                routes.folders(service),
                routes.mydocs(mydocsService),
                routes.system(systemRepo),
                routes.PLDController(pldSevice),
                routes.PIController(piService),
                routes.ConvertController(convertService)
            ]

            server = HttpServer.create(routers, [{ prefix: '/', path: 'output/public' }])

            server.start(port())
        })
        .catch(console.log)
} else {
    console.log('환경변수 설정되지 않음.')
}
