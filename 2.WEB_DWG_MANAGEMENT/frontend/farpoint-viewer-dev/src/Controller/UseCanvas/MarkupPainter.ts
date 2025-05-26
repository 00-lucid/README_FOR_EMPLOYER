export class MarkupPainter {
    private canvas: HTMLCanvasElement
    private adjust: { scale: number; x: number; y: number }
    private widthRatio: number = 0.1
    private static tempScale: number = 0

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

    public static getRealScale(viewer: any, canvas: HTMLCanvasElement): void {
        MarkupPainter.tempScale = MarkupPainter.getScale(viewer, canvas)
    }

    public static getX(viewer: any): number {
        const params = this.getViewParams(viewer)
        const modelSize = this.modelSize(viewer)
        const modelViewSize = {
            width: params.viewFieldWidth,
            height: params.viewFieldHeight,
        }
        const modelPos = params.position[0]
        const modelX = modelSize.width / 2 - modelPos
        const x = (modelViewSize.width - modelSize.width) / 2 + modelX

        return x
    }

    public static getY(viewer: any): number {
        const params = this.getViewParams(viewer)
        const modelSize = this.modelSize(viewer)
        const modelViewSize = {
            width: params.viewFieldWidth,
            height: params.viewFieldHeight,
        }
        const modelPos = params.position[1]
        const modelY = modelSize.height / 2 - modelPos
        const y = (modelViewSize.height - modelSize.height) / 2 + modelY

        return y
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

        const obj = {
            position: view.viewPosition,
            target: view.viewTarget,
            upVector: view.upVector,
            viewFieldWidth: view.viewFieldWidth,
            viewFieldHeight: view.viewFieldHeight,
            perspective: view.perspective,
        }

        view.delete && view.delete()

        return obj
    }

    public clear() {
        const ctx = this.canvas.getContext('2d')

        if (ctx) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }
    }

    public editDots(x1: number, y1: number, x2: number, y2: number, ctx: any, drawingPath: DrawingPath, size: number) {
        const dots = new Path2D()
        ctx.fillStyle = drawingPath.color
        dots.rect(x1 - size, y1 - size, size * 2, size * 2)
        dots.rect(x2 - size, y1 - size, size * 2, size * 2)
        dots.rect(x1 - size, y2 - size, size * 2, size * 2)
        dots.rect(x2 - size, y2 - size, size * 2, size * 2)
        dots.rect((x1 + x2) / 2 - size, y1 - size, size * 2, size * 2)
        dots.rect((x1 + x2) / 2 - size, y2 - size, size * 2, size * 2)
        dots.rect(x1 - size, (y1 + y2) / 2 - size, size * 2, size * 2)
        dots.rect(x2 - size, (y1 + y2) / 2 - size, size * 2, size * 2)
        ctx.fill(dots)
    }

    public draw(drawingPath: DrawingPath) {
        const ctx = this.canvas.getContext('2d')
        if (ctx) {
            const adjust = this.adjust
            const screenHeight = this.canvas.height
            ctx.strokeStyle = drawingPath.color
            ctx.lineWidth = drawingPath.width * this.widthRatio * window.devicePixelRatio * (adjust.scale / MarkupPainter.tempScale) * 2
            ctx.setLineDash([])

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

            if (drawingPath.dash.length > 0) {
                ctx.lineCap = 'butt'
                ctx.lineJoin = 'miter'
                ctx.setLineDash(drawingPath.dash)
                ctx.strokeStyle = drawingPath.texts[0]
                ctx.lineWidth = 2 * window.devicePixelRatio
                const rect = new Path2D()
                const x = (drawingPath.area[0] + adjust.x) * adjust.scale
                const y = screenHeight - (drawingPath.area[1] + adjust.y) * adjust.scale
                const x1 = (drawingPath.area[2] + adjust.x) * adjust.scale
                const y1 = screenHeight - (drawingPath.area[3] + adjust.y) * adjust.scale
                const width = x1 - x
                const height = y1 - y

                rect.rect(x, y, width, height)
                ctx.stroke(rect)
                this.editDots(x, y, x1, y1, ctx, drawingPath, 1 * adjust.scale)
            }
        }
    }

    public rectDraw(drawingPath: DrawingPath) {
        const ctx = this.canvas.getContext('2d')
        if (ctx) {
            const adjust = this.adjust
            ctx.strokeStyle = drawingPath.color
            ctx.lineWidth = drawingPath.width * this.widthRatio * window.devicePixelRatio * (adjust.scale / MarkupPainter.tempScale) * 2
            const screenHeight = this.canvas.height

            const rect = new Path2D()
            const startX = drawingPath.values[0]
            const startY = drawingPath.values[1]
            const valX = drawingPath.values[2]
            const valY = drawingPath.values[3]

            const x = (startX + adjust.x) * adjust.scale
            const y = screenHeight - (startY + adjust.y) * adjust.scale
            const width = (valX + adjust.x) * adjust.scale - x
            const height = screenHeight - (valY + adjust.y) * adjust.scale - y
            // rect.moveTo(startX, startY)

            // for (let i = 0; i < drawingPath.values.length; i = i + 2) {
            //     const valX = drawingPath.values[i + 0]
            //     const valY = drawingPath.values[i + 1]

            //     const x = (valX + adjust.x) * adjust.scale
            //     const y = screenHeight - (valY + adjust.y) * adjust.scale

            // }
            ctx.setLineDash([])
            rect.rect(x, y, width, height)
            ctx.stroke(rect)
            if (drawingPath.dash.length !== 0) {
                ctx.strokeStyle = drawingPath.texts[2]
                ctx.lineCap = 'butt'
                ctx.lineJoin = 'miter'
                ctx.setLineDash(drawingPath.dash)
                ctx.lineWidth = 2 * window.devicePixelRatio
                const x = (drawingPath.area[0] + adjust.x) * adjust.scale
                const y = screenHeight - (drawingPath.area[1] + adjust.y) * adjust.scale
                const x1 = (drawingPath.area[2] + adjust.x) * adjust.scale
                const y1 = screenHeight - (drawingPath.area[3] + adjust.y) * adjust.scale
                const width = x1 - x
                const height = y1 - y
                rect.rect(x, y, width, height)
                ctx.stroke(rect)
                this.editDots(x, y, x1, y1, ctx, drawingPath, 1 * adjust.scale)
            }
        }
    }

    public circleDraw(drawingPath: DrawingPath) {
        const ctx = this.canvas.getContext('2d')
        if (ctx) {
            const adjust = this.adjust
            ctx.strokeStyle = drawingPath.color
            ctx.lineWidth = drawingPath.width * this.widthRatio * window.devicePixelRatio * (adjust.scale / MarkupPainter.tempScale) * 2
            const screenHeight = this.canvas.height
            ctx.setLineDash([])

            const circle = new Path2D()
            const startX = drawingPath.values[0]
            const startY = drawingPath.values[1]
            const valX = drawingPath.values[2]
            const valY = drawingPath.values[3]

            const x = (startX + adjust.x) * adjust.scale
            const y = screenHeight - (startY + adjust.y) * adjust.scale
            const centerX = (valX + adjust.x) * adjust.scale + x
            const centerY = screenHeight - (valY + adjust.y) * adjust.scale + y
            const width = (valX + adjust.x) * adjust.scale - x
            const height = screenHeight - (valY + adjust.y) * adjust.scale - y

            circle.ellipse(
                centerX / 2,
                centerY / 2,
                Math.abs(width / 2),
                Math.abs(height / 2),
                // Math.abs(height / 2),
                0,
                0,
                Math.PI * 2
            )
            ctx.stroke(circle)

            if (drawingPath.dash.length > 0) {
                ctx.lineCap = 'butt'
                ctx.lineJoin = 'miter'
                ctx.setLineDash(drawingPath.dash)
                ctx.strokeStyle = drawingPath.texts[2]
                ctx.lineWidth = 2 * window.devicePixelRatio
                const rect = new Path2D()
                const x = (drawingPath.area[0] + adjust.x) * adjust.scale
                const y = screenHeight - (drawingPath.area[1] + adjust.y) * adjust.scale
                const x1 = (drawingPath.area[2] + adjust.x) * adjust.scale
                const y1 = screenHeight - (drawingPath.area[3] + adjust.y) * adjust.scale
                const width = x1 - x
                const height = y1 - y

                rect.rect(x, y, width, height)
                ctx.stroke(rect)
                this.editDots(x, y, x + width, y + height, ctx, drawingPath, 1 * adjust.scale)
            }
        }
    }
    public textDraw(drawingPath: DrawingPath) {
        const ctx = this.canvas.getContext('2d')
        if (ctx) {
            const adjust = this.adjust
            ctx.fillStyle = drawingPath.color
            ctx.strokeStyle = drawingPath.color
            ctx.textAlign = drawingPath.texts[4] as CanvasTextAlign
            ctx.textBaseline = 'top'
            ctx.font = `${drawingPath.texts[1]} ${drawingPath.texts[2]} ${drawingPath.width * 0.2 * (adjust.scale / MarkupPainter.tempScale) * 2}px sans-serif`
            const screenHeight = this.canvas.height
            const startX = drawingPath.values[0]
            const startY = drawingPath.values[1]
            const x = (startX + adjust.x) * adjust.scale
            const y = screenHeight - (startY + adjust.y) * adjust.scale
            const height = drawingPath.width * 0.2 * adjust.scale * -1

            ctx.fillText(drawingPath.texts[0], x, y)

            let width = ctx.measureText(drawingPath.texts[0]).width
            if (drawingPath.texts[3] === 'underline') {
                ctx.setLineDash([])
                ctx.beginPath()
                ctx.lineWidth = (drawingPath.width * 0.2 * adjust.scale) / 15
                ctx.moveTo(x, y - height)
                let underLineX
                // if (ctx.textAlign === "left") {
                underLineX = x + width
                // } else if (ctx.textAlign === "center") {
                //     underLineX = x - width / 2;
                //     ctx.moveTo(underLineX, y);
                //     underLineX = x + width / 2;
                // } else {
                //     underLineX = x - width;
                // }
                ctx.lineTo(underLineX, y - height)
                ctx.stroke()
            }

            if (drawingPath.dash.length > 0) {
                ctx.lineCap = 'butt'
                ctx.lineJoin = 'miter'
                ctx.setLineDash(drawingPath.dash)
                ctx.strokeStyle = drawingPath.texts[5]
                ctx.lineWidth = 2 * window.devicePixelRatio
                const rect = new Path2D()
                const x = (drawingPath.area[0] + adjust.x) * adjust.scale
                const y = screenHeight - (drawingPath.area[3] + adjust.y) * adjust.scale
                drawingPath.area[2] = drawingPath.area[0] + width / adjust.scale
                drawingPath.area[1] = drawingPath.area[3] - +drawingPath.width * 0.2
                rect.rect(x, y, width, -height)
                ctx.stroke(rect)
            }
            return width
        }
    }

    public singleLine(x1: number, y1: number, x2: number, y2: number, width: number, color: string) {
        const ctx = this.canvas.getContext('2d')
        if (ctx) {
            const adjust = this.adjust
            const screenHeight = this.canvas.height

            ctx.strokeStyle = color
            ctx.lineWidth = width * this.widthRatio * window.devicePixelRatio * (adjust.scale / MarkupPainter.tempScale) * 2
            ctx.lineCap = 'butt'
            ctx.lineJoin = 'miter'
            ctx.setLineDash([2, 2])

            const line = new Path2D()
            let valX = x1
            let valY = y1

            let x = (valX + adjust.x) * adjust.scale
            let y = screenHeight - (valY + adjust.y) * adjust.scale

            line.moveTo(x, y)

            valX = x2
            valY = y2

            x = (valX + adjust.x) * adjust.scale
            y = screenHeight - (valY + adjust.y) * adjust.scale

            line.lineTo(x, y)
            ctx.stroke(line)
        }
    }
    public lineDraw(drawingPath: DrawingPath) {
        const ctx = this.canvas.getContext('2d')

        if (ctx) {
            const adjust = this.adjust
            const screenHeight = this.canvas.height

            ctx.strokeStyle = drawingPath.color
            ctx.lineWidth = drawingPath.width * this.widthRatio * window.devicePixelRatio * (adjust.scale / MarkupPainter.tempScale) * 2
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'

            ctx.setLineDash([])

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
            if (drawingPath.dash.length > 0) {
                ctx.strokeStyle = drawingPath.texts[1]
                ctx.lineWidth = 2 * window.devicePixelRatio
                ctx.lineCap = 'butt'
                ctx.lineJoin = 'miter'
                ctx.setLineDash(drawingPath.dash)
                const rect = new Path2D()
                const x = (drawingPath.area[0] + adjust.x) * adjust.scale
                const y = screenHeight - (drawingPath.area[1] + adjust.y) * adjust.scale
                const x1 = (drawingPath.area[2] + adjust.x) * adjust.scale
                const y1 = screenHeight - (drawingPath.area[3] + adjust.y) * adjust.scale
                const width = x1 - x
                const height = y1 - y

                rect.rect(x, y, width, height)
                ctx.stroke(rect)
                this.editDots(x, y, x + width, y + height, ctx, drawingPath, 1 * adjust.scale)
            }
        }
    }

    public singleCloud(x1: number, y1: number, x2: number, y2: number, width: number, color: string, dir: string, size: string) {
        const ctx = this.canvas.getContext('2d')
        if (ctx) {
            const adjust = this.adjust
            const screenHeight = this.canvas.height

            ctx.strokeStyle = color
            ctx.lineWidth = width * this.widthRatio * window.devicePixelRatio * (adjust.scale / MarkupPainter.tempScale) * 2
            ctx.setLineDash([2, 2])

            const line = new Path2D()

            const distance = (x1: number, y1: number, x2: number, y2: number) => {
                const dis = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
                return dis
            }

            const x = (x1 + adjust.x) * adjust.scale
            const y = screenHeight - (y1 + adjust.y) * adjust.scale

            const nx = (x2 + adjust.x) * adjust.scale
            const ny = screenHeight - (y2 + adjust.y) * adjust.scale

            const dist = distance(x, y, nx, ny)
            let radius = (size === 'wide' ? 20 : size === 'normal' ? 10 : 5) * adjust.scale
            let cnt = Math.trunc(dist / (radius * 2))
            if (cnt === 0) {
                radius = dist / 2
                cnt = 1
            } else radius = dist / cnt / 2

            for (let i = 0; i < cnt; i++) {
                const radian = Math.atan((ny - y) / (nx - x))
                const cx = x + ((nx - x) / (cnt * 2)) * (1 + i * 2)
                const cy = y + ((ny - y) / (cnt * 2)) * (1 + i * 2)
                let sa = nx - x < 0 ? radian : radian + Math.PI
                let ea = nx - x < 0 ? radian + Math.PI : radian
                let ac = cx * cy > 0 ? true : false
                if (dir === 'cw') ac = !ac
                // ac = !ac;
                line.arc(cx, cy, radius, sa, ea, ac)
            }

            ctx.stroke(line)
        }
    }

    public cloudDraw(drawingPath: DrawingPath) {
        const ctx = this.canvas.getContext('2d')

        if (ctx) {
            if (drawingPath.values.length === 0) return
            const adjust = this.adjust
            const screenHeight = this.canvas.height

            ctx.strokeStyle = drawingPath.color
            ctx.lineWidth = drawingPath.width * this.widthRatio * window.devicePixelRatio * (adjust.scale / MarkupPainter.tempScale) * 2
            ctx.lineCap = 'butt'
            ctx.lineJoin = 'miter'
            ctx.setLineDash([])

            const line = new Path2D()

            const distance = (x1: number, y1: number, x2: number, y2: number) => {
                const dis = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
                return dis
            }
            for (let i = 2; i < drawingPath.values.length - 1; i = i + 2) {
                const valX = drawingPath.values[i - 2]
                const valY = drawingPath.values[i - 1]

                const x = (valX + adjust.x) * adjust.scale
                const y = screenHeight - (valY + adjust.y) * adjust.scale

                const valX1 = drawingPath.values[i + 0]
                const valY1 = drawingPath.values[i + 1]

                const x1 = (valX1 + adjust.x) * adjust.scale
                const y1 = screenHeight - (valY1 + adjust.y) * adjust.scale
                // line.moveTo(x, y);
                // line.lineTo(x1, y1);
                // line.arcTo(x, y, x1, y1, distance(x, y, x1, y1) / 2);

                const dist = distance(x, y, x1, y1)
                let radius = (drawingPath.texts[2] === 'wide' ? 20 : drawingPath.texts[2] === 'normal' ? 10 : 5) * adjust.scale
                let cnt = Math.trunc(dist / (radius * 2))
                if (cnt === 0) {
                    radius = dist / 2
                    cnt = 1
                } else radius = dist / cnt / 2

                for (let i = 0; i < cnt; i++) {
                    const radian = Math.atan((y1 - y) / (x1 - x))
                    const cx = x + ((x1 - x) / (cnt * 2)) * (1 + i * 2)
                    const cy = y + ((y1 - y) / (cnt * 2)) * (1 + i * 2)
                    let sa = x1 - x < 0 ? radian : radian + Math.PI
                    let ea = x1 - x < 0 ? radian + Math.PI : radian
                    let ac = cx * cy > 0 ? true : false
                    if (drawingPath.texts[1] === 'cw') ac = !ac
                    line.arc(cx, cy, radius, sa, ea, ac)
                }
            }

            ctx.stroke(line)

            if (drawingPath.dash.length > 0) {
                ctx.strokeStyle = drawingPath.texts[3]
                ctx.lineWidth = 2 * window.devicePixelRatio
                ctx.lineCap = 'butt'
                ctx.lineJoin = 'miter'
                ctx.setLineDash(drawingPath.dash)
                const rect = new Path2D()
                const x = (drawingPath.area[0] + adjust.x) * adjust.scale
                const y = screenHeight - (drawingPath.area[1] + adjust.y) * adjust.scale
                const x1 = (drawingPath.area[2] + adjust.x) * adjust.scale
                const y1 = screenHeight - (drawingPath.area[3] + adjust.y) * adjust.scale
                const width = x1 - x
                const height = y1 - y

                rect.rect(x, y, width, height)
                ctx.stroke(rect)
                this.editDots(x, y, x + width, y + height, ctx, drawingPath, 1 * adjust.scale)
            }
        }
    }
}
