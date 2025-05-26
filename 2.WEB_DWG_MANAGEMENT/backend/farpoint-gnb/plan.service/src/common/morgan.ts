import morgan from 'morgan'
import { Request } from 'express'
import * as rfs from 'rotating-file-stream'
import * as path from 'path'
import * as uuid from 'node-uuid'
import * as fs from 'fs'

/**
 * morgan wrapper
 * @returns {morgan}
 */
export default function set_logger(app: any) {
    const logPath = path.join(__dirname, '../log')

    // 서버 재실행시 Log 파일 초기화 - 5개 파일만 남기고 삭제
    fs.readdir(logPath, (err, fileList) => {
        if (err) return
        for (let i = 0; i < fileList.length; i++) {
            if (i < fileList.length - 5) {
                fs.rm(`${logPath}\\${fileList[i]}`, (err) => {
                    if (err !== null) {
                        console.log('Log fs.rm -> err: ', err)
                    }
                })
            }
        }
    })

    // create a rotating write stream
    const accessLogStream = rfs.createStream(generatorFileName, {
        interval: '1d', // rotate daily
        path: logPath,
        maxFiles: 5,
        maxSize: '200M',
        teeToStdout: true
    })

    morgan.token('status', function (req, res: any) {
        return res.statusCode
    })

    // Create a token for request body
    morgan.token('req-body', function (req: Request, res) {
        return JSON.stringify(req.body)
    })

    morgan.token('origin', function getId(req) {
        return req.headers['origin']
    })

    const originalSend = app.response.json
    app.response.json = function sendOverWrite(body: any) {
        originalSend.call(this, body)
        this.__morgan_body_response = body
    }

    morgan.token('res-body', function getRes(req, res: any) {
        let body = JSON.stringify(res.__morgan_body_response)
        if (body) body = body.substring(0, 100)
        return body
    })
    morgan.token('id', function getId(req: any) {
        return uuid.v4()
    })

    //  set request logger
    app.use(
        morgan('REQ :id addr::remote-addr met::method url::url :origin ua::user-agent [:date[clf]]', {
            stream: accessLogStream,
            immediate: true
        })
    )

    //  set response logger
    app.use(
        morgan('RES :id :remote-addr met::method :url :status res::res-body - :response-time ms', {
            stream: accessLogStream
        })
    )
}

const pad = (num: number) => (num > 9 ? '' : '0') + num
const generatorFileName = () => {
    const time = new Date()
    var month = time.getFullYear() + '' + pad(time.getMonth() + 1)
    var day = pad(time.getDate())
    var hour = pad(time.getHours())
    var minute = pad(time.getMinutes())

    return `${month}${day}-${hour}${minute}-file.log`
}
