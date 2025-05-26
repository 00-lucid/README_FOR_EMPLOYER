import 'dotenv/config'
import cluster from 'cluster'
import { cpus } from 'os'
import { DocumentRepository, DocumentService } from './application'
import { HttpServer } from 'common'
import * as routes from './application'
import { Oracledb, OracledbCfg } from './infra'

export function port(): number {
    const envValue = process.env['SERVICE_PORT'] as string

    assert(envValue !== undefined, 'missing SERVICE_PORT')

    const port = parseInt(envValue)

    assert(!isNaN(port), `wrong SERVICE_PORT, '${envValue}'`)

    return port
}

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`)

    const numCPUs = cpus().length

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    cluster.on('exit', (worker, code: number, signal: string) => {
        console.log(`worker ${worker.process.pid ?? 'undefined'} died`, code, signal)
    })
} else {
    console.log(`Cluster ${process.pid} is running`)

    let server = HttpServer.prototype

    const cfgText = process.env['DB_CFG'] as string
    const cfg = JSON.parse(cfgText) as OracledbCfg

    void Oracledb.create(cfg)
        .then((db: Oracledb) => {
            const repo = DocumentRepository.create(db)
            const service = DocumentService.create(repo, '', '', '')

            const routers = [routes.folders(service)]

            server = HttpServer.create(routers, [{ prefix: '/', path: 'output/public' }])

            server.start(port())
        })
        .catch(console.log)
}
