///////////////////////////////////////////////////////////////////////////////
// VisualizeJS version 23.1
///////////////////////////////////////////////////////////////////////////////
// Copyright (C) 2002-2021, Open Design Alliance (the "Alliance").
// All rights reserved.
//
// This software and its documentation and related materials are owned by
// the Alliance. The software may only be incorporated into application
// programs owned by members of the Alliance, subject to a signed
// Membership Agreement and Supplemental Software License Agreement with the
// Alliance. The structure and organization of this software are the valuable
// trade secrets of the Alliance and its suppliers. The software is also
// protected by copyright law and international treaty provisions. Application
// programs incorporating this software must include the following statement
// with their copyright notices:
//
//   This application incorporates Open Design Alliance software pursuant to a
//   license agreement with Open Design Alliance.
//   Open Design Alliance Copyright (C) 2002-2021 by Open Design Alliance.
//   All rights reserved.
//
// By use of this software, its documentation or related materials, you
// acknowledge and accept the above terms.
///////////////////////////////////////////////////////////////////////////////

var Module = typeof Module !== 'undefined' ? Module : {}
function TransportService(senderId) {
    console.log('Deprecated use OdaWorkerTransportPlugin')
    this.protocolVersion = '0.1'
    this.lastPkgNumber = 0
    this.senderId = senderId
    this.resQueue = {}
    this.blobQueue = []
    this.fReader = new FileReader()
    this.TMessageType = { RESPONSE: 2, COMMAND: 4, EXCEPTION: 5, AUTHORIZATION: 8 }
    this.TSenderType = { WORKER: 0, CLIENT: 2 }
    this.onData = function (buff) {
        console.log(buff)
    }
    this.onError = function (err) {
        console.log(err)
    }
    this.onOpen = function (e) {
        console.log('on open')
    }
    this.onClose = function (e) {
        console.log(e)
    }
}
TransportService.prototype.connect = function (url) {
    console.log('URL:', url)
    this.socket = new WebSocket(url)
    this.socket.binaryType = 'arraybuffer'
    this.socket.binaryType = 'arraybuffer'
    this.socket.onopen = this.onOpen
    this.socket.onclose = this.onClose
    this.socket.onerror = this.onError
    this.socket.onmessage = this.onMessage.bind(this)
}
TransportService.prototype.close = function () {
    if (this.socket) {
        this.socket.onopen = function (buff) {}
        this.socket.onclose = function (err) {}
        this.socket.onerror = function (e) {}
        this.socket.onmessage = function (e) {}
        this.socket.close()
    }
}
TransportService.prototype.onMessage = function (event) {
    var data = event.data
    switch (typeof data) {
        case 'object':
            {
                this.onData(data)
            }
            break
        case 'string':
            {
                try {
                    var msg = JSON.parse(data)
                    var cb = this.resQueue[msg.packetNum]
                    if (cb && typeof cb === 'function') {
                        switch (msg.packetType) {
                            case this.TMessageType.RESPONSE:
                                cb(msg)
                                break
                            case this.TMessageType.EXCEPTION:
                                cb(null, msg)
                                break
                            case this.TMessageType.AUTHORIZATION:
                                cb(msg)
                                break
                            default: {
                                console.error('invalid message type')
                            }
                        }
                    } else {
                        console.error('not set callback for handle respounse number : ' + msg.packetNum)
                    }
                    delete this.resQueue[msg.packetNum]
                } catch (exp) {
                    console.error('Error parse message', exp)
                }
            }
            break
        default: {
            console.error('Undefined type')
        }
    }
}
TransportService.prototype.send = function (name, args, cb) {
    this.resQueue[this.lastPkgNumber] = cb
    var msg = {
        protocolVersion: this.protocolVersion,
        senderType: this.TSenderType.CLIENT,
        senderId: this.senderId,
        packetNum: this.lastPkgNumber++,
        packetType: this.TMessageType.COMMAND,
        body: { name: name, args: args }
    }
    this.socket.send(JSON.stringify(msg))
}
TransportService.prototype.auth = function (tocken, cb) {
    this.resQueue[this.lastPkgNumber] = function (msg, err) {
        if (msg.body.res == 'success') cb()
        else console.error('Auth error')
    }
    var msg = {
        protocolVersion: this.protocolVersion,
        senderType: this.TSenderType.CLIENT,
        senderId: this.senderId,
        packetNum: this.lastPkgNumber++,
        packetType: this.TMessageType.AUTHORIZATION,
        body: { token: tocken, res: '' }
    }
    this.socket.send(JSON.stringify(msg))
}
window['getVisualizeLibInst'] = function getVisualizeLibInst(params) {
    function OverlayController(targetElement, viewer, moduleInstance) {
        this.items = []
        this.attach = () => {
            const rect = targetElement.getBoundingClientRect()
            this.m_targetElement = document.createElement('div')
            this.m_targetElement.style.background = 'rgba(0,0,0,0)'
            this.m_targetElement.style.position = 'absolute'
            this.m_targetElement.style.zIndex = '2001'
            this.m_targetElement.style.top = `${rect.top}px`
            this.m_targetElement.style.left = `${rect.left}px`
            this.m_targetElement.style.width = `${rect.width}px`
            this.m_targetElement.style.height = `${rect.height}px`
            this.m_targetElement.style.pointerEvents = 'none'
            document.body.appendChild(this.m_targetElement)
        }
        this.detach = () => {
            document.body.removeChild(this.m_targetElement)
        }
        this.clearAll = () => {
            this.items.forEach((val) => {
                val.clear()
            })
            this.items = []
        }
        this.update = () => {
            this.items.forEach((val) => {
                val.update()
            })
        }
        this.remove = (item) => {
            const index = this.items.indexOf(item)
            if (index > -1) {
                item.clear()
                this.items.splice(index, 1)
            }
        }
        this.createMeasureLine = () => {
            var item = new MeasureLineItem(this.m_targetElement, viewer, moduleInstance)
            this.items.push(item)
            return item
        }
        this.createMeasureAngle = () => {
            var item = new MeasureAngleItem(this.m_targetElement, viewer, moduleInstance)
            this.items.push(item)
            return item
        }
    }
    var createHtmlElementIfNeed = (element, targetElement) => {
        if (!element) {
            element = document.createElement('div')
            targetElement.appendChild(element)
        }
        return element
    }
    var destroyHtmlElement = (element, targetElement) => {
        if (element) {
            targetElement.removeChild(element)
        }
        return null
    }
    var worldToScreen = (gePoint, moduleInstance, viewer) => {
        const tvPoint = moduleInstance.Point3d.createFromArray(gePoint)
        const mtx = viewer.activeView.worldToDeviceMatrix
        tvPoint.transformBy(mtx)
        const res = { x: tvPoint.x / window.devicePixelRatio, y: tvPoint.y / window.devicePixelRatio }
        tvPoint.delete()
        return res
    }
    var getDistance = (gePoint1, gePoint2, moduleInstance) => {
        const tvPoint1 = moduleInstance.Point3d.createFromArray(gePoint1)
        const tvPoint2 = moduleInstance.Point3d.createFromArray(gePoint2)
        return tvPoint1.distanceTo(tvPoint2).toFixed(2)
    }
    var getAngle = (geStart, geOrigin, geEnd, moduleInstance) => {
        const tvStart = moduleInstance.Point3d.createFromArray(geStart)
        const tvOrigin = moduleInstance.Point3d.createFromArray(geOrigin)
        const tvEnd = moduleInstance.Point3d.createFromArray(geEnd)
        const v1 = tvStart.sub(tvOrigin).asVector()
        const v2 = tvEnd.sub(tvOrigin).asVector()
        return (180 * v1.angleTo(v2)) / Math.PI
    }
    var getDataForDrawLine = (p1, p2) => {
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        let angle = (180 * Math.atan(dy / dx)) / Math.PI
        if (dx < 0) {
            angle -= 180
        }
        const width = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
        return { angle: angle, width: width }
    }
    var onSetCallback = (element, cb) => {
        if (element) {
            element.onclick = cb ? () => cb(this) : () => {}
        }
    }
    var onSetSelectability = (element, enable) => {
        element.style.pointerEvents = enable ? 'auto' : 'none'
    }
    function MeasureAngleItem(targetElement, viewer, moduleInstance) {
        this.htmlElemntP0 = null
        this.htmlElemntP1 = null
        this.htmlElemntPOrigin = null
        this.htmlElemLine1 = null
        this.htmlElemLine2 = null
        this.htmlElemTitle = null
        this.startPoint = null
        this.originPoint = null
        this.endPoint = null
        this.unit = 'mm'
        this.size = 10
        this.style = {
            border: '2px solid #FFFFFF',
            background: '#009bff',
            color: 'white',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)'
        }
        this.htmlElemntP0 = createHtmlElementIfNeed(this.htmlElemntP0, targetElement)
        this.htmlElemntP1 = createHtmlElementIfNeed(this.htmlElemntP1, targetElement)
        this.htmlElemntPOrigin = createHtmlElementIfNeed(this.htmlElemntPOrigin, targetElement)
        this.htmlElemLine1 = createHtmlElementIfNeed(this.htmlElemLine1, targetElement)
        this.htmlElemLine2 = createHtmlElementIfNeed(this.htmlElemLine2, targetElement)
        this.htmlElemTitle = createHtmlElementIfNeed(this.htmlElemTitle, targetElement)
        var drawFn = () => {
            const pointSize = this.size
            if (this.startPoint) {
                this.htmlElemntP0 = createHtmlElementIfNeed(this.htmlElemntP0, targetElement)
                const pScreenStart = worldToScreen(this.startPoint, moduleInstance, viewer)
                this.htmlElemntP0.style.cursor = 'pointer'
                this.htmlElemntP0.style.position = 'absolute'
                this.htmlElemntP0.style.top = `${pScreenStart.y - pointSize / 2}px`
                this.htmlElemntP0.style.left = `${pScreenStart.x - pointSize / 2}px`
                this.htmlElemntP0.style.borderRadius = `${pointSize}px`
                this.htmlElemntP0.style.border = this.style.border
                this.htmlElemntP0.style.background = this.style.background
                this.htmlElemntP0.style.zIndex = 2001
                this.htmlElemntP0.style.width = `${pointSize}px`
                this.htmlElemntP0.style.height = `${pointSize}px`
                this.htmlElemntP0.style.boxShadow = this.style.boxShadow
            }
            if (this.originPoint) {
                this.htmlElemntPOrigin = createHtmlElementIfNeed(this.htmlElemntPOrigin, targetElement)
                const pScreenStart = worldToScreen(this.originPoint, moduleInstance, viewer)
                this.htmlElemntPOrigin.style.cursor = 'pointer'
                this.htmlElemntPOrigin.style.position = 'absolute'
                this.htmlElemntPOrigin.style.top = `${pScreenStart.y - pointSize / 2}px`
                this.htmlElemntPOrigin.style.left = `${pScreenStart.x - pointSize / 2}px`
                this.htmlElemntPOrigin.style.borderRadius = `${pointSize}px`
                this.htmlElemntPOrigin.style.border = this.style.border
                this.htmlElemntPOrigin.style.background = this.style.background
                this.htmlElemntPOrigin.style.zIndex = 2001
                this.htmlElemntPOrigin.style.width = `${pointSize}px`
                this.htmlElemntPOrigin.style.height = `${pointSize}px`
                this.htmlElemntPOrigin.style.boxShadow = this.style.boxShadow
            }
            if (this.endPoint) {
                this.htmlElemntP1 = createHtmlElementIfNeed(this.htmlElemntP1, targetElement)
                const pScreenEnd = worldToScreen(this.endPoint, moduleInstance, viewer)
                this.htmlElemntP1.style.cursor = 'pointer'
                this.htmlElemntP1.style.position = 'absolute'
                this.htmlElemntP1.style.top = `${pScreenEnd.y - pointSize / 2}px`
                this.htmlElemntP1.style.left = `${pScreenEnd.x - pointSize / 2}px`
                this.htmlElemntP1.style.borderRadius = `${pointSize}px`
                this.htmlElemntP1.style.border = this.style.border
                this.htmlElemntP1.style.background = this.style.background
                this.htmlElemntP1.style.zIndex = 2001
                this.htmlElemntP1.style.width = `${pointSize}px`
                this.htmlElemntP1.style.height = `${pointSize}px`
                this.htmlElemntP1.style.boxShadow = this.style.boxShadow
            }
            if (this.startPoint && this.originPoint) {
                const p1 = worldToScreen(this.startPoint, moduleInstance, viewer)
                const p2 = worldToScreen(this.originPoint, moduleInstance, viewer)
                const dataForLine = getDataForDrawLine(p1, p2)
                const angle = dataForLine.angle
                const width = dataForLine.width
                this.htmlElemLine1 = createHtmlElementIfNeed(this.htmlElemLine1, targetElement)
                this.htmlElemLine1.style.cursor = 'pointer'
                this.htmlElemLine1.style.position = 'absolute'
                this.htmlElemLine1.style.top = `${p1.y}px`
                this.htmlElemLine1.style.left = `${p1.x}px`
                this.htmlElemLine1.style.width = `${width}px`
                this.htmlElemLine1.style.transform = `rotate(${angle}deg)`
                this.htmlElemLine1.style.boxShadow = this.style.boxShadow
                this.htmlElemLine1.style.border = 'none'
                this.htmlElemLine1.style.background = this.style.background
                this.htmlElemLine1.style.zIndex = 2e3
                this.htmlElemLine.style.transformOrigin = `0px ${height / 2}px`
                this.htmlElemLine.style.height = `${height}px`
            }
            const height = pointSize / 5 < 1 ? 1 : pointSize / 5
            if (this.endPoint && this.originPoint) {
                const p1 = worldToScreen(this.originPoint, moduleInstance, viewer)
                const p2 = worldToScreen(this.endPoint, moduleInstance, viewer)
                const dataForLine = getDataForDrawLine(p1, p2)
                const angle = dataForLine.angle
                const width = dataForLine.width
                this.htmlElemLine2 = createHtmlElementIfNeed(this.htmlElemLine2, targetElement)
                this.htmlElemLine2.style.cursor = 'pointer'
                this.htmlElemLine2.style.position = 'absolute'
                this.htmlElemLine2.style.top = `${p1.y}px`
                this.htmlElemLine2.style.left = `${p1.x}px`
                this.htmlElemLine2.style.width = `${width}px`
                this.htmlElemLine2.style.transform = `rotate(${angle}deg)`
                this.htmlElemLine2.style.boxShadow = this.style.boxShadow
                this.htmlElemLine2.style.border = 'none'
                this.htmlElemLine2.style.background = this.style.background
                this.htmlElemLine2.style.zIndex = 2e3
                this.htmlElemLine.style.transformOrigin = `0px ${height / 2}px`
                this.htmlElemLine.style.height = `${height}px`
            }
            if (this.endPoint && this.originPoint && this.startPoint) {
                const p0 = worldToScreen(this.originPoint, moduleInstance, viewer)
                const p1 = worldToScreen(this.startPoint, moduleInstance, viewer)
                const p = { x: p0.x + (p1.x - p0.x) / 2, y: p0.y + (p1.y - p0.y) / 2 }
                const angleData = `${getAngle(this.startPoint, this.originPoint, this.endPoint, moduleInstance).toFixed(
                    2
                )} deg`
                const widthTitle = angleData.length * 10
                this.htmlElemTitle = createHtmlElementIfNeed(this.htmlElemTitle, targetElement)
                this.htmlElemTitle.style.cursor = 'pointer'
                this.htmlElemTitle.style.font = '10px'
                this.htmlElemTitle.style.color = 'white'
                this.htmlElemTitle.style.position = 'Absolute'
                this.htmlElemTitle.style.top = `${p.y - 15}px`
                this.htmlElemTitle.style.left = `${p.x - widthTitle / 2}px`
                this.htmlElemTitle.style.width = `${widthTitle}px`
                this.htmlElemTitle.style.transformOrigin = '0px 0px'
                this.htmlElemTitle.style.borderRadius = '5px'
                this.htmlElemTitle.style.boxShadow = this.style.boxShadow
                this.htmlElemTitle.style.border = 'none'
                this.htmlElemTitle.style.background = this.style.background
                this.htmlElemTitle.style.zIndex = 2009
                this.htmlElemTitle.style.height = '30px'
                this.htmlElemTitle.style.padding = '2px'
                this.htmlElemTitle.innerHTML = `${angleData}`
            }
        }
        this.setStartPoint = (gePoint) => {
            this.startPoint = gePoint
            drawFn()
        }
        this.setEndPoint = (gePoint) => {
            this.endPoint = gePoint
            drawFn()
        }
        this.setOriginPoint = (gePoint) => {
            this.originPoint = gePoint
            drawFn()
        }
        this.update = () => {
            drawFn()
        }
        this.clear = () => {
            this.endPoint = null
            this.startPoint = null
            this.originPoint = null
            this.htmlElemntP0 = destroyHtmlElement(this.htmlElemntP0, targetElement)
            this.htmlElemntP1 = destroyHtmlElement(this.htmlElemntP1, targetElement)
            this.htmlElemntPOrigin = destroyHtmlElement(this.htmlElemntPOrigin, targetElement)
            this.htmlElemLine1 = destroyHtmlElement(this.htmlElemLine1, targetElement)
            this.htmlElemLine2 = destroyHtmlElement(this.htmlElemLine2, targetElement)
            this.htmlElemTitle = destroyHtmlElement(this.htmlElemTitle, targetElement)
        }
        this.setSelectionReactor = (reactor) => {
            onSetCallback(this.htmlElemntP0, reactor ? reactor.onStartPoint : null)
            onSetCallback(this.htmlElemntP1, reactor ? reactor.onEndPoint : null)
            onSetCallback(this.htmlElemntPOrigin, reactor ? reactor.onOriginPoint : null)
            onSetCallback(this.htmlElemTitle, reactor ? reactor.onTitle : null)
        }
        this.setSelectability = (enable) => {
            onSetSelectability(this.htmlElemntP0, enable)
            onSetSelectability(this.htmlElemntP1, enable)
            onSetSelectability(this.htmlElemTitle, enable)
            onSetSelectability(this.htmlElemntPOrigin, enable)
        }
    }
    function MeasureLineItem(targetElement, viewer, moduleInstance) {
        this.htmlElemStartPoint = null
        this.htmlElemEndPoint = null
        this.htmlElemLine = null
        this.htmlElemTitle = null
        this.startPoint = null
        this.endPoint = null
        this.unit = ''
        this.scale = 1
        this.size = 10
        this.style = {
            border: '2px solid #FFFFFF',
            background: '#009bff',
            color: 'white',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)'
        }
        this.htmlElemStartPoint = createHtmlElementIfNeed(this.htmlElemStartPoint, targetElement)
        this.htmlElemEndPoint = createHtmlElementIfNeed(this.htmlElemEndPoint, targetElement)
        this.htmlElemLine = createHtmlElementIfNeed(this.htmlElemLine, targetElement)
        this.htmlElemTitle = createHtmlElementIfNeed(this.htmlElemTitle, targetElement)
        var drawMeasureLine = () => {
            const pointSize = this.size
            if (this.startPoint) {
                this.htmlElemStartPoint = createHtmlElementIfNeed(this.htmlElemStartPoint, targetElement)
                const pScreenStart = worldToScreen(this.startPoint, moduleInstance, viewer)
                this.htmlElemStartPoint.style.cursor = 'pointer'
                this.htmlElemStartPoint.style.position = 'absolute'
                this.htmlElemStartPoint.style.top = `${pScreenStart.y - pointSize / 2}px`
                this.htmlElemStartPoint.style.left = `${pScreenStart.x - pointSize / 2}px`
                this.htmlElemStartPoint.style.borderRadius = `${pointSize}px`
                this.htmlElemStartPoint.style.border = this.style.border
                this.htmlElemStartPoint.style.background = this.style.background
                this.htmlElemStartPoint.style.zIndex = 2001
                this.htmlElemStartPoint.style.width = `${pointSize}px`
                this.htmlElemStartPoint.style.height = `${pointSize}px`
                this.htmlElemStartPoint.style.boxShadow = this.style.boxShadow
            }
            if (this.endPoint) {
                this.htmlElemEndPoint = createHtmlElementIfNeed(this.htmlElemEndPoint, targetElement)
                const pScreenEnd = worldToScreen(this.endPoint, moduleInstance, viewer)
                this.htmlElemEndPoint.style.cursor = 'pointer'
                this.htmlElemEndPoint.style.position = 'absolute'
                this.htmlElemEndPoint.style.top = `${pScreenEnd.y - pointSize / 2}px`
                this.htmlElemEndPoint.style.left = `${pScreenEnd.x - pointSize / 2}px`
                this.htmlElemEndPoint.style.borderRadius = `${pointSize}px`
                this.htmlElemEndPoint.style.border = this.style.border
                this.htmlElemEndPoint.style.background = this.style.background
                this.htmlElemEndPoint.style.zIndex = 2001
                this.htmlElemEndPoint.style.width = `${pointSize}px`
                this.htmlElemEndPoint.style.height = `${pointSize}px`
                this.htmlElemEndPoint.style.boxShadow = this.style.boxShadow
            }
            if (this.endPoint && this.startPoint) {
                const p1 = worldToScreen(this.startPoint, moduleInstance, viewer)
                const p2 = worldToScreen(this.endPoint, moduleInstance, viewer)
                const dx = p2.x - p1.x
                const dy = p2.y - p1.y
                const dataForLine = getDataForDrawLine(p1, p2)
                const angle = dataForLine.angle
                const width = dataForLine.width
                const height = pointSize / 5 < 1 ? 1 : pointSize / 5
                this.htmlElemLine = createHtmlElementIfNeed(this.htmlElemLine, targetElement)
                this.htmlElemLine.style.cursor = 'pointer'
                this.htmlElemLine.style.position = 'absolute'
                this.htmlElemLine.style.top = `${p1.y}px`
                this.htmlElemLine.style.left = `${p1.x}px`
                this.htmlElemLine.style.width = `${width}px`
                this.htmlElemLine.style.transform = `rotate(${angle}deg)`
                this.htmlElemLine.style.transformOrigin = `0px ${height / 2}px`
                this.htmlElemLine.style.boxShadow = this.style.boxShadow
                this.htmlElemLine.style.border = 'none'
                this.htmlElemLine.style.background = this.style.background
                this.htmlElemLine.style.zIndex = 2e3
                this.htmlElemLine.style.height = `${height}px`
                const distance = `${this.getDistance()}${this.unit}`
                const pX = p1.x + dx / 2
                const pY = p1.y + dy / 2
                const widthTitle = distance.length * 10
                this.htmlElemTitle = createHtmlElementIfNeed(this.htmlElemTitle, targetElement)
                this.htmlElemTitle.style.cursor = 'pointer'
                this.htmlElemTitle.style.font = '10px'
                this.htmlElemTitle.style.color = 'white'
                this.htmlElemTitle.style.position = 'Absolute'
                this.htmlElemTitle.style.top = `${pY}px`
                this.htmlElemTitle.style.left = `${pX - widthTitle / 2}px`
                this.htmlElemTitle.style.width = `${widthTitle}px`
                this.htmlElemTitle.style.transformOrigin = '0px 0px'
                this.htmlElemTitle.style.borderRadius = '5px'
                this.htmlElemTitle.style.boxShadow = this.style.boxShadow
                this.htmlElemTitle.style.border = 'none'
                this.htmlElemTitle.style.background = this.style.background
                this.htmlElemTitle.style.zIndex = 2009
                this.htmlElemTitle.style.height = '20px'
                this.htmlElemTitle.style.padding = '2px'
                this.htmlElemTitle.style.textAlign = 'center'
                this.htmlElemTitle.innerHTML = `${distance}`
            }
        }
        this.getDistance = () => {
            return getDistance(this.startPoint, this.endPoint, moduleInstance) / this.scale
        }
        this.setStartPoint = (gePoint) => {
            this.startPoint = gePoint
            drawMeasureLine()
        }
        this.setEndPoint = (gePoint) => {
            this.endPoint = gePoint
            drawMeasureLine()
        }
        this.update = () => {
            drawMeasureLine()
        }
        this.setSize = (size) => {
            this.size = size
            drawMeasureLine()
        }
        this.clear = () => {
            this.endPoint = null
            this.startPoint = null
            this.htmlElemStartPoint = destroyHtmlElement(this.htmlElemStartPoint, targetElement)
            this.htmlElemEndPoint = destroyHtmlElement(this.htmlElemEndPoint, targetElement)
            this.htmlElemLine = destroyHtmlElement(this.htmlElemLine, targetElement)
            this.htmlElemTitle = destroyHtmlElement(this.htmlElemTitle, targetElement)
        }
        this.setUnit = (unit) => {
            this.unit = unit
            drawMeasureLine()
        }
        this.setConversionFactor = (scale) => {
            this.scale = scale
            drawMeasureLine()
        }
        this.setStyle = (style) => {
            this.style = style
            drawMeasureLine()
        }
        this.setSelectionReactor = (reactor) => {
            onSetCallback(this.htmlElemStartPoint, reactor ? reactor.onStartPoint : null)
            onSetCallback(this.htmlElemEndPoint, reactor ? reactor.onEndPoint : null)
            onSetCallback(this.htmlElemTitle, reactor ? reactor.onTitle : null)
        }
        this.setSelectability = (enable) => {
            onSetSelectability(this.htmlElemStartPoint, enable)
            onSetSelectability(this.htmlElemEndPoint, enable)
            onSetSelectability(this.htmlElemLine, enable)
            onSetSelectability(this.htmlElemTitle, enable)
        }
    }
    function downloadWasm(url, progress) {
        return new Promise(function (resolve, reject) {
            var wasmXHR = new XMLHttpRequest()
            wasmXHR.open('GET', url, true)
            wasmXHR.responseType = 'arraybuffer'
            wasmXHR.onload = function () {
                resolve(wasmXHR.response)
            }
            wasmXHR.onerror = function () {
                reject('error ' + wasmXHR.status)
            }
            progress && (wasmXHR.onprogress = progress)
            wasmXHR.send(null)
        })
    }
    params = params || {}
    var Module = typeof Module !== 'undefined' ? Module : {}
    Module['postRun'] = []
    Module['TOTAL_MEMORY'] = params.TOTAL_MEMORY > 16777216 ? params.TOTAL_MEMORY : 16777216
    Module['locateFile'] = function (url) {
        return params.urlMemFile || './Visualize.js.wasm'
    }
    Module['getTransport'] = function (id) {
        return new TransportService(id)
    }
    Module['getOverlayController'] = function (targetElement, viewer) {
        return new OverlayController(targetElement, viewer, this)
    }
    Module['print'] = function (text) {
        ;(window['Logger'] || console).log(text)
    }
    Module['printErr'] = function (text) {}
    if (params.onprogress) {
        var wasm = downloadWasm(Module['locateFile'](), params.onprogress)
        Module['instantiateWasm'] = function (imports, successCallback) {
            wasm.then(function (wasmBinary) {
                return WebAssembly.instantiate(new Uint8Array(wasmBinary), imports)
            })
                .then(function (output) {
                    successCallback(output.instance)
                })
                .catch(function (e) {
                    console.log('wasm instantiation failed! ' + e)
                })
            return {}
        }
    }
    var moduleOverrides = {}
    var key
    for (key in Module) {
        if (Module.hasOwnProperty(key)) {
            moduleOverrides[key] = Module[key]
        }
    }
    var arguments_ = []
    var thisProgram = './this.program'
    var quit_ = function (status, toThrow) {
        throw toThrow
    }
    var ENVIRONMENT_IS_WEB = false
    var ENVIRONMENT_IS_WORKER = false
    var ENVIRONMENT_IS_NODE = false
    var ENVIRONMENT_IS_SHELL = false
    ENVIRONMENT_IS_WEB = typeof window === 'object'
    ENVIRONMENT_IS_WORKER = typeof importScripts === 'function'
    ENVIRONMENT_IS_NODE =
        typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string'
    ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER
    var scriptDirectory = ''
    function locateFile(path) {
        if (Module['locateFile']) {
            return Module['locateFile'](path, scriptDirectory)
        }
        return scriptDirectory + path
    }
    var read_, readAsync, readBinary, setWindowTitle
    var nodeFS
    var nodePath
    if (ENVIRONMENT_IS_NODE) {
        if (ENVIRONMENT_IS_WORKER) {
            scriptDirectory = require('path').dirname(scriptDirectory) + '/'
        } else {
            scriptDirectory = __dirname + '/'
        }
        read_ = function shell_read(filename, binary) {
            if (!nodeFS) nodeFS = require('fs')
            if (!nodePath) nodePath = require('path')
            filename = nodePath['normalize'](filename)
            return nodeFS['readFileSync'](filename, binary ? null : 'utf8')
        }
        readBinary = function readBinary(filename) {
            var ret = read_(filename, true)
            if (!ret.buffer) {
                ret = new Uint8Array(ret)
            }
            assert(ret.buffer)
            return ret
        }
        if (process['argv'].length > 1) {
            thisProgram = process['argv'][1].replace(/\\/g, '/')
        }
        arguments_ = process['argv'].slice(2)
        if (typeof module !== 'undefined') {
            module['exports'] = Module
        }
        process['on']('uncaughtException', function (ex) {
            if (!(ex instanceof ExitStatus)) {
                throw ex
            }
        })
        process['on']('unhandledRejection', abort)
        quit_ = function (status) {
            process['exit'](status)
        }
        Module['inspect'] = function () {
            return '[Emscripten Module object]'
        }
    } else if (ENVIRONMENT_IS_SHELL) {
        if (typeof read != 'undefined') {
            read_ = function shell_read(f) {
                return read(f)
            }
        }
        readBinary = function readBinary(f) {
            var data
            if (typeof readbuffer === 'function') {
                return new Uint8Array(readbuffer(f))
            }
            data = read(f, 'binary')
            assert(typeof data === 'object')
            return data
        }
        if (typeof scriptArgs != 'undefined') {
            arguments_ = scriptArgs
        } else if (typeof arguments != 'undefined') {
            arguments_ = arguments
        }
        if (typeof quit === 'function') {
            quit_ = function (status) {
                quit(status)
            }
        }
        if (typeof print !== 'undefined') {
            if (typeof console === 'undefined') console = {}
            console.log = print
            console.warn = console.error = typeof printErr !== 'undefined' ? printErr : print
        }
    } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
        if (ENVIRONMENT_IS_WORKER) {
            scriptDirectory = self.location.href
        } else if (document.currentScript) {
            scriptDirectory = document.currentScript.src
        }
        if (scriptDirectory.indexOf('blob:') !== 0) {
            scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/') + 1)
        } else {
            scriptDirectory = ''
        }
        {
            read_ = function shell_read(url) {
                var xhr = new XMLHttpRequest()
                xhr.open('GET', url, false)
                xhr.send(null)
                return xhr.responseText
            }
            if (ENVIRONMENT_IS_WORKER) {
                readBinary = function readBinary(url) {
                    var xhr = new XMLHttpRequest()
                    xhr.open('GET', url, false)
                    xhr.responseType = 'arraybuffer'
                    xhr.send(null)
                    return new Uint8Array(xhr.response)
                }
            }
            readAsync = function readAsync(url, onload, onerror) {
                var xhr = new XMLHttpRequest()
                xhr.open('GET', url, true)
                xhr.responseType = 'arraybuffer'
                xhr.onload = function xhr_onload() {
                    if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
                        onload(xhr.response)
                        return
                    }
                    onerror()
                }
                xhr.onerror = onerror
                xhr.send(null)
            }
        }
        setWindowTitle = function (title) {
            document.title = title
        }
    } else {
    }
    var out = Module['print'] || console.log.bind(console)
    var err = Module['printErr'] || console.warn.bind(console)
    for (key in moduleOverrides) {
        if (moduleOverrides.hasOwnProperty(key)) {
            Module[key] = moduleOverrides[key]
        }
    }
    moduleOverrides = null
    if (Module['arguments']) arguments_ = Module['arguments']
    if (Module['thisProgram']) thisProgram = Module['thisProgram']
    if (Module['quit']) quit_ = Module['quit']
    var STACK_ALIGN = 16
    function alignMemory(size, factor) {
        if (!factor) factor = STACK_ALIGN
        return Math.ceil(size / factor) * factor
    }
    function warnOnce(text) {
        if (!warnOnce.shown) warnOnce.shown = {}
        if (!warnOnce.shown[text]) {
            warnOnce.shown[text] = 1
            err(text)
        }
    }
    function convertJsFunctionToWasm(func, sig) {
        if (typeof WebAssembly.Function === 'function') {
            var typeNames = { i: 'i32', j: 'i64', f: 'f32', d: 'f64' }
            var type = { parameters: [], results: sig[0] == 'v' ? [] : [typeNames[sig[0]]] }
            for (var i = 1; i < sig.length; ++i) {
                type.parameters.push(typeNames[sig[i]])
            }
            return new WebAssembly.Function(type, func)
        }
        var typeSection = [1, 0, 1, 96]
        var sigRet = sig.slice(0, 1)
        var sigParam = sig.slice(1)
        var typeCodes = { i: 127, j: 126, f: 125, d: 124 }
        typeSection.push(sigParam.length)
        for (var i = 0; i < sigParam.length; ++i) {
            typeSection.push(typeCodes[sigParam[i]])
        }
        if (sigRet == 'v') {
            typeSection.push(0)
        } else {
            typeSection = typeSection.concat([1, typeCodes[sigRet]])
        }
        typeSection[1] = typeSection.length - 2
        var bytes = new Uint8Array(
            [0, 97, 115, 109, 1, 0, 0, 0].concat(typeSection, [2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0])
        )
        var module = new WebAssembly.Module(bytes)
        var instance = new WebAssembly.Instance(module, { e: { f: func } })
        var wrappedFunc = instance.exports['f']
        return wrappedFunc
    }
    var freeTableIndexes = []
    var functionsInTableMap
    function addFunctionWasm(func, sig) {
        var table = wasmTable
        if (!functionsInTableMap) {
            functionsInTableMap = new WeakMap()
            for (var i = 0; i < table.length; i++) {
                var item = table.get(i)
                if (item) {
                    functionsInTableMap.set(item, i)
                }
            }
        }
        if (functionsInTableMap.has(func)) {
            return functionsInTableMap.get(func)
        }
        var ret
        if (freeTableIndexes.length) {
            ret = freeTableIndexes.pop()
        } else {
            ret = table.length
            try {
                table.grow(1)
            } catch (err) {
                if (!(err instanceof RangeError)) {
                    throw err
                }
                throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.'
            }
        }
        try {
            table.set(ret, func)
        } catch (err) {
            if (!(err instanceof TypeError)) {
                throw err
            }
            var wrapped = convertJsFunctionToWasm(func, sig)
            table.set(ret, wrapped)
        }
        functionsInTableMap.set(func, ret)
        return ret
    }
    function removeFunctionWasm(index) {
        functionsInTableMap.delete(wasmTable.get(index))
        freeTableIndexes.push(index)
    }
    var tempRet0 = 0
    var setTempRet0 = function (value) {
        tempRet0 = value
    }
    var getTempRet0 = function () {
        return tempRet0
    }
    var wasmBinary
    if (Module['wasmBinary']) wasmBinary = Module['wasmBinary']
    var noExitRuntime
    if (Module['noExitRuntime']) noExitRuntime = Module['noExitRuntime']
    if (typeof WebAssembly !== 'object') {
        abort('no native wasm support detected')
    }
    var wasmMemory
    var wasmTable
    var ABORT = false
    var EXITSTATUS = 0
    function assert(condition, text) {
        if (!condition) {
            abort('Assertion failed: ' + text)
        }
    }
    function getCFunc(ident) {
        var func = Module['_' + ident]
        assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported')
        return func
    }
    function ccall(ident, returnType, argTypes, args, opts) {
        var toC = {
            string: function (str) {
                var ret = 0
                if (str !== null && str !== undefined && str !== 0) {
                    var len = (str.length << 2) + 1
                    ret = stackAlloc(len)
                    stringToUTF8(str, ret, len)
                }
                return ret
            },
            array: function (arr) {
                var ret = stackAlloc(arr.length)
                writeArrayToMemory(arr, ret)
                return ret
            }
        }
        function convertReturnValue(ret) {
            if (returnType === 'string') return UTF8ToString(ret)
            if (returnType === 'boolean') return Boolean(ret)
            return ret
        }
        var func = getCFunc(ident)
        var cArgs = []
        var stack = 0
        if (args) {
            for (var i = 0; i < args.length; i++) {
                var converter = toC[argTypes[i]]
                if (converter) {
                    if (stack === 0) stack = stackSave()
                    cArgs[i] = converter(args[i])
                } else {
                    cArgs[i] = args[i]
                }
            }
        }
        var ret = func.apply(null, cArgs)
        ret = convertReturnValue(ret)
        if (stack !== 0) stackRestore(stack)
        return ret
    }
    var ALLOC_STACK = 1
    var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined
    function UTF8ArrayToString(heap, idx, maxBytesToRead) {
        idx >>>= 0
        var endIdx = idx + maxBytesToRead
        var endPtr = idx
        while (heap[endPtr >>> 0] && !(endPtr >= endIdx)) ++endPtr
        if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
            return UTF8Decoder.decode(heap.subarray(idx >>> 0, endPtr >>> 0))
        } else {
            var str = ''
            while (idx < endPtr) {
                var u0 = heap[idx++ >>> 0]
                if (!(u0 & 128)) {
                    str += String.fromCharCode(u0)
                    continue
                }
                var u1 = heap[idx++ >>> 0] & 63
                if ((u0 & 224) == 192) {
                    str += String.fromCharCode(((u0 & 31) << 6) | u1)
                    continue
                }
                var u2 = heap[idx++ >>> 0] & 63
                if ((u0 & 240) == 224) {
                    u0 = ((u0 & 15) << 12) | (u1 << 6) | u2
                } else {
                    u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heap[idx++ >>> 0] & 63)
                }
                if (u0 < 65536) {
                    str += String.fromCharCode(u0)
                } else {
                    var ch = u0 - 65536
                    str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023))
                }
            }
        }
        return str
    }
    function UTF8ToString(ptr, maxBytesToRead) {
        ptr >>>= 0
        return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ''
    }
    function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
        outIdx >>>= 0
        if (!(maxBytesToWrite > 0)) return 0
        var startIdx = outIdx
        var endIdx = outIdx + maxBytesToWrite - 1
        for (var i = 0; i < str.length; ++i) {
            var u = str.charCodeAt(i)
            if (u >= 55296 && u <= 57343) {
                var u1 = str.charCodeAt(++i)
                u = (65536 + ((u & 1023) << 10)) | (u1 & 1023)
            }
            if (u <= 127) {
                if (outIdx >= endIdx) break
                heap[outIdx++ >>> 0] = u
            } else if (u <= 2047) {
                if (outIdx + 1 >= endIdx) break
                heap[outIdx++ >>> 0] = 192 | (u >> 6)
                heap[outIdx++ >>> 0] = 128 | (u & 63)
            } else if (u <= 65535) {
                if (outIdx + 2 >= endIdx) break
                heap[outIdx++ >>> 0] = 224 | (u >> 12)
                heap[outIdx++ >>> 0] = 128 | ((u >> 6) & 63)
                heap[outIdx++ >>> 0] = 128 | (u & 63)
            } else {
                if (outIdx + 3 >= endIdx) break
                heap[outIdx++ >>> 0] = 240 | (u >> 18)
                heap[outIdx++ >>> 0] = 128 | ((u >> 12) & 63)
                heap[outIdx++ >>> 0] = 128 | ((u >> 6) & 63)
                heap[outIdx++ >>> 0] = 128 | (u & 63)
            }
        }
        heap[outIdx >>> 0] = 0
        return outIdx - startIdx
    }
    function stringToUTF8(str, outPtr, maxBytesToWrite) {
        return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
    }
    function lengthBytesUTF8(str) {
        var len = 0
        for (var i = 0; i < str.length; ++i) {
            var u = str.charCodeAt(i)
            if (u >= 55296 && u <= 57343) u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023)
            if (u <= 127) ++len
            else if (u <= 2047) len += 2
            else if (u <= 65535) len += 3
            else len += 4
        }
        return len
    }
    var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined
    function UTF16ToString(ptr, maxBytesToRead) {
        var endPtr = ptr
        var idx = endPtr >> 1
        var maxIdx = idx + maxBytesToRead / 2
        while (!(idx >= maxIdx) && HEAPU16[idx >>> 0]) ++idx
        endPtr = idx << 1
        if (endPtr - ptr > 32 && UTF16Decoder) {
            return UTF16Decoder.decode(HEAPU8.subarray(ptr >>> 0, endPtr >>> 0))
        } else {
            var i = 0
            var str = ''
            while (1) {
                var codeUnit = HEAP16[(ptr + i * 2) >>> 1]
                if (codeUnit == 0 || i == maxBytesToRead / 2) return str
                ++i
                str += String.fromCharCode(codeUnit)
            }
        }
    }
    function stringToUTF16(str, outPtr, maxBytesToWrite) {
        if (maxBytesToWrite === undefined) {
            maxBytesToWrite = 2147483647
        }
        if (maxBytesToWrite < 2) return 0
        maxBytesToWrite -= 2
        var startPtr = outPtr
        var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length
        for (var i = 0; i < numCharsToWrite; ++i) {
            var codeUnit = str.charCodeAt(i)
            HEAP16[outPtr >>> 1] = codeUnit
            outPtr += 2
        }
        HEAP16[outPtr >>> 1] = 0
        return outPtr - startPtr
    }
    function lengthBytesUTF16(str) {
        return str.length * 2
    }
    function UTF32ToString(ptr, maxBytesToRead) {
        var i = 0
        var str = ''
        while (!(i >= maxBytesToRead / 4)) {
            var utf32 = HEAP32[(ptr + i * 4) >>> 2]
            if (utf32 == 0) break
            ++i
            if (utf32 >= 65536) {
                var ch = utf32 - 65536
                str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023))
            } else {
                str += String.fromCharCode(utf32)
            }
        }
        return str
    }
    function stringToUTF32(str, outPtr, maxBytesToWrite) {
        outPtr >>>= 0
        if (maxBytesToWrite === undefined) {
            maxBytesToWrite = 2147483647
        }
        if (maxBytesToWrite < 4) return 0
        var startPtr = outPtr
        var endPtr = startPtr + maxBytesToWrite - 4
        for (var i = 0; i < str.length; ++i) {
            var codeUnit = str.charCodeAt(i)
            if (codeUnit >= 55296 && codeUnit <= 57343) {
                var trailSurrogate = str.charCodeAt(++i)
                codeUnit = (65536 + ((codeUnit & 1023) << 10)) | (trailSurrogate & 1023)
            }
            HEAP32[outPtr >>> 2] = codeUnit
            outPtr += 4
            if (outPtr + 4 > endPtr) break
        }
        HEAP32[outPtr >>> 2] = 0
        return outPtr - startPtr
    }
    function lengthBytesUTF32(str) {
        var len = 0
        for (var i = 0; i < str.length; ++i) {
            var codeUnit = str.charCodeAt(i)
            if (codeUnit >= 55296 && codeUnit <= 57343) ++i
            len += 4
        }
        return len
    }
    function allocateUTF8(str) {
        var size = lengthBytesUTF8(str) + 1
        var ret = _malloc(size)
        if (ret) stringToUTF8Array(str, HEAP8, ret, size)
        return ret
    }
    function writeArrayToMemory(array, buffer) {
        HEAP8.set(array, buffer >>> 0)
    }
    function writeAsciiToMemory(str, buffer, dontAddNull) {
        for (var i = 0; i < str.length; ++i) {
            HEAP8[buffer++ >>> 0] = str.charCodeAt(i)
        }
        if (!dontAddNull) HEAP8[buffer >>> 0] = 0
    }
    var WASM_PAGE_SIZE = 65536
    function alignUp(x, multiple) {
        if (x % multiple > 0) {
            x += multiple - (x % multiple)
        }
        return x
    }
    var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64
    function updateGlobalBufferAndViews(buf) {
        buffer = buf
        Module['HEAP8'] = HEAP8 = new Int8Array(buf)
        Module['HEAP16'] = HEAP16 = new Int16Array(buf)
        Module['HEAP32'] = HEAP32 = new Int32Array(buf)
        Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf)
        Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf)
        Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf)
        Module['HEAPF32'] = HEAPF32 = new Float32Array(buf)
        Module['HEAPF64'] = HEAPF64 = new Float64Array(buf)
    }
    var STACK_BASE = 8469712
    var INITIAL_INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216
    if (Module['wasmMemory']) {
        wasmMemory = Module['wasmMemory']
    } else {
        wasmMemory = new WebAssembly.Memory({
            initial: INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE,
            maximum: 4294967296 / WASM_PAGE_SIZE
        })
    }
    if (wasmMemory) {
        buffer = wasmMemory.buffer
    }
    INITIAL_INITIAL_MEMORY = buffer.byteLength
    updateGlobalBufferAndViews(buffer)
    var __ATPRERUN__ = []
    var __ATINIT__ = []
    var __ATMAIN__ = []
    var __ATEXIT__ = []
    var __ATPOSTRUN__ = []
    var runtimeInitialized = false
    var runtimeExited = false
    function preRun() {
        if (Module['preRun']) {
            if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']]
            while (Module['preRun'].length) {
                addOnPreRun(Module['preRun'].shift())
            }
        }
        callRuntimeCallbacks(__ATPRERUN__)
    }
    function initRuntime() {
        runtimeInitialized = true
        if (!Module['noFSInit'] && !FS.init.initialized) FS.init()
        TTY.init()
        callRuntimeCallbacks(__ATINIT__)
    }
    function preMain() {
        FS.ignorePermissions = false
        callRuntimeCallbacks(__ATMAIN__)
    }
    function exitRuntime() {
        runtimeExited = true
    }
    function postRun() {
        if (Module['postRun']) {
            if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']]
            while (Module['postRun'].length) {
                addOnPostRun(Module['postRun'].shift())
            }
        }
        callRuntimeCallbacks(__ATPOSTRUN__)
    }
    function addOnPreRun(cb) {
        __ATPRERUN__.unshift(cb)
    }
    function addOnPostRun(cb) {
        __ATPOSTRUN__.unshift(cb)
    }
    var runDependencies = 0
    var runDependencyWatcher = null
    var dependenciesFulfilled = null
    function getUniqueRunDependency(id) {
        return id
    }
    function addRunDependency(id) {
        runDependencies++
        if (Module['monitorRunDependencies']) {
            Module['monitorRunDependencies'](runDependencies)
        }
    }
    function removeRunDependency(id) {
        runDependencies--
        if (Module['monitorRunDependencies']) {
            Module['monitorRunDependencies'](runDependencies)
        }
        if (runDependencies == 0) {
            if (runDependencyWatcher !== null) {
                clearInterval(runDependencyWatcher)
                runDependencyWatcher = null
            }
            if (dependenciesFulfilled) {
                var callback = dependenciesFulfilled
                dependenciesFulfilled = null
                callback()
            }
        }
    }
    Module['preloadedImages'] = {}
    Module['preloadedAudios'] = {}
    function abort(what) {
        if (Module['onAbort']) {
            Module['onAbort'](what)
        }
        what += ''
        err(what)
        ABORT = true
        EXITSTATUS = 1
        what = 'abort(' + what + '). Build with -s ASSERTIONS=1 for more info.'
        var e = new WebAssembly.RuntimeError(what)
        throw e
    }
    function hasPrefix(str, prefix) {
        return String.prototype.startsWith ? str.startsWith(prefix) : str.indexOf(prefix) === 0
    }
    var dataURIPrefix = 'data:application/octet-stream;base64,'
    function isDataURI(filename) {
        return hasPrefix(filename, dataURIPrefix)
    }
    var fileURIPrefix = 'file://'
    function isFileURI(filename) {
        return hasPrefix(filename, fileURIPrefix)
    }
    var wasmBinaryFile = 'VisualizeJSWasm.wasm'
    if (!isDataURI(wasmBinaryFile)) {
        wasmBinaryFile = locateFile(wasmBinaryFile)
    }
    function getBinary() {
        try {
            if (wasmBinary) {
                return new Uint8Array(wasmBinary)
            }
            if (readBinary) {
                return readBinary(wasmBinaryFile)
            } else {
                throw 'both async and sync fetching of the wasm failed'
            }
        } catch (err) {
            abort(err)
        }
    }
    function getBinaryPromise() {
        if (
            !wasmBinary &&
            (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) &&
            typeof fetch === 'function' &&
            !isFileURI(wasmBinaryFile)
        ) {
            return fetch(wasmBinaryFile, { credentials: 'same-origin' })
                .then(function (response) {
                    if (!response['ok']) {
                        throw "failed to load wasm binary file at '" + wasmBinaryFile + "'"
                    }
                    return response['arrayBuffer']()
                })
                .catch(function () {
                    return getBinary()
                })
        }
        return Promise.resolve().then(getBinary)
    }
    function createWasm() {
        var info = { env: asmLibraryArg, wasi_snapshot_preview1: asmLibraryArg }
        function receiveInstance(instance, module) {
            var exports = instance.exports
            Module['asm'] = exports
            wasmTable = Module['asm']['__indirect_function_table']
            removeRunDependency('wasm-instantiate')
        }
        addRunDependency('wasm-instantiate')
        function receiveInstantiatedSource(output) {
            receiveInstance(output['instance'])
        }
        function instantiateArrayBuffer(receiver) {
            return getBinaryPromise()
                .then(function (binary) {
                    return WebAssembly.instantiate(binary, info)
                })
                .then(receiver, function (reason) {
                    err('failed to asynchronously prepare wasm: ' + reason)
                    abort(reason)
                })
        }
        function instantiateAsync() {
            if (
                !wasmBinary &&
                typeof WebAssembly.instantiateStreaming === 'function' &&
                !isDataURI(wasmBinaryFile) &&
                !isFileURI(wasmBinaryFile) &&
                typeof fetch === 'function'
            ) {
                fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
                    var result = WebAssembly.instantiateStreaming(response, info)
                    return result.then(receiveInstantiatedSource, function (reason) {
                        err('wasm streaming compile failed: ' + reason)
                        err('falling back to ArrayBuffer instantiation')
                        return instantiateArrayBuffer(receiveInstantiatedSource)
                    })
                })
            } else {
                return instantiateArrayBuffer(receiveInstantiatedSource)
            }
        }
        if (Module['instantiateWasm']) {
            try {
                var exports = Module['instantiateWasm'](info, receiveInstance)
                return exports
            } catch (e) {
                err('Module.instantiateWasm callback failed with error: ' + e)
                return false
            }
        }
        instantiateAsync()
        return {}
    }
    var tempDouble
    var tempI64
    var ASM_CONSTS = {
        27756: function () {
            var _initializeBuffers = function (glCtx, frameBuffer, renderbuffer, frameTexture) {
                glCtx.bindTexture(glCtx.TEXTURE_2D, frameTexture)
                glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.LINEAR)
                glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, glCtx.LINEAR_MIPMAP_NEAREST)
                glCtx.generateMipmap(glCtx.TEXTURE_2D)
                glCtx.texImage2D(
                    glCtx.TEXTURE_2D,
                    0,
                    glCtx.RGBA,
                    frameBuffer.width,
                    frameBuffer.height,
                    0,
                    glCtx.RGBA,
                    glCtx.UNSIGNED_BYTE,
                    null
                )
                glCtx.bindRenderbuffer(glCtx.RENDERBUFFER, renderbuffer)
                glCtx.renderbufferStorage(
                    glCtx.RENDERBUFFER,
                    glCtx.DEPTH_COMPONENT16,
                    frameBuffer.width,
                    frameBuffer.height
                )
                glCtx.framebufferTexture2D(
                    glCtx.FRAMEBUFFER,
                    glCtx.COLOR_ATTACHMENT0,
                    glCtx.TEXTURE_2D,
                    frameTexture,
                    0
                )
                glCtx.framebufferRenderbuffer(
                    glCtx.FRAMEBUFFER,
                    glCtx.DEPTH_ATTACHMENT,
                    glCtx.RENDERBUFFER,
                    renderbuffer
                )
                glCtx.bindTexture(glCtx.TEXTURE_2D, null)
                glCtx.bindRenderbuffer(glCtx.RENDERBUFFER, null)
                glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, null)
                glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, frameBuffer)
            }
            var _unitializeBuffer = function (glCtx, frameBuffer, renderbuffer, frameTexture) {
                glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, null)
                glCtx.deleteFramebuffer(frameBuffer)
                glCtx.deleteRenderbuffer(renderbuffer)
                glCtx.deleteTexture(frameTexture)
            }
            var _readPixels = function (glCtx, frameBuffer) {
                var pixels = new Uint8Array(4 * frameBuffer.width * frameBuffer.height)
                glCtx.readPixels(0, 0, frameBuffer.width, frameBuffer.height, glCtx.RGBA, glCtx.UNSIGNED_BYTE, pixels)
                return pixels
            }
            Module.Viewer.prototype.captureScreen = function (width, height, cb) {
                try {
                    var glCtx = Module.ctx
                    var widthOrigin = Module.canvas.width || Module.canvas.clientWidth
                    var heightOrigin = Module.canvas.height || Module.canvas.clientHeight
                    this.resize(0, width, height, 0)
                    var frameBuffer = glCtx.createFramebuffer()
                    var renderbuffer = glCtx.createRenderbuffer()
                    var frameTexture = glCtx.createTexture()
                    glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, frameBuffer)
                    frameBuffer.width = width
                    frameBuffer.height = height
                    _initializeBuffers(glCtx, frameBuffer, renderbuffer, frameTexture)
                    this.update()
                    var pixels = _readPixels(glCtx, frameBuffer)
                    _unitializeBuffer(glCtx, frameBuffer, renderbuffer, frameTexture)
                    this.resize(0, widthOrigin, heightOrigin, 0)
                    this.update()
                    cb(null, pixels)
                } catch (exp) {
                    cb(exp)
                }
            }
            Module.Viewer.prototype.addEmbedetFile = function (name, b) {
                console.log('Method addEmbedetFile is deprecated use addEmbeddedFile, remove in next releas')
                return this.addEmbedetFileWrapper(name, b)
            }
            Module.Viewer.prototype.writeToStream = function (cb) {
                return this.writeToStreamWrapper(function (offset, length) {
                    cb(Module.HEAP8.subarray(offset, offset + length))
                })
            }
            Module.OdTvRasterImage.prototype.setBinaryData = function (format, width, height, iAlignment, b) {
                return this.setBinaryData(format, width, height, iAlignment, b.byteLength, function (s, d, n) {
                    Module.HEAP8.set(b.subarray(s, s + n), d)
                })
            }
            Module.Viewer.prototype.openUrl = function (url, headers) {
                return Module.openUrl(this, url, headers)
            }
        },
        53036: function ($0) {
            if (!Module['canvas']) {
                console.error(
                    "Canvas is not set to module, please use vsLib.canvas = document.querySelector('#canvas');"
                )
            }
            return Module['canvas'] ? Module.canvas['width'] || canvas.clientWidth || $0 : $0
        },
        53261: function ($0) {
            if (!Module['canvas']) {
                console.error(
                    "Canvas is not set to module, please use vsLib.canvas = document.querySelector('#canvas');"
                )
            }
            return Module['canvas'] ? Module.canvas['height'] || canvas.clientHeight || $0 : $0
        },
        357778: function ($0, $1) {
            Module.HpTrc.Usd += $1
            Module.HpTrc.P2N[$0] = $1
        },
        357829: function ($0) {
            Module.HpTrc.Usd -= Module.HpTrc.P2N[$0] || 0
            delete Module.HpTrc.P2N[$0]
        },
        357909: function () {
            Module.HpTrc = {}
            Module.HpTrc.P2N = {}
            Module.HpTrc.Usd = 0
        },
        703172: function () {
            if (!Module['canvas']) {
                console.error(
                    "Canvas is not set to module, please use module.canvas = document.querySelector('#canvas');"
                )
                return 0
            }
            var target = '#canvas'
            if (Module['canvas']['id']) {
                target = '#' + Module['canvas']['id']
            }
            var lengthBytes = lengthBytesUTF8(target) + 1
            var stringOnWasmHeap = _malloc(lengthBytes)
            stringToUTF8(target, stringOnWasmHeap, lengthBytes)
            return stringOnWasmHeap
        }
    }
    function callRuntimeCallbacks(callbacks) {
        while (callbacks.length > 0) {
            var callback = callbacks.shift()
            if (typeof callback == 'function') {
                callback(Module)
                continue
            }
            var func = callback.func
            if (typeof func === 'number') {
                if (callback.arg === undefined) {
                    wasmTable.get(func)()
                } else {
                    wasmTable.get(func)(callback.arg)
                }
            } else {
                func(callback.arg === undefined ? null : callback.arg)
            }
        }
    }
    function demangle(func) {
        return func
    }
    function demangleAll(text) {
        var regex = /\b_Z[\w\d_]+/g
        return text.replace(regex, function (x) {
            var y = demangle(x)
            return x === y ? x : y + ' [' + x + ']'
        })
    }
    function dynCallLegacy(sig, ptr, args) {
        if (args && args.length) {
            return Module['dynCall_' + sig].apply(null, [ptr].concat(args))
        }
        return Module['dynCall_' + sig].call(null, ptr)
    }
    function dynCall(sig, ptr, args) {
        if (sig.indexOf('j') != -1) {
            return dynCallLegacy(sig, ptr, args)
        }
        return wasmTable.get(ptr).apply(null, args)
    }
    function jsStackTrace() {
        var error = new Error()
        if (!error.stack) {
            try {
                throw new Error()
            } catch (e) {
                error = e
            }
            if (!error.stack) {
                return '(no stack trace available)'
            }
        }
        return error.stack.toString()
    }
    function stackTrace() {
        var js = jsStackTrace()
        if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']()
        return demangleAll(js)
    }
    function _tzset() {
        if (_tzset.called) return
        _tzset.called = true
        var currentYear = new Date().getFullYear()
        var winter = new Date(currentYear, 0, 1)
        var summer = new Date(currentYear, 6, 1)
        var winterOffset = winter.getTimezoneOffset()
        var summerOffset = summer.getTimezoneOffset()
        var stdTimezoneOffset = Math.max(winterOffset, summerOffset)
        HEAP32[__get_timezone() >>> 2] = stdTimezoneOffset * 60
        HEAP32[__get_daylight() >>> 2] = Number(winterOffset != summerOffset)
        function extractZone(date) {
            var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/)
            return match ? match[1] : 'GMT'
        }
        var winterName = extractZone(winter)
        var summerName = extractZone(summer)
        var winterNamePtr = allocateUTF8(winterName)
        var summerNamePtr = allocateUTF8(summerName)
        if (summerOffset < winterOffset) {
            HEAP32[__get_tzname() >>> 2] = winterNamePtr
            HEAP32[(__get_tzname() + 4) >>> 2] = summerNamePtr
        } else {
            HEAP32[__get_tzname() >>> 2] = summerNamePtr
            HEAP32[(__get_tzname() + 4) >>> 2] = winterNamePtr
        }
    }
    function _mktime(tmPtr) {
        _tzset()
        var date = new Date(
            HEAP32[(tmPtr + 20) >>> 2] + 1900,
            HEAP32[(tmPtr + 16) >>> 2],
            HEAP32[(tmPtr + 12) >>> 2],
            HEAP32[(tmPtr + 8) >>> 2],
            HEAP32[(tmPtr + 4) >>> 2],
            HEAP32[tmPtr >>> 2],
            0
        )
        var dst = HEAP32[(tmPtr + 32) >>> 2]
        var guessedOffset = date.getTimezoneOffset()
        var start = new Date(date.getFullYear(), 0, 1)
        var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset()
        var winterOffset = start.getTimezoneOffset()
        var dstOffset = Math.min(winterOffset, summerOffset)
        if (dst < 0) {
            HEAP32[(tmPtr + 32) >>> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset)
        } else if (dst > 0 != (dstOffset == guessedOffset)) {
            var nonDstOffset = Math.max(winterOffset, summerOffset)
            var trueOffset = dst > 0 ? dstOffset : nonDstOffset
            date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4)
        }
        HEAP32[(tmPtr + 24) >>> 2] = date.getDay()
        var yday = ((date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) | 0
        HEAP32[(tmPtr + 28) >>> 2] = yday
        return (date.getTime() / 1e3) | 0
    }
    function _asctime_r(tmPtr, buf) {
        var date = {
            tm_sec: HEAP32[tmPtr >>> 2],
            tm_min: HEAP32[(tmPtr + 4) >>> 2],
            tm_hour: HEAP32[(tmPtr + 8) >>> 2],
            tm_mday: HEAP32[(tmPtr + 12) >>> 2],
            tm_mon: HEAP32[(tmPtr + 16) >>> 2],
            tm_year: HEAP32[(tmPtr + 20) >>> 2],
            tm_wday: HEAP32[(tmPtr + 24) >>> 2]
        }
        var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        var s =
            days[date.tm_wday] +
            ' ' +
            months[date.tm_mon] +
            (date.tm_mday < 10 ? '  ' : ' ') +
            date.tm_mday +
            (date.tm_hour < 10 ? ' 0' : ' ') +
            date.tm_hour +
            (date.tm_min < 10 ? ':0' : ':') +
            date.tm_min +
            (date.tm_sec < 10 ? ':0' : ':') +
            date.tm_sec +
            ' ' +
            (1900 + date.tm_year) +
            '\n'
        stringToUTF8(s, buf, 26)
        return buf
    }
    function ___asctime_r(a0, a1) {
        return _asctime_r(a0, a1)
    }
    var ExceptionInfoAttrs = {
        DESTRUCTOR_OFFSET: 0,
        REFCOUNT_OFFSET: 4,
        TYPE_OFFSET: 8,
        CAUGHT_OFFSET: 12,
        RETHROWN_OFFSET: 13,
        SIZE: 16
    }
    function ___cxa_allocate_exception(size) {
        return _malloc(size + ExceptionInfoAttrs.SIZE) + ExceptionInfoAttrs.SIZE
    }
    function _atexit(func, arg) {}
    function ___cxa_atexit(a0, a1) {
        return _atexit(a0, a1)
    }
    var exceptionCaught = []
    var exceptionLast = 0
    function ___cxa_rethrow() {
        var catchInfo = exceptionCaught.pop()
        var info = catchInfo.get_exception_info()
        var ptr = catchInfo.get_base_ptr()
        if (!info.get_rethrown()) {
            exceptionCaught.push(catchInfo)
            info.set_rethrown(true)
        } else {
            catchInfo.free()
        }
        exceptionLast = ptr
        throw ptr
    }
    function ___cxa_thread_atexit(a0, a1) {
        return _atexit(a0, a1)
    }
    function ExceptionInfo(excPtr) {
        this.excPtr = excPtr
        this.ptr = excPtr - ExceptionInfoAttrs.SIZE
        this.set_type = function (type) {
            HEAP32[(this.ptr + ExceptionInfoAttrs.TYPE_OFFSET) >>> 2] = type
        }
        this.get_type = function () {
            return HEAP32[(this.ptr + ExceptionInfoAttrs.TYPE_OFFSET) >>> 2]
        }
        this.set_destructor = function (destructor) {
            HEAP32[(this.ptr + ExceptionInfoAttrs.DESTRUCTOR_OFFSET) >>> 2] = destructor
        }
        this.get_destructor = function () {
            return HEAP32[(this.ptr + ExceptionInfoAttrs.DESTRUCTOR_OFFSET) >>> 2]
        }
        this.set_refcount = function (refcount) {
            HEAP32[(this.ptr + ExceptionInfoAttrs.REFCOUNT_OFFSET) >>> 2] = refcount
        }
        this.set_caught = function (caught) {
            caught = caught ? 1 : 0
            HEAP8[(this.ptr + ExceptionInfoAttrs.CAUGHT_OFFSET) >>> 0] = caught
        }
        this.get_caught = function () {
            return HEAP8[(this.ptr + ExceptionInfoAttrs.CAUGHT_OFFSET) >>> 0] != 0
        }
        this.set_rethrown = function (rethrown) {
            rethrown = rethrown ? 1 : 0
            HEAP8[(this.ptr + ExceptionInfoAttrs.RETHROWN_OFFSET) >>> 0] = rethrown
        }
        this.get_rethrown = function () {
            return HEAP8[(this.ptr + ExceptionInfoAttrs.RETHROWN_OFFSET) >>> 0] != 0
        }
        this.init = function (type, destructor) {
            this.set_type(type)
            this.set_destructor(destructor)
            this.set_refcount(0)
            this.set_caught(false)
            this.set_rethrown(false)
        }
        this.add_ref = function () {
            var value = HEAP32[(this.ptr + ExceptionInfoAttrs.REFCOUNT_OFFSET) >>> 2]
            HEAP32[(this.ptr + ExceptionInfoAttrs.REFCOUNT_OFFSET) >>> 2] = value + 1
        }
        this.release_ref = function () {
            var prev = HEAP32[(this.ptr + ExceptionInfoAttrs.REFCOUNT_OFFSET) >>> 2]
            HEAP32[(this.ptr + ExceptionInfoAttrs.REFCOUNT_OFFSET) >>> 2] = prev - 1
            return prev === 1
        }
    }
    function __ZSt18uncaught_exceptionv() {
        return __ZSt18uncaught_exceptionv.uncaught_exceptions > 0
    }
    function ___cxa_throw(ptr, type, destructor) {
        var info = new ExceptionInfo(ptr)
        info.init(type, destructor)
        exceptionLast = ptr
        if (!('uncaught_exception' in __ZSt18uncaught_exceptionv)) {
            __ZSt18uncaught_exceptionv.uncaught_exceptions = 1
        } else {
            __ZSt18uncaught_exceptionv.uncaught_exceptions++
        }
        throw ptr
    }
    function _gmtime_r(time, tmPtr) {
        var date = new Date(HEAP32[time >>> 2] * 1e3)
        HEAP32[tmPtr >>> 2] = date.getUTCSeconds()
        HEAP32[(tmPtr + 4) >>> 2] = date.getUTCMinutes()
        HEAP32[(tmPtr + 8) >>> 2] = date.getUTCHours()
        HEAP32[(tmPtr + 12) >>> 2] = date.getUTCDate()
        HEAP32[(tmPtr + 16) >>> 2] = date.getUTCMonth()
        HEAP32[(tmPtr + 20) >>> 2] = date.getUTCFullYear() - 1900
        HEAP32[(tmPtr + 24) >>> 2] = date.getUTCDay()
        HEAP32[(tmPtr + 36) >>> 2] = 0
        HEAP32[(tmPtr + 32) >>> 2] = 0
        var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0)
        var yday = ((date.getTime() - start) / (1e3 * 60 * 60 * 24)) | 0
        HEAP32[(tmPtr + 28) >>> 2] = yday
        if (!_gmtime_r.GMTString) _gmtime_r.GMTString = allocateUTF8('GMT')
        HEAP32[(tmPtr + 40) >>> 2] = _gmtime_r.GMTString
        return tmPtr
    }
    function ___gmtime_r(a0, a1) {
        return _gmtime_r(a0, a1)
    }
    function _localtime_r(time, tmPtr) {
        _tzset()
        var date = new Date(HEAP32[time >>> 2] * 1e3)
        HEAP32[tmPtr >>> 2] = date.getSeconds()
        HEAP32[(tmPtr + 4) >>> 2] = date.getMinutes()
        HEAP32[(tmPtr + 8) >>> 2] = date.getHours()
        HEAP32[(tmPtr + 12) >>> 2] = date.getDate()
        HEAP32[(tmPtr + 16) >>> 2] = date.getMonth()
        HEAP32[(tmPtr + 20) >>> 2] = date.getFullYear() - 1900
        HEAP32[(tmPtr + 24) >>> 2] = date.getDay()
        var start = new Date(date.getFullYear(), 0, 1)
        var yday = ((date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) | 0
        HEAP32[(tmPtr + 28) >>> 2] = yday
        HEAP32[(tmPtr + 36) >>> 2] = -(date.getTimezoneOffset() * 60)
        var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset()
        var winterOffset = start.getTimezoneOffset()
        var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0
        HEAP32[(tmPtr + 32) >>> 2] = dst
        var zonePtr = HEAP32[(__get_tzname() + (dst ? 4 : 0)) >>> 2]
        HEAP32[(tmPtr + 40) >>> 2] = zonePtr
        return tmPtr
    }
    function ___localtime_r(a0, a1) {
        return _localtime_r(a0, a1)
    }
    var PATH = {
        splitPath: function (filename) {
            var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
            return splitPathRe.exec(filename).slice(1)
        },
        normalizeArray: function (parts, allowAboveRoot) {
            var up = 0
            for (var i = parts.length - 1; i >= 0; i--) {
                var last = parts[i]
                if (last === '.') {
                    parts.splice(i, 1)
                } else if (last === '..') {
                    parts.splice(i, 1)
                    up++
                } else if (up) {
                    parts.splice(i, 1)
                    up--
                }
            }
            if (allowAboveRoot) {
                for (; up; up--) {
                    parts.unshift('..')
                }
            }
            return parts
        },
        normalize: function (path) {
            var isAbsolute = path.charAt(0) === '/',
                trailingSlash = path.substr(-1) === '/'
            path = PATH.normalizeArray(
                path.split('/').filter(function (p) {
                    return !!p
                }),
                !isAbsolute
            ).join('/')
            if (!path && !isAbsolute) {
                path = '.'
            }
            if (path && trailingSlash) {
                path += '/'
            }
            return (isAbsolute ? '/' : '') + path
        },
        dirname: function (path) {
            var result = PATH.splitPath(path),
                root = result[0],
                dir = result[1]
            if (!root && !dir) {
                return '.'
            }
            if (dir) {
                dir = dir.substr(0, dir.length - 1)
            }
            return root + dir
        },
        basename: function (path) {
            if (path === '/') return '/'
            path = PATH.normalize(path)
            path = path.replace(/\/$/, '')
            var lastSlash = path.lastIndexOf('/')
            if (lastSlash === -1) return path
            return path.substr(lastSlash + 1)
        },
        extname: function (path) {
            return PATH.splitPath(path)[3]
        },
        join: function () {
            var paths = Array.prototype.slice.call(arguments, 0)
            return PATH.normalize(paths.join('/'))
        },
        join2: function (l, r) {
            return PATH.normalize(l + '/' + r)
        }
    }
    function setErrNo(value) {
        HEAP32[___errno_location() >>> 2] = value
        return value
    }
    function getRandomDevice() {
        if (typeof crypto === 'object' && typeof crypto['getRandomValues'] === 'function') {
            var randomBuffer = new Uint8Array(1)
            return function () {
                crypto.getRandomValues(randomBuffer)
                return randomBuffer[0]
            }
        } else if (ENVIRONMENT_IS_NODE) {
            try {
                var crypto_module = require('crypto')
                return function () {
                    return crypto_module['randomBytes'](1)[0]
                }
            } catch (e) {}
        }
        return function () {
            abort('randomDevice')
        }
    }
    var PATH_FS = {
        resolve: function () {
            var resolvedPath = '',
                resolvedAbsolute = false
            for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                var path = i >= 0 ? arguments[i] : FS.cwd()
                if (typeof path !== 'string') {
                    throw new TypeError('Arguments to path.resolve must be strings')
                } else if (!path) {
                    return ''
                }
                resolvedPath = path + '/' + resolvedPath
                resolvedAbsolute = path.charAt(0) === '/'
            }
            resolvedPath = PATH.normalizeArray(
                resolvedPath.split('/').filter(function (p) {
                    return !!p
                }),
                !resolvedAbsolute
            ).join('/')
            return (resolvedAbsolute ? '/' : '') + resolvedPath || '.'
        },
        relative: function (from, to) {
            from = PATH_FS.resolve(from).substr(1)
            to = PATH_FS.resolve(to).substr(1)
            function trim(arr) {
                var start = 0
                for (; start < arr.length; start++) {
                    if (arr[start] !== '') break
                }
                var end = arr.length - 1
                for (; end >= 0; end--) {
                    if (arr[end] !== '') break
                }
                if (start > end) return []
                return arr.slice(start, end - start + 1)
            }
            var fromParts = trim(from.split('/'))
            var toParts = trim(to.split('/'))
            var length = Math.min(fromParts.length, toParts.length)
            var samePartsLength = length
            for (var i = 0; i < length; i++) {
                if (fromParts[i] !== toParts[i]) {
                    samePartsLength = i
                    break
                }
            }
            var outputParts = []
            for (var i = samePartsLength; i < fromParts.length; i++) {
                outputParts.push('..')
            }
            outputParts = outputParts.concat(toParts.slice(samePartsLength))
            return outputParts.join('/')
        }
    }
    var TTY = {
        ttys: [],
        init: function () {},
        shutdown: function () {},
        register: function (dev, ops) {
            TTY.ttys[dev] = { input: [], output: [], ops: ops }
            FS.registerDevice(dev, TTY.stream_ops)
        },
        stream_ops: {
            open: function (stream) {
                var tty = TTY.ttys[stream.node.rdev]
                if (!tty) {
                    throw new FS.ErrnoError(43)
                }
                stream.tty = tty
                stream.seekable = false
            },
            close: function (stream) {
                stream.tty.ops.flush(stream.tty)
            },
            flush: function (stream) {
                stream.tty.ops.flush(stream.tty)
            },
            read: function (stream, buffer, offset, length, pos) {
                if (!stream.tty || !stream.tty.ops.get_char) {
                    throw new FS.ErrnoError(60)
                }
                var bytesRead = 0
                for (var i = 0; i < length; i++) {
                    var result
                    try {
                        result = stream.tty.ops.get_char(stream.tty)
                    } catch (e) {
                        throw new FS.ErrnoError(29)
                    }
                    if (result === undefined && bytesRead === 0) {
                        throw new FS.ErrnoError(6)
                    }
                    if (result === null || result === undefined) break
                    bytesRead++
                    buffer[offset + i] = result
                }
                if (bytesRead) {
                    stream.node.timestamp = Date.now()
                }
                return bytesRead
            },
            write: function (stream, buffer, offset, length, pos) {
                if (!stream.tty || !stream.tty.ops.put_char) {
                    throw new FS.ErrnoError(60)
                }
                try {
                    for (var i = 0; i < length; i++) {
                        stream.tty.ops.put_char(stream.tty, buffer[offset + i])
                    }
                } catch (e) {
                    throw new FS.ErrnoError(29)
                }
                if (length) {
                    stream.node.timestamp = Date.now()
                }
                return i
            }
        },
        default_tty_ops: {
            get_char: function (tty) {
                if (!tty.input.length) {
                    var result = null
                    if (ENVIRONMENT_IS_NODE) {
                        var BUFSIZE = 256
                        var buf = Buffer.alloc ? Buffer.alloc(BUFSIZE) : new Buffer(BUFSIZE)
                        var bytesRead = 0
                        try {
                            bytesRead = nodeFS.readSync(process.stdin.fd, buf, 0, BUFSIZE, null)
                        } catch (e) {
                            if (e.toString().indexOf('EOF') != -1) bytesRead = 0
                            else throw e
                        }
                        if (bytesRead > 0) {
                            result = buf.slice(0, bytesRead).toString('utf-8')
                        } else {
                            result = null
                        }
                    } else if (typeof window != 'undefined' && typeof window.prompt == 'function') {
                        result = window.prompt('Input: ')
                        if (result !== null) {
                            result += '\n'
                        }
                    } else if (typeof readline == 'function') {
                        result = readline()
                        if (result !== null) {
                            result += '\n'
                        }
                    }
                    if (!result) {
                        return null
                    }
                    tty.input = intArrayFromString(result, true)
                }
                return tty.input.shift()
            },
            put_char: function (tty, val) {
                if (val === null || val === 10) {
                    out(UTF8ArrayToString(tty.output, 0))
                    tty.output = []
                } else {
                    if (val != 0) tty.output.push(val)
                }
            },
            flush: function (tty) {
                if (tty.output && tty.output.length > 0) {
                    out(UTF8ArrayToString(tty.output, 0))
                    tty.output = []
                }
            }
        },
        default_tty1_ops: {
            put_char: function (tty, val) {
                if (val === null || val === 10) {
                    err(UTF8ArrayToString(tty.output, 0))
                    tty.output = []
                } else {
                    if (val != 0) tty.output.push(val)
                }
            },
            flush: function (tty) {
                if (tty.output && tty.output.length > 0) {
                    err(UTF8ArrayToString(tty.output, 0))
                    tty.output = []
                }
            }
        }
    }
    function mmapAlloc(size) {
        var alignedSize = alignMemory(size, 16384)
        var ptr = _malloc(alignedSize)
        while (size < alignedSize) HEAP8[(ptr + size++) >>> 0] = 0
        return ptr
    }
    var MEMFS = {
        ops_table: null,
        mount: function (mount) {
            return MEMFS.createNode(null, '/', 16384 | 511, 0)
        },
        createNode: function (parent, name, mode, dev) {
            if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
                throw new FS.ErrnoError(63)
            }
            if (!MEMFS.ops_table) {
                MEMFS.ops_table = {
                    dir: {
                        node: {
                            getattr: MEMFS.node_ops.getattr,
                            setattr: MEMFS.node_ops.setattr,
                            lookup: MEMFS.node_ops.lookup,
                            mknod: MEMFS.node_ops.mknod,
                            rename: MEMFS.node_ops.rename,
                            unlink: MEMFS.node_ops.unlink,
                            rmdir: MEMFS.node_ops.rmdir,
                            readdir: MEMFS.node_ops.readdir,
                            symlink: MEMFS.node_ops.symlink
                        },
                        stream: { llseek: MEMFS.stream_ops.llseek }
                    },
                    file: {
                        node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
                        stream: {
                            llseek: MEMFS.stream_ops.llseek,
                            read: MEMFS.stream_ops.read,
                            write: MEMFS.stream_ops.write,
                            allocate: MEMFS.stream_ops.allocate,
                            mmap: MEMFS.stream_ops.mmap,
                            msync: MEMFS.stream_ops.msync
                        }
                    },
                    link: {
                        node: {
                            getattr: MEMFS.node_ops.getattr,
                            setattr: MEMFS.node_ops.setattr,
                            readlink: MEMFS.node_ops.readlink
                        },
                        stream: {}
                    },
                    chrdev: {
                        node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
                        stream: FS.chrdev_stream_ops
                    }
                }
            }
            var node = FS.createNode(parent, name, mode, dev)
            if (FS.isDir(node.mode)) {
                node.node_ops = MEMFS.ops_table.dir.node
                node.stream_ops = MEMFS.ops_table.dir.stream
                node.contents = {}
            } else if (FS.isFile(node.mode)) {
                node.node_ops = MEMFS.ops_table.file.node
                node.stream_ops = MEMFS.ops_table.file.stream
                node.usedBytes = 0
                node.contents = null
            } else if (FS.isLink(node.mode)) {
                node.node_ops = MEMFS.ops_table.link.node
                node.stream_ops = MEMFS.ops_table.link.stream
            } else if (FS.isChrdev(node.mode)) {
                node.node_ops = MEMFS.ops_table.chrdev.node
                node.stream_ops = MEMFS.ops_table.chrdev.stream
            }
            node.timestamp = Date.now()
            if (parent) {
                parent.contents[name] = node
            }
            return node
        },
        getFileDataAsRegularArray: function (node) {
            if (node.contents && node.contents.subarray) {
                var arr = []
                for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i])
                return arr
            }
            return node.contents
        },
        getFileDataAsTypedArray: function (node) {
            if (!node.contents) return new Uint8Array(0)
            if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes)
            return new Uint8Array(node.contents)
        },
        expandFileStorage: function (node, newCapacity) {
            newCapacity >>>= 0
            var prevCapacity = node.contents ? node.contents.length : 0
            if (prevCapacity >= newCapacity) return
            var CAPACITY_DOUBLING_MAX = 1024 * 1024
            newCapacity = Math.max(
                newCapacity,
                (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0
            )
            if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256)
            var oldContents = node.contents
            node.contents = new Uint8Array(newCapacity)
            if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0)
            return
        },
        resizeFileStorage: function (node, newSize) {
            newSize >>>= 0
            if (node.usedBytes == newSize) return
            if (newSize == 0) {
                node.contents = null
                node.usedBytes = 0
                return
            }
            if (!node.contents || node.contents.subarray) {
                var oldContents = node.contents
                node.contents = new Uint8Array(newSize)
                if (oldContents) {
                    node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)))
                }
                node.usedBytes = newSize
                return
            }
            if (!node.contents) node.contents = []
            if (node.contents.length > newSize) node.contents.length = newSize
            else while (node.contents.length < newSize) node.contents.push(0)
            node.usedBytes = newSize
        },
        node_ops: {
            getattr: function (node) {
                var attr = {}
                attr.dev = FS.isChrdev(node.mode) ? node.id : 1
                attr.ino = node.id
                attr.mode = node.mode
                attr.nlink = 1
                attr.uid = 0
                attr.gid = 0
                attr.rdev = node.rdev
                if (FS.isDir(node.mode)) {
                    attr.size = 4096
                } else if (FS.isFile(node.mode)) {
                    attr.size = node.usedBytes
                } else if (FS.isLink(node.mode)) {
                    attr.size = node.link.length
                } else {
                    attr.size = 0
                }
                attr.atime = new Date(node.timestamp)
                attr.mtime = new Date(node.timestamp)
                attr.ctime = new Date(node.timestamp)
                attr.blksize = 4096
                attr.blocks = Math.ceil(attr.size / attr.blksize)
                return attr
            },
            setattr: function (node, attr) {
                if (attr.mode !== undefined) {
                    node.mode = attr.mode
                }
                if (attr.timestamp !== undefined) {
                    node.timestamp = attr.timestamp
                }
                if (attr.size !== undefined) {
                    MEMFS.resizeFileStorage(node, attr.size)
                }
            },
            lookup: function (parent, name) {
                throw FS.genericErrors[44]
            },
            mknod: function (parent, name, mode, dev) {
                return MEMFS.createNode(parent, name, mode, dev)
            },
            rename: function (old_node, new_dir, new_name) {
                if (FS.isDir(old_node.mode)) {
                    var new_node
                    try {
                        new_node = FS.lookupNode(new_dir, new_name)
                    } catch (e) {}
                    if (new_node) {
                        for (var i in new_node.contents) {
                            throw new FS.ErrnoError(55)
                        }
                    }
                }
                delete old_node.parent.contents[old_node.name]
                old_node.name = new_name
                new_dir.contents[new_name] = old_node
                old_node.parent = new_dir
            },
            unlink: function (parent, name) {
                delete parent.contents[name]
            },
            rmdir: function (parent, name) {
                var node = FS.lookupNode(parent, name)
                for (var i in node.contents) {
                    throw new FS.ErrnoError(55)
                }
                delete parent.contents[name]
            },
            readdir: function (node) {
                var entries = ['.', '..']
                for (var key in node.contents) {
                    if (!node.contents.hasOwnProperty(key)) {
                        continue
                    }
                    entries.push(key)
                }
                return entries
            },
            symlink: function (parent, newname, oldpath) {
                var node = MEMFS.createNode(parent, newname, 511 | 40960, 0)
                node.link = oldpath
                return node
            },
            readlink: function (node) {
                if (!FS.isLink(node.mode)) {
                    throw new FS.ErrnoError(28)
                }
                return node.link
            }
        },
        stream_ops: {
            read: function (stream, buffer, offset, length, position) {
                var contents = stream.node.contents
                if (position >= stream.node.usedBytes) return 0
                var size = Math.min(stream.node.usedBytes - position, length)
                if (size > 8 && contents.subarray) {
                    buffer.set(contents.subarray(position, position + size), offset)
                } else {
                    for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i]
                }
                return size
            },
            write: function (stream, buffer, offset, length, position, canOwn) {
                if (buffer.buffer === HEAP8.buffer) {
                    canOwn = false
                }
                if (!length) return 0
                var node = stream.node
                node.timestamp = Date.now()
                if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                    if (canOwn) {
                        node.contents = buffer.subarray(offset, offset + length)
                        node.usedBytes = length
                        return length
                    } else if (node.usedBytes === 0 && position === 0) {
                        node.contents = buffer.slice(offset, offset + length)
                        node.usedBytes = length
                        return length
                    } else if (position + length <= node.usedBytes) {
                        node.contents.set(buffer.subarray(offset, offset + length), position)
                        return length
                    }
                }
                MEMFS.expandFileStorage(node, position + length)
                if (node.contents.subarray && buffer.subarray) {
                    node.contents.set(buffer.subarray(offset, offset + length), position)
                } else {
                    for (var i = 0; i < length; i++) {
                        node.contents[position + i] = buffer[offset + i]
                    }
                }
                node.usedBytes = Math.max(node.usedBytes, position + length)
                return length
            },
            llseek: function (stream, offset, whence) {
                var position = offset
                if (whence === 1) {
                    position += stream.position
                } else if (whence === 2) {
                    if (FS.isFile(stream.node.mode)) {
                        position += stream.node.usedBytes
                    }
                }
                if (position < 0) {
                    throw new FS.ErrnoError(28)
                }
                return position
            },
            allocate: function (stream, offset, length) {
                MEMFS.expandFileStorage(stream.node, offset + length)
                stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length)
            },
            mmap: function (stream, address, length, position, prot, flags) {
                assert(address === 0)
                if (!FS.isFile(stream.node.mode)) {
                    throw new FS.ErrnoError(43)
                }
                var ptr
                var allocated
                var contents = stream.node.contents
                if (!(flags & 2) && contents.buffer === buffer) {
                    allocated = false
                    ptr = contents.byteOffset
                } else {
                    if (position > 0 || position + length < contents.length) {
                        if (contents.subarray) {
                            contents = contents.subarray(position, position + length)
                        } else {
                            contents = Array.prototype.slice.call(contents, position, position + length)
                        }
                    }
                    allocated = true
                    ptr = mmapAlloc(length)
                    if (!ptr) {
                        throw new FS.ErrnoError(48)
                    }
                    ptr >>>= 0
                    HEAP8.set(contents, ptr >>> 0)
                }
                return { ptr: ptr, allocated: allocated }
            },
            msync: function (stream, buffer, offset, length, mmapFlags) {
                if (!FS.isFile(stream.node.mode)) {
                    throw new FS.ErrnoError(43)
                }
                if (mmapFlags & 2) {
                    return 0
                }
                var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false)
                return 0
            }
        }
    }
    var FS = {
        root: null,
        mounts: [],
        devices: {},
        streams: [],
        nextInode: 1,
        nameTable: null,
        currentPath: '/',
        initialized: false,
        ignorePermissions: true,
        trackingDelegate: {},
        tracking: { openFlags: { READ: 1, WRITE: 2 } },
        ErrnoError: null,
        genericErrors: {},
        filesystems: null,
        syncFSRequests: 0,
        handleFSError: function (e) {
            if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace()
            return setErrNo(e.errno)
        },
        lookupPath: function (path, opts) {
            path = PATH_FS.resolve(FS.cwd(), path)
            opts = opts || {}
            if (!path) return { path: '', node: null }
            var defaults = { follow_mount: true, recurse_count: 0 }
            for (var key in defaults) {
                if (opts[key] === undefined) {
                    opts[key] = defaults[key]
                }
            }
            if (opts.recurse_count > 8) {
                throw new FS.ErrnoError(32)
            }
            var parts = PATH.normalizeArray(
                path.split('/').filter(function (p) {
                    return !!p
                }),
                false
            )
            var current = FS.root
            var current_path = '/'
            for (var i = 0; i < parts.length; i++) {
                var islast = i === parts.length - 1
                if (islast && opts.parent) {
                    break
                }
                current = FS.lookupNode(current, parts[i])
                current_path = PATH.join2(current_path, parts[i])
                if (FS.isMountpoint(current)) {
                    if (!islast || (islast && opts.follow_mount)) {
                        current = current.mounted.root
                    }
                }
                if (!islast || opts.follow) {
                    var count = 0
                    while (FS.isLink(current.mode)) {
                        var link = FS.readlink(current_path)
                        current_path = PATH_FS.resolve(PATH.dirname(current_path), link)
                        var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count })
                        current = lookup.node
                        if (count++ > 40) {
                            throw new FS.ErrnoError(32)
                        }
                    }
                }
            }
            return { path: current_path, node: current }
        },
        getPath: function (node) {
            var path
            while (true) {
                if (FS.isRoot(node)) {
                    var mount = node.mount.mountpoint
                    if (!path) return mount
                    return mount[mount.length - 1] !== '/' ? mount + '/' + path : mount + path
                }
                path = path ? node.name + '/' + path : node.name
                node = node.parent
            }
        },
        hashName: function (parentid, name) {
            var hash = 0
            for (var i = 0; i < name.length; i++) {
                hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0
            }
            return ((parentid + hash) >>> 0) % FS.nameTable.length
        },
        hashAddNode: function (node) {
            var hash = FS.hashName(node.parent.id, node.name)
            node.name_next = FS.nameTable[hash]
            FS.nameTable[hash] = node
        },
        hashRemoveNode: function (node) {
            var hash = FS.hashName(node.parent.id, node.name)
            if (FS.nameTable[hash] === node) {
                FS.nameTable[hash] = node.name_next
            } else {
                var current = FS.nameTable[hash]
                while (current) {
                    if (current.name_next === node) {
                        current.name_next = node.name_next
                        break
                    }
                    current = current.name_next
                }
            }
        },
        lookupNode: function (parent, name) {
            var errCode = FS.mayLookup(parent)
            if (errCode) {
                throw new FS.ErrnoError(errCode, parent)
            }
            var hash = FS.hashName(parent.id, name)
            for (var node = FS.nameTable[hash]; node; node = node.name_next) {
                var nodeName = node.name
                if (node.parent.id === parent.id && nodeName === name) {
                    return node
                }
            }
            return FS.lookup(parent, name)
        },
        createNode: function (parent, name, mode, rdev) {
            var node = new FS.FSNode(parent, name, mode, rdev)
            FS.hashAddNode(node)
            return node
        },
        destroyNode: function (node) {
            FS.hashRemoveNode(node)
        },
        isRoot: function (node) {
            return node === node.parent
        },
        isMountpoint: function (node) {
            return !!node.mounted
        },
        isFile: function (mode) {
            return (mode & 61440) === 32768
        },
        isDir: function (mode) {
            return (mode & 61440) === 16384
        },
        isLink: function (mode) {
            return (mode & 61440) === 40960
        },
        isChrdev: function (mode) {
            return (mode & 61440) === 8192
        },
        isBlkdev: function (mode) {
            return (mode & 61440) === 24576
        },
        isFIFO: function (mode) {
            return (mode & 61440) === 4096
        },
        isSocket: function (mode) {
            return (mode & 49152) === 49152
        },
        flagModes: {
            r: 0,
            rs: 1052672,
            'r+': 2,
            w: 577,
            wx: 705,
            xw: 705,
            'w+': 578,
            'wx+': 706,
            'xw+': 706,
            a: 1089,
            ax: 1217,
            xa: 1217,
            'a+': 1090,
            'ax+': 1218,
            'xa+': 1218
        },
        modeStringToFlags: function (str) {
            var flags = FS.flagModes[str]
            if (typeof flags === 'undefined') {
                throw new Error('Unknown file open mode: ' + str)
            }
            return flags
        },
        flagsToPermissionString: function (flag) {
            var perms = ['r', 'w', 'rw'][flag & 3]
            if (flag & 512) {
                perms += 'w'
            }
            return perms
        },
        nodePermissions: function (node, perms) {
            if (FS.ignorePermissions) {
                return 0
            }
            if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
                return 2
            } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
                return 2
            } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
                return 2
            }
            return 0
        },
        mayLookup: function (dir) {
            var errCode = FS.nodePermissions(dir, 'x')
            if (errCode) return errCode
            if (!dir.node_ops.lookup) return 2
            return 0
        },
        mayCreate: function (dir, name) {
            try {
                var node = FS.lookupNode(dir, name)
                return 20
            } catch (e) {}
            return FS.nodePermissions(dir, 'wx')
        },
        mayDelete: function (dir, name, isdir) {
            var node
            try {
                node = FS.lookupNode(dir, name)
            } catch (e) {
                return e.errno
            }
            var errCode = FS.nodePermissions(dir, 'wx')
            if (errCode) {
                return errCode
            }
            if (isdir) {
                if (!FS.isDir(node.mode)) {
                    return 54
                }
                if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                    return 10
                }
            } else {
                if (FS.isDir(node.mode)) {
                    return 31
                }
            }
            return 0
        },
        mayOpen: function (node, flags) {
            if (!node) {
                return 44
            }
            if (FS.isLink(node.mode)) {
                return 32
            } else if (FS.isDir(node.mode)) {
                if (FS.flagsToPermissionString(flags) !== 'r' || flags & 512) {
                    return 31
                }
            }
            return FS.nodePermissions(node, FS.flagsToPermissionString(flags))
        },
        MAX_OPEN_FDS: 4096,
        nextfd: function (fd_start, fd_end) {
            fd_start = fd_start || 0
            fd_end = fd_end || FS.MAX_OPEN_FDS
            for (var fd = fd_start; fd <= fd_end; fd++) {
                if (!FS.streams[fd]) {
                    return fd
                }
            }
            throw new FS.ErrnoError(33)
        },
        getStream: function (fd) {
            return FS.streams[fd]
        },
        createStream: function (stream, fd_start, fd_end) {
            if (!FS.FSStream) {
                FS.FSStream = function () {}
                FS.FSStream.prototype = {
                    object: {
                        get: function () {
                            return this.node
                        },
                        set: function (val) {
                            this.node = val
                        }
                    },
                    isRead: {
                        get: function () {
                            return (this.flags & 2097155) !== 1
                        }
                    },
                    isWrite: {
                        get: function () {
                            return (this.flags & 2097155) !== 0
                        }
                    },
                    isAppend: {
                        get: function () {
                            return this.flags & 1024
                        }
                    }
                }
            }
            var newStream = new FS.FSStream()
            for (var p in stream) {
                newStream[p] = stream[p]
            }
            stream = newStream
            var fd = FS.nextfd(fd_start, fd_end)
            stream.fd = fd
            FS.streams[fd] = stream
            return stream
        },
        closeStream: function (fd) {
            FS.streams[fd] = null
        },
        chrdev_stream_ops: {
            open: function (stream) {
                var device = FS.getDevice(stream.node.rdev)
                stream.stream_ops = device.stream_ops
                if (stream.stream_ops.open) {
                    stream.stream_ops.open(stream)
                }
            },
            llseek: function () {
                throw new FS.ErrnoError(70)
            }
        },
        major: function (dev) {
            return dev >> 8
        },
        minor: function (dev) {
            return dev & 255
        },
        makedev: function (ma, mi) {
            return (ma << 8) | mi
        },
        registerDevice: function (dev, ops) {
            FS.devices[dev] = { stream_ops: ops }
        },
        getDevice: function (dev) {
            return FS.devices[dev]
        },
        getMounts: function (mount) {
            var mounts = []
            var check = [mount]
            while (check.length) {
                var m = check.pop()
                mounts.push(m)
                check.push.apply(check, m.mounts)
            }
            return mounts
        },
        syncfs: function (populate, callback) {
            if (typeof populate === 'function') {
                callback = populate
                populate = false
            }
            FS.syncFSRequests++
            if (FS.syncFSRequests > 1) {
                err(
                    'warning: ' +
                        FS.syncFSRequests +
                        ' FS.syncfs operations in flight at once, probably just doing extra work'
                )
            }
            var mounts = FS.getMounts(FS.root.mount)
            var completed = 0
            function doCallback(errCode) {
                FS.syncFSRequests--
                return callback(errCode)
            }
            function done(errCode) {
                if (errCode) {
                    if (!done.errored) {
                        done.errored = true
                        return doCallback(errCode)
                    }
                    return
                }
                if (++completed >= mounts.length) {
                    doCallback(null)
                }
            }
            mounts.forEach(function (mount) {
                if (!mount.type.syncfs) {
                    return done(null)
                }
                mount.type.syncfs(mount, populate, done)
            })
        },
        mount: function (type, opts, mountpoint) {
            var root = mountpoint === '/'
            var pseudo = !mountpoint
            var node
            if (root && FS.root) {
                throw new FS.ErrnoError(10)
            } else if (!root && !pseudo) {
                var lookup = FS.lookupPath(mountpoint, { follow_mount: false })
                mountpoint = lookup.path
                node = lookup.node
                if (FS.isMountpoint(node)) {
                    throw new FS.ErrnoError(10)
                }
                if (!FS.isDir(node.mode)) {
                    throw new FS.ErrnoError(54)
                }
            }
            var mount = { type: type, opts: opts, mountpoint: mountpoint, mounts: [] }
            var mountRoot = type.mount(mount)
            mountRoot.mount = mount
            mount.root = mountRoot
            if (root) {
                FS.root = mountRoot
            } else if (node) {
                node.mounted = mount
                if (node.mount) {
                    node.mount.mounts.push(mount)
                }
            }
            return mountRoot
        },
        unmount: function (mountpoint) {
            var lookup = FS.lookupPath(mountpoint, { follow_mount: false })
            if (!FS.isMountpoint(lookup.node)) {
                throw new FS.ErrnoError(28)
            }
            var node = lookup.node
            var mount = node.mounted
            var mounts = FS.getMounts(mount)
            Object.keys(FS.nameTable).forEach(function (hash) {
                var current = FS.nameTable[hash]
                while (current) {
                    var next = current.name_next
                    if (mounts.indexOf(current.mount) !== -1) {
                        FS.destroyNode(current)
                    }
                    current = next
                }
            })
            node.mounted = null
            var idx = node.mount.mounts.indexOf(mount)
            node.mount.mounts.splice(idx, 1)
        },
        lookup: function (parent, name) {
            return parent.node_ops.lookup(parent, name)
        },
        mknod: function (path, mode, dev) {
            var lookup = FS.lookupPath(path, { parent: true })
            var parent = lookup.node
            var name = PATH.basename(path)
            if (!name || name === '.' || name === '..') {
                throw new FS.ErrnoError(28)
            }
            var errCode = FS.mayCreate(parent, name)
            if (errCode) {
                throw new FS.ErrnoError(errCode)
            }
            if (!parent.node_ops.mknod) {
                throw new FS.ErrnoError(63)
            }
            return parent.node_ops.mknod(parent, name, mode, dev)
        },
        create: function (path, mode) {
            mode = mode !== undefined ? mode : 438
            mode &= 4095
            mode |= 32768
            return FS.mknod(path, mode, 0)
        },
        mkdir: function (path, mode) {
            mode = mode !== undefined ? mode : 511
            mode &= 511 | 512
            mode |= 16384
            return FS.mknod(path, mode, 0)
        },
        mkdirTree: function (path, mode) {
            var dirs = path.split('/')
            var d = ''
            for (var i = 0; i < dirs.length; ++i) {
                if (!dirs[i]) continue
                d += '/' + dirs[i]
                try {
                    FS.mkdir(d, mode)
                } catch (e) {
                    if (e.errno != 20) throw e
                }
            }
        },
        mkdev: function (path, mode, dev) {
            if (typeof dev === 'undefined') {
                dev = mode
                mode = 438
            }
            mode |= 8192
            return FS.mknod(path, mode, dev)
        },
        symlink: function (oldpath, newpath) {
            if (!PATH_FS.resolve(oldpath)) {
                throw new FS.ErrnoError(44)
            }
            var lookup = FS.lookupPath(newpath, { parent: true })
            var parent = lookup.node
            if (!parent) {
                throw new FS.ErrnoError(44)
            }
            var newname = PATH.basename(newpath)
            var errCode = FS.mayCreate(parent, newname)
            if (errCode) {
                throw new FS.ErrnoError(errCode)
            }
            if (!parent.node_ops.symlink) {
                throw new FS.ErrnoError(63)
            }
            return parent.node_ops.symlink(parent, newname, oldpath)
        },
        rename: function (old_path, new_path) {
            var old_dirname = PATH.dirname(old_path)
            var new_dirname = PATH.dirname(new_path)
            var old_name = PATH.basename(old_path)
            var new_name = PATH.basename(new_path)
            var lookup, old_dir, new_dir
            lookup = FS.lookupPath(old_path, { parent: true })
            old_dir = lookup.node
            lookup = FS.lookupPath(new_path, { parent: true })
            new_dir = lookup.node
            if (!old_dir || !new_dir) throw new FS.ErrnoError(44)
            if (old_dir.mount !== new_dir.mount) {
                throw new FS.ErrnoError(75)
            }
            var old_node = FS.lookupNode(old_dir, old_name)
            var relative = PATH_FS.relative(old_path, new_dirname)
            if (relative.charAt(0) !== '.') {
                throw new FS.ErrnoError(28)
            }
            relative = PATH_FS.relative(new_path, old_dirname)
            if (relative.charAt(0) !== '.') {
                throw new FS.ErrnoError(55)
            }
            var new_node
            try {
                new_node = FS.lookupNode(new_dir, new_name)
            } catch (e) {}
            if (old_node === new_node) {
                return
            }
            var isdir = FS.isDir(old_node.mode)
            var errCode = FS.mayDelete(old_dir, old_name, isdir)
            if (errCode) {
                throw new FS.ErrnoError(errCode)
            }
            errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name)
            if (errCode) {
                throw new FS.ErrnoError(errCode)
            }
            if (!old_dir.node_ops.rename) {
                throw new FS.ErrnoError(63)
            }
            if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
                throw new FS.ErrnoError(10)
            }
            if (new_dir !== old_dir) {
                errCode = FS.nodePermissions(old_dir, 'w')
                if (errCode) {
                    throw new FS.ErrnoError(errCode)
                }
            }
            try {
                if (FS.trackingDelegate['willMovePath']) {
                    FS.trackingDelegate['willMovePath'](old_path, new_path)
                }
            } catch (e) {
                err(
                    "FS.trackingDelegate['willMovePath']('" +
                        old_path +
                        "', '" +
                        new_path +
                        "') threw an exception: " +
                        e.message
                )
            }
            FS.hashRemoveNode(old_node)
            try {
                old_dir.node_ops.rename(old_node, new_dir, new_name)
            } catch (e) {
                throw e
            } finally {
                FS.hashAddNode(old_node)
            }
            try {
                if (FS.trackingDelegate['onMovePath']) FS.trackingDelegate['onMovePath'](old_path, new_path)
            } catch (e) {
                err(
                    "FS.trackingDelegate['onMovePath']('" +
                        old_path +
                        "', '" +
                        new_path +
                        "') threw an exception: " +
                        e.message
                )
            }
        },
        rmdir: function (path) {
            var lookup = FS.lookupPath(path, { parent: true })
            var parent = lookup.node
            var name = PATH.basename(path)
            var node = FS.lookupNode(parent, name)
            var errCode = FS.mayDelete(parent, name, true)
            if (errCode) {
                throw new FS.ErrnoError(errCode)
            }
            if (!parent.node_ops.rmdir) {
                throw new FS.ErrnoError(63)
            }
            if (FS.isMountpoint(node)) {
                throw new FS.ErrnoError(10)
            }
            try {
                if (FS.trackingDelegate['willDeletePath']) {
                    FS.trackingDelegate['willDeletePath'](path)
                }
            } catch (e) {
                err("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
            }
            parent.node_ops.rmdir(parent, name)
            FS.destroyNode(node)
            try {
                if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path)
            } catch (e) {
                err("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
            }
        },
        readdir: function (path) {
            var lookup = FS.lookupPath(path, { follow: true })
            var node = lookup.node
            if (!node.node_ops.readdir) {
                throw new FS.ErrnoError(54)
            }
            return node.node_ops.readdir(node)
        },
        unlink: function (path) {
            var lookup = FS.lookupPath(path, { parent: true })
            var parent = lookup.node
            var name = PATH.basename(path)
            var node = FS.lookupNode(parent, name)
            var errCode = FS.mayDelete(parent, name, false)
            if (errCode) {
                throw new FS.ErrnoError(errCode)
            }
            if (!parent.node_ops.unlink) {
                throw new FS.ErrnoError(63)
            }
            if (FS.isMountpoint(node)) {
                throw new FS.ErrnoError(10)
            }
            try {
                if (FS.trackingDelegate['willDeletePath']) {
                    FS.trackingDelegate['willDeletePath'](path)
                }
            } catch (e) {
                err("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
            }
            parent.node_ops.unlink(parent, name)
            FS.destroyNode(node)
            try {
                if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path)
            } catch (e) {
                err("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
            }
        },
        readlink: function (path) {
            var lookup = FS.lookupPath(path)
            var link = lookup.node
            if (!link) {
                throw new FS.ErrnoError(44)
            }
            if (!link.node_ops.readlink) {
                throw new FS.ErrnoError(28)
            }
            return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link))
        },
        stat: function (path, dontFollow) {
            var lookup = FS.lookupPath(path, { follow: !dontFollow })
            var node = lookup.node
            if (!node) {
                throw new FS.ErrnoError(44)
            }
            if (!node.node_ops.getattr) {
                throw new FS.ErrnoError(63)
            }
            return node.node_ops.getattr(node)
        },
        lstat: function (path) {
            return FS.stat(path, true)
        },
        chmod: function (path, mode, dontFollow) {
            var node
            if (typeof path === 'string') {
                var lookup = FS.lookupPath(path, { follow: !dontFollow })
                node = lookup.node
            } else {
                node = path
            }
            if (!node.node_ops.setattr) {
                throw new FS.ErrnoError(63)
            }
            node.node_ops.setattr(node, { mode: (mode & 4095) | (node.mode & ~4095), timestamp: Date.now() })
        },
        lchmod: function (path, mode) {
            FS.chmod(path, mode, true)
        },
        fchmod: function (fd, mode) {
            var stream = FS.getStream(fd)
            if (!stream) {
                throw new FS.ErrnoError(8)
            }
            FS.chmod(stream.node, mode)
        },
        chown: function (path, uid, gid, dontFollow) {
            var node
            if (typeof path === 'string') {
                var lookup = FS.lookupPath(path, { follow: !dontFollow })
                node = lookup.node
            } else {
                node = path
            }
            if (!node.node_ops.setattr) {
                throw new FS.ErrnoError(63)
            }
            node.node_ops.setattr(node, { timestamp: Date.now() })
        },
        lchown: function (path, uid, gid) {
            FS.chown(path, uid, gid, true)
        },
        fchown: function (fd, uid, gid) {
            var stream = FS.getStream(fd)
            if (!stream) {
                throw new FS.ErrnoError(8)
            }
            FS.chown(stream.node, uid, gid)
        },
        truncate: function (path, len) {
            if (len < 0) {
                throw new FS.ErrnoError(28)
            }
            var node
            if (typeof path === 'string') {
                var lookup = FS.lookupPath(path, { follow: true })
                node = lookup.node
            } else {
                node = path
            }
            if (!node.node_ops.setattr) {
                throw new FS.ErrnoError(63)
            }
            if (FS.isDir(node.mode)) {
                throw new FS.ErrnoError(31)
            }
            if (!FS.isFile(node.mode)) {
                throw new FS.ErrnoError(28)
            }
            var errCode = FS.nodePermissions(node, 'w')
            if (errCode) {
                throw new FS.ErrnoError(errCode)
            }
            node.node_ops.setattr(node, { size: len, timestamp: Date.now() })
        },
        ftruncate: function (fd, len) {
            var stream = FS.getStream(fd)
            if (!stream) {
                throw new FS.ErrnoError(8)
            }
            if ((stream.flags & 2097155) === 0) {
                throw new FS.ErrnoError(28)
            }
            FS.truncate(stream.node, len)
        },
        utime: function (path, atime, mtime) {
            var lookup = FS.lookupPath(path, { follow: true })
            var node = lookup.node
            node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) })
        },
        open: function (path, flags, mode, fd_start, fd_end) {
            if (path === '') {
                throw new FS.ErrnoError(44)
            }
            flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags
            mode = typeof mode === 'undefined' ? 438 : mode
            if (flags & 64) {
                mode = (mode & 4095) | 32768
            } else {
                mode = 0
            }
            var node
            if (typeof path === 'object') {
                node = path
            } else {
                path = PATH.normalize(path)
                try {
                    var lookup = FS.lookupPath(path, { follow: !(flags & 131072) })
                    node = lookup.node
                } catch (e) {}
            }
            var created = false
            if (flags & 64) {
                if (node) {
                    if (flags & 128) {
                        throw new FS.ErrnoError(20)
                    }
                } else {
                    node = FS.mknod(path, mode, 0)
                    created = true
                }
            }
            if (!node) {
                throw new FS.ErrnoError(44)
            }
            if (FS.isChrdev(node.mode)) {
                flags &= ~512
            }
            if (flags & 65536 && !FS.isDir(node.mode)) {
                throw new FS.ErrnoError(54)
            }
            if (!created) {
                var errCode = FS.mayOpen(node, flags)
                if (errCode) {
                    throw new FS.ErrnoError(errCode)
                }
            }
            if (flags & 512) {
                FS.truncate(node, 0)
            }
            flags &= ~(128 | 512 | 131072)
            var stream = FS.createStream(
                {
                    node: node,
                    path: FS.getPath(node),
                    flags: flags,
                    seekable: true,
                    position: 0,
                    stream_ops: node.stream_ops,
                    ungotten: [],
                    error: false
                },
                fd_start,
                fd_end
            )
            if (stream.stream_ops.open) {
                stream.stream_ops.open(stream)
            }
            if (Module['logReadFiles'] && !(flags & 1)) {
                if (!FS.readFiles) FS.readFiles = {}
                if (!(path in FS.readFiles)) {
                    FS.readFiles[path] = 1
                    err('FS.trackingDelegate error on read file: ' + path)
                }
            }
            try {
                if (FS.trackingDelegate['onOpenFile']) {
                    var trackingFlags = 0
                    if ((flags & 2097155) !== 1) {
                        trackingFlags |= FS.tracking.openFlags.READ
                    }
                    if ((flags & 2097155) !== 0) {
                        trackingFlags |= FS.tracking.openFlags.WRITE
                    }
                    FS.trackingDelegate['onOpenFile'](path, trackingFlags)
                }
            } catch (e) {
                err("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message)
            }
            return stream
        },
        close: function (stream) {
            if (FS.isClosed(stream)) {
                throw new FS.ErrnoError(8)
            }
            if (stream.getdents) stream.getdents = null
            try {
                if (stream.stream_ops.close) {
                    stream.stream_ops.close(stream)
                }
            } catch (e) {
                throw e
            } finally {
                FS.closeStream(stream.fd)
            }
            stream.fd = null
        },
        isClosed: function (stream) {
            return stream.fd === null
        },
        llseek: function (stream, offset, whence) {
            if (FS.isClosed(stream)) {
                throw new FS.ErrnoError(8)
            }
            if (!stream.seekable || !stream.stream_ops.llseek) {
                throw new FS.ErrnoError(70)
            }
            if (whence != 0 && whence != 1 && whence != 2) {
                throw new FS.ErrnoError(28)
            }
            stream.position = stream.stream_ops.llseek(stream, offset, whence)
            stream.ungotten = []
            return stream.position
        },
        read: function (stream, buffer, offset, length, position) {
            offset >>>= 0
            if (length < 0 || position < 0) {
                throw new FS.ErrnoError(28)
            }
            if (FS.isClosed(stream)) {
                throw new FS.ErrnoError(8)
            }
            if ((stream.flags & 2097155) === 1) {
                throw new FS.ErrnoError(8)
            }
            if (FS.isDir(stream.node.mode)) {
                throw new FS.ErrnoError(31)
            }
            if (!stream.stream_ops.read) {
                throw new FS.ErrnoError(28)
            }
            var seeking = typeof position !== 'undefined'
            if (!seeking) {
                position = stream.position
            } else if (!stream.seekable) {
                throw new FS.ErrnoError(70)
            }
            var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position)
            if (!seeking) stream.position += bytesRead
            return bytesRead
        },
        write: function (stream, buffer, offset, length, position, canOwn) {
            offset >>>= 0
            if (length < 0 || position < 0) {
                throw new FS.ErrnoError(28)
            }
            if (FS.isClosed(stream)) {
                throw new FS.ErrnoError(8)
            }
            if ((stream.flags & 2097155) === 0) {
                throw new FS.ErrnoError(8)
            }
            if (FS.isDir(stream.node.mode)) {
                throw new FS.ErrnoError(31)
            }
            if (!stream.stream_ops.write) {
                throw new FS.ErrnoError(28)
            }
            if (stream.seekable && stream.flags & 1024) {
                FS.llseek(stream, 0, 2)
            }
            var seeking = typeof position !== 'undefined'
            if (!seeking) {
                position = stream.position
            } else if (!stream.seekable) {
                throw new FS.ErrnoError(70)
            }
            var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn)
            if (!seeking) stream.position += bytesWritten
            try {
                if (stream.path && FS.trackingDelegate['onWriteToFile'])
                    FS.trackingDelegate['onWriteToFile'](stream.path)
            } catch (e) {
                err("FS.trackingDelegate['onWriteToFile']('" + stream.path + "') threw an exception: " + e.message)
            }
            return bytesWritten
        },
        allocate: function (stream, offset, length) {
            if (FS.isClosed(stream)) {
                throw new FS.ErrnoError(8)
            }
            if (offset < 0 || length <= 0) {
                throw new FS.ErrnoError(28)
            }
            if ((stream.flags & 2097155) === 0) {
                throw new FS.ErrnoError(8)
            }
            if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
                throw new FS.ErrnoError(43)
            }
            if (!stream.stream_ops.allocate) {
                throw new FS.ErrnoError(138)
            }
            stream.stream_ops.allocate(stream, offset, length)
        },
        mmap: function (stream, address, length, position, prot, flags) {
            address >>>= 0
            if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
                throw new FS.ErrnoError(2)
            }
            if ((stream.flags & 2097155) === 1) {
                throw new FS.ErrnoError(2)
            }
            if (!stream.stream_ops.mmap) {
                throw new FS.ErrnoError(43)
            }
            return stream.stream_ops.mmap(stream, address, length, position, prot, flags)
        },
        msync: function (stream, buffer, offset, length, mmapFlags) {
            offset >>>= 0
            if (!stream || !stream.stream_ops.msync) {
                return 0
            }
            return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
        },
        munmap: function (stream) {
            return 0
        },
        ioctl: function (stream, cmd, arg) {
            if (!stream.stream_ops.ioctl) {
                throw new FS.ErrnoError(59)
            }
            return stream.stream_ops.ioctl(stream, cmd, arg)
        },
        readFile: function (path, opts) {
            opts = opts || {}
            opts.flags = opts.flags || 'r'
            opts.encoding = opts.encoding || 'binary'
            if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
                throw new Error('Invalid encoding type "' + opts.encoding + '"')
            }
            var ret
            var stream = FS.open(path, opts.flags)
            var stat = FS.stat(path)
            var length = stat.size
            var buf = new Uint8Array(length)
            FS.read(stream, buf, 0, length, 0)
            if (opts.encoding === 'utf8') {
                ret = UTF8ArrayToString(buf, 0)
            } else if (opts.encoding === 'binary') {
                ret = buf
            }
            FS.close(stream)
            return ret
        },
        writeFile: function (path, data, opts) {
            opts = opts || {}
            opts.flags = opts.flags || 'w'
            var stream = FS.open(path, opts.flags, opts.mode)
            if (typeof data === 'string') {
                var buf = new Uint8Array(lengthBytesUTF8(data) + 1)
                var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length)
                FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn)
            } else if (ArrayBuffer.isView(data)) {
                FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn)
            } else {
                throw new Error('Unsupported data type')
            }
            FS.close(stream)
        },
        cwd: function () {
            return FS.currentPath
        },
        chdir: function (path) {
            var lookup = FS.lookupPath(path, { follow: true })
            if (lookup.node === null) {
                throw new FS.ErrnoError(44)
            }
            if (!FS.isDir(lookup.node.mode)) {
                throw new FS.ErrnoError(54)
            }
            var errCode = FS.nodePermissions(lookup.node, 'x')
            if (errCode) {
                throw new FS.ErrnoError(errCode)
            }
            FS.currentPath = lookup.path
        },
        createDefaultDirectories: function () {
            FS.mkdir('/tmp')
            FS.mkdir('/home')
            FS.mkdir('/home/web_user')
        },
        createDefaultDevices: function () {
            FS.mkdir('/dev')
            FS.registerDevice(FS.makedev(1, 3), {
                read: function () {
                    return 0
                },
                write: function (stream, buffer, offset, length, pos) {
                    return length
                }
            })
            FS.mkdev('/dev/null', FS.makedev(1, 3))
            TTY.register(FS.makedev(5, 0), TTY.default_tty_ops)
            TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops)
            FS.mkdev('/dev/tty', FS.makedev(5, 0))
            FS.mkdev('/dev/tty1', FS.makedev(6, 0))
            var random_device = getRandomDevice()
            FS.createDevice('/dev', 'random', random_device)
            FS.createDevice('/dev', 'urandom', random_device)
            FS.mkdir('/dev/shm')
            FS.mkdir('/dev/shm/tmp')
        },
        createSpecialDirectories: function () {
            FS.mkdir('/proc')
            FS.mkdir('/proc/self')
            FS.mkdir('/proc/self/fd')
            FS.mount(
                {
                    mount: function () {
                        var node = FS.createNode('/proc/self', 'fd', 16384 | 511, 73)
                        node.node_ops = {
                            lookup: function (parent, name) {
                                var fd = +name
                                var stream = FS.getStream(fd)
                                if (!stream) throw new FS.ErrnoError(8)
                                var ret = {
                                    parent: null,
                                    mount: { mountpoint: 'fake' },
                                    node_ops: {
                                        readlink: function () {
                                            return stream.path
                                        }
                                    }
                                }
                                ret.parent = ret
                                return ret
                            }
                        }
                        return node
                    }
                },
                {},
                '/proc/self/fd'
            )
        },
        createStandardStreams: function () {
            if (Module['stdin']) {
                FS.createDevice('/dev', 'stdin', Module['stdin'])
            } else {
                FS.symlink('/dev/tty', '/dev/stdin')
            }
            if (Module['stdout']) {
                FS.createDevice('/dev', 'stdout', null, Module['stdout'])
            } else {
                FS.symlink('/dev/tty', '/dev/stdout')
            }
            if (Module['stderr']) {
                FS.createDevice('/dev', 'stderr', null, Module['stderr'])
            } else {
                FS.symlink('/dev/tty1', '/dev/stderr')
            }
            var stdin = FS.open('/dev/stdin', 'r')
            var stdout = FS.open('/dev/stdout', 'w')
            var stderr = FS.open('/dev/stderr', 'w')
        },
        ensureErrnoError: function () {
            if (FS.ErrnoError) return
            FS.ErrnoError = function ErrnoError(errno, node) {
                this.node = node
                this.setErrno = function (errno) {
                    this.errno = errno
                }
                this.setErrno(errno)
                this.message = 'FS error'
            }
            FS.ErrnoError.prototype = new Error()
            FS.ErrnoError.prototype.constructor = FS.ErrnoError
            ;[44].forEach(function (code) {
                FS.genericErrors[code] = new FS.ErrnoError(code)
                FS.genericErrors[code].stack = '<generic error, no stack>'
            })
        },
        staticInit: function () {
            FS.ensureErrnoError()
            FS.nameTable = new Array(4096)
            FS.mount(MEMFS, {}, '/')
            FS.createDefaultDirectories()
            FS.createDefaultDevices()
            FS.createSpecialDirectories()
            FS.filesystems = { MEMFS: MEMFS }
        },
        init: function (input, output, error) {
            FS.init.initialized = true
            FS.ensureErrnoError()
            Module['stdin'] = input || Module['stdin']
            Module['stdout'] = output || Module['stdout']
            Module['stderr'] = error || Module['stderr']
            FS.createStandardStreams()
        },
        quit: function () {
            FS.init.initialized = false
            var fflush = Module['_fflush']
            if (fflush) fflush(0)
            for (var i = 0; i < FS.streams.length; i++) {
                var stream = FS.streams[i]
                if (!stream) {
                    continue
                }
                FS.close(stream)
            }
        },
        getMode: function (canRead, canWrite) {
            var mode = 0
            if (canRead) mode |= 292 | 73
            if (canWrite) mode |= 146
            return mode
        },
        findObject: function (path, dontResolveLastLink) {
            var ret = FS.analyzePath(path, dontResolveLastLink)
            if (ret.exists) {
                return ret.object
            } else {
                setErrNo(ret.error)
                return null
            }
        },
        analyzePath: function (path, dontResolveLastLink) {
            try {
                var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink })
                path = lookup.path
            } catch (e) {}
            var ret = {
                isRoot: false,
                exists: false,
                error: 0,
                name: null,
                path: null,
                object: null,
                parentExists: false,
                parentPath: null,
                parentObject: null
            }
            try {
                var lookup = FS.lookupPath(path, { parent: true })
                ret.parentExists = true
                ret.parentPath = lookup.path
                ret.parentObject = lookup.node
                ret.name = PATH.basename(path)
                lookup = FS.lookupPath(path, { follow: !dontResolveLastLink })
                ret.exists = true
                ret.path = lookup.path
                ret.object = lookup.node
                ret.name = lookup.node.name
                ret.isRoot = lookup.path === '/'
            } catch (e) {
                ret.error = e.errno
            }
            return ret
        },
        createPath: function (parent, path, canRead, canWrite) {
            parent = typeof parent === 'string' ? parent : FS.getPath(parent)
            var parts = path.split('/').reverse()
            while (parts.length) {
                var part = parts.pop()
                if (!part) continue
                var current = PATH.join2(parent, part)
                try {
                    FS.mkdir(current)
                } catch (e) {}
                parent = current
            }
            return current
        },
        createFile: function (parent, name, properties, canRead, canWrite) {
            var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name)
            var mode = FS.getMode(canRead, canWrite)
            return FS.create(path, mode)
        },
        createDataFile: function (parent, name, data, canRead, canWrite, canOwn) {
            var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent
            var mode = FS.getMode(canRead, canWrite)
            var node = FS.create(path, mode)
            if (data) {
                if (typeof data === 'string') {
                    var arr = new Array(data.length)
                    for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i)
                    data = arr
                }
                FS.chmod(node, mode | 146)
                var stream = FS.open(node, 'w')
                FS.write(stream, data, 0, data.length, 0, canOwn)
                FS.close(stream)
                FS.chmod(node, mode)
            }
            return node
        },
        createDevice: function (parent, name, input, output) {
            var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name)
            var mode = FS.getMode(!!input, !!output)
            if (!FS.createDevice.major) FS.createDevice.major = 64
            var dev = FS.makedev(FS.createDevice.major++, 0)
            FS.registerDevice(dev, {
                open: function (stream) {
                    stream.seekable = false
                },
                close: function (stream) {
                    if (output && output.buffer && output.buffer.length) {
                        output(10)
                    }
                },
                read: function (stream, buffer, offset, length, pos) {
                    var bytesRead = 0
                    for (var i = 0; i < length; i++) {
                        var result
                        try {
                            result = input()
                        } catch (e) {
                            throw new FS.ErrnoError(29)
                        }
                        if (result === undefined && bytesRead === 0) {
                            throw new FS.ErrnoError(6)
                        }
                        if (result === null || result === undefined) break
                        bytesRead++
                        buffer[offset + i] = result
                    }
                    if (bytesRead) {
                        stream.node.timestamp = Date.now()
                    }
                    return bytesRead
                },
                write: function (stream, buffer, offset, length, pos) {
                    for (var i = 0; i < length; i++) {
                        try {
                            output(buffer[offset + i])
                        } catch (e) {
                            throw new FS.ErrnoError(29)
                        }
                    }
                    if (length) {
                        stream.node.timestamp = Date.now()
                    }
                    return i
                }
            })
            return FS.mkdev(path, mode, dev)
        },
        forceLoadFile: function (obj) {
            if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true
            var success = true
            if (typeof XMLHttpRequest !== 'undefined') {
                throw new Error(
                    'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.'
                )
            } else if (read_) {
                try {
                    obj.contents = intArrayFromString(read_(obj.url), true)
                    obj.usedBytes = obj.contents.length
                } catch (e) {
                    success = false
                }
            } else {
                throw new Error('Cannot load without read() or XMLHttpRequest.')
            }
            if (!success) setErrNo(29)
            return success
        },
        createLazyFile: function (parent, name, url, canRead, canWrite) {
            function LazyUint8Array() {
                this.lengthKnown = false
                this.chunks = []
            }
            LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
                if (idx > this.length - 1 || idx < 0) {
                    return undefined
                }
                var chunkOffset = idx % this.chunkSize
                var chunkNum = (idx / this.chunkSize) | 0
                return this.getter(chunkNum)[chunkOffset]
            }
            LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
                this.getter = getter
            }
            LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
                var xhr = new XMLHttpRequest()
                xhr.open('HEAD', url, false)
                xhr.send(null)
                if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
                    throw new Error("Couldn't load " + url + '. Status: ' + xhr.status)
                var datalength = Number(xhr.getResponseHeader('Content-length'))
                var header
                var hasByteServing = (header = xhr.getResponseHeader('Accept-Ranges')) && header === 'bytes'
                var usesGzip = (header = xhr.getResponseHeader('Content-Encoding')) && header === 'gzip'
                var chunkSize = 1024 * 1024
                if (!hasByteServing) chunkSize = datalength
                var doXHR = function (from, to) {
                    if (from > to) throw new Error('invalid range (' + from + ', ' + to + ') or no bytes requested!')
                    if (to > datalength - 1)
                        throw new Error('only ' + datalength + ' bytes available! programmer error!')
                    var xhr = new XMLHttpRequest()
                    xhr.open('GET', url, false)
                    if (datalength !== chunkSize) xhr.setRequestHeader('Range', 'bytes=' + from + '-' + to)
                    if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer'
                    if (xhr.overrideMimeType) {
                        xhr.overrideMimeType('text/plain; charset=x-user-defined')
                    }
                    xhr.send(null)
                    if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
                        throw new Error("Couldn't load " + url + '. Status: ' + xhr.status)
                    if (xhr.response !== undefined) {
                        return new Uint8Array(xhr.response || [])
                    } else {
                        return intArrayFromString(xhr.responseText || '', true)
                    }
                }
                var lazyArray = this
                lazyArray.setDataGetter(function (chunkNum) {
                    var start = chunkNum * chunkSize
                    var end = (chunkNum + 1) * chunkSize - 1
                    end = Math.min(end, datalength - 1)
                    if (typeof lazyArray.chunks[chunkNum] === 'undefined') {
                        lazyArray.chunks[chunkNum] = doXHR(start, end)
                    }
                    if (typeof lazyArray.chunks[chunkNum] === 'undefined') throw new Error('doXHR failed!')
                    return lazyArray.chunks[chunkNum]
                })
                if (usesGzip || !datalength) {
                    chunkSize = datalength = 1
                    datalength = this.getter(0).length
                    chunkSize = datalength
                    out('LazyFiles on gzip forces download of the whole file when length is accessed')
                }
                this._length = datalength
                this._chunkSize = chunkSize
                this.lengthKnown = true
            }
            if (typeof XMLHttpRequest !== 'undefined') {
                if (!ENVIRONMENT_IS_WORKER)
                    throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc'
                var lazyArray = new LazyUint8Array()
                Object.defineProperties(lazyArray, {
                    length: {
                        get: function () {
                            if (!this.lengthKnown) {
                                this.cacheLength()
                            }
                            return this._length
                        }
                    },
                    chunkSize: {
                        get: function () {
                            if (!this.lengthKnown) {
                                this.cacheLength()
                            }
                            return this._chunkSize
                        }
                    }
                })
                var properties = { isDevice: false, contents: lazyArray }
            } else {
                var properties = { isDevice: false, url: url }
            }
            var node = FS.createFile(parent, name, properties, canRead, canWrite)
            if (properties.contents) {
                node.contents = properties.contents
            } else if (properties.url) {
                node.contents = null
                node.url = properties.url
            }
            Object.defineProperties(node, {
                usedBytes: {
                    get: function () {
                        return this.contents.length
                    }
                }
            })
            var stream_ops = {}
            var keys = Object.keys(node.stream_ops)
            keys.forEach(function (key) {
                var fn = node.stream_ops[key]
                stream_ops[key] = function forceLoadLazyFile() {
                    if (!FS.forceLoadFile(node)) {
                        throw new FS.ErrnoError(29)
                    }
                    return fn.apply(null, arguments)
                }
            })
            stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
                if (!FS.forceLoadFile(node)) {
                    throw new FS.ErrnoError(29)
                }
                var contents = stream.node.contents
                if (position >= contents.length) return 0
                var size = Math.min(contents.length - position, length)
                if (contents.slice) {
                    for (var i = 0; i < size; i++) {
                        buffer[offset + i] = contents[position + i]
                    }
                } else {
                    for (var i = 0; i < size; i++) {
                        buffer[offset + i] = contents.get(position + i)
                    }
                }
                return size
            }
            node.stream_ops = stream_ops
            return node
        },
        createPreloadedFile: function (
            parent,
            name,
            url,
            canRead,
            canWrite,
            onload,
            onerror,
            dontCreateFile,
            canOwn,
            preFinish
        ) {
            Browser.init()
            var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent
            var dep = getUniqueRunDependency('cp ' + fullname)
            function processData(byteArray) {
                function finish(byteArray) {
                    if (preFinish) preFinish()
                    if (!dontCreateFile) {
                        FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn)
                    }
                    if (onload) onload()
                    removeRunDependency(dep)
                }
                var handled = false
                Module['preloadPlugins'].forEach(function (plugin) {
                    if (handled) return
                    if (plugin['canHandle'](fullname)) {
                        plugin['handle'](byteArray, fullname, finish, function () {
                            if (onerror) onerror()
                            removeRunDependency(dep)
                        })
                        handled = true
                    }
                })
                if (!handled) finish(byteArray)
            }
            addRunDependency(dep)
            if (typeof url == 'string') {
                Browser.asyncLoad(
                    url,
                    function (byteArray) {
                        processData(byteArray)
                    },
                    onerror
                )
            } else {
                processData(url)
            }
        },
        indexedDB: function () {
            return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
        },
        DB_NAME: function () {
            return 'EM_FS_' + window.location.pathname
        },
        DB_VERSION: 20,
        DB_STORE_NAME: 'FILE_DATA',
        saveFilesToDB: function (paths, onload, onerror) {
            onload = onload || function () {}
            onerror = onerror || function () {}
            var indexedDB = FS.indexedDB()
            try {
                var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
            } catch (e) {
                return onerror(e)
            }
            openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
                out('creating db')
                var db = openRequest.result
                db.createObjectStore(FS.DB_STORE_NAME)
            }
            openRequest.onsuccess = function openRequest_onsuccess() {
                var db = openRequest.result
                var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite')
                var files = transaction.objectStore(FS.DB_STORE_NAME)
                var ok = 0,
                    fail = 0,
                    total = paths.length
                function finish() {
                    if (fail == 0) onload()
                    else onerror()
                }
                paths.forEach(function (path) {
                    var putRequest = files.put(FS.analyzePath(path).object.contents, path)
                    putRequest.onsuccess = function putRequest_onsuccess() {
                        ok++
                        if (ok + fail == total) finish()
                    }
                    putRequest.onerror = function putRequest_onerror() {
                        fail++
                        if (ok + fail == total) finish()
                    }
                })
                transaction.onerror = onerror
            }
            openRequest.onerror = onerror
        },
        loadFilesFromDB: function (paths, onload, onerror) {
            onload = onload || function () {}
            onerror = onerror || function () {}
            var indexedDB = FS.indexedDB()
            try {
                var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
            } catch (e) {
                return onerror(e)
            }
            openRequest.onupgradeneeded = onerror
            openRequest.onsuccess = function openRequest_onsuccess() {
                var db = openRequest.result
                try {
                    var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly')
                } catch (e) {
                    onerror(e)
                    return
                }
                var files = transaction.objectStore(FS.DB_STORE_NAME)
                var ok = 0,
                    fail = 0,
                    total = paths.length
                function finish() {
                    if (fail == 0) onload()
                    else onerror()
                }
                paths.forEach(function (path) {
                    var getRequest = files.get(path)
                    getRequest.onsuccess = function getRequest_onsuccess() {
                        if (FS.analyzePath(path).exists) {
                            FS.unlink(path)
                        }
                        FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true)
                        ok++
                        if (ok + fail == total) finish()
                    }
                    getRequest.onerror = function getRequest_onerror() {
                        fail++
                        if (ok + fail == total) finish()
                    }
                })
                transaction.onerror = onerror
            }
            openRequest.onerror = onerror
        }
    }
    var SYSCALLS = {
        mappings: {},
        DEFAULT_POLLMASK: 5,
        umask: 511,
        calculateAt: function (dirfd, path) {
            if (path[0] !== '/') {
                var dir
                if (dirfd === -100) {
                    dir = FS.cwd()
                } else {
                    var dirstream = FS.getStream(dirfd)
                    if (!dirstream) throw new FS.ErrnoError(8)
                    dir = dirstream.path
                }
                path = PATH.join2(dir, path)
            }
            return path
        },
        doStat: function (func, path, buf) {
            try {
                var stat = func(path)
            } catch (e) {
                if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
                    return -54
                }
                throw e
            }
            HEAP32[buf >>> 2] = stat.dev
            HEAP32[(buf + 4) >>> 2] = 0
            HEAP32[(buf + 8) >>> 2] = stat.ino
            HEAP32[(buf + 12) >>> 2] = stat.mode
            HEAP32[(buf + 16) >>> 2] = stat.nlink
            HEAP32[(buf + 20) >>> 2] = stat.uid
            HEAP32[(buf + 24) >>> 2] = stat.gid
            HEAP32[(buf + 28) >>> 2] = stat.rdev
            HEAP32[(buf + 32) >>> 2] = 0
            ;(tempI64 = [
                stat.size >>> 0,
                ((tempDouble = stat.size),
                +Math.abs(tempDouble) >= 1
                    ? tempDouble > 0
                        ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                        : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
                    : 0)
            ]),
                (HEAP32[(buf + 40) >>> 2] = tempI64[0]),
                (HEAP32[(buf + 44) >>> 2] = tempI64[1])
            HEAP32[(buf + 48) >>> 2] = 4096
            HEAP32[(buf + 52) >>> 2] = stat.blocks
            HEAP32[(buf + 56) >>> 2] = (stat.atime.getTime() / 1e3) | 0
            HEAP32[(buf + 60) >>> 2] = 0
            HEAP32[(buf + 64) >>> 2] = (stat.mtime.getTime() / 1e3) | 0
            HEAP32[(buf + 68) >>> 2] = 0
            HEAP32[(buf + 72) >>> 2] = (stat.ctime.getTime() / 1e3) | 0
            HEAP32[(buf + 76) >>> 2] = 0
            ;(tempI64 = [
                stat.ino >>> 0,
                ((tempDouble = stat.ino),
                +Math.abs(tempDouble) >= 1
                    ? tempDouble > 0
                        ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                        : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
                    : 0)
            ]),
                (HEAP32[(buf + 80) >>> 2] = tempI64[0]),
                (HEAP32[(buf + 84) >>> 2] = tempI64[1])
            return 0
        },
        doMsync: function (addr, stream, len, flags, offset) {
            var buffer = HEAPU8.slice(addr, addr + len)
            FS.msync(stream, buffer, offset, len, flags)
        },
        doMkdir: function (path, mode) {
            path = PATH.normalize(path)
            if (path[path.length - 1] === '/') path = path.substr(0, path.length - 1)
            FS.mkdir(path, mode, 0)
            return 0
        },
        doMknod: function (path, mode, dev) {
            switch (mode & 61440) {
                case 32768:
                case 8192:
                case 24576:
                case 4096:
                case 49152:
                    break
                default:
                    return -28
            }
            FS.mknod(path, mode, dev)
            return 0
        },
        doReadlink: function (path, buf, bufsize) {
            if (bufsize <= 0) return -28
            var ret = FS.readlink(path)
            var len = Math.min(bufsize, lengthBytesUTF8(ret))
            var endChar = HEAP8[(buf + len) >>> 0]
            stringToUTF8(ret, buf, bufsize + 1)
            HEAP8[(buf + len) >>> 0] = endChar
            return len
        },
        doAccess: function (path, amode) {
            if (amode & ~7) {
                return -28
            }
            var node
            var lookup = FS.lookupPath(path, { follow: true })
            node = lookup.node
            if (!node) {
                return -44
            }
            var perms = ''
            if (amode & 4) perms += 'r'
            if (amode & 2) perms += 'w'
            if (amode & 1) perms += 'x'
            if (perms && FS.nodePermissions(node, perms)) {
                return -2
            }
            return 0
        },
        doDup: function (path, flags, suggestFD) {
            var suggest = FS.getStream(suggestFD)
            if (suggest) FS.close(suggest)
            return FS.open(path, flags, 0, suggestFD, suggestFD).fd
        },
        doReadv: function (stream, iov, iovcnt, offset) {
            var ret = 0
            for (var i = 0; i < iovcnt; i++) {
                var ptr = HEAP32[(iov + i * 8) >>> 2]
                var len = HEAP32[(iov + (i * 8 + 4)) >>> 2]
                var curr = FS.read(stream, HEAP8, ptr, len, offset)
                if (curr < 0) return -1
                ret += curr
                if (curr < len) break
            }
            return ret
        },
        doWritev: function (stream, iov, iovcnt, offset) {
            var ret = 0
            for (var i = 0; i < iovcnt; i++) {
                var ptr = HEAP32[(iov + i * 8) >>> 2]
                var len = HEAP32[(iov + (i * 8 + 4)) >>> 2]
                var curr = FS.write(stream, HEAP8, ptr, len, offset)
                if (curr < 0) return -1
                ret += curr
            }
            return ret
        },
        varargs: undefined,
        get: function () {
            SYSCALLS.varargs += 4
            var ret = HEAP32[(SYSCALLS.varargs - 4) >>> 2]
            return ret
        },
        getStr: function (ptr) {
            var ret = UTF8ToString(ptr)
            return ret
        },
        getStreamFromFD: function (fd) {
            var stream = FS.getStream(fd)
            if (!stream) throw new FS.ErrnoError(8)
            return stream
        },
        get64: function (low, high) {
            return low
        }
    }
    function ___sys_access(path, amode) {
        try {
            path = SYSCALLS.getStr(path)
            return SYSCALLS.doAccess(path, amode)
        } catch (e) {
            if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
            return -e.errno
        }
    }
    function ___sys_fcntl64(fd, cmd, varargs) {
        SYSCALLS.varargs = varargs
        try {
            var stream = SYSCALLS.getStreamFromFD(fd)
            switch (cmd) {
                case 0: {
                    var arg = SYSCALLS.get()
                    if (arg < 0) {
                        return -28
                    }
                    var newStream
                    newStream = FS.open(stream.path, stream.flags, 0, arg)
                    return newStream.fd
                }
                case 1:
                case 2:
                    return 0
                case 3:
                    return stream.flags
                case 4: {
                    var arg = SYSCALLS.get()
                    stream.flags |= arg
                    return 0
                }
                case 12: {
                    var arg = SYSCALLS.get()
                    var offset = 0
                    HEAP16[(arg + offset) >>> 1] = 2
                    return 0
                }
                case 13:
                case 14:
                    return 0
                case 16:
                case 8:
                    return -28
                case 9:
                    setErrNo(28)
                    return -1
                default: {
                    return -28
                }
            }
        } catch (e) {
            if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
            return -e.errno
        }
    }
    function ___sys_ftruncate64(fd, zero, low, high) {
        try {
            var length = SYSCALLS.get64(low, high)
            FS.ftruncate(fd, length)
            return 0
        } catch (e) {
            if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
            return -e.errno
        }
    }
    function ___sys_getdents64(fd, dirp, count) {
        try {
            var stream = SYSCALLS.getStreamFromFD(fd)
            if (!stream.getdents) {
                stream.getdents = FS.readdir(stream.path)
            }
            var struct_size = 280
            var pos = 0
            var off = FS.llseek(stream, 0, 1)
            var idx = Math.floor(off / struct_size)
            while (idx < stream.getdents.length && pos + struct_size <= count) {
                var id
                var type
                var name = stream.getdents[idx]
                if (name[0] === '.') {
                    id = 1
                    type = 4
                } else {
                    var child = FS.lookupNode(stream.node, name)
                    id = child.id
                    type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8
                }
                ;(tempI64 = [
                    id >>> 0,
                    ((tempDouble = id),
                    +Math.abs(tempDouble) >= 1
                        ? tempDouble > 0
                            ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                            : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
                        : 0)
                ]),
                    (HEAP32[(dirp + pos) >>> 2] = tempI64[0]),
                    (HEAP32[(dirp + pos + 4) >>> 2] = tempI64[1])
                ;(tempI64 = [
                    ((idx + 1) * struct_size) >>> 0,
                    ((tempDouble = (idx + 1) * struct_size),
                    +Math.abs(tempDouble) >= 1
                        ? tempDouble > 0
                            ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                            : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
                        : 0)
                ]),
                    (HEAP32[(dirp + pos + 8) >>> 2] = tempI64[0]),
                    (HEAP32[(dirp + pos + 12) >>> 2] = tempI64[1])
                HEAP16[(dirp + pos + 16) >>> 1] = 280
                HEAP8[(dirp + pos + 18) >>> 0] = type
                stringToUTF8(name, dirp + pos + 19, 256)
                pos += struct_size
                idx += 1
            }
            FS.llseek(stream, idx * struct_size, 0)
            return pos
        } catch (e) {
            if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
            return -e.errno
        }
    }
    function ___sys_getegid32() {
        return 0
    }
    function ___sys_geteuid32() {
        return ___sys_getegid32()
    }
    function ___sys_getpid() {
        return 42
    }
    function ___sys_getuid32() {
        return ___sys_getegid32()
    }
    function ___sys_ioctl(fd, op, varargs) {
        SYSCALLS.varargs = varargs
        try {
            var stream = SYSCALLS.getStreamFromFD(fd)
            switch (op) {
                case 21509:
                case 21505: {
                    if (!stream.tty) return -59
                    return 0
                }
                case 21510:
                case 21511:
                case 21512:
                case 21506:
                case 21507:
                case 21508: {
                    if (!stream.tty) return -59
                    return 0
                }
                case 21519: {
                    if (!stream.tty) return -59
                    var argp = SYSCALLS.get()
                    HEAP32[argp >>> 2] = 0
                    return 0
                }
                case 21520: {
                    if (!stream.tty) return -59
                    return -28
                }
                case 21531: {
                    var argp = SYSCALLS.get()
                    return FS.ioctl(stream, op, argp)
                }
                case 21523: {
                    if (!stream.tty) return -59
                    return 0
                }
                case 21524: {
                    if (!stream.tty) return -59
                    return 0
                }
                default:
                    abort('bad ioctl syscall ' + op)
            }
        } catch (e) {
            if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
            return -e.errno
        }
    }
    function ___sys_open(path, flags, varargs) {
        SYSCALLS.varargs = varargs
        try {
            var pathname = SYSCALLS.getStr(path)
            var mode = SYSCALLS.get()
            var stream = FS.open(pathname, flags, mode)
            return stream.fd
        } catch (e) {
            if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
            return -e.errno
        }
    }
    function ___sys_read(fd, buf, count) {
        try {
            var stream = SYSCALLS.getStreamFromFD(fd)
            return FS.read(stream, HEAP8, buf, count)
        } catch (e) {
            if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
            return -e.errno
        }
    }
    function ___sys_rmdir(path) {
        try {
            path = SYSCALLS.getStr(path)
            FS.rmdir(path)
            return 0
        } catch (e) {
            if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
            return -e.errno
        }
    }
    function ___sys_stat64(path, buf) {
        try {
            path = SYSCALLS.getStr(path)
            return SYSCALLS.doStat(FS.stat, path, buf)
        } catch (e) {
            if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
            return -e.errno
        }
    }
    function ___sys_unlink(path) {
        try {
            path = SYSCALLS.getStr(path)
            FS.unlink(path)
            return 0
        } catch (e) {
            if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
            return -e.errno
        }
    }
    var tupleRegistrations = {}
    function runDestructors(destructors) {
        while (destructors.length) {
            var ptr = destructors.pop()
            var del = destructors.pop()
            del(ptr)
        }
    }
    function simpleReadValueFromPointer(pointer) {
        return this['fromWireType'](HEAPU32[pointer >>> 2])
    }
    var awaitingDependencies = {}
    var registeredTypes = {}
    var typeDependencies = {}
    var char_0 = 48
    var char_9 = 57
    function makeLegalFunctionName(name) {
        if (undefined === name) {
            return '_unknown'
        }
        name = name.replace(/[^a-zA-Z0-9_]/g, '$')
        var f = name.charCodeAt(0)
        if (f >= char_0 && f <= char_9) {
            return '_' + name
        } else {
            return name
        }
    }
    function createNamedFunction(name, body) {
        name = makeLegalFunctionName(name)
        return new Function(
            'body',
            'return function ' +
                name +
                '() {\n' +
                '    "use strict";' +
                '    return body.apply(this, arguments);\n' +
                '};\n'
        )(body)
    }
    function extendError(baseErrorType, errorName) {
        var errorClass = createNamedFunction(errorName, function (message) {
            this.name = errorName
            this.message = message
            var stack = new Error(message).stack
            if (stack !== undefined) {
                this.stack = this.toString() + '\n' + stack.replace(/^Error(:[^\n]*)?\n/, '')
            }
        })
        errorClass.prototype = Object.create(baseErrorType.prototype)
        errorClass.prototype.constructor = errorClass
        errorClass.prototype.toString = function () {
            if (this.message === undefined) {
                return this.name
            } else {
                return this.name + ': ' + this.message
            }
        }
        return errorClass
    }
    var InternalError = undefined
    function throwInternalError(message) {
        throw new InternalError(message)
    }
    function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
        myTypes.forEach(function (type) {
            typeDependencies[type] = dependentTypes
        })
        function onComplete(typeConverters) {
            var myTypeConverters = getTypeConverters(typeConverters)
            if (myTypeConverters.length !== myTypes.length) {
                throwInternalError('Mismatched type converter count')
            }
            for (var i = 0; i < myTypes.length; ++i) {
                registerType(myTypes[i], myTypeConverters[i])
            }
        }
        var typeConverters = new Array(dependentTypes.length)
        var unregisteredTypes = []
        var registered = 0
        dependentTypes.forEach(function (dt, i) {
            if (registeredTypes.hasOwnProperty(dt)) {
                typeConverters[i] = registeredTypes[dt]
            } else {
                unregisteredTypes.push(dt)
                if (!awaitingDependencies.hasOwnProperty(dt)) {
                    awaitingDependencies[dt] = []
                }
                awaitingDependencies[dt].push(function () {
                    typeConverters[i] = registeredTypes[dt]
                    ++registered
                    if (registered === unregisteredTypes.length) {
                        onComplete(typeConverters)
                    }
                })
            }
        })
        if (0 === unregisteredTypes.length) {
            onComplete(typeConverters)
        }
    }
    function __embind_finalize_value_array(rawTupleType) {
        var reg = tupleRegistrations[rawTupleType]
        delete tupleRegistrations[rawTupleType]
        var elements = reg.elements
        var elementsLength = elements.length
        var elementTypes = elements
            .map(function (elt) {
                return elt.getterReturnType
            })
            .concat(
                elements.map(function (elt) {
                    return elt.setterArgumentType
                })
            )
        var rawConstructor = reg.rawConstructor
        var rawDestructor = reg.rawDestructor
        whenDependentTypesAreResolved([rawTupleType], elementTypes, function (elementTypes) {
            elements.forEach(function (elt, i) {
                var getterReturnType = elementTypes[i]
                var getter = elt.getter
                var getterContext = elt.getterContext
                var setterArgumentType = elementTypes[i + elementsLength]
                var setter = elt.setter
                var setterContext = elt.setterContext
                elt.read = function (ptr) {
                    return getterReturnType['fromWireType'](getter(getterContext, ptr))
                }
                elt.write = function (ptr, o) {
                    var destructors = []
                    setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, o))
                    runDestructors(destructors)
                }
            })
            return [
                {
                    name: reg.name,
                    fromWireType: function (ptr) {
                        var rv = new Array(elementsLength)
                        for (var i = 0; i < elementsLength; ++i) {
                            rv[i] = elements[i].read(ptr)
                        }
                        rawDestructor(ptr)
                        return rv
                    },
                    toWireType: function (destructors, o) {
                        if (elementsLength !== o.length) {
                            throw new TypeError(
                                'Incorrect number of tuple elements for ' +
                                    reg.name +
                                    ': expected=' +
                                    elementsLength +
                                    ', actual=' +
                                    o.length
                            )
                        }
                        var ptr = rawConstructor()
                        for (var i = 0; i < elementsLength; ++i) {
                            elements[i].write(ptr, o[i])
                        }
                        if (destructors !== null) {
                            destructors.push(rawDestructor, ptr)
                        }
                        return ptr
                    },
                    argPackAdvance: 8,
                    readValueFromPointer: simpleReadValueFromPointer,
                    destructorFunction: rawDestructor
                }
            ]
        })
    }
    function getShiftFromSize(size) {
        switch (size) {
            case 1:
                return 0
            case 2:
                return 1
            case 4:
                return 2
            case 8:
                return 3
            default:
                throw new TypeError('Unknown type size: ' + size)
        }
    }
    function embind_init_charCodes() {
        var codes = new Array(256)
        for (var i = 0; i < 256; ++i) {
            codes[i] = String.fromCharCode(i)
        }
        embind_charCodes = codes
    }
    var embind_charCodes = undefined
    function readLatin1String(ptr) {
        var ret = ''
        var c = ptr
        while (HEAPU8[c >>> 0]) {
            ret += embind_charCodes[HEAPU8[c++ >>> 0]]
        }
        return ret
    }
    var BindingError = undefined
    function throwBindingError(message) {
        throw new BindingError(message)
    }
    function registerType(rawType, registeredInstance, options) {
        options = options || {}
        if (!('argPackAdvance' in registeredInstance)) {
            throw new TypeError('registerType registeredInstance requires argPackAdvance')
        }
        var name = registeredInstance.name
        if (!rawType) {
            throwBindingError('type "' + name + '" must have a positive integer typeid pointer')
        }
        if (registeredTypes.hasOwnProperty(rawType)) {
            if (options.ignoreDuplicateRegistrations) {
                return
            } else {
                throwBindingError("Cannot register type '" + name + "' twice")
            }
        }
        registeredTypes[rawType] = registeredInstance
        delete typeDependencies[rawType]
        if (awaitingDependencies.hasOwnProperty(rawType)) {
            var callbacks = awaitingDependencies[rawType]
            delete awaitingDependencies[rawType]
            callbacks.forEach(function (cb) {
                cb()
            })
        }
    }
    function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
        var shift = getShiftFromSize(size)
        name = readLatin1String(name)
        registerType(rawType, {
            name: name,
            fromWireType: function (wt) {
                return !!wt
            },
            toWireType: function (destructors, o) {
                return o ? trueValue : falseValue
            },
            argPackAdvance: 8,
            readValueFromPointer: function (pointer) {
                var heap
                if (size === 1) {
                    heap = HEAP8
                } else if (size === 2) {
                    heap = HEAP16
                } else if (size === 4) {
                    heap = HEAP32
                } else {
                    throw new TypeError('Unknown boolean type size: ' + name)
                }
                return this['fromWireType'](heap[pointer >>> shift])
            },
            destructorFunction: null
        })
    }
    function ClassHandle_isAliasOf(other) {
        if (!(this instanceof ClassHandle)) {
            return false
        }
        if (!(other instanceof ClassHandle)) {
            return false
        }
        var leftClass = this.$$.ptrType.registeredClass
        var left = this.$$.ptr
        var rightClass = other.$$.ptrType.registeredClass
        var right = other.$$.ptr
        while (leftClass.baseClass) {
            left = leftClass.upcast(left)
            leftClass = leftClass.baseClass
        }
        while (rightClass.baseClass) {
            right = rightClass.upcast(right)
            rightClass = rightClass.baseClass
        }
        return leftClass === rightClass && left === right
    }
    function shallowCopyInternalPointer(o) {
        return {
            count: o.count,
            deleteScheduled: o.deleteScheduled,
            preservePointerOnDelete: o.preservePointerOnDelete,
            ptr: o.ptr,
            ptrType: o.ptrType,
            smartPtr: o.smartPtr,
            smartPtrType: o.smartPtrType
        }
    }
    function throwInstanceAlreadyDeleted(obj) {
        function getInstanceTypeName(handle) {
            return handle.$$.ptrType.registeredClass.name
        }
        throwBindingError(getInstanceTypeName(obj) + ' instance already deleted')
    }
    var finalizationGroup = false
    function detachFinalizer(handle) {}
    function runDestructor($$) {
        if ($$.smartPtr) {
            $$.smartPtrType.rawDestructor($$.smartPtr)
        } else {
            $$.ptrType.registeredClass.rawDestructor($$.ptr)
        }
    }
    function releaseClassHandle($$) {
        $$.count.value -= 1
        var toDelete = 0 === $$.count.value
        if (toDelete) {
            runDestructor($$)
        }
    }
    function attachFinalizer(handle) {
        if ('undefined' === typeof FinalizationGroup) {
            attachFinalizer = function (handle) {
                return handle
            }
            return handle
        }
        finalizationGroup = new FinalizationGroup(function (iter) {
            for (var result = iter.next(); !result.done; result = iter.next()) {
                var $$ = result.value
                if (!$$.ptr) {
                    console.warn('object already deleted: ' + $$.ptr)
                } else {
                    releaseClassHandle($$)
                }
            }
        })
        attachFinalizer = function (handle) {
            finalizationGroup.register(handle, handle.$$, handle.$$)
            return handle
        }
        detachFinalizer = function (handle) {
            finalizationGroup.unregister(handle.$$)
        }
        return attachFinalizer(handle)
    }
    function ClassHandle_clone() {
        if (!this.$$.ptr) {
            throwInstanceAlreadyDeleted(this)
        }
        if (this.$$.preservePointerOnDelete) {
            this.$$.count.value += 1
            return this
        } else {
            var clone = attachFinalizer(
                Object.create(Object.getPrototypeOf(this), { $$: { value: shallowCopyInternalPointer(this.$$) } })
            )
            clone.$$.count.value += 1
            clone.$$.deleteScheduled = false
            return clone
        }
    }
    function ClassHandle_delete() {
        if (!this.$$.ptr) {
            throwInstanceAlreadyDeleted(this)
        }
        if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
            throwBindingError('Object already scheduled for deletion')
        }
        detachFinalizer(this)
        releaseClassHandle(this.$$)
        if (!this.$$.preservePointerOnDelete) {
            this.$$.smartPtr = undefined
            this.$$.ptr = undefined
        }
    }
    function ClassHandle_isDeleted() {
        return !this.$$.ptr
    }
    var delayFunction = undefined
    var deletionQueue = []
    function flushPendingDeletes() {
        while (deletionQueue.length) {
            var obj = deletionQueue.pop()
            obj.$$.deleteScheduled = false
            obj['delete']()
        }
    }
    function ClassHandle_deleteLater() {
        if (!this.$$.ptr) {
            throwInstanceAlreadyDeleted(this)
        }
        if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
            throwBindingError('Object already scheduled for deletion')
        }
        deletionQueue.push(this)
        if (deletionQueue.length === 1 && delayFunction) {
            delayFunction(flushPendingDeletes)
        }
        this.$$.deleteScheduled = true
        return this
    }
    function init_ClassHandle() {
        ClassHandle.prototype['isAliasOf'] = ClassHandle_isAliasOf
        ClassHandle.prototype['clone'] = ClassHandle_clone
        ClassHandle.prototype['delete'] = ClassHandle_delete
        ClassHandle.prototype['isDeleted'] = ClassHandle_isDeleted
        ClassHandle.prototype['deleteLater'] = ClassHandle_deleteLater
    }
    function ClassHandle() {}
    var registeredPointers = {}
    function ensureOverloadTable(proto, methodName, humanName) {
        if (undefined === proto[methodName].overloadTable) {
            var prevFunc = proto[methodName]
            proto[methodName] = function () {
                if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                    throwBindingError(
                        "Function '" +
                            humanName +
                            "' called with an invalid number of arguments (" +
                            arguments.length +
                            ') - expects one of (' +
                            proto[methodName].overloadTable +
                            ')!'
                    )
                }
                return proto[methodName].overloadTable[arguments.length].apply(this, arguments)
            }
            proto[methodName].overloadTable = []
            proto[methodName].overloadTable[prevFunc.argCount] = prevFunc
        }
    }
    function exposePublicSymbol(name, value, numArguments) {
        if (Module.hasOwnProperty(name)) {
            if (
                undefined === numArguments ||
                (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])
            ) {
                throwBindingError("Cannot register public name '" + name + "' twice")
            }
            ensureOverloadTable(Module, name, name)
            if (Module.hasOwnProperty(numArguments)) {
                throwBindingError(
                    'Cannot register multiple overloads of a function with the same number of arguments (' +
                        numArguments +
                        ')!'
                )
            }
            Module[name].overloadTable[numArguments] = value
        } else {
            Module[name] = value
            if (undefined !== numArguments) {
                Module[name].numArguments = numArguments
            }
        }
    }
    function RegisteredClass(
        name,
        constructor,
        instancePrototype,
        rawDestructor,
        baseClass,
        getActualType,
        upcast,
        downcast
    ) {
        this.name = name
        this.constructor = constructor
        this.instancePrototype = instancePrototype
        this.rawDestructor = rawDestructor
        this.baseClass = baseClass
        this.getActualType = getActualType
        this.upcast = upcast
        this.downcast = downcast
        this.pureVirtualFunctions = []
    }
    function upcastPointer(ptr, ptrClass, desiredClass) {
        while (ptrClass !== desiredClass) {
            if (!ptrClass.upcast) {
                throwBindingError(
                    'Expected null or instance of ' + desiredClass.name + ', got an instance of ' + ptrClass.name
                )
            }
            ptr = ptrClass.upcast(ptr)
            ptrClass = ptrClass.baseClass
        }
        return ptr
    }
    function constNoSmartPtrRawPointerToWireType(destructors, handle) {
        if (handle === null) {
            if (this.isReference) {
                throwBindingError('null is not a valid ' + this.name)
            }
            return 0
        }
        if (!handle.$$) {
            throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name)
        }
        if (!handle.$$.ptr) {
            throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name)
        }
        var handleClass = handle.$$.ptrType.registeredClass
        var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass)
        return ptr
    }
    function genericPointerToWireType(destructors, handle) {
        var ptr
        if (handle === null) {
            if (this.isReference) {
                throwBindingError('null is not a valid ' + this.name)
            }
            if (this.isSmartPointer) {
                ptr = this.rawConstructor()
                if (destructors !== null) {
                    destructors.push(this.rawDestructor, ptr)
                }
                return ptr
            } else {
                return 0
            }
        }
        if (!handle.$$) {
            throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name)
        }
        if (!handle.$$.ptr) {
            throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name)
        }
        if (!this.isConst && handle.$$.ptrType.isConst) {
            throwBindingError(
                'Cannot convert argument of type ' +
                    (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) +
                    ' to parameter type ' +
                    this.name
            )
        }
        var handleClass = handle.$$.ptrType.registeredClass
        ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass)
        if (this.isSmartPointer) {
            if (undefined === handle.$$.smartPtr) {
                throwBindingError('Passing raw pointer to smart pointer is illegal')
            }
            switch (this.sharingPolicy) {
                case 0:
                    if (handle.$$.smartPtrType === this) {
                        ptr = handle.$$.smartPtr
                    } else {
                        throwBindingError(
                            'Cannot convert argument of type ' +
                                (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) +
                                ' to parameter type ' +
                                this.name
                        )
                    }
                    break
                case 1:
                    ptr = handle.$$.smartPtr
                    break
                case 2:
                    if (handle.$$.smartPtrType === this) {
                        ptr = handle.$$.smartPtr
                    } else {
                        var clonedHandle = handle['clone']()
                        ptr = this.rawShare(
                            ptr,
                            __emval_register(function () {
                                clonedHandle['delete']()
                            })
                        )
                        if (destructors !== null) {
                            destructors.push(this.rawDestructor, ptr)
                        }
                    }
                    break
                default:
                    throwBindingError('Unsupporting sharing policy')
            }
        }
        return ptr
    }
    function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
        if (handle === null) {
            if (this.isReference) {
                throwBindingError('null is not a valid ' + this.name)
            }
            return 0
        }
        if (!handle.$$) {
            throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name)
        }
        if (!handle.$$.ptr) {
            throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name)
        }
        if (handle.$$.ptrType.isConst) {
            throwBindingError(
                'Cannot convert argument of type ' + handle.$$.ptrType.name + ' to parameter type ' + this.name
            )
        }
        var handleClass = handle.$$.ptrType.registeredClass
        var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass)
        return ptr
    }
    function RegisteredPointer_getPointee(ptr) {
        if (this.rawGetPointee) {
            ptr = this.rawGetPointee(ptr)
        }
        return ptr
    }
    function RegisteredPointer_destructor(ptr) {
        if (this.rawDestructor) {
            this.rawDestructor(ptr)
        }
    }
    function RegisteredPointer_deleteObject(handle) {
        if (handle !== null) {
            handle['delete']()
        }
    }
    function downcastPointer(ptr, ptrClass, desiredClass) {
        if (ptrClass === desiredClass) {
            return ptr
        }
        if (undefined === desiredClass.baseClass) {
            return null
        }
        var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass)
        if (rv === null) {
            return null
        }
        return desiredClass.downcast(rv)
    }
    function getInheritedInstanceCount() {
        return Object.keys(registeredInstances).length
    }
    function getLiveInheritedInstances() {
        var rv = []
        for (var k in registeredInstances) {
            if (registeredInstances.hasOwnProperty(k)) {
                rv.push(registeredInstances[k])
            }
        }
        return rv
    }
    function setDelayFunction(fn) {
        delayFunction = fn
        if (deletionQueue.length && delayFunction) {
            delayFunction(flushPendingDeletes)
        }
    }
    function init_embind() {
        Module['getInheritedInstanceCount'] = getInheritedInstanceCount
        Module['getLiveInheritedInstances'] = getLiveInheritedInstances
        Module['flushPendingDeletes'] = flushPendingDeletes
        Module['setDelayFunction'] = setDelayFunction
    }
    var registeredInstances = {}
    function getBasestPointer(class_, ptr) {
        if (ptr === undefined) {
            throwBindingError('ptr should not be undefined')
        }
        while (class_.baseClass) {
            ptr = class_.upcast(ptr)
            class_ = class_.baseClass
        }
        return ptr
    }
    function getInheritedInstance(class_, ptr) {
        ptr = getBasestPointer(class_, ptr)
        return registeredInstances[ptr]
    }
    function makeClassHandle(prototype, record) {
        if (!record.ptrType || !record.ptr) {
            throwInternalError('makeClassHandle requires ptr and ptrType')
        }
        var hasSmartPtrType = !!record.smartPtrType
        var hasSmartPtr = !!record.smartPtr
        if (hasSmartPtrType !== hasSmartPtr) {
            throwInternalError('Both smartPtrType and smartPtr must be specified')
        }
        record.count = { value: 1 }
        return attachFinalizer(Object.create(prototype, { $$: { value: record } }))
    }
    function RegisteredPointer_fromWireType(ptr) {
        var rawPointer = this.getPointee(ptr)
        if (!rawPointer) {
            this.destructor(ptr)
            return null
        }
        var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer)
        if (undefined !== registeredInstance) {
            if (0 === registeredInstance.$$.count.value) {
                registeredInstance.$$.ptr = rawPointer
                registeredInstance.$$.smartPtr = ptr
                return registeredInstance['clone']()
            } else {
                var rv = registeredInstance['clone']()
                this.destructor(ptr)
                return rv
            }
        }
        function makeDefaultHandle() {
            if (this.isSmartPointer) {
                return makeClassHandle(this.registeredClass.instancePrototype, {
                    ptrType: this.pointeeType,
                    ptr: rawPointer,
                    smartPtrType: this,
                    smartPtr: ptr
                })
            } else {
                return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this, ptr: ptr })
            }
        }
        var actualType = this.registeredClass.getActualType(rawPointer)
        var registeredPointerRecord = registeredPointers[actualType]
        if (!registeredPointerRecord) {
            return makeDefaultHandle.call(this)
        }
        var toType
        if (this.isConst) {
            toType = registeredPointerRecord.constPointerType
        } else {
            toType = registeredPointerRecord.pointerType
        }
        var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass)
        if (dp === null) {
            return makeDefaultHandle.call(this)
        }
        if (this.isSmartPointer) {
            return makeClassHandle(toType.registeredClass.instancePrototype, {
                ptrType: toType,
                ptr: dp,
                smartPtrType: this,
                smartPtr: ptr
            })
        } else {
            return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp })
        }
    }
    function init_RegisteredPointer() {
        RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee
        RegisteredPointer.prototype.destructor = RegisteredPointer_destructor
        RegisteredPointer.prototype['argPackAdvance'] = 8
        RegisteredPointer.prototype['readValueFromPointer'] = simpleReadValueFromPointer
        RegisteredPointer.prototype['deleteObject'] = RegisteredPointer_deleteObject
        RegisteredPointer.prototype['fromWireType'] = RegisteredPointer_fromWireType
    }
    function RegisteredPointer(
        name,
        registeredClass,
        isReference,
        isConst,
        isSmartPointer,
        pointeeType,
        sharingPolicy,
        rawGetPointee,
        rawConstructor,
        rawShare,
        rawDestructor
    ) {
        this.name = name
        this.registeredClass = registeredClass
        this.isReference = isReference
        this.isConst = isConst
        this.isSmartPointer = isSmartPointer
        this.pointeeType = pointeeType
        this.sharingPolicy = sharingPolicy
        this.rawGetPointee = rawGetPointee
        this.rawConstructor = rawConstructor
        this.rawShare = rawShare
        this.rawDestructor = rawDestructor
        if (!isSmartPointer && registeredClass.baseClass === undefined) {
            if (isConst) {
                this['toWireType'] = constNoSmartPtrRawPointerToWireType
                this.destructorFunction = null
            } else {
                this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType
                this.destructorFunction = null
            }
        } else {
            this['toWireType'] = genericPointerToWireType
        }
    }
    function replacePublicSymbol(name, value, numArguments) {
        if (!Module.hasOwnProperty(name)) {
            throwInternalError('Replacing nonexistant public symbol')
        }
        if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
            Module[name].overloadTable[numArguments] = value
        } else {
            Module[name] = value
            Module[name].argCount = numArguments
        }
    }
    function getDynCaller(sig, ptr) {
        assert(sig.indexOf('j') >= 0, 'getDynCaller should only be called with i64 sigs')
        var argCache = []
        return function () {
            argCache.length = arguments.length
            for (var i = 0; i < arguments.length; i++) {
                argCache[i] = arguments[i]
            }
            return dynCall(sig, ptr, argCache)
        }
    }
    function embind__requireFunction(signature, rawFunction) {
        signature = readLatin1String(signature)
        function makeDynCaller() {
            if (signature.indexOf('j') != -1) {
                return getDynCaller(signature, rawFunction)
            }
            return wasmTable.get(rawFunction)
        }
        var fp = makeDynCaller()
        if (typeof fp !== 'function') {
            throwBindingError('unknown function pointer with signature ' + signature + ': ' + rawFunction)
        }
        return fp
    }
    var UnboundTypeError = undefined
    function getTypeName(type) {
        var ptr = ___getTypeName(type)
        var rv = readLatin1String(ptr)
        _free(ptr)
        return rv
    }
    function throwUnboundTypeError(message, types) {
        var unboundTypes = []
        var seen = {}
        function visit(type) {
            if (seen[type]) {
                return
            }
            if (registeredTypes[type]) {
                return
            }
            if (typeDependencies[type]) {
                typeDependencies[type].forEach(visit)
                return
            }
            unboundTypes.push(type)
            seen[type] = true
        }
        types.forEach(visit)
        throw new UnboundTypeError(message + ': ' + unboundTypes.map(getTypeName).join([', ']))
    }
    function __embind_register_class(
        rawType,
        rawPointerType,
        rawConstPointerType,
        baseClassRawType,
        getActualTypeSignature,
        getActualType,
        upcastSignature,
        upcast,
        downcastSignature,
        downcast,
        name,
        destructorSignature,
        rawDestructor
    ) {
        name = readLatin1String(name)
        getActualType = embind__requireFunction(getActualTypeSignature, getActualType)
        if (upcast) {
            upcast = embind__requireFunction(upcastSignature, upcast)
        }
        if (downcast) {
            downcast = embind__requireFunction(downcastSignature, downcast)
        }
        rawDestructor = embind__requireFunction(destructorSignature, rawDestructor)
        var legalFunctionName = makeLegalFunctionName(name)
        exposePublicSymbol(legalFunctionName, function () {
            throwUnboundTypeError('Cannot construct ' + name + ' due to unbound types', [baseClassRawType])
        })
        whenDependentTypesAreResolved(
            [rawType, rawPointerType, rawConstPointerType],
            baseClassRawType ? [baseClassRawType] : [],
            function (base) {
                base = base[0]
                var baseClass
                var basePrototype
                if (baseClassRawType) {
                    baseClass = base.registeredClass
                    basePrototype = baseClass.instancePrototype
                } else {
                    basePrototype = ClassHandle.prototype
                }
                var constructor = createNamedFunction(legalFunctionName, function () {
                    if (Object.getPrototypeOf(this) !== instancePrototype) {
                        throw new BindingError("Use 'new' to construct " + name)
                    }
                    if (undefined === registeredClass.constructor_body) {
                        throw new BindingError(name + ' has no accessible constructor')
                    }
                    var body = registeredClass.constructor_body[arguments.length]
                    if (undefined === body) {
                        throw new BindingError(
                            'Tried to invoke ctor of ' +
                                name +
                                ' with invalid number of parameters (' +
                                arguments.length +
                                ') - expected (' +
                                Object.keys(registeredClass.constructor_body).toString() +
                                ') parameters instead!'
                        )
                    }
                    return body.apply(this, arguments)
                })
                var instancePrototype = Object.create(basePrototype, { constructor: { value: constructor } })
                constructor.prototype = instancePrototype
                var registeredClass = new RegisteredClass(
                    name,
                    constructor,
                    instancePrototype,
                    rawDestructor,
                    baseClass,
                    getActualType,
                    upcast,
                    downcast
                )
                var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false)
                var pointerConverter = new RegisteredPointer(name + '*', registeredClass, false, false, false)
                var constPointerConverter = new RegisteredPointer(name + ' const*', registeredClass, false, true, false)
                registeredPointers[rawType] = { pointerType: pointerConverter, constPointerType: constPointerConverter }
                replacePublicSymbol(legalFunctionName, constructor)
                return [referenceConverter, pointerConverter, constPointerConverter]
            }
        )
    }
    function new_(constructor, argumentList) {
        if (!(constructor instanceof Function)) {
            throw new TypeError('new_ called with constructor type ' + typeof constructor + ' which is not a function')
        }
        var dummy = createNamedFunction(constructor.name || 'unknownFunctionName', function () {})
        dummy.prototype = constructor.prototype
        var obj = new dummy()
        var r = constructor.apply(obj, argumentList)
        return r instanceof Object ? r : obj
    }
    function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
        var argCount = argTypes.length
        if (argCount < 2) {
            throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!")
        }
        var isClassMethodFunc = argTypes[1] !== null && classType !== null
        var needsDestructorStack = false
        for (var i = 1; i < argTypes.length; ++i) {
            if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
                needsDestructorStack = true
                break
            }
        }
        var returns = argTypes[0].name !== 'void'
        var argsList = ''
        var argsListWired = ''
        for (var i = 0; i < argCount - 2; ++i) {
            argsList += (i !== 0 ? ', ' : '') + 'arg' + i
            argsListWired += (i !== 0 ? ', ' : '') + 'arg' + i + 'Wired'
        }
        var invokerFnBody =
            'return function ' +
            makeLegalFunctionName(humanName) +
            '(' +
            argsList +
            ') {\n' +
            'if (arguments.length !== ' +
            (argCount - 2) +
            ') {\n' +
            "throwBindingError('function " +
            humanName +
            " called with ' + arguments.length + ' arguments, expected " +
            (argCount - 2) +
            " args!');\n" +
            '}\n'
        if (needsDestructorStack) {
            invokerFnBody += 'var destructors = [];\n'
        }
        var dtorStack = needsDestructorStack ? 'destructors' : 'null'
        var args1 = ['throwBindingError', 'invoker', 'fn', 'runDestructors', 'retType', 'classParam']
        var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]]
        if (isClassMethodFunc) {
            invokerFnBody += 'var thisWired = classParam.toWireType(' + dtorStack + ', this);\n'
        }
        for (var i = 0; i < argCount - 2; ++i) {
            invokerFnBody +=
                'var arg' +
                i +
                'Wired = argType' +
                i +
                '.toWireType(' +
                dtorStack +
                ', arg' +
                i +
                '); // ' +
                argTypes[i + 2].name +
                '\n'
            args1.push('argType' + i)
            args2.push(argTypes[i + 2])
        }
        if (isClassMethodFunc) {
            argsListWired = 'thisWired' + (argsListWired.length > 0 ? ', ' : '') + argsListWired
        }
        invokerFnBody +=
            (returns ? 'var rv = ' : '') +
            'invoker(fn' +
            (argsListWired.length > 0 ? ', ' : '') +
            argsListWired +
            ');\n'
        if (needsDestructorStack) {
            invokerFnBody += 'runDestructors(destructors);\n'
        } else {
            for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
                var paramName = i === 1 ? 'thisWired' : 'arg' + (i - 2) + 'Wired'
                if (argTypes[i].destructorFunction !== null) {
                    invokerFnBody += paramName + '_dtor(' + paramName + '); // ' + argTypes[i].name + '\n'
                    args1.push(paramName + '_dtor')
                    args2.push(argTypes[i].destructorFunction)
                }
            }
        }
        if (returns) {
            invokerFnBody += 'var ret = retType.fromWireType(rv);\n' + 'return ret;\n'
        } else {
        }
        invokerFnBody += '}\n'
        args1.push(invokerFnBody)
        var invokerFunction = new_(Function, args1).apply(null, args2)
        return invokerFunction
    }
    function heap32VectorToArray(count, firstElement) {
        var array = []
        for (var i = 0; i < count; i++) {
            array.push(HEAP32[((firstElement >> 2) + i) >>> 0])
        }
        return array
    }
    function __embind_register_class_class_function(
        rawClassType,
        methodName,
        argCount,
        rawArgTypesAddr,
        invokerSignature,
        rawInvoker,
        fn
    ) {
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr)
        methodName = readLatin1String(methodName)
        rawInvoker = embind__requireFunction(invokerSignature, rawInvoker)
        whenDependentTypesAreResolved([], [rawClassType], function (classType) {
            classType = classType[0]
            var humanName = classType.name + '.' + methodName
            function unboundTypesHandler() {
                throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes)
            }
            var proto = classType.registeredClass.constructor
            if (undefined === proto[methodName]) {
                unboundTypesHandler.argCount = argCount - 1
                proto[methodName] = unboundTypesHandler
            } else {
                ensureOverloadTable(proto, methodName, humanName)
                proto[methodName].overloadTable[argCount - 1] = unboundTypesHandler
            }
            whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
                var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1))
                var func = craftInvokerFunction(humanName, invokerArgsArray, null, rawInvoker, fn)
                if (undefined === proto[methodName].overloadTable) {
                    func.argCount = argCount - 1
                    proto[methodName] = func
                } else {
                    proto[methodName].overloadTable[argCount - 1] = func
                }
                return []
            })
            return []
        })
    }
    function validateThis(this_, classType, humanName) {
        if (!(this_ instanceof Object)) {
            throwBindingError(humanName + ' with invalid "this": ' + this_)
        }
        if (!(this_ instanceof classType.registeredClass.constructor)) {
            throwBindingError(humanName + ' incompatible with "this" of type ' + this_.constructor.name)
        }
        if (!this_.$$.ptr) {
            throwBindingError('cannot call emscripten binding method ' + humanName + ' on deleted object')
        }
        return upcastPointer(this_.$$.ptr, this_.$$.ptrType.registeredClass, classType.registeredClass)
    }
    function __embind_register_class_class_property(
        rawClassType,
        fieldName,
        rawFieldType,
        rawFieldPtr,
        getterSignature,
        getter,
        setterSignature,
        setter
    ) {
        fieldName = readLatin1String(fieldName)
        getter = embind__requireFunction(getterSignature, getter)
        whenDependentTypesAreResolved([], [rawClassType], function (classType) {
            classType = classType[0]
            var humanName = classType.name + '.' + fieldName
            var desc = {
                get: function () {
                    throwUnboundTypeError('Cannot access ' + humanName + ' due to unbound types', [rawFieldType])
                },
                enumerable: true,
                configurable: true
            }
            if (setter) {
                desc.set = function () {
                    throwUnboundTypeError('Cannot access ' + humanName + ' due to unbound types', [rawFieldType])
                }
            } else {
                desc.set = function (v) {
                    throwBindingError(humanName + ' is a read-only property')
                }
            }
            Object.defineProperty(classType.registeredClass.constructor, fieldName, desc)
            whenDependentTypesAreResolved([], [rawFieldType], function (fieldType) {
                fieldType = fieldType[0]
                var desc = {
                    get: function () {
                        return fieldType['fromWireType'](getter(rawFieldPtr))
                    },
                    enumerable: true
                }
                if (setter) {
                    setter = embind__requireFunction(setterSignature, setter)
                    desc.set = function (v) {
                        var destructors = []
                        setter(rawFieldPtr, fieldType['toWireType'](destructors, v))
                        runDestructors(destructors)
                    }
                }
                Object.defineProperty(classType.registeredClass.constructor, fieldName, desc)
                return []
            })
            return []
        })
    }
    function __embind_register_class_constructor(
        rawClassType,
        argCount,
        rawArgTypesAddr,
        invokerSignature,
        invoker,
        rawConstructor
    ) {
        assert(argCount > 0)
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr)
        invoker = embind__requireFunction(invokerSignature, invoker)
        var args = [rawConstructor]
        var destructors = []
        whenDependentTypesAreResolved([], [rawClassType], function (classType) {
            classType = classType[0]
            var humanName = 'constructor ' + classType.name
            if (undefined === classType.registeredClass.constructor_body) {
                classType.registeredClass.constructor_body = []
            }
            if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
                throw new BindingError(
                    'Cannot register multiple constructors with identical number of parameters (' +
                        (argCount - 1) +
                        ") for class '" +
                        classType.name +
                        "'! Overload resolution is currently only performed using the parameter count, not actual type info!"
                )
            }
            classType.registeredClass.constructor_body[argCount - 1] = function unboundTypeHandler() {
                throwUnboundTypeError('Cannot construct ' + classType.name + ' due to unbound types', rawArgTypes)
            }
            whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
                classType.registeredClass.constructor_body[argCount - 1] = function constructor_body() {
                    if (arguments.length !== argCount - 1) {
                        throwBindingError(
                            humanName + ' called with ' + arguments.length + ' arguments, expected ' + (argCount - 1)
                        )
                    }
                    destructors.length = 0
                    args.length = argCount
                    for (var i = 1; i < argCount; ++i) {
                        args[i] = argTypes[i]['toWireType'](destructors, arguments[i - 1])
                    }
                    var ptr = invoker.apply(null, args)
                    runDestructors(destructors)
                    return argTypes[0]['fromWireType'](ptr)
                }
                return []
            })
            return []
        })
    }
    function __embind_register_class_function(
        rawClassType,
        methodName,
        argCount,
        rawArgTypesAddr,
        invokerSignature,
        rawInvoker,
        context,
        isPureVirtual
    ) {
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr)
        methodName = readLatin1String(methodName)
        rawInvoker = embind__requireFunction(invokerSignature, rawInvoker)
        whenDependentTypesAreResolved([], [rawClassType], function (classType) {
            classType = classType[0]
            var humanName = classType.name + '.' + methodName
            if (isPureVirtual) {
                classType.registeredClass.pureVirtualFunctions.push(methodName)
            }
            function unboundTypesHandler() {
                throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes)
            }
            var proto = classType.registeredClass.instancePrototype
            var method = proto[methodName]
            if (
                undefined === method ||
                (undefined === method.overloadTable &&
                    method.className !== classType.name &&
                    method.argCount === argCount - 2)
            ) {
                unboundTypesHandler.argCount = argCount - 2
                unboundTypesHandler.className = classType.name
                proto[methodName] = unboundTypesHandler
            } else {
                ensureOverloadTable(proto, methodName, humanName)
                proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler
            }
            whenDependentTypesAreResolved([], rawArgTypes, function (argTypes) {
                var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context)
                if (undefined === proto[methodName].overloadTable) {
                    memberFunction.argCount = argCount - 2
                    proto[methodName] = memberFunction
                } else {
                    proto[methodName].overloadTable[argCount - 2] = memberFunction
                }
                return []
            })
            return []
        })
    }
    function __embind_register_class_property(
        classType,
        fieldName,
        getterReturnType,
        getterSignature,
        getter,
        getterContext,
        setterArgumentType,
        setterSignature,
        setter,
        setterContext
    ) {
        fieldName = readLatin1String(fieldName)
        getter = embind__requireFunction(getterSignature, getter)
        whenDependentTypesAreResolved([], [classType], function (classType) {
            classType = classType[0]
            var humanName = classType.name + '.' + fieldName
            var desc = {
                get: function () {
                    throwUnboundTypeError('Cannot access ' + humanName + ' due to unbound types', [
                        getterReturnType,
                        setterArgumentType
                    ])
                },
                enumerable: true,
                configurable: true
            }
            if (setter) {
                desc.set = function () {
                    throwUnboundTypeError('Cannot access ' + humanName + ' due to unbound types', [
                        getterReturnType,
                        setterArgumentType
                    ])
                }
            } else {
                desc.set = function (v) {
                    throwBindingError(humanName + ' is a read-only property')
                }
            }
            Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc)
            whenDependentTypesAreResolved(
                [],
                setter ? [getterReturnType, setterArgumentType] : [getterReturnType],
                function (types) {
                    var getterReturnType = types[0]
                    var desc = {
                        get: function () {
                            var ptr = validateThis(this, classType, humanName + ' getter')
                            return getterReturnType['fromWireType'](getter(getterContext, ptr))
                        },
                        enumerable: true
                    }
                    if (setter) {
                        setter = embind__requireFunction(setterSignature, setter)
                        var setterArgumentType = types[1]
                        desc.set = function (v) {
                            var ptr = validateThis(this, classType, humanName + ' setter')
                            var destructors = []
                            setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, v))
                            runDestructors(destructors)
                        }
                    }
                    Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc)
                    return []
                }
            )
            return []
        })
    }
    var emval_free_list = []
    var emval_handle_array = [{}, { value: undefined }, { value: null }, { value: true }, { value: false }]
    function __emval_decref(handle) {
        if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
            emval_handle_array[handle] = undefined
            emval_free_list.push(handle)
        }
    }
    function count_emval_handles() {
        var count = 0
        for (var i = 5; i < emval_handle_array.length; ++i) {
            if (emval_handle_array[i] !== undefined) {
                ++count
            }
        }
        return count
    }
    function get_first_emval() {
        for (var i = 5; i < emval_handle_array.length; ++i) {
            if (emval_handle_array[i] !== undefined) {
                return emval_handle_array[i]
            }
        }
        return null
    }
    function init_emval() {
        Module['count_emval_handles'] = count_emval_handles
        Module['get_first_emval'] = get_first_emval
    }
    function __emval_register(value) {
        switch (value) {
            case undefined: {
                return 1
            }
            case null: {
                return 2
            }
            case true: {
                return 3
            }
            case false: {
                return 4
            }
            default: {
                var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length
                emval_handle_array[handle] = { refcount: 1, value: value }
                return handle
            }
        }
    }
    function __embind_register_emval(rawType, name) {
        name = readLatin1String(name)
        registerType(rawType, {
            name: name,
            fromWireType: function (handle) {
                var rv = emval_handle_array[handle].value
                __emval_decref(handle)
                return rv
            },
            toWireType: function (destructors, value) {
                return __emval_register(value)
            },
            argPackAdvance: 8,
            readValueFromPointer: simpleReadValueFromPointer,
            destructorFunction: null
        })
    }
    function enumReadValueFromPointer(name, shift, signed) {
        switch (shift) {
            case 0:
                return function (pointer) {
                    var heap = signed ? HEAP8 : HEAPU8
                    return this['fromWireType'](heap[pointer >>> 0])
                }
            case 1:
                return function (pointer) {
                    var heap = signed ? HEAP16 : HEAPU16
                    return this['fromWireType'](heap[pointer >>> 1])
                }
            case 2:
                return function (pointer) {
                    var heap = signed ? HEAP32 : HEAPU32
                    return this['fromWireType'](heap[pointer >>> 2])
                }
            default:
                throw new TypeError('Unknown integer type: ' + name)
        }
    }
    function __embind_register_enum(rawType, name, size, isSigned) {
        var shift = getShiftFromSize(size)
        name = readLatin1String(name)
        function ctor() {}
        ctor.values = {}
        registerType(rawType, {
            name: name,
            constructor: ctor,
            fromWireType: function (c) {
                return this.constructor.values[c]
            },
            toWireType: function (destructors, c) {
                return c.value
            },
            argPackAdvance: 8,
            readValueFromPointer: enumReadValueFromPointer(name, shift, isSigned),
            destructorFunction: null
        })
        exposePublicSymbol(name, ctor)
    }
    function requireRegisteredType(rawType, humanName) {
        var impl = registeredTypes[rawType]
        if (undefined === impl) {
            throwBindingError(humanName + ' has unknown type ' + getTypeName(rawType))
        }
        return impl
    }
    function __embind_register_enum_value(rawEnumType, name, enumValue) {
        var enumType = requireRegisteredType(rawEnumType, 'enum')
        name = readLatin1String(name)
        var Enum = enumType.constructor
        var Value = Object.create(enumType.constructor.prototype, {
            value: { value: enumValue },
            constructor: { value: createNamedFunction(enumType.name + '_' + name, function () {}) }
        })
        Enum.values[enumValue] = Value
        Enum[name] = Value
    }
    function _embind_repr(v) {
        if (v === null) {
            return 'null'
        }
        var t = typeof v
        if (t === 'object' || t === 'array' || t === 'function') {
            return v.toString()
        } else {
            return '' + v
        }
    }
    function floatReadValueFromPointer(name, shift) {
        switch (shift) {
            case 2:
                return function (pointer) {
                    return this['fromWireType'](HEAPF32[pointer >>> 2])
                }
            case 3:
                return function (pointer) {
                    return this['fromWireType'](HEAPF64[pointer >>> 3])
                }
            default:
                throw new TypeError('Unknown float type: ' + name)
        }
    }
    function __embind_register_float(rawType, name, size) {
        var shift = getShiftFromSize(size)
        name = readLatin1String(name)
        registerType(rawType, {
            name: name,
            fromWireType: function (value) {
                return value
            },
            toWireType: function (destructors, value) {
                if (typeof value !== 'number' && typeof value !== 'boolean') {
                    throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name)
                }
                return value
            },
            argPackAdvance: 8,
            readValueFromPointer: floatReadValueFromPointer(name, shift),
            destructorFunction: null
        })
    }
    function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn) {
        var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr)
        name = readLatin1String(name)
        rawInvoker = embind__requireFunction(signature, rawInvoker)
        exposePublicSymbol(
            name,
            function () {
                throwUnboundTypeError('Cannot call ' + name + ' due to unbound types', argTypes)
            },
            argCount - 1
        )
        whenDependentTypesAreResolved([], argTypes, function (argTypes) {
            var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1))
            replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn), argCount - 1)
            return []
        })
    }
    function integerReadValueFromPointer(name, shift, signed) {
        switch (shift) {
            case 0:
                return signed
                    ? function readS8FromPointer(pointer) {
                          return HEAP8[pointer >>> 0]
                      }
                    : function readU8FromPointer(pointer) {
                          return HEAPU8[pointer >>> 0]
                      }
            case 1:
                return signed
                    ? function readS16FromPointer(pointer) {
                          return HEAP16[pointer >>> 1]
                      }
                    : function readU16FromPointer(pointer) {
                          return HEAPU16[pointer >>> 1]
                      }
            case 2:
                return signed
                    ? function readS32FromPointer(pointer) {
                          return HEAP32[pointer >>> 2]
                      }
                    : function readU32FromPointer(pointer) {
                          return HEAPU32[pointer >>> 2]
                      }
            default:
                throw new TypeError('Unknown integer type: ' + name)
        }
    }
    function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
        name = readLatin1String(name)
        if (maxRange === -1) {
            maxRange = 4294967295
        }
        var shift = getShiftFromSize(size)
        var fromWireType = function (value) {
            return value
        }
        if (minRange === 0) {
            var bitshift = 32 - 8 * size
            fromWireType = function (value) {
                return (value << bitshift) >>> bitshift
            }
        }
        var isUnsignedType = name.indexOf('unsigned') != -1
        registerType(primitiveType, {
            name: name,
            fromWireType: fromWireType,
            toWireType: function (destructors, value) {
                if (typeof value !== 'number' && typeof value !== 'boolean') {
                    throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name)
                }
                if (value < minRange || value > maxRange) {
                    throw new TypeError(
                        'Passing a number "' +
                            _embind_repr(value) +
                            '" from JS side to C/C++ side to an argument of type "' +
                            name +
                            '", which is outside the valid range [' +
                            minRange +
                            ', ' +
                            maxRange +
                            ']!'
                    )
                }
                return isUnsignedType ? value >>> 0 : value | 0
            },
            argPackAdvance: 8,
            readValueFromPointer: integerReadValueFromPointer(name, shift, minRange !== 0),
            destructorFunction: null
        })
    }
    function __embind_register_memory_view(rawType, dataTypeIndex, name) {
        var typeMapping = [
            Int8Array,
            Uint8Array,
            Int16Array,
            Uint16Array,
            Int32Array,
            Uint32Array,
            Float32Array,
            Float64Array
        ]
        var TA = typeMapping[dataTypeIndex]
        function decodeMemoryView(handle) {
            handle = handle >> 2
            var heap = HEAPU32
            var size = heap[handle >>> 0]
            var data = heap[(handle + 1) >>> 0]
            return new TA(buffer, data, size)
        }
        name = readLatin1String(name)
        registerType(
            rawType,
            { name: name, fromWireType: decodeMemoryView, argPackAdvance: 8, readValueFromPointer: decodeMemoryView },
            { ignoreDuplicateRegistrations: true }
        )
    }
    function __embind_register_std_string(rawType, name) {
        name = readLatin1String(name)
        var stdStringIsUTF8 = name === 'std::string'
        registerType(rawType, {
            name: name,
            fromWireType: function (value) {
                var length = HEAPU32[value >>> 2]
                var str
                if (stdStringIsUTF8) {
                    var decodeStartPtr = value + 4
                    for (var i = 0; i <= length; ++i) {
                        var currentBytePtr = value + 4 + i
                        if (i == length || HEAPU8[currentBytePtr >>> 0] == 0) {
                            var maxRead = currentBytePtr - decodeStartPtr
                            var stringSegment = UTF8ToString(decodeStartPtr, maxRead)
                            if (str === undefined) {
                                str = stringSegment
                            } else {
                                str += String.fromCharCode(0)
                                str += stringSegment
                            }
                            decodeStartPtr = currentBytePtr + 1
                        }
                    }
                } else {
                    var a = new Array(length)
                    for (var i = 0; i < length; ++i) {
                        a[i] = String.fromCharCode(HEAPU8[(value + 4 + i) >>> 0])
                    }
                    str = a.join('')
                }
                _free(value)
                return str
            },
            toWireType: function (destructors, value) {
                if (value instanceof ArrayBuffer) {
                    value = new Uint8Array(value)
                }
                var getLength
                var valueIsOfTypeString = typeof value === 'string'
                if (
                    !(
                        valueIsOfTypeString ||
                        value instanceof Uint8Array ||
                        value instanceof Uint8ClampedArray ||
                        value instanceof Int8Array
                    )
                ) {
                    throwBindingError('Cannot pass non-string to std::string')
                }
                if (stdStringIsUTF8 && valueIsOfTypeString) {
                    getLength = function () {
                        return lengthBytesUTF8(value)
                    }
                } else {
                    getLength = function () {
                        return value.length
                    }
                }
                var length = getLength()
                var ptr = _malloc(4 + length + 1)
                ptr >>>= 0
                HEAPU32[ptr >>> 2] = length
                if (stdStringIsUTF8 && valueIsOfTypeString) {
                    stringToUTF8(value, ptr + 4, length + 1)
                } else {
                    if (valueIsOfTypeString) {
                        for (var i = 0; i < length; ++i) {
                            var charCode = value.charCodeAt(i)
                            if (charCode > 255) {
                                _free(ptr)
                                throwBindingError('String has UTF-16 code units that do not fit in 8 bits')
                            }
                            HEAPU8[(ptr + 4 + i) >>> 0] = charCode
                        }
                    } else {
                        for (var i = 0; i < length; ++i) {
                            HEAPU8[(ptr + 4 + i) >>> 0] = value[i]
                        }
                    }
                }
                if (destructors !== null) {
                    destructors.push(_free, ptr)
                }
                return ptr
            },
            argPackAdvance: 8,
            readValueFromPointer: simpleReadValueFromPointer,
            destructorFunction: function (ptr) {
                _free(ptr)
            }
        })
    }
    function __embind_register_std_wstring(rawType, charSize, name) {
        name = readLatin1String(name)
        var decodeString, encodeString, getHeap, lengthBytesUTF, shift
        if (charSize === 2) {
            decodeString = UTF16ToString
            encodeString = stringToUTF16
            lengthBytesUTF = lengthBytesUTF16
            getHeap = function () {
                return HEAPU16
            }
            shift = 1
        } else if (charSize === 4) {
            decodeString = UTF32ToString
            encodeString = stringToUTF32
            lengthBytesUTF = lengthBytesUTF32
            getHeap = function () {
                return HEAPU32
            }
            shift = 2
        }
        registerType(rawType, {
            name: name,
            fromWireType: function (value) {
                var length = HEAPU32[value >>> 2]
                var HEAP = getHeap()
                var str
                var decodeStartPtr = value + 4
                for (var i = 0; i <= length; ++i) {
                    var currentBytePtr = value + 4 + i * charSize
                    if (i == length || HEAP[currentBytePtr >>> shift] == 0) {
                        var maxReadBytes = currentBytePtr - decodeStartPtr
                        var stringSegment = decodeString(decodeStartPtr, maxReadBytes)
                        if (str === undefined) {
                            str = stringSegment
                        } else {
                            str += String.fromCharCode(0)
                            str += stringSegment
                        }
                        decodeStartPtr = currentBytePtr + charSize
                    }
                }
                _free(value)
                return str
            },
            toWireType: function (destructors, value) {
                if (!(typeof value === 'string')) {
                    throwBindingError('Cannot pass non-string to C++ string type ' + name)
                }
                var length = lengthBytesUTF(value)
                var ptr = _malloc(4 + length + charSize)
                ptr >>>= 0
                HEAPU32[ptr >>> 2] = length >> shift
                encodeString(value, ptr + 4, length + charSize)
                if (destructors !== null) {
                    destructors.push(_free, ptr)
                }
                return ptr
            },
            argPackAdvance: 8,
            readValueFromPointer: simpleReadValueFromPointer,
            destructorFunction: function (ptr) {
                _free(ptr)
            }
        })
    }
    function __embind_register_value_array(
        rawType,
        name,
        constructorSignature,
        rawConstructor,
        destructorSignature,
        rawDestructor
    ) {
        tupleRegistrations[rawType] = {
            name: readLatin1String(name),
            rawConstructor: embind__requireFunction(constructorSignature, rawConstructor),
            rawDestructor: embind__requireFunction(destructorSignature, rawDestructor),
            elements: []
        }
    }
    function __embind_register_value_array_element(
        rawTupleType,
        getterReturnType,
        getterSignature,
        getter,
        getterContext,
        setterArgumentType,
        setterSignature,
        setter,
        setterContext
    ) {
        tupleRegistrations[rawTupleType].elements.push({
            getterReturnType: getterReturnType,
            getter: embind__requireFunction(getterSignature, getter),
            getterContext: getterContext,
            setterArgumentType: setterArgumentType,
            setter: embind__requireFunction(setterSignature, setter),
            setterContext: setterContext
        })
    }
    function __embind_register_void(rawType, name) {
        name = readLatin1String(name)
        registerType(rawType, {
            isVoid: true,
            name: name,
            argPackAdvance: 0,
            fromWireType: function () {
                return undefined
            },
            toWireType: function (destructors, o) {
                return undefined
            }
        })
    }
    function requireHandle(handle) {
        if (!handle) {
            throwBindingError('Cannot use deleted val. handle = ' + handle)
        }
        return emval_handle_array[handle].value
    }
    function __emval_as(handle, returnType, destructorsRef) {
        handle = requireHandle(handle)
        returnType = requireRegisteredType(returnType, 'emval::as')
        var destructors = []
        var rd = __emval_register(destructors)
        HEAP32[destructorsRef >>> 2] = rd
        return returnType['toWireType'](destructors, handle)
    }
    function __emval_lookupTypes(argCount, argTypes) {
        var a = new Array(argCount)
        for (var i = 0; i < argCount; ++i) {
            a[i] = requireRegisteredType(HEAP32[((argTypes >> 2) + i) >>> 0], 'parameter ' + i)
        }
        return a
    }
    function __emval_call(handle, argCount, argTypes, argv) {
        handle = requireHandle(handle)
        var types = __emval_lookupTypes(argCount, argTypes)
        var args = new Array(argCount)
        for (var i = 0; i < argCount; ++i) {
            var type = types[i]
            args[i] = type['readValueFromPointer'](argv)
            argv += type['argPackAdvance']
        }
        var rv = handle.apply(undefined, args)
        return __emval_register(rv)
    }
    var emval_symbols = {}
    function getStringOrSymbol(address) {
        var symbol = emval_symbols[address]
        if (symbol === undefined) {
            return readLatin1String(address)
        } else {
            return symbol
        }
    }
    var emval_methodCallers = []
    function __emval_call_void_method(caller, handle, methodName, args) {
        caller = emval_methodCallers[caller]
        handle = requireHandle(handle)
        methodName = getStringOrSymbol(methodName)
        caller(handle, methodName, null, args)
    }
    function __emval_addMethodCaller(caller) {
        var id = emval_methodCallers.length
        emval_methodCallers.push(caller)
        return id
    }
    function __emval_get_method_caller(argCount, argTypes) {
        var types = __emval_lookupTypes(argCount, argTypes)
        var retType = types[0]
        var signatureName =
            retType.name +
            '_$' +
            types
                .slice(1)
                .map(function (t) {
                    return t.name
                })
                .join('_') +
            '$'
        var params = ['retType']
        var args = [retType]
        var argsList = ''
        for (var i = 0; i < argCount - 1; ++i) {
            argsList += (i !== 0 ? ', ' : '') + 'arg' + i
            params.push('argType' + i)
            args.push(types[1 + i])
        }
        var functionName = makeLegalFunctionName('methodCaller_' + signatureName)
        var functionBody = 'return function ' + functionName + '(handle, name, destructors, args) {\n'
        var offset = 0
        for (var i = 0; i < argCount - 1; ++i) {
            functionBody +=
                '    var arg' +
                i +
                ' = argType' +
                i +
                '.readValueFromPointer(args' +
                (offset ? '+' + offset : '') +
                ');\n'
            offset += types[i + 1]['argPackAdvance']
        }
        functionBody += '    var rv = handle[name](' + argsList + ');\n'
        for (var i = 0; i < argCount - 1; ++i) {
            if (types[i + 1]['deleteObject']) {
                functionBody += '    argType' + i + '.deleteObject(arg' + i + ');\n'
            }
        }
        if (!retType.isVoid) {
            functionBody += '    return retType.toWireType(destructors, rv);\n'
        }
        functionBody += '};\n'
        params.push(functionBody)
        var invokerFunction = new_(Function, params).apply(null, args)
        return __emval_addMethodCaller(invokerFunction)
    }
    function __emval_get_property(handle, key) {
        handle = requireHandle(handle)
        key = requireHandle(key)
        return __emval_register(handle[key])
    }
    function __emval_incref(handle) {
        if (handle > 4) {
            emval_handle_array[handle].refcount += 1
        }
    }
    function __emval_new_array() {
        return __emval_register([])
    }
    function __emval_new_cstring(v) {
        return __emval_register(getStringOrSymbol(v))
    }
    function __emval_new_object() {
        return __emval_register({})
    }
    function __emval_run_destructors(handle) {
        var destructors = emval_handle_array[handle].value
        runDestructors(destructors)
        __emval_decref(handle)
    }
    function __emval_set_property(handle, key, value) {
        handle = requireHandle(handle)
        key = requireHandle(key)
        value = requireHandle(value)
        handle[key] = value
    }
    function __emval_take_value(type, argv) {
        type = requireRegisteredType(type, '_emval_take_value')
        var v = type['readValueFromPointer'](argv)
        return __emval_register(v)
    }
    function _abort() {
        abort()
    }
    function _clock() {
        if (_clock.start === undefined) _clock.start = Date.now()
        return ((Date.now() - _clock.start) * (1e6 / 1e3)) | 0
    }
    var _emscripten_get_now
    if (ENVIRONMENT_IS_NODE) {
        _emscripten_get_now = function () {
            var t = process['hrtime']()
            return t[0] * 1e3 + t[1] / 1e6
        }
    } else if (typeof dateNow !== 'undefined') {
        _emscripten_get_now = dateNow
    } else
        _emscripten_get_now = function () {
            return performance.now()
        }
    var _emscripten_get_now_is_monotonic = true
    function _clock_gettime(clk_id, tp) {
        var now
        if (clk_id === 0) {
            now = Date.now()
        } else if ((clk_id === 1 || clk_id === 4) && _emscripten_get_now_is_monotonic) {
            now = _emscripten_get_now()
        } else {
            setErrNo(28)
            return -1
        }
        HEAP32[tp >>> 2] = (now / 1e3) | 0
        HEAP32[(tp + 4) >>> 2] = ((now % 1e3) * 1e3 * 1e3) | 0
        return 0
    }
    function _difftime(time1, time0) {
        return time1 - time0
    }
    function _emscripten_set_main_loop_timing(mode, value) {
        Browser.mainLoop.timingMode = mode
        Browser.mainLoop.timingValue = value
        if (!Browser.mainLoop.func) {
            return 1
        }
        if (mode == 0) {
            Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
                var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0
                setTimeout(Browser.mainLoop.runner, timeUntilNextTick)
            }
            Browser.mainLoop.method = 'timeout'
        } else if (mode == 1) {
            Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
                Browser.requestAnimationFrame(Browser.mainLoop.runner)
            }
            Browser.mainLoop.method = 'rAF'
        } else if (mode == 2) {
            if (typeof setImmediate === 'undefined') {
                var setImmediates = []
                var emscriptenMainLoopMessageId = 'setimmediate'
                var Browser_setImmediate_messageHandler = function (event) {
                    if (
                        event.data === emscriptenMainLoopMessageId ||
                        event.data.target === emscriptenMainLoopMessageId
                    ) {
                        event.stopPropagation()
                        setImmediates.shift()()
                    }
                }
                addEventListener('message', Browser_setImmediate_messageHandler, true)
                setImmediate = function Browser_emulated_setImmediate(func) {
                    setImmediates.push(func)
                    if (ENVIRONMENT_IS_WORKER) {
                        if (Module['setImmediates'] === undefined) Module['setImmediates'] = []
                        Module['setImmediates'].push(func)
                        postMessage({ target: emscriptenMainLoopMessageId })
                    } else postMessage(emscriptenMainLoopMessageId, '*')
                }
            }
            Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
                setImmediate(Browser.mainLoop.runner)
            }
            Browser.mainLoop.method = 'immediate'
        }
        return 0
    }
    function setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop, arg, noSetTiming) {
        noExitRuntime = true
        assert(
            !Browser.mainLoop.func,
            'emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.'
        )
        Browser.mainLoop.func = browserIterationFunc
        Browser.mainLoop.arg = arg
        var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop
        Browser.mainLoop.runner = function Browser_mainLoop_runner() {
            if (ABORT) return
            if (Browser.mainLoop.queue.length > 0) {
                var start = Date.now()
                var blocker = Browser.mainLoop.queue.shift()
                blocker.func(blocker.arg)
                if (Browser.mainLoop.remainingBlockers) {
                    var remaining = Browser.mainLoop.remainingBlockers
                    var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining)
                    if (blocker.counted) {
                        Browser.mainLoop.remainingBlockers = next
                    } else {
                        next = next + 0.5
                        Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9
                    }
                }
                console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + ' ms')
                Browser.mainLoop.updateStatus()
                if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return
                setTimeout(Browser.mainLoop.runner, 0)
                return
            }
            if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return
            Browser.mainLoop.currentFrameNumber = (Browser.mainLoop.currentFrameNumber + 1) | 0
            if (
                Browser.mainLoop.timingMode == 1 &&
                Browser.mainLoop.timingValue > 1 &&
                Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0
            ) {
                Browser.mainLoop.scheduler()
                return
            } else if (Browser.mainLoop.timingMode == 0) {
                Browser.mainLoop.tickStartTime = _emscripten_get_now()
            }
            Browser.mainLoop.runIter(browserIterationFunc)
            if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return
            if (typeof SDL === 'object' && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData()
            Browser.mainLoop.scheduler()
        }
        if (!noSetTiming) {
            if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps)
            else _emscripten_set_main_loop_timing(1, 1)
            Browser.mainLoop.scheduler()
        }
        if (simulateInfiniteLoop) {
            throw 'unwind'
        }
    }
    var Browser = {
        mainLoop: {
            scheduler: null,
            method: '',
            currentlyRunningMainloop: 0,
            func: null,
            arg: 0,
            timingMode: 0,
            timingValue: 0,
            currentFrameNumber: 0,
            queue: [],
            pause: function () {
                Browser.mainLoop.scheduler = null
                Browser.mainLoop.currentlyRunningMainloop++
            },
            resume: function () {
                Browser.mainLoop.currentlyRunningMainloop++
                var timingMode = Browser.mainLoop.timingMode
                var timingValue = Browser.mainLoop.timingValue
                var func = Browser.mainLoop.func
                Browser.mainLoop.func = null
                setMainLoop(func, 0, false, Browser.mainLoop.arg, true)
                _emscripten_set_main_loop_timing(timingMode, timingValue)
                Browser.mainLoop.scheduler()
            },
            updateStatus: function () {
                if (Module['setStatus']) {
                    var message = Module['statusMessage'] || 'Please wait...'
                    var remaining = Browser.mainLoop.remainingBlockers
                    var expected = Browser.mainLoop.expectedBlockers
                    if (remaining) {
                        if (remaining < expected) {
                            Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')')
                        } else {
                            Module['setStatus'](message)
                        }
                    } else {
                        Module['setStatus']('')
                    }
                }
            },
            runIter: function (func) {
                if (ABORT) return
                if (Module['preMainLoop']) {
                    var preRet = Module['preMainLoop']()
                    if (preRet === false) {
                        return
                    }
                }
                try {
                    func()
                } catch (e) {
                    if (e instanceof ExitStatus) {
                        return
                    } else if (e == 'unwind') {
                        return
                    } else {
                        if (e && typeof e === 'object' && e.stack) err('exception thrown: ' + [e, e.stack])
                        throw e
                    }
                }
                if (Module['postMainLoop']) Module['postMainLoop']()
            }
        },
        isFullscreen: false,
        pointerLock: false,
        moduleContextCreatedCallbacks: [],
        workers: [],
        init: function () {
            if (!Module['preloadPlugins']) Module['preloadPlugins'] = []
            if (Browser.initted) return
            Browser.initted = true
            try {
                new Blob()
                Browser.hasBlobConstructor = true
            } catch (e) {
                Browser.hasBlobConstructor = false
                console.log('warning: no blob constructor, cannot create blobs with mimetypes')
            }
            Browser.BlobBuilder =
                typeof MozBlobBuilder != 'undefined'
                    ? MozBlobBuilder
                    : typeof WebKitBlobBuilder != 'undefined'
                    ? WebKitBlobBuilder
                    : !Browser.hasBlobConstructor
                    ? console.log('warning: no BlobBuilder')
                    : null
            Browser.URLObject = typeof window != 'undefined' ? (window.URL ? window.URL : window.webkitURL) : undefined
            if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
                console.log(
                    'warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.'
                )
                Module.noImageDecoding = true
            }
            var imagePlugin = {}
            imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
                return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name)
            }
            imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
                var b = null
                if (Browser.hasBlobConstructor) {
                    try {
                        b = new Blob([byteArray], { type: Browser.getMimetype(name) })
                        if (b.size !== byteArray.length) {
                            b = new Blob([new Uint8Array(byteArray).buffer], { type: Browser.getMimetype(name) })
                        }
                    } catch (e) {
                        warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder')
                    }
                }
                if (!b) {
                    var bb = new Browser.BlobBuilder()
                    bb.append(new Uint8Array(byteArray).buffer)
                    b = bb.getBlob()
                }
                var url = Browser.URLObject.createObjectURL(b)
                var img = new Image()
                img.onload = function img_onload() {
                    assert(img.complete, 'Image ' + name + ' could not be decoded')
                    var canvas = document.createElement('canvas')
                    canvas.width = img.width
                    canvas.height = img.height
                    var ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0)
                    Module['preloadedImages'][name] = canvas
                    Browser.URLObject.revokeObjectURL(url)
                    if (onload) onload(byteArray)
                }
                img.onerror = function img_onerror(event) {
                    console.log('Image ' + url + ' could not be decoded')
                    if (onerror) onerror()
                }
                img.src = url
            }
            Module['preloadPlugins'].push(imagePlugin)
            var audioPlugin = {}
            audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
                return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 }
            }
            audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
                var done = false
                function finish(audio) {
                    if (done) return
                    done = true
                    Module['preloadedAudios'][name] = audio
                    if (onload) onload(byteArray)
                }
                function fail() {
                    if (done) return
                    done = true
                    Module['preloadedAudios'][name] = new Audio()
                    if (onerror) onerror()
                }
                if (Browser.hasBlobConstructor) {
                    try {
                        var b = new Blob([byteArray], { type: Browser.getMimetype(name) })
                    } catch (e) {
                        return fail()
                    }
                    var url = Browser.URLObject.createObjectURL(b)
                    var audio = new Audio()
                    audio.addEventListener(
                        'canplaythrough',
                        function () {
                            finish(audio)
                        },
                        false
                    )
                    audio.onerror = function audio_onerror(event) {
                        if (done) return
                        console.log(
                            'warning: browser could not fully decode audio ' + name + ', trying slower base64 approach'
                        )
                        function encode64(data) {
                            var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
                            var PAD = '='
                            var ret = ''
                            var leftchar = 0
                            var leftbits = 0
                            for (var i = 0; i < data.length; i++) {
                                leftchar = (leftchar << 8) | data[i]
                                leftbits += 8
                                while (leftbits >= 6) {
                                    var curr = (leftchar >> (leftbits - 6)) & 63
                                    leftbits -= 6
                                    ret += BASE[curr]
                                }
                            }
                            if (leftbits == 2) {
                                ret += BASE[(leftchar & 3) << 4]
                                ret += PAD + PAD
                            } else if (leftbits == 4) {
                                ret += BASE[(leftchar & 15) << 2]
                                ret += PAD
                            }
                            return ret
                        }
                        audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray)
                        finish(audio)
                    }
                    audio.src = url
                    Browser.safeSetTimeout(function () {
                        finish(audio)
                    }, 1e4)
                } else {
                    return fail()
                }
            }
            Module['preloadPlugins'].push(audioPlugin)
            function pointerLockChange() {
                Browser.pointerLock =
                    document['pointerLockElement'] === Module['canvas'] ||
                    document['mozPointerLockElement'] === Module['canvas'] ||
                    document['webkitPointerLockElement'] === Module['canvas'] ||
                    document['msPointerLockElement'] === Module['canvas']
            }
            var canvas = Module['canvas']
            if (canvas) {
                canvas.requestPointerLock =
                    canvas['requestPointerLock'] ||
                    canvas['mozRequestPointerLock'] ||
                    canvas['webkitRequestPointerLock'] ||
                    canvas['msRequestPointerLock'] ||
                    function () {}
                canvas.exitPointerLock =
                    document['exitPointerLock'] ||
                    document['mozExitPointerLock'] ||
                    document['webkitExitPointerLock'] ||
                    document['msExitPointerLock'] ||
                    function () {}
                canvas.exitPointerLock = canvas.exitPointerLock.bind(document)
                document.addEventListener('pointerlockchange', pointerLockChange, false)
                document.addEventListener('mozpointerlockchange', pointerLockChange, false)
                document.addEventListener('webkitpointerlockchange', pointerLockChange, false)
                document.addEventListener('mspointerlockchange', pointerLockChange, false)
                if (Module['elementPointerLock']) {
                    canvas.addEventListener(
                        'click',
                        function (ev) {
                            if (!Browser.pointerLock && Module['canvas'].requestPointerLock) {
                                Module['canvas'].requestPointerLock()
                                ev.preventDefault()
                            }
                        },
                        false
                    )
                }
            }
        },
        createContext: function (canvas, useWebGL, setInModule, webGLContextAttributes) {
            if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx
            var ctx
            var contextHandle
            if (useWebGL) {
                var contextAttributes = { antialias: false, alpha: false, majorVersion: 1 }
                if (webGLContextAttributes) {
                    for (var attribute in webGLContextAttributes) {
                        contextAttributes[attribute] = webGLContextAttributes[attribute]
                    }
                }
                if (typeof GL !== 'undefined') {
                    contextHandle = GL.createContext(canvas, contextAttributes)
                    if (contextHandle) {
                        ctx = GL.getContext(contextHandle).GLctx
                    }
                }
            } else {
                ctx = canvas.getContext('2d')
            }
            if (!ctx) return null
            if (setInModule) {
                if (!useWebGL)
                    assert(
                        typeof GLctx === 'undefined',
                        'cannot set in module if GLctx is used, but we are a non-GL context that would replace it'
                    )
                Module.ctx = ctx
                if (useWebGL) GL.makeContextCurrent(contextHandle)
                Module.useWebGL = useWebGL
                Browser.moduleContextCreatedCallbacks.forEach(function (callback) {
                    callback()
                })
                Browser.init()
            }
            return ctx
        },
        destroyContext: function (canvas, useWebGL, setInModule) {},
        fullscreenHandlersInstalled: false,
        lockPointer: undefined,
        resizeCanvas: undefined,
        requestFullscreen: function (lockPointer, resizeCanvas) {
            Browser.lockPointer = lockPointer
            Browser.resizeCanvas = resizeCanvas
            if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true
            if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false
            var canvas = Module['canvas']
            function fullscreenChange() {
                Browser.isFullscreen = false
                var canvasContainer = canvas.parentNode
                if (
                    (document['fullscreenElement'] ||
                        document['mozFullScreenElement'] ||
                        document['msFullscreenElement'] ||
                        document['webkitFullscreenElement'] ||
                        document['webkitCurrentFullScreenElement']) === canvasContainer
                ) {
                    canvas.exitFullscreen = Browser.exitFullscreen
                    if (Browser.lockPointer) canvas.requestPointerLock()
                    Browser.isFullscreen = true
                    if (Browser.resizeCanvas) {
                        Browser.setFullscreenCanvasSize()
                    } else {
                        Browser.updateCanvasDimensions(canvas)
                    }
                } else {
                    canvasContainer.parentNode.insertBefore(canvas, canvasContainer)
                    canvasContainer.parentNode.removeChild(canvasContainer)
                    if (Browser.resizeCanvas) {
                        Browser.setWindowedCanvasSize()
                    } else {
                        Browser.updateCanvasDimensions(canvas)
                    }
                }
                if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullscreen)
                if (Module['onFullscreen']) Module['onFullscreen'](Browser.isFullscreen)
            }
            if (!Browser.fullscreenHandlersInstalled) {
                Browser.fullscreenHandlersInstalled = true
                document.addEventListener('fullscreenchange', fullscreenChange, false)
                document.addEventListener('mozfullscreenchange', fullscreenChange, false)
                document.addEventListener('webkitfullscreenchange', fullscreenChange, false)
                document.addEventListener('MSFullscreenChange', fullscreenChange, false)
            }
            var canvasContainer = document.createElement('div')
            canvas.parentNode.insertBefore(canvasContainer, canvas)
            canvasContainer.appendChild(canvas)
            canvasContainer.requestFullscreen =
                canvasContainer['requestFullscreen'] ||
                canvasContainer['mozRequestFullScreen'] ||
                canvasContainer['msRequestFullscreen'] ||
                (canvasContainer['webkitRequestFullscreen']
                    ? function () {
                          canvasContainer['webkitRequestFullscreen'](Element['ALLOW_KEYBOARD_INPUT'])
                      }
                    : null) ||
                (canvasContainer['webkitRequestFullScreen']
                    ? function () {
                          canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT'])
                      }
                    : null)
            canvasContainer.requestFullscreen()
        },
        exitFullscreen: function () {
            if (!Browser.isFullscreen) {
                return false
            }
            var CFS =
                document['exitFullscreen'] ||
                document['cancelFullScreen'] ||
                document['mozCancelFullScreen'] ||
                document['msExitFullscreen'] ||
                document['webkitCancelFullScreen'] ||
                function () {}
            CFS.apply(document, [])
            return true
        },
        nextRAF: 0,
        fakeRequestAnimationFrame: function (func) {
            var now = Date.now()
            if (Browser.nextRAF === 0) {
                Browser.nextRAF = now + 1e3 / 60
            } else {
                while (now + 2 >= Browser.nextRAF) {
                    Browser.nextRAF += 1e3 / 60
                }
            }
            var delay = Math.max(Browser.nextRAF - now, 0)
            setTimeout(func, delay)
        },
        requestAnimationFrame: function (func) {
            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(func)
                return
            }
            var RAF = Browser.fakeRequestAnimationFrame
            RAF(func)
        },
        safeCallback: function (func) {
            return function () {
                if (!ABORT) return func.apply(null, arguments)
            }
        },
        allowAsyncCallbacks: true,
        queuedAsyncCallbacks: [],
        pauseAsyncCallbacks: function () {
            Browser.allowAsyncCallbacks = false
        },
        resumeAsyncCallbacks: function () {
            Browser.allowAsyncCallbacks = true
            if (Browser.queuedAsyncCallbacks.length > 0) {
                var callbacks = Browser.queuedAsyncCallbacks
                Browser.queuedAsyncCallbacks = []
                callbacks.forEach(function (func) {
                    func()
                })
            }
        },
        safeRequestAnimationFrame: function (func) {
            return Browser.requestAnimationFrame(function () {
                if (ABORT) return
                if (Browser.allowAsyncCallbacks) {
                    func()
                } else {
                    Browser.queuedAsyncCallbacks.push(func)
                }
            })
        },
        safeSetTimeout: function (func, timeout) {
            noExitRuntime = true
            return setTimeout(function () {
                if (ABORT) return
                if (Browser.allowAsyncCallbacks) {
                    func()
                } else {
                    Browser.queuedAsyncCallbacks.push(func)
                }
            }, timeout)
        },
        safeSetInterval: function (func, timeout) {
            noExitRuntime = true
            return setInterval(function () {
                if (ABORT) return
                if (Browser.allowAsyncCallbacks) {
                    func()
                }
            }, timeout)
        },
        getMimetype: function (name) {
            return {
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                png: 'image/png',
                bmp: 'image/bmp',
                ogg: 'audio/ogg',
                wav: 'audio/wav',
                mp3: 'audio/mpeg'
            }[name.substr(name.lastIndexOf('.') + 1)]
        },
        getUserMedia: function (func) {
            if (!window.getUserMedia) {
                window.getUserMedia = navigator['getUserMedia'] || navigator['mozGetUserMedia']
            }
            window.getUserMedia(func)
        },
        getMovementX: function (event) {
            return event['movementX'] || event['mozMovementX'] || event['webkitMovementX'] || 0
        },
        getMovementY: function (event) {
            return event['movementY'] || event['mozMovementY'] || event['webkitMovementY'] || 0
        },
        getMouseWheelDelta: function (event) {
            var delta = 0
            switch (event.type) {
                case 'DOMMouseScroll':
                    delta = event.detail / 3
                    break
                case 'mousewheel':
                    delta = event.wheelDelta / 120
                    break
                case 'wheel':
                    delta = event.deltaY
                    switch (event.deltaMode) {
                        case 0:
                            delta /= 100
                            break
                        case 1:
                            delta /= 3
                            break
                        case 2:
                            delta *= 80
                            break
                        default:
                            throw 'unrecognized mouse wheel delta mode: ' + event.deltaMode
                    }
                    break
                default:
                    throw 'unrecognized mouse wheel event: ' + event.type
            }
            return delta
        },
        mouseX: 0,
        mouseY: 0,
        mouseMovementX: 0,
        mouseMovementY: 0,
        touches: {},
        lastTouches: {},
        calculateMouseEvent: function (event) {
            if (Browser.pointerLock) {
                if (event.type != 'mousemove' && 'mozMovementX' in event) {
                    Browser.mouseMovementX = Browser.mouseMovementY = 0
                } else {
                    Browser.mouseMovementX = Browser.getMovementX(event)
                    Browser.mouseMovementY = Browser.getMovementY(event)
                }
                if (typeof SDL != 'undefined') {
                    Browser.mouseX = SDL.mouseX + Browser.mouseMovementX
                    Browser.mouseY = SDL.mouseY + Browser.mouseMovementY
                } else {
                    Browser.mouseX += Browser.mouseMovementX
                    Browser.mouseY += Browser.mouseMovementY
                }
            } else {
                var rect = Module['canvas'].getBoundingClientRect()
                var cw = Module['canvas'].width
                var ch = Module['canvas'].height
                var scrollX = typeof window.scrollX !== 'undefined' ? window.scrollX : window.pageXOffset
                var scrollY = typeof window.scrollY !== 'undefined' ? window.scrollY : window.pageYOffset
                if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
                    var touch = event.touch
                    if (touch === undefined) {
                        return
                    }
                    var adjustedX = touch.pageX - (scrollX + rect.left)
                    var adjustedY = touch.pageY - (scrollY + rect.top)
                    adjustedX = adjustedX * (cw / rect.width)
                    adjustedY = adjustedY * (ch / rect.height)
                    var coords = { x: adjustedX, y: adjustedY }
                    if (event.type === 'touchstart') {
                        Browser.lastTouches[touch.identifier] = coords
                        Browser.touches[touch.identifier] = coords
                    } else if (event.type === 'touchend' || event.type === 'touchmove') {
                        var last = Browser.touches[touch.identifier]
                        if (!last) last = coords
                        Browser.lastTouches[touch.identifier] = last
                        Browser.touches[touch.identifier] = coords
                    }
                    return
                }
                var x = event.pageX - (scrollX + rect.left)
                var y = event.pageY - (scrollY + rect.top)
                x = x * (cw / rect.width)
                y = y * (ch / rect.height)
                Browser.mouseMovementX = x - Browser.mouseX
                Browser.mouseMovementY = y - Browser.mouseY
                Browser.mouseX = x
                Browser.mouseY = y
            }
        },
        asyncLoad: function (url, onload, onerror, noRunDep) {
            var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : ''
            readAsync(
                url,
                function (arrayBuffer) {
                    assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).')
                    onload(new Uint8Array(arrayBuffer))
                    if (dep) removeRunDependency(dep)
                },
                function (event) {
                    if (onerror) {
                        onerror()
                    } else {
                        throw 'Loading data file "' + url + '" failed.'
                    }
                }
            )
            if (dep) addRunDependency(dep)
        },
        resizeListeners: [],
        updateResizeListeners: function () {
            var canvas = Module['canvas']
            Browser.resizeListeners.forEach(function (listener) {
                listener(canvas.width, canvas.height)
            })
        },
        setCanvasSize: function (width, height, noUpdates) {
            var canvas = Module['canvas']
            Browser.updateCanvasDimensions(canvas, width, height)
            if (!noUpdates) Browser.updateResizeListeners()
        },
        windowedWidth: 0,
        windowedHeight: 0,
        setFullscreenCanvasSize: function () {
            if (typeof SDL != 'undefined') {
                var flags = HEAPU32[SDL.screen >>> 2]
                flags = flags | 8388608
                HEAP32[SDL.screen >>> 2] = flags
            }
            Browser.updateCanvasDimensions(Module['canvas'])
            Browser.updateResizeListeners()
        },
        setWindowedCanvasSize: function () {
            if (typeof SDL != 'undefined') {
                var flags = HEAPU32[SDL.screen >>> 2]
                flags = flags & ~8388608
                HEAP32[SDL.screen >>> 2] = flags
            }
            Browser.updateCanvasDimensions(Module['canvas'])
            Browser.updateResizeListeners()
        },
        updateCanvasDimensions: function (canvas, wNative, hNative) {
            if (wNative && hNative) {
                canvas.widthNative = wNative
                canvas.heightNative = hNative
            } else {
                wNative = canvas.widthNative
                hNative = canvas.heightNative
            }
            var w = wNative
            var h = hNative
            if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
                if (w / h < Module['forcedAspectRatio']) {
                    w = Math.round(h * Module['forcedAspectRatio'])
                } else {
                    h = Math.round(w / Module['forcedAspectRatio'])
                }
            }
            if (
                (document['fullscreenElement'] ||
                    document['mozFullScreenElement'] ||
                    document['msFullscreenElement'] ||
                    document['webkitFullscreenElement'] ||
                    document['webkitCurrentFullScreenElement']) === canvas.parentNode &&
                typeof screen != 'undefined'
            ) {
                var factor = Math.min(screen.width / w, screen.height / h)
                w = Math.round(w * factor)
                h = Math.round(h * factor)
            }
            if (Browser.resizeCanvas) {
                if (canvas.width != w) canvas.width = w
                if (canvas.height != h) canvas.height = h
                if (typeof canvas.style != 'undefined') {
                    canvas.style.removeProperty('width')
                    canvas.style.removeProperty('height')
                }
            } else {
                if (canvas.width != wNative) canvas.width = wNative
                if (canvas.height != hNative) canvas.height = hNative
                if (typeof canvas.style != 'undefined') {
                    if (w != wNative || h != hNative) {
                        canvas.style.setProperty('width', w + 'px', 'important')
                        canvas.style.setProperty('height', h + 'px', 'important')
                    } else {
                        canvas.style.removeProperty('width')
                        canvas.style.removeProperty('height')
                    }
                }
            }
        },
        wgetRequests: {},
        nextWgetRequestHandle: 0,
        getNextWgetRequestHandle: function () {
            var handle = Browser.nextWgetRequestHandle
            Browser.nextWgetRequestHandle++
            return handle
        }
    }
    var EGL = {
        errorCode: 12288,
        defaultDisplayInitialized: false,
        currentContext: 0,
        currentReadSurface: 0,
        currentDrawSurface: 0,
        contextAttributes: { alpha: false, depth: false, stencil: false, antialias: false },
        stringCache: {},
        setErrorCode: function (code) {
            EGL.errorCode = code
        },
        chooseConfig: function (display, attribList, config, config_size, numConfigs) {
            if (display != 62e3) {
                EGL.setErrorCode(12296)
                return 0
            }
            if (attribList) {
                for (;;) {
                    var param = HEAP32[attribList >>> 2]
                    if (param == 12321) {
                        var alphaSize = HEAP32[(attribList + 4) >>> 2]
                        EGL.contextAttributes.alpha = alphaSize > 0
                    } else if (param == 12325) {
                        var depthSize = HEAP32[(attribList + 4) >>> 2]
                        EGL.contextAttributes.depth = depthSize > 0
                    } else if (param == 12326) {
                        var stencilSize = HEAP32[(attribList + 4) >>> 2]
                        EGL.contextAttributes.stencil = stencilSize > 0
                    } else if (param == 12337) {
                        var samples = HEAP32[(attribList + 4) >>> 2]
                        EGL.contextAttributes.antialias = samples > 0
                    } else if (param == 12338) {
                        var samples = HEAP32[(attribList + 4) >>> 2]
                        EGL.contextAttributes.antialias = samples == 1
                    } else if (param == 12544) {
                        var requestedPriority = HEAP32[(attribList + 4) >>> 2]
                        EGL.contextAttributes.lowLatency = requestedPriority != 12547
                    } else if (param == 12344) {
                        break
                    }
                    attribList += 8
                }
            }
            if ((!config || !config_size) && !numConfigs) {
                EGL.setErrorCode(12300)
                return 0
            }
            if (numConfigs) {
                HEAP32[numConfigs >>> 2] = 1
            }
            if (config && config_size > 0) {
                HEAP32[config >>> 2] = 62002
            }
            EGL.setErrorCode(12288)
            return 1
        }
    }
    function _eglGetProcAddress(name_) {
        return _emscripten_GetProcAddress(name_)
    }
    function _emscripten_asm_const_int(code, sigPtr, argbuf) {
        var args = readAsmConstArgs(sigPtr, argbuf)
        return ASM_CONSTS[code].apply(null, args)
    }
    function __webgl_enable_ANGLE_instanced_arrays(ctx) {
        var ext = ctx.getExtension('ANGLE_instanced_arrays')
        if (ext) {
            ctx['vertexAttribDivisor'] = function (index, divisor) {
                ext['vertexAttribDivisorANGLE'](index, divisor)
            }
            ctx['drawArraysInstanced'] = function (mode, first, count, primcount) {
                ext['drawArraysInstancedANGLE'](mode, first, count, primcount)
            }
            ctx['drawElementsInstanced'] = function (mode, count, type, indices, primcount) {
                ext['drawElementsInstancedANGLE'](mode, count, type, indices, primcount)
            }
            return 1
        }
    }
    function __webgl_enable_OES_vertex_array_object(ctx) {
        var ext = ctx.getExtension('OES_vertex_array_object')
        if (ext) {
            ctx['createVertexArray'] = function () {
                return ext['createVertexArrayOES']()
            }
            ctx['deleteVertexArray'] = function (vao) {
                ext['deleteVertexArrayOES'](vao)
            }
            ctx['bindVertexArray'] = function (vao) {
                ext['bindVertexArrayOES'](vao)
            }
            ctx['isVertexArray'] = function (vao) {
                return ext['isVertexArrayOES'](vao)
            }
            return 1
        }
    }
    function __webgl_enable_WEBGL_draw_buffers(ctx) {
        var ext = ctx.getExtension('WEBGL_draw_buffers')
        if (ext) {
            ctx['drawBuffers'] = function (n, bufs) {
                ext['drawBuffersWEBGL'](n, bufs)
            }
            return 1
        }
    }
    function __webgl_enable_WEBGL_multi_draw(ctx) {
        return !!(ctx.multiDrawWebgl = ctx.getExtension('WEBGL_multi_draw'))
    }
    var GL = {
        counter: 1,
        buffers: [],
        programs: [],
        framebuffers: [],
        renderbuffers: [],
        textures: [],
        uniforms: [],
        shaders: [],
        vaos: [],
        contexts: [],
        offscreenCanvases: {},
        timerQueriesEXT: [],
        programInfos: {},
        stringCache: {},
        unpackAlignment: 4,
        recordError: function recordError(errorCode) {
            if (!GL.lastError) {
                GL.lastError = errorCode
            }
        },
        getNewId: function (table) {
            var ret = GL.counter++
            for (var i = table.length; i < ret; i++) {
                table[i] = null
            }
            return ret
        },
        getSource: function (shader, count, string, length) {
            var source = ''
            for (var i = 0; i < count; ++i) {
                var len = length ? HEAP32[(length + i * 4) >>> 2] : -1
                source += UTF8ToString(HEAP32[(string + i * 4) >>> 2], len < 0 ? undefined : len)
            }
            return source
        },
        createContext: function (canvas, webGLContextAttributes) {
            var ctx = canvas.getContext('webgl', webGLContextAttributes)
            if (!ctx) return 0
            var handle = GL.registerContext(ctx, webGLContextAttributes)
            return handle
        },
        registerContext: function (ctx, webGLContextAttributes) {
            var handle = GL.getNewId(GL.contexts)
            var context = {
                handle: handle,
                attributes: webGLContextAttributes,
                version: webGLContextAttributes.majorVersion,
                GLctx: ctx
            }
            if (ctx.canvas) ctx.canvas.GLctxObject = context
            GL.contexts[handle] = context
            if (
                typeof webGLContextAttributes.enableExtensionsByDefault === 'undefined' ||
                webGLContextAttributes.enableExtensionsByDefault
            ) {
                GL.initExtensions(context)
            }
            return handle
        },
        makeContextCurrent: function (contextHandle) {
            GL.currentContext = GL.contexts[contextHandle]
            Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx
            return !(contextHandle && !GLctx)
        },
        getContext: function (contextHandle) {
            return GL.contexts[contextHandle]
        },
        deleteContext: function (contextHandle) {
            if (GL.currentContext === GL.contexts[contextHandle]) GL.currentContext = null
            if (typeof JSEvents === 'object')
                JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas)
            if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas)
                GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined
            GL.contexts[contextHandle] = null
        },
        initExtensions: function (context) {
            if (!context) context = GL.currentContext
            if (context.initExtensionsDone) return
            context.initExtensionsDone = true
            var GLctx = context.GLctx
            __webgl_enable_ANGLE_instanced_arrays(GLctx)
            __webgl_enable_OES_vertex_array_object(GLctx)
            __webgl_enable_WEBGL_draw_buffers(GLctx)
            GLctx.disjointTimerQueryExt = GLctx.getExtension('EXT_disjoint_timer_query')
            __webgl_enable_WEBGL_multi_draw(GLctx)
            var automaticallyEnabledExtensions = [
                'OES_texture_float',
                'OES_texture_half_float',
                'OES_standard_derivatives',
                'OES_vertex_array_object',
                'WEBGL_compressed_texture_s3tc',
                'WEBGL_depth_texture',
                'OES_element_index_uint',
                'EXT_texture_filter_anisotropic',
                'EXT_frag_depth',
                'WEBGL_draw_buffers',
                'ANGLE_instanced_arrays',
                'OES_texture_float_linear',
                'OES_texture_half_float_linear',
                'EXT_blend_minmax',
                'EXT_shader_texture_lod',
                'EXT_texture_norm16',
                'WEBGL_compressed_texture_pvrtc',
                'EXT_color_buffer_half_float',
                'WEBGL_color_buffer_float',
                'EXT_sRGB',
                'WEBGL_compressed_texture_etc1',
                'EXT_disjoint_timer_query',
                'WEBGL_compressed_texture_etc',
                'WEBGL_compressed_texture_astc',
                'EXT_color_buffer_float',
                'WEBGL_compressed_texture_s3tc_srgb',
                'EXT_disjoint_timer_query_webgl2',
                'WEBKIT_WEBGL_compressed_texture_pvrtc'
            ]
            var exts = GLctx.getSupportedExtensions() || []
            exts.forEach(function (ext) {
                if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
                    GLctx.getExtension(ext)
                }
            })
        },
        populateUniformTable: function (program) {
            var p = GL.programs[program]
            var ptable = (GL.programInfos[program] = {
                uniforms: {},
                maxUniformLength: 0,
                maxAttributeLength: -1,
                maxUniformBlockNameLength: -1
            })
            var utable = ptable.uniforms
            var numUniforms = GLctx.getProgramParameter(p, 35718)
            for (var i = 0; i < numUniforms; ++i) {
                var u = GLctx.getActiveUniform(p, i)
                var name = u.name
                ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length + 1)
                if (name.slice(-1) == ']') {
                    name = name.slice(0, name.lastIndexOf('['))
                }
                var loc = GLctx.getUniformLocation(p, name)
                if (loc) {
                    var id = GL.getNewId(GL.uniforms)
                    utable[name] = [u.size, id]
                    GL.uniforms[id] = loc
                    for (var j = 1; j < u.size; ++j) {
                        var n = name + '[' + j + ']'
                        loc = GLctx.getUniformLocation(p, n)
                        id = GL.getNewId(GL.uniforms)
                        GL.uniforms[id] = loc
                    }
                }
            }
        }
    }
    function _emscripten_glActiveTexture(x0) {
        GLctx['activeTexture'](x0)
    }
    function _emscripten_glAttachShader(program, shader) {
        GLctx.attachShader(GL.programs[program], GL.shaders[shader])
    }
    function _emscripten_glBeginQueryEXT(target, id) {
        GLctx.disjointTimerQueryExt['beginQueryEXT'](target, GL.timerQueriesEXT[id])
    }
    function _emscripten_glBindAttribLocation(program, index, name) {
        GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name))
    }
    function _emscripten_glBindBuffer(target, buffer) {
        GLctx.bindBuffer(target, GL.buffers[buffer])
    }
    function _emscripten_glBindFramebuffer(target, framebuffer) {
        GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer])
    }
    function _emscripten_glBindRenderbuffer(target, renderbuffer) {
        GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer])
    }
    function _emscripten_glBindTexture(target, texture) {
        GLctx.bindTexture(target, GL.textures[texture])
    }
    function _emscripten_glBindVertexArrayOES(vao) {
        GLctx['bindVertexArray'](GL.vaos[vao])
    }
    function _emscripten_glBlendColor(x0, x1, x2, x3) {
        GLctx['blendColor'](x0, x1, x2, x3)
    }
    function _emscripten_glBlendEquation(x0) {
        GLctx['blendEquation'](x0)
    }
    function _emscripten_glBlendEquationSeparate(x0, x1) {
        GLctx['blendEquationSeparate'](x0, x1)
    }
    function _emscripten_glBlendFunc(x0, x1) {
        GLctx['blendFunc'](x0, x1)
    }
    function _emscripten_glBlendFuncSeparate(x0, x1, x2, x3) {
        GLctx['blendFuncSeparate'](x0, x1, x2, x3)
    }
    function _emscripten_glBufferData(target, size, data, usage) {
        GLctx.bufferData(target, data ? HEAPU8.subarray(data >>> 0, (data + size) >>> 0) : size, usage)
    }
    function _emscripten_glBufferSubData(target, offset, size, data) {
        GLctx.bufferSubData(target, offset, HEAPU8.subarray(data >>> 0, (data + size) >>> 0))
    }
    function _emscripten_glCheckFramebufferStatus(x0) {
        return GLctx['checkFramebufferStatus'](x0)
    }
    function _emscripten_glClear(x0) {
        GLctx['clear'](x0)
    }
    function _emscripten_glClearColor(x0, x1, x2, x3) {
        GLctx['clearColor'](x0, x1, x2, x3)
    }
    function _emscripten_glClearDepthf(x0) {
        GLctx['clearDepth'](x0)
    }
    function _emscripten_glClearStencil(x0) {
        GLctx['clearStencil'](x0)
    }
    function _emscripten_glColorMask(red, green, blue, alpha) {
        GLctx.colorMask(!!red, !!green, !!blue, !!alpha)
    }
    function _emscripten_glCompileShader(shader) {
        GLctx.compileShader(GL.shaders[shader])
    }
    function _emscripten_glCompressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data) {
        GLctx['compressedTexImage2D'](
            target,
            level,
            internalFormat,
            width,
            height,
            border,
            data ? HEAPU8.subarray(data >>> 0, (data + imageSize) >>> 0) : null
        )
    }
    function _emscripten_glCompressedTexSubImage2D(
        target,
        level,
        xoffset,
        yoffset,
        width,
        height,
        format,
        imageSize,
        data
    ) {
        GLctx['compressedTexSubImage2D'](
            target,
            level,
            xoffset,
            yoffset,
            width,
            height,
            format,
            data ? HEAPU8.subarray(data >>> 0, (data + imageSize) >>> 0) : null
        )
    }
    function _emscripten_glCopyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
        GLctx['copyTexImage2D'](x0, x1, x2, x3, x4, x5, x6, x7)
    }
    function _emscripten_glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
        GLctx['copyTexSubImage2D'](x0, x1, x2, x3, x4, x5, x6, x7)
    }
    function _emscripten_glCreateProgram() {
        var id = GL.getNewId(GL.programs)
        var program = GLctx.createProgram()
        program.name = id
        GL.programs[id] = program
        return id
    }
    function _emscripten_glCreateShader(shaderType) {
        var id = GL.getNewId(GL.shaders)
        GL.shaders[id] = GLctx.createShader(shaderType)
        return id
    }
    function _emscripten_glCullFace(x0) {
        GLctx['cullFace'](x0)
    }
    function _emscripten_glDeleteBuffers(n, buffers) {
        for (var i = 0; i < n; i++) {
            var id = HEAP32[(buffers + i * 4) >>> 2]
            var buffer = GL.buffers[id]
            if (!buffer) continue
            GLctx.deleteBuffer(buffer)
            buffer.name = 0
            GL.buffers[id] = null
        }
    }
    function _emscripten_glDeleteFramebuffers(n, framebuffers) {
        for (var i = 0; i < n; ++i) {
            var id = HEAP32[(framebuffers + i * 4) >>> 2]
            var framebuffer = GL.framebuffers[id]
            if (!framebuffer) continue
            GLctx.deleteFramebuffer(framebuffer)
            framebuffer.name = 0
            GL.framebuffers[id] = null
        }
    }
    function _emscripten_glDeleteProgram(id) {
        if (!id) return
        var program = GL.programs[id]
        if (!program) {
            GL.recordError(1281)
            return
        }
        GLctx.deleteProgram(program)
        program.name = 0
        GL.programs[id] = null
        GL.programInfos[id] = null
    }
    function _emscripten_glDeleteQueriesEXT(n, ids) {
        for (var i = 0; i < n; i++) {
            var id = HEAP32[(ids + i * 4) >>> 2]
            var query = GL.timerQueriesEXT[id]
            if (!query) continue
            GLctx.disjointTimerQueryExt['deleteQueryEXT'](query)
            GL.timerQueriesEXT[id] = null
        }
    }
    function _emscripten_glDeleteRenderbuffers(n, renderbuffers) {
        for (var i = 0; i < n; i++) {
            var id = HEAP32[(renderbuffers + i * 4) >>> 2]
            var renderbuffer = GL.renderbuffers[id]
            if (!renderbuffer) continue
            GLctx.deleteRenderbuffer(renderbuffer)
            renderbuffer.name = 0
            GL.renderbuffers[id] = null
        }
    }
    function _emscripten_glDeleteShader(id) {
        if (!id) return
        var shader = GL.shaders[id]
        if (!shader) {
            GL.recordError(1281)
            return
        }
        GLctx.deleteShader(shader)
        GL.shaders[id] = null
    }
    function _emscripten_glDeleteTextures(n, textures) {
        for (var i = 0; i < n; i++) {
            var id = HEAP32[(textures + i * 4) >>> 2]
            var texture = GL.textures[id]
            if (!texture) continue
            GLctx.deleteTexture(texture)
            texture.name = 0
            GL.textures[id] = null
        }
    }
    function _emscripten_glDeleteVertexArraysOES(n, vaos) {
        for (var i = 0; i < n; i++) {
            var id = HEAP32[(vaos + i * 4) >>> 2]
            GLctx['deleteVertexArray'](GL.vaos[id])
            GL.vaos[id] = null
        }
    }
    function _emscripten_glDepthFunc(x0) {
        GLctx['depthFunc'](x0)
    }
    function _emscripten_glDepthMask(flag) {
        GLctx.depthMask(!!flag)
    }
    function _emscripten_glDepthRangef(x0, x1) {
        GLctx['depthRange'](x0, x1)
    }
    function _emscripten_glDetachShader(program, shader) {
        GLctx.detachShader(GL.programs[program], GL.shaders[shader])
    }
    function _emscripten_glDisable(x0) {
        GLctx['disable'](x0)
    }
    function _emscripten_glDisableVertexAttribArray(index) {
        GLctx.disableVertexAttribArray(index)
    }
    function _emscripten_glDrawArrays(mode, first, count) {
        GLctx.drawArrays(mode, first, count)
    }
    function _emscripten_glDrawArraysInstancedANGLE(mode, first, count, primcount) {
        GLctx['drawArraysInstanced'](mode, first, count, primcount)
    }
    var tempFixedLengthArray = []
    function _emscripten_glDrawBuffersWEBGL(n, bufs) {
        var bufArray = tempFixedLengthArray[n]
        for (var i = 0; i < n; i++) {
            bufArray[i] = HEAP32[(bufs + i * 4) >>> 2]
        }
        GLctx['drawBuffers'](bufArray)
    }
    function _emscripten_glDrawElements(mode, count, type, indices) {
        GLctx.drawElements(mode, count, type, indices)
    }
    function _emscripten_glDrawElementsInstancedANGLE(mode, count, type, indices, primcount) {
        GLctx['drawElementsInstanced'](mode, count, type, indices, primcount)
    }
    function _emscripten_glEnable(x0) {
        GLctx['enable'](x0)
    }
    function _emscripten_glEnableVertexAttribArray(index) {
        GLctx.enableVertexAttribArray(index)
    }
    function _emscripten_glEndQueryEXT(target) {
        GLctx.disjointTimerQueryExt['endQueryEXT'](target)
    }
    function _emscripten_glFinish() {
        GLctx['finish']()
    }
    function _emscripten_glFlush() {
        GLctx['flush']()
    }
    function _emscripten_glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
        GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer])
    }
    function _emscripten_glFramebufferTexture2D(target, attachment, textarget, texture, level) {
        GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level)
    }
    function _emscripten_glFrontFace(x0) {
        GLctx['frontFace'](x0)
    }
    function __glGenObject(n, buffers, createFunction, objectTable) {
        for (var i = 0; i < n; i++) {
            var buffer = GLctx[createFunction]()
            var id = buffer && GL.getNewId(objectTable)
            if (buffer) {
                buffer.name = id
                objectTable[id] = buffer
            } else {
                GL.recordError(1282)
            }
            HEAP32[(buffers + i * 4) >>> 2] = id
        }
    }
    function _emscripten_glGenBuffers(n, buffers) {
        __glGenObject(n, buffers, 'createBuffer', GL.buffers)
    }
    function _emscripten_glGenFramebuffers(n, ids) {
        __glGenObject(n, ids, 'createFramebuffer', GL.framebuffers)
    }
    function _emscripten_glGenQueriesEXT(n, ids) {
        for (var i = 0; i < n; i++) {
            var query = GLctx.disjointTimerQueryExt['createQueryEXT']()
            if (!query) {
                GL.recordError(1282)
                while (i < n) HEAP32[(ids + i++ * 4) >>> 2] = 0
                return
            }
            var id = GL.getNewId(GL.timerQueriesEXT)
            query.name = id
            GL.timerQueriesEXT[id] = query
            HEAP32[(ids + i * 4) >>> 2] = id
        }
    }
    function _emscripten_glGenRenderbuffers(n, renderbuffers) {
        __glGenObject(n, renderbuffers, 'createRenderbuffer', GL.renderbuffers)
    }
    function _emscripten_glGenTextures(n, textures) {
        __glGenObject(n, textures, 'createTexture', GL.textures)
    }
    function _emscripten_glGenVertexArraysOES(n, arrays) {
        __glGenObject(n, arrays, 'createVertexArray', GL.vaos)
    }
    function _emscripten_glGenerateMipmap(x0) {
        GLctx['generateMipmap'](x0)
    }
    function __glGetActiveAttribOrUniform(funcName, program, index, bufSize, length, size, type, name) {
        program = GL.programs[program]
        var info = GLctx[funcName](program, index)
        if (info) {
            var numBytesWrittenExclNull = name && stringToUTF8(info.name, name, bufSize)
            if (length) HEAP32[length >>> 2] = numBytesWrittenExclNull
            if (size) HEAP32[size >>> 2] = info.size
            if (type) HEAP32[type >>> 2] = info.type
        }
    }
    function _emscripten_glGetActiveAttrib(program, index, bufSize, length, size, type, name) {
        __glGetActiveAttribOrUniform('getActiveAttrib', program, index, bufSize, length, size, type, name)
    }
    function _emscripten_glGetActiveUniform(program, index, bufSize, length, size, type, name) {
        __glGetActiveAttribOrUniform('getActiveUniform', program, index, bufSize, length, size, type, name)
    }
    function _emscripten_glGetAttachedShaders(program, maxCount, count, shaders) {
        var result = GLctx.getAttachedShaders(GL.programs[program])
        var len = result.length
        if (len > maxCount) {
            len = maxCount
        }
        HEAP32[count >>> 2] = len
        for (var i = 0; i < len; ++i) {
            var id = GL.shaders.indexOf(result[i])
            HEAP32[(shaders + i * 4) >>> 2] = id
        }
    }
    function _emscripten_glGetAttribLocation(program, name) {
        return GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name))
    }
    function writeI53ToI64(ptr, num) {
        HEAPU32[ptr >>> 2] = num
        HEAPU32[(ptr + 4) >>> 2] = (num - HEAPU32[ptr >>> 2]) / 4294967296
    }
    function emscriptenWebGLGet(name_, p, type) {
        if (!p) {
            GL.recordError(1281)
            return
        }
        var ret = undefined
        switch (name_) {
            case 36346:
                ret = 1
                break
            case 36344:
                if (type != 0 && type != 1) {
                    GL.recordError(1280)
                }
                return
            case 36345:
                ret = 0
                break
            case 34466:
                var formats = GLctx.getParameter(34467)
                ret = formats ? formats.length : 0
                break
        }
        if (ret === undefined) {
            var result = GLctx.getParameter(name_)
            switch (typeof result) {
                case 'number':
                    ret = result
                    break
                case 'boolean':
                    ret = result ? 1 : 0
                    break
                case 'string':
                    GL.recordError(1280)
                    return
                case 'object':
                    if (result === null) {
                        switch (name_) {
                            case 34964:
                            case 35725:
                            case 34965:
                            case 36006:
                            case 36007:
                            case 32873:
                            case 34229:
                            case 34068: {
                                ret = 0
                                break
                            }
                            default: {
                                GL.recordError(1280)
                                return
                            }
                        }
                    } else if (
                        result instanceof Float32Array ||
                        result instanceof Uint32Array ||
                        result instanceof Int32Array ||
                        result instanceof Array
                    ) {
                        for (var i = 0; i < result.length; ++i) {
                            switch (type) {
                                case 0:
                                    HEAP32[(p + i * 4) >>> 2] = result[i]
                                    break
                                case 2:
                                    HEAPF32[(p + i * 4) >>> 2] = result[i]
                                    break
                                case 4:
                                    HEAP8[(p + i) >>> 0] = result[i] ? 1 : 0
                                    break
                            }
                        }
                        return
                    } else {
                        try {
                            ret = result.name | 0
                        } catch (e) {
                            GL.recordError(1280)
                            err(
                                'GL_INVALID_ENUM in glGet' +
                                    type +
                                    'v: Unknown object returned from WebGL getParameter(' +
                                    name_ +
                                    ')! (error: ' +
                                    e +
                                    ')'
                            )
                            return
                        }
                    }
                    break
                default:
                    GL.recordError(1280)
                    err(
                        'GL_INVALID_ENUM in glGet' +
                            type +
                            'v: Native code calling glGet' +
                            type +
                            'v(' +
                            name_ +
                            ') and it returns ' +
                            result +
                            ' of type ' +
                            typeof result +
                            '!'
                    )
                    return
            }
        }
        switch (type) {
            case 1:
                writeI53ToI64(p, ret)
                break
            case 0:
                HEAP32[p >>> 2] = ret
                break
            case 2:
                HEAPF32[p >>> 2] = ret
                break
            case 4:
                HEAP8[p >>> 0] = ret ? 1 : 0
                break
        }
    }
    function _emscripten_glGetBooleanv(name_, p) {
        emscriptenWebGLGet(name_, p, 4)
    }
    function _emscripten_glGetBufferParameteriv(target, value, data) {
        if (!data) {
            GL.recordError(1281)
            return
        }
        HEAP32[data >>> 2] = GLctx.getBufferParameter(target, value)
    }
    function _emscripten_glGetError() {
        var error = GLctx.getError() || GL.lastError
        GL.lastError = 0
        return error
    }
    function _emscripten_glGetFloatv(name_, p) {
        emscriptenWebGLGet(name_, p, 2)
    }
    function _emscripten_glGetFramebufferAttachmentParameteriv(target, attachment, pname, params) {
        var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname)
        if (result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
            result = result.name | 0
        }
        HEAP32[params >>> 2] = result
    }
    function _emscripten_glGetIntegerv(name_, p) {
        emscriptenWebGLGet(name_, p, 0)
    }
    function _emscripten_glGetProgramInfoLog(program, maxLength, length, infoLog) {
        var log = GLctx.getProgramInfoLog(GL.programs[program])
        if (log === null) log = '(unknown error)'
        var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0
        if (length) HEAP32[length >>> 2] = numBytesWrittenExclNull
    }
    function _emscripten_glGetProgramiv(program, pname, p) {
        if (!p) {
            GL.recordError(1281)
            return
        }
        if (program >= GL.counter) {
            GL.recordError(1281)
            return
        }
        var ptable = GL.programInfos[program]
        if (!ptable) {
            GL.recordError(1282)
            return
        }
        if (pname == 35716) {
            var log = GLctx.getProgramInfoLog(GL.programs[program])
            if (log === null) log = '(unknown error)'
            HEAP32[p >>> 2] = log.length + 1
        } else if (pname == 35719) {
            HEAP32[p >>> 2] = ptable.maxUniformLength
        } else if (pname == 35722) {
            if (ptable.maxAttributeLength == -1) {
                program = GL.programs[program]
                var numAttribs = GLctx.getProgramParameter(program, 35721)
                ptable.maxAttributeLength = 0
                for (var i = 0; i < numAttribs; ++i) {
                    var activeAttrib = GLctx.getActiveAttrib(program, i)
                    ptable.maxAttributeLength = Math.max(ptable.maxAttributeLength, activeAttrib.name.length + 1)
                }
            }
            HEAP32[p >>> 2] = ptable.maxAttributeLength
        } else if (pname == 35381) {
            if (ptable.maxUniformBlockNameLength == -1) {
                program = GL.programs[program]
                var numBlocks = GLctx.getProgramParameter(program, 35382)
                ptable.maxUniformBlockNameLength = 0
                for (var i = 0; i < numBlocks; ++i) {
                    var activeBlockName = GLctx.getActiveUniformBlockName(program, i)
                    ptable.maxUniformBlockNameLength = Math.max(
                        ptable.maxUniformBlockNameLength,
                        activeBlockName.length + 1
                    )
                }
            }
            HEAP32[p >>> 2] = ptable.maxUniformBlockNameLength
        } else {
            HEAP32[p >>> 2] = GLctx.getProgramParameter(GL.programs[program], pname)
        }
    }
    function _emscripten_glGetQueryObjecti64vEXT(id, pname, params) {
        if (!params) {
            GL.recordError(1281)
            return
        }
        var query = GL.timerQueriesEXT[id]
        var param = GLctx.disjointTimerQueryExt['getQueryObjectEXT'](query, pname)
        var ret
        if (typeof param == 'boolean') {
            ret = param ? 1 : 0
        } else {
            ret = param
        }
        writeI53ToI64(params, ret)
    }
    function _emscripten_glGetQueryObjectivEXT(id, pname, params) {
        if (!params) {
            GL.recordError(1281)
            return
        }
        var query = GL.timerQueriesEXT[id]
        var param = GLctx.disjointTimerQueryExt['getQueryObjectEXT'](query, pname)
        var ret
        if (typeof param == 'boolean') {
            ret = param ? 1 : 0
        } else {
            ret = param
        }
        HEAP32[params >>> 2] = ret
    }
    function _emscripten_glGetQueryObjectui64vEXT(id, pname, params) {
        if (!params) {
            GL.recordError(1281)
            return
        }
        var query = GL.timerQueriesEXT[id]
        var param = GLctx.disjointTimerQueryExt['getQueryObjectEXT'](query, pname)
        var ret
        if (typeof param == 'boolean') {
            ret = param ? 1 : 0
        } else {
            ret = param
        }
        writeI53ToI64(params, ret)
    }
    function _emscripten_glGetQueryObjectuivEXT(id, pname, params) {
        if (!params) {
            GL.recordError(1281)
            return
        }
        var query = GL.timerQueriesEXT[id]
        var param = GLctx.disjointTimerQueryExt['getQueryObjectEXT'](query, pname)
        var ret
        if (typeof param == 'boolean') {
            ret = param ? 1 : 0
        } else {
            ret = param
        }
        HEAP32[params >>> 2] = ret
    }
    function _emscripten_glGetQueryivEXT(target, pname, params) {
        if (!params) {
            GL.recordError(1281)
            return
        }
        HEAP32[params >>> 2] = GLctx.disjointTimerQueryExt['getQueryEXT'](target, pname)
    }
    function _emscripten_glGetRenderbufferParameteriv(target, pname, params) {
        if (!params) {
            GL.recordError(1281)
            return
        }
        HEAP32[params >>> 2] = GLctx.getRenderbufferParameter(target, pname)
    }
    function _emscripten_glGetShaderInfoLog(shader, maxLength, length, infoLog) {
        var log = GLctx.getShaderInfoLog(GL.shaders[shader])
        if (log === null) log = '(unknown error)'
        var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0
        if (length) HEAP32[length >>> 2] = numBytesWrittenExclNull
    }
    function _emscripten_glGetShaderPrecisionFormat(shaderType, precisionType, range, precision) {
        var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType)
        HEAP32[range >>> 2] = result.rangeMin
        HEAP32[(range + 4) >>> 2] = result.rangeMax
        HEAP32[precision >>> 2] = result.precision
    }
    function _emscripten_glGetShaderSource(shader, bufSize, length, source) {
        var result = GLctx.getShaderSource(GL.shaders[shader])
        if (!result) return
        var numBytesWrittenExclNull = bufSize > 0 && source ? stringToUTF8(result, source, bufSize) : 0
        if (length) HEAP32[length >>> 2] = numBytesWrittenExclNull
    }
    function _emscripten_glGetShaderiv(shader, pname, p) {
        if (!p) {
            GL.recordError(1281)
            return
        }
        if (pname == 35716) {
            var log = GLctx.getShaderInfoLog(GL.shaders[shader])
            if (log === null) log = '(unknown error)'
            var logLength = log ? log.length + 1 : 0
            HEAP32[p >>> 2] = logLength
        } else if (pname == 35720) {
            var source = GLctx.getShaderSource(GL.shaders[shader])
            var sourceLength = source ? source.length + 1 : 0
            HEAP32[p >>> 2] = sourceLength
        } else {
            HEAP32[p >>> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname)
        }
    }
    function stringToNewUTF8(jsString) {
        var length = lengthBytesUTF8(jsString) + 1
        var cString = _malloc(length)
        stringToUTF8(jsString, cString, length)
        return cString
    }
    function _emscripten_glGetString(name_) {
        if (GL.stringCache[name_]) return GL.stringCache[name_]
        var ret
        switch (name_) {
            case 7939:
                var exts = GLctx.getSupportedExtensions() || []
                exts = exts.concat(
                    exts.map(function (e) {
                        return 'GL_' + e
                    })
                )
                ret = stringToNewUTF8(exts.join(' '))
                break
            case 7936:
            case 7937:
            case 37445:
            case 37446:
                var s = GLctx.getParameter(name_)
                if (!s) {
                    GL.recordError(1280)
                }
                ret = stringToNewUTF8(s)
                break
            case 7938:
                var glVersion = GLctx.getParameter(7938)
                {
                    glVersion = 'OpenGL ES 2.0 (' + glVersion + ')'
                }
                ret = stringToNewUTF8(glVersion)
                break
            case 35724:
                var glslVersion = GLctx.getParameter(35724)
                var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/
                var ver_num = glslVersion.match(ver_re)
                if (ver_num !== null) {
                    if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + '0'
                    glslVersion = 'OpenGL ES GLSL ES ' + ver_num[1] + ' (' + glslVersion + ')'
                }
                ret = stringToNewUTF8(glslVersion)
                break
            default:
                GL.recordError(1280)
                return 0
        }
        GL.stringCache[name_] = ret
        return ret
    }
    function _emscripten_glGetTexParameterfv(target, pname, params) {
        if (!params) {
            GL.recordError(1281)
            return
        }
        HEAPF32[params >>> 2] = GLctx.getTexParameter(target, pname)
    }
    function _emscripten_glGetTexParameteriv(target, pname, params) {
        if (!params) {
            GL.recordError(1281)
            return
        }
        HEAP32[params >>> 2] = GLctx.getTexParameter(target, pname)
    }
    function jstoi_q(str) {
        return parseInt(str)
    }
    function _emscripten_glGetUniformLocation(program, name) {
        name = UTF8ToString(name)
        var arrayIndex = 0
        if (name[name.length - 1] == ']') {
            var leftBrace = name.lastIndexOf('[')
            arrayIndex = name[leftBrace + 1] != ']' ? jstoi_q(name.slice(leftBrace + 1)) : 0
            name = name.slice(0, leftBrace)
        }
        var uniformInfo = GL.programInfos[program] && GL.programInfos[program].uniforms[name]
        if (uniformInfo && arrayIndex >= 0 && arrayIndex < uniformInfo[0]) {
            return uniformInfo[1] + arrayIndex
        } else {
            return -1
        }
    }
    function emscriptenWebGLGetUniform(program, location, params, type) {
        if (!params) {
            GL.recordError(1281)
            return
        }
        var data = GLctx.getUniform(GL.programs[program], GL.uniforms[location])
        if (typeof data == 'number' || typeof data == 'boolean') {
            switch (type) {
                case 0:
                    HEAP32[params >>> 2] = data
                    break
                case 2:
                    HEAPF32[params >>> 2] = data
                    break
            }
        } else {
            for (var i = 0; i < data.length; i++) {
                switch (type) {
                    case 0:
                        HEAP32[(params + i * 4) >>> 2] = data[i]
                        break
                    case 2:
                        HEAPF32[(params + i * 4) >>> 2] = data[i]
                        break
                }
            }
        }
    }
    function _emscripten_glGetUniformfv(program, location, params) {
        emscriptenWebGLGetUniform(program, location, params, 2)
    }
    function _emscripten_glGetUniformiv(program, location, params) {
        emscriptenWebGLGetUniform(program, location, params, 0)
    }
    function _emscripten_glGetVertexAttribPointerv(index, pname, pointer) {
        if (!pointer) {
            GL.recordError(1281)
            return
        }
        HEAP32[pointer >>> 2] = GLctx.getVertexAttribOffset(index, pname)
    }
    function emscriptenWebGLGetVertexAttrib(index, pname, params, type) {
        if (!params) {
            GL.recordError(1281)
            return
        }
        var data = GLctx.getVertexAttrib(index, pname)
        if (pname == 34975) {
            HEAP32[params >>> 2] = data && data['name']
        } else if (typeof data == 'number' || typeof data == 'boolean') {
            switch (type) {
                case 0:
                    HEAP32[params >>> 2] = data
                    break
                case 2:
                    HEAPF32[params >>> 2] = data
                    break
                case 5:
                    HEAP32[params >>> 2] = Math.fround(data)
                    break
            }
        } else {
            for (var i = 0; i < data.length; i++) {
                switch (type) {
                    case 0:
                        HEAP32[(params + i * 4) >>> 2] = data[i]
                        break
                    case 2:
                        HEAPF32[(params + i * 4) >>> 2] = data[i]
                        break
                    case 5:
                        HEAP32[(params + i * 4) >>> 2] = Math.fround(data[i])
                        break
                }
            }
        }
    }
    function _emscripten_glGetVertexAttribfv(index, pname, params) {
        emscriptenWebGLGetVertexAttrib(index, pname, params, 2)
    }
    function _emscripten_glGetVertexAttribiv(index, pname, params) {
        emscriptenWebGLGetVertexAttrib(index, pname, params, 5)
    }
    function _emscripten_glHint(x0, x1) {
        GLctx['hint'](x0, x1)
    }
    function _emscripten_glIsBuffer(buffer) {
        var b = GL.buffers[buffer]
        if (!b) return 0
        return GLctx.isBuffer(b)
    }
    function _emscripten_glIsEnabled(x0) {
        return GLctx['isEnabled'](x0)
    }
    function _emscripten_glIsFramebuffer(framebuffer) {
        var fb = GL.framebuffers[framebuffer]
        if (!fb) return 0
        return GLctx.isFramebuffer(fb)
    }
    function _emscripten_glIsProgram(program) {
        program = GL.programs[program]
        if (!program) return 0
        return GLctx.isProgram(program)
    }
    function _emscripten_glIsQueryEXT(id) {
        var query = GL.timerQueriesEXT[id]
        if (!query) return 0
        return GLctx.disjointTimerQueryExt['isQueryEXT'](query)
    }
    function _emscripten_glIsRenderbuffer(renderbuffer) {
        var rb = GL.renderbuffers[renderbuffer]
        if (!rb) return 0
        return GLctx.isRenderbuffer(rb)
    }
    function _emscripten_glIsShader(shader) {
        var s = GL.shaders[shader]
        if (!s) return 0
        return GLctx.isShader(s)
    }
    function _emscripten_glIsTexture(id) {
        var texture = GL.textures[id]
        if (!texture) return 0
        return GLctx.isTexture(texture)
    }
    function _emscripten_glIsVertexArrayOES(array) {
        var vao = GL.vaos[array]
        if (!vao) return 0
        return GLctx['isVertexArray'](vao)
    }
    function _emscripten_glLineWidth(x0) {
        GLctx['lineWidth'](x0)
    }
    function _emscripten_glLinkProgram(program) {
        GLctx.linkProgram(GL.programs[program])
        GL.populateUniformTable(program)
    }
    function _emscripten_glPixelStorei(pname, param) {
        if (pname == 3317) {
            GL.unpackAlignment = param
        }
        GLctx.pixelStorei(pname, param)
    }
    function _emscripten_glPolygonOffset(x0, x1) {
        GLctx['polygonOffset'](x0, x1)
    }
    function _emscripten_glQueryCounterEXT(id, target) {
        GLctx.disjointTimerQueryExt['queryCounterEXT'](GL.timerQueriesEXT[id], target)
    }
    function computeUnpackAlignedImageSize(width, height, sizePerPixel, alignment) {
        function roundedToNextMultipleOf(x, y) {
            return (x + y - 1) & -y
        }
        var plainRowSize = width * sizePerPixel
        var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment)
        return height * alignedRowSize
    }
    function __colorChannelsInGlTextureFormat(format) {
        var colorChannels = { 5: 3, 6: 4, 8: 2, 29502: 3, 29504: 4 }
        return colorChannels[format - 6402] || 1
    }
    function heapObjectForWebGLType(type) {
        type -= 5120
        if (type == 1) return HEAPU8
        if (type == 4) return HEAP32
        if (type == 6) return HEAPF32
        if (type == 5 || type == 28922) return HEAPU32
        return HEAPU16
    }
    function heapAccessShiftForWebGLHeap(heap) {
        return 31 - Math.clz32(heap.BYTES_PER_ELEMENT)
    }
    function emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) {
        var heap = heapObjectForWebGLType(type)
        var shift = heapAccessShiftForWebGLHeap(heap)
        var byteSize = 1 << shift
        var sizePerPixel = __colorChannelsInGlTextureFormat(format) * byteSize
        var bytes = computeUnpackAlignedImageSize(width, height, sizePerPixel, GL.unpackAlignment)
        return heap.subarray(pixels >>> shift, (pixels + bytes) >>> shift)
    }
    function _emscripten_glReadPixels(x, y, width, height, format, type, pixels) {
        var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format)
        if (!pixelData) {
            GL.recordError(1280)
            return
        }
        GLctx.readPixels(x, y, width, height, format, type, pixelData)
    }
    function _emscripten_glReleaseShaderCompiler() {}
    function _emscripten_glRenderbufferStorage(x0, x1, x2, x3) {
        GLctx['renderbufferStorage'](x0, x1, x2, x3)
    }
    function _emscripten_glSampleCoverage(value, invert) {
        GLctx.sampleCoverage(value, !!invert)
    }
    function _emscripten_glScissor(x0, x1, x2, x3) {
        GLctx['scissor'](x0, x1, x2, x3)
    }
    function _emscripten_glShaderBinary() {
        GL.recordError(1280)
    }
    function _emscripten_glShaderSource(shader, count, string, length) {
        var source = GL.getSource(shader, count, string, length)
        GLctx.shaderSource(GL.shaders[shader], source)
    }
    function _emscripten_glStencilFunc(x0, x1, x2) {
        GLctx['stencilFunc'](x0, x1, x2)
    }
    function _emscripten_glStencilFuncSeparate(x0, x1, x2, x3) {
        GLctx['stencilFuncSeparate'](x0, x1, x2, x3)
    }
    function _emscripten_glStencilMask(x0) {
        GLctx['stencilMask'](x0)
    }
    function _emscripten_glStencilMaskSeparate(x0, x1) {
        GLctx['stencilMaskSeparate'](x0, x1)
    }
    function _emscripten_glStencilOp(x0, x1, x2) {
        GLctx['stencilOp'](x0, x1, x2)
    }
    function _emscripten_glStencilOpSeparate(x0, x1, x2, x3) {
        GLctx['stencilOpSeparate'](x0, x1, x2, x3)
    }
    function _emscripten_glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
        GLctx.texImage2D(
            target,
            level,
            internalFormat,
            width,
            height,
            border,
            format,
            type,
            pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null
        )
    }
    function _emscripten_glTexParameterf(x0, x1, x2) {
        GLctx['texParameterf'](x0, x1, x2)
    }
    function _emscripten_glTexParameterfv(target, pname, params) {
        var param = HEAPF32[params >>> 2]
        GLctx.texParameterf(target, pname, param)
    }
    function _emscripten_glTexParameteri(x0, x1, x2) {
        GLctx['texParameteri'](x0, x1, x2)
    }
    function _emscripten_glTexParameteriv(target, pname, params) {
        var param = HEAP32[params >>> 2]
        GLctx.texParameteri(target, pname, param)
    }
    function _emscripten_glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
        var pixelData = null
        if (pixels) pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, 0)
        GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData)
    }
    function _emscripten_glUniform1f(location, v0) {
        GLctx.uniform1f(GL.uniforms[location], v0)
    }
    var miniTempWebGLFloatBuffers = []
    function _emscripten_glUniform1fv(location, count, value) {
        if (count <= 288) {
            var view = miniTempWebGLFloatBuffers[count - 1]
            for (var i = 0; i < count; ++i) {
                view[i] = HEAPF32[(value + 4 * i) >>> 2]
            }
        } else {
            var view = HEAPF32.subarray(value >>> 2, (value + count * 4) >>> 2)
        }
        GLctx.uniform1fv(GL.uniforms[location], view)
    }
    function _emscripten_glUniform1i(location, v0) {
        GLctx.uniform1i(GL.uniforms[location], v0)
    }
    var __miniTempWebGLIntBuffers = []
    function _emscripten_glUniform1iv(location, count, value) {
        if (count <= 288) {
            var view = __miniTempWebGLIntBuffers[count - 1]
            for (var i = 0; i < count; ++i) {
                view[i] = HEAP32[(value + 4 * i) >>> 2]
            }
        } else {
            var view = HEAP32.subarray(value >>> 2, (value + count * 4) >>> 2)
        }
        GLctx.uniform1iv(GL.uniforms[location], view)
    }
    function _emscripten_glUniform2f(location, v0, v1) {
        GLctx.uniform2f(GL.uniforms[location], v0, v1)
    }
    function _emscripten_glUniform2fv(location, count, value) {
        if (count <= 144) {
            var view = miniTempWebGLFloatBuffers[2 * count - 1]
            for (var i = 0; i < 2 * count; i += 2) {
                view[i] = HEAPF32[(value + 4 * i) >>> 2]
                view[i + 1] = HEAPF32[(value + (4 * i + 4)) >>> 2]
            }
        } else {
            var view = HEAPF32.subarray(value >>> 2, (value + count * 8) >>> 2)
        }
        GLctx.uniform2fv(GL.uniforms[location], view)
    }
    function _emscripten_glUniform2i(location, v0, v1) {
        GLctx.uniform2i(GL.uniforms[location], v0, v1)
    }
    function _emscripten_glUniform2iv(location, count, value) {
        if (count <= 144) {
            var view = __miniTempWebGLIntBuffers[2 * count - 1]
            for (var i = 0; i < 2 * count; i += 2) {
                view[i] = HEAP32[(value + 4 * i) >>> 2]
                view[i + 1] = HEAP32[(value + (4 * i + 4)) >>> 2]
            }
        } else {
            var view = HEAP32.subarray(value >>> 2, (value + count * 8) >>> 2)
        }
        GLctx.uniform2iv(GL.uniforms[location], view)
    }
    function _emscripten_glUniform3f(location, v0, v1, v2) {
        GLctx.uniform3f(GL.uniforms[location], v0, v1, v2)
    }
    function _emscripten_glUniform3fv(location, count, value) {
        if (count <= 96) {
            var view = miniTempWebGLFloatBuffers[3 * count - 1]
            for (var i = 0; i < 3 * count; i += 3) {
                view[i] = HEAPF32[(value + 4 * i) >>> 2]
                view[i + 1] = HEAPF32[(value + (4 * i + 4)) >>> 2]
                view[i + 2] = HEAPF32[(value + (4 * i + 8)) >>> 2]
            }
        } else {
            var view = HEAPF32.subarray(value >>> 2, (value + count * 12) >>> 2)
        }
        GLctx.uniform3fv(GL.uniforms[location], view)
    }
    function _emscripten_glUniform3i(location, v0, v1, v2) {
        GLctx.uniform3i(GL.uniforms[location], v0, v1, v2)
    }
    function _emscripten_glUniform3iv(location, count, value) {
        if (count <= 96) {
            var view = __miniTempWebGLIntBuffers[3 * count - 1]
            for (var i = 0; i < 3 * count; i += 3) {
                view[i] = HEAP32[(value + 4 * i) >>> 2]
                view[i + 1] = HEAP32[(value + (4 * i + 4)) >>> 2]
                view[i + 2] = HEAP32[(value + (4 * i + 8)) >>> 2]
            }
        } else {
            var view = HEAP32.subarray(value >>> 2, (value + count * 12) >>> 2)
        }
        GLctx.uniform3iv(GL.uniforms[location], view)
    }
    function _emscripten_glUniform4f(location, v0, v1, v2, v3) {
        GLctx.uniform4f(GL.uniforms[location], v0, v1, v2, v3)
    }
    function _emscripten_glUniform4fv(location, count, value) {
        if (count <= 72) {
            var view = miniTempWebGLFloatBuffers[4 * count - 1]
            var heap = HEAPF32
            value >>= 2
            for (var i = 0; i < 4 * count; i += 4) {
                var dst = value + i
                view[i] = heap[dst >>> 0]
                view[i + 1] = heap[(dst + 1) >>> 0]
                view[i + 2] = heap[(dst + 2) >>> 0]
                view[i + 3] = heap[(dst + 3) >>> 0]
            }
        } else {
            var view = HEAPF32.subarray(value >>> 2, (value + count * 16) >>> 2)
        }
        GLctx.uniform4fv(GL.uniforms[location], view)
    }
    function _emscripten_glUniform4i(location, v0, v1, v2, v3) {
        GLctx.uniform4i(GL.uniforms[location], v0, v1, v2, v3)
    }
    function _emscripten_glUniform4iv(location, count, value) {
        if (count <= 72) {
            var view = __miniTempWebGLIntBuffers[4 * count - 1]
            for (var i = 0; i < 4 * count; i += 4) {
                view[i] = HEAP32[(value + 4 * i) >>> 2]
                view[i + 1] = HEAP32[(value + (4 * i + 4)) >>> 2]
                view[i + 2] = HEAP32[(value + (4 * i + 8)) >>> 2]
                view[i + 3] = HEAP32[(value + (4 * i + 12)) >>> 2]
            }
        } else {
            var view = HEAP32.subarray(value >>> 2, (value + count * 16) >>> 2)
        }
        GLctx.uniform4iv(GL.uniforms[location], view)
    }
    function _emscripten_glUniformMatrix2fv(location, count, transpose, value) {
        if (count <= 72) {
            var view = miniTempWebGLFloatBuffers[4 * count - 1]
            for (var i = 0; i < 4 * count; i += 4) {
                view[i] = HEAPF32[(value + 4 * i) >>> 2]
                view[i + 1] = HEAPF32[(value + (4 * i + 4)) >>> 2]
                view[i + 2] = HEAPF32[(value + (4 * i + 8)) >>> 2]
                view[i + 3] = HEAPF32[(value + (4 * i + 12)) >>> 2]
            }
        } else {
            var view = HEAPF32.subarray(value >>> 2, (value + count * 16) >>> 2)
        }
        GLctx.uniformMatrix2fv(GL.uniforms[location], !!transpose, view)
    }
    function _emscripten_glUniformMatrix3fv(location, count, transpose, value) {
        if (count <= 32) {
            var view = miniTempWebGLFloatBuffers[9 * count - 1]
            for (var i = 0; i < 9 * count; i += 9) {
                view[i] = HEAPF32[(value + 4 * i) >>> 2]
                view[i + 1] = HEAPF32[(value + (4 * i + 4)) >>> 2]
                view[i + 2] = HEAPF32[(value + (4 * i + 8)) >>> 2]
                view[i + 3] = HEAPF32[(value + (4 * i + 12)) >>> 2]
                view[i + 4] = HEAPF32[(value + (4 * i + 16)) >>> 2]
                view[i + 5] = HEAPF32[(value + (4 * i + 20)) >>> 2]
                view[i + 6] = HEAPF32[(value + (4 * i + 24)) >>> 2]
                view[i + 7] = HEAPF32[(value + (4 * i + 28)) >>> 2]
                view[i + 8] = HEAPF32[(value + (4 * i + 32)) >>> 2]
            }
        } else {
            var view = HEAPF32.subarray(value >>> 2, (value + count * 36) >>> 2)
        }
        GLctx.uniformMatrix3fv(GL.uniforms[location], !!transpose, view)
    }
    function _emscripten_glUniformMatrix4fv(location, count, transpose, value) {
        if (count <= 18) {
            var view = miniTempWebGLFloatBuffers[16 * count - 1]
            var heap = HEAPF32
            value >>= 2
            for (var i = 0; i < 16 * count; i += 16) {
                var dst = value + i
                view[i] = heap[dst >>> 0]
                view[i + 1] = heap[(dst + 1) >>> 0]
                view[i + 2] = heap[(dst + 2) >>> 0]
                view[i + 3] = heap[(dst + 3) >>> 0]
                view[i + 4] = heap[(dst + 4) >>> 0]
                view[i + 5] = heap[(dst + 5) >>> 0]
                view[i + 6] = heap[(dst + 6) >>> 0]
                view[i + 7] = heap[(dst + 7) >>> 0]
                view[i + 8] = heap[(dst + 8) >>> 0]
                view[i + 9] = heap[(dst + 9) >>> 0]
                view[i + 10] = heap[(dst + 10) >>> 0]
                view[i + 11] = heap[(dst + 11) >>> 0]
                view[i + 12] = heap[(dst + 12) >>> 0]
                view[i + 13] = heap[(dst + 13) >>> 0]
                view[i + 14] = heap[(dst + 14) >>> 0]
                view[i + 15] = heap[(dst + 15) >>> 0]
            }
        } else {
            var view = HEAPF32.subarray(value >>> 2, (value + count * 64) >>> 2)
        }
        GLctx.uniformMatrix4fv(GL.uniforms[location], !!transpose, view)
    }
    function _emscripten_glUseProgram(program) {
        GLctx.useProgram(GL.programs[program])
    }
    function _emscripten_glValidateProgram(program) {
        GLctx.validateProgram(GL.programs[program])
    }
    function _emscripten_glVertexAttrib1f(x0, x1) {
        GLctx['vertexAttrib1f'](x0, x1)
    }
    function _emscripten_glVertexAttrib1fv(index, v) {
        GLctx.vertexAttrib1f(index, HEAPF32[v >>> 2])
    }
    function _emscripten_glVertexAttrib2f(x0, x1, x2) {
        GLctx['vertexAttrib2f'](x0, x1, x2)
    }
    function _emscripten_glVertexAttrib2fv(index, v) {
        GLctx.vertexAttrib2f(index, HEAPF32[v >>> 2], HEAPF32[(v + 4) >>> 2])
    }
    function _emscripten_glVertexAttrib3f(x0, x1, x2, x3) {
        GLctx['vertexAttrib3f'](x0, x1, x2, x3)
    }
    function _emscripten_glVertexAttrib3fv(index, v) {
        GLctx.vertexAttrib3f(index, HEAPF32[v >>> 2], HEAPF32[(v + 4) >>> 2], HEAPF32[(v + 8) >>> 2])
    }
    function _emscripten_glVertexAttrib4f(x0, x1, x2, x3, x4) {
        GLctx['vertexAttrib4f'](x0, x1, x2, x3, x4)
    }
    function _emscripten_glVertexAttrib4fv(index, v) {
        GLctx.vertexAttrib4f(
            index,
            HEAPF32[v >>> 2],
            HEAPF32[(v + 4) >>> 2],
            HEAPF32[(v + 8) >>> 2],
            HEAPF32[(v + 12) >>> 2]
        )
    }
    function _emscripten_glVertexAttribDivisorANGLE(index, divisor) {
        GLctx['vertexAttribDivisor'](index, divisor)
    }
    function _emscripten_glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
        GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr)
    }
    function _emscripten_glViewport(x0, x1, x2, x3) {
        GLctx['viewport'](x0, x1, x2, x3)
    }
    function _longjmp(env, value) {
        _setThrew(env, value || 1)
        throw 'longjmp'
    }
    function _emscripten_longjmp(a0, a1) {
        return _longjmp(a0, a1)
    }
    function _emscripten_memcpy_big(dest, src, num) {
        HEAPU8.copyWithin(dest >>> 0, src >>> 0, (src + num) >>> 0)
    }
    function _emscripten_get_heap_size() {
        return HEAPU8.length
    }
    function emscripten_realloc_buffer(size) {
        try {
            wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16)
            updateGlobalBufferAndViews(wasmMemory.buffer)
            return 1
        } catch (e) {}
    }
    function _emscripten_resize_heap(requestedSize) {
        requestedSize = requestedSize >>> 0
        var oldSize = _emscripten_get_heap_size()
        var maxHeapSize = 4294967296
        if (requestedSize > maxHeapSize) {
            return false
        }
        var minHeapSize = 16777216
        for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
            var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown)
            overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296)
            var newSize = Math.min(maxHeapSize, alignUp(Math.max(minHeapSize, requestedSize, overGrownHeapSize), 65536))
            var replacement = emscripten_realloc_buffer(newSize)
            if (replacement) {
                return true
            }
        }
        return false
    }
    var JSEvents = {
        inEventHandler: 0,
        removeAllEventListeners: function () {
            for (var i = JSEvents.eventHandlers.length - 1; i >= 0; --i) {
                JSEvents._removeHandler(i)
            }
            JSEvents.eventHandlers = []
            JSEvents.deferredCalls = []
        },
        registerRemoveEventListeners: function () {
            if (!JSEvents.removeEventListenersRegistered) {
                __ATEXIT__.push(JSEvents.removeAllEventListeners)
                JSEvents.removeEventListenersRegistered = true
            }
        },
        deferredCalls: [],
        deferCall: function (targetFunction, precedence, argsList) {
            function arraysHaveEqualContent(arrA, arrB) {
                if (arrA.length != arrB.length) return false
                for (var i in arrA) {
                    if (arrA[i] != arrB[i]) return false
                }
                return true
            }
            for (var i in JSEvents.deferredCalls) {
                var call = JSEvents.deferredCalls[i]
                if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
                    return
                }
            }
            JSEvents.deferredCalls.push({ targetFunction: targetFunction, precedence: precedence, argsList: argsList })
            JSEvents.deferredCalls.sort(function (x, y) {
                return x.precedence < y.precedence
            })
        },
        removeDeferredCalls: function (targetFunction) {
            for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
                if (JSEvents.deferredCalls[i].targetFunction == targetFunction) {
                    JSEvents.deferredCalls.splice(i, 1)
                    --i
                }
            }
        },
        canPerformEventHandlerRequests: function () {
            return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls
        },
        runDeferredCalls: function () {
            if (!JSEvents.canPerformEventHandlerRequests()) {
                return
            }
            for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
                var call = JSEvents.deferredCalls[i]
                JSEvents.deferredCalls.splice(i, 1)
                --i
                call.targetFunction.apply(null, call.argsList)
            }
        },
        eventHandlers: [],
        removeAllHandlersOnTarget: function (target, eventTypeString) {
            for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
                if (
                    JSEvents.eventHandlers[i].target == target &&
                    (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)
                ) {
                    JSEvents._removeHandler(i--)
                }
            }
        },
        _removeHandler: function (i) {
            var h = JSEvents.eventHandlers[i]
            h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture)
            JSEvents.eventHandlers.splice(i, 1)
        },
        registerOrRemoveHandler: function (eventHandler) {
            var jsEventHandler = function jsEventHandler(event) {
                ++JSEvents.inEventHandler
                JSEvents.currentEventHandler = eventHandler
                JSEvents.runDeferredCalls()
                eventHandler.handlerFunc(event)
                JSEvents.runDeferredCalls()
                --JSEvents.inEventHandler
            }
            if (eventHandler.callbackfunc) {
                eventHandler.eventListenerFunc = jsEventHandler
                eventHandler.target.addEventListener(
                    eventHandler.eventTypeString,
                    jsEventHandler,
                    eventHandler.useCapture
                )
                JSEvents.eventHandlers.push(eventHandler)
                JSEvents.registerRemoveEventListeners()
            } else {
                for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
                    if (
                        JSEvents.eventHandlers[i].target == eventHandler.target &&
                        JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString
                    ) {
                        JSEvents._removeHandler(i--)
                    }
                }
            }
        },
        getNodeNameForTarget: function (target) {
            if (!target) return ''
            if (target == window) return '#window'
            if (target == screen) return '#screen'
            return target && target.nodeName ? target.nodeName : ''
        },
        fullscreenEnabled: function () {
            return document.fullscreenEnabled || document.webkitFullscreenEnabled
        }
    }
    var __emscripten_webgl_power_preferences = ['default', 'low-power', 'high-performance']
    function maybeCStringToJsString(cString) {
        return cString > 2 ? UTF8ToString(cString) : cString
    }
    var specialHTMLTargets = [
        0,
        typeof document !== 'undefined' ? document : 0,
        typeof window !== 'undefined' ? window : 0
    ]
    function findEventTarget(target) {
        target = maybeCStringToJsString(target)
        var domElement =
            specialHTMLTargets[target] || (typeof document !== 'undefined' ? document.querySelector(target) : undefined)
        return domElement
    }
    function findCanvasEventTarget(target) {
        return findEventTarget(target)
    }
    function _emscripten_webgl_do_create_context(target, attributes) {
        var contextAttributes = {}
        var a = attributes >> 2
        contextAttributes['alpha'] = !!HEAP32[(a + (0 >> 2)) >>> 0]
        contextAttributes['depth'] = !!HEAP32[(a + (4 >> 2)) >>> 0]
        contextAttributes['stencil'] = !!HEAP32[(a + (8 >> 2)) >>> 0]
        contextAttributes['antialias'] = !!HEAP32[(a + (12 >> 2)) >>> 0]
        contextAttributes['premultipliedAlpha'] = !!HEAP32[(a + (16 >> 2)) >>> 0]
        contextAttributes['preserveDrawingBuffer'] = !!HEAP32[(a + (20 >> 2)) >>> 0]
        var powerPreference = HEAP32[(a + (24 >> 2)) >>> 0]
        contextAttributes['powerPreference'] = __emscripten_webgl_power_preferences[powerPreference]
        contextAttributes['failIfMajorPerformanceCaveat'] = !!HEAP32[(a + (28 >> 2)) >>> 0]
        contextAttributes.majorVersion = HEAP32[(a + (32 >> 2)) >>> 0]
        contextAttributes.minorVersion = HEAP32[(a + (36 >> 2)) >>> 0]
        contextAttributes.enableExtensionsByDefault = HEAP32[(a + (40 >> 2)) >>> 0]
        contextAttributes.explicitSwapControl = HEAP32[(a + (44 >> 2)) >>> 0]
        contextAttributes.proxyContextToMainThread = HEAP32[(a + (48 >> 2)) >>> 0]
        contextAttributes.renderViaOffscreenBackBuffer = HEAP32[(a + (52 >> 2)) >>> 0]
        var canvas = findCanvasEventTarget(target)
        if (!canvas) {
            return 0
        }
        if (contextAttributes.explicitSwapControl) {
            return 0
        }
        var contextHandle = GL.createContext(canvas, contextAttributes)
        return contextHandle
    }
    function _emscripten_webgl_create_context(a0, a1) {
        return _emscripten_webgl_do_create_context(a0, a1)
    }
    function _emscripten_webgl_do_get_current_context() {
        return GL.currentContext ? GL.currentContext.handle : 0
    }
    function _emscripten_webgl_get_current_context() {
        return _emscripten_webgl_do_get_current_context()
    }
    Module['_emscripten_webgl_get_current_context'] = _emscripten_webgl_get_current_context
    function _emscripten_webgl_make_context_current(contextHandle) {
        var success = GL.makeContextCurrent(contextHandle)
        return success ? 0 : -5
    }
    Module['_emscripten_webgl_make_context_current'] = _emscripten_webgl_make_context_current
    function _emscripten_webgl_destroy_context(contextHandle) {
        if (GL.currentContext == contextHandle) GL.currentContext = 0
        GL.deleteContext(contextHandle)
    }
    function _emscripten_webgl_enable_extension(contextHandle, extension) {
        var context = GL.getContext(contextHandle)
        var extString = UTF8ToString(extension)
        if (extString.indexOf('GL_') == 0) extString = extString.substr(3)
        if (extString == 'ANGLE_instanced_arrays') __webgl_enable_ANGLE_instanced_arrays(GLctx)
        if (extString == 'OES_vertex_array_object') __webgl_enable_OES_vertex_array_object(GLctx)
        if (extString == 'WEBGL_draw_buffers') __webgl_enable_WEBGL_draw_buffers(GLctx)
        if (extString == 'WEBGL_multi_draw') __webgl_enable_WEBGL_multi_draw(GLctx)
        var ext = context.GLctx.getExtension(extString)
        return !!ext
    }
    function _emscripten_webgl_init_context_attributes(attributes) {
        var a = attributes >> 2
        for (var i = 0; i < 56 >> 2; ++i) {
            HEAP32[(a + i) >>> 0] = 0
        }
        HEAP32[(a + (0 >> 2)) >>> 0] =
            HEAP32[(a + (4 >> 2)) >>> 0] =
            HEAP32[(a + (12 >> 2)) >>> 0] =
            HEAP32[(a + (16 >> 2)) >>> 0] =
            HEAP32[(a + (32 >> 2)) >>> 0] =
            HEAP32[(a + (40 >> 2)) >>> 0] =
                1
    }
    var ENV = {}
    function getExecutableName() {
        return thisProgram || './this.program'
    }
    function getEnvStrings() {
        if (!getEnvStrings.strings) {
            var lang =
                ((typeof navigator === 'object' && navigator.languages && navigator.languages[0]) || 'C').replace(
                    '-',
                    '_'
                ) + '.UTF-8'
            var env = {
                USER: 'web_user',
                LOGNAME: 'web_user',
                PATH: '/',
                PWD: '/',
                HOME: '/home/web_user',
                LANG: lang,
                _: getExecutableName()
            }
            for (var x in ENV) {
                env[x] = ENV[x]
            }
            var strings = []
            for (var x in env) {
                strings.push(x + '=' + env[x])
            }
            getEnvStrings.strings = strings
        }
        return getEnvStrings.strings
    }
    function _environ_get(__environ, environ_buf) {
        var bufSize = 0
        getEnvStrings().forEach(function (string, i) {
            var ptr = environ_buf + bufSize
            HEAP32[(__environ + i * 4) >>> 2] = ptr
            writeAsciiToMemory(string, ptr)
            bufSize += string.length + 1
        })
        return 0
    }
    function _environ_sizes_get(penviron_count, penviron_buf_size) {
        var strings = getEnvStrings()
        HEAP32[penviron_count >>> 2] = strings.length
        var bufSize = 0
        strings.forEach(function (string) {
            bufSize += string.length + 1
        })
        HEAP32[penviron_buf_size >>> 2] = bufSize
        return 0
    }
    function _exit(status) {
        exit(status)
    }
    function _fd_close(fd) {
        try {
            var stream = SYSCALLS.getStreamFromFD(fd)
            FS.close(stream)
            return 0
        } catch (e) {
            if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
            return e.errno
        }
    }
    function _fd_read(fd, iov, iovcnt, pnum) {
        try {
            var stream = SYSCALLS.getStreamFromFD(fd)
            var num = SYSCALLS.doReadv(stream, iov, iovcnt)
            HEAP32[pnum >>> 2] = num
            return 0
        } catch (e) {
            if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
            return e.errno
        }
    }
    function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
        try {
            var stream = SYSCALLS.getStreamFromFD(fd)
            var HIGH_OFFSET = 4294967296
            var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0)
            var DOUBLE_LIMIT = 9007199254740992
            if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
                return -61
            }
            FS.llseek(stream, offset, whence)
            ;(tempI64 = [
                stream.position >>> 0,
                ((tempDouble = stream.position),
                +Math.abs(tempDouble) >= 1
                    ? tempDouble > 0
                        ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
                        : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
                    : 0)
            ]),
                (HEAP32[newOffset >>> 2] = tempI64[0]),
                (HEAP32[(newOffset + 4) >>> 2] = tempI64[1])
            if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null
            return 0
        } catch (e) {
            if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
            return e.errno
        }
    }
    function _fd_write(fd, iov, iovcnt, pnum) {
        try {
            var stream = SYSCALLS.getStreamFromFD(fd)
            var num = SYSCALLS.doWritev(stream, iov, iovcnt)
            HEAP32[pnum >>> 2] = num
            return 0
        } catch (e) {
            if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e)
            return e.errno
        }
    }
    function _getTempRet0() {
        return getTempRet0() | 0
    }
    function _getpwuid() {
        throw 'getpwuid: TODO'
    }
    function _gettimeofday(ptr) {
        var now = Date.now()
        HEAP32[ptr >>> 2] = (now / 1e3) | 0
        HEAP32[(ptr + 4) >>> 2] = ((now % 1e3) * 1e3) | 0
        return 0
    }
    function _glActiveTexture(x0) {
        GLctx['activeTexture'](x0)
    }
    function _glAttachShader(program, shader) {
        GLctx.attachShader(GL.programs[program], GL.shaders[shader])
    }
    function _glBindAttribLocation(program, index, name) {
        GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name))
    }
    function _glBindBuffer(target, buffer) {
        GLctx.bindBuffer(target, GL.buffers[buffer])
    }
    function _glBindFramebuffer(target, framebuffer) {
        GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer])
    }
    function _glBindRenderbuffer(target, renderbuffer) {
        GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer])
    }
    function _glBindTexture(target, texture) {
        GLctx.bindTexture(target, GL.textures[texture])
    }
    function _glBlendColor(x0, x1, x2, x3) {
        GLctx['blendColor'](x0, x1, x2, x3)
    }
    function _glBlendEquation(x0) {
        GLctx['blendEquation'](x0)
    }
    function _glBlendEquationSeparate(x0, x1) {
        GLctx['blendEquationSeparate'](x0, x1)
    }
    function _glBlendFunc(x0, x1) {
        GLctx['blendFunc'](x0, x1)
    }
    function _glBlendFuncSeparate(x0, x1, x2, x3) {
        GLctx['blendFuncSeparate'](x0, x1, x2, x3)
    }
    function _glBufferData(target, size, data, usage) {
        GLctx.bufferData(target, data ? HEAPU8.subarray(data >>> 0, (data + size) >>> 0) : size, usage)
    }
    function _glBufferSubData(target, offset, size, data) {
        GLctx.bufferSubData(target, offset, HEAPU8.subarray(data >>> 0, (data + size) >>> 0))
    }
    function _glCheckFramebufferStatus(x0) {
        return GLctx['checkFramebufferStatus'](x0)
    }
    function _glClear(x0) {
        GLctx['clear'](x0)
    }
    function _glClearColor(x0, x1, x2, x3) {
        GLctx['clearColor'](x0, x1, x2, x3)
    }
    function _glClearDepthf(x0) {
        GLctx['clearDepth'](x0)
    }
    function _glClearStencil(x0) {
        GLctx['clearStencil'](x0)
    }
    function _glColorMask(red, green, blue, alpha) {
        GLctx.colorMask(!!red, !!green, !!blue, !!alpha)
    }
    function _glCompileShader(shader) {
        GLctx.compileShader(GL.shaders[shader])
    }
    function _glCreateProgram() {
        var id = GL.getNewId(GL.programs)
        var program = GLctx.createProgram()
        program.name = id
        GL.programs[id] = program
        return id
    }
    function _glCreateShader(shaderType) {
        var id = GL.getNewId(GL.shaders)
        GL.shaders[id] = GLctx.createShader(shaderType)
        return id
    }
    function _glCullFace(x0) {
        GLctx['cullFace'](x0)
    }
    function _glDeleteBuffers(n, buffers) {
        for (var i = 0; i < n; i++) {
            var id = HEAP32[(buffers + i * 4) >>> 2]
            var buffer = GL.buffers[id]
            if (!buffer) continue
            GLctx.deleteBuffer(buffer)
            buffer.name = 0
            GL.buffers[id] = null
        }
    }
    function _glDeleteFramebuffers(n, framebuffers) {
        for (var i = 0; i < n; ++i) {
            var id = HEAP32[(framebuffers + i * 4) >>> 2]
            var framebuffer = GL.framebuffers[id]
            if (!framebuffer) continue
            GLctx.deleteFramebuffer(framebuffer)
            framebuffer.name = 0
            GL.framebuffers[id] = null
        }
    }
    function _glDeleteProgram(id) {
        if (!id) return
        var program = GL.programs[id]
        if (!program) {
            GL.recordError(1281)
            return
        }
        GLctx.deleteProgram(program)
        program.name = 0
        GL.programs[id] = null
        GL.programInfos[id] = null
    }
    function _glDeleteRenderbuffers(n, renderbuffers) {
        for (var i = 0; i < n; i++) {
            var id = HEAP32[(renderbuffers + i * 4) >>> 2]
            var renderbuffer = GL.renderbuffers[id]
            if (!renderbuffer) continue
            GLctx.deleteRenderbuffer(renderbuffer)
            renderbuffer.name = 0
            GL.renderbuffers[id] = null
        }
    }
    function _glDeleteShader(id) {
        if (!id) return
        var shader = GL.shaders[id]
        if (!shader) {
            GL.recordError(1281)
            return
        }
        GLctx.deleteShader(shader)
        GL.shaders[id] = null
    }
    function _glDeleteTextures(n, textures) {
        for (var i = 0; i < n; i++) {
            var id = HEAP32[(textures + i * 4) >>> 2]
            var texture = GL.textures[id]
            if (!texture) continue
            GLctx.deleteTexture(texture)
            texture.name = 0
            GL.textures[id] = null
        }
    }
    function _glDepthFunc(x0) {
        GLctx['depthFunc'](x0)
    }
    function _glDepthMask(flag) {
        GLctx.depthMask(!!flag)
    }
    function _glDepthRangef(x0, x1) {
        GLctx['depthRange'](x0, x1)
    }
    function _glDisable(x0) {
        GLctx['disable'](x0)
    }
    function _glDisableVertexAttribArray(index) {
        GLctx.disableVertexAttribArray(index)
    }
    function _glDrawArrays(mode, first, count) {
        GLctx.drawArrays(mode, first, count)
    }
    function _glDrawElements(mode, count, type, indices) {
        GLctx.drawElements(mode, count, type, indices)
    }
    function _glEnable(x0) {
        GLctx['enable'](x0)
    }
    function _glEnableVertexAttribArray(index) {
        GLctx.enableVertexAttribArray(index)
    }
    function _glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
        GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer])
    }
    function _glFramebufferTexture2D(target, attachment, textarget, texture, level) {
        GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level)
    }
    function _glGenBuffers(n, buffers) {
        __glGenObject(n, buffers, 'createBuffer', GL.buffers)
    }
    function _glGenFramebuffers(n, ids) {
        __glGenObject(n, ids, 'createFramebuffer', GL.framebuffers)
    }
    function _glGenRenderbuffers(n, renderbuffers) {
        __glGenObject(n, renderbuffers, 'createRenderbuffer', GL.renderbuffers)
    }
    function _glGenTextures(n, textures) {
        __glGenObject(n, textures, 'createTexture', GL.textures)
    }
    function _glGetAttribLocation(program, name) {
        return GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name))
    }
    function _glGetError() {
        var error = GLctx.getError() || GL.lastError
        GL.lastError = 0
        return error
    }
    function _glGetFloatv(name_, p) {
        emscriptenWebGLGet(name_, p, 2)
    }
    function _glGetIntegerv(name_, p) {
        emscriptenWebGLGet(name_, p, 0)
    }
    function _glGetProgramInfoLog(program, maxLength, length, infoLog) {
        var log = GLctx.getProgramInfoLog(GL.programs[program])
        if (log === null) log = '(unknown error)'
        var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0
        if (length) HEAP32[length >>> 2] = numBytesWrittenExclNull
    }
    function _glGetProgramiv(program, pname, p) {
        if (!p) {
            GL.recordError(1281)
            return
        }
        if (program >= GL.counter) {
            GL.recordError(1281)
            return
        }
        var ptable = GL.programInfos[program]
        if (!ptable) {
            GL.recordError(1282)
            return
        }
        if (pname == 35716) {
            var log = GLctx.getProgramInfoLog(GL.programs[program])
            if (log === null) log = '(unknown error)'
            HEAP32[p >>> 2] = log.length + 1
        } else if (pname == 35719) {
            HEAP32[p >>> 2] = ptable.maxUniformLength
        } else if (pname == 35722) {
            if (ptable.maxAttributeLength == -1) {
                program = GL.programs[program]
                var numAttribs = GLctx.getProgramParameter(program, 35721)
                ptable.maxAttributeLength = 0
                for (var i = 0; i < numAttribs; ++i) {
                    var activeAttrib = GLctx.getActiveAttrib(program, i)
                    ptable.maxAttributeLength = Math.max(ptable.maxAttributeLength, activeAttrib.name.length + 1)
                }
            }
            HEAP32[p >>> 2] = ptable.maxAttributeLength
        } else if (pname == 35381) {
            if (ptable.maxUniformBlockNameLength == -1) {
                program = GL.programs[program]
                var numBlocks = GLctx.getProgramParameter(program, 35382)
                ptable.maxUniformBlockNameLength = 0
                for (var i = 0; i < numBlocks; ++i) {
                    var activeBlockName = GLctx.getActiveUniformBlockName(program, i)
                    ptable.maxUniformBlockNameLength = Math.max(
                        ptable.maxUniformBlockNameLength,
                        activeBlockName.length + 1
                    )
                }
            }
            HEAP32[p >>> 2] = ptable.maxUniformBlockNameLength
        } else {
            HEAP32[p >>> 2] = GLctx.getProgramParameter(GL.programs[program], pname)
        }
    }
    function _glGetShaderInfoLog(shader, maxLength, length, infoLog) {
        var log = GLctx.getShaderInfoLog(GL.shaders[shader])
        if (log === null) log = '(unknown error)'
        var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0
        if (length) HEAP32[length >>> 2] = numBytesWrittenExclNull
    }
    function _glGetShaderiv(shader, pname, p) {
        if (!p) {
            GL.recordError(1281)
            return
        }
        if (pname == 35716) {
            var log = GLctx.getShaderInfoLog(GL.shaders[shader])
            if (log === null) log = '(unknown error)'
            var logLength = log ? log.length + 1 : 0
            HEAP32[p >>> 2] = logLength
        } else if (pname == 35720) {
            var source = GLctx.getShaderSource(GL.shaders[shader])
            var sourceLength = source ? source.length + 1 : 0
            HEAP32[p >>> 2] = sourceLength
        } else {
            HEAP32[p >>> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname)
        }
    }
    function _glGetString(name_) {
        if (GL.stringCache[name_]) return GL.stringCache[name_]
        var ret
        switch (name_) {
            case 7939:
                var exts = GLctx.getSupportedExtensions() || []
                exts = exts.concat(
                    exts.map(function (e) {
                        return 'GL_' + e
                    })
                )
                ret = stringToNewUTF8(exts.join(' '))
                break
            case 7936:
            case 7937:
            case 37445:
            case 37446:
                var s = GLctx.getParameter(name_)
                if (!s) {
                    GL.recordError(1280)
                }
                ret = stringToNewUTF8(s)
                break
            case 7938:
                var glVersion = GLctx.getParameter(7938)
                {
                    glVersion = 'OpenGL ES 2.0 (' + glVersion + ')'
                }
                ret = stringToNewUTF8(glVersion)
                break
            case 35724:
                var glslVersion = GLctx.getParameter(35724)
                var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/
                var ver_num = glslVersion.match(ver_re)
                if (ver_num !== null) {
                    if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + '0'
                    glslVersion = 'OpenGL ES GLSL ES ' + ver_num[1] + ' (' + glslVersion + ')'
                }
                ret = stringToNewUTF8(glslVersion)
                break
            default:
                GL.recordError(1280)
                return 0
        }
        GL.stringCache[name_] = ret
        return ret
    }
    function _glGetUniformLocation(program, name) {
        name = UTF8ToString(name)
        var arrayIndex = 0
        if (name[name.length - 1] == ']') {
            var leftBrace = name.lastIndexOf('[')
            arrayIndex = name[leftBrace + 1] != ']' ? jstoi_q(name.slice(leftBrace + 1)) : 0
            name = name.slice(0, leftBrace)
        }
        var uniformInfo = GL.programInfos[program] && GL.programInfos[program].uniforms[name]
        if (uniformInfo && arrayIndex >= 0 && arrayIndex < uniformInfo[0]) {
            return uniformInfo[1] + arrayIndex
        } else {
            return -1
        }
    }
    function _glHint(x0, x1) {
        GLctx['hint'](x0, x1)
    }
    function _glLineWidth(x0) {
        GLctx['lineWidth'](x0)
    }
    function _glLinkProgram(program) {
        GLctx.linkProgram(GL.programs[program])
        GL.populateUniformTable(program)
    }
    function _glPixelStorei(pname, param) {
        if (pname == 3317) {
            GL.unpackAlignment = param
        }
        GLctx.pixelStorei(pname, param)
    }
    function _glPolygonOffset(x0, x1) {
        GLctx['polygonOffset'](x0, x1)
    }
    function _glReadPixels(x, y, width, height, format, type, pixels) {
        var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format)
        if (!pixelData) {
            GL.recordError(1280)
            return
        }
        GLctx.readPixels(x, y, width, height, format, type, pixelData)
    }
    function _glRenderbufferStorage(x0, x1, x2, x3) {
        GLctx['renderbufferStorage'](x0, x1, x2, x3)
    }
    function _glScissor(x0, x1, x2, x3) {
        GLctx['scissor'](x0, x1, x2, x3)
    }
    function _glShaderSource(shader, count, string, length) {
        var source = GL.getSource(shader, count, string, length)
        GLctx.shaderSource(GL.shaders[shader], source)
    }
    function _glStencilFunc(x0, x1, x2) {
        GLctx['stencilFunc'](x0, x1, x2)
    }
    function _glStencilMask(x0) {
        GLctx['stencilMask'](x0)
    }
    function _glStencilOp(x0, x1, x2) {
        GLctx['stencilOp'](x0, x1, x2)
    }
    function _glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
        GLctx.texImage2D(
            target,
            level,
            internalFormat,
            width,
            height,
            border,
            format,
            type,
            pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null
        )
    }
    function _glTexParameterfv(target, pname, params) {
        var param = HEAPF32[params >>> 2]
        GLctx.texParameterf(target, pname, param)
    }
    function _glTexParameteri(x0, x1, x2) {
        GLctx['texParameteri'](x0, x1, x2)
    }
    function _glUniform1f(location, v0) {
        GLctx.uniform1f(GL.uniforms[location], v0)
    }
    function _glUniform1fv(location, count, value) {
        if (count <= 288) {
            var view = miniTempWebGLFloatBuffers[count - 1]
            for (var i = 0; i < count; ++i) {
                view[i] = HEAPF32[(value + 4 * i) >>> 2]
            }
        } else {
            var view = HEAPF32.subarray(value >>> 2, (value + count * 4) >>> 2)
        }
        GLctx.uniform1fv(GL.uniforms[location], view)
    }
    function _glUniform1i(location, v0) {
        GLctx.uniform1i(GL.uniforms[location], v0)
    }
    function _glUniform1iv(location, count, value) {
        if (count <= 288) {
            var view = __miniTempWebGLIntBuffers[count - 1]
            for (var i = 0; i < count; ++i) {
                view[i] = HEAP32[(value + 4 * i) >>> 2]
            }
        } else {
            var view = HEAP32.subarray(value >>> 2, (value + count * 4) >>> 2)
        }
        GLctx.uniform1iv(GL.uniforms[location], view)
    }
    function _glUniform2f(location, v0, v1) {
        GLctx.uniform2f(GL.uniforms[location], v0, v1)
    }
    function _glUniform2fv(location, count, value) {
        if (count <= 144) {
            var view = miniTempWebGLFloatBuffers[2 * count - 1]
            for (var i = 0; i < 2 * count; i += 2) {
                view[i] = HEAPF32[(value + 4 * i) >>> 2]
                view[i + 1] = HEAPF32[(value + (4 * i + 4)) >>> 2]
            }
        } else {
            var view = HEAPF32.subarray(value >>> 2, (value + count * 8) >>> 2)
        }
        GLctx.uniform2fv(GL.uniforms[location], view)
    }
    function _glUniform3f(location, v0, v1, v2) {
        GLctx.uniform3f(GL.uniforms[location], v0, v1, v2)
    }
    function _glUniform3fv(location, count, value) {
        if (count <= 96) {
            var view = miniTempWebGLFloatBuffers[3 * count - 1]
            for (var i = 0; i < 3 * count; i += 3) {
                view[i] = HEAPF32[(value + 4 * i) >>> 2]
                view[i + 1] = HEAPF32[(value + (4 * i + 4)) >>> 2]
                view[i + 2] = HEAPF32[(value + (4 * i + 8)) >>> 2]
            }
        } else {
            var view = HEAPF32.subarray(value >>> 2, (value + count * 12) >>> 2)
        }
        GLctx.uniform3fv(GL.uniforms[location], view)
    }
    function _glUniform4f(location, v0, v1, v2, v3) {
        GLctx.uniform4f(GL.uniforms[location], v0, v1, v2, v3)
    }
    function _glUniform4fv(location, count, value) {
        if (count <= 72) {
            var view = miniTempWebGLFloatBuffers[4 * count - 1]
            var heap = HEAPF32
            value >>= 2
            for (var i = 0; i < 4 * count; i += 4) {
                var dst = value + i
                view[i] = heap[dst >>> 0]
                view[i + 1] = heap[(dst + 1) >>> 0]
                view[i + 2] = heap[(dst + 2) >>> 0]
                view[i + 3] = heap[(dst + 3) >>> 0]
            }
        } else {
            var view = HEAPF32.subarray(value >>> 2, (value + count * 16) >>> 2)
        }
        GLctx.uniform4fv(GL.uniforms[location], view)
    }
    function _glUniform4iv(location, count, value) {
        if (count <= 72) {
            var view = __miniTempWebGLIntBuffers[4 * count - 1]
            for (var i = 0; i < 4 * count; i += 4) {
                view[i] = HEAP32[(value + 4 * i) >>> 2]
                view[i + 1] = HEAP32[(value + (4 * i + 4)) >>> 2]
                view[i + 2] = HEAP32[(value + (4 * i + 8)) >>> 2]
                view[i + 3] = HEAP32[(value + (4 * i + 12)) >>> 2]
            }
        } else {
            var view = HEAP32.subarray(value >>> 2, (value + count * 16) >>> 2)
        }
        GLctx.uniform4iv(GL.uniforms[location], view)
    }
    function _glUniformMatrix3fv(location, count, transpose, value) {
        if (count <= 32) {
            var view = miniTempWebGLFloatBuffers[9 * count - 1]
            for (var i = 0; i < 9 * count; i += 9) {
                view[i] = HEAPF32[(value + 4 * i) >>> 2]
                view[i + 1] = HEAPF32[(value + (4 * i + 4)) >>> 2]
                view[i + 2] = HEAPF32[(value + (4 * i + 8)) >>> 2]
                view[i + 3] = HEAPF32[(value + (4 * i + 12)) >>> 2]
                view[i + 4] = HEAPF32[(value + (4 * i + 16)) >>> 2]
                view[i + 5] = HEAPF32[(value + (4 * i + 20)) >>> 2]
                view[i + 6] = HEAPF32[(value + (4 * i + 24)) >>> 2]
                view[i + 7] = HEAPF32[(value + (4 * i + 28)) >>> 2]
                view[i + 8] = HEAPF32[(value + (4 * i + 32)) >>> 2]
            }
        } else {
            var view = HEAPF32.subarray(value >>> 2, (value + count * 36) >>> 2)
        }
        GLctx.uniformMatrix3fv(GL.uniforms[location], !!transpose, view)
    }
    function _glUniformMatrix4fv(location, count, transpose, value) {
        if (count <= 18) {
            var view = miniTempWebGLFloatBuffers[16 * count - 1]
            var heap = HEAPF32
            value >>= 2
            for (var i = 0; i < 16 * count; i += 16) {
                var dst = value + i
                view[i] = heap[dst >>> 0]
                view[i + 1] = heap[(dst + 1) >>> 0]
                view[i + 2] = heap[(dst + 2) >>> 0]
                view[i + 3] = heap[(dst + 3) >>> 0]
                view[i + 4] = heap[(dst + 4) >>> 0]
                view[i + 5] = heap[(dst + 5) >>> 0]
                view[i + 6] = heap[(dst + 6) >>> 0]
                view[i + 7] = heap[(dst + 7) >>> 0]
                view[i + 8] = heap[(dst + 8) >>> 0]
                view[i + 9] = heap[(dst + 9) >>> 0]
                view[i + 10] = heap[(dst + 10) >>> 0]
                view[i + 11] = heap[(dst + 11) >>> 0]
                view[i + 12] = heap[(dst + 12) >>> 0]
                view[i + 13] = heap[(dst + 13) >>> 0]
                view[i + 14] = heap[(dst + 14) >>> 0]
                view[i + 15] = heap[(dst + 15) >>> 0]
            }
        } else {
            var view = HEAPF32.subarray(value >>> 2, (value + count * 64) >>> 2)
        }
        GLctx.uniformMatrix4fv(GL.uniforms[location], !!transpose, view)
    }
    function _glUseProgram(program) {
        GLctx.useProgram(GL.programs[program])
    }
    function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
        GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr)
    }
    function _glViewport(x0, x1, x2, x3) {
        GLctx['viewport'](x0, x1, x2, x3)
    }
    function _pthread_mutexattr_destroy() {}
    function _pthread_mutexattr_init() {}
    function _pthread_mutexattr_settype() {}
    function _setTempRet0($i) {
        setTempRet0($i | 0)
    }
    function __isLeapYear(year) {
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
    }
    function __arraySum(array, index) {
        var sum = 0
        for (var i = 0; i <= index; sum += array[i++]) {}
        return sum
    }
    var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    function __addDays(date, days) {
        var newDate = new Date(date.getTime())
        while (days > 0) {
            var leap = __isLeapYear(newDate.getFullYear())
            var currentMonth = newDate.getMonth()
            var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth]
            if (days > daysInCurrentMonth - newDate.getDate()) {
                days -= daysInCurrentMonth - newDate.getDate() + 1
                newDate.setDate(1)
                if (currentMonth < 11) {
                    newDate.setMonth(currentMonth + 1)
                } else {
                    newDate.setMonth(0)
                    newDate.setFullYear(newDate.getFullYear() + 1)
                }
            } else {
                newDate.setDate(newDate.getDate() + days)
                return newDate
            }
        }
        return newDate
    }
    function _strftime(s, maxsize, format, tm) {
        var tm_zone = HEAP32[(tm + 40) >>> 2]
        var date = {
            tm_sec: HEAP32[tm >>> 2],
            tm_min: HEAP32[(tm + 4) >>> 2],
            tm_hour: HEAP32[(tm + 8) >>> 2],
            tm_mday: HEAP32[(tm + 12) >>> 2],
            tm_mon: HEAP32[(tm + 16) >>> 2],
            tm_year: HEAP32[(tm + 20) >>> 2],
            tm_wday: HEAP32[(tm + 24) >>> 2],
            tm_yday: HEAP32[(tm + 28) >>> 2],
            tm_isdst: HEAP32[(tm + 32) >>> 2],
            tm_gmtoff: HEAP32[(tm + 36) >>> 2],
            tm_zone: tm_zone ? UTF8ToString(tm_zone) : ''
        }
        var pattern = UTF8ToString(format)
        var EXPANSION_RULES_1 = {
            '%c': '%a %b %d %H:%M:%S %Y',
            '%D': '%m/%d/%y',
            '%F': '%Y-%m-%d',
            '%h': '%b',
            '%r': '%I:%M:%S %p',
            '%R': '%H:%M',
            '%T': '%H:%M:%S',
            '%x': '%m/%d/%y',
            '%X': '%H:%M:%S',
            '%Ec': '%c',
            '%EC': '%C',
            '%Ex': '%m/%d/%y',
            '%EX': '%H:%M:%S',
            '%Ey': '%y',
            '%EY': '%Y',
            '%Od': '%d',
            '%Oe': '%e',
            '%OH': '%H',
            '%OI': '%I',
            '%Om': '%m',
            '%OM': '%M',
            '%OS': '%S',
            '%Ou': '%u',
            '%OU': '%U',
            '%OV': '%V',
            '%Ow': '%w',
            '%OW': '%W',
            '%Oy': '%y'
        }
        for (var rule in EXPANSION_RULES_1) {
            pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule])
        }
        var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        var MONTHS = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ]
        function leadingSomething(value, digits, character) {
            var str = typeof value === 'number' ? value.toString() : value || ''
            while (str.length < digits) {
                str = character[0] + str
            }
            return str
        }
        function leadingNulls(value, digits) {
            return leadingSomething(value, digits, '0')
        }
        function compareByDay(date1, date2) {
            function sgn(value) {
                return value < 0 ? -1 : value > 0 ? 1 : 0
            }
            var compare
            if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
                if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
                    compare = sgn(date1.getDate() - date2.getDate())
                }
            }
            return compare
        }
        function getFirstWeekStartDate(janFourth) {
            switch (janFourth.getDay()) {
                case 0:
                    return new Date(janFourth.getFullYear() - 1, 11, 29)
                case 1:
                    return janFourth
                case 2:
                    return new Date(janFourth.getFullYear(), 0, 3)
                case 3:
                    return new Date(janFourth.getFullYear(), 0, 2)
                case 4:
                    return new Date(janFourth.getFullYear(), 0, 1)
                case 5:
                    return new Date(janFourth.getFullYear() - 1, 11, 31)
                case 6:
                    return new Date(janFourth.getFullYear() - 1, 11, 30)
            }
        }
        function getWeekBasedYear(date) {
            var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday)
            var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4)
            var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4)
            var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear)
            var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear)
            if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
                if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
                    return thisDate.getFullYear() + 1
                } else {
                    return thisDate.getFullYear()
                }
            } else {
                return thisDate.getFullYear() - 1
            }
        }
        var EXPANSION_RULES_2 = {
            '%a': function (date) {
                return WEEKDAYS[date.tm_wday].substring(0, 3)
            },
            '%A': function (date) {
                return WEEKDAYS[date.tm_wday]
            },
            '%b': function (date) {
                return MONTHS[date.tm_mon].substring(0, 3)
            },
            '%B': function (date) {
                return MONTHS[date.tm_mon]
            },
            '%C': function (date) {
                var year = date.tm_year + 1900
                return leadingNulls((year / 100) | 0, 2)
            },
            '%d': function (date) {
                return leadingNulls(date.tm_mday, 2)
            },
            '%e': function (date) {
                return leadingSomething(date.tm_mday, 2, ' ')
            },
            '%g': function (date) {
                return getWeekBasedYear(date).toString().substring(2)
            },
            '%G': function (date) {
                return getWeekBasedYear(date)
            },
            '%H': function (date) {
                return leadingNulls(date.tm_hour, 2)
            },
            '%I': function (date) {
                var twelveHour = date.tm_hour
                if (twelveHour == 0) twelveHour = 12
                else if (twelveHour > 12) twelveHour -= 12
                return leadingNulls(twelveHour, 2)
            },
            '%j': function (date) {
                return leadingNulls(
                    date.tm_mday +
                        __arraySum(
                            __isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR,
                            date.tm_mon - 1
                        ),
                    3
                )
            },
            '%m': function (date) {
                return leadingNulls(date.tm_mon + 1, 2)
            },
            '%M': function (date) {
                return leadingNulls(date.tm_min, 2)
            },
            '%n': function () {
                return '\n'
            },
            '%p': function (date) {
                if (date.tm_hour >= 0 && date.tm_hour < 12) {
                    return 'AM'
                } else {
                    return 'PM'
                }
            },
            '%S': function (date) {
                return leadingNulls(date.tm_sec, 2)
            },
            '%t': function () {
                return '\t'
            },
            '%u': function (date) {
                return date.tm_wday || 7
            },
            '%U': function (date) {
                var janFirst = new Date(date.tm_year + 1900, 0, 1)
                var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay())
                var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday)
                if (compareByDay(firstSunday, endDate) < 0) {
                    var februaryFirstUntilEndMonth =
                        __arraySum(
                            __isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR,
                            endDate.getMonth() - 1
                        ) - 31
                    var firstSundayUntilEndJanuary = 31 - firstSunday.getDate()
                    var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate()
                    return leadingNulls(Math.ceil(days / 7), 2)
                }
                return compareByDay(firstSunday, janFirst) === 0 ? '01' : '00'
            },
            '%V': function (date) {
                var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4)
                var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4)
                var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear)
                var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear)
                var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday)
                if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
                    return '53'
                }
                if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
                    return '01'
                }
                var daysDifference
                if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
                    daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate()
                } else {
                    daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate()
                }
                return leadingNulls(Math.ceil(daysDifference / 7), 2)
            },
            '%w': function (date) {
                return date.tm_wday
            },
            '%W': function (date) {
                var janFirst = new Date(date.tm_year, 0, 1)
                var firstMonday =
                    janFirst.getDay() === 1
                        ? janFirst
                        : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1)
                var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday)
                if (compareByDay(firstMonday, endDate) < 0) {
                    var februaryFirstUntilEndMonth =
                        __arraySum(
                            __isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR,
                            endDate.getMonth() - 1
                        ) - 31
                    var firstMondayUntilEndJanuary = 31 - firstMonday.getDate()
                    var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate()
                    return leadingNulls(Math.ceil(days / 7), 2)
                }
                return compareByDay(firstMonday, janFirst) === 0 ? '01' : '00'
            },
            '%y': function (date) {
                return (date.tm_year + 1900).toString().substring(2)
            },
            '%Y': function (date) {
                return date.tm_year + 1900
            },
            '%z': function (date) {
                var off = date.tm_gmtoff
                var ahead = off >= 0
                off = Math.abs(off) / 60
                off = (off / 60) * 100 + (off % 60)
                return (ahead ? '+' : '-') + String('0000' + off).slice(-4)
            },
            '%Z': function (date) {
                return date.tm_zone
            },
            '%%': function () {
                return '%'
            }
        }
        for (var rule in EXPANSION_RULES_2) {
            if (pattern.indexOf(rule) >= 0) {
                pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date))
            }
        }
        var bytes = intArrayFromString(pattern, false)
        if (bytes.length > maxsize) {
            return 0
        }
        writeArrayToMemory(bytes, s)
        return bytes.length - 1
    }
    function _strftime_l(s, maxsize, format, tm) {
        return _strftime(s, maxsize, format, tm)
    }
    function _time(ptr) {
        var ret = (Date.now() / 1e3) | 0
        if (ptr) {
            HEAP32[ptr >>> 2] = ret
        }
        return ret
    }
    function _usleep(useconds) {
        var start = _emscripten_get_now()
        while (_emscripten_get_now() - start < useconds / 1e3) {}
    }
    var readAsmConstArgsArray = []
    function readAsmConstArgs(sigPtr, buf) {
        readAsmConstArgsArray.length = 0
        var ch
        buf >>= 2
        while ((ch = HEAPU8[sigPtr++ >>> 0])) {
            var double = ch < 105
            if (double && buf & 1) buf++
            readAsmConstArgsArray.push(double ? HEAPF64[buf++ >>> 1] : HEAP32[buf >>> 0])
            ++buf
        }
        return readAsmConstArgsArray
    }
    var FSNode = function (parent, name, mode, rdev) {
        if (!parent) {
            parent = this
        }
        this.parent = parent
        this.mount = parent.mount
        this.mounted = null
        this.id = FS.nextInode++
        this.name = name
        this.mode = mode
        this.node_ops = {}
        this.stream_ops = {}
        this.rdev = rdev
    }
    var readMode = 292 | 73
    var writeMode = 146
    Object.defineProperties(FSNode.prototype, {
        read: {
            get: function () {
                return (this.mode & readMode) === readMode
            },
            set: function (val) {
                val ? (this.mode |= readMode) : (this.mode &= ~readMode)
            }
        },
        write: {
            get: function () {
                return (this.mode & writeMode) === writeMode
            },
            set: function (val) {
                val ? (this.mode |= writeMode) : (this.mode &= ~writeMode)
            }
        },
        isFolder: {
            get: function () {
                return FS.isDir(this.mode)
            }
        },
        isDevice: {
            get: function () {
                return FS.isChrdev(this.mode)
            }
        }
    })
    FS.FSNode = FSNode
    FS.staticInit()
    InternalError = Module['InternalError'] = extendError(Error, 'InternalError')
    embind_init_charCodes()
    BindingError = Module['BindingError'] = extendError(Error, 'BindingError')
    init_ClassHandle()
    init_RegisteredPointer()
    init_embind()
    UnboundTypeError = Module['UnboundTypeError'] = extendError(Error, 'UnboundTypeError')
    init_emval()
    Module['requestFullscreen'] = function Module_requestFullscreen(lockPointer, resizeCanvas) {
        Browser.requestFullscreen(lockPointer, resizeCanvas)
    }
    Module['requestAnimationFrame'] = function Module_requestAnimationFrame(func) {
        Browser.requestAnimationFrame(func)
    }
    Module['setCanvasSize'] = function Module_setCanvasSize(width, height, noUpdates) {
        Browser.setCanvasSize(width, height, noUpdates)
    }
    Module['pauseMainLoop'] = function Module_pauseMainLoop() {
        Browser.mainLoop.pause()
    }
    Module['resumeMainLoop'] = function Module_resumeMainLoop() {
        Browser.mainLoop.resume()
    }
    Module['getUserMedia'] = function Module_getUserMedia() {
        Browser.getUserMedia()
    }
    Module['createContext'] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
        return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes)
    }
    var GLctx
    for (var i = 0; i < 32; ++i) tempFixedLengthArray.push(new Array(i))
    var miniTempWebGLFloatBuffersStorage = new Float32Array(288)
    for (var i = 0; i < 288; ++i) {
        miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(0, i + 1)
    }
    var __miniTempWebGLIntBuffersStorage = new Int32Array(288)
    for (var i = 0; i < 288; ++i) {
        __miniTempWebGLIntBuffers[i] = __miniTempWebGLIntBuffersStorage.subarray(0, i + 1)
    }
    var ASSERTIONS = false
    function intArrayFromString(stringy, dontAddNull, length) {
        var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1
        var u8array = new Array(len)
        var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length)
        if (dontAddNull) u8array.length = numBytesWritten
        return u8array
    }
    __ATINIT__.push({
        func: function () {
            ___wasm_call_ctors()
        }
    })
    var asmLibraryArg = {
        __asctime_r: ___asctime_r,
        __cxa_allocate_exception: ___cxa_allocate_exception,
        __cxa_atexit: ___cxa_atexit,
        __cxa_rethrow: ___cxa_rethrow,
        __cxa_thread_atexit: ___cxa_thread_atexit,
        __cxa_throw: ___cxa_throw,
        __gmtime_r: ___gmtime_r,
        __localtime_r: ___localtime_r,
        __sys_access: ___sys_access,
        __sys_fcntl64: ___sys_fcntl64,
        __sys_ftruncate64: ___sys_ftruncate64,
        __sys_getdents64: ___sys_getdents64,
        __sys_geteuid32: ___sys_geteuid32,
        __sys_getpid: ___sys_getpid,
        __sys_getuid32: ___sys_getuid32,
        __sys_ioctl: ___sys_ioctl,
        __sys_open: ___sys_open,
        __sys_read: ___sys_read,
        __sys_rmdir: ___sys_rmdir,
        __sys_stat64: ___sys_stat64,
        __sys_unlink: ___sys_unlink,
        _embind_finalize_value_array: __embind_finalize_value_array,
        _embind_register_bool: __embind_register_bool,
        _embind_register_class: __embind_register_class,
        _embind_register_class_class_function: __embind_register_class_class_function,
        _embind_register_class_class_property: __embind_register_class_class_property,
        _embind_register_class_constructor: __embind_register_class_constructor,
        _embind_register_class_function: __embind_register_class_function,
        _embind_register_class_property: __embind_register_class_property,
        _embind_register_emval: __embind_register_emval,
        _embind_register_enum: __embind_register_enum,
        _embind_register_enum_value: __embind_register_enum_value,
        _embind_register_float: __embind_register_float,
        _embind_register_function: __embind_register_function,
        _embind_register_integer: __embind_register_integer,
        _embind_register_memory_view: __embind_register_memory_view,
        _embind_register_std_string: __embind_register_std_string,
        _embind_register_std_wstring: __embind_register_std_wstring,
        _embind_register_value_array: __embind_register_value_array,
        _embind_register_value_array_element: __embind_register_value_array_element,
        _embind_register_void: __embind_register_void,
        _emval_as: __emval_as,
        _emval_call: __emval_call,
        _emval_call_void_method: __emval_call_void_method,
        _emval_decref: __emval_decref,
        _emval_get_method_caller: __emval_get_method_caller,
        _emval_get_property: __emval_get_property,
        _emval_incref: __emval_incref,
        _emval_new_array: __emval_new_array,
        _emval_new_cstring: __emval_new_cstring,
        _emval_new_object: __emval_new_object,
        _emval_run_destructors: __emval_run_destructors,
        _emval_set_property: __emval_set_property,
        _emval_take_value: __emval_take_value,
        abort: _abort,
        clock: _clock,
        clock_gettime: _clock_gettime,
        difftime: _difftime,
        eglGetProcAddress: _eglGetProcAddress,
        emscripten_asm_const_int: _emscripten_asm_const_int,
        emscripten_glActiveTexture: _emscripten_glActiveTexture,
        emscripten_glAttachShader: _emscripten_glAttachShader,
        emscripten_glBeginQueryEXT: _emscripten_glBeginQueryEXT,
        emscripten_glBindAttribLocation: _emscripten_glBindAttribLocation,
        emscripten_glBindBuffer: _emscripten_glBindBuffer,
        emscripten_glBindFramebuffer: _emscripten_glBindFramebuffer,
        emscripten_glBindRenderbuffer: _emscripten_glBindRenderbuffer,
        emscripten_glBindTexture: _emscripten_glBindTexture,
        emscripten_glBindVertexArrayOES: _emscripten_glBindVertexArrayOES,
        emscripten_glBlendColor: _emscripten_glBlendColor,
        emscripten_glBlendEquation: _emscripten_glBlendEquation,
        emscripten_glBlendEquationSeparate: _emscripten_glBlendEquationSeparate,
        emscripten_glBlendFunc: _emscripten_glBlendFunc,
        emscripten_glBlendFuncSeparate: _emscripten_glBlendFuncSeparate,
        emscripten_glBufferData: _emscripten_glBufferData,
        emscripten_glBufferSubData: _emscripten_glBufferSubData,
        emscripten_glCheckFramebufferStatus: _emscripten_glCheckFramebufferStatus,
        emscripten_glClear: _emscripten_glClear,
        emscripten_glClearColor: _emscripten_glClearColor,
        emscripten_glClearDepthf: _emscripten_glClearDepthf,
        emscripten_glClearStencil: _emscripten_glClearStencil,
        emscripten_glColorMask: _emscripten_glColorMask,
        emscripten_glCompileShader: _emscripten_glCompileShader,
        emscripten_glCompressedTexImage2D: _emscripten_glCompressedTexImage2D,
        emscripten_glCompressedTexSubImage2D: _emscripten_glCompressedTexSubImage2D,
        emscripten_glCopyTexImage2D: _emscripten_glCopyTexImage2D,
        emscripten_glCopyTexSubImage2D: _emscripten_glCopyTexSubImage2D,
        emscripten_glCreateProgram: _emscripten_glCreateProgram,
        emscripten_glCreateShader: _emscripten_glCreateShader,
        emscripten_glCullFace: _emscripten_glCullFace,
        emscripten_glDeleteBuffers: _emscripten_glDeleteBuffers,
        emscripten_glDeleteFramebuffers: _emscripten_glDeleteFramebuffers,
        emscripten_glDeleteProgram: _emscripten_glDeleteProgram,
        emscripten_glDeleteQueriesEXT: _emscripten_glDeleteQueriesEXT,
        emscripten_glDeleteRenderbuffers: _emscripten_glDeleteRenderbuffers,
        emscripten_glDeleteShader: _emscripten_glDeleteShader,
        emscripten_glDeleteTextures: _emscripten_glDeleteTextures,
        emscripten_glDeleteVertexArraysOES: _emscripten_glDeleteVertexArraysOES,
        emscripten_glDepthFunc: _emscripten_glDepthFunc,
        emscripten_glDepthMask: _emscripten_glDepthMask,
        emscripten_glDepthRangef: _emscripten_glDepthRangef,
        emscripten_glDetachShader: _emscripten_glDetachShader,
        emscripten_glDisable: _emscripten_glDisable,
        emscripten_glDisableVertexAttribArray: _emscripten_glDisableVertexAttribArray,
        emscripten_glDrawArrays: _emscripten_glDrawArrays,
        emscripten_glDrawArraysInstancedANGLE: _emscripten_glDrawArraysInstancedANGLE,
        emscripten_glDrawBuffersWEBGL: _emscripten_glDrawBuffersWEBGL,
        emscripten_glDrawElements: _emscripten_glDrawElements,
        emscripten_glDrawElementsInstancedANGLE: _emscripten_glDrawElementsInstancedANGLE,
        emscripten_glEnable: _emscripten_glEnable,
        emscripten_glEnableVertexAttribArray: _emscripten_glEnableVertexAttribArray,
        emscripten_glEndQueryEXT: _emscripten_glEndQueryEXT,
        emscripten_glFinish: _emscripten_glFinish,
        emscripten_glFlush: _emscripten_glFlush,
        emscripten_glFramebufferRenderbuffer: _emscripten_glFramebufferRenderbuffer,
        emscripten_glFramebufferTexture2D: _emscripten_glFramebufferTexture2D,
        emscripten_glFrontFace: _emscripten_glFrontFace,
        emscripten_glGenBuffers: _emscripten_glGenBuffers,
        emscripten_glGenFramebuffers: _emscripten_glGenFramebuffers,
        emscripten_glGenQueriesEXT: _emscripten_glGenQueriesEXT,
        emscripten_glGenRenderbuffers: _emscripten_glGenRenderbuffers,
        emscripten_glGenTextures: _emscripten_glGenTextures,
        emscripten_glGenVertexArraysOES: _emscripten_glGenVertexArraysOES,
        emscripten_glGenerateMipmap: _emscripten_glGenerateMipmap,
        emscripten_glGetActiveAttrib: _emscripten_glGetActiveAttrib,
        emscripten_glGetActiveUniform: _emscripten_glGetActiveUniform,
        emscripten_glGetAttachedShaders: _emscripten_glGetAttachedShaders,
        emscripten_glGetAttribLocation: _emscripten_glGetAttribLocation,
        emscripten_glGetBooleanv: _emscripten_glGetBooleanv,
        emscripten_glGetBufferParameteriv: _emscripten_glGetBufferParameteriv,
        emscripten_glGetError: _emscripten_glGetError,
        emscripten_glGetFloatv: _emscripten_glGetFloatv,
        emscripten_glGetFramebufferAttachmentParameteriv: _emscripten_glGetFramebufferAttachmentParameteriv,
        emscripten_glGetIntegerv: _emscripten_glGetIntegerv,
        emscripten_glGetProgramInfoLog: _emscripten_glGetProgramInfoLog,
        emscripten_glGetProgramiv: _emscripten_glGetProgramiv,
        emscripten_glGetQueryObjecti64vEXT: _emscripten_glGetQueryObjecti64vEXT,
        emscripten_glGetQueryObjectivEXT: _emscripten_glGetQueryObjectivEXT,
        emscripten_glGetQueryObjectui64vEXT: _emscripten_glGetQueryObjectui64vEXT,
        emscripten_glGetQueryObjectuivEXT: _emscripten_glGetQueryObjectuivEXT,
        emscripten_glGetQueryivEXT: _emscripten_glGetQueryivEXT,
        emscripten_glGetRenderbufferParameteriv: _emscripten_glGetRenderbufferParameteriv,
        emscripten_glGetShaderInfoLog: _emscripten_glGetShaderInfoLog,
        emscripten_glGetShaderPrecisionFormat: _emscripten_glGetShaderPrecisionFormat,
        emscripten_glGetShaderSource: _emscripten_glGetShaderSource,
        emscripten_glGetShaderiv: _emscripten_glGetShaderiv,
        emscripten_glGetString: _emscripten_glGetString,
        emscripten_glGetTexParameterfv: _emscripten_glGetTexParameterfv,
        emscripten_glGetTexParameteriv: _emscripten_glGetTexParameteriv,
        emscripten_glGetUniformLocation: _emscripten_glGetUniformLocation,
        emscripten_glGetUniformfv: _emscripten_glGetUniformfv,
        emscripten_glGetUniformiv: _emscripten_glGetUniformiv,
        emscripten_glGetVertexAttribPointerv: _emscripten_glGetVertexAttribPointerv,
        emscripten_glGetVertexAttribfv: _emscripten_glGetVertexAttribfv,
        emscripten_glGetVertexAttribiv: _emscripten_glGetVertexAttribiv,
        emscripten_glHint: _emscripten_glHint,
        emscripten_glIsBuffer: _emscripten_glIsBuffer,
        emscripten_glIsEnabled: _emscripten_glIsEnabled,
        emscripten_glIsFramebuffer: _emscripten_glIsFramebuffer,
        emscripten_glIsProgram: _emscripten_glIsProgram,
        emscripten_glIsQueryEXT: _emscripten_glIsQueryEXT,
        emscripten_glIsRenderbuffer: _emscripten_glIsRenderbuffer,
        emscripten_glIsShader: _emscripten_glIsShader,
        emscripten_glIsTexture: _emscripten_glIsTexture,
        emscripten_glIsVertexArrayOES: _emscripten_glIsVertexArrayOES,
        emscripten_glLineWidth: _emscripten_glLineWidth,
        emscripten_glLinkProgram: _emscripten_glLinkProgram,
        emscripten_glPixelStorei: _emscripten_glPixelStorei,
        emscripten_glPolygonOffset: _emscripten_glPolygonOffset,
        emscripten_glQueryCounterEXT: _emscripten_glQueryCounterEXT,
        emscripten_glReadPixels: _emscripten_glReadPixels,
        emscripten_glReleaseShaderCompiler: _emscripten_glReleaseShaderCompiler,
        emscripten_glRenderbufferStorage: _emscripten_glRenderbufferStorage,
        emscripten_glSampleCoverage: _emscripten_glSampleCoverage,
        emscripten_glScissor: _emscripten_glScissor,
        emscripten_glShaderBinary: _emscripten_glShaderBinary,
        emscripten_glShaderSource: _emscripten_glShaderSource,
        emscripten_glStencilFunc: _emscripten_glStencilFunc,
        emscripten_glStencilFuncSeparate: _emscripten_glStencilFuncSeparate,
        emscripten_glStencilMask: _emscripten_glStencilMask,
        emscripten_glStencilMaskSeparate: _emscripten_glStencilMaskSeparate,
        emscripten_glStencilOp: _emscripten_glStencilOp,
        emscripten_glStencilOpSeparate: _emscripten_glStencilOpSeparate,
        emscripten_glTexImage2D: _emscripten_glTexImage2D,
        emscripten_glTexParameterf: _emscripten_glTexParameterf,
        emscripten_glTexParameterfv: _emscripten_glTexParameterfv,
        emscripten_glTexParameteri: _emscripten_glTexParameteri,
        emscripten_glTexParameteriv: _emscripten_glTexParameteriv,
        emscripten_glTexSubImage2D: _emscripten_glTexSubImage2D,
        emscripten_glUniform1f: _emscripten_glUniform1f,
        emscripten_glUniform1fv: _emscripten_glUniform1fv,
        emscripten_glUniform1i: _emscripten_glUniform1i,
        emscripten_glUniform1iv: _emscripten_glUniform1iv,
        emscripten_glUniform2f: _emscripten_glUniform2f,
        emscripten_glUniform2fv: _emscripten_glUniform2fv,
        emscripten_glUniform2i: _emscripten_glUniform2i,
        emscripten_glUniform2iv: _emscripten_glUniform2iv,
        emscripten_glUniform3f: _emscripten_glUniform3f,
        emscripten_glUniform3fv: _emscripten_glUniform3fv,
        emscripten_glUniform3i: _emscripten_glUniform3i,
        emscripten_glUniform3iv: _emscripten_glUniform3iv,
        emscripten_glUniform4f: _emscripten_glUniform4f,
        emscripten_glUniform4fv: _emscripten_glUniform4fv,
        emscripten_glUniform4i: _emscripten_glUniform4i,
        emscripten_glUniform4iv: _emscripten_glUniform4iv,
        emscripten_glUniformMatrix2fv: _emscripten_glUniformMatrix2fv,
        emscripten_glUniformMatrix3fv: _emscripten_glUniformMatrix3fv,
        emscripten_glUniformMatrix4fv: _emscripten_glUniformMatrix4fv,
        emscripten_glUseProgram: _emscripten_glUseProgram,
        emscripten_glValidateProgram: _emscripten_glValidateProgram,
        emscripten_glVertexAttrib1f: _emscripten_glVertexAttrib1f,
        emscripten_glVertexAttrib1fv: _emscripten_glVertexAttrib1fv,
        emscripten_glVertexAttrib2f: _emscripten_glVertexAttrib2f,
        emscripten_glVertexAttrib2fv: _emscripten_glVertexAttrib2fv,
        emscripten_glVertexAttrib3f: _emscripten_glVertexAttrib3f,
        emscripten_glVertexAttrib3fv: _emscripten_glVertexAttrib3fv,
        emscripten_glVertexAttrib4f: _emscripten_glVertexAttrib4f,
        emscripten_glVertexAttrib4fv: _emscripten_glVertexAttrib4fv,
        emscripten_glVertexAttribDivisorANGLE: _emscripten_glVertexAttribDivisorANGLE,
        emscripten_glVertexAttribPointer: _emscripten_glVertexAttribPointer,
        emscripten_glViewport: _emscripten_glViewport,
        emscripten_longjmp: _emscripten_longjmp,
        emscripten_memcpy_big: _emscripten_memcpy_big,
        emscripten_resize_heap: _emscripten_resize_heap,
        emscripten_webgl_create_context: _emscripten_webgl_create_context,
        emscripten_webgl_destroy_context: _emscripten_webgl_destroy_context,
        emscripten_webgl_enable_extension: _emscripten_webgl_enable_extension,
        emscripten_webgl_init_context_attributes: _emscripten_webgl_init_context_attributes,
        emscripten_webgl_make_context_current: _emscripten_webgl_make_context_current,
        environ_get: _environ_get,
        environ_sizes_get: _environ_sizes_get,
        exit: _exit,
        fd_close: _fd_close,
        fd_read: _fd_read,
        fd_seek: _fd_seek,
        fd_write: _fd_write,
        getTempRet0: _getTempRet0,
        getpwuid: _getpwuid,
        gettimeofday: _gettimeofday,
        glActiveTexture: _glActiveTexture,
        glAttachShader: _glAttachShader,
        glBindAttribLocation: _glBindAttribLocation,
        glBindBuffer: _glBindBuffer,
        glBindFramebuffer: _glBindFramebuffer,
        glBindRenderbuffer: _glBindRenderbuffer,
        glBindTexture: _glBindTexture,
        glBlendColor: _glBlendColor,
        glBlendEquation: _glBlendEquation,
        glBlendEquationSeparate: _glBlendEquationSeparate,
        glBlendFunc: _glBlendFunc,
        glBlendFuncSeparate: _glBlendFuncSeparate,
        glBufferData: _glBufferData,
        glBufferSubData: _glBufferSubData,
        glCheckFramebufferStatus: _glCheckFramebufferStatus,
        glClear: _glClear,
        glClearColor: _glClearColor,
        glClearDepthf: _glClearDepthf,
        glClearStencil: _glClearStencil,
        glColorMask: _glColorMask,
        glCompileShader: _glCompileShader,
        glCreateProgram: _glCreateProgram,
        glCreateShader: _glCreateShader,
        glCullFace: _glCullFace,
        glDeleteBuffers: _glDeleteBuffers,
        glDeleteFramebuffers: _glDeleteFramebuffers,
        glDeleteProgram: _glDeleteProgram,
        glDeleteRenderbuffers: _glDeleteRenderbuffers,
        glDeleteShader: _glDeleteShader,
        glDeleteTextures: _glDeleteTextures,
        glDepthFunc: _glDepthFunc,
        glDepthMask: _glDepthMask,
        glDepthRangef: _glDepthRangef,
        glDisable: _glDisable,
        glDisableVertexAttribArray: _glDisableVertexAttribArray,
        glDrawArrays: _glDrawArrays,
        glDrawElements: _glDrawElements,
        glEnable: _glEnable,
        glEnableVertexAttribArray: _glEnableVertexAttribArray,
        glFramebufferRenderbuffer: _glFramebufferRenderbuffer,
        glFramebufferTexture2D: _glFramebufferTexture2D,
        glGenBuffers: _glGenBuffers,
        glGenFramebuffers: _glGenFramebuffers,
        glGenRenderbuffers: _glGenRenderbuffers,
        glGenTextures: _glGenTextures,
        glGetAttribLocation: _glGetAttribLocation,
        glGetError: _glGetError,
        glGetFloatv: _glGetFloatv,
        glGetIntegerv: _glGetIntegerv,
        glGetProgramInfoLog: _glGetProgramInfoLog,
        glGetProgramiv: _glGetProgramiv,
        glGetShaderInfoLog: _glGetShaderInfoLog,
        glGetShaderiv: _glGetShaderiv,
        glGetString: _glGetString,
        glGetUniformLocation: _glGetUniformLocation,
        glHint: _glHint,
        glLineWidth: _glLineWidth,
        glLinkProgram: _glLinkProgram,
        glPixelStorei: _glPixelStorei,
        glPolygonOffset: _glPolygonOffset,
        glReadPixels: _glReadPixels,
        glRenderbufferStorage: _glRenderbufferStorage,
        glScissor: _glScissor,
        glShaderSource: _glShaderSource,
        glStencilFunc: _glStencilFunc,
        glStencilMask: _glStencilMask,
        glStencilOp: _glStencilOp,
        glTexImage2D: _glTexImage2D,
        glTexParameterfv: _glTexParameterfv,
        glTexParameteri: _glTexParameteri,
        glUniform1f: _glUniform1f,
        glUniform1fv: _glUniform1fv,
        glUniform1i: _glUniform1i,
        glUniform1iv: _glUniform1iv,
        glUniform2f: _glUniform2f,
        glUniform2fv: _glUniform2fv,
        glUniform3f: _glUniform3f,
        glUniform3fv: _glUniform3fv,
        glUniform4f: _glUniform4f,
        glUniform4fv: _glUniform4fv,
        glUniform4iv: _glUniform4iv,
        glUniformMatrix3fv: _glUniformMatrix3fv,
        glUniformMatrix4fv: _glUniformMatrix4fv,
        glUseProgram: _glUseProgram,
        glVertexAttribPointer: _glVertexAttribPointer,
        glViewport: _glViewport,
        invoke_i: invoke_i,
        invoke_ii: invoke_ii,
        invoke_iii: invoke_iii,
        invoke_iiii: invoke_iiii,
        invoke_iiiii: invoke_iiiii,
        invoke_iiiiii: invoke_iiiiii,
        invoke_iiiiiii: invoke_iiiiiii,
        invoke_iiiiiiii: invoke_iiiiiiii,
        invoke_iiiiiiiii: invoke_iiiiiiiii,
        invoke_iiiiiiiiii: invoke_iiiiiiiiii,
        invoke_v: invoke_v,
        invoke_vi: invoke_vi,
        invoke_vidd: invoke_vidd,
        invoke_vii: invoke_vii,
        invoke_viii: invoke_viii,
        invoke_viiii: invoke_viiii,
        invoke_viiiii: invoke_viiiii,
        invoke_viiiiii: invoke_viiiiii,
        invoke_viiiiiiiii: invoke_viiiiiiiii,
        memory: wasmMemory,
        mktime: _mktime,
        pthread_mutexattr_destroy: _pthread_mutexattr_destroy,
        pthread_mutexattr_init: _pthread_mutexattr_init,
        pthread_mutexattr_settype: _pthread_mutexattr_settype,
        setTempRet0: _setTempRet0,
        strftime_l: _strftime_l,
        time: _time,
        usleep: _usleep
    }
    var asm = createWasm()
    var ___wasm_call_ctors = (Module['___wasm_call_ctors'] = function () {
        return (___wasm_call_ctors = Module['___wasm_call_ctors'] = Module['asm']['__wasm_call_ctors']).apply(
            null,
            arguments
        )
    })
    var _malloc = (Module['_malloc'] = function () {
        return (_malloc = Module['_malloc'] = Module['asm']['malloc']).apply(null, arguments)
    })
    var _memset = (Module['_memset'] = function () {
        return (_memset = Module['_memset'] = Module['asm']['memset']).apply(null, arguments)
    })
    var _free = (Module['_free'] = function () {
        return (_free = Module['_free'] = Module['asm']['free']).apply(null, arguments)
    })
    var _realloc = (Module['_realloc'] = function () {
        return (_realloc = Module['_realloc'] = Module['asm']['realloc']).apply(null, arguments)
    })
    var _strstr = (Module['_strstr'] = function () {
        return (_strstr = Module['_strstr'] = Module['asm']['strstr']).apply(null, arguments)
    })
    var _testSetjmp = (Module['_testSetjmp'] = function () {
        return (_testSetjmp = Module['_testSetjmp'] = Module['asm']['testSetjmp']).apply(null, arguments)
    })
    var _saveSetjmp = (Module['_saveSetjmp'] = function () {
        return (_saveSetjmp = Module['_saveSetjmp'] = Module['asm']['saveSetjmp']).apply(null, arguments)
    })
    var ___errno_location = (Module['___errno_location'] = function () {
        return (___errno_location = Module['___errno_location'] = Module['asm']['__errno_location']).apply(
            null,
            arguments
        )
    })
    var ___getTypeName = (Module['___getTypeName'] = function () {
        return (___getTypeName = Module['___getTypeName'] = Module['asm']['__getTypeName']).apply(null, arguments)
    })
    var ___embind_register_native_and_builtin_types = (Module['___embind_register_native_and_builtin_types'] =
        function () {
            return (___embind_register_native_and_builtin_types = Module[
                '___embind_register_native_and_builtin_types'
            ] =
                Module['asm']['__embind_register_native_and_builtin_types']).apply(null, arguments)
        })
    var _emscripten_GetProcAddress = (Module['_emscripten_GetProcAddress'] = function () {
        return (_emscripten_GetProcAddress = Module['_emscripten_GetProcAddress'] =
            Module['asm']['emscripten_GetProcAddress']).apply(null, arguments)
    })
    var __get_tzname = (Module['__get_tzname'] = function () {
        return (__get_tzname = Module['__get_tzname'] = Module['asm']['_get_tzname']).apply(null, arguments)
    })
    var __get_daylight = (Module['__get_daylight'] = function () {
        return (__get_daylight = Module['__get_daylight'] = Module['asm']['_get_daylight']).apply(null, arguments)
    })
    var __get_timezone = (Module['__get_timezone'] = function () {
        return (__get_timezone = Module['__get_timezone'] = Module['asm']['_get_timezone']).apply(null, arguments)
    })
    var stackSave = (Module['stackSave'] = function () {
        return (stackSave = Module['stackSave'] = Module['asm']['stackSave']).apply(null, arguments)
    })
    var stackRestore = (Module['stackRestore'] = function () {
        return (stackRestore = Module['stackRestore'] = Module['asm']['stackRestore']).apply(null, arguments)
    })
    var stackAlloc = (Module['stackAlloc'] = function () {
        return (stackAlloc = Module['stackAlloc'] = Module['asm']['stackAlloc']).apply(null, arguments)
    })
    var _setThrew = (Module['_setThrew'] = function () {
        return (_setThrew = Module['_setThrew'] = Module['asm']['setThrew']).apply(null, arguments)
    })
    var dynCall_viijii = (Module['dynCall_viijii'] = function () {
        return (dynCall_viijii = Module['dynCall_viijii'] = Module['asm']['dynCall_viijii']).apply(null, arguments)
    })
    var dynCall_ji = (Module['dynCall_ji'] = function () {
        return (dynCall_ji = Module['dynCall_ji'] = Module['asm']['dynCall_ji']).apply(null, arguments)
    })
    var dynCall_jiji = (Module['dynCall_jiji'] = function () {
        return (dynCall_jiji = Module['dynCall_jiji'] = Module['asm']['dynCall_jiji']).apply(null, arguments)
    })
    var dynCall_viijj = (Module['dynCall_viijj'] = function () {
        return (dynCall_viijj = Module['dynCall_viijj'] = Module['asm']['dynCall_viijj']).apply(null, arguments)
    })
    var dynCall_vij = (Module['dynCall_vij'] = function () {
        return (dynCall_vij = Module['dynCall_vij'] = Module['asm']['dynCall_vij']).apply(null, arguments)
    })
    var dynCall_jii = (Module['dynCall_jii'] = function () {
        return (dynCall_jii = Module['dynCall_jii'] = Module['asm']['dynCall_jii']).apply(null, arguments)
    })
    var dynCall_jij = (Module['dynCall_jij'] = function () {
        return (dynCall_jij = Module['dynCall_jij'] = Module['asm']['dynCall_jij']).apply(null, arguments)
    })
    var dynCall_viij = (Module['dynCall_viij'] = function () {
        return (dynCall_viij = Module['dynCall_viij'] = Module['asm']['dynCall_viij']).apply(null, arguments)
    })
    var dynCall_vijii = (Module['dynCall_vijii'] = function () {
        return (dynCall_vijii = Module['dynCall_vijii'] = Module['asm']['dynCall_vijii']).apply(null, arguments)
    })
    var dynCall_viji = (Module['dynCall_viji'] = function () {
        return (dynCall_viji = Module['dynCall_viji'] = Module['asm']['dynCall_viji']).apply(null, arguments)
    })
    var dynCall_viiji = (Module['dynCall_viiji'] = function () {
        return (dynCall_viiji = Module['dynCall_viiji'] = Module['asm']['dynCall_viiji']).apply(null, arguments)
    })
    var dynCall_jiii = (Module['dynCall_jiii'] = function () {
        return (dynCall_jiii = Module['dynCall_jiii'] = Module['asm']['dynCall_jiii']).apply(null, arguments)
    })
    var dynCall_iiji = (Module['dynCall_iiji'] = function () {
        return (dynCall_iiji = Module['dynCall_iiji'] = Module['asm']['dynCall_iiji']).apply(null, arguments)
    })
    var dynCall_iij = (Module['dynCall_iij'] = function () {
        return (dynCall_iij = Module['dynCall_iij'] = Module['asm']['dynCall_iij']).apply(null, arguments)
    })
    var dynCall_iiij = (Module['dynCall_iiij'] = function () {
        return (dynCall_iiij = Module['dynCall_iiij'] = Module['asm']['dynCall_iiij']).apply(null, arguments)
    })
    var dynCall_iijj = (Module['dynCall_iijj'] = function () {
        return (dynCall_iijj = Module['dynCall_iijj'] = Module['asm']['dynCall_iijj']).apply(null, arguments)
    })
    var dynCall_iijjj = (Module['dynCall_iijjj'] = function () {
        return (dynCall_iijjj = Module['dynCall_iijjj'] = Module['asm']['dynCall_iijjj']).apply(null, arguments)
    })
    var dynCall_diji = (Module['dynCall_diji'] = function () {
        return (dynCall_diji = Module['dynCall_diji'] = Module['asm']['dynCall_diji']).apply(null, arguments)
    })
    var dynCall_iijiiii = (Module['dynCall_iijiiii'] = function () {
        return (dynCall_iijiiii = Module['dynCall_iijiiii'] = Module['asm']['dynCall_iijiiii']).apply(null, arguments)
    })
    var dynCall_iiiji = (Module['dynCall_iiiji'] = function () {
        return (dynCall_iiiji = Module['dynCall_iiiji'] = Module['asm']['dynCall_iiiji']).apply(null, arguments)
    })
    var dynCall_iiijii = (Module['dynCall_iiijii'] = function () {
        return (dynCall_iiijii = Module['dynCall_iiijii'] = Module['asm']['dynCall_iiijii']).apply(null, arguments)
    })
    var dynCall_vijjii = (Module['dynCall_vijjii'] = function () {
        return (dynCall_vijjii = Module['dynCall_vijjii'] = Module['asm']['dynCall_vijjii']).apply(null, arguments)
    })
    var dynCall_iijji = (Module['dynCall_iijji'] = function () {
        return (dynCall_iijji = Module['dynCall_iijji'] = Module['asm']['dynCall_iijji']).apply(null, arguments)
    })
    var dynCall_vijiiii = (Module['dynCall_vijiiii'] = function () {
        return (dynCall_vijiiii = Module['dynCall_vijiiii'] = Module['asm']['dynCall_vijiiii']).apply(null, arguments)
    })
    var dynCall_iijjiii = (Module['dynCall_iijjiii'] = function () {
        return (dynCall_iijjiii = Module['dynCall_iijjiii'] = Module['asm']['dynCall_iijjiii']).apply(null, arguments)
    })
    var dynCall_jiijiii = (Module['dynCall_jiijiii'] = function () {
        return (dynCall_jiijiii = Module['dynCall_jiijiii'] = Module['asm']['dynCall_jiijiii']).apply(null, arguments)
    })
    var dynCall_vijiii = (Module['dynCall_vijiii'] = function () {
        return (dynCall_vijiii = Module['dynCall_vijiii'] = Module['asm']['dynCall_vijiii']).apply(null, arguments)
    })
    var dynCall_vijij = (Module['dynCall_vijij'] = function () {
        return (dynCall_vijij = Module['dynCall_vijij'] = Module['asm']['dynCall_vijij']).apply(null, arguments)
    })
    var dynCall_vijj = (Module['dynCall_vijj'] = function () {
        return (dynCall_vijj = Module['dynCall_vijj'] = Module['asm']['dynCall_vijj']).apply(null, arguments)
    })
    var dynCall_vijji = (Module['dynCall_vijji'] = function () {
        return (dynCall_vijji = Module['dynCall_vijji'] = Module['asm']['dynCall_vijji']).apply(null, arguments)
    })
    var dynCall_vijjiiii = (Module['dynCall_vijjiiii'] = function () {
        return (dynCall_vijjiiii = Module['dynCall_vijjiiii'] = Module['asm']['dynCall_vijjiiii']).apply(
            null,
            arguments
        )
    })
    var dynCall_vijjj = (Module['dynCall_vijjj'] = function () {
        return (dynCall_vijjj = Module['dynCall_vijjj'] = Module['asm']['dynCall_vijjj']).apply(null, arguments)
    })
    var dynCall_iiijiii = (Module['dynCall_iiijiii'] = function () {
        return (dynCall_iiijiii = Module['dynCall_iiijiii'] = Module['asm']['dynCall_iiijiii']).apply(null, arguments)
    })
    var dynCall_iijjjii = (Module['dynCall_iijjjii'] = function () {
        return (dynCall_iijjjii = Module['dynCall_iijjjii'] = Module['asm']['dynCall_iijjjii']).apply(null, arguments)
    })
    var dynCall_jiiii = (Module['dynCall_jiiii'] = function () {
        return (dynCall_jiiii = Module['dynCall_jiiii'] = Module['asm']['dynCall_jiiii']).apply(null, arguments)
    })
    var dynCall_jijj = (Module['dynCall_jijj'] = function () {
        return (dynCall_jijj = Module['dynCall_jijj'] = Module['asm']['dynCall_jijj']).apply(null, arguments)
    })
    var dynCall_viijjiii = (Module['dynCall_viijjiii'] = function () {
        return (dynCall_viijjiii = Module['dynCall_viijjiii'] = Module['asm']['dynCall_viijjiii']).apply(
            null,
            arguments
        )
    })
    var dynCall_jijji = (Module['dynCall_jijji'] = function () {
        return (dynCall_jijji = Module['dynCall_jijji'] = Module['asm']['dynCall_jijji']).apply(null, arguments)
    })
    var dynCall_iijjii = (Module['dynCall_iijjii'] = function () {
        return (dynCall_iijjii = Module['dynCall_iijjii'] = Module['asm']['dynCall_iijjii']).apply(null, arguments)
    })
    var dynCall_iiiiji = (Module['dynCall_iiiiji'] = function () {
        return (dynCall_iiiiji = Module['dynCall_iiiiji'] = Module['asm']['dynCall_iiiiji']).apply(null, arguments)
    })
    var dynCall_iiiiijj = (Module['dynCall_iiiiijj'] = function () {
        return (dynCall_iiiiijj = Module['dynCall_iiiiijj'] = Module['asm']['dynCall_iiiiijj']).apply(null, arguments)
    })
    var dynCall_iiiijii = (Module['dynCall_iiiijii'] = function () {
        return (dynCall_iiiijii = Module['dynCall_iiiijii'] = Module['asm']['dynCall_iiiijii']).apply(null, arguments)
    })
    var dynCall_jiiiiii = (Module['dynCall_jiiiiii'] = function () {
        return (dynCall_jiiiiii = Module['dynCall_jiiiiii'] = Module['asm']['dynCall_jiiiiii']).apply(null, arguments)
    })
    var dynCall_iiiiiji = (Module['dynCall_iiiiiji'] = function () {
        return (dynCall_iiiiiji = Module['dynCall_iiiiiji'] = Module['asm']['dynCall_iiiiiji']).apply(null, arguments)
    })
    var dynCall_jiiji = (Module['dynCall_jiiji'] = function () {
        return (dynCall_jiiji = Module['dynCall_jiiji'] = Module['asm']['dynCall_jiiji']).apply(null, arguments)
    })
    var dynCall_viiiijiii = (Module['dynCall_viiiijiii'] = function () {
        return (dynCall_viiiijiii = Module['dynCall_viiiijiii'] = Module['asm']['dynCall_viiiijiii']).apply(
            null,
            arguments
        )
    })
    var dynCall_viiiij = (Module['dynCall_viiiij'] = function () {
        return (dynCall_viiiij = Module['dynCall_viiiij'] = Module['asm']['dynCall_viiiij']).apply(null, arguments)
    })
    var dynCall_jji = (Module['dynCall_jji'] = function () {
        return (dynCall_jji = Module['dynCall_jji'] = Module['asm']['dynCall_jji']).apply(null, arguments)
    })
    var dynCall_iji = (Module['dynCall_iji'] = function () {
        return (dynCall_iji = Module['dynCall_iji'] = Module['asm']['dynCall_iji']).apply(null, arguments)
    })
    var dynCall_iiiiij = (Module['dynCall_iiiiij'] = function () {
        return (dynCall_iiiiij = Module['dynCall_iiiiij'] = Module['asm']['dynCall_iiiiij']).apply(null, arguments)
    })
    var dynCall_iiiiiijj = (Module['dynCall_iiiiiijj'] = function () {
        return (dynCall_iiiiiijj = Module['dynCall_iiiiiijj'] = Module['asm']['dynCall_iiiiiijj']).apply(
            null,
            arguments
        )
    })
    function invoke_viiii(index, a1, a2, a3, a4) {
        var sp = stackSave()
        try {
            wasmTable.get(index)(a1, a2, a3, a4)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_iii(index, a1, a2) {
        var sp = stackSave()
        try {
            return wasmTable.get(index)(a1, a2)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_iiiii(index, a1, a2, a3, a4) {
        var sp = stackSave()
        try {
            return wasmTable.get(index)(a1, a2, a3, a4)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_iiii(index, a1, a2, a3) {
        var sp = stackSave()
        try {
            return wasmTable.get(index)(a1, a2, a3)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_v(index) {
        var sp = stackSave()
        try {
            wasmTable.get(index)()
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_ii(index, a1) {
        var sp = stackSave()
        try {
            return wasmTable.get(index)(a1)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_vi(index, a1) {
        var sp = stackSave()
        try {
            wasmTable.get(index)(a1)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_viii(index, a1, a2, a3) {
        var sp = stackSave()
        try {
            wasmTable.get(index)(a1, a2, a3)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
        var sp = stackSave()
        try {
            return wasmTable.get(index)(a1, a2, a3, a4, a5, a6, a7)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_i(index) {
        var sp = stackSave()
        try {
            return wasmTable.get(index)()
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_vii(index, a1, a2) {
        var sp = stackSave()
        try {
            wasmTable.get(index)(a1, a2)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        var sp = stackSave()
        try {
            return wasmTable.get(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_vidd(index, a1, a2, a3) {
        var sp = stackSave()
        try {
            wasmTable.get(index)(a1, a2, a3)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_iiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
        var sp = stackSave()
        try {
            return wasmTable.get(index)(a1, a2, a3, a4, a5, a6, a7, a8)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
        var sp = stackSave()
        try {
            return wasmTable.get(index)(a1, a2, a3, a4, a5)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
        var sp = stackSave()
        try {
            return wasmTable.get(index)(a1, a2, a3, a4, a5, a6)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_viiiii(index, a1, a2, a3, a4, a5) {
        var sp = stackSave()
        try {
            wasmTable.get(index)(a1, a2, a3, a4, a5)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_viiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        var sp = stackSave()
        try {
            wasmTable.get(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
        var sp = stackSave()
        try {
            wasmTable.get(index)(a1, a2, a3, a4, a5, a6)
        } catch (e) {
            stackRestore(sp)
            if (e !== e + 0 && e !== 'longjmp') throw e
            _setThrew(1, 0)
        }
    }
    var calledRun
    function ExitStatus(status) {
        this.name = 'ExitStatus'
        this.message = 'Program terminated with exit(' + status + ')'
        this.status = status
    }
    dependenciesFulfilled = function runCaller() {
        if (!calledRun) run()
        if (!calledRun) dependenciesFulfilled = runCaller
    }
    function run(args) {
        args = args || arguments_
        if (runDependencies > 0) {
            return
        }
        preRun()
        if (runDependencies > 0) return
        function doRun() {
            if (calledRun) return
            calledRun = true
            Module['calledRun'] = true
            if (ABORT) return
            initRuntime()
            preMain()
            if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']()
            postRun()
        }
        if (Module['setStatus']) {
            Module['setStatus']('Running...')
            setTimeout(function () {
                setTimeout(function () {
                    Module['setStatus']('')
                }, 1)
                doRun()
            }, 1)
        } else {
            doRun()
        }
    }
    Module['run'] = run
    function exit(status, implicit) {
        if (implicit && noExitRuntime && status === 0) {
            return
        }
        if (noExitRuntime) {
        } else {
            EXITSTATUS = status
            exitRuntime()
            if (Module['onExit']) Module['onExit'](status)
            ABORT = true
        }
        quit_(status, new ExitStatus(status))
    }
    if (Module['preInit']) {
        if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']]
        while (Module['preInit'].length > 0) {
            Module['preInit'].pop()()
        }
    }
    noExitRuntime = true
    run()
    Module._FS = FS
    if (!Module['addOnPostRun'] && Module.postRun) {
        Module['addOnPostRun'] = function (cb) {
            console.warn('addOnPostRun(cb) is deprecated and will be removed in future, please use .postRun.push(cb)')
            Module.postRun.push(cb)
        }
    }
    Module['openUrl'] = function (viewer, url, headers) {
        if (typeof headers === 'string') {
            headers = { Authorization: headers }
        }
        const exp = /(.*)\/files\/([\d\w]+)\/geometry\/$/gi
        const match = exp.exec(url)
        const host = match && match[1]
        const fileId = match && match[2]
        return fetch(url, { method: 'GET', headers: headers })
            .then((responce) => responce.json())
            .then((metadata) => {
                const layout = metadata.find((layout) => layout.default) || metadata[0]
                const chunks = [layout.database, ...layout.geometry]
                return chunks.reduce((acc, chunk, index) => {
                    return acc
                        .then(() =>
                            fetch(`${host}/files/${fileId}/downloads/${chunk}`, { method: 'GET', headers: headers })
                        )
                        .then((responce) => responce.arrayBuffer())
                        .then((arrayBuffer) => {
                            !index && viewer.clear()
                            viewer.parseStream(new Uint8Array(arrayBuffer))
                        })
                }, Promise.resolve())
            })
    }
    return Module
}
