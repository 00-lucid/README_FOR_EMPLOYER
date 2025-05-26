import { DrawingPath } from '../../types'

export type ViewParams = {
    position: any
    target: any
    upVector: any
    viewFieldWidth: any
    viewFieldHeight: any
    perspective: any
}

export class MarkupPainter {
    private canvas: HTMLCanvasElement
    private adjust: { scale: number; x: number; y: number }

    public static create(viewer: any, canvas: HTMLCanvasElement): MarkupPainter | undefined {
        if (viewer === undefined) return undefined
        if (canvas === undefined) return undefined
        if (canvas.getContext('2d') === undefined) return undefined

        const modelSize = this.modelSize(viewer)
        const screenSize = { width: canvas.width, height: canvas.height }

        const params = this.getViewParams(viewer)
        const modelViewSize = { width: params.viewFieldWidth, height: params.viewFieldHeight }
        const modelPos = { x: params.position[0], y: params.position[1] }

        const modelX = modelSize.width / 2 - modelPos.x
        const modelY = modelSize.height / 2 - modelPos.y

        const scale = screenSize.width / modelViewSize.width
        const x = (modelViewSize.width - modelSize.width) / 2 + modelX
        const y = (modelViewSize.height - modelSize.height) / 2 + modelY

        const adjust = { scale, x, y }

        return new MarkupPainter(canvas, adjust)
    }

    public static getScale(viewer: any, canvas: HTMLCanvasElement): number {
        const params = this.getViewParams(viewer)
        const modelViewSize = { width: params.viewFieldWidth, height: params.viewFieldHeight }
        const screenSize = { width: canvas.width, height: canvas.height }
        const scale = screenSize.width / modelViewSize.width

        return scale
    }

    private constructor(canvas: HTMLCanvasElement, adjust: { scale: number; x: number; y: number }) {
        this.canvas = canvas
        this.adjust = adjust
    }

    public static modelSize(viewer: any): { width: number; height: number } {
        const val = viewer.getActiveExtents()
        const size = val.max()

        return { width: size[0], height: size[1] }
    }

    public static getViewParams(viewer: any): ViewParams {
        const view = viewer.activeView

        return {
            position: view.viewPosition,
            target: view.viewTarget,
            upVector: view.upVector,
            viewFieldWidth: view.viewFieldWidth,
            viewFieldHeight: view.viewFieldHeight,
            perspective: view.perspective
        }
    }

    public clear() {
        const ctx = this.canvas.getContext('2d')

        if (ctx) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }
    }

    public draw(drawingPath: DrawingPath) {
        const ctx = this.canvas.getContext('2d')

        if (ctx) {
            ctx.strokeStyle = drawingPath.color
            ctx.lineWidth = drawingPath.width * window.devicePixelRatio

            const adjust = this.adjust
            const screenHeight = this.canvas.height

            const line = new Path2D()
            const valX = drawingPath.values[0]
            const valY = drawingPath.values[1]

            const x = (valX + adjust.x) * adjust.scale
            const y = screenHeight - (valY + adjust.y) * adjust.scale

            line.moveTo(x, y)

            for (let i = 0; i < drawingPath.values.length; i = i + 2) {
                const valX = drawingPath.values[i + 0]
                const valY = drawingPath.values[i + 1]

                const x = (valX + adjust.x) * adjust.scale
                const y = screenHeight - (valY + adjust.y) * adjust.scale

                line.lineTo(x, y)
            }

            ctx.stroke(line)
        }
    }
}
