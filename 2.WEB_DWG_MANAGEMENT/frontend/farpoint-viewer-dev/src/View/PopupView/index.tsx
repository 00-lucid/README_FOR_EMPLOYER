import React from 'react'
import { useRecoilValue } from 'recoil'
// 전역 Store
import ThemeStore from '../../Store/ThemeStore'
import { MarkUpStore, PldStore } from '../../Store/statusStore'
// Component
import { BannerView } from './BannerView'
import { ViewMarkupList, LoadMarkupList } from './MarkupListView'
import { SaveMarkup } from './SaveMarkup'
import { YesNoPopup } from './YesNoPopup'
import { OkPopup } from './OkPopup'
import { WarningPopup } from './WarningPopup'
import { ViewISOList } from './ISOListView'
import { InputView } from './InputView'
import { PldDocListView } from './PldDocListView'
import { ViewPiMimicList } from './PiMimicListView'
import { SelectView } from '../MainView/PopupMenu/Print/SelectView'
import { ImageView } from './ImageView'
import { SaveEquipmentPicture } from './SaveEquipmentPicture'

const PopupView = () => {
    // 전역 Store
    const theme = useRecoilValue(ThemeStore.theme)
    const currentPld = useRecoilValue(PldStore.currentPld)
    const hasMarkups = useRecoilValue(MarkUpStore.hasMarkups)

    const cssClassName = theme.type === 'light' ? 'LightTheme' : 'DarkTheme'

    return (
        <div className={'PopupView ' + cssClassName}>
            <BannerView />
            <ViewMarkupList />
            <ViewISOList />
            <ViewPiMimicList />
            <SaveMarkup />
            <SaveEquipmentPicture/>
            <YesNoPopup />
            <OkPopup />
            <WarningPopup />
            <InputView />
            <SelectView />
            <ImageView />
            {/* <ViewDocList /> */}
            {hasMarkups ? (
                <React.Fragment>
                    <ViewMarkupList />
                    <LoadMarkupList />
                </React.Fragment>
            ) : null}
            {currentPld ? <PldDocListView /> : null}
        </div>
    )
}

export default PopupView
