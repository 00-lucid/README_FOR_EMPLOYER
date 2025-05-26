import React from 'react'
import './DocumentMenu.css'
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore } from '../../../Store/statusStore'
import ThemeStore from '../../../Store/ThemeStore'
// Component
import { CloseSideMenuBtn } from '../Component/CloseSideMenuBtn'
import { RefreshSideMenuBtn } from '../Component/RefreshSideMenuBtn'
import { DocumentDisplaySelect } from '../Component/DocumentDisplaySelect'
import { TopLine } from '../Component/TopLine'
import { TreeView } from '../../CommonView/TreeView'
import DocumentFolder from '../Component/Document/DocumentFolder'
// Lib
import { global } from '../../../Lib/util'
import crypt from '../../../Lib/crypt'
import auth from '../../../Api/auth'
import AppStore from '../../../Store/appStore'

export function DocumentMenu() {
    // global.log('DocumentMenu create')

    // 전역 Store
    const userId = useRecoilValue(AppStore.userId)
    const currentMenu = useRecoilValue(StatusStore.currentMenu)
    const [documentList, setDocumentList] = useRecoilState(StatusStore.documentList)
    const [documentDisplayType, setDocumentDisplayType] = useRecoilState(ThemeStore.documentDisplayType)
    const setSelectedDocFolderIds = useSetRecoilState(StatusStore.selectedDocFolderIds)

    const mapNameByPlantCode = useRecoilValue(StatusStore.mapNameByPlantCode)

    const getSelectedDocFolderIdsByUrl = (folder: any, docId: any): any => {
        for (let i = 0; i < folder.documents.length; i++) {
            if (folder.documents[i].docId === docId) {
                return folder.documents[i].docId
            }
        }

        for (let i = 0; i < folder.subfolders.length; i++) {
            const result = getSelectedDocFolderIdsByUrl(folder.subfolders[i], docId)
            if (result !== null) {
                return folder.subfolders[i].folderName + folder.subfolders[i].parentId + ',' + result
            }
        }

        return null
    }

    const scrollMove = async () => {
        const selectedEl = document.getElementsByClassName('SelectedLabel').item(0)

        if (null !== selectedEl) {
            selectedEl.scrollIntoView({ behavior: 'smooth' })
        }
    }

    React.useEffect(() => {
        const fetch = async () => {
            /**
             * 의존성 배열에 검색 또는 OPC를 감지할 수 있어야 됨
             * 현재는 뷰어가 처음 열릴 때만 실행됨 EX: ECM에서 도면을 열 때
             */
            if (mapNameByPlantCode.size > 0) {
                // await global.wait(2000)
                const drawing = new URLSearchParams(window.location.search).get('drawing')

                if (!drawing && userId) {
                    const firstFolder = documentList[0]
                    let openFoldersArr = [`${firstFolder.folderName}null`]
                    const data = await auth.getUserBySabun(userId)
                    // const data = [{ PLANT: '2110', PLANT_T: '고리제1발전소', BONBU: '2100', BONBU_T: '고리' }]

                    if (data[0].PLANT && data[0].PLANT_T && data[0].BONBU && data[0].BONBU_T) {
                        // mapFolderList.
                        const { PLANT, PLANT_T, BONBU } = data[0]
                        const fn = mapNameByPlantCode.get(PLANT)
                        if (fn) openFoldersArr.push(fn + `00000000000000${BONBU}`)
                        let pn = PLANT_T.substr(0, 2)
                        if (pn === '신한') pn = '신한울'
                        else if (pn === '신인') pn = '신인천'
                        else if (pn === '남제') pn = '남제주'
                        openFoldersArr.push(pn + `000000000000001`)

                        const newSelectedIds = new Set<string>(openFoldersArr)
                        setSelectedDocFolderIds(newSelectedIds)
                    }
                }

                const docId = crypt.decrypt(drawing)
                const firstFolder = documentList[0]

                const openFoldersStr = getSelectedDocFolderIdsByUrl(firstFolder, docId)
                let openFoldersArr = [`${firstFolder.folderName}null`]

                if (null !== openFoldersStr) {
                    openFoldersArr = [...openFoldersArr, ...openFoldersStr.split(',')]
                    openFoldersArr.splice(openFoldersArr.length - 1)
                }

                const newSelectedIds = new Set<string>(openFoldersArr)
                setSelectedDocFolderIds(newSelectedIds)

                scrollMove()
            }
        }

        fetch()
    }, [mapNameByPlantCode])

    return (
        <div className="DocumentMenu SideViewShadow SideViewBackground" style={style(currentMenu)}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">도면목록</span>
            <CloseSideMenuBtn />
            <RefreshSideMenuBtn setDocumentList={setDocumentList} />
            <DocumentDisplaySelect documentDisplayType={documentDisplayType} setDocumentDisplayType={setDocumentDisplayType} />
            <TopLine />
            {/* 사이드뷰 도면 메뉴 트리 목록 */}
            {documentList.length > 0 ? (
                <TreeView id="documentMenuTreeView">{<DocumentFolder folderList={documentList} depth={0} keyIdx={0} />}</TreeView>
            ) : null}
        </div>
    )
}

function style(currentMenu: string) {
    return 'document' === currentMenu ? { marginLeft: 'var(--SideMenuWidth)' } : { marginLeft: 'calc(var(--DocumentMenuWidth) * -1 )' }
}
