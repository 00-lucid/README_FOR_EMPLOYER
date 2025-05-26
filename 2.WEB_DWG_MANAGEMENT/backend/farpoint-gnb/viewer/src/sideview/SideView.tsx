import React, { Suspense } from 'react'
import './SideView.css'
import { MenuBar } from './MenuBar'
import { DocumentMenu } from './document/DocumentMenu'
import { EquipmentMenu } from './equipment/EquipmentMenu'
import { NotiorderMenu } from './notiorder/NotiorderMenu'
import { SearchMenu } from './search/SearchMenu'
import { RelatedMenu } from './related/RelatedMenu'
import { FavoriteMenu } from './favorite/FavoriteMenu'
import { MydocMenu } from './mydoc/MydocMenu'
import { AppContext } from '../context/'
import { ConversionMenu } from './ConversionMenu'

const PldSideView = React.lazy(() => {
    return import('./PldSideView').then(({ PldSideView }) => ({ default: PldSideView }))
})

export const SideView = () => {
    const appContext = React.useContext(AppContext)

    const isPldMode = appContext.pldMode

    return (
        <Suspense fallback={false}>
            {isPldMode ? (
                <PldSideView />
            ) : (
                <div className={'SideView SideViewShadow'} onClick={(e) => e.stopPropagation()}>
                    <DocumentMenu />
                    <EquipmentMenu />
                    <NotiorderMenu />
                    <SearchMenu />
                    <RelatedMenu />
                    <FavoriteMenu />
                    <MydocMenu />
                    <div className="Background"></div>
                    <MenuBar />
                </div>
            )}
            <ConversionMenu />
        </Suspense>
    )
}
