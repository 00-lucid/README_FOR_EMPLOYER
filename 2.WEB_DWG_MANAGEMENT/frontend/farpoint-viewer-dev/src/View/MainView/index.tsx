import React, { useEffect } from 'react'
import './MainView.css'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore, MarkUpStore } from '../../Store/statusStore'
import ThemeStore from '../../Store/ThemeStore'
// Lib
import cn from 'classnames'
// Component
import Canvas from './Canvas'
import PopupMenu from './PopupMenu'
import Toolbar from './Toolbar'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Api from '../../Api'
import crypt from '../../Lib/crypt'
import AppStore from '../../Store/appStore'

const MainView = () => {
    let tempUndoList: any = []
    let tempRedoList: any = []

    // 전역 Stroe
    const theme = useRecoilValue(ThemeStore.theme)
    const userId = useRecoilValue(AppStore.userId)
    const selectedDocFile = useRecoilValue(StatusStore.selectedDocFile)

    const [controlMode, setControlMode] = useRecoilState(StatusStore.controlMode)
    const setIsMarkupChanged = useSetRecoilState(MarkUpStore.isMarkupChanged)
    const [undoList, setUndoList] = useRecoilState(MarkUpStore.undoList)
    const [redoList, setRedoList] = useRecoilState(MarkUpStore.redoList)
    const [markupPaths, setMarkupPaths] = useRecoilState(MarkUpStore.markupPaths)
    const setEditMarkupIdx = useSetRecoilState(MarkUpStore.editMarkupIdx)
    const setSelectedMarkupItems = useSetRecoilState(MarkUpStore.selectedMarkupItems)

    // State
    const [viewer, setViewer] = React.useState<any>(undefined) // VisualizeJs Viewer
    const [lib, setLib] = React.useState<any>() // VisualizeJs Lib Instant

    // 마크업 초기화
    const hideEditMarkup = React.useCallback(() => {
        setControlMode('select')
        setMarkupPaths([])
        setUndoList([])
        setRedoList([])
        setIsMarkupChanged(false)
        setSelectedMarkupItems(new Set<string>())
    }, [setControlMode, setMarkupPaths, setUndoList, setRedoList, setIsMarkupChanged, controlMode, setSelectedMarkupItems])

    const undo = () => {
        try {
            if ((markupPaths.length === 0 && !undoList[undoList.length - 1]?.cmd) || undoList.length === 0) return
            tempUndoList = JSON.parse(JSON.stringify(undoList))
            setEditMarkupIdx(-1)
            let undo_tempUndoList = JSON.parse(JSON.stringify(undoList))
            // setRedoList([...redoList, tempUndoList[tempUndoList.length-1]])
            if (tempUndoList.at(-1).cmd && tempUndoList.at(-1).cmd === 'edit') {
                const idx = tempUndoList.at(-1).idx
                const tempPath = JSON.parse(JSON.stringify(markupPaths[idx]))
                const path = {
                    type: tempPath.type,
                    color: tempPath.color,
                    width: tempPath.width,
                    texts: tempPath.texts,
                    values: tempPath.values,
                    area: tempPath.area,
                    dash: [],
                    idx: idx,
                    cmd: 'edit',
                }
                setRedoList([...redoList, path])
            } else setRedoList([...redoList, undo_tempUndoList.at(-1)])
            if (tempUndoList.at(-1)?.cmd === 'delete') {
                delete tempUndoList.at(-1).cmd
                const temp = tempUndoList.pop()
                setMarkupPaths([...markupPaths, temp])
                // markUpPaths.push(tempUndoList.pop())
            } else if (tempUndoList.at(-1)?.cmd === 'edit') {
                const lastUndoList = tempUndoList.at(-1)
                const tempPath = JSON.parse(JSON.stringify(markupPaths))
                tempPath[lastUndoList.idx].type = lastUndoList.type
                tempPath[lastUndoList.idx].color = lastUndoList.color
                tempPath[lastUndoList.idx].width = lastUndoList.width
                tempPath[lastUndoList.idx].texts = lastUndoList.texts
                tempPath[lastUndoList.idx].values = lastUndoList.values
                tempPath[lastUndoList.idx].area = lastUndoList.area
                tempPath[lastUndoList.idx].dash = lastUndoList.dash
                setMarkupPaths(tempPath)
                tempUndoList.pop()
            } else {
                tempUndoList.pop()
                setMarkupPaths(tempUndoList)
            }
            setUndoList([...tempUndoList])
        } catch (error) {
            console.log(error)
        }
    }

    const redo = () => {
        try {
            if (redoList.length === 0) return
            setEditMarkupIdx(-1)
            tempRedoList = JSON.parse(JSON.stringify(redoList))
            if (tempRedoList.at(-1)?.cmd === 'delete') {
                const temp = JSON.parse(JSON.stringify(markupPaths))
                temp.pop()
                setMarkupPaths(temp)
                setUndoList([...undoList, tempRedoList.pop()])
            } else if (tempRedoList.at(-1)?.cmd === 'edit') {
                const lastRedoList = tempRedoList.at(-1)
                let tempPath = JSON.parse(JSON.stringify(markupPaths))
                tempPath[lastRedoList.idx].cmd = 'edit'
                tempPath[lastRedoList.idx].idx = lastRedoList.idx
                const tempUndoList = JSON.parse(JSON.stringify(undoList))
                setUndoList([...tempUndoList, { ...tempPath[lastRedoList.idx] }])

                tempPath[lastRedoList.idx].type = lastRedoList.type
                tempPath[lastRedoList.idx].color = lastRedoList.color
                tempPath[lastRedoList.idx].width = lastRedoList.width
                tempPath[lastRedoList.idx].texts = lastRedoList.texts
                tempPath[lastRedoList.idx].values = lastRedoList.values
                tempPath[lastRedoList.idx].area = lastRedoList.area
                tempPath[lastRedoList.idx].dash = lastRedoList.dash
                setMarkupPaths(tempPath)
                tempRedoList.pop()
            } else {
                setUndoList([...undoList, tempRedoList.at(-1)])
                let pop = tempRedoList.pop()
                setMarkupPaths([...markupPaths, pop])
            }
            setRedoList([...tempRedoList])
        } catch (error) {
            console.log(error)
        }
    }

    const [searchParams] = useSearchParams()

    const drawing = searchParams.get('drawing')
    const revision = searchParams.get('revision')
    const plant = searchParams.get('plant')

    const equipNo = searchParams.get('equipNo')
    const funcName = searchParams.get('funcName')

    const navigate = useNavigate()

    useEffect(() => {
        const fetch = async () => {
            if (!drawing && !revision && !plant && !equipNo && !funcName && userId) {
                const lastDocumentInfo = await Api.document.getLastOpenDocumentInfo(userId)
                const { DOCNO, DOCVR, PLANTCODE } = lastDocumentInfo[0]

                const docId = crypt.encrypt(DOCNO)
                const docVr = crypt.encrypt(DOCVR)
                const plant = crypt.encrypt(PLANTCODE)

                if (docId && docVr && plant) {
                    searchParams.set('drawing', decodeURIComponent(docId))
                    searchParams.set('revision', decodeURIComponent(docVr))
                    searchParams.set('plant', decodeURIComponent(plant))

                    navigate(`?${searchParams.toString()}`)
                }
            }
        }

        fetch()
    }, [userId])

    // 외부 서비스 접속 -> 리다이렉트
    useEffect(() => {
        if (!equipNo && !funcName && !userId) return
        async function fetch() {
            if (equipNo) {
                const res = await Api.document.getUrlByEquipNo(equipNo)
                if (!res) return
                const index = res.url.indexOf('?')
                const param = res.url.slice(index)
                navigate(param)
            } else if (funcName) {
                const res = await Api.document.getUrlByfuncName(funcName)
                if (!res) return
                const index = res.url.indexOf('?')
                const param = res.url.slice(index)
                navigate(param)
            }
        }

        fetch()
    }, [equipNo, funcName, userId])

    return (
        <div className={cn('MainView', theme.type === 'light' ? 'LightTheme' : 'DarkTheme')}>
            {/* 도면, 마크업 캔버스 */}
            <Canvas hideEditMarkup={hideEditMarkup} viewer={viewer} setViewer={setViewer} lib={lib} setLib={setLib} />
            {/* 오른쪽 설비 팝업 메뉴 (캔버스에서 설비 선택 후 뜨는 팝업) */}
            <PopupMenu />
            {/* 가운데 하단 메뉴 툴바 */}
            <Toolbar hideEditMarkup={hideEditMarkup} undo={undo} redo={redo} viewer={viewer} />
            {/* 파란 배경 이미지 */}
            <BackgroundView hidden={selectedDocFile !== undefined} />
        </div>
    )
}

const BackgroundView = ({ hidden }: { hidden: boolean }) => {
    return (
        <div hidden={hidden}>
            <img alt="" src="img/bg.webp" srcSet="img/bg@2x.webp 2x, img/bg@3x.webp 3x" className="Background" />
            {process.env.REACT_APP_DB === '한수원' ? (
                <img alt="" src="img/symbol_text_circle.png" className="BackgroundLogo" />
            ) : (
                <img
                    alt=""
                    src="img/intro-logo-dp.png"
                    srcSet="img/intro-logo@2x.png 2x, img/intro-logo@3x.png 3x"
                    className="BackgroundLogo"
                />
            )}
        </div>
    )
}

export default MainView
