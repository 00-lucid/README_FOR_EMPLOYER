import React, { useState } from 'react'
import './EquipmentLinkView.css'
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil'
// 전역 Store
import AppStore from '../../../../Store/appStore'
import { PictureStore, StatusStore } from '../../../../Store/statusStore'
// Lib
import { global } from '../../../../Lib/util'
import dateFunc from '../../../../Lib/dateFunc'
import commonActive from '../../../../Controller/useCommonActive'
// Api
import Api from '../../../../Api'
// Component
import { TreeView } from '../../../CommonView/TreeView'
import { Folder } from './TreeViewItem/Folder'
import { Info } from './TreeViewItem/Info'
import { DateInput } from './TreeViewItem/DateInput'
import { Button } from './TreeViewItem/button'
import { EquipmentPictureView } from './EquipmentPictureView/EquipmentPictureView'

export default function EquipmentLinkView({
    equipmentLink,
    selectedCanvas,
}: {
    equipmentLink: EquipmentLink
    selectedCanvas: CanvasContext
}) {
    // 전역 Store
    const isFavorite = useRecoilValue(AppStore.isFavorite)
    const [userContext, setUserContext] = useRecoilState(AppStore.userContext)
    const userId = useRecoilValue(AppStore.userId)
    const [isShowPicturePopup, setIsShowPicturePopup] = useRecoilState(PictureStore.isShowPicturePopup)

    // 초기 변수 셋팅.
    const tmStart = new Date()
    tmStart.setMonth(tmStart.getMonth() - 6)
    const orderStart = new Date()
    orderStart.setMonth(orderStart.getMonth() - 6)

    const infoType = React.useRef({
        0: '설비정보',
        1: 'TM통지',
        2: 'TM통지이력',
        3: '오더',
        4: '오더이력',
        5: 'ISO도면',
        6: 'M1',
        7: 'M2',
        8: '기타',
        9: '관련문서',
        10: '사진',
    })
    const initExtendedKeys = React.useRef(['key#1', 'key#2', 'key#3', 'key#4', 'key#5', 'key#6', 'key#7', 'key#8'])

    const [extendedIds, setExtendedIds] = React.useState(new Set<string>(initExtendedKeys.current))
    const [tmStartDate, setTmStartDate] = React.useState(tmStart)
    const [tmEndDate, setTmEndDate] = React.useState(new Date())
    const [orderStartDate, setOrderStartDate] = React.useState(orderStart)
    const [orderEndDate, setOrderEndDate] = React.useState(new Date())
    const { docId, docVer, plantCode, docName, docNumber } = selectedCanvas.documentCtx
    // const setISOList = useSetRecoilState(StatusStore.ISOList)
    const setIsShowISOPopup = useSetRecoilState(StatusStore.isShowISOPopup)
    const setISODrawList = useSetRecoilState(StatusStore.ISODrawList)
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    // ----

    React.useEffect(() => {
        if (process.env.REACT_APP_DB === '한수원') {
            const newValues = new Set<string>(extendedIds)

            newValues.delete('key#2')
            newValues.delete('key#4')

            newValues.delete('key#2')
            newValues.delete('key#4')
            newValues.delete('key#6')

            newValues.delete('key#8')

            setExtendedIds(newValues)
        }
    }, [])

    // 즐겨찾기 토글 이벤트
    const toggleFavorite = () => {
        const selectEquipment = selectedCanvas.equipmentByTagId.get(equipmentLink.tagId)
        if (selectEquipment) {
            const favorite = {
                docId: docId,
                docVer: docVer,
                plantCode: plantCode,
                docName: docName,
                docNumber: docNumber,
                tagId: equipmentLink.tagId,
                function: selectEquipment.function,
            }
            isFavorite
                ? // 설비 즐겨찾기 삭제
                  commonActive.removeEquipmentFavorite(docId, docVer, userContext, userId, Api, setUserContext, equipmentLink.tagId)
                : // 설비 즐겨찾기 추가
                  addEquipmentFavorite(favorite)
        }
    }

    const addEquipmentFavorite = React.useCallback(
        async (value: FavoriteEquipment) => {
            if (!userContext || !userId) return
            for (let i = 0; i < userContext.favorite.equipments.length; i++) {
                const item = userContext.favorite.equipments[i]
                if (item.docId === value.docId && item.docVer === value.docVer && item.tagId === value.tagId) return
            }
            const newEquips = userContext.favorite.equipments.slice()
            newEquips.unshift(value)
            const newUserContext = { ...userContext, favorite: { ...userContext.favorite, equipments: newEquips } }
            await Api.auth.setUserContext(userId, newUserContext)
            setUserContext(newUserContext)
        },
        [setUserContext, userContext, userId]
    )
    // 폴더 클릭 이벤트
    const onFolderClick = React.useCallback(
        (key: string) => {
            const newValues = new Set<string>(extendedIds)

            if (newValues.has(key)) {
                newValues.delete(key)
            } else {
                newValues.add(key)
            }

            setExtendedIds(newValues)
        },
        [extendedIds]
    )

    const onSavePicture = async (formData: FormData) => {
        const tplnr = selectedCanvas.equipmentByTagId.get(equipmentLink.tagId)?.function

        if (tplnr) {
            await Api.equipment.addEquipmentImage(tplnr, formData)
        }
    }

    // SAP 조회
    const onInfoClick = React.useCallback(
        async (type: string) => {
            global.log('SAP type::', type)
            if (equipmentLink.equipmentLinkId) {
                const linkId = equipmentLink.equipmentLinkId
                let url, tplnr

                /**
                 * 한수원에서 기능위치가 없는 설비는 SAP 조회 불가능
                 * SAP RFC 인자에 기능위치가 들어가기 때문
                 */
                if (process.env.REACT_APP_DB === '한수원') {
                    tplnr = selectedCanvas.equipmentByTagId.get(equipmentLink.tagId)?.function
                    if (!tplnr) return
                }

                if (type === infoType.current[0]) {
                    url = await Api.equipment.getEquipmentInfoUrl(linkId, tplnr)
                } else if (type === infoType.current[1]) {
                    url = await Api.equipment.getNotiIssueUrl(linkId, tplnr)
                } else if (type === infoType.current[2]) {
                    const start = dateFunc.dateToStringByFormatting(tmStartDate, '')
                    const end = dateFunc.dateToStringByFormatting(tmEndDate, '')
                    url = await Api.equipment.getNotiRecordUrl(linkId, start, end, tplnr)
                } else if (type === infoType.current[3]) {
                    url = await Api.equipment.getOrderIssueUrl(linkId, tplnr)
                } else if (type === infoType.current[4]) {
                    const start = dateFunc.dateToStringByFormatting(orderStartDate, '')
                    const end = dateFunc.dateToStringByFormatting(orderEndDate, '')
                    url = await Api.equipment.getOrderRecordUrl(linkId, start, end, tplnr)
                } else if (type === infoType.current[5]) {
                    if (tplnr) {
                        const list = await Api.equipment.getISOList(tplnr)
                        setISODrawList(list)
                        setIsShowISOPopup({
                            message: 'list',
                            nextAction: () => {},
                        })
                    } else {
                        alert('ISO 도면을 조회할 수 없는 배관입니다.')
                    }
                } else if (type === infoType.current[6]) {
                    // M1
                    if (userId) {
                        url = await Api.equipment.getM1NotiIssueUrl(linkId, tplnr, userId)
                    } else {
                        alert('잘못된 접근입니다.')
                    }
                } else if (type === infoType.current[7]) {
                    // M2
                    if (userId) {
                        url = await Api.equipment.getM2NotiIssueUrl(linkId, tplnr, userId)
                    } else {
                        alert('잘못된 접근입니다.')
                    }
                } else if (type === infoType.current[8]) {
                    // 기타
                    url = await Api.equipment.getNotiIssueUrl(linkId, tplnr)
                } else if (type === infoType.current[9]) {
                    // 관련문서조회
                    url = await Api.equipment.getRelatedFilesByEquipment(linkId, tplnr)
                } else if (type === infoType.current[10]) {
                    // 사진추가
                    console.log('picture add')
                    setIsShowPicturePopup({
                        ok: async (formData: FormData) => {
                            await onSavePicture(formData)
                            setIsShowPicturePopup(undefined)
                        },
                        no: () => {
                            setIsShowPicturePopup(undefined)
                        },
                    })
                }

                if (!url) return

                window.open(url, 'FarpointExternalWindow')
            }
        },
        [
            equipmentLink.equipmentLinkId,
            tmStartDate,
            tmEndDate,
            orderStartDate,
            orderEndDate,
            equipmentLink.tagId,
            selectedCanvas.equipmentByTagId,
            setISODrawList,
            setIsShowISOPopup,
        ]
    )
    const title = equipmentLink
        ? `${selectedCanvas.equipmentByTagId.get(equipmentLink.tagId)?.function}(${equipmentLink.equipmentLinkId})(${
              equipmentLink.linkObject
          })`
        : ''
    console.log('equipmentLink::', title, equipmentLink)
    return (
        <div className="EquipmentLinkView">
            <div>
                <div className="EquipmentLinkTitlebar">
                    <div className="Text">설비 정보 연계</div>
                </div>
                <div className="Subtitlebar">
                    <div className="Text">{title}</div>
                    <div className="FavoriteIcon" onClick={toggleFavorite}>
                        {/* 즐겨찾기 아이콘 */}
                        {favoriteImg(isFavorite)}
                    </div>
                </div>
                <TreeView id="equipmentLinkTreeView">
                    <>
                        <Info
                            text={equipmentLink.tagType === '001' ? '설비정보 조회' : '배관마스터 조회'}
                            depth={0}
                            type={infoType.current[0]}
                            infoClick={onInfoClick}
                        />
                        {/* TM통지 */}
                        <Folder
                            text={process.env.REACT_APP_DB === '한수원' ? '통지' : 'TM통지'}
                            depth={0}
                            isOpen={extendedIds.has(initExtendedKeys.current[0])}
                            id={initExtendedKeys.current[0]}
                            folderClick={onFolderClick}
                        >
                            {process.env.REACT_APP_DB === '한수원' ? (
                                <Folder
                                    text="통지 발행"
                                    depth={1}
                                    isOpen={extendedIds.has(initExtendedKeys.current[5])}
                                    id={initExtendedKeys.current[5]}
                                    folderClick={onFolderClick}
                                >
                                    <Info text="M1" depth={2} type={infoType.current[6]} infoClick={onInfoClick} />
                                    <Info text="M2" depth={2} type={infoType.current[7]} infoClick={onInfoClick} />
                                    <Info text="기타" depth={2} type={infoType.current[8]} infoClick={onInfoClick} />
                                </Folder>
                            ) : (
                                <Info text={'TM통지 발행'} depth={1} type={infoType.current[1]} infoClick={onInfoClick} />
                            )}
                            <Folder
                                text={process.env.REACT_APP_DB === '한수원' ? '통지 이력조회' : 'TM통지 이력조회'}
                                depth={1}
                                isOpen={extendedIds.has(initExtendedKeys.current[1])}
                                id={initExtendedKeys.current[1]}
                                folderClick={onFolderClick}
                            >
                                <DateInput text={'시작일'} depth={2} date={tmStartDate} onChange={setTmStartDate} />
                                <DateInput text={'종료일'} depth={2} date={tmEndDate} onChange={setTmEndDate} />
                                <Button text={'조회'} depth={2} type={infoType.current[2]} infoClick={onInfoClick} />
                            </Folder>
                        </Folder>
                        {/* 오더 */}
                        <Folder
                            text="오더"
                            depth={0}
                            isOpen={extendedIds.has(initExtendedKeys.current[2])}
                            id={initExtendedKeys.current[2]}
                            folderClick={onFolderClick}
                        >
                            <Info text={'오더 발행'} depth={1} type={infoType.current[3]} infoClick={onInfoClick} />
                            <Folder
                                text="오더 이력조회"
                                depth={1}
                                isOpen={extendedIds.has(initExtendedKeys.current[3])}
                                id={initExtendedKeys.current[3]}
                                folderClick={onFolderClick}
                            >
                                <DateInput text={'시작일'} depth={2} date={orderStartDate} onChange={setOrderStartDate} />
                                <DateInput text={'종료일'} depth={2} date={orderEndDate} onChange={setOrderEndDate} />
                                <Button text={'조회'} depth={2} type={infoType.current[4]} infoClick={onInfoClick} />
                            </Folder>
                        </Folder>
                        {/* ISO 도면 */}
                        {process.env.REACT_APP_DB === '한수원' && equipmentLink.tagType !== '001' && (
                            <Folder
                                text="ISO 도면"
                                depth={0}
                                isOpen={extendedIds.has(initExtendedKeys.current[4])}
                                id={initExtendedKeys.current[4]}
                                folderClick={onFolderClick}
                            >
                                <Button text={'조회'} depth={1} type={infoType.current[5]} infoClick={onInfoClick} />
                            </Folder>
                        )}
                        {/* 관련문서 */}
                        {process.env.REACT_APP_DB === '한수원' && (
                            <Folder
                                text="관련문서"
                                depth={0}
                                isOpen={extendedIds.has(initExtendedKeys.current[6])}
                                id={initExtendedKeys.current[6]}
                                folderClick={onFolderClick}
                            >
                                <Info
                                    text={`설명: ${equipmentLink.funcDetail}, 유형: ${equipmentLink.linkObject}`}
                                    depth={1}
                                    type={infoType.current[9]}
                                    infoClick={onInfoClick}
                                />
                            </Folder>
                        )}
                        {/* 사진 */}
                        <Folder
                            text="사진"
                            depth={0}
                            isOpen={extendedIds.has(initExtendedKeys.current[7])}
                            id={initExtendedKeys.current[7]}
                            folderClick={onFolderClick}
                        >
                            <Info text={`추가`} depth={1} type={infoType.current[10]} infoClick={onInfoClick} />
                            {!isShowPicturePopup && <EquipmentPictureView selectedCanvas={selectedCanvas} equipmentLink={equipmentLink} />}
                        </Folder>
                    </>
                </TreeView>
            </div>
        </div>
    )
}

