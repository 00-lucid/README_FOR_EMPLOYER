import React from 'react'
import './MenuBar.css'
import { toggleFullScreen } from '..'

type Props = {
    currentMenu: string
    onMenuChange: (menuId: string) => void
}

export const MenuBar = ({ currentMenu, onMenuChange }: Props) => {
    return (
        <div className="MenuBar">
            <img
                alt="logo"
                className="Logo"
                src="img/icon-user-logo-24-px-px.png"
                srcSet="img/icon-user-logo-24-px-px@2x.png 2x, img/icon-user-logo-24-px-px@3x.png 3x"
                onClick={() => toggleFullScreen()}
            />
            <MenuItem
                menuId={'drawing'}
                label={'도면'}
                icon={drawinglist}
                currentMenu={currentMenu}
                onMenuChange={onMenuChange}
            />
            <MenuItem
                menuId={'equipment'}
                label={'설비'}
                icon={equipment}
                currentMenu={currentMenu}
                onMenuChange={onMenuChange}
            />
            <MenuItem
                menuId={'note'}
                label={'통지/오더'}
                icon={note}
                currentMenu={currentMenu}
                onMenuChange={onMenuChange}
            />
            <MenuItem
                menuId={'search'}
                label={'검색'}
                icon={search}
                currentMenu={currentMenu}
                onMenuChange={onMenuChange}
            />
            <MenuItem
                menuId={'related'}
                label={'관련문서'}
                icon={related}
                currentMenu={currentMenu}
                onMenuChange={onMenuChange}
            />
            <MenuItem
                menuId={'favorite'}
                label={'즐겨찾기'}
                icon={favorite}
                currentMenu={currentMenu}
                onMenuChange={onMenuChange}
            />
            <div className="line" />
            <div className="VerticalLine" />
        </div>
    )
}

const MenuItem = (props: {
    menuId: string
    label: string
    icon: { on: JSX.Element; off: JSX.Element }
    currentMenu: string
    onMenuChange: (menuId: string) => void
}) => {
    const isOn = props.menuId === props.currentMenu
    const className = ['MenuItem', isOn ? 'MenuItemOn' : 'MenuItemOff'].join(' ')

    return (
        <div className={className} onClick={() => props.onMenuChange(props.menuId)}>
            <svg
                className={'MenuIcon'}
                width="26"
                height="26"
                viewBox="0 0 26 26"
                xmlns="http://www.w3.org/2000/svg"
            >
                {isOn ? props.icon.on : props.icon.off}
            </svg>
            <div className="MenuLabel">{props.label}</div>
        </div>
    )
}

const drawinglist = {
    off: (
        <g stroke="#000" fill="none" fillRule="evenodd">
            <path d="M4.875 15.167v2.167M4.875 20.583v2.709h16.25V7.042l-4.333-4.334H4.875v11.375" />
            <path d="M20.583 7.042h-3.791V3.25M15.167 13.542h2.708v6.5h-6.5V16.25" />
            <path d="M15.708 12.993a3.784 3.784 0 1 1-7.568 0 3.784 3.784 0 0 1 7.568 0z" />
        </g>
    ),
    on: (
        <g stroke="#fff" fill="none" fillRule="evenodd">
            <path d="M4.875 15.167v2.167M4.875 20.583v2.709h16.25V7.042l-4.333-4.334H4.875v11.375" />
            <path d="M20.583 7.042h-3.791V3.25M15.167 13.542h2.708v6.5h-6.5V16.25" />
            <path d="M15.708 12.993a3.784 3.784 0 1 1-7.568 0 3.784 3.784 0 0 1 7.568 0z" />
        </g>
    )
}

