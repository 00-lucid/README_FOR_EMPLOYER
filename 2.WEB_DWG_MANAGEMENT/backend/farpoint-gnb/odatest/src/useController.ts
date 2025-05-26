import React from 'react'

export function useController(viewer: any, lib: any, documentCanvas: HTMLCanvasElement) {
    const [controller, setController] = React.useState<CanvasController>()

    React.useEffect(() => {
        let controller_: CanvasController | undefined

        if (viewer && lib) {
            controller_ = new SelectCanvasController(viewer, lib, documentCanvas)
            setController(controller_)
        }

        return () => {
            if (controller_) {
                controller_.release()
            }
        }
    }, [lib, viewer, documentCanvas])

    return controller
}

export type ViewParams = {
    position: any
    target: any
    upVector: any
    viewFieldWidth: any
    viewFieldHeight: any
    perspective: any
}

export class Point {
    public readonly x: number
    public readonly y: number

    private constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    public static create(x: number, y: number) {
        return new Point(x, y)
    }

    public distance(pt: Point) {
        var a = this.x - pt.x
        var b = this.y - pt.y

        return Math.sqrt(a * a + b * b)
    }

    public static zero = new Point(0, 0)
}

export abstract class CanvasController {
    protected viewer: any
    protected lib: any
    protected canvas: HTMLCanvasElement

    private isDrag: boolean
    private startScreenPos: Point
    private touchMoveEvent: any

    public constructor(viewer: any, canvas: HTMLCanvasElement, lib: any) {
        this.viewer = viewer
        this.canvas = canvas
        this.lib = lib
        this.isDrag = false
        this.startScreenPos = Point.zero

        this.mousedownHandler = this.mousedownHandler.bind(this)
        this.mouseupHandler = this.mouseupHandler.bind(this)
        // this.mouseleaveHandler = this.mouseleaveHandler.bind(this)
        this.mousemoveHandler = this.mousemoveHandler.bind(this)
        this.touchstartHandler = this.touchstartHandler.bind(this)
        this.touchendHandler = this.touchendHandler.bind(this)
        // this.touchcancelHandler = this.touchcancelHandler.bind(this)
        this.touchmoveHandler = this.touchmoveHandler.bind(this)
        this.dblclickHandler = this.dblclickHandler.bind(this)
        this.wheelHandler = this.wheelHandler.bind(this)

        this.canvas.addEventListener('mousedown', this.mousedownHandler)
        this.canvas.addEventListener('mouseup', this.mouseupHandler)
        this.canvas.addEventListener('mousemove', this.mousemoveHandler)
        this.canvas.addEventListener('touchstart', this.touchstartHandler)
        this.canvas.addEventListener('touchend', this.touchendHandler)
        this.canvas.addEventListener('touchmove', this.touchmoveHandler)
        this.canvas.addEventListener('dblclick', this.dblclickHandler)
        this.canvas.addEventListener('wheel', this.wheelHandler)
    }

    protected onClick(x: number, y: number) {}
    protected onDragStart(point: any) {}
    protected onDrag(point: any) {}
    protected onDragEnd(point: any) {}

    public release(): void {
        this.canvas.removeEventListener('mousedown', this.mousedownHandler)
        this.canvas.removeEventListener('mouseup', this.mouseupHandler)
        this.canvas.removeEventListener('mousemove', this.mousemoveHandler)
        this.canvas.removeEventListener('touchstart', this.touchstartHandler)
        this.canvas.removeEventListener('touchend', this.touchendHandler)
        this.canvas.removeEventListener('touchmove', this.touchmoveHandler)
        this.canvas.removeEventListener('dblclick', this.dblclickHandler)
        this.canvas.removeEventListener('wheel', this.wheelHandler)
    }

