import React from 'react'

import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil'
import { useSearchParams } from 'react-router-dom'
import { Cookies } from 'react-cookie'
// 전역 Store
import AppStore from '../../Store/appStore'
import { StatusStore } from '../../Store/statusStore'

// Api
import Api from '../../Api'
// Lib
import { global } from '../../Lib/util'
import { DBLogType } from '../../enum/LogType'

const useUserSetting = () => {
    // 전역 Store
    const [userId, setUserId] = useRecoilState(AppStore.userId)
    const setUserContext = useSetRecoilState(AppStore.userContext)

    // 라우터 경로 이동을 위한 네비게이터
    const [searchParams] = useSearchParams()

    const cookies = new Cookies()

    // 사용자 --
    React.useEffect(() => {
        if (process.env.REACT_APP_DB === '한수원') {
            fetch('http://127.0.0.1:17007/verifyToken')
                .then(async (res) => {
                    const data = await res.text()
                    const codeTemp = data.split(' ')[2]
                    const code = codeTemp.split(',')[0]

                    const uid = data.split('==')[2]
                    const sabunTemp = uid.split('*')[1]
                    const sabun = sabunTemp.split('-')[1]

                    if (code === '"0"') {
                        setUserId(sabun)
                        try {
                            global.logDB({
                                type: 'DBLogType.USER',
                                value: {
                                    userId: sabun,
                                    logDate: new Date().toLocaleDateString().replace(/\./g, '').replace(/\s/g, '-'),
                                    logTime: new Date().toTimeString().split(' ')[0],
                                    logGubun: '999',
                                    plantCode: 'mock',
                                    plantName: 'mock',
                                },
                            })
                        } catch (e) {
                            console.log('logDBError')
                        }
                    } else {
                        alert('통합로그인 인증키가 없습니다.\nSSO 클라이언트 프로그램을 설치 후 다시 시도해주세요.')
                        window.location.href = 'about:blank'
                    }
                })
                .catch(() => {
                    // 개발시 아래 주석 해제
                    //setUserId('sunny')

                    // 운영 배포시 아래 주석 해제 (개발시 주석처리)
                    alert('통합로그인 인증키가 없습니다.\nSSO 클라이언트 프로그램을 설치 후 다시 시도해주세요.')
                    window.location.href = 'about:blank'
                })
        } else {
            const searchUserId = searchParams.get('sUserId')

            if (searchUserId) {
                const decodeUserId = window.atob(searchUserId)

                const expires = new Date()
                expires.setDate(expires.getDate() + 1)
                const option = {
                    expires, // 유효 시간 1일
                }
                cookies.set('sUserId', searchUserId, option)
                setUserId(decodeUserId)
            } else {
                const sUserId = cookies.get('sUserId')
                if (sUserId) {
                    const decodeUserId = window.atob(sUserId)
                    setUserId(decodeUserId)

                    global.logDB({
                        type: DBLogType.USER,
                        value: {
                            userId: decodeUserId,
                            logDate: new Date().toLocaleDateString().replace(/\./g, '').replace(/\s/g, '-'),
                            logTime: new Date().toTimeString().split(' ')[0],
                            logGubun: '116',
                            plantCode: 'mock',
                            plantName: 'mock',
                        },
                    })
                } else {
                    // 통합 로그인 완전히 적용되기 전까지는 sunny로 로그인되게 처리
                    setUserId('sunny')
                    //alert('잘못된 접근입니다.')
                    //window.location.href = 'about:blank'
                }
            }
        }
        // 초기 도면 설정
        // Event : MainView/Canvas/index.tsx -> 2. URL Params를 통해 도면 & 설비 설정
        // navigate(`?drawing=${crypt.encrypt(drawing)}&revision=${crypt.encrypt(revision)}&plant=${crypt.encrypt(plant)}`)
    }, [setUserId])

    // 사용자 정보 설정
    React.useEffect(() => {
        async function fetchData() {
            if (userId) {
                const res = await Api.auth.getUserContext(userId)
                setUserContext(res)
                // ?? 아래 행위는 왜 하는거죠?..
                // await Api.auth.hasAuthorization(userId)
            }
        }
        fetchData()
    }, [userId, setUserContext])

    const [documentList, setDocumentList] = useRecoilState(StatusStore.documentList)
    const [mapFolderList, setMapFolderList] = useRecoilState(StatusStore.mapFolderList)
    const setMapDocPathName = useSetRecoilState(StatusStore.mapDocPathName)
    const setMapDocItemList = useSetRecoilState(StatusStore.mapDocItemList)
    const setCompanyItems = useSetRecoilState(StatusStore.companyItems)

    // 도면 리스트 설정
    React.useEffect(() => {
        async function fetchData() {
            if (userId) {
                // 현재날짜
                const today = new Date()
                const timeStamp = String(today.getFullYear()) + String(`0${today.getMonth() + 1}`) + String(`0${today.getDate()}`)

                const docListKey = `documentList_${timeStamp}_${process.env.REACT_APP_DB}`
                // 기존에 저장된 도면 리스트 삭제.
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i)
                    if (key && key.indexOf('documentList_') !== -1 && key !== docListKey) {
                        localStorage.removeItem(key)
                    }
                }
                // 로컬스토리지 도면 리스트 로드
                const documentVal = localStorage.getItem(docListKey)

                if (!documentVal) {
                    const documentListRes = await Api.document.getDocumentList()
                    // Error Handler
                    if (!documentListRes) return

                    setDocumentList(documentListRes)

                    // 스토리지 도면 리스트 저장
                    localStorage.setItem(`documentList_${timeStamp}_${process.env.REACT_APP_DB}`, JSON.stringify(documentListRes))
                } else {
                    setDocumentList(JSON.parse(documentVal))
                }
            }
        }
        // 사이드메뉴 - 도면 폴더 목록 불러오기
        fetchData()
    }, [userId, setDocumentList])

    // (지역 발전소 호기) 셀렉트 아이템 초기 셋팅
    React.useEffect(() => {
        if (mapFolderList.size > 0 || documentList.length === 0) return
        global.log('셀렉트 아이템 초기 셋팅', documentList)

        const newMapFolderList = new Map()
        const newMapDocItemList = new Map()
        const newMapDocFromName = new Map()

        const setMapItem = (folderList: DocumentList[], fromNM: string) => {
            folderList.forEach((el) => {
                if (el.subfolders.length > 0) {
                    const selectItem = el.subfolders.map((subEl) => {
                        return { text: subEl.folderName, value: subEl.folderId }
                    })

                    newMapFolderList.set(el.folderId, selectItem)

                    // 호기는 다른 열에 들어가 있기 때문에 호기는 경로 문자열에 포함시키지 않는다.
                    const resFileName =
                        fromNM === 'e-P&ID도면'
                            ? el.folderName
                            : el.subfolders[0].subfolders.length === 0
                            ? fromNM
                            : `${fromNM}-${el.folderName}`

                    setMapItem(el.subfolders, resFileName)
                } else {
                    newMapDocItemList.set(el.folderId, el.documents)
                    newMapDocFromName.set(el.folderId, fromNM)
                }
            })
        }

        setMapItem(documentList, 'e-P&ID도면')
        //global.log('newMapFolderList::', newMapFolderList, documentList[0].folderId)
        //global.log('newMapDocItemList::', newMapDocItemList)
        const initCompanyItems = newMapFolderList.get(documentList[0].folderId)
        if (initCompanyItems) setCompanyItems(initCompanyItems)

        setMapFolderList(newMapFolderList)
        setMapDocItemList(newMapDocItemList)
        setMapDocPathName(newMapDocFromName)
    }, [documentList, setCompanyItems, mapFolderList, setMapDocItemList, setMapFolderList, setMapDocPathName])
}

export default useUserSetting