const equipment = {
    off: (
        <g stroke="#000" fill="none" fillRule="evenodd">
            <path d="M23.292 13.736v-1.922l-2.25-.75c-.032-.083-.062-.168-.098-.249L22.001 8.7l-1.358-1.358-2.116 1.057c-.081-.037-.166-.066-.25-.098l-.75-2.25h-1.92l-.75 2.25c-.085.032-.17.061-.25.098L12.49 7.341l-1.359 1.358 1.058 2.116c-.036.081-.066.166-.099.25l-2.249.75v1.92l2.25.75c.032.085.062.168.098.25l-1.058 2.117 1.359 1.358 2.116-1.058c.08.036.165.067.25.098l.75 2.25h1.92l.75-2.25c.084-.031.169-.062.25-.098l2.116 1.058L22 16.852l-1.057-2.116c.036-.083.066-.166.099-.25l2.249-.75z" />
            <path d="M18.488 12.775a1.921 1.921 0 1 1-3.843 0 1.921 1.921 0 0 1 3.843 0zM21.125 5.417V2.708H5.958v13.025M11.917 23.292h7.611c.882 0 1.597-.715 1.597-1.597v-1.112M4.333 23.292a1.626 1.626 0 0 1-1.625-1.625v-5.959h3.25v5.959c0 .897-.728 1.625-1.625 1.625zM10.834 23.292H8.667" />
        </g>
    ),
    on: (
        <g stroke="#fff" fill="none" fillRule="evenodd">
            <path d="M23.292 13.736v-1.922l-2.25-.75c-.032-.083-.062-.168-.098-.249L22.001 8.7l-1.358-1.358-2.116 1.057c-.081-.037-.166-.066-.25-.098l-.75-2.25h-1.92l-.75 2.25c-.085.032-.17.061-.25.098L12.49 7.341l-1.359 1.358 1.058 2.116c-.036.081-.066.166-.099.25l-2.249.75v1.92l2.25.75c.032.085.062.168.098.25l-1.058 2.117 1.359 1.358 2.116-1.058c.08.036.165.067.25.098l.75 2.25h1.92l.75-2.25c.084-.031.169-.062.25-.098l2.116 1.058L22 16.852l-1.057-2.116c.036-.083.066-.166.099-.25l2.249-.75z" />
            <path d="M18.488 12.775a1.921 1.921 0 1 1-3.843 0 1.921 1.921 0 0 1 3.843 0zM21.125 5.417V2.708H5.958v13.025M11.917 23.292h7.611c.882 0 1.597-.715 1.597-1.597v-1.112M4.333 23.292a1.626 1.626 0 0 1-1.625-1.625v-5.959h3.25v5.959c0 .897-.728 1.625-1.625 1.625zM10.834 23.292H8.667" />
        </g>
    )
}

const search = {
    off: (
        <g stroke="#000" fill="none" fillRule="evenodd">
            <path d="M16.252 19.314a8.935 8.935 0 0 0 4.336-7.666 8.939 8.939 0 0 0-8.94-8.94 8.94 8.94 0 1 0 1.24 17.795" />
            <path d="M5.724 9.729a6.213 6.213 0 0 0-.296 2.192M9.707 5.73a6.248 6.248 0 0 0-3.52 2.924M23.292 23.292l-5.177-5.13" />
        </g>
    ),
    on: (
        <g stroke="#fff" fill="none" fillRule="evenodd">
            <path d="M16.252 19.314a8.935 8.935 0 0 0 4.336-7.666 8.939 8.939 0 0 0-8.94-8.94 8.94 8.94 0 1 0 1.24 17.795" />
            <path d="M5.724 9.729a6.213 6.213 0 0 0-.296 2.192M9.707 5.73a6.248 6.248 0 0 0-3.52 2.924M23.292 23.292l-5.177-5.13" />
        </g>
    )
}

const favorite = {
    off: (
        <g stroke="#000" fill="none" fillRule="evenodd">
            <path d="m3.39 11.292-1.143-1.114 7.486-1.087 3.347-6.784 3.348 6.784 7.486 1.087-5.417 5.28 1.28 7.456-6.697-3.52-6.695 3.52 1.279-7.456M5.42 13.27l-1.21-1.177" />
        </g>
    ),
    on: (
        <g stroke="#fff" fill="none" fillRule="evenodd">
            <path d="m3.39 11.292-1.143-1.114 7.486-1.087 3.347-6.784 3.348 6.784 7.486 1.087-5.417 5.28 1.28 7.456-6.697-3.52-6.695 3.52 1.279-7.456M5.42 13.27l-1.21-1.177" />
        </g>
    )
}

const note = {
    off: (
        <g stroke="#000" fill="none" fillRule="evenodd">
            <path
                transform="matrix(0.722222,0,0,0.722222,0,0)"
                d="M 30.185697 20.093149 C 30.185697 24.566106 26.561899 28.189904 22.094351 28.189904 C 17.621394 28.189904 13.997596 24.566106 13.997596 20.093149 C 13.997596 15.625601 17.621394 12.001803 22.094351 12.001803 C 26.561899 12.001803 30.185697 15.625601 30.185697 20.093149 Z M 27.876202 25.875 L 32.500601 30.499399 "
            />
            <path
                transform="matrix(0.722222,0,0,0.722222,0,0)"
                d="M 24.501202 6.998798 L 24.501202 3.499399 L 11.69351 3.499399 L 3.499399 11.69351 L 3.499399 32.500601 L 24.501202 32.500601 L 24.501202 28.000601 M 24.501202 9 L 24.501202 6.998798 "
            />
        </g>
    ),
    on: (
        <g stroke="#fff" fill="none" fillRule="evenodd">
            <path
                transform="matrix(0.722222,0,0,0.722222,0,0)"
                d="M30.188 20.094a8.094 8.094 0 1 1-16.189 0 8.094 8.094 0 0 1 16.188 0zM27.875 25.875 32.5 30.5"
            />
            <path
                transform="matrix(0.722222,0,0,0.722222,0,0)"
                d="M24.5 8.007V3.5H11.692L3.5 11.692V32.5h21V28"
            />
        </g>
    )
}

