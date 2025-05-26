import './SideView.css'
import { useRecoilValue } from 'recoil'
// 전역 Store
import { StatusStore, PldStore } from '../../Store/statusStore'
// Viewer
import { MenuItemBar } from './MenuItemBar'
import { DocumentMenu } from './DocumentMenu'
import { EquipmentMenu } from './EquipmentMenu'
import { NotiorderMenu } from './NotiorderMenu'
import { ConversionMenu } from './ConversionMenu'
import { SearchMenu } from './SearchMenu'
import { RelatedMenu } from './RelatedMenu'
import { FavoriteMenu } from './FavoriteMenu'
import { ProcedureMenu } from './ProcedureMenu'
// PLD Viewer
import { CreatePldMenu } from './Pld/CreatePldMenu'
import { OpenPldMenu } from './Pld/OpenPldMenu'
import { PldProcessMenu } from './Pld/PldProcessMenu'
// Lib
import { global } from '../../Lib/util'
import { PldMenuItemBar } from './Pld/PldMenuItemBar'
import { MydocMenu } from './MyDocMenu'
import procedure from '../../Api/procedure'

const SideView = () => {
    global.log('SideView start')

    // 전역 Store
    const pldMode = useRecoilValue(StatusStore.pldMode)
    const currentPld = useRecoilValue(PldStore.currentPld)

    return (
        <>
            {pldMode ? (
                // PLD 메뉴
                <div className={'SideView SideViewShadow'} onClick={(e) => e.stopPropagation()}>
                    {/* PLD 생성 */}
                    <CreatePldMenu />
                    {/* PLD 조회 */}
                    <OpenPldMenu />
                    {/* PLD 편집 */}
                    {currentPld ? <PldProcessMenu currentPld={currentPld} /> : null}
                    <div className="Background"></div>
                    <PldMenuItemBar />
                </div>
            ) : (
                // VIEW 메뉴
                <div className={'SideView SideViewShadow'}>
                    <DocumentMenu />
                    <EquipmentMenu />
                    <NotiorderMenu />
                    <SearchMenu />
                    <RelatedMenu />
                    <FavoriteMenu />
                    {
                        process.env.REACT_APP_DB === '남부' && <MydocMenu />
                    }
                    <ProcedureMenu />
                    <div className="Background"></div>
                    <MenuItemBar />
                </div>
            )}

            {/* PLD or VIEW */}
            <ConversionMenu />
        </>
    )
}

export default SideView
