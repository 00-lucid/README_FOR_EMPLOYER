import React from 'react'
import { ThemeContext } from '../context'
import { BannerView } from './BannerView'
import { YesNoPopup } from './YesNoPopup'
import { OkPopup } from './OkPopup'
import { SaveMarkup } from './SaveMarkup'
import { LoadMarkupList, ViewMarkupList } from './MarkupListView'
import { InputView } from './InputView'
import { WarningView } from './WarningView'
import { ViewDocList } from './PldDocListView'

export function PopupView() {
    const theme = React.useContext(ThemeContext)

    const cssClassName = theme.theme.type === 'light' ? 'LightTheme' : 'DarkTheme'

    return (
        <div className={'PopupView ' + cssClassName}>
            <SaveMarkup />
            <ViewMarkupList />
            <LoadMarkupList />
            <YesNoPopup />
            <OkPopup />
            <BannerView />
            <InputView />
            <WarningView />
            <ViewDocList />
        </div>
    )
}