const related = {
    off: (
        <g>
            <path
                stroke="none"
                fillRule="evenodd"
                fill="#000"
                fillOpacity={1}
                d="M 15.84375 2.4375 L 7.316406 2.4375 C 6.417969 2.4375 5.6875 3.167969 5.6875 4.070312 L 5.6875 22.742188 C 5.6875 23.644531 6.410156 24.375 7.308594 24.375 L 19.503906 24.375 C 20.398438 24.375 21.125 23.644531 21.125 22.757812 L 21.125 8.125 L 16.25 2.4375 Z M 15.4375 3.25 L 7.308594 3.25 C 6.863281 3.25 6.5 3.621094 6.5 4.058594 L 6.5 22.753906 C 6.5 23.199219 6.871094 23.5625 7.3125 23.5625 L 19.5 23.5625 C 19.949219 23.5625 20.3125 23.199219 20.3125 22.753906 L 20.3125 8.9375 L 17.0625 8.9375 C 16.164062 8.9375 15.4375 8.21875 15.4375 7.308594 Z M 16.25 3.65625 L 16.25 7.304688 C 16.25 7.757812 16.617188 8.125 17.058594 8.125 L 20.070312 8.125 Z M 16.25 3.65625 "
            />
            <path
                fill="none"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke="#000"
                strokeOpacity={1}
                strokeMiterlimit={4}
                d="M 10.001056 12.996562 C 10.865378 14.161971 12.197544 14.891343 13.648654 14.994406 C 15.091834 15.09747 16.511225 14.566297 17.542068 13.543591 L 20.539442 10.538897 C 22.434607 8.580693 22.410818 5.45708 20.476006 3.530587 C 18.549122 1.604095 15.432805 1.572383 13.466274 3.467163 L 11.753489 5.179601 "
                transform="matrix(0.492619,0,0,0.492719,7.522512,9.799476)"
            />
            <path
                fill="none"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke="#000"
                strokeOpacity={1}
                strokeMiterlimit={4}
                d="M 13.997554 10.998718 C 13.133232 9.841237 11.801066 9.111866 10.349956 9.008802 C 8.906776 8.905739 7.487385 9.436912 6.456542 10.459617 L 3.459168 13.456383 C 1.564003 15.422516 1.595721 18.538201 3.522605 20.472621 C 5.449488 22.399114 8.565805 22.422897 10.532336 20.528117 L 12.237192 18.823607 "
                transform="matrix(0.492619,0,0,0.492719,7.522512,9.799476)"
            />
        </g>
    ),
    on: (
        <g>
            <path
                stroke="none"
                fillRule="evenodd"
                fill="#fff"
                fillOpacity={1}
                d="M 15.84375 2.4375 L 7.316406 2.4375 C 6.417969 2.4375 5.6875 3.167969 5.6875 4.070312 L 5.6875 22.742188 C 5.6875 23.644531 6.410156 24.375 7.308594 24.375 L 19.503906 24.375 C 20.398438 24.375 21.125 23.644531 21.125 22.757812 L 21.125 8.125 L 16.25 2.4375 Z M 15.4375 3.25 L 7.308594 3.25 C 6.863281 3.25 6.5 3.621094 6.5 4.058594 L 6.5 22.753906 C 6.5 23.199219 6.871094 23.5625 7.3125 23.5625 L 19.5 23.5625 C 19.949219 23.5625 20.3125 23.199219 20.3125 22.753906 L 20.3125 8.9375 L 17.0625 8.9375 C 16.164062 8.9375 15.4375 8.21875 15.4375 7.308594 Z M 16.25 3.65625 L 16.25 7.304688 C 16.25 7.757812 16.617188 8.125 17.058594 8.125 L 20.070312 8.125 Z M 16.25 3.65625 "
            />
            <path
                fill="none"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke="#fff"
                strokeOpacity={1}
                strokeMiterlimit={4}
                d="M 10.001056 12.996562 C 10.865378 14.161971 12.197544 14.891343 13.648654 14.994406 C 15.091834 15.09747 16.511225 14.566297 17.542068 13.543591 L 20.539442 10.538897 C 22.434607 8.580693 22.410818 5.45708 20.476006 3.530587 C 18.549122 1.604095 15.432805 1.572383 13.466274 3.467163 L 11.753489 5.179601 "
                transform="matrix(0.492619,0,0,0.492719,7.522512,9.799476)"
            />
            <path
                fill="none"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke="#fff"
                strokeOpacity={1}
                strokeMiterlimit={4}
                d="M 13.997554 10.998718 C 13.133232 9.841237 11.801066 9.111866 10.349956 9.008802 C 8.906776 8.905739 7.487385 9.436912 6.456542 10.459617 L 3.459168 13.456383 C 1.564003 15.422516 1.595721 18.538201 3.522605 20.472621 C 5.449488 22.399114 8.565805 22.422897 10.532336 20.528117 L 12.237192 18.823607 "
                transform="matrix(0.492619,0,0,0.492719,7.522512,9.799476)"
            />
        </g>
    )
}
