require('dotenv/config')
const OracleDB = require('oracledb')
const fs = require('fs')
const cp = require('child_process')
const stream = require('stream')

class BufferWriteStream extends stream.Writable {
    buffers

    static create() {
        return new BufferWriteStream()
    }

    constructor() {
        super()
        this.buffers = []
    }

    hasBuffer() {
        return this.buffers.length > 0
    }

    getBuffer() {
        return Buffer.concat(this.buffers)
    }

    _write(chunk, _encoding, callback) {
        this.buffers.push(chunk)

        callback()
    }
}

class Shell {
    static exec(command, opts) {
        return new Promise((resolve, reject) => {
            try {
                const process = cp.spawn(command, {
                    shell: true
                })

                const stream = BufferWriteStream.create()

                process.stdout.pipe(stream)

                let errMsg = ''

                process.stderr.on('data', (data) => {
                    errMsg = data.toString('utf8')
                })

                process.on('close', (code) => {
                    if (code === 0) {
                        const buffer = stream.getBuffer()
                        resolve(buffer.toString())
                    } else {
                        reject(command)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}

const cfgText = process.env['KHNP_DB_CFG']
const cfg = JSON.parse(cfgText)

OracleDB.createPool({
    user: cfg.user,
    password: cfg.password,
    connectionString: `${cfg.host}:${cfg.port}/${cfg.database}`,
    externalAuth: false
}).then(async (pool) => {
    let errDwgLength = 0

    const conn = await pool.getConnection()
    const options = {
        outFormat: OracleDB.OUT_FORMAT_OBJECT
    }
    const res = await conn.execute('SELECT DOCNO, DOCVR FROM IDS_DOC WHERE DOCCT IS NOT NULL', {}, options)
    const hostPath = 'C:\\farpoint\\docs'

    console.log(`target length ${res.rows.length} . . .`)

    const isExistHostPath = fs.existsSync(hostPath)
    if (!isExistHostPath) fs.mkdirSync(hostPath, { recursive: true })

    for (const doc of res.rows) {
        const { DOCNO, DOCVR } = doc

        const hostFilePath = `${hostPath}\\${DOCNO}_${DOCVR}`

        const workingDir = '/farpoint'

        const baseName = `${workingDir}/${DOCNO}_${DOCVR}`

        const exist = fs.existsSync(hostFilePath)

        if (!exist) {
            let sql = `SELECT DOCCT FROM IDS_DOC WHERE DOCNO = ${DOCNO} AND DOCVR = ${DOCVR}`
            let options = { outFormat: OracleDB.OUT_FORMAT_ARRAY }
            let res = await conn.execute(sql, {}, options)

            if (null !== res.rows[0][0]) {
                const buffer = await res.rows[0][0].getData()
                //const srcPath = `${baseName}.dwg`
                //const outPath = `${baseName}.vsfx`
                //const type = `bind`

                // 이미지 다운로드 ---
                sql = `SELECT IMGNM ,IMG FROM IDS_DOC_IMG WHERE DOCNO = '${DOCNO}' AND DOCVR = '${DOCVR}'`
                options = { outFormat: OracleDB.OUT_FORMAT_ARRAY }
                res = await conn.execute(sql, {}, options)

                const rows = res.rows
                if (rows) {
                    for (const row of rows) {
                        const imgName = row[0]
                        const Lob = row[1]
                        if (typeof Lob !== 'string' && typeof imgName === 'string') {
                            const imgBuffer = await Lob.getData()
                            fs.writeFileSync(`${hostPath}\\${imgName}`, imgBuffer)
                        }
                    }
                }
                // 이미지 다운로드 end ---

                fs.writeFileSync(`${hostFilePath}.dwg`, buffer)
                console.log(baseName)

                await Shell.exec(
                    `cd ../../plan.service/fileConverter && FileConverter ${hostFilePath}.dwg ${hostFilePath}.vsfx --multithreading=true`
                )
                    .then(async () => {
                        await Shell.exec(`move ${hostFilePath}.vsfx ${hostFilePath}`)
                    })
                    .catch((command) => {
                        console.log(`[Error] ${command}`)
                        errDwgLength++
                    })

                fs.rm(`${hostFilePath}.dwg`, (err) => {
                    console.log('fs.rm -> err: ', err)
                })

                // 이미지 삭제
                for (const row of rows) {
                    const imgName = row[0]
                    fs.rm(`${hostPath}\\${imgName}`, (err) => {
                        console.log('fs.rm img -> err: ', err)
                    })
                }

                // 도커 버전
                //await Shell.exec(
                //    `docker run --rm --mount source=${hostPath},target=${workingDir},type=${type} farpoint/converter:23.8 FileConverter ${srcPath} ${outPath} --useVSFX`
                //)
                //.then(async () => {
                //    await Shell.exec(`move ${hostFilePath}.vsfx ${hostFilePath}`)
                //})
                //.catch((command) => {
                //    console.log(`[Error] ${command}`)
                //    errDwgLength++
                //})
            } else {
                continue
            }
        }
    }

    console.log(`[Result] success convert ${res.rows.length - errDwgLength}/${res.rows.length}`)
})
