import './FavoriteMenu.css'
import { useRecoilState, useRecoilValue } from 'recoil'
// 전역 Store
import { StatusStore } from '../../../Store/statusStore'
import ThemeStore from '../../../Store/ThemeStore'
// Component
import { CloseSideMenuBtn } from '../Component/CloseSideMenuBtn'
import FavoriteFolder from '../Component/Favorite/FavoriteFolder'
import { TreeView } from '../../CommonView/TreeView'
import { DocumentDisplaySelect } from '../Component/DocumentDisplaySelect'
import { TopLine } from '../Component/TopLine'
// Lib

export function FavoriteMenu() {
    // 전역 Store
    const currentMenu = useRecoilValue(StatusStore.currentMenu)
    const [favoriteDocumentDisplayType, setFavoriteDocumentDisplayType] = useRecoilState(ThemeStore.favoriteDocumentDisplayType)

    function style(currentMenu: string) {
        return 'favorite' === currentMenu
            ? { transform: 'translateX(var(--SideMenuWidth))' }
            : { transform: 'translateX(calc(var(--FavoriteMenuWidth) * -1 ))' }
    }

    return (
        <div className="FavoriteMenu SideViewShadow SideViewBackground" style={style(currentMenu)}>
            <div className="VerticalLine" />
            <span className="SideMenuLabel">즐겨찾기</span>
            <CloseSideMenuBtn />
            <DocumentDisplaySelect
                documentDisplayType={favoriteDocumentDisplayType}
                setDocumentDisplayType={setFavoriteDocumentDisplayType}
            />
            <TopLine />

            {/* TreeView 즐겨찾기 -> 도면, 설비 목록 */}
            <TreeView id="favoriteMenuTreeView">{<FavoriteFolder depth={0} keyIdx={0} />}</TreeView>
        </div>
    )
}
