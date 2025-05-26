import { MarkupPainter } from './MarkupPainter'
import { Point, getEntities } from '../../Lib/canvasUtils'
import { global } from '../../Lib/util'

export abstract class CanvasController {
    protected viewer: any
    protected lib: any
    protected canvas: HTMLCanvasElement

    private isDrag: boolean
    private startScreenPos: Point
    private touchMoveEvent: any

    protected onViewParamsChange: (params: ViewParams) => void

    public constructor(viewer: any, canvas: HTMLCanvasElement, lib: any, onViewParamsChange: (params: ViewParams) => void) {
        this.viewer = viewer
        this.canvas = canvas
        this.lib = lib
        this.isDrag = false
        this.startScreenPos = Point.zero
        this.onViewParamsChange = onViewParamsChange

        this.mousedownHandler = this.mousedownHandler.bind(this)
        this.mouseupHandler = this.mouseupHandler.bind(this)
        this.mouseleaveHandler = this.mouseleaveHandler.bind(this)
        this.mousemoveHandler = this.mousemoveHandler.bind(this)
        this.touchstartHandler = this.touchstartHandler.bind(this)
        this.touchendHandler = this.touchendHandler.bind(this)
        this.touchcancelHandler = this.touchcancelHandler.bind(this)
        this.touchmoveHandler = this.touchmoveHandler.bind(this)
        this.dblclickHandler = this.dblclickHandler.bind(this)
        this.wheelHandler = this.wheelHandler.bind(this)
        this.keyDownHandler = this.keyDownHandler.bind(this)
        this.keyUpHandler = this.keyUpHandler.bind(this)

        this.canvas.addEventListener('mousedown', this.mousedownHandler, { passive: false })
        this.canvas.addEventListener('mouseup', this.mouseupHandler, { passive: false })
        // this.canvas.addEventListener('mouseleave', this.mouseleaveHandler, { passive: false })
        this.canvas.addEventListener('mousemove', this.mousemoveHandler, { passive: false })
        this.canvas.addEventListener('touchstart', this.touchstartHandler)
        this.canvas.addEventListener('touchend', this.touchendHandler, { passive: false })
        // this.canvas.addEventListener('touchcancel', this.touchcancelHandler, { passive: false })
        this.canvas.addEventListener('touchmove', this.touchmoveHandler, { passive: false })
        this.canvas.addEventListener('dblclick', this.dblclickHandler, { passive: false })
        this.canvas.addEventListener('wheel', this.wheelHandler, { passive: false })
        window.addEventListener('keydown', this.keyDownHandler, { passive: false })
        window.addEventListener('keyup', this.keyUpHandler, { passive: false })
    }

    protected onClick(x: number, y: number) {}
    protected onMouseOver(x: number, y: number) {}
    protected onDragStart(point: any) {}
    protected onDrag(point: any) {}
    protected onDragEnd(point: any) {}
    protected onKeyDown(e: any) {}
    protected onKeyUp(e: any) {}
    protected onComplete(str?: string) {}
    protected onShift(str?: string) {}
    protected onDelete() {}

    public release(): void {
        this.canvas.removeEventListener('mousedown', this.mousedownHandler)
        this.canvas.removeEventListener('mouseup', this.mouseupHandler)
        // this.canvas.removeEventListener('mouseleave', this.mouseleaveHandler)
        this.canvas.removeEventListener('mousemove', this.mousemoveHandler)
        this.canvas.removeEventListener('touchstart', this.touchstartHandler)
        this.canvas.removeEventListener('touchend', this.touchendHandler)
        // this.canvas.removeEventListener('touchcancel', this.touchcancelHandler)
        this.canvas.removeEventListener('touchmove', this.touchmoveHandler)
        this.canvas.removeEventListener('dblclick', this.dblclickHandler)
        this.canvas.removeEventListener('wheel', this.wheelHandler)
        window.removeEventListener('keydown', this.keyDownHandler)
        window.removeEventListener('keyup', this.keyUpHandler)
    }

    public redraw(): void {
        const params = MarkupPainter.getViewParams(this.viewer)

        if (params) {
            const extView = this.viewer.getActiveTvExtendedView()

            extView.setView(
                params.position,
                params.target,
                params.upVector,
                params.viewFieldWidth,
                params.viewFieldHeight,
                params.perspective
            )
        }
    }

