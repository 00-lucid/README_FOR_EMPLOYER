;(function (g, f) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? (module.exports = f())
        : typeof define === 'function' && define.amd
        ? define(f)
        : ((g = typeof globalThis !== 'undefined' ? globalThis : g || self), (g.ODA = f()))
})(this, function () {
    'use strict' ///////////////////////////////////////////////////////////////////////////////
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
    function json(request) {
        return request.then((response) => response.json())
    }

    function text(request) {
        return request.then((response) => response.text())
    }

    function arrayBuffer(request) {
        return request.then((response) => response.arrayBuffer())
    }

    function options(method, headers, body, signal) {
        const opt = {
            method,
            headers,
            body
        }
        signal && (opt.signal = signal)
        return opt
    }

    function catchHttpError(status) {
        return status > 400 ? Promise.reject(status) : Promise.resolve()
    }
    function catchHttFetchError(request) {
        return request.then((response) => {
            return catchHttpError(response.status).then(
                () => request,
                () => response.json().then((json) => Promise.reject(new Error(json.description)))
            )
        })
    }

    function $get(url, headers, signal) {
        return catchHttFetchError(fetch(url, options('GET', headers, null, signal)))
    }
    function $put(url, headers, body) {
        if (typeof body === 'object') {
            if (body instanceof FormData);
            else if (!(body instanceof ArrayBuffer) && !(body instanceof Blob)) {
                body = JSON.stringify(body)
                headers = { ...headers, 'Content-Type': 'application/json' }
            }
        } else {
            headers = { ...headers, 'Content-Type': 'application/json' }
        }
        headers = { ...headers, 'Access-Control-Allow-Origin': '*', pragma: 'no-cache', 'cache-control': 'no-cache' }

        return catchHttFetchError(fetch(url, options('PUT', headers, body)))
    }

    // json || object 'content-type': 'application/json'
    // FormData 'Content-Type': 'multipart/form-data'
    function $post(url, headers, body) {
        if (typeof body === 'object') {
            if (body instanceof FormData);
            else if (!(body instanceof ArrayBuffer) && !(body instanceof Blob)) {
                body = JSON.stringify(body)
                headers = { ...headers, 'Content-Type': 'application/json' }
            }
        } else {
            headers = { ...headers, 'Content-Type': 'application/json' }
        }
        headers = { ...headers, 'Access-Control-Allow-Origin': '*', pragma: 'no-cache', 'cache-control': 'no-cache' }
        return catchHttFetchError(fetch(url, options('POST', headers, body)))
    }

    function $delete(url, headers, body) {
        return catchHttFetchError(fetch(url, options('DELETE', headers, body)))
    }

    function streamProgress(stream, onprogress) {
        const reader = stream.getReader()
        let current = 0

        reader.read().then(calc).catch(console.error)

        function calc(ev) {
            if (!ev.done) {
                reader.read().then(calc).catch(console.error)
            }
            ev.value && (current += ev.value.length)
            onprogress(current)
        }
        return stream
    }

    function downloadProgress(response, onprogress) {
        const total = response.headers.get('Content-Length')
        const tee = response.body.tee()
        streamProgress(tee[0], (bytesCount) => onprogress && onprogress(bytesCount / total))
        return new Response(tee[1])
    }

    /* eslint no-unused-vars: off */
    function $XMLHttp(url, { headers, method, body, uploadProgress, downloadProgress }) {
        /* eslint no-unused-vars: off */
        function getDescription(text) {
            try {
                return JSON.parse(text).description
            } catch {
                return text
            }
        }

        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest()
            req.open(method, url, true)
            for (var key in headers) {
                req.setRequestHeader(key, headers[key])
            }
            function calcProgress(ev) {
                return ev.lengthComputable ? ev.loaded / ev.total : 1
            }
            req.upload.onprogress = (ev) => uploadProgress && uploadProgress(calcProgress(ev))
            req.onprogress = (ev) => downloadProgress && downloadProgress(calcProgress(ev))

            req.onloadend = (ev) =>
                catchHttpError(req.status).then(
                    () => resolve(req),
                    () => reject(new Error(getDescription(ev.target.responseText)))
                )
            req.onerror = (ev) => reject(ev)
            req.send(body)
        })
    }

    function waitFor(func, options = { timeout: 600000, interval: 3000 }) {
        return new Promise((resolve, reject) => {
            let elapsed = 0
            const id = setInterval(() => {
                if (func()) {
                    clearInterval(id)
                    resolve()
                }
                elapsed += options.interval
                if (elapsed >= options.timeout) {
                    reject()
                    clearInterval(id)
                }
            }, options.interval)
        })
    }

    function normalizePath(path) {
        return path.replace(/^\/*/, '/')
    } ///////////////////////////////////////////////////////////////////////////////

    class MarkupImpl {
        constructor(data, file) {
            this.data = data
            this.file = file
        }

        get id() {
            return this.data.id
        }

        get(relativePath, signal) {
            const path = normalizePath(relativePath)
            return this.file.get(`/markup/${this.id}${path}`, signal)
        }

        post(relativePath, body) {
            const path = normalizePath(relativePath)
            return this.file.post(`/markup/${this.id}${path}`, body)
        }

        put(relativePath, body) {
            const path = normalizePath(relativePath)
            return this.file.put(`/markup/${this.id}${path}`, body)
        }

        delete(relativePath, body) {
            const path = normalizePath(relativePath)
            return this.file.delete(`/markup/${this.id}${path}`, body)
        }

        // Update markup for file
        saveMarkup() {
            return json(this.post(`/`, this.data))
        }

        // Get markup by id
        getMarkup() {
            return json(this.get(`/`))
        }

        // Delete markup by id
        deleteMarkup() {
            return json(this.delete(`/`))
        }
    } ///////////////////////////////////////////////////////////////////////////////

    class ModelImpl {
        constructor(data, file) {
            this.data = data
            this.file = file
        }

        get id() {
            return this.data.id
        }

        get(relativePath, signal) {
            const path = normalizePath(relativePath)
            return this.file.get(`/${path}`, signal)
        }

        post(relativePath, body) {
            const path = normalizePath(relativePath)
            return this.file.post(`/${path}`, body)
        }

        put(relativePath, body) {
            const path = normalizePath(relativePath)
            return this.file.put(`/${path}`, body)
        }

        delete(relativePath, body) {
            const path = normalizePath(relativePath)
            return this.user.delete(`/${path}`, body)
        }

        //Download file resource
        downloadResource(dataId, onProgress, signal) {
            return this.file.downloadResource(dataId, onProgress, signal)
        }

        partialDownloadResource(dataId, signal, onProgress) {
            return this.file.partialDownloadResource(dataId, signal, onProgress)
        }

        getReferences() {
            return this.file.getReferences()
        }

        // Get all viewpoint for file
        getViewPoints() {
            if (!this.file.getViewPoints) {
                throw new Error('Assembly not support viewpoint')
            }
            return this.file
                .getViewPoints()
                .then((data) => data.filter((viewpoint) => viewpoint.custom_fields.modelId === this.id))
        }

        // Add viewpoint for file
        postViewpoint(data) {
            if (!this.file.postViewpoint) {
                throw new Error('Assembly not support viewpoint')
            }
            return this.file.postViewpoint({ ...data, custom_fields: { modelId: this.id } })
        }

        // Get viewpoint by guid
        getViewpoint(guid) {
            if (!this.file.getViewpoint) {
                throw new Error('Assembly not support viewpoint')
            }
            return this.file.getViewpoint(guid)
        }

        // Delete viewpoint by guid
        deleteViewpoint(guid) {
            if (!this.file.deleteViewpoint) {
                throw new Error('Assembly not support viewpoint')
            }
            return this.file.deleteViewpoint(guid)
        }

        // Get snapshot data for view point by guid
        getSnapshot(guid) {
            if (!this.file.getSnapshot) {
                throw new Error('Assembly not support viewpoint')
            }
            return this.file.getSnapshot(guid)
        }

        // Get snapshot data for view point by guid
        getSnapshotData(guid, bitmapGuid) {
            if (!this.file.getSnapshotData) {
                throw new Error('Assembly not support viewpoint')
            }
            return this.file.getSnapshot(guid, bitmapGuid)
        }
    } ///////////////////////////////////////////////////////////////////////////////
    /* eslint no-unused-vars: off */
    class FileImpl {
        constructor(fileInfo, user) {
            this.fileInfo = fileInfo
            this.user = user
        }
        get id() {
            return this.fileInfo.id
        }
        /**
         * File operation api
         * */

        get(relativePath, signal) {
            const path = normalizePath(relativePath)
            return this.user.get(`/files/${this.id}${path}`, signal)
        }

        post(relativePath, body) {
            const path = normalizePath(relativePath)
            return this.user.post(`/files/${this.id}${path}`, body)
        }

        put(relativePath, body) {
            const path = normalizePath(relativePath)
            return this.user.put(`/files/${this.id}${path}`, body)
        }

        delete(relativePath, body) {
            const path = normalizePath(relativePath)
            return this.user.delete(`/files/${this.id}${path}`, body)
        }

        //Get object properties for specific file
        getProperties() {
            return json(this.get(`/properties`))
        }

        //Get object properties for specific file
        getProperty(id) {
            return json(this.get(`/properties?handle=${id}`))
        }

        //Get geometry metadata for specific file
        getModels() {
            return json(this.get(`/geometry`)).then((models) => models.map((data) => new ModelImpl(data, this)))
        }

        //Add geometry metadata for specific file
        postMetadata(metadata) {
            return json(this.post(`/geometry`, metadata))
        }

        //Upload file for downloads
        postFileDownloads(file, onProgress) {
            //todo: Check description
            const data = new FormData()
            data.append('file', file)
            return json(this.post(`/downloads`, data))
        }

        //Download file
        downloadFile() {
            return arrayBuffer(this.get(`/downloads`))
        }

        //Download file resource
        downloadResource(dataId, onProgress, signal) {
            return this.get(`/downloads/${dataId}`, signal)
                .then((response) => downloadProgress(response, onProgress))
                .then((response) => response.arrayBuffer())
        }

        async partialDownloadResource(dataId, signal, onProgress) {
            const path = normalizePath(`/files/${this.id}/downloads/${dataId}`)

            const response = await fetch(`${this.user.url}${path}`, {
                headers: this.user.headers,
                signal: signal
            })
            const contentLength = response.headers.get('content-length')
            const total = parseInt(contentLength, 10)

            let loaded = 0

            const reader = response.body.getReader()
            let condition = true
            while (condition) {
                const { done, value } = await reader.read()

                if (done) {
                    break
                }

                loaded += value.byteLength

                onProgress(loaded / total, value)
            }
        }

        //Show file info
        getFileInfo() {
            return json(this.get(`/`))
        }

        //Update file(name and preview)
        putFile(fileInfo) {
            return json(this.put(`/`, fileInfo))
        }

        //Remove file
        deleteFile() {
            return this.user.deleteFile(this.id)
        }

        //Get all markups for file
        getMarkupList() {
            return json(this.get(`/markup`)).then((list) => list.result.map((data) => new MarkupImpl(data, this)))
        }

        // Add markup to file
        postMarkup(markup) {
            return json(this.post(`/markup/`, markup))
        }

        // Delete markup by id
        deleteMarkup(markupId) {
            return json(this.delete(`/markup/${markupId}`))
        }

        // Get markup by id
        getMarkup(markupId) {
            return json(this.get(`/markup/${markupId}`))
        }

        // Create new Job
        createJob(outputFormat) {
            return this.user.postJob(this.id, outputFormat)
        }

        getReferences() {
            return json(this.get(`/references`))
        }

        putReferences(object) {
            return json(this.put(`/references`, object))
        }

        downloadReferenceFile(onProgress, signal) {
            return arrayBuffer(this.user.downloadReferenceFile(this.id, onProgress, signal))
        }

        // Get all viewpoint for file
        getViewPoints() {
            return json(this.get(`/viewpoints`)).then((list) => list.result)
        }

        // Add viewpoint for file
        postViewpoint(data) {
            return json(this.post(`/viewpoints`, data))
        }

        // Get viewpoint by guid
        getViewpoint(guid) {
            return json(this.get(`/viewpoints/${guid}`))
        }

        // Delete viewpoint by guid
        deleteViewpoint(guid) {
            return json(this.delete(`/viewpoints/${guid}`))
        }

        // Get snapshot data for view point by guid
        getSnapshot(guid) {
            return text(this.get(`/viewpoints/${guid}/snapshot`))
        }

        // Get snapshot data for view point by guid
        getSnapshotData(guid, bitmapGuid) {
            return text(this.get(`/viewpoints/${guid}/bitmaps/${bitmapGuid}`))
        }
    } ///////////////////////////////////////////////////////////////////////////////

    class JobImpl {
        constructor(data, user) {
            this.data = data
            this.user = user
        }

        get id() {
            return this.data.id
        }

        get done() {
            return this.data.state === 'done'
        }

        get state() {
            return this.data.state
        }

        get fileId() {
            return this.data.fileId
        }

        get assemblyId() {
            return this.data.assemblyId
        }

        get createdAt() {
            return this.data.createdAt
        }

        get startedAt() {
            return this.data.startedAt
        }

        get lastUpdate() {
            return this.data.lastUpdate
        }

        get outputFormat() {
            return this.data.outputFormat
        }

        // Status for specified job
        refresh() {
            return this.user
                .getJob(this.id)
                .then((data) => (this.data = data))
                .then(() => this)
        }

        // Update some parameters for specific job (available only for admins)
        editJob(data) {
            return this.user
                .editJob(this.id, data)
                .then((data) => (this.data = data))
                .then(() => this)
        }

        delete() {
            return this.user.deleteJob(this.id)
        }

        waitForDone() {
            return waitFor(() => this.refresh() && this.done)
        }
    } ///////////////////////////////////////////////////////////////////////////////

    class ProjectImpl {
        constructor(data, user) {
            this._data = data
            this._user = user
        }

        delete() {
            const { id } = this._data
            return this._user.delete(`/projects/${id}`)
        }

        save() {
            const { id } = this._data
            return json(this._user.put(`/projects/${id}`, this._data))
        }
    } ///////////////////////////////////////////////////////////////////////////////

    class AssemblyImpl {
        constructor(assemblyData, user) {
            this._data = assemblyData
            this._user = user
        }

        _get(relativePath, signal) {
            const path = normalizePath(relativePath || '')
            return this._user.get(`/assemblies/${this._data.id}${path}`, signal)
        }

        _post(relativePath, body) {
            const path = normalizePath(relativePath || '')
            return this._user.post(`/assemblies/${this._data.id}${path}`, body)
        }

        _put(relativePath, body) {
            const path = normalizePath(relativePath || '')
            return this._user.put(`/assemblies/${this._data.id}${path}`, body)
        }

        _delete(relativePath, body) {
            const path = normalizePath(relativePath || '')
            return this._user.delete(`/assemblies/${this._data.id}${path}`, body)
        }

        getProperties() {
            return json(this._get(`/properties`))
        }

        getProperty(id) {
            return json(this._get(`/properties?handle=${id}`))
        }

        getModels() {
            return json(this._get(`/geometry`)).then((models) => models.map((data) => new ModelImpl(data, this)))
        }

        downloadResource(dataId, onProgress, signal) {
            return this._get(`/downloads/${dataId}`, signal)
                .then((response) => downloadProgress(response, onProgress))
                .then((response) => response.arrayBuffer())
        }

        async partialDownloadResource(dataId, signal, onProgress) {
            const path = normalizePath(`/assemblies/${this._data.id}/downloads/${dataId}`)

            const response = await fetch(`${this._user.url}${path}`, {
                headers: this._user.headers,
                signal: signal
            })
            const contentLength = response.headers.get('content-length')
            const total = parseInt(contentLength, 10)

            let loaded = 0

            const reader = response.body.getReader()
            let condition = true
            while (condition) {
                const { done, value } = await reader.read()

                if (done) {
                    break
                }

                loaded += value.byteLength

                onProgress(loaded / total, value)
            }
        }

        delete() {
            return this._delete()
        }

        save() {
            return this._put('', this._data)
        }
    } ///////////////////////////////////////////////////////////////////////////////

    class UserImpl {
        constructor(data, url, opt) {
            this.data = data
            this.url = url
            this.headers = {
                Authorization: data.tokenInfo.token
            }
            this.opt = opt
            if (!this.opt) {
                throw new Error('opt can not be undefined')
            }
        }

        get(relativePath, signal) {
            const path = normalizePath(relativePath)
            return $get(`${this.url}${path}`, this.headers, signal)
        }

        post(relativePath, body) {
            const path = normalizePath(relativePath)
            return $post(`${this.url}${path}`, this.headers, body)
        }

        put(relativePath, body) {
            const path = normalizePath(relativePath)
            return $put(`${this.url}${path}`, this.headers, body)
        }

        delete(relativePath, body) {
            const path = normalizePath(relativePath)
            return $delete(`${this.url}${path}`, this.headers, body)
        }

        // ----------- Users ---------------

        //get all users
        getUsers() {
            return json(this.get(`/users`))
        }

        // My account information
        getUserInfo() {
            return json(this.get(`/user`))
        }

        // Update information in my account
        putUserInfo(userInfo) {
            return json(this.put(`/user`, userInfo))
        }

        save() {
            return this.putUserInfo(this.data)
        }

        // ----------- Files ---------------

        //Show file info
        getFile(fileId) {
            return json(this.get(`/files/${fileId}`)).then((data) => new FileImpl(data, this))
        }
        // Get all user files
        getFiles(start, limit, name, ext, ids, sortByDesc) {
            const query = []
            if (start !== undefined) {
                query.push('start=' + start)
            }

            if (limit !== undefined) {
                query.push('limit=' + limit)
            }

            if (name) {
                query.push('name=' + name)
            }

            if (ext) {
                query.push('ext=' + ext.toLowerCase())
            }

            if (ids) {
                query.push('id=' + ids.join('|'))
            }

            if (sortByDesc) {
                query.push('sortBy=desc')
            }

            const queryStr = query.length !== 0 ? '?' + query.join('&') : ''
            return json(this.get(`/files${queryStr}`)).then((list) => {
                return { ...list, result: list.result.map((fileInfo) => new FileImpl(fileInfo, this)) }
            })
        }

        // Upload new file
        postFile(file, onProgress) {
            const data = new FormData()
            data.append('file', file)

            return $XMLHttp(`${this.url}/files/`, {
                method: 'POST',
                headers: this.headers,
                body: data,
                uploadProgress: onProgress
            })
                .then((request) => JSON.parse(request.responseText))
                .then((data) => new FileImpl(data, this))
        }

        deleteFile(fileId, body) {
            return json(this.delete(`/files/${fileId}`, body))
        }
        // ----------- Jobs ---------------

        // Show all jobs
        getJobs(state = null, limit = null, start = null, sortByDesc = null) {
            const params = [
                state ? `${'state'}=${state}` : '',
                limit ? `${'limit'}=${limit}` : '',
                start ? `${'start'}=${start}` : '',
                sortByDesc ? `${'sortBy'}=desc` : ''
            ].filter((p) => p)

            const query = params.length ? `?${params.join('&')}` : ''

            return json(this.get(`/jobs${query}`)).then((list) => {
                return { ...list, result: list.result.map((data) => new JobImpl(data, this)) }
            })
        }

        // Create new Job
        postJob(fileId, outputFormat) {
            const parameters = this.opt.useVSFX ? { useVSFX: '' } : {}
            return json(
                this.post(`/jobs`, { fileId: fileId, outputFormat: outputFormat, parameters: parameters })
            ).then((data) => new JobImpl(data, this))
        }

        // Status for specified job
        getJob(jobId) {
            return json(this.get(`/jobs/${jobId}`)).then((data) => new JobImpl(data, this))
        }

        // Delete job by Id
        deleteJob(jobId) {
            return json(this.delete(`/jobs/${jobId}`))
        }

        // Edit jobs, available only for admins
        editJob(data) {
            return json(this.put(`/jobs/${this.id}`, data)).then((data) => new JobImpl(data, this))
        }

        downloadReferenceFile(fileId, onProgress, signal) {
            return this.get(`/files/${fileId}/downloads`, signal)
                .then((response) => downloadProgress(response, onProgress))
                .then((response) => response.arrayBuffer())
        }

        getProjects() {
            return json(this.get(`/projects`)).then((projectsData) => {
                return projectsData.map((data) => new ProjectImpl(data, this))
            })
        }

        createProject(name, description, startDate, endDate, avatarUrl) {
            return json(
                this.post(`/projects`, {
                    name: name,
                    description: description,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    avatarUrl: avatarUrl
                })
            ).then((data) => new ProjectImpl(data, this))
        }

        getProjectById(id) {
            return json(this.get(`/projects/${id}`)).then((data) => new ProjectImpl(data, this))
        }

        createAssembly(files, name) {
            return json(
                this.post(`/assemblies`, {
                    name: name,
                    files: files
                })
            ).then((data) => new AssemblyImpl(data, this))
        }

        getAssemblyById(id) {
            return json(this.get(`/assemblies/${id}`)).then((data) => new AssemblyImpl(data, this))
        }

        getAssemblies(start, limit, name, ids, sortByDesc) {
            const query = []
            if (start !== undefined) {
                query.push('start=' + start)
            }

            if (limit !== undefined) {
                query.push('limit=' + limit)
            }

            if (name) {
                query.push('name=' + name)
            }

            if (ids) {
                query.push('id=' + ids.join('|'))
            }

            if (sortByDesc) {
                query.push('sortBy=desc')
            }

            const queryStr = query.length !== 0 ? '?' + query.join('&') : ''
            return json(this.get(`/assemblies${queryStr}`)).then((assemblies) => {
                return {
                    ...assemblies,
                    result: assemblies.result.map((data) => new AssemblyImpl(data, this))
                }
            })
        }

        deleteAssembly(id) {
            return json(this.delete(`/assemblies/${id}`))
        }
    } ///////////////////////////////////////////////////////////////////////////////
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

    /**
     * @class
     */
    class Model {
        constructor(impl, file, assembly) {
            this._impl = impl
            this._file = file
            this._assembly = assembly
        }

        /**
         * @type {File}
         */
        get file() {
            return this._file
        }

        /**
         * @type {Assembly}
         */
        get assembly() {
            return this._assembly
        }

        /**
         * @type {boolean}
         */
        get default() {
            return this._impl.data.default
        }

        /**
         * @type {string}
         */
        get database() {
            return this._impl.data.database
        }

        /**
         * @type {string}
         */
        get fileId() {
            return this._impl.data.fileId
        }

        /**
         * @type {string[]}
         */
        get geometry() {
            return this._impl.data.geometry
        }

        /**
         * @type {string}
         */
        get id() {
            return this._impl.data.id
        }

        /**
         * @type {string}
         */
        get name() {
            return this._impl.data.name
        }

        /**
         * @type {string}
         */
        get version() {
            return this._impl.data.version
        }

        /**
         * Get file model viewpoints
         * @function
         * @async
         * @returns {Viewpoint[]}
         */
        getViewpoints() {
            return this._impl.getViewPoints()
        }

        /**
         * Save viewpoint
         * @param {*} viewpointData
         * @async
         * @returns {Viewpoint}
         */
        saveViewpoint(viewpointData) {
            return this._impl.postViewpoint(viewpointData)
        }

        /**
         * Delete viewpoint by id
         * @function
         * @param {string} viewpointId
         * @async
         * @returns {Object}
         */
        deleteViewpoint(viewpointId) {
            return this._impl.deleteViewpoint(viewpointId)
        }

        /**
         * Get snapshot by id
         * @param {string} guid
         * @async
         * @returns {Object}
         */
        getSnapshot(guid) {
            return this._impl.getSnapshot(guid)
        }

        /**
         * Get snapshot data by guid and bitmapGuid
         * @function
         * @async
         * @param {string} guid
         * @param {string} bitmapGuid
         * @returns {ArrayBuffer}
         */
        getSnapshotData(guid, bitmapGuid) {
            return this._impl.getSnapshotData(guid, bitmapGuid)
        }

        /**
         * Download resource by id
         * @async
         * @param {string} dataId - dataId
         * @param {function} onProgress - onprogress callback
         * @param {AbortSignal} signal - signal for cancellation
         * @returns {ArrayBuffer} - binary data
         */
        downloadResource(dataId, onProgress, signal) {
            return this._impl.downloadResource(dataId, onProgress, signal)
        }

        /**
         * Download resource by id use fetch
         * @async
         * @param {string} dataId - dataId
         * @param {function} onProgress - onprogress callback
         * @param {AbortSignal} signal - signal for cancellation
         * @returns {void}
         */
        partialDownloadResource(dataId, signal, onProgress) {
            return this._impl.partialDownloadResource(dataId, signal, onProgress)
        }

        /**
         * File Reference
         * @typedef {Object} Reference
         * @property {string} id - id of file reference
         * @property {string} name - name of file reference, ex "font1.ttf"
         */

        /**
         * File references
         * @typedef {Object} References
         * @property {string} fileId - url to visualizeJS
         * @property {Reference[]} references - array of references for fileId
         * }
         */

        /**
         * Get snapshot data by guid and bitmapGuid
         * @function
         * @async
         * @returns {References}
         */
        getReferences() {
            return this._impl.getReferences()
        }
    } ///////////////////////////////////////////////////////////////////////////////

    /**
     * @class
     */
    class Project {
        constructor(impl, app) {
            this._impl = impl
            this.app = app
        }

        /**
         * Project id
         * @type {(string)}
         */
        get id() {
            return this._impl._data.id
        }
        /**
         * Project name
         * @type {(string)}
         */
        get name() {
            return this._impl._data.name
        }

        set name(value) {
            this._impl._data.name = value
        }
        /**
         * Project authorization for current user
         * @type {(Object)}
         */
        get authorization() {
            return this._impl._data.authorization
        }
        /**
         * Project created date in ISO string
         * @type {(string)}
         */
        get createdAt() {
            return this._impl._data.createdAt
        }
        /**
         * Project last update date in ISO string
         * @type {(string)}
         */
        get updatedAt() {
            return this._impl._data.updatedAt
        }
        /**
         * Project start date in ISO string
         * @type {(string)}
         */
        get startDate() {
            return this._impl._data.startDate
        }

        set startDate(value) {
            this._impl._data.startDate = value.toISOString()
        }
        /**
         * Project start date in ISO string
         * @type {(string)}
         */
        get endDate() {
            return this._impl._data.endDate
        }

        set endDate(value) {
            this._impl._data.endDate = value.toISOString()
        }
        /**
         * Project detail description
         * @type {(string)}
         */
        get description() {
            return this._impl._data.description
        }

        set description(value) {
            this._impl._data.description = value
        }
        /**
         * Project avatar url (base64 image)
         * @type {(string)}
         */
        get avatarUrl() {
            return this._impl._data.avatarUrl
        }

        set avatarUrl(value) {
            this._impl._data.avatarUrl = value
        }
        /**
         * Project custom fields
         * @type {(Object)}
         */
        get customFields() {
            return this._impl._data.customFields
        }

        set customFields(value) {
            this._impl._data.customFields = value
        }
        /**
         * Project public flag
         * @type {(Object)}
         */
        get public() {
            return this._impl._data.public
        }

        set public(value) {
            this._impl._data.public = value
        }

        /**
         * Save project
         */
        save() {
            return this._impl.save()
        }

        /**
         * Delete project
         */
        delete() {
            return this._impl.delete()
        }
    } ///////////////////////////////////////////////////////////////////////////////

    /**
     * @class
     */
    class User {
        constructor(impl, plugin) {
            this._impl = impl
            this._plugin = plugin
        }

        /**
         * Raw object of user
         * @type {Object}
         */
        get data() {
            return this._impl.data
        }

        /**
         * Get avatar image url
         * @returns {string}
         */ /**
         * Set avatar image url, and send save request
         * @param {string} val
         * @returns {this}
         */ get avatarImage() {
            return this._impl.data.avatarImage
        }
        set avatarImage(v) {
            this._impl.data.avatarImage = v
            this._impl.save()
        }

        /**
         * Is user possible to create a project
         * @type {Boolean}
         */
        get canCreateProject() {
            return this._impl.data.canCreateProject
        }

        /**
         * Time when user was created
         * @type {string}
         */
        get createAt() {
            return this._impl.data.createAt
        }

        /**
         * Custom fields object, to save custom data
         * @type {*}
         */
        get customFields() {
            return this._impl.data.customFields
        }

        /**
         * User email
         * @type {string}
         */
        get email() {
            return this._impl.data.email
        }

        /**
         * Get first name of user
         * @returns {string}
         */ /**
         * Set first name of user, and send save request
         * @param {string} val
         * @returns {this}
         */ get firstName() {
            return this._impl.data.firstName
        }
        set firstName(v) {
            this._impl.data.firstName = v
            this._impl.save()
        }

        /**
         * Date of last modify user data
         * @type {string}
         */
        get lastModified() {
            return this._impl.data.lastModified
        }

        /**
         * Get last name of user
         * @returns {string}
         */ /**
         * Set last name of user, and send save request
         * @param {string} val
         * @returns {this}
         */ get lastName() {
            return this._impl.data.lastName
        }
        set lastName(v) {
            this._impl.data.lastName = v
            this._impl.save()
        }

        /**
         * Date of last sign in
         * @type {string}
         */
        get lastSignIn() {
            return this._impl.data.lastSignIn
        }

        /**
         * Projects limit to create
         * @type {Number}
         */
        get projectsLimit() {
            return this._impl.data.projectsLimit
        }

        /**
         * Get user name of user
         * @returns {string}
         */ /**
         * Set user name of user, and send save request
         * @param {string} val
         * @returns {this}
         */ get userName() {
            return this._impl.data.userName
        }
        set userName(v) {
            this._impl.data.userName = v
            this._impl.save()
        }

        /**
         * Returns result with array of available users
         * @returns {Object}
         */
        getUsers() {
            return this._impl.getUsers()
        }
    } ///////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////

    /**
     * @class
     */
    class Job {
        constructor(impl, app) {
            this._impl = impl
            this._app = app
        }

        /**
         * Owner
         * @type {User}
         */
        get user() {
            return new User(this.impl.user, this._app)
        }

        /**
         * Job id
         * @type {string}
         */
        get id() {
            return this._impl.id
        }

        /**
         * Job done status
         * @type {boolean}
         */
        get done() {
            return this._impl.done
        }

        /**
         * Job state
         * @type {string}
         */
        get state() {
            return this._impl.state
        }

        /**
         * Job fileId
         * @type {string}
         */
        get fileId() {
            return this._impl.fileId
        }

        /**
         * Job assemblyId
         * @type {string}
         */
        get assemblyId() {
            return this._impl.assemblyId
        }

        /**
         * Job created at
         * @type {string}
         */
        get createdAt() {
            return this._impl.createdAt
        }

        /**
         * Job started at
         * @type {string}
         */
        get startedAt() {
            return this._impl.startedAt
        }

        /**
         * Job last update
         * @type {string}
         */
        get lastUpdate() {
            return this._impl.lastUpdate
        }

        /**
         * Update current job status
         * @async
         */
        refresh() {
            return this._impl.refresh()
        }

        /**
         * Update some parameters for specific job (available only for admins)
         * @async
         */
        editJob(data) {
            return this._impl.editJob(data)
        }

        /**
         * Delete job
         * @async
         */
        delete() {
            return this._impl.delete()
        }
    } ///////////////////////////////////////////////////////////////////////////////

    /**
     * @class
     */
    class File {
        constructor(impl, app) {
            this._impl = impl
            this.app = app
        }

        /**
         * File owner - user
         * @type {User}
         */
        get user() {
            return new User(this._impl.user, this.app)
        }

        /**
         *  Created time
         * @type {(number|string)}
         */
        get created() {
            return this._impl.fileInfo.created
        }

        /**
         * Exports array
         * @type {Object[]}
         */
        get exports() {
            return this._impl.fileInfo.exports
        }

        /**
         * File id
         * @type {string}
         */
        get id() {
            return this._impl.fileInfo.id
        }

        /**
         * Metadata
         * @type {boolean}
         */
        get metadata() {
            return this._impl.fileInfo.metadata
        }

        /**
         * User id
         * @type {string}
         */
        get owner() {
            return this._impl.fileInfo.owner
        }

        /**
         * Base64 image preview, get/set
         * @type {string}
         */
        get preview() {
            return this._impl.fileInfo.preview
        }
        set preview(base64) {
            this._impl.fileInfo.preview = base64
        }

        /**
         * Have generated properties
         * @type {boolean}
         */
        get properties() {
            return this._impl.fileInfo.properties
        }

        /**
         * File size
         * @type {number}
         */
        get size() {
            return this._impl.fileInfo.size
        }

        /**
         * File type
         * @type {string}
         */
        get type() {
            return this._impl.fileInfo.type
        }

        /**
         * Server version
         * @type {string}
         */
        get version() {
            return this._impl.fileInfo.version
        }

        /**
         * Get and set file name
         * @type {string}
         */
        get name() {
            return this._impl.fileInfo.name
        }
        set name(newName) {
            this._impl.fileInfo.name = newName
        }

        /**
         * Get geometry status (waiting inprogress done failed)
         * @type {string}
         */
        get geometryStatus() {
            return this._impl.fileInfo.geometryStatus
        }

        /**
         * Get properties status (waiting inprogress done failed)
         * @type {string}
         */
        get propertiesStatus() {
            return this._impl.fileInfo.propertiesStatus
        }

        /**
         * Get file models
         * @function
         * @async
         * @returns {Model[]}
         */
        getModels() {
            return this._impl.getModels().then((models) => models.map((modelImpl) => new Model(modelImpl, this)))
        }

        /**
         * Get property by id
         * @param {string} id
         * @async
         * @returns {Object} - property object
         */
        getProperty(id) {
            return this._impl.getProperty(id)
        }

        /**
         * Get all properties
         * @async
         * @returns {Property[]} - properties array
         */
        getProperties() {
            return this._impl.getProperties()
        }

        /**
         * GetViewpoints
         * @async
         * @returns {Viewpoint[]} - viewpoints array
         */
        getViewPoints() {
            return this._impl.getViewPoints()
        }

        /**
         * Delete file
         * @async
         * @returns {Object} -
         */
        delete() {
            return this._impl.deleteFile()
        }

        /**
         * Download resource by id
         * @async
         * @param {string} dataId - dataId
         * @param {string} onProgress - onprogress callback
         * @param {AbortSignal} signal - signal for cancellation
         * @returns {ArrayBuffer} - binary data
         */
        downloadResource(dataId, onProgress, signal) {
            return this._impl.downloadResource(dataId, onProgress, signal)
        }

        /**
         * Save file changes
         * @async
         * @returns {Object}
         */
        save() {
            return this._impl.putFile(this._impl.fileInfo)
        }

        /**
         * Update file data
         * @async
         * @returns {File}
         */
        checkout() {
            return this._impl
                .getFileInfo()
                .then((info) => (this._impl.fileInfo = info))
                .then(() => this)
        }

        /**
         * Update file data
         * @async
         * @param {References}
         * @returns {References}
         */
        createReferences(object) {
            return this.putReferences(object)
        }

        /**
         * Get file references
         * @async
         * @returns {References}
         */
        getReferences() {
            return this._impl.getReferences()
        }

        /**
         * Change file references
         * @async
         * @returns {References}
         */
        putReferences(object) {
            return this._impl.putReferences(object)
        }

        /**
         * Create job for extract geometry
         * @async
         * @returns {Job}
         */
        extractGeometry() {
            return this._impl.createJob('geometry').then((jobImpl) => new Job(jobImpl, this.app))
        }

        /**
         * Create job for extract properties
         * @async
         * @returns {Job}
         */
        extractProperties() {
            return this._impl.createJob('properties').then((jobImpl) => new Job(jobImpl, this.app))
        }
    } ///////////////////////////////////////////////////////////////////////////////
    /* eslint no-unused-vars: off */

    /**
     * @class
     */
    class JobUpdater {
        constructor(userImpl, plugin) {
            this._userImpl = userImpl
            this._plugin = plugin
            this._intervalId = 0

            /**
             * Interval for update jobs
             * @type {Number}
             */
            this.interval = 5000

            /**
             * Array of jobs
             * @type {Job[]}
             */
            this.jobs = []
        }

        /**
         * Start to update jobs periodicals
         * @function
         */
        start() {
            this._intervalId = setInterval(() => {
                this.update()
            }, this.interval)
        }

        /**
         * Update job function, it invokes automatic when run "Start"
         * @function
         * @async
         */
        async update() {
            function completed(one, two) {
                return one.filter((job1) => !two.find((job2) => job1.id === job2.id))
            }

            const jobs = [
                ...(await this._userImpl.getJobs('running')).result,
                ...(await this._userImpl.getJobs('waiting')).result
            ]
            const completedJobs = completed(this.jobs, jobs)
            this.jobs = jobs

            const completedFiles = await completedJobs.reduce((acc, job) => {
                return acc.then((arr) => {
                    return this._userImpl.getFile(job.fileId).then((file) => arr.push(file) && arr)
                })
            }, Promise.resolve([]))

            completedFiles.length &&
                this._plugin.emit({
                    type: 'jobs-complete',
                    data: completedFiles.map((fileImpl) => new File(fileImpl, this._plugin))
                })
        }

        /**
         * Start to update jobs periodicals
         * @function
         */
        stop() {
            clearInterval(this._intervalId)
            this._intervalId = 0
        }
    }
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = url
            script.async = true
            script.onload = resolve
            script.onerror = reject
            document.body.appendChild(script)
        })
    }

    /**
     * @class
     */
    class EventEmitter$1 {
        /**
         * @constructor
         */
        constructor() {
            this.draggers = []

            this.emitEvent = this.emitEvent.bind(this)
        }
        addDragger(dragger, events) {
            const subscriber = {
                dragger,
                events: events.map((key) => ({
                    key,
                    fn: (event) => dragger[key] && dragger[key](event)
                }))
            }
            subscriber.events.forEach((ev) => this.addEventListener(ev.key, ev.fn))
            this.draggers.push(subscriber)
        }
        removeDragger(dragger) {
            const draggers = this.draggers.filter((d) => d.dragger === dragger)
            draggers.forEach((dragger) => {
                dragger.events.forEach((ev) => this.removeEventListener(ev.key, ev.fn))
            })
            this.draggers = this.draggers.filter((d) => d.dragger !== dragger)
        }
        addEventListener(type, listener) {
            if (this._listeners === undefined) this._listeners = {}

            const listeners = this._listeners

            if (listeners[type] === undefined) {
                listeners[type] = []
            }
            if (listeners[type].indexOf(listener) === -1) {
                listeners[type].push(listener)
            }
        }
        removeEventListener(type, listener) {
            if (this._listeners === undefined) return

            const listeners = this._listeners
            const listenerArray = listeners[type]

            if (listenerArray !== undefined) {
                const index = listenerArray.indexOf(listener)
                if (index !== -1) {
                    listenerArray.splice(index, 1)
                }
            }
        }

        emitEvent(event) {
            if (this._listeners === undefined) return

            const listeners = this._listeners
            const listenerArray = listeners[event.type]

            if (listenerArray !== undefined) {
                if (!event.target) {
                    event.target = this
                }

                // Make a copy, in case listeners are removed while iterating.
                const array = listenerArray.slice(0)
                for (let i = 0, l = array.length; i < l; i++) {
                    array[i].call(this, event)
                }
                if (event.target === this) {
                    event.target = null
                }
            }
        }

        removeAllListeners() {
            this._listeners = []
        }

        attach(element, eventType) {
            return element.addEventListener(eventType, this.emitEvent)
        }
        detach(element, eventType) {
            return element.removeEventListener(eventType, this.emitEvent)
        }
    }

    const loadVisualizeJS = (url, onprogress) => {
        return loadScript(url).then(() => {
            return new Promise((resolve) => {
                const instance = window['getVisualizeLibInst']({
                    urlMemFile: url + '.wasm'
                })
                instance.postRun.push(() => resolve(instance))
            })
        })
    }

    class OdaGeAction {
        constructor(module) {
            this.m_module = module
        }

        getViewer() {
            return this.m_module.getViewer()
        }

        getModel() {
            return this.getViewer().getMarkupModel()
        }

        copyPoint(point) {
            const p = new this.m_module.Point3d()
            p.set(point.x, point.y, point.z)
            return p
        }

        createVector3d() {
            return new this.m_module.Vector3d()
        }

        createPoint3d() {
            return new this.m_module.Point3d()
        }

        createMatrix3d() {
            return new this.m_module.Matrix3d()
        }

        createPlane() {
            return new this.m_module.OdTvPlane()
        }

        toVector(geVector) {
            return this.m_module.Vector3d.createFromArray(geVector)
        }

        toGeVector(v) {
            return [v.x, v.y, v.z]
        }

        toGePoint(point) {
            return [point.x, point.y, point.z]
        }

        toPoint(gePoint) {
            return this.m_module.Point3d.createFromArray(gePoint)
        }

        screenToWorld(x, y) {
            return this.toPoint(this.m_module.getViewer().screenToWorld(x, y))
        }

        toDoubleArray(points) {
            const p = []
            for (let i = 0; i < points.length; i++) {
                p.push(points[i].x)
                p.push(points[i].y)
                p.push(points[i].z)
            }
            return p
        }

        correctCameraTarget() {
            const params = this.getViewParams()
            let ext = this.m_module.getViewer().getActiveExtents()
            const { min, max } = ext
            const target = this.toGePoint(params.target)

            const contains =
                target.x >= min.x &&
                target.y >= min.y &&
                target.z >= min.z &&
                target.x <= max.x &&
                target.y <= max.y &&
                target.z <= max.z
            if (!contains) {
                params.target = ext.center()
                this.setViewParams(params)
            }
        }

        setViewParams(params) {
            const extView = this.m_module.getViewer().getActiveTvExtendedView()
            extView.setView(
                params.position,
                params.target,
                params.upVector,
                params.viewFieldWidth,
                params.viewFieldHeight,
                params.perspective
            )
            // extView.delete && extView.delete()
        }

        getViewParams() {
            const view = this.m_module.getViewer().activeView

            const obj = {
                position: view.viewPosition,
                target: view.viewTarget,
                upVector: view.upVector,
                viewFieldWidth: view.viewFieldWidth,
                viewFieldHeight: view.viewFieldHeight,
                perspective: view.perspective
            }
            // view.delete && view.delete()

            return obj
        }
    } ///////////////////////////////////////////////////////////////////////////////

    const CLICK_DELTA = 5
    const OVERLAY_VIEW_NAME = '$OVERLAY_VIEW_NAME'

    class OdBaseDragger extends OdaGeAction {
        constructor(subject) {
            super(subject.visualizeJs)
            this.subject = subject
            this.needInputText = false
            this.touchStartPoints = { x: 0, y: 0 }
            this.touchEndPoints = { x: 0, y: 0 }
            this.mouseDownPosition = { x: 0, y: 0 }
            this.autoSelect = false
            this.onmessage = new Function()

            this.onmessage = (event) => this.subject.emitEvent(event)

            this.m_module.canvas.addEventListener('mousedown', this.mousedown.bind(this))
            this.m_module.canvas.addEventListener('mouseup', this.mouseup.bind(this))
            this.m_module.canvas.addEventListener('mousemove', this.mousemove.bind(this))
            this.m_module.canvas.addEventListener('touchstart', this.touchstart.bind(this))
            this.m_module.canvas.addEventListener('touchend', this.touchend.bind(this))
            this.m_module.canvas.addEventListener('touchmove', this.touchmove.bind(this))
        }

        dispose() {
            this.m_module.canvas.removeEventListener('mousedown', this.mousedown.bind(this))
            this.m_module.canvas.removeEventListener('mouseup', this.mouseup.bind(this))
            this.m_module.canvas.removeEventListener('mousemove', this.mousemove.bind(this))
            this.m_module.canvas.removeEventListener('touchstart', this.touchstart.bind(this))
            this.m_module.canvas.removeEventListener('touchend', this.touchend.bind(this))
            this.m_module.canvas.removeEventListener('touchmove', this.touchmove.bind(this))
            // this.subject.eventEmitter.removeDragger(this)
        }

        relativeCoords(event) {
            const bounds = event.target.getBoundingClientRect()
            event.touches && event.touches[0] && (event = event.touches[0])
            const x = event.clientX - bounds.left
            const y = event.clientY - bounds.top
            const rect = this.m_module.canvas.getBoundingClientRect()
            const left = rect.left
            const top = rect.top
            const right = rect.right
            const bottom = rect.bottom
            if (x <= left || x >= right || y <= top || y >= bottom) {
                return { x: x * window.devicePixelRatio, y: y * window.devicePixelRatio, isValid: false }
            }
            return { x: x * window.devicePixelRatio, y: y * window.devicePixelRatio, isValid: true }
        }

        touchstart(ev) {
            if (ev.touches.length > 1) {
                ev.preventDefault()
            }
            const relCoord = this.relativeCoords(ev)
            this.isDragging = true
            this.touchStartPoints.x = relCoord.x
            this.touchStartPoints.y = relCoord.y
            this.touchEndPoints.x = relCoord.x
            this.touchEndPoints.y = relCoord.y
            this.start(relCoord.x, relCoord.y)
            this.onmessage({ type: 'update' })
        }

        touchend(ev) {
            this.end(this.touchEndPoints.x, this.touchEndPoints.y)
            this.isDragging = false
            this.onmessage({ type: 'update' })
        }

        touchmove(ev) {
            const relCoord = this.relativeCoords(ev)
            // ev.touches[0]
            this.touchEndPoints.x = relCoord.x
            this.touchEndPoints.y = relCoord.y
            this.drag(
                relCoord.x,
                relCoord.y,
                this.touchStartPoints.x - relCoord.x,
                this.touchStartPoints.y - relCoord.y
            )
            if (this.isDragging) {
                this.onmessage({ type: 'update' })
            }
        }

        mousedown(ev) {
            const relCoord = this.relativeCoords(ev)
            this.isDragging = true
            this.mouseDownPosition = { x: relCoord.x, y: relCoord.y }
            this.start(this.mouseDownPosition.x, this.mouseDownPosition.y, ev.clientX, ev.clientY)
            this.onmessage({ type: 'update' })
        }

        mouseup(ev) {
            const relCoord = this.relativeCoords(ev)
            this.end(relCoord.x, relCoord.y)
            this.isDragging = false
            this.onmessage({ type: 'update' })
        }

        mouseleave(ev) {
            this.mouseup(ev)
        }

        mousemove(ev) {
            const relCoord = this.relativeCoords(ev)
            if (!relCoord.isValid) {
                this.mouseup(ev)
                return
            }
            this.drag(relCoord.x, relCoord.y, ev.movementX, ev.movementY)
            if (this.isDragging) {
                this.onmessage({ type: 'update' })
            }
        }

        click(ev) {}

        dblclick(ev) {}

        start(x, y) {}

        drag(x, y) {}

        end(x, y) {}

        beginInteractivity() {}

        endInteractivity() {}

        getActiveMarkupEntity(type) {
            return undefined
        }

        deleteAll(objects) {}
    } ///////////////////////////////////////////////////////////////////////////////

    class OdPanDragger extends OdBaseDragger {
        constructor(...args) {
            super(...args)
            this.press = false

            // this.m_module.getViewer().setEnableAutoSelect(true)
        }

        start(x, y) {
            this.press = true
            this.m_start = this.screenToWorld(x, y)
            // this.beginInteractivity()
        }

        drag(x, y, dltX, dltY) {
            if (this.press) {
                const { Vector3d } = this.m_module
                const params = this.getViewParams()
                const pt = this.screenToWorld(x, y)

                const ptSub = this.m_start.sub(pt)
                const delta = ptSub.asVector()

                const target = Vector3d.createFromArray(params.target)
                const targetWithDelta = target.add(delta)
                params.target = targetWithDelta.toArray()

                const position = Vector3d.createFromArray(params.position)
                const positionWithDelta = position.add(delta)
                params.position = positionWithDelta.toArray()

                this.setViewParams(params)
            }
        }

        end(x, y) {
            this.press = false
            // this.endInteractivity()
            // this.m_start && this.m_start.delete()
            this.m_start = null
        }
    } ///////////////////////////////////////////////////////////////////////////////

    function setupViewerSettings(lib) {}
    /**
     * Client viewer class
     * There are many instances may be in project
     * @class
     */
    class Viewer {
        /**
         * Viewer Options
         * @typedef {Object} ViewerOptions
         * @property {string} visualizeJsUrl - url to visualizeJS
         */

        /**
         * @constructor
         * @param {Viewer} api
         */
        constructor(api) {
            this.api = api

            this._changeClientOptionCb = (event) => {
                const opt = event.data
                this.syncOptions(opt)
            }

            this.api.eventEmitter.on('changeClientOption', this._changeClientOptionCb)

            /**
             * @type {ViewerOptions}
             */
            this.opt = { visualizeJsUrl: 'http://localhost:3000/Visualize.js' }
            this._activeDragger = null
            this.visualizeJs = null

            /**
             * @type {EventEmitter}
             */
            this.eventEmitter = new EventEmitter$1()

            /**
             * Dragger factory
             * @type {Map}
             * @example draggerFactory.set("Line", OdaLineDragger);
             */
            this.draggerFactory = new Map()
            this.draggerFactory.set('Pan', OdPanDragger)

            let time = new Date()
            let count = 0
            let total = 0

            this.render = () => {
                this.frameId = requestAnimationFrame(this.render)

                const now = new Date()

                this.visViewer().update()

                const delta = now.getTime() - time.getTime()
                total += delta
                count++
                console.log(total, count, Math.round(total / count) + 's', delta)
                time = now
            }
        }

        syncOptions(opt) {}
        configure(opt) {
            // this.opt = opt
            return this
        }
        initializeAsync(canvas, onprogress = null) {
            if (canvas.style.width === '' && canvas.style.height === '') {
                canvas.style.width = '100%'
                canvas.style.height = '100%'
            }

            return loadVisualizeJS(this.opt.visualizeJsUrl, (ev) => {
                const { loaded, timeStamp, total, lengthComputable } = ev
                const event = { loaded, timeStamp, total, lengthComputable, type: 'visualize-progress' }
                onprogress && onprogress(event)
            })
                .then((visualizeJs) => (this.visualizeJs = visualizeJs))
                .then(() => {
                    canvas.width = canvas.clientWidth * window.devicePixelRatio
                    canvas.height = canvas.clientHeight * window.devicePixelRatio
                    this.visualizeJs.canvas = canvas
                    this.visualizeJs.Viewer.create()
                })
                .then(() => {
                    this.eventEmitter.attach(window, 'resize')

                    this.eventEmitter.addEventListener('resize', (ev) => {
                        const { clientWidth, clientHeight } = canvas
                        canvas.height = clientHeight * window.devicePixelRatio
                        canvas.width = clientWidth * window.devicePixelRatio

                        this.visViewer().resize(0, canvas.width, canvas.height, 0)
                    })
                })
                .then(() => this.render())
                .then(() => Promise.resolve(this))
        }
        get draggers() {
            return [...this.draggerFactory.keys()]
        }
        activeDragger() {
            return this._activeDragger
        }
        setActiveDragger(name) {
            const Constructor = this.draggerFactory.get(name)
            if (!(this._activeDragger instanceof Constructor)) {
                this._activeDragger && this._activeDragger.dispose()
                this._activeDragger = null
                this._activeDragger = new Constructor(this)
            }
        }
        visLib() {
            return this.visualizeJs
        }
        visViewer() {
            return this.visualizeJs.getViewer()
        }
        clearSlices() {}
        clearOverlay() {}
        is3D() {
            const ext = this.visViewer().getActiveExtents()
            const min = ext.min()
            const max = ext.max()
            const extHeight = max[2] - min[2]
            const is3D = extHeight !== 0
            return is3D
            //return this.visViewer().activeView.upVector[1] >= 0.95;
        }
        dispose() {
            if (this.visLib()) {
                if (this.activeDragger()) {
                    this.activeDragger().dispose()
                }
                this.visViewer().clear()
            }
            this.eventEmitter.removeEventListener()
            this._abortController && this._abortController.abort()
            this.api.eventEmitter.remove('changeClientOption', this._changeClientOptionCb)
        }
        addEventListener(name, cb) {
            this.eventEmitter.addEventListener(name, cb)
        }
        removeEventListener(name, cb) {
            this.eventEmitter.removeEventListener(name, cb)
        }
        emitEvent(event) {
            this.eventEmitter.emitEvent(event)
        }
        getSelected() {
            const result = []
            return result
        }

        /**
         * Load references like images, fonts, other files to view model correctly
         * @function
         * @async
         * @param {Model} model - model
         * @returns {Promise}
         */
        async loadReferences(model) {}

        async openVsfxStream(model) {
            const abortController = new AbortController()
            this._abortController = abortController

            this.emitEvent({ type: 'geometry-start', data: model })
            this.visViewer().clear()
            this.visViewer().update()
            let isFireDatabaseChunk = false
            try {
                await model.partialDownloadResource(model.database, abortController.signal, (progress, value) => {
                    this.visViewer().parseVsfx(value)
                    // this.render()
                })
                this.emitEvent({ type: 'geometry-end', data: model })
            } catch (error) {
                this.emitEvent({ type: 'error', data: error.message || error })
                throw error
            }
            return this
        }

        /**
         * Open file or model
         * @function
         * @async
         * @param {(Model|File)} model - model
         * @returns {Promise}
         */
        async open(object) {
            this.cancel()

            let model = object
            if (object.getModels) {
                const models = await object.getModels()
                model = models.find((model) => model.default)
            }

            await this.openVsfxStream(model)
        }

        /**
         * Open file or model
         * @function
         * @param {(Uint8Array|ArrayBuffer)} binary - data of .vsf file
         * @returns {Viewer}
         */
        // openVsfFile(binary) {
        //     if (!binary instanceof Uint8Array) {
        //         binary = new Uint8Array(binary)
        //     }
        //     this.visViewer().parseFile(binary)
        //     this.syncOptions(this.api.options)
        //     setupViewerSettings(this.visLib())
        //     return this
        // }

        /**
         * Cancel asynchronous open model | file
         * @function
         * @returns {Viewer}
         */
        cancel() {
            this._abortController && this._abortController.abort()
            return this
        }
    }

    /**
     * Common api
     * @class
     */
    class Client {
        constructor(options) {
            this._url = options.serverUrl
            this.user = null
            this.eventEmitter = new EventEmitter()
            this.jobUpdater = null
            this._options = {}
            // this._options = {}new Options(this.eventEmitter)
        }

        /**
         * Url api
         * @type {string}
         */
        get url() {
            return this._url
        }

        /**
         * Options
         * @type {Options}
         */
        get options() {
            return this._options
        }

        /**
         * Create Viewer options
         * @typedef {Object} ViewerOptions
         * @property {HTMLCanvasElement} target
         * @property {String} [visualizeJsUrl]
         * @property {VisualizeJSProgressCallback} [onprogress = null]
         */

        /**
         * Create instance of Viewer
         * @param {ViewerOptions} options
         * @returns {Viewer}
         */
        createViewer(options) {
            const viewer = new Viewer(this)
            if (options.visualizeJsUrl) {
                viewer.configure({ visualizeJsUrl: options.visualizeJsUrl })
            }
            return viewer.initializeAsync(options.target, options.onprogress)
        }

        /**
         * Api Options
         * @typedef {Object} ClientOptions
         * @property {string} url - url to Open Cloud
         */

        /**
         * Configure Client
         * @param {ClientOptions}
         * @returns {Api}
         */
        configure(options) {
            this._url = options.url
            return this
        }

        /**
         * Client initialize Callback
         *
         * @callback InitializeCallback
         * @param {ClientEvent} event - Api event
         */

        /**
         * Subscribe Client Events
         * @param {string} name
         * @param {InitializeCallback} callback
         */
        on(name, callback) {
            this.eventEmitter.on(name, callback)
        }

        /**
         * Unsubscribe Client Events
         * @param {string} name
         * @param {InitializeCallback} callback
         */
        removeEventListener(name, callback) {
            this.eventEmitter.remove(name, callback)
        }

        /**
         * Remove all api events
         */
        removeAllListeners() {
            this.eventEmitter.clear()
        }

        /**
         * Client Options
         * @typedef {Object} ClientEvent
         * @property {string} type - url to visualizeJS
         * @property {*} data - data event
         */

        emit(event) {
            this.eventEmitter.emit(event)
        }

        /**
         * @typedef FileListResult
         * @type {object}
         * @property {number} allSize
         * @property {number} limit
         * @property {File[]} list
         * @property {number} size
         * @property {number} start
         */

        /**
         * Get file list
         * @async
         * @param {number} start
         * @param {number} count
         * @param {string} name
         * @param {string} ext
         * @param {Array<string>} ids
         * @param {string} sortByDesc
         * @returns {FileListResult}
         */
        async getFileList(start, count, name, ext, ids, sortByDesc) {
            const { allSize, limit, result, size } = await this.user.getFiles(start, count, name, ext, ids, sortByDesc)
            return {
                allSize,
                limit,
                list: result.map((fileImpl) => new File(fileImpl, this)),
                size,
                start
            }
        }

        /**
         * Get file by Id
         * @async
         * @param {string} fileId
         * @returns {File}
         */
        async getFile(fileId) {
            return new File(await this.user.getFile(fileId), this)
        }

        /**
         * @typedef Version
         * @type {object}
         * @property {string} version
         * @property {string} hash
         */

        /**
         * Get version
         * @async
         * @returns {Version}
         */
        version() {
            return json($get(`${this._url}/version`, { 'Access-Control-Allow-Origin': '*' }))
        }

        /**
         * Login
         * @async
         * @param {string} email
         * @param {string} password
         * @returns {User}
         */
        async signInWithEmail(email, password) {
            const token = email + ':' + password
            const hash = btoa(token)

            const userData = await json(
                $get(`${this._url}/token`, {
                    Authorization: 'Basic ' + hash,
                    'Access-Control-Allow-Origin': '*'
                })
            )

            this.user = new UserImpl(userData, this._url, this._options)
            //this.setActiveJobUpdater(true)

            return new User(this.user, this)
        }

        /**
         * Setting to enable | disable job updater
         * It recursively updates jobs periodically
         * @param {boolean} enable
         */
        setActiveJobUpdater(enable) {
            this.jobUpdater && this.jobUpdater.stop()
            this.jobUpdater = new JobUpdater(this.user, this)
            enable && this.jobUpdater.start()
        }

        /**
         * Get current user
         * @returns {User}
         */
        getCurrentUser() {
            return new User(this.user, this)
        }

        async loginWithToken(token) {
            return new UserImpl(
                {
                    tokenInfo: {
                        token: token
                    }
                },
                this._url,
                this._options
            )
                .getUserInfo()
                .then((userData) => new UserImpl(userData, this._url, this._options))
                .then((user) => (this.user = user))
                .then(() => this)
        }
        // /**
        //  * Login with raw user data
        //  * @async
        //  * @param {Object} userData
        //  * @returns {User}
        //  */
        // async loginFromUserData(userData) {
        //   //this.setActiveJobUpdater(true)
        //   this.user = new UserImpl(userData, this._url)
        //   return new User(this.user, this)
        // }

        /**
         * @typedef UploadFileOptions
         * @type {object}
         * @property {boolean} geometry - create job to generate geometry, default = true
         * @property {boolean} properties - create job to generate properties, default = true
         * @property {boolean} waitForDone - wait for complete geometry | properties jobs, default = false
         */

        /**
         * Upload file
         * @async
         * @param {global.File} file
         * @param {UploadFileOptions} options
         * @returns {File}
         */
        async uploadFile(file, options = { geometry: true, properties: false, waitForDone: false }) {
            const fileImpl = await this.user.postFile(file, (progress) =>
                this.emit({ type: 'upload-progress', data: progress })
            )
            const awaiters = []

            options.geometry && awaiters.push(fileImpl.createJob('geometry'))
            options.properties && awaiters.push(fileImpl.createJob('properties'))

            const jobs = await Promise.all(awaiters)
            if (options.waitForDone) {
                await Promise.all(jobs.map((job) => job.waitForDone()))
            }
            return new File(fileImpl, this)
        }

        /**
         * Delete file
         * @async
         * @param {string} fileId - file Id
         * @returns {Object} - result
         */
        deleteFile(fileId) {
            return this.user.deleteFile(fileId)
        }

        /**
         * Download file reference
         * @async
         * @param {string} fileId - file Id
         * @param {string} onProgress - onprogress callback
         * @param {AbortSignal} signal - signal for cancellation
         * @returns {ArrayBuffer} - binary data
         */
        downloadReferenceFile(fileId, onProgress, signal) {
            return this.user.downloadReferenceFile(fileId, onProgress, signal)
        }

        /**
         * @typedef JobsResult
         * @type {object}
         * @property {Job[]} result - Array of jobs
         * @property {Number} start - create job to generate geometry, default = true
         * @property {Number} limit - create job to generate properties, default = true
         * @property {Number} allSize - wait for complete geometry | properties jobs, default = false
         * @property {Number} size - wait for complete geometry | properties jobs, default = false
         */

        /**
         * Get lob list with specified filter
         * @async
         * @param {string} state - filter, default = null
         * @param {Number} limit - limit for response, default = null
         * @param {Number} start - offset of response, default = null
         * @param {Number} sortByDesc - sort by desc createdAt, default = null
         * @returns {JobsResult} - JobsResult
         */
        getJobs(state = null, limit = null, start = null, sortByDesc = null) {
            return this.user
                .getJobs(state, limit, start, sortByDesc)
                .then((data) => ({ ...data, result: data.result.map((job) => new Job(job, this)) }))
        }

        /**
         * Get job by id
         * @async
         * @param {string} jobId - jobId
         * @returns {Job} - Job
         */
        getJob(jobId) {
            return this.user.getJob(jobId).then((job) => new Job(job, this))
        }

        /**
         * Create Job for file
         * @async
         * @param {string} fileId - File id
         * @param {string} outputFormat - Output format
         * @returns {Job} - Job
         */
        createJob(fileId, outputFormat) {
            return this.user.postJob(fileId, outputFormat).then((job) => new Job(job, this))
        }

        /**
         * Delete job
         * @async
         * @param {string} jobId - Job Id
         * @returns {Object} - Result
         */
        deleteJob(jobId) {
            return this.user.deleteJob(jobId)
        }

        /**
         * Get projects
         * @async
         * @returns {Array<Project>}
         */
        getProjects() {
            return this.user.getProjects().then((projectsImpl) => projectsImpl.map((impl) => new Project(impl, this)))
        }

        /**
         * Create new projects
         * @async
         * @param {string} name - project name
         * @param {string} description - project description
         * @param {Date} startDate - start project date
         * @param {Date} endDate - end project date
         * @param {string} avatarUrl - base64 image project preview
         * @returns {Project}
         */
        createProject(name, description, startDate, endDate, avatarUrl) {
            return this.user
                .createProject(name, description, startDate, endDate, avatarUrl)
                .then((impl) => new Project(impl, this))
        }

        /**
         * Get project by id
         * @async
         * @param {string} id - project id
         * @returns {Project}
         */
        getProjectById(id) {
            return this.user.getProjectById(id).then((impl) => new Project(impl, this))
        }

        /**
         * Create new assembly
         * @async
         * @param {Array<string>} files - list file ids
         * @param {string} name - assembly name
         * @returns {Assembly}
         */
        createAssembly(files, name) {
            return undefined
            // return this.user.createAssembly(files, name).then((impl) => new Assembly(impl))
        }

        /**
         * Get assembly by id
         * @async
         * @param {string} id - assembly id
         * @returns {Assembly}
         */
        getAssemblyById(id) {
            return undefined
            // return this.user.getAssemblyById(id).then((impl) => new Assembly(impl))
        }

        /**
         * @typedef AssemblyListResult
         * @type {object}
         * @property {number} allSize
         * @property {number} limit
         * @property {Assembly[]} result
         * @property {number} size
         * @property {number} start
         */

        /**
         * Get file list
         * @async
         * @param {number} start
         * @param {number} count
         * @param {string} name
         * @param {Array<string>} ids
         * @param {string} sortByDesc
         * @returns {AssemblyListResult}
         */
        async getAssemblies(start, count, name, ids, sortByDesc) {
            const { allSize, limit, result, size } = await this.user.getAssemblies(start, count, name, ids, sortByDesc)
            return {
                allSize,
                limit,
                list: [],
                size,
                start
            }
        }

        /**
         * Delete job
         * @async
         * @param {string} id - assembly Id
         * @returns {Object} - Result
         */
        deleteAssembly(id) {
            return this.user.deleteAssembly(id)
        }
    }

    class EventEmitter {
        constructor() {
            this.subscribers = {}
        }

        clear() {
            this.subscribers = {}
        }

        emit(event) {
            if (this.subscribers[event.type]) {
                const invoke = [...this.subscribers[event.type]]
                this.subscribers[event.type] = this.subscribers[event.type].filter((subscriber) => !subscriber.once)
                invoke.forEach((subscriber) => subscriber.callback(event))
            }
        }

        on(type, callback) {
            !this.subscribers[type] && (this.subscribers[type] = [])
            this.subscribers[type].push({ type, callback })
        }

        once(type, callback) {
            !this.subscribers[type] && (this.subscribers[type] = [])
            this.onces.push({ type, callback, once: true })
        }

        remove(type, callback) {
            if (this.subscribers[type]) {
                this.subscribers[type] = this.subscribers[type].filter(
                    (subscriber) => subscriber.type !== type && subscriber.callback !== callback
                )
            }
        }
    }
    /**
     * @namespace
     * @global
     * */
    const ODA = {
        /**
         * Create client instance,
         * @function
         * @async
         * @returns {Client}
         */
        createClient: async (options) => {
            const client = new Client(options)
            if (options.APIToken) {
                await client.loginWithToken(options.APIToken)
            }
            return client
        }
    }
    return ODA
}) //# sourceMappingURL=client.js.map
