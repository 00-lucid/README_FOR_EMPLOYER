import React from 'react'
import './PldMenuItemBar.css'
import * as icons from '../../Component/MenuBarIcons'
import { toggleFullScreen } from '../../../CommonView/fullScreen'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import AppStore from '../../../../Store/appStore'
import { StatusStore, PldStore } from '../../../../Store/statusStore'
// Lib
import { global } from '../../../../Lib/util'
import commonActive from '../../../../Controller/useCommonActive'

export const PldMenuItemBar = () => {
    // 전역 Store
    const setCurrentMenu = useSetRecoilState(StatusStore.currentMenu)
    const currentPld = useRecoilValue(PldStore.currentPld)
    const userId = useRecoilValue(AppStore.userId)

    // currentPld 설정되면 사이드메뉴 process로 전환
    React.useEffect(() => {
        if (currentPld) {
            commonActive.onMenuChange('process', userId, setCurrentMenu)
        } else {
            commonActive.onMenuChange('', userId, setCurrentMenu)
        }
    }, [currentPld, userId, setCurrentMenu])

    return (
        <div className="PldMenubar">
            {
                process.env.REACT_APP_DB === '한수원'
                ?
                <img
                    alt="logo"
                    className="Logo"
                    src="img/symbol.png"
                    // srcSet="img/icon-user-logo-24-px-px@2x.png 2x, img/icon-user-logo-24-px-px@3x.png 3x"
                    onClick={() => toggleFullScreen()}
                />
                :
                <img
                    alt="logo"
                    className="Logo"
                    src="img/icon-user-logo-24-px-px.png"
                    srcSet="img/icon-user-logo-24-px-px@2x.png 2x, img/icon-user-logo-24-px-px@3x.png 3x"
                    onClick={() => toggleFullScreen()}
                />
            }
            <MenuItem menuId={'create'} label={'New'} icon={icons.create} userId={userId} />
            <MenuItem menuId={'open'} label={'열기'} icon={icons.openpld} userId={userId} />
            <div className={`${currentPld?.PLD_C_ID ? '' : 'disable'}`}>
                <MenuItem menuId={'process'} label={'프로세스'} icon={icons.process} userId={userId} />
            </div>
            <ExitItem />
            <div className="line" />
        </div>
    )
}

const MenuItem = ({ menuId, label, icon, userId }: MenuItemProps) => {
    // 전역 Store
    const [currentMenu, setCurrentMenu] = useRecoilState(StatusStore.currentMenu)

    const isOn = menuId === currentMenu
    const className = ['MenuItem', isOn ? 'MenuItemOn' : 'MenuItemOff'].join(' ')

    return (
        <div className={className} onClick={() => commonActive.onMenuChange(menuId, userId, setCurrentMenu)}>
            <svg className={'MenuIcon'} width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
                {isOn ? icon.on : icon.off}
            </svg>
            <div className="MenuLabel">{label}</div>
        </div>
    )
}

const ExitItem = () => {
    const setPldMode = useSetRecoilState(StatusStore.pldMode)
    const setDocAndMarkupResetActive = useSetRecoilState(StatusStore.docAndMarkupResetActive)
    const setPldResetActive = useSetRecoilState(StatusStore.pldResetActive)
    const setWarningPopupValue = useSetRecoilState(StatusStore.warningPopupValue)
    const setCurrentMenu = useSetRecoilState(StatusStore.currentMenu)
    return (
        <div
            className="MenuItem MenuItemOff"
            onClick={(e) => {
                const confirmValue = {
                    title: 'PLD 모드',
                    message: 'PLD모드를 종료합니다.',
                    submessage: '현재 작업 중이던 내용은 모두 취소됩니다.',
                    yes: async () => {
                        setCurrentMenu('')
                        setPldMode(false)
                        setDocAndMarkupResetActive(true)
                        setPldResetActive(true)
                    },
                    no: () => {},
                }
                setWarningPopupValue(confirmValue)
            }}
        >
            {icons.closepld.off}
            <div className="MenuLabel">나가기</div>
        </div>
    )
}
