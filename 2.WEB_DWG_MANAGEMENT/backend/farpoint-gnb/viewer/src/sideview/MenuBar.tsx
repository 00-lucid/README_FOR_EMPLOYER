import React, { useEffect } from 'react'
import './MenuBar.css'
import * as icons from './MenuBarIcons'
import { toggleFullScreen } from '../common/fullScreen'
import { StatusContext } from '..'

export const MenuBar = () => {
    const status = React.useContext(StatusContext)
    const [isTabChanged, setIsTabChanged] = React.useState(false)
    const [nowTab, setNowTab] = React.useState(status.currentTab)
    useEffect(() => {
        setIsTabChanged(false)
        // console.log('isTabChanged: false');
        setTimeout(() => {
            setIsTabChanged(true)
            setNowTab(status.currentTab)
            // console.log('isTabChanged: true');
        }, 200)
    }, [status.currentTab])
    return (
        <div className="MenuBar">
            <img
                alt="logo"
                className="Logo"
                src="img/icon-user-logo-24-px-px.png"
                srcSet="img/icon-user-logo-24-px-px@2x.png 2x, img/icon-user-logo-24-px-px@3x.png 3x"
                onClick={() => toggleFullScreen()}
            />
            <div style={style(isTabChanged)}>
                <MenuItem menuId={'document'} label={'도면'} icon={icons.document} />
                <MenuItem menuId={'equipment'} label={'설비'} icon={icons.equipment} />
                {nowTab == 'viewer' && <MenuItem menuId={'notiorder'} label={'통지/오더'} icon={icons.notiorder} />}
                <MenuItem menuId={'search'} label={'검색'} icon={icons.search} />
                {nowTab == 'viewer' && <MenuItem menuId={'related'} label={'관련문서'} icon={icons.related} />}
                {nowTab == 'viewer' && <MenuItem menuId={'favorite'} label={'즐겨찾기'} icon={icons.favorite} />}
                {nowTab == 'viewer' && <MenuItem menuId={'mydoc'} label={'내 문서'} icon={icons.personalDocument} />}
                <div className="line" />
                <div className="VerticalLine" />
                {nowTab == 'wcd' && <MenuItem menuId={'legend'} label={'범례'} icon={icons.document} />}
            </div>
        </div>
    )
}

function style(isTabChanged: boolean) {
    return isTabChanged ? { marginLeft: '0px' } : { marginLeft: 'calc(var(--SideMenuWidth)*-1' }
}

type MenuItemProps = {
    menuId: string
    label: string
    icon: { on: JSX.Element; off: JSX.Element }
}

const MenuItem = ({ menuId, label, icon }: MenuItemProps) => {
    const status = React.useContext(StatusContext)

    const isOn = menuId === status.currentMenu
    const className = ['MenuItem', isOn ? 'MenuItemOn' : 'MenuItemOff'].join(' ')

    return (
        <div className={className} onClick={() => status.onMenuChange(menuId)}>
            <svg className={'MenuIcon'} width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
                {isOn ? icon.on : icon.off}
            </svg>
            <div className="MenuLabel">{label}</div>
        </div>
    )
}
