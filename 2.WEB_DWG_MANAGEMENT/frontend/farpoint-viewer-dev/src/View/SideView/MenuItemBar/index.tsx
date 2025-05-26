import React from 'react'
import './MenuItemBar.css'
import * as icons from '../Component/MenuBarIcons'
import { toggleFullScreen } from '../../CommonView/fullScreen'
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil'
// 전역 Store
import AppStore from '../../../Store/appStore'
import { StatusStore, ProcedureStore } from '../../../Store/statusStore'
import commonActive from '../../../Controller/useCommonActive'

export const MenuItemBar = React.memo(() => {
    // 전역 Store
    const userId = useRecoilValue(AppStore.userId)

    return (
        <div className="MenuBar">
            {process.env.REACT_APP_DB === '한수원' ? (
                <img
                    alt="logo"
                    className="Logo"
                    src="img/symbol.png"
                    // srcSet="img/icon-user-logo-24-px-px@2x.png 2x, img/icon-user-logo-24-px-px@3x.png 3x"
                    onClick={() => toggleFullScreen()}
                />
            ) : (
                <img
                    alt="logo"
                    className="Logo"
                    src="img/icon-user-logo-24-px-px.png"
                    srcSet="img/icon-user-logo-24-px-px@2x.png 2x, img/icon-user-logo-24-px-px@3x.png 3x"
                    onClick={() => toggleFullScreen()}
                />
            )}
            <MenuItem menuId={'document'} label={'도면'} icon={icons.document} userId={userId} />
            <MenuItem menuId={'equipment'} label={'설비'} icon={icons.equipment} userId={userId} />
            <MenuItem menuId={'notiorder'} label={'통지/오더'} icon={icons.notiorder} userId={userId} />
            <MenuItem menuId={'search'} label={'검색'} icon={icons.search} userId={userId} />
            {process.env.REACT_APP_DB === '남부' ? (
                <MenuItem menuId={'related'} label={'관련도면'} icon={icons.related} userId={userId} />
            ) : (
                <MenuItem menuId={'related'} label={'관련문서'} icon={icons.related} userId={userId} />
            )}
            <MenuItem menuId={'favorite'} label={'즐겨찾기'} icon={icons.favorite} userId={userId} />
            {process.env.REACT_APP_DB === '남부' && (
                <>
                    <div
                        className="MenuItem MenuItemOff"
                        onClick={() => {
                            window.open('http://dl.kospo.co.kr:7010')
                        }}
                    >
                        <svg className={'MenuIcon'} width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
                            {icons.techLib}
                        </svg>
                        <div className="MenuLabel">{'기술도서관'}</div>
                    </div>
                    <MenuItem menuId={'mydoc'} label={'내 문서'} icon={icons.personalDocument} userId={userId} />
                </>
            )}
            {/* <MenuItem menuId={'procedure'} label={'작업절차'} icon={icons.procedure} userId={userId} /> */}
            <div className="line" />
            <div className="VerticalLine" />
        </div>
    )
})

const MenuItem = React.memo(({ menuId, label, icon, userId }: MenuItemProps) => {
    // 전역 Store
    const [currentMenu, setCurrentMenu] = useRecoilState(StatusStore.currentMenu)
    const [controlMode, setControlMode] = useRecoilState(StatusStore.controlMode)
    const [isHideSide, setIsHideSide] = useRecoilState(ProcedureStore.isHideSide)
    const [isProcedureManagerVisible, setIsProcedureManagerVisible] = useRecoilState(ProcedureStore.isProcedureManagerVisible)
    const setProcedureSteps = useSetRecoilState(ProcedureStore.procedureSteps)
    const setSelProcedureEquipments = useSetRecoilState(ProcedureStore.selProcedureEquipments)
    const [isFix, setIsFix] = useRecoilState(ProcedureStore.isFix)
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)

    const isOn = menuId === currentMenu
    const className = ['MenuItem', isOn ? 'MenuItemOn' : 'MenuItemOff'].join(' ')

    React.useEffect(() => {
        if (controlMode !== 'procedure') {
            setIsHideSide(false)
            setCurrentMenu('')
            setIsProcedureManagerVisible(false)
            setProcedureSteps([])
            setSelProcedureEquipments([])
            setIsFix(false)
        }
    }, [controlMode])

    return (
        <div
            className={className}
            onClick={() => {
                if (controlMode === 'procedure' || isHideSide) {
                    if (isProcedureManagerVisible) {
                        const confirmValue = {
                            message: `작성중인 절차서가 모두 사라집니다.
                            진행하시겠습니까?`,
                            yes: () => {
                                setIsProcedureManagerVisible(false)
                                setControlMode('select')
                                setIsHideSide(false)
                                commonActive.onMenuChange(menuId, userId, setCurrentMenu)
                            },
                            no: () => {},
                        }
                        setYesNoPopupValue(confirmValue)
                    } else {
                        setControlMode('select')
                        setIsHideSide(false)
                        commonActive.onMenuChange(menuId, userId, setCurrentMenu)
                    }
                } else {
                    commonActive.onMenuChange(menuId, userId, setCurrentMenu)
                }
            }}
        >
            <svg className={'MenuIcon'} width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
                {isOn ? icon.on : icon.off}
            </svg>
            <div className="MenuLabel">{label}</div>
        </div>
    )
})
