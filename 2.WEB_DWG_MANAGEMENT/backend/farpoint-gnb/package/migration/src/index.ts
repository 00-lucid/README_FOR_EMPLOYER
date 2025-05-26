import * as fs from 'fs'
import * as p from 'path'
import { exec } from 'child_process'
import 'dotenv/config'
import { Oracledb, OracledbCfg } from './Oracledb'

async function getFiles(): Promise<void> {
    const db = await Oracledb.create(cfg)

    console.log('loading list...')

    const getListQuery = `SELECT DOCNO, DOCVR FROM IDS_DOC`
    const files = (await db.query(getListQuery)) as { DOCNO: string; DOCVR: string }[]

    for (let i = 0; i < files.length; i++) {
        const file = files[i]

        const getFile = `SELECT DOCCT FROM IDS_DOC WHERE DOCNO = '${file.DOCNO}' AND DOCVR = '${file.DOCVR}'`
        const buffer = await db.getBlob(getFile)

        const filename = `${file.DOCNO}_${file.DOCVR}.dwg`
        fs.writeFileSync(workdir + filename, buffer)

        console.log(`${i + 1}/${files.length}, ${Math.floor(buffer.length / 1024)}KB, ${filename}`)
    }
}

function convert() {
    const res: string[] = []

    const items = fs.readdirSync(workdir)

    for (const item of items) {
        if (p.extname(item) === '.dwg') res.push(item)
    }

    for (let i = 0; i < res.length; i++) {
        const file = p.parse(res[i])

        const src = p.join(workdir, res[i])
        const target = p.join(workdir, `${file.name}.vsf`)

        if (fs.existsSync(target)) {
            console.log(`${i + 1}/${res.length}, exist, ${target}`)
        } else {
            const hostPath = (process.env['DRAWING_FILE_PATH'] as string) ?? 'farpoint'
            const type = hostPath === 'farpoint' ? 'volume' : 'bind'

            const cmd = `docker run --rm --mount source=${hostPath},target=${workdir},type=${type} farpoint/converter FileConverter ${src} ${target}`

            console.log(cmd)
            const code = exec(cmd).exitCode ?? -1

            console.log(`${i + 1}/${res.length}, convert(${code}), ${target}`)
        }
    }

    return res
}

const cfgText = process.env['DB_CFG'] as string
const cfg = JSON.parse(cfgText) as OracledbCfg
const workdir = '/farpoint/'
const arg = process.argv[2]

if (arg === 'load') {
    getFiles()
        .then(() => console.log(''))
        .catch(console.log)
} else if (arg === 'convert') {
    convert()
} else {
    getFiles()
        .then(() => convert())
        .catch(console.log)
}