    public zoomExtents(): void {
        global.log('zoomExtents:::')
        const params = MarkupPainter.getViewParams(this.viewer)
        const modelSize = MarkupPainter.modelSize(this.viewer)
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

    public zoomEntity(handles: string[]) {
        const entities = getEntities(this.viewer, handles)
        const modelSize = MarkupPainter.modelSize(this.viewer)

        if (0 < entities.length) {
            const center: number[] = [0, 0]
            const max: number[] = [0, 0]
            const min: number[] = [modelSize.width * 2, 0]

            for (const entity of entities) {
                const entityId = entity
                if (entityId !== undefined) {
                    let extents: any

                    if (entityId.getType() === 1) {
                        const entity = entityId.openObject()

                        extents = entity.getExtents()
                    } else if (entityId.getType() === 2) {
                        const entity = entityId.openObjectAsInsert()

                        extents = entity.getExtents().ext
                    }

                    const extentsCenter = extents.center()
                    center[0] += extentsCenter[0]
                    center[1] += extentsCenter[1]

                    const extentsMax = extents.max()
                    const extentsMin = extents.min()

                    if (max[0] < extentsMax[0]) {
                        max[0] = extentsMax[0]
                    }

                    if (min[0] > extentsMin[0]) {
                        min[0] = extentsMin[0]
                    }
                }
                const screenSize = { width: this.canvas.width, height: this.canvas.height }

                let viewWidth
                const deltaX = max[0] - min[0]
                if (modelSize.width * 0.05 > deltaX) {
                    viewWidth = modelSize.width / 5
                    //viewWidth = modelSize.width / 4
                } else if (modelSize.width * 0.1 > deltaX) {
                    viewWidth = deltaX * 10
                    //viewWidth = deltaX * 8
                } else if (modelSize.width * 0.2 < deltaX) {
                    viewWidth = deltaX * 4
                    //viewWidth = deltaX * 3
                } else {
                    viewWidth = deltaX * 3
                    //viewWidth = deltaX * 2
                }

                const ratio = screenSize.width / viewWidth
                const viewHeight = screenSize.height / ratio

                const params = MarkupPainter.getViewParams(this.viewer)
                params.viewFieldWidth = viewWidth
                params.viewFieldHeight = viewHeight
                params.position[0] = center[0] / entities.length
                params.position[1] = center[1] / entities.length
                params.target[0] = center[0] / entities.length
                params.target[1] = center[1] / entities.length

                this.setViewParams(params)
            }
        }
    }

    public setViewParams(params: any | undefined) {
        if (params) {
            const extView = this.viewer.getActiveTvExtendedView()

            extView.setView(
                params.position,
                params.target,
                params.upVector,
                params.viewFieldWidth,
                params.viewFieldHeight,
                params.perspective
            )

            extView.delete && extView.delete()

            this.onViewParamsChange(params)
        }
    }

    public getViewParams(): any {
        return MarkupPainter.getViewParams(this.viewer)
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

    private keyDownHandler(event: KeyboardEvent) {
        const keyDown = event.key
        if (keyDown === 'Escape') this.complete()
        else if (keyDown === 'Shift') this.shift('shift')
        else if (keyDown === 'Delete') this.delete()
    }
    private keyUpHandler(event: KeyboardEvent) {
        const keyDown = event.key
        if (keyDown === 'Shift') this.shift('')
    }

    private complete() {
        this.onComplete()
    }

    private shift(str?: string) {
        this.onShift(str)
    }

    private delete() {
        this.onDelete()
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

        this.onDragStart(point)

        const view = this.viewer.activeView
        if (view['beginInteractivity']) {
            view.beginInteractivity(15)
        }
        view.delete()
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

            const view = this.viewer.activeView
            if (view['endInteractivity']) {
                view.endInteractivity()
                const device = this.viewer.getActiveDevice()
                device.invalidate([0, 0, this.canvas.width, this.canvas.height])
                device.delete()
                view.delete()
            }
        }
    }

    private mouseleaveHandler(event: MouseEvent) {
        const relCoord = this.relativeCoords(event)
        this.end(relCoord.x, relCoord.y)
    }
    private touchcancelHandler(event: TouchEvent) {
        const relCoord = this.relativeCoords(event)
        this.end(relCoord.x, relCoord.y)
    }

    private mousemoveHandler(event: MouseEvent) {
        const relCoord = this.relativeCoords(event)
        this.move(relCoord.x, relCoord.y)
    }

    protected onZoom(k: number, x: number, y: number) {
        const params = MarkupPainter.getViewParams(this.viewer)

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
        } else {
            this.onMouseOver(x, y)
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
    private registeredHandles: Set<string> | undefined
    private onMouseOverHandler: (handles: string[]) => void
    private onSelectHandle: (handles: string[], x: number, y: number) => void

    private equipmentsByHandle: Map<string, EquipmentContext[]>

    public constructor(
        viewer: any,
        lib: any,
        canvas: HTMLCanvasElement,
        onViewParamsChange: (params: ViewParams) => void,
        onMouseOverHandler: (handles: string[]) => void,
        registeredHandles: Set<string> | undefined,
        onSelectHandle: (handles: string[], x: number, y: number) => void,
        equipmentsByHandle: Map<string, EquipmentContext[]>
    ) {
        super(viewer, canvas, lib, onViewParamsChange)
        this.registeredHandles = registeredHandles
        this.onMouseOverHandler = onMouseOverHandler
        this.onSelectHandle = onSelectHandle
        this.equipmentsByHandle = equipmentsByHandle
    }

    protected onClick(x: number, y: number) {
        const handles = this.getHandles(x, y)
        global.log('CanvasController/ onClick', handles)
        this.onSelectHandle(handles, x / window.devicePixelRatio, y / window.devicePixelRatio)
    }
    protected onMouseOver(x: number, y: number) {
        const handles = this.getHandles(x, y)

        /**
            만약 좌표의 핸들값이 지능화된 설비에 포함되어 있다면
            지능화된 설비에 포함된 다른 모든 핸들값도 가져와야 됨 
        */
        const targetEquipment = this.equipmentsByHandle.get(handles[0])

        if (targetEquipment) {
            const equipmentHandles = targetEquipment[0].handles.map((equipmentHandle) => equipmentHandle.handle)

            this.onMouseOverHandler(equipmentHandles)
            return
        }

        this.onMouseOverHandler(handles)
    }

    private startPos: any

    protected onDragStart(point: any) {
        this.startPos = point
    }

    protected onDrag(point: any): void {
        const delta = this.startPos.sub(point).asVector()

        const { Vector3d } = this.lib
        const params = MarkupPainter.getViewParams(this.viewer)

        let target = Vector3d.createFromArray(params.target)
        target = target.add(delta)
        params.target = target.toArray()

        let position = Vector3d.createFromArray(params.position)
        position = position.add(delta)
        params.position = position.toArray()
        this.setViewParams(params)

        target.delete()
        position.delete()
    }
    protected getHandles(x: number, y: number): string[] {
        const tolerances = [1, 3, 6, 10]

        for (const tolerance of tolerances) {
            //global.log('tolerance:', tolerance)
            this.viewer.select(
                x - tolerance * window.devicePixelRatio,
                y + tolerance * window.devicePixelRatio,
                x + tolerance * window.devicePixelRatio,
                y - tolerance * window.devicePixelRatio
            )

            const pSelected = this.viewer.getSelected()

            const handles: string[] = []

            if (!pSelected.isNull() && pSelected.numItems() !== 0) {
                const itr = pSelected.getIterator()
                while (!itr.done()) {
                    const entityId = itr.getEntity()

                    if (entityId.getType() === 1) {
                        const handle = entityId.openObject().getNativeDatabaseHandle()

                        if (this.registeredHandles)
                            if (this.registeredHandles.has(handle)) {
                                handles.push(handle)
                            }
                    } else if (entityId.getType() === 2) {
                        const handle = entityId.openObjectAsInsert().getNativeDatabaseHandle()
                        if (this.registeredHandles)
                            if (this.registeredHandles.has(handle)) {
                                handles.push(handle)
                            }
                    }

                    itr.step()
                }
            }

            this.viewer.unselect()

            // mouseover로 나오는 핸들은 하나만, 마지막 것을 리턴하는 것은 겹쳐있는 경우 뒤에 것이 위에 있기 때문
            if (0 < handles.length) {
                return [handles[handles.length - 1]]
            }
        }

        return []
    }
}

export class MarkupCanvasController extends CanvasController {
    private onMarkupStart: (x: number, y: number) => void
    private onMarkupDraw: (x: number, y: number) => void
    private setMarkupChanged: () => void
    private currentPath: any
    private undoList: any
    private setUndoList: (value: any) => void
    private setRedoList: (value: any) => void

    public constructor(
        viewer: any,
        lib: any,
        canvas: HTMLCanvasElement,
        onViewParamsChange: (params: ViewParams) => void,
        currentPath: any,
        undoList: any,
        setUndoList: (value: any) => void,
        setRedoList: (value: any) => void,
        onMarkupStart: (x: number, y: number) => void,
        onMarkupDraw: (x: number, y: number) => void,
        setMarkupChanged: () => void
    ) {
        super(viewer, canvas, lib, onViewParamsChange)
        this.onMarkupStart = onMarkupStart
        this.onMarkupDraw = onMarkupDraw
        this.setMarkupChanged = setMarkupChanged
        this.currentPath = currentPath
        this.undoList = undoList
        this.setUndoList = setUndoList
        this.setRedoList = setRedoList
    }

    protected onDragStart(point: any) {
        this.onMarkupStart(point.x, point.y)
    }

    protected onDrag(point: any) {
        this.onMarkupDraw(point.x, point.y)
    }

    protected onDragEnd(point: any): void {
        const path = JSON.parse(JSON.stringify(this.currentPath.at(-1)))
        this.setUndoList([...this.undoList, path])
        this.setRedoList([])
        this.setMarkupChanged()
    }
}

export class EraseCanvasController extends CanvasController {
    private markupPaths: DrawingPath[]
    private onMarkupErase: (updateCurrentPath: DrawingPath[]) => void
    private undoList: any
    private setUndoList: (value: DrawingPath[]) => void
    private setRedoList: (value: DrawingPath[]) => void
    private setMarkupChanged: (value: boolean) => void

    public constructor(
        viewer: any,
        lib: any,
        canvas: HTMLCanvasElement,
        onViewParamsChange: (params: ViewParams) => void,
        markupPaths: DrawingPath[],
        onMarkupErase: (updateCurrentPath: DrawingPath[]) => void,
        undoList: any,
        setUndoList: (value: DrawingPath[]) => void,
        setRedoList: (value: DrawingPath[]) => void,
        setMarkupChanged: (value: boolean) => void
    ) {
        super(viewer, canvas, lib, onViewParamsChange)
        this.markupPaths = markupPaths
        this.onMarkupErase = onMarkupErase
        this.undoList = undoList
        this.setUndoList = setUndoList
        this.setRedoList = setRedoList
        this.setMarkupChanged = setMarkupChanged
    }

    protected onDragStart(point: any) {
        this.prevX = point.x
        this.prevY = point.y
    }

    protected onDrag(point: any) {
        this.removePath(point.x, point.y)
        this.prevX = point.x
        this.prevY = point.y
    }

    protected onDragEnd(point: any): void {
        this.setMarkupChanged(true)
    }

    private prevX: number = 0
    private prevY: number = 0

    private removePath = (x: number, y: number) => {
        const scale = MarkupPainter.getScale(this.viewer, this.canvas)
        const defaultEraseSize = 10 * window.devicePixelRatio

        let isErased = false
        let tempArr = JSON.parse(JSON.stringify(this.markupPaths))

        for (let i = 0; i < tempArr.length; i++) {
            const path = this.markupPaths[i]
            const tempPath = tempArr[i]
            if (path) {
                for (let k = 0; k < path.values.length; k = k + 2) {
                    if(isErased) break
                    const pointX = path.values[k + 0]
                    const pointY = path.values[k + 1]

                    const a = x - pointX
                    const b = y - pointY
                    const distance = Math.sqrt(a * a + b * b) * scale

                    if (distance < defaultEraseSize) {
                        tempPath.cmd = 'delete'
                        this.setUndoList([...this.undoList, tempPath])
                        this.setRedoList([])
                        tempArr.splice(i, 1)
                        // this.markupPaths.splice(i, 1)
                        isErased = true
                        i--
                    } else if (k + 3 < path.values.length) {
                        const pointX2 = path.values[k + 2]
                        const pointY2 = path.values[k + 3]

                        if (this.intersects(this.prevX, this.prevY, x, y, pointX, pointY, pointX2, pointY2)) {
                            tempPath.cmd = 'delete'
                            this.setUndoList([...this.undoList, tempPath])
                            this.setRedoList([])
                            tempArr.splice(i, 1)
                            // this.markupPaths.splice(i, 1)
                            isErased = true
                            i--
                        } else if (path && path.type === 'rect') {
                            if (
                                this.intersects(this.prevX, this.prevY, x, y, pointX, pointY, pointX, pointY2) ||
                                this.intersects(this.prevX, this.prevY, x, y, pointX, pointY2, pointX2, pointY2) ||
                                this.intersects(this.prevX, this.prevY, x, y, pointX2, pointY2, pointX2, pointY) ||
                                this.intersects(this.prevX, this.prevY, x, y, pointX2, pointY, pointX, pointY)
                            ) {
                                tempPath.cmd = 'delete'
                                this.setUndoList([...this.undoList, tempPath])
                                this.setRedoList([])
                                tempArr.splice(i, 1)
                                // this.markupPaths.splice(i, 1)
                                isErased = true
                                i--
                            }
                        }
                    } else if (path.values.length === 2) {
                        if (path && path.type === 'text') {
                            const areaX = path.area[0]
                            const areaY = path.area[1]
                            const areaX2 = path.area[2]
                            const areaY2 = path.area[3]
                            if (
                                this.intersects(this.prevX, this.prevY, x, y, areaX, areaY, areaX, areaY2) ||
                                this.intersects(this.prevX, this.prevY, x, y, areaX, areaY2, areaX2, areaY2) ||
                                this.intersects(this.prevX, this.prevY, x, y, areaX2, areaY2, areaX2, areaY) ||
                                this.intersects(this.prevX, this.prevY, x, y, areaX2, areaY, areaX, areaY)
                            ) {
                                tempPath.cmd = 'delete'
                                this.setUndoList([...this.undoList, tempPath])
                                this.setRedoList([])
                                tempArr.splice(i, 1)
                                // this.markupPaths.splice(i, 1)
                                isErased = true
                                i--
                            }
                        }
                    }
                }
            }
        }

        if (isErased) {
            this.onMarkupErase(tempArr)
        }
    }
    // private removePath = (x: number, y: number) => {
    //     const scale = MarkupPainter.getScale(this.viewer, this.canvas)
    //     const defaultEraseSize = 10 * window.devicePixelRatio

    //     let isErased = false

    //     for (let i = 0; i < this.markupPaths.length; i++) {
    //         const path = this.markupPaths[i]

    //         if (path) {
    //             for (let k = 0; k < path.values.length; k = k + 2) {
    //                 const pointX = path.values[k + 0]
    //                 const pointY = path.values[k + 1]

    //                 const a = x - pointX
    //                 const b = y - pointY

    //                 const distance = Math.sqrt(a * a + b * b) * scale

    //                 if (distance < defaultEraseSize) {
    //                     this.markupPaths.splice(i, 1)
    //                     isErased = true
    //                     i--
    //                 } else if (k + 3 < path.values.length) {
    //                     const pointX2 = path.values[k + 2]
    //                     const pointY2 = path.values[k + 3]

    //                     if (this.intersects(this.prevX, this.prevY, x, y, pointX, pointY, pointX2, pointY2)) {
    //                         this.markupPaths.splice(i, 1)
    //                         isErased = true
    //                         i--
    //                     }
    //                 }
    //             }
    //         }
    //     }

    //     console.log('removePath::', isErased, this.markupPaths)

    //     if (isErased) {
    //         this.onMarkupErase(this.markupPaths)
    //     }
    // }

    // returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
    private intersects(a: number, b: number, c: number, d: number, p: number, q: number, r: number, s: number) {
        const det = (c - a) * (s - q) - (r - p) * (d - b)

        if (det === 0) {
            return false
        } else {
            const lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det
            const gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det
            return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1
        }
    }
}

export class EditCanvasController extends CanvasController {
    private markupPaths: DrawingPath[]
    private onMarkupEdit: (idx: number) => void
    private undoList: any
    private setUndoList: (value: any) => void
    private setRedoList: (value: any) => void
    private setEditMarkupIdx: (value: number) => void
    private onMarkupErase: (updateCurrentPath: DrawingPath[]) => void
    private setMarkupChanged: (value: boolean) => void

    public constructor(
        viewer: any,
        lib: any,
        canvas: HTMLCanvasElement,
        onViewParamsChange: (params: ViewParams) => void,
        markupPaths: DrawingPath[],
        undoList: any,
        setUndoList: (value: any) => void,
        setRedoList: (value: any) => void,
        setEditMarkupIdx: (value: number) => void,
        onMarkupEdit: (idx: number) => void,
        onMarkupErase: (updateCurrentPath: DrawingPath[]) => void,
        setMarkupChanged: (value: boolean) => void
    ) {
        super(viewer, canvas, lib, onViewParamsChange)
        this.markupPaths = markupPaths
        this.onMarkupEdit = onMarkupEdit
        this.onMarkupErase = onMarkupErase
        this.undoList = undoList
        this.setUndoList = setUndoList
        this.setRedoList = setRedoList
        this.setEditMarkupIdx = setEditMarkupIdx
        this.setMarkupChanged = setMarkupChanged
        this.isShifted = false
    }

    private beforEdit: any
    private isShifted: boolean

    protected onShift(str?: string | undefined): void {
        this.isShifted = str === 'shift' ? true : false
        window.localStorage.setItem('key', this.isShifted.toString())
    }
    protected onDragStart(point: any) {
        if (window.localStorage.getItem('key') === 'true') this.isShifted = true
        this.selectDot(point.x, point.y)
        this.selectMarkup(point.x, point.y)
        this.prevX = point.x
        this.prevY = point.y
    }

    protected onDrag(point: any) {
        const idx = this.markupPaths.findIndex((f, i) => f.dash.length > 0)
        if (idx === -1) return
        if (!this.resizeMarkup(point.x, point.y)) this.moveMarkup(point.x, point.y)
        this.prevX = point.x
        this.prevY = point.y
    }

    protected onMouseOver(x: number, y: number): void {
        const temp = this.screenToWorld(x, y)
        const scale = MarkupPainter.getScale(this.viewer, this.canvas)
        const defaultEraseSize = window.devicePixelRatio
        const idx = this.markupPaths.findIndex((f, i) => f.dash.length > 0)
        // console.log('x:', temp.x, ' y:', temp.y);
        if (idx === -1) return
        const path = this.markupPaths[idx]
        if (path) {
            let xMin = path.area[0]
            let yMin = path.area[1]
            let xMax = path.area[2]
            let yMax = path.area[3]
            if (path.area[0] > path.area[2]) {
                xMin = path.area[2]
                xMax = path.area[0]
            }
            if (path.area[1] > path.area[3]) {
                yMin = path.area[3]
                yMax = path.area[1]
            }
            const resizeSize = defaultEraseSize / 2
            if (temp.x >= xMin - resizeSize && temp.x <= xMax + resizeSize && temp.y >= yMin - resizeSize && temp.y <= yMax + resizeSize) {
                const point = []
                point[0] = this.markupPaths[idx].area[0]
                point[1] = this.markupPaths[idx].area[1]
                point[2] = (this.markupPaths[idx].area[0] + this.markupPaths[idx].area[2]) / 2
                point[3] = point[1]
                point[4] = this.markupPaths[idx].area[2]
                point[5] = point[1]
                point[6] = point[4]
                point[7] = (this.markupPaths[idx].area[1] + this.markupPaths[idx].area[3]) / 2
                point[8] = point[4]
                point[9] = this.markupPaths[idx].area[3]
                point[10] = point[2]
                point[11] = point[9]
                point[12] = point[0]
                point[13] = point[9]
                point[14] = point[0]
                point[15] = point[7]
                for (let i = 0; i < 16; i = i + 2) {
                    const dx = temp.x - point[i]
                    const dy = temp.y - point[i + 1]
                    const dist = Math.sqrt(dx * dx + dy * dy) * scale
                    // console.log('x:', x, 'y:', y, 'p'+i+':',point[i], 'p'+(i+1)+':', point[i+1], 'dist:', dist);
                    if (dist < defaultEraseSize) {
                        this.selDot = i
                        if (i === 2 || i === 10) this.canvas.style.cursor = 'row-resize'
                        else if (i === 6 || i === 14) this.canvas.style.cursor = 'col-resize'
                        else if (i === 0 || i === 8) this.canvas.style.cursor = 'nesw-resize'
                        else if (i === 4 || i === 12) this.canvas.style.cursor = 'nwse-resize'
                        return
                    }
                }
                this.canvas.style.cursor = 'move'
            } else this.canvas.style.cursor = 'default'
        }
    }

    protected onDragEnd(point: any): void {
        if (!this.beforEdit) return
        const newPath = JSON.parse(JSON.stringify(this.beforEdit))
        delete newPath.cmd
        delete newPath.idx
        newPath.dash = [2, 2]
        const strMarkupPath = JSON.stringify(this.markupPaths[this.beforEdit.idx])
        const strNewPath = JSON.stringify(newPath)
        // this.canvas.style.cursor = 'default';
        // console.log('markupPath:',strMarkupPath, ' beforEdit:', strNewPath);
        if (strMarkupPath !== strNewPath) {
            this.setUndoList([...this.undoList, this.beforEdit])
            this.setRedoList([])
            this.setMarkupChanged(true)
        }
    }

    protected onDelete(): void {
        const idx = this.markupPaths.findIndex((f) => f.dash.length > 0)
        const tempPath = this.markupPaths[idx]
        if (!tempPath) return
        tempPath.cmd = 'delete'
        this.setUndoList([...this.undoList, tempPath])
        this.setRedoList([])
        // this.markupPaths.splice(idx, 1)
        const temp = [...this.markupPaths]
        temp.splice(idx, 1)
        this.onMarkupErase(temp)
    }

    private prevX: number = 0
    private prevY: number = 0
    private selDot: number = -1

    private selectDot = (x: number, y: number): void => {
        const scale = MarkupPainter.getScale(this.viewer, this.canvas)
        const defaultEraseSize = 10 * window.devicePixelRatio
        const idx = this.markupPaths.findIndex((f, i) => f.dash.length > 0)
        if (idx === -1) return
        const point = []
        point[0] = this.markupPaths[idx].area[0]
        point[1] = this.markupPaths[idx].area[1]
        point[2] = (this.markupPaths[idx].area[0] + this.markupPaths[idx].area[2]) / 2
        point[3] = point[1]
        point[4] = this.markupPaths[idx].area[2]
        point[5] = point[1]
        point[6] = point[4]
        point[7] = (this.markupPaths[idx].area[1] + this.markupPaths[idx].area[3]) / 2
        point[8] = point[4]
        point[9] = this.markupPaths[idx].area[3]
        point[10] = point[2]
        point[11] = point[9]
        point[12] = point[0]
        point[13] = point[9]
        point[14] = point[0]
        point[15] = point[7]
        for (let i = 0; i < 16; i = i + 2) {
            const dx = x - point[i]
            const dy = y - point[i + 1]
            const dist = Math.sqrt(dx * dx + dy * dy) * scale
            // console.log('x:', x, 'y:', y, 'p'+i+':',point[i], 'p'+(i+1)+':', point[i+1], 'dist:', dist);
            if (dist < defaultEraseSize) {
                this.selDot = i
                if (i === 2 || i === 10) this.canvas.style.cursor = 'row-resize'
                else if (i === 6 || i === 14) this.canvas.style.cursor = 'col-resize'
                else if (i === 0 || i === 8) this.canvas.style.cursor = 'nesw-resize'
                else if (i === 4 || i === 12) this.canvas.style.cursor = 'nwse-resize'
                return
            }
        }
        this.selDot = -1
    }

    private resizeMarkup = (x: number, y: number): boolean => {
        const scale = MarkupPainter.getScale(this.viewer, this.canvas)
        const defaultEraseSize = 20 * window.devicePixelRatio
        const idx = this.markupPaths.findIndex((f, i) => f.dash.length > 0)
        if (idx === -1) return false

        // if (Math.abs(this.markupPaths[idx].area[1] - this.markupPaths[idx].area[3]) <= defaultEraseSize) return true;
        const point = []
        point[0] = this.markupPaths[idx].area[0]
        point[1] = this.markupPaths[idx].area[1]
        point[2] = (this.markupPaths[idx].area[0] + this.markupPaths[idx].area[2]) / 2
        point[3] = point[1]
        point[4] = this.markupPaths[idx].area[2]
        point[5] = point[1]
        point[6] = point[4]
        point[7] = (this.markupPaths[idx].area[1] + this.markupPaths[idx].area[3]) / 2
        point[8] = point[4]
        point[9] = this.markupPaths[idx].area[3]
        point[10] = point[2]
        point[11] = point[9]
        point[12] = point[0]
        point[13] = point[9]
        point[14] = point[0]
        point[15] = point[7]

        let path = JSON.parse(JSON.stringify(this.markupPaths[idx]))
        let values = path.values
        let i = this.selDot
        if (i !== -1) {
            let dx = x - point[i]
            let dy = y - point[i + 1]
            if (path.type !== 'text') {
                if ((path.type === 'rect' || path.type === 'circle') && (i === 0 || i === 4 || i === 8 || i === 12) && this.isShifted) {
                    let dx1 = x
                    let dy1 = y
                    if (i === 4) {
                        dx1 = values[0] - x
                        dy1 = values[1] - y
                        if (Math.abs(dx1) < Math.abs(dy1)) {
                            values[2] = values[0] + dy1
                            values[3] = y
                        } else {
                            values[2] = x
                            values[3] = values[1] + dx1
                        }
                        path.area[2] = values[2]
                        path.area[1] = values[3]
                    } else if (i === 8) {
                        dx1 = x - values[0]
                        dy1 = y - values[3]
                        if (Math.abs(dx1) < Math.abs(dy1)) {
                            values[2] = values[0] + dy1
                            values[1] = y
                        } else {
                            values[2] = x
                            values[1] = values[3] + dx1
                        }
                        path.area[2] = values[2]
                        path.area[3] = values[1]
                    } else if (i === 12) {
                        dx1 = values[2] - x
                        dy1 = values[3] - y
                        if (Math.abs(dx1) < Math.abs(dy1)) {
                            values[0] = values[2] + dy1
                            values[1] = y
                        } else {
                            values[0] = x
                            values[1] = values[3] + dx1
                        }
                        path.area[0] = values[0]
                        path.area[3] = values[1]
                    } else if (i === 0) {
                        dx1 = x - values[2]
                        dy1 = y - values[1]
                        if (Math.abs(dx1) < Math.abs(dy1)) {
                            values[0] = values[2] + dy1
                            values[3] = y
                        } else {
                            values[0] = x
                            values[3] = values[1] + dx1
                        }
                        path.area[0] = values[0]
                        path.area[1] = values[3]
                    }
                } else {
                    if (i === 0 || i === 2 || i === 4) {
                        if (path.area[3] === y) return true
                        for (let j = 0; j < values.length; j = j + 2) {
                            values[j + 1] = values[j + 1] + (dy * (point[11] - values[j + 1])) / (point[11] - point[3])
                            if (!values[j + 1]) values[j + 1] = y
                        }
                        path.area[1] = y
                        if ((path.type === 'rect' || path.type === 'circle') && this.isShifted) {
                            if (i === 2) {
                                if (point[14] > point[6]) dy = -dy
                                if (point[3] > point[11]) dy = -dy
                                values[0] = values[0] + dy / 2
                                values[2] = values[2] - dy / 2
                                path.area[0] = values[0]
                                path.area[2] = values[2]
                            }
                        }
                    }
                    if (i === 8 || i === 10 || i === 12) {
                        if (this.markupPaths[idx].area[1] === y) return true
                        for (let j = 0; j < values.length; j = j + 2) {
                            values[j + 1] = values[j + 1] + (dy * (point[3] - values[j + 1])) / (point[3] - point[11])
                            if (!values[j + 1]) values[j + 1] = y
                        }
                        path.area[3] = y
                        if ((path.type === 'rect' || path.type === 'circle') && this.isShifted) {
                            if (i === 10) {
                                if (point[14] < point[6]) dy = -dy
                                if (point[3] < point[11]) dy = -dy
                                values[0] = values[0] - dy / 2
                                values[2] = values[2] + dy / 2
                                path.area[0] = values[0]
                                path.area[2] = values[2]
                            }
                        }
                    }
                    if (i === 4 || i === 6 || i === 8) {
                        if (this.markupPaths[idx].area[0] === x) return true
                        for (let j = 0; j < values.length; j = j + 2) {
                            values[j] = values[j] + (dx * (point[14] - values[j])) / (point[14] - point[6])
                            if (!values[j]) values[j] = x
                        }
                        path.area[2] = x
                        if ((path.type === 'rect' || path.type === 'circle') && this.isShifted) {
                            if (i === 6) {
                                if (point[3] > point[11]) dx = -dx
                                if (point[14] < point[6]) dx = -dx
                                values[1] = values[1] - dx / 2
                                values[3] = values[3] + dx / 2
                                path.area[1] = values[3]
                                path.area[3] = values[1]
                            }
                        }
                    }
                    if (i === 12 || i === 14 || i === 0) {
                        if (this.markupPaths[idx].area[2] === x) return true
                        for (let j = 0; j < values.length; j = j + 2) {
                            values[j] = values[j] + (dx * (point[6] - values[j])) / (point[6] - point[14])
                            if (!values[j]) values[j] = x
                        }
                        path.area[0] = x
                        if ((path.type === 'rect' || path.type === 'circle') && this.isShifted) {
                            if (i === 14) {
                                if (point[3] < point[11]) dx = -dx
                                if (point[14] > point[6]) dx = -dx
                                values[1] = values[1] + dx / 2
                                values[3] = values[3] - dx / 2
                                path.area[1] = values[3]
                                path.area[3] = values[1]
                            }
                        }
                    }
                }
                this.onMarkupEdit(idx)
                this.markupPaths[idx] = path
                return true
            }
        }

        // console.log('noResize');
        return false
    }

    private moveMarkup = (x: number, y: number) => {
        const dx = this.prevX - x
        const dy = this.prevY - y
        const idx = this.markupPaths.findIndex((f, i) => f.dash.length > 0)

        let path = JSON.parse(JSON.stringify(this.markupPaths[idx]))
        const value = path.values
        for (let i = 0; i < (this.markupPaths[idx].type !== 'text' ? value.length : 2); i = i + 2) {
            value[i] = value[i] - dx
            value[i + 1] = value[i + 1] - dy
        }
        const area = path.area
        area[0] = area[0] - dx
        area[1] = area[1] - dy
        area[2] = area[2] - dx
        area[3] = area[3] - dy

        // console.log('value:', value);
        this.markupPaths[idx] = path
        this.onMarkupEdit(idx)
    }

    private selectMarkup = (x: number, y: number) => {
        const scale = MarkupPainter.getScale(this.viewer, this.canvas)
        const defaultEraseSize = window.devicePixelRatio
        // console.log('path:', this.markupPaths, ' x:', x, ' y:', y);
        for (let i = 0; i < this.markupPaths.length; i++) {
            const path = this.markupPaths[i]

            if (path) {
                let xMin = path.area[0]
                let yMin = path.area[1]
                let xMax = path.area[2]
                let yMax = path.area[3]
                if (path.area[0] > path.area[2]) {
                    xMin = path.area[2]
                    xMax = path.area[0]
                }
                if (path.area[1] > path.area[3]) {
                    yMin = path.area[3]
                    yMax = path.area[1]
                }
                if (
                    x >= xMin - defaultEraseSize &&
                    x <= xMax + defaultEraseSize &&
                    y >= yMin - defaultEraseSize &&
                    y <= yMax + defaultEraseSize
                ) {
                    this.onMarkupEdit(i)
                    this.setEditMarkupIdx(i)
                    this.beforEdit = JSON.parse(JSON.stringify(path))
                    this.beforEdit.cmd = 'edit'
                    this.beforEdit.idx = i
                    this.beforEdit.dash = []
                    // this.setMarkupChanged(true);
                    // this.canvas.style.cursor = 'move';
                    return
                }
            }
        }
        this.onMarkupEdit(-1)
        this.setEditMarkupIdx(-1)
    }

    // returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
    private intersects(a: number, b: number, c: number, d: number, p: number, q: number, r: number, s: number) {
        const det = (c - a) * (s - q) - (r - p) * (d - b)

        if (det === 0) {
            return false
        } else {
            const lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det
            const gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det
            return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1
        }
    }
}

export class RectMarkupCanvasController extends CanvasController {
    private onRectMarkupStart: (x: number, y: number) => void
    private onRectMarkupDraw: (x: number, y: number) => void
    private onRectMarkupShift: (str?: string) => void
    private onRectMarkupComplete: (key?: string) => void
    private setMarkupChanged: (value: boolean) => void
    private currentPath: any
    private undoList: any
    private setUndoList: (value: any) => void
    private setRedoList: (value: any) => void

    // private isShiftFunc: (e: any, shpae: string) => void
    public constructor(
        viewer: any,
        lib: any,
        canvas: HTMLCanvasElement,
        onViewParamsChange: (params: ViewParams) => void,
        onRectMarkupStart: (x: number, y: number) => void,
        onRectMarkupDraw: (x: number, y: number) => void,
        onRectMarkupShift: (str?: string) => void,
        currentPath: any,
        undoList: any,
        setUndoList: (value: any) => void,
        setRedoList: (value: any) => void,
        onRectMarkupComplete: (key?: string) => void,
        setMarkupChanged: (value: boolean) => void
        // isShiftFunc: (e: any, shpae: string) => void,
    ) {
        super(viewer, canvas, lib, onViewParamsChange)
        this.onRectMarkupStart = onRectMarkupStart
        this.onRectMarkupDraw = onRectMarkupDraw
        this.onRectMarkupShift = onRectMarkupShift
        this.onRectMarkupComplete = onRectMarkupComplete
        this.setMarkupChanged = setMarkupChanged
        this.currentPath = currentPath
        this.undoList = undoList
        this.setUndoList = setUndoList
        this.setRedoList = setRedoList
        // this.isShiftFunc = isShiftFunc
    }

    protected onDragStart(point: any) {
        this.onRectMarkupStart(point.x, point.y)
    }

    protected onDrag(point: any) {
        this.onRectMarkupDraw(point.x, point.y)
    }

    protected onDragEnd(point: any): void {
        const path = JSON.parse(JSON.stringify(this.currentPath.at(-1)))
        this.onRectMarkupComplete()
        this.setUndoList([...this.undoList, path])
        this.setRedoList([])
        this.setMarkupChanged(true)
    }

    protected onShift(str?: string): void {
        this.onRectMarkupShift(str)
    }
}

export class CircleMarkupCanvasController extends CanvasController {
    private onCircleMarkupStart: (x: number, y: number) => void
    private onCircleMarkupDraw: (x: number, y: number) => void
    private onCircleMarkupShift: (str?: string) => void
    private onCircleMarkupComplete: (key?: string) => void
    private setMarkupChanged: (value: boolean) => void
    private currentPath: any
    private undoList: any
    private setUndoList: (value: any) => void
    private setRedoList: (value: any) => void
    // private isShiftFunc: (e: any, shpae: string) => void

    public constructor(
        viewer: any,
        lib: any,
        canvas: HTMLCanvasElement,
        onViewParamsChange: (params: ViewParams) => void,
        onCircleMarkupStart: (x: number, y: number) => void,
        onCircleMarkupDraw: (x: number, y: number) => void,
        onCircleMarkupShift: (key?: string) => void,
        onCircleMarkupComplet: (key?: string) => void,
        currentPath: any,
        undoList: any,
        setUndoList: (value: any) => void,
        setRedoList: (value: any) => void,
        // isShiftFunc: (e: any, shpae: string) => void,
        setMarkupChanged: (value: boolean) => void
    ) {
        super(viewer, canvas, lib, onViewParamsChange)
        this.onCircleMarkupStart = onCircleMarkupStart
        this.onCircleMarkupDraw = onCircleMarkupDraw
        this.onCircleMarkupShift = onCircleMarkupShift
        this.onCircleMarkupComplete = onCircleMarkupComplet
        this.setMarkupChanged = setMarkupChanged
        this.currentPath = currentPath
        this.undoList = undoList
        this.setUndoList = setUndoList
        this.setRedoList = setRedoList
        // this.isShiftFunc = isShiftFunc
    }

    // protected onKeyDown(e: any) {
    //     this.isShiftFunc(e, 'arc');
    // }
    // protected onKeyUp(e: any) {
    //     this.isShiftFunc(e, '');
    // }

    protected onDragStart(point: any) {
        this.onCircleMarkupStart(point.x, point.y)
    }

    protected onDrag(point: any) {
        this.onCircleMarkupDraw(point.x, point.y)
    }

    protected onDragEnd(point: any): void {
        const path = JSON.parse(JSON.stringify(this.currentPath.at(-1)))
        this.onCircleMarkupComplete()
        this.setUndoList([...this.undoList, path])
        this.setRedoList([])
        this.setMarkupChanged(true)
    }

    protected onShift(str?: string): void {
        this.onCircleMarkupShift(str)
    }
}

export class TextMarkupCanvasController extends CanvasController {
    private onInputMake: (point: any) => void

    public constructor(
        viewer: any,
        lib: any,
        canvas: HTMLCanvasElement,
        onViewParamsChange: (params: ViewParams) => void,
        onInputMake: (point: any) => void
    ) {
        super(viewer, canvas, lib, onViewParamsChange)
        this.onInputMake = onInputMake
    }

    protected onDragEnd(point: any): void {
        this.onInputMake(point)
    }
}

export class PolylineMarkupCanvasController extends CanvasController {
    private onPolylineMarkupStart: (x: number, y: number) => boolean
    private onPolylineNextMove: (x: number, y: number) => void
    private onPolylineMarkupComplete: (key?: string) => void
    private setPolylineMarkupChanged: (value: boolean) => void
    private currentPath: any
    private undoList: any
    private setUndoList: (value: any) => void
    private setRedoList: (value: any) => void

    public constructor(
        viewer: any,
        lib: any,
        canvas: HTMLCanvasElement,
        onViewParamsChange: (params: ViewParams) => void,
        onPolylineMarkupStart: (x: number, y: number) => boolean,
        onPolylineNextMove: (x: number, y: number) => void,
        onPolylineMarkupComplete: (key?: string) => void,
        currentPath: any,
        undoList: any,
        setUndoList: (value: any) => void,
        setRedoList: (value: any) => void,
        setPolylineMarkupChanged: (value: boolean) => void
    ) {
        super(viewer, canvas, lib, onViewParamsChange)
        this.onPolylineMarkupStart = onPolylineMarkupStart
        this.onPolylineNextMove = onPolylineNextMove
        this.onPolylineMarkupComplete = onPolylineMarkupComplete
        this.setPolylineMarkupChanged = setPolylineMarkupChanged
        this.currentPath = currentPath
        this.undoList = undoList
        this.setUndoList = setUndoList
        this.setRedoList = setRedoList
    }

    protected onDragStart(point: any) {
        const fin = this.onPolylineMarkupStart(point.x, point.y)
        if (fin) this.onComplete()
    }

    protected onMouseOver(x: number, y: number) {
        const temp = this.screenToWorld(x, y)
        this.onPolylineNextMove(temp.x, temp.y)
    }

    protected onComplete(): void {
        this.onPolylineMarkupComplete()
        const path = JSON.parse(JSON.stringify(this.currentPath[this.currentPath.length - 1]))
        this.setUndoList([...this.undoList, path])
        this.setRedoList([])
        this.setPolylineMarkupChanged(true)
    }
}

export class CloudMarkupCanvasController extends CanvasController {
    private onCloudMarkupStart: (x: number, y: number) => boolean
    private onCloudNextMove: (x: number, y: number) => void
    private onCloudMarkupComplete: (key?: string) => void
    private onCloudMarkupShift: (str?: string) => void
    private setCloudMarkupChanged: (value: boolean) => void
    private currentPath: any
    private undoList: any
    private setUndoList: (value: any) => void
    private setRedoList: (value: any) => void

    public constructor(
        viewer: any,
        lib: any,
        canvas: HTMLCanvasElement,
        onViewParamsChange: (params: ViewParams) => void,
        onCloudMarkupStart: (x: number, y: number) => boolean,
        onCloudNextMove: (x: number, y: number) => void,
        onCloudMarkupComplete: (key?: string) => void,
        currentPath: any,
        undoList: any,
        setUndoList: (value: any) => void,
        setRedoList: (value: any) => void,
        setCloudMarkupChanged: (value: boolean) => void,
        onCloudMarkupShift: (str?: string) => void
    ) {
        super(viewer, canvas, lib, onViewParamsChange)
        this.onCloudMarkupStart = onCloudMarkupStart
        this.onCloudNextMove = onCloudNextMove
        this.onCloudMarkupComplete = onCloudMarkupComplete
        this.currentPath = currentPath
        this.undoList = undoList
        this.setUndoList = setUndoList
        this.setRedoList = setRedoList
        this.setCloudMarkupChanged = setCloudMarkupChanged
        this.onCloudMarkupShift = onCloudMarkupShift
    }

    protected onDragStart(point: any) {
        const fin = this.onCloudMarkupStart(point.x, point.y)
        if (fin) this.onComplete()
    }

    protected onMouseOver(x: number, y: number) {
        const temp = this.screenToWorld(x, y)
        this.onCloudNextMove(temp.x, temp.y)
    }

    protected onComplete(): void {
        this.onCloudMarkupComplete()
        const path = JSON.parse(JSON.stringify(this.currentPath[this.currentPath.length - 1]))
        this.setUndoList([...this.undoList, path])
        this.setRedoList([])
        this.setCloudMarkupChanged(true)
    }

    protected onShift(): void {
        this.onCloudMarkupShift()
    }
}

export class WCDCanvasController extends CanvasController {
    private onSelectEntity: (handles: string[], x: number, y: number, controlMode: string) => void
    private onMouseOverHandler: (handles: string[], x: number, y: number) => void
    private registeredHandles: Set<string>

    public constructor(
        viewer: any,
        lib: any,
        canvas: HTMLCanvasElement,
        onViewParamsChange: (params: ViewParams) => void,
        onSelectEntity: (handles: string[], x: number, y: number, controlMode: string) => void,
        onMouseOver: (handles: string[], x: number, y: number) => void,
        registeredHandles: Set<string>
    ) {
        super(viewer, canvas, lib, onViewParamsChange)

        this.onSelectEntity = onSelectEntity
        this.onMouseOverHandler = onMouseOver
        this.registeredHandles = registeredHandles
    }

    protected onClick(x: number, y: number) {
        const handles = this.getHandles(x, y)
        this.onSelectEntity(handles, x / window.devicePixelRatio, y / window.devicePixelRatio, 'wcd')
    }

    protected onMouseOver(x: number, y: number) {
        const handles = this.getHandles(x, y)
        this.onMouseOverHandler(handles, x / window.devicePixelRatio, y / window.devicePixelRatio)
    }

    private startPos: any

    protected onDragStart(point: any) {
        this.startPos = point
    }

    protected onDrag(point: any): void {
        const delta = this.startPos.sub(point).asVector()

        const { Vector3d } = this.lib
        const params = MarkupPainter.getViewParams(this.viewer)

        let target = Vector3d.createFromArray(params.target)
        target = target.add(delta)
        params.target = target.toArray()

        let position = Vector3d.createFromArray(params.position)
        position = position.add(delta)
        params.position = position.toArray()

        this.setViewParams(params)
    }

    protected getHandles(x: number, y: number): string[] {
        const tolerances = [1, 3, 6, 10]

        for (const tolerance of tolerances) {
            this.viewer.select(
                x - tolerance * window.devicePixelRatio,
                y + tolerance * window.devicePixelRatio,
                x + tolerance * window.devicePixelRatio,
                y - tolerance * window.devicePixelRatio
            )

            const pSelected = this.viewer.getSelected()
            const handles: string[] = []

            if (!pSelected.isNull() && pSelected.numItems() !== 0) {
                const itr = pSelected.getIterator()
                while (!itr.done()) {
                    const entityId = itr.getEntity()
                    if (entityId.getType() === 1) {
                        const handle = entityId.openObject().getNativeDatabaseHandle()
                        if (this.registeredHandles.has(handle)) {
                            handles.push(handle)
                        }
                    } else if (entityId.getType() === 2) {
                        const handle = entityId.openObjectAsInsert().getNativeDatabaseHandle()
                        // console.log(
                        //     'getPosition():', entityId.openObjectAsInsert().getPosition(),
                        //     ' xy:', x, y
                        // );
                        if (this.registeredHandles.has(handle)) {
                            handles.push(handle)
                        }
                    }

                    itr.step()
                }
            }

            this.viewer.unselect()

            // mouseover로 나오는 핸들은 하나만, 마지막 것을 리턴하는 것은 겹쳐있는 경우 뒤에 것이 위에 있기 때문
            if (0 < handles.length) {
                return [handles[handles.length - 1]]
            }
        }

        return []
    }
}

export class PMDCCanvasController extends CanvasController {
    private onSelectEntity: (handles: string[], x: number, y: number, controlMode: string) => void
    private onMouseOverHandler: (handles: string[], x: number, y: number) => void
    private registeredHandles: Set<string>

    public constructor(
        viewer: any,
        lib: any,
        canvas: HTMLCanvasElement,
        onViewParamsChange: (params: ViewParams) => void,
        onSelectEntity: (handles: string[], x: number, y: number, controlMode: string) => void,
        onMouseOver: (handles: string[], x: number, y: number) => void,
        registeredHandles: Set<string>
    ) {
        super(viewer, canvas, lib, onViewParamsChange)

        this.onSelectEntity = onSelectEntity
        this.onMouseOverHandler = onMouseOver
        this.registeredHandles = registeredHandles
    }

    protected onClick(x: number, y: number) {
        const handles = this.getHandles(x, y)
        this.onSelectEntity(handles, x / window.devicePixelRatio, y / window.devicePixelRatio, 'pmdc')
    }

    protected onMouseOver(x: number, y: number) {
        const handles = this.getHandles(x, y)
        this.onMouseOverHandler(handles, x / window.devicePixelRatio, y / window.devicePixelRatio)
    }

    private startPos: any

    protected onDragStart(point: any) {
        this.startPos = point
    }

    protected onDrag(point: any): void {
        const delta = this.startPos.sub(point).asVector()

        const { Vector3d } = this.lib
        const params = MarkupPainter.getViewParams(this.viewer)

        let target = Vector3d.createFromArray(params.target)
        target = target.add(delta)
        params.target = target.toArray()

        let position = Vector3d.createFromArray(params.position)
        position = position.add(delta)
        params.position = position.toArray()

        this.setViewParams(params)
    }

    protected getHandles(x: number, y: number): string[] {
        const tolerances = [1, 3, 6, 10]

        for (const tolerance of tolerances) {
            this.viewer.select(
                x - tolerance * window.devicePixelRatio,
                y + tolerance * window.devicePixelRatio,
                x + tolerance * window.devicePixelRatio,
                y - tolerance * window.devicePixelRatio
            )

            const pSelected = this.viewer.getSelected()
            const handles: string[] = []

            if (!pSelected.isNull() && pSelected.numItems() !== 0) {
                const itr = pSelected.getIterator()
                while (!itr.done()) {
                    const entityId = itr.getEntity()
                    if (entityId.getType() === 1) {
                        const handle = entityId.openObject().getNativeDatabaseHandle()
                        if (this.registeredHandles.has(handle)) {
                            handles.push(handle)
                        }
                    } else if (entityId.getType() === 2) {
                        const handle = entityId.openObjectAsInsert().getNativeDatabaseHandle()
                        if (this.registeredHandles.has(handle)) {
                            handles.push(handle)
                        }
                    }

                    itr.step()
                }
            }

            this.viewer.unselect()

            // mouseover로 나오는 핸들은 하나만, 마지막 것을 리턴하는 것은 겹쳐있는 경우 뒤에 것이 위에 있기 때문
            if (0 < handles.length) {
                return [handles[handles.length - 1]]
            }
        }

        return []
    }
}

export class PldCanvasController extends CanvasController {
    private onSelectEntity: (handles: string[], x: number, y: number) => void
    //private onMouseOverHandler: (handles: string[], x: number, y: number) => void
    //private registeredHandles: Set<string>

    public constructor(
        viewer: any,
        lib: any,
        canvas: HTMLCanvasElement,
        onViewParamsChange: (params: ViewParams) => void,
        onSelectEntity: (handles: string[], x: number, y: number) => void
        //onMouseOver: (handles: string[], x: number, y: number) => void,
        //registeredHandles: Set<string>
    ) {
        super(viewer, canvas, lib, onViewParamsChange)

        this.onSelectEntity = onSelectEntity
        //this.onMouseOverHandler = onMouseOver
        //this.registeredHandles = registeredHandles
    }

    protected onClick(x: number, y: number) {
        const handles = this.getHandles(x, y)
        this.onSelectEntity(handles, x / window.devicePixelRatio, y / window.devicePixelRatio)
    }

    protected onMouseOver(x: number, y: number) {
        //const handles = this.getHandles(x, y)
        // this.onMouseOverHandler(handles, x / window.devicePixelRatio, y / window.devicePixelRatio)
    }

    private startPos: any

    protected onDragStart(point: any) {
        this.startPos = point
    }

    protected onDrag(point: any): void {
        const delta = this.startPos.sub(point).asVector()

        const { Vector3d } = this.lib
        const params = MarkupPainter.getViewParams(this.viewer)

        let target = Vector3d.createFromArray(params.target)
        target = target.add(delta)
        params.target = target.toArray()

        let position = Vector3d.createFromArray(params.position)
        position = position.add(delta)
        params.position = position.toArray()

        this.setViewParams(params)
    }

    protected getHandles(x: number, y: number): string[] {
        const tolerances = [1, 3, 6, 10]

        for (const tolerance of tolerances) {
            this.viewer.select(
                x - tolerance * window.devicePixelRatio,
                y + tolerance * window.devicePixelRatio,
                x + tolerance * window.devicePixelRatio,
                y - tolerance * window.devicePixelRatio
            )

            const pSelected = this.viewer.getSelected()

            const handles: string[] = []

            if (!pSelected.isNull() && pSelected.numItems() !== 0) {
                const itr = pSelected.getIterator()

                while (!itr.done()) {
                    const entityId = itr.getEntity()

                    if (entityId.getType() === 1) {
                        const handle = entityId.openObject().getNativeDatabaseHandle()

                        handles.push(handle)
                    } else if (entityId.getType() === 2) {
                        const handle = entityId.openObjectAsInsert().getNativeDatabaseHandle()

                        handles.push(handle)
                    }

                    itr.step()
                }
            }

            this.viewer.unselect()

            // mouseover로 나오는 핸들은 하나만, 마지막 것을 리턴하는 것은 겹쳐있는 경우 뒤에 것이 위에 있기 때문
            if (0 < handles.length) {
                return [handles[handles.length - 1]]
            }
        }

        return []
    }
}

export class PldSelectCanvasController extends CanvasController {
    //private onSelectEntity: (handles: string[], x: number, y: number) => void
    //private onMouseOverHandler: (handles: string[], x: number, y: number) => void
    private registeredHandles: Set<string>

    public constructor(
        viewer: any,
        lib: any,
        canvas: HTMLCanvasElement,
        onViewParamsChange: (params: ViewParams) => void,
        //onSelectEntity: (handles: string[], x: number, y: number) => void,
        //onMouseOver: (handles: string[], x: number, y: number) => void,
        registeredHandles: Set<string>
    ) {
        super(viewer, canvas, lib, onViewParamsChange)

        //this.onSelectEntity = onSelectEntity
        //this.onMouseOverHandler = onMouseOver
        this.registeredHandles = registeredHandles
    }

    // protected onClick(x: number, y: number) {
    //     const handles = this.getHandles(x, y)
    //     this.onSelectEntity(handles, x / window.devicePixelRatio, y / window.devicePixelRatio)
    // }

    // protected onMouseOver(x: number, y: number) {
    //     const handles = this.getHandles(x, y)
    //     this.onMouseOverHandler(handles, x / window.devicePixelRatio, y / window.devicePixelRatio)
    // }

    private startPos: any

    protected onDragStart(point: any) {
        this.startPos = point
    }

    protected onDrag(point: any): void {
        const delta = this.startPos.sub(point).asVector()

        const { Vector3d } = this.lib
        const params = MarkupPainter.getViewParams(this.viewer)

        let target = Vector3d.createFromArray(params.target)
        target = target.add(delta)
        params.target = target.toArray()

        let position = Vector3d.createFromArray(params.position)
        position = position.add(delta)
        params.position = position.toArray()

        this.setViewParams(params)
    }

    protected getHandles(x: number, y: number): string[] {
        const tolerances = [1, 3, 6, 10]

        for (const tolerance of tolerances) {
            this.viewer.select(
                x - tolerance * window.devicePixelRatio,
                y + tolerance * window.devicePixelRatio,
                x + tolerance * window.devicePixelRatio,
                y - tolerance * window.devicePixelRatio
            )

            const pSelected = this.viewer.getSelected()

            const handles: string[] = []

            if (!pSelected.isNull() && pSelected.numItems() !== 0) {
                const itr = pSelected.getIterator()

                while (!itr.done()) {
                    const entityId = itr.getEntity()

                    if (entityId.getType() === 1) {
                        const handle = entityId.openObject().getNativeDatabaseHandle()

                        if (this.registeredHandles.has(handle)) {
                            handles.push(handle)
                        }
                    } else if (entityId.getType() === 2) {
                        const handle = entityId.openObjectAsInsert().getNativeDatabaseHandle()

                        if (this.registeredHandles.has(handle)) {
                            handles.push(handle)
                        }
                    }

                    itr.step()
                }
            }

            this.viewer.unselect()

            // mouseover로 나오는 핸들은 하나만, 마지막 것을 리턴하는 것은 겹쳐있는 경우 뒤에 것이 위에 있기 때문
            if (0 < handles.length) {
                return [handles[handles.length - 1]]
            }
        }

        return []
    }
}

export class ProcedureCanvasController extends CanvasController {
    private onSelectEntity: (handles: string[], x: number, y: number, controlMode: string) => void
    private onMouseOverHandler: (handles: string[], x: number, y: number) => void
    private registeredHandles: Set<string>

    public constructor(
        viewer: any,
        lib: any,
        canvas: HTMLCanvasElement,
        onViewParamsChange: (params: ViewParams) => void,
        onSelectEntity: (handles: string[], x: number, y: number, controlMode: string) => void,
        onMouseOver: (handles: string[], x: number, y: number) => void,
        registeredHandles: Set<string>
    ) {
        super(viewer, canvas, lib, onViewParamsChange)

        this.onSelectEntity = onSelectEntity
        this.onMouseOverHandler = onMouseOver
        this.registeredHandles = registeredHandles
    }

    protected onClick(x: number, y: number) {
        const handles = this.getHandles(x, y)
        this.onSelectEntity(handles, x / window.devicePixelRatio, y / window.devicePixelRatio, 'pmdc')
    }

    protected onMouseOver(x: number, y: number) {
        const handles = this.getHandles(x, y)
        this.onMouseOverHandler(handles, x / window.devicePixelRatio, y / window.devicePixelRatio)
    }

    private startPos: any

    protected onDragStart(point: any) {
        this.startPos = point
    }

    protected onDrag(point: any): void {
        const delta = this.startPos.sub(point).asVector()

        const { Vector3d } = this.lib
        const params = MarkupPainter.getViewParams(this.viewer)

        let target = Vector3d.createFromArray(params.target)
        target = target.add(delta)
        params.target = target.toArray()

        let position = Vector3d.createFromArray(params.position)
        position = position.add(delta)
        params.position = position.toArray()

        this.setViewParams(params)
    }

    protected getHandles(x: number, y: number): string[] {
        const tolerances = [1, 3, 6, 10]

        for (const tolerance of tolerances) {
            this.viewer.select(
                x - tolerance * window.devicePixelRatio,
                y + tolerance * window.devicePixelRatio,
                x + tolerance * window.devicePixelRatio,
                y - tolerance * window.devicePixelRatio
            )

            const pSelected = this.viewer.getSelected()
            const handles: string[] = []

            if (!pSelected.isNull() && pSelected.numItems() !== 0) {
                const itr = pSelected.getIterator()
                while (!itr.done()) {
                    const entityId = itr.getEntity()
                    if (entityId.getType() === 1) {
                        const handle = entityId.openObject().getNativeDatabaseHandle()
                        if (this.registeredHandles.has(handle)) {
                            handles.push(handle)
                        }
                    } else if (entityId.getType() === 2) {
                        const handle = entityId.openObjectAsInsert().getNativeDatabaseHandle()
                        if (this.registeredHandles.has(handle)) {
                            handles.push(handle)
                        }
                    }

                    itr.step()
                }
            }

            this.viewer.unselect()

            // mouseover로 나오는 핸들은 하나만, 마지막 것을 리턴하는 것은 겹쳐있는 경우 뒤에 것이 위에 있기 때문
            if (0 < handles.length) {
                return [handles[handles.length - 1]]
            }
        }

        return []
    }
}