// 즐겨찾기 아이콘
function favoriteImg(isActive: boolean): JSX.Element {
    const fill = (
        <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
            <g fillRule="evenodd" fill="none" transform="matrix(0.77777785 0 0 0.77777785 0 0)">
                <path
                    d="M13.748 12.896L4.075 14.302L11.075 21.125L9.423 30.758999L18.073 26.210999L26.727001 30.758999L25.074001 21.125L32.074 14.302L22.401001 12.896L18.074001 4.13L13.748 12.896z"
                    fill="#4A70F7"
                    fillOpacity=".9"
                />
                <path
                    d="M4.074 14.301L13.747999 12.8949995L18.074999 4.1289997L22.401 12.8949995L32.074997 14.301L25.074997 21.124L26.726997 30.759L18.074997 26.210001L9.4229965 30.760002L11.074997 21.124002L4.074 14.301z"
                    stroke="#4A70F7"
                />
            </g>
        </svg>
    )

    const empty = (
        <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
            <path
                transform="matrix(0.77777785 0 0 0.77777785 0 0)"
                d="M7.487 18.571L7 18.096L6 17.122002L4 15.172002L13.674 13.766002L18 5L22.326 13.766L32 15.172L25 21.994999L26.652 31.63L18 27.081L9.348 31.63L11 21.995L10 21.021"
                stroke="var(--Menu-Toolbar-Item-Stroke)"
                opacity=".9"
                fill="none"
            />
        </svg>
    )

    return isActive ? fill : empty
}