    public zoomExtents(): void {
        const params = this.getViewParams()
        const modelSize = this.modelSize()
        const screenSize = { width: this.canvas.width, height: this.canvas.height }

        const viewRatio = params.viewFieldWidth / params.viewFieldHeight
        const modelRatio = modelSize.width / modelSize.height

        if (viewRatio < modelRatio) {
            params.viewFieldWidth = modelSize.width * 1.05
            const ratio = screenSize.width / params.viewFieldWidth
            params.viewFieldHeight = screenSize.height / ratio
        } else {
            params.viewFieldHeight = modelSize.height * 1.05
            const ratio = screenSize.height / params.viewFieldHeight
            params.viewFieldWidth = screenSize.width / ratio
        }

        params.position[0] = modelSize.width / 2
        params.position[1] = modelSize.height / 2
        params.target[0] = modelSize.width / 2
        params.target[1] = modelSize.height / 2

        this.setViewParams(params)
    }

    public setViewParams(params: any | undefined) {
        if (params) {
            // const extView = this.viewer.getActiveTvExtendedView()
            const extView = this.lib.getViewer().getActiveTvExtendedView()

            extView.setView(
                params.position,
                params.target,
                params.upVector,
                params.viewFieldWidth,
                params.viewFieldHeight,
                params.perspective
            )

            extView.delete && extView.delete()
        }
    }

    public getViewParams(): any {
        const view = this.viewer.activeView

        return {
            position: view.viewPosition,
            target: view.viewTarget,
            upVector: view.upVector,
            viewFieldWidth: view.viewFieldWidth,
            viewFieldHeight: view.viewFieldHeight,
            perspective: view.perspective
        }
    }

    public modelSize(): { width: number; height: number } {
        const val = this.viewer.getActiveExtents()
        const size = val.max()

        return { width: size[0], height: size[1] }
    }

    private relativeCoords(event: any): any {
        if (event) {
            const bounds = event.target.getBoundingClientRect()
            event.touches && event.touches[0] && (event = event.touches[0])
            const x = event.clientX - bounds.left
            const y = event.clientY - bounds.top

            return { x: x * window.devicePixelRatio, y: y * window.devicePixelRatio }
        }

        return { x: 0, y: 0 }
    }

    private mousedownHandler(event: MouseEvent) {
        const relCoord = this.relativeCoords(event)
        this.start(relCoord.x, relCoord.y)
    }

    private touchstartHandler(event: TouchEvent) {
        if (event.touches.length === 1) {
            const relCoord = this.relativeCoords(event)
            this.start(relCoord.x, relCoord.y)
        }

        this.touchMoveEvent = event
    }

    private start(x: number, y: number) {
        this.isDrag = true

        this.startScreenPos = Point.create(x, y)
        const point = this.screenToWorld(x, y)

        // const urlParams = new URLSearchParams(window.location.search)
        // const frame = urlParams.get('frame')

        // if (frame) {
        //     const view = this.viewer.activeView

        //     if (view['beginInteractivity']) {
        //         view.beginInteractivity(parseInt(frame))
        //     }
        //     view.delete()
        // }

        this.onDragStart(point)
    }

    private mouseupHandler(event: MouseEvent) {
        const relCoord = this.relativeCoords(event)

        if (this.isClick(relCoord.x, relCoord.y)) {
            this.onClick(relCoord.x, relCoord.y)
        }

        this.end(relCoord.x, relCoord.y)
    }

    private touchendHandler(event: TouchEvent) {
        if (event.touches.length === 0 && this.touchMoveEvent && 0 < this.touchMoveEvent.touches.length) {
            const relCoord = this.relativeCoords(this.touchMoveEvent)

            if (this.isClick(relCoord.x, relCoord.y)) {
                this.onClick(relCoord.x, relCoord.y)
            }

            this.end(relCoord.x, relCoord.y)
        }
    }

