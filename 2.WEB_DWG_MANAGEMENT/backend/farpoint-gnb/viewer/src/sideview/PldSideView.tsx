import './SideView.css'
import { PldMenuBar } from './PldMenubar'
import { CreatePldMenu } from './createpld/CreatePldMenu'
import { OpenPldMenu } from './open/OpenPld'
import { PldProcessMenu } from './process/PldProcessMenu'

export const PldSideView = () => {
    return (
        <div className={'SideView SideViewShadow'} onClick={(e) => e.stopPropagation()}>
            <CreatePldMenu />
            <OpenPldMenu />
            <PldProcessMenu />
            <div className="Background"></div>
            <PldMenuBar />
        </div>
    )
}
