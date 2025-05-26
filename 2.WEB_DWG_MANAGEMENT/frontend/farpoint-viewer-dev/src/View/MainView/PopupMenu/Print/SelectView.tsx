import React from 'react'
import './SelectView.css'
import { Select } from './Select'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { MarkUpStore, StatusStore, PldStore } from '../../../../Store/statusStore'
import AppStore from '../../../../Store/appStore'
import Api from '../../../../Api'
// Lib
import { PDFDocument, PageSizes, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import moment from 'moment'
import html2canvas from 'html2canvas'

export function SelectView() {
    const [isPrintPopup, setIsPrintPopup] = useRecoilState(StatusStore.isPrintPopup)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const markupPaths = useRecoilValue(MarkUpStore.markupPaths)
    const userId = useRecoilValue(AppStore.userId)
    const setBanner = useSetRecoilState(StatusStore.banner)

    const [typeValue, setTypeValue] = React.useState('A3')
    const [colorMode, setColorMode] = React.useState('COLOR')

    const controlMode = useRecoilValue(StatusStore.controlMode)
    const currentPld = useRecoilValue(PldStore.currentPld)

    const typeValueChange = (value: string) => {
        setTypeValue(value)
    }

    function canvasToByteArray(canvas: HTMLCanvasElement, format = 'image/png', quality = 1) {
        const dataUrl = canvas.toDataURL(format, quality)
        const base64 = dataUrl.split(',')[1]
        const binaryString = window.atob(base64)
        const len = binaryString.length
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i)
        }
        return bytes
    }

    const print = React.useCallback(() => {
        const fetchPdf = async () => {
            if (!selectedCanvas || !userId) return
            setBanner(`프린트 준비 중..`)
            const { docId, docVer } = selectedCanvas.documentCtx
            let pdfBlob = undefined
            // PLD 혹은 마크업 프린트일 경우
            if (controlMode === 'pld' || controlMode === 'pldSelect' || markupPaths.length > 0) {
                pdfBlob = await html2canvas(document.getElementById('printArea') as HTMLElement).then(async (canvas) => {
                    const pdfDoc = await PDFDocument.create()
                    const page = pdfDoc.addPage([PageSizes.A4[1], PageSizes.A4[0]])

                    const imgBytes = canvasToByteArray(canvas)
                    const canvasImg = await pdfDoc.embedPng(imgBytes)
                    // 페이지 크기 얻기
                    const { width, height } = await pdfDoc.embedPng(imgBytes)

                    // 이미지 스케일링
                    const scaleFactor = Math.min(page.getWidth() / width, page.getHeight() / height)
                    const scaledWidth = width * (scaleFactor * 1.3)
                    const scaledHeight = height * (scaleFactor * 1.3)

                    page.drawImage(canvasImg, {
                        x: 30 + page.getWidth() / 2 - scaledWidth / 2,
                        y: page.getHeight() / 2 - scaledHeight / 2,
                        width: scaledWidth,
                        height: scaledHeight,
                    })
                    const pdfBytes = await pdfDoc.save()

                    // PDF 파일 blob 생성
                    const createBlob = new Blob([pdfBytes], { type: 'application/pdf' })
                    return createBlob
                })
            } else {
                // 일반 프린트일 경우
                pdfBlob = await Api.document.getDwgToPdf(docId, docVer, userId, typeValue, colorMode)
            }

            if (pdfBlob) {
                // PDF Blob을 ArrayBuffer로 변환
                const arrayBuffer = await pdfBlob.arrayBuffer()
                // PDFDocument 생성
                const pdfDoc = await PDFDocument.load(arrayBuffer)
                // 첫 번째 페이지 가져오기
                const page = pdfDoc.getPages()[0]

                // 마크업 이미지 스케일 맞지 않아 보류
                //if (markupPaths.length > 0) {
                //    // 마크업 이미지 추가
                //    const markupCanvas = document.getElementById('markupCanvas') as HTMLCanvasElement

                //    const imgBytes = canvasToByteArray(markupCanvas)
                //    const pngImg = await pdfDoc.embedPng(imgBytes)
                //    page.drawImage(pngImg, {
                //        // 도면과 마크업 이미지의 스케일을 수동으로 맞춤.(변동 가능성 있음)
                //        x: -208,
                //        y: 28,
                //        width: markupCanvas.width - 248,
                //        height: markupCanvas.height - 126,
                //    })
                //}
                // currentPld.PLD_P_NAME
                const fontRes = await fetch('/fonts/NanumGothic.ttf')
                const fontBytes = await fontRes.arrayBuffer()
                pdfDoc.registerFontkit(fontkit)
                const font = await pdfDoc.embedFont(fontBytes)
                let nowDateString = moment().format('YYYY-MM-DD A h:mm:ss')
                if (nowDateString.indexOf('PM') !== -1) {
                    nowDateString = nowDateString.replace('PM', '오후')
                } else if (nowDateString.indexOf('AM') !== -1) {
                    nowDateString = nowDateString.replace('AM', '오전')
                }

                // 텍스트를 PDF에 추가
                let printText = `본 도면은 지능화 도면입니다. 사번: ${userId} / ${nowDateString}`

                page.drawText(printText, {
                    x: 30,
                    y: 10,
                    size: 8,
                    font: font,
                    color: rgb(0, 0, 0),
                })

                // PLD 프린트일때 워터마크 추가
                let printPldText = ''
                if (controlMode === 'pld' || controlMode === 'pldSelect') {
                    printPldText = `PLD 명 :  ${currentPld?.PLD_P_NAME} / ${selectedCanvas.documentCtx.docName}`
                    const textWidth = font.widthOfTextAtSize(printPldText, 8)
                    const textHeight = font.heightAtSize(8)
                    page.drawText(printPldText, {
                        x: 30,
                        y: page.getHeight() - 10,
                        size: 8,
                        font: font,
                        color: rgb(0, 0, 0),
                    })
                }

                const pdfBytes = await pdfDoc.save()
                const pdfRes = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }))

                window.open(pdfRes)?.print()
            }

            setBanner(undefined)
        }

        fetchPdf()

        setIsPrintPopup(false)
    }, [selectedCanvas, userId, setBanner, typeValue, colorMode, markupPaths.length, setIsPrintPopup])

    return (
        <div
            className="PrintSelectViewFrame"
            hidden={!isPrintPopup}
            onClick={(e) => {
                e.stopPropagation()
            }}
        >
            <div className="PrintSelectView">
                <div className="Titlebar">
                    <div className="Text">프린트</div>
                </div>

                <Select
                    id="TypeControl"
                    items={[
                        { value: 'A3', text: 'A3' },
                        { value: 'A4', text: 'A4' },
                    ]}
                    placeHolder="용지"
                    value={typeValue}
                    onChange={typeValueChange}
                />

                <Select
                    id="TypeControl"
                    items={[
                        { value: 'COLOR', text: 'COLOR' },
                        { value: 'BLACK', text: 'BLACK' },
                    ]}
                    placeHolder="모드"
                    value={colorMode}
                    onChange={setColorMode}
                />

                <div
                    className="CancelButton"
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                >
                    <div className="Text" onClick={() => setIsPrintPopup(false)}>
                        취소
                    </div>
                </div>
                <div className={'SaveButton'} onClick={() => print()}>
                    <div className="Text">확인</div>
                </div>
            </div>
        </div>
    )
}
