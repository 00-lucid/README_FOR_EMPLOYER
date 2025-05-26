import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore, MainViewPopupStore } from '../Store/statusStore'
// Lib
import { global } from '../Lib/util'
import crypt from '../Lib/crypt'

const useEquipment = (parentId: string) => {
    global.log('useEquipment.ts 읽힘')

    // 전역 Store
    const [selectEquipments, setSelectEquipments] = useRecoilState(StatusStore.selectEquipments)
    const [exLibId, setExLibId] = useRecoilState(StatusStore.exLibId)
    const [equipmentLinks, setEquipmentLinks] = useRecoilState(MainViewPopupStore.equipmentLinks)

    const refs = React.useRef(new Map()) // 설비 아이템 Dom 담을 변수
    const sideBarClickRef = React.useRef(false) // 사이드바 설비 메뉴 클릭 여부 확인 변수

    // 라우터 경로 이동을 위한 네비게이터
    const navigate = useNavigate()
    // URL 파라미터 조회
    const [searchParams] = useSearchParams()

    // 캔버스에서 설비 클릭시 해당 사이드바 스크롤뷰 이동.
    const scrollMove = React.useCallback(async () => {
        const equipArray = Array.from(selectEquipments)
        if (refs.current.size > 0 && equipArray.length > 0) {
            if (refs.current.has(equipArray[0])) {
                const ref = refs.current.get(equipArray[0])
                // 사이드바 설비 목록에서 폴더가 변경되어
                // 설비 아이템들이 다시 그려져야하는 경우 렌더링되는 일정 시간을 기다리고 스크롤를 맞춤.
                if (exLibId !== parentId) {
                    if (refs.current.size > 20) await global.wait(500)
                    else if (refs.current.size > 10) await global.wait(100)
                    setExLibId(parentId)
                }

                ref.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }, [selectEquipments, parentId, exLibId, setExLibId])

    // 캔버스에서 설비 클릭시만 사이드뷰 스크롤되게 useRef로 처리
    React.useEffect(() => {
        if (!sideBarClickRef.current) {
            scrollMove()
        } else {
            sideBarClickRef.current = false
        }
    }, [scrollMove])

    // 사이드바 설비 아이템 클릭 이벤트
    const equipmentMenuItemClick = React.useCallback(
        async (e: React.MouseEvent<HTMLElement>, equipemntObj: EquipmentContext) => {
            if (e) e.stopPropagation()
            global.log('equipemntObj::', equipemntObj)
            sideBarClickRef.current = true
            // 설비 팝업링크 초기화
            if (equipmentLinks.length > 0) setEquipmentLinks([])
            const encTagId = crypt.encrypt(equipemntObj.tagId)
            if (!encTagId) return
            searchParams.set('equip', decodeURIComponent(encTagId))
            navigate(`?${searchParams.toString()}`)
        },
        [equipmentLinks, setEquipmentLinks, navigate, searchParams]
    )

    // 설비 선택여부 확인
    const equipmentCheckSelected = React.useCallback(
        (equipemntObj: EquipmentContext) => {
            if (selectEquipments.has(equipemntObj.tagId)) return true
            return false
        },
        [selectEquipments]
    )

    const notiorderMenuItemClick = React.useCallback(
        (tagId: string) => {
            sideBarClickRef.current = true
            if (equipmentLinks.length > 0) setEquipmentLinks([])

            const encTagId = crypt.encrypt(tagId)
            if (!encTagId) return
            searchParams.set('equip', decodeURIComponent(encTagId))
            navigate(`?${searchParams.toString()}`)
        },
        [equipmentLinks, setEquipmentLinks, navigate, searchParams]
    )

    const notiorderResetEquipment = React.useCallback(() => {
        setSelectEquipments(new Set<string>())
    }, [setSelectEquipments])

    return {
        equipmentMenuItemClick,
        equipmentCheckSelected,
        refs,
        scrollMove,
        notiorderMenuItemClick,
        notiorderResetEquipment,
    }
}

export default useEquipment
