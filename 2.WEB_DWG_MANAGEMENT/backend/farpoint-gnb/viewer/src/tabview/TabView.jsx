import React, { useEffect } from 'react'
import './TabView.css'
import * as icons from './TabViewIcons'
import { StatusContext } from '..'

export const TabView = () => {
    const status = React.useContext(StatusContext)
    return (
        <></>
        // <div>
        //     {(status.currentMenu==''||status.currentMenu=='legend')&&<div className='TabView'>
        //         <TabItem tabId='viewer' tabLabel='뷰어' tabIcon={icons.viewer} />
        //         {/* <TabItem tabId='wcd' tabLabel='WCD' tabIcon={icons.wcd} /> */}
        //         <TabItem tabId='pld' tabLabel='PLD' tabIcon={icons.pld} />
        //     </div>}
        // </div>
    )
}

const TabItem = ({ tabId, tabLabel, tabIcon }) => {
    const status = React.useContext(StatusContext)
    // console.log('currentTab:', status.currentTab);
    const isOn = tabId === status.currentTab
    const className = ['TabItem', isOn ? 'TabItemOn' : 'TabItemOff'].join(' ')
    return (
        <div className={className} onClick={() => status.onTabChange(tabId)}>
            <svg className="TabIcon" width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
                {isOn ? tabIcon.on : tabIcon.off}
            </svg>
            <div className="TabLine" />
            <div className="TabLabel">{tabLabel}</div>
        </div>
    )
}
