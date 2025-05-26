import React from 'react'
import './PldMenubar.css'
import * as icons from './MenuBarIcons'
import { toggleFullScreen } from '../common/fullScreen'
import { StatusContext } from '..'
import { AppContext } from '../context'
import { pushCommand } from '../common'
import { resetPldData } from '../mainview/canvas/Pld/PldUtil'

export const PldMenuBar = () => {
    const app = React.useContext(AppContext)
    const status = React.useContext(StatusContext)

    React.useEffect(() => {
        if (app.currentPld) {
            status.onMenuChange('process')
        } else {
            status.onMenuChange('')
        }
    }, [app.currentPld])

    return (
        <div className="PldMenubar">
            <img
                alt="logo"
                className="Logo"
                src="img/icon-user-logo-24-px-px.png"
                srcSet="img/icon-user-logo-24-px-px@2x.png 2x, img/icon-user-logo-24-px-px@3x.png 3x"
                onClick={() => toggleFullScreen()}
            />
            <MenuItem menuId={'create'} label={'New'} icon={icons.create} />
            <MenuItem menuId={'open'} label={'열기'} icon={icons.openpld} />
            <div className={`${app.currentPld?.PLD_C_ID ? '' : 'disable'}`}>
                <MenuItem menuId={'process'} label={'프로세스'} icon={icons.process} />
            </div>
            <ExitItem />
            <div className="line" />
        </div>
    )
}

type MenuItemProps = {
    menuId: string
    label: string
    icon: { on: JSX.Element; off: JSX.Element }
}

const ExitItem = () => {
    const app = React.useContext(AppContext)

    return (
        <div
            className="MenuItem MenuItemOff"
            onClick={(e) => {
                const confirmValue = {
                    title: 'PLD 모드',
                    message: 'PLD모드를 종료합니다.',
                    yes: async () => {
                        app.togglePldMode()

                        resetPldData(app)

                        e.stopPropagation()
                    },
                    no: () => {}
                }
                pushCommand({ name: 'showWarningView', value: confirmValue })
            }}
        >
            {closeIcon}
            <div className="MenuLabel">나가기</div>
        </div>
    )
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

const closeIcon = (
    <svg className={'MenuIcon'} width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" fillRule="evenodd" fill="#fff" fillOpacity={1}>
            <path d="M 5.34375 5.34375 C 1.113281 9.570312 1.113281 16.429688 5.34375 20.65625 C 9.570312 24.886719 16.429688 24.886719 20.65625 20.65625 C 24.886719 16.429688 24.886719 9.574219 20.65625 5.34375 C 16.429688 1.113281 9.574219 1.113281 5.34375 5.34375 Z M 20.042969 20.042969 C 16.160156 23.929688 9.839844 23.929688 5.953125 20.042969 C 2.070312 16.160156 2.070312 9.839844 5.953125 5.953125 C 9.839844 2.070312 16.160156 2.070312 20.042969 5.953125 C 23.929688 9.839844 23.929688 16.160156 20.042969 20.042969 Z M 20.042969 20.042969 " />
            <path d="M 8.710938 8.101562 L 8.097656 8.710938 L 12.386719 13 L 8.121094 17.269531 L 8.730469 17.882812 L 13 13.613281 L 17.269531 17.882812 L 17.878906 17.269531 L 13.613281 13 L 17.902344 8.710938 L 17.289062 8.101562 L 13 12.386719 Z M 8.710938 8.101562 " />
        </g>
    </svg>
)
