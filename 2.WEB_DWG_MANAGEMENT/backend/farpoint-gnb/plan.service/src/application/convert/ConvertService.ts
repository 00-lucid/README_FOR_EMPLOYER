import { ConvertRepository } from './ConvertRepository'
import fs from 'fs'
import { File } from 'common/File'
const util = require('util')
const exec = util.promisify(require('child_process').exec)

export class ConvertService {
    public static create(repo: ConvertRepository): ConvertService {
        return new ConvertService(repo)
    }

    private readonly repo: ConvertRepository

    private constructor(repo: ConvertRepository) {
        this.repo = repo
    }

    /**
     * Dwg To Pdf Convert
     */
    public async getDwgToPdf(dto: {
        docId: string
        docVr: string
        userId: string
        type: string
        colorMode: string
    }): Promise<Buffer> {
        // 현재 접속된 userId (워터마크용)
        const { docId, docVr, userId, type, colorMode } = dto
        // dwg 주소
        const inputPath = process.env['DOC_PATH'] as string
        // pdf 주소
        const outputPath = process.env['PDF_PATH'] as string

        if (!inputPath || !outputPath) {
            throw new Error('Not Exist Storage Path')
        }

        // 폴더 없으면 생성
        const isExistInputPath = fs.existsSync(inputPath)
        if (!isExistInputPath) fs.mkdirSync(inputPath, { recursive: true })
        const isExistOutputPath = fs.existsSync(outputPath)
        if (!isExistOutputPath) fs.mkdirSync(outputPath, { recursive: true })

        // 현재 SYSTEM DATE (워터마크용, 한글은 깨져서 출력되어 오전,오후 표기 대신 AM,PM 으로표기)
        const dateTime = new Date().toLocaleString('en-US')

        // 파일경로
        const dwgPath = `${inputPath}\\${docId}_${docVr}.dwg`
        const colorModeLowerCase = colorMode.toLowerCase()
        const pdfPath = `${outputPath}\\${docId}_${docVr}_${colorModeLowerCase}`
        const isOverConvert = fs.existsSync(pdfPath)

        // 컨버팅된 pdf가 있다면
        if (isOverConvert) return fs.readFileSync(`${pdfPath}.pdf`)

        fs.chmod(outputPath, 755, () => {
            console.log('permission changed')
        })

        // OdaPublish 실행할때 dwg 파일을 pdf 파일로 컨버팅 해달라는 mode 설정
        const convertType = '--mode dwg2pdf2d'

        // dwg 스트리밍
        const buffer = await this.repo.getDocumentFile(docId, docVr)
        File.write(`${dwgPath}`, buffer)

        // Window
        // 윈도우의 경우 pdfs 폴더의 권한 필수
        // system properties path도 필요하면 변경
        const { stdout, stderr } = await exec(
            `OdPdfPublish.exe ${dwgPath} ${pdfPath} ${convertType} ${userId} "${dateTime}" ${type} ${colorMode}`
        )

        fs.rm(`${dwgPath}`, (err) => {
            console.log('err: ', err)
        })

        if (stderr) {
            throw new Error(`error: ${stderr}`)
        }

        return fs.readFileSync(`${pdfPath}.pdf`)
    }
}
