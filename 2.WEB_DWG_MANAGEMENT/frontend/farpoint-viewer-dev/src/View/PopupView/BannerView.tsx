import './BannerView.css'
import { useRecoilValue } from 'recoil'
import { StatusStore } from '../../Store/statusStore'

export function BannerView() {
    const banner = useRecoilValue(StatusStore.banner)

    return (
        <div className="BannerView" hidden={!banner}>
            <div className="BannerViewBox">
                <div className="Indecator" />
                <div className="Label">
                    <div>{banner}</div>
                </div>
            </div>
        </div>
    )
}