    private end(x: number, y: number) {
        const point = this.screenToWorld(x, y)

        if (this.isDrag) {
            this.onDragEnd(point)
            this.isDrag = false

            // const urlParams = new URLSearchParams(window.location.search)
            // const frame = urlParams.get('frame')

            // if (frame) {
            //     const view = this.viewer.activeView

            //     if (view['endInteractivity']) {
            //         view.endInteractivity()

            //         const device = this.viewer.getActiveDevice()
            //         const canvas = this.canvas
            //         device.invalidate([0, 0, canvas.width, canvas.height])
            //         device.delete()
            //     }

            //     view.delete()
            // }
        }
    }

    private mousemoveHandler(event: MouseEvent) {
        const relCoord = this.relativeCoords(event)
        this.move(relCoord.x, relCoord.y)
    }

    protected onZoom(k: number, x: number, y: number) {
        const params = this.getViewParams()

        const deltaX = params.viewFieldWidth * k
        const deltaY = params.viewFieldHeight * k
        params.viewFieldWidth = params.viewFieldWidth + deltaX
        params.viewFieldHeight = params.viewFieldHeight + deltaY

        const moveX = (x - this.canvas.width / 2) / (this.canvas.width / 2)
        const moveY = (y - this.canvas.height / 2) / (this.canvas.height / 2)

        const originX = params.position[0]
        const originY = params.position[1]

        params.position[0] = originX - (moveX * deltaX) / 2
        params.position[1] = originY + (moveY * deltaY) / 2
        params.target[0] = originX - (moveX * deltaX) / 2
        params.target[1] = originY + (moveY * deltaY) / 2

        this.setViewParams(params)
    }

    private touchmoveHandler(event: TouchEvent) {
        if (event.touches.length === 1) {
            const relCoord = this.relativeCoords(event)
            this.move(relCoord.x, relCoord.y)
        } else if (event.touches.length === 2 && this.touchMoveEvent.touches.length === 2) {
            const distance = this.touchDistance(this.touchMoveEvent) - this.touchDistance(event)
            const k = distance * 0.005

            const relCoord = this.relativeCoords(event)

            this.onZoom(k, relCoord.x, relCoord.y)
        }

        this.touchMoveEvent = event
    }

    private wheelHandler(event: WheelEvent) {
        event = event || window.event

        const ZOOM_SPEED = 0.075
        const sign = Math.sign(event.deltaY)
        const k = ZOOM_SPEED * sign

        const relCoord = this.relativeCoords(event)

        this.onZoom(k, relCoord.x, relCoord.y)
    }

    private touchDistance(event: TouchEvent): number {
        if (event.touches.length !== 2) return 0

        const touch1 = event.touches[0]
        const touch2 = event.touches[1]
        const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)

        return distance
    }

    private dblclickHandler(event: MouseEvent) {}

    private move(x: number, y: number) {
        if (this.isDrag) {
            const endPos = this.screenToWorld(x, y)

            this.onDrag(endPos)
        }
    }

    private isClick(x: number, y: number): boolean {
        const delta = this.startScreenPos.distance(Point.create(x, y))

        return delta < 5
    }

    protected screenToWorld(x: number, y: number): any {
        const gePoint = this.viewer.screenToWorld(x, y)

        return this.lib.Point3d.createFromArray(gePoint)
    }
}

export class SelectCanvasController extends CanvasController {
    public constructor(viewer: any, lib: any, canvas: HTMLCanvasElement) {
        super(viewer, canvas, lib)
    }

    private startPos: any

    protected onDragStart(point: any) {
        this.startPos = point
    }

    protected onDrag(point: any): void {
        const { Vector3d } = this.lib
        const params = this.getViewParams()

        const delta = this.startPos.sub(point).asVector()

        const target = Vector3d.createFromArray(params.target)
        const targetWithDelta = target.add(delta)
        params.target = targetWithDelta.toArray()

        const position = Vector3d.createFromArray(params.position)
        const positionWithDelta = position.add(delta)
        params.position = positionWithDelta.toArray()

        this.setViewParams(params)
    }
}
