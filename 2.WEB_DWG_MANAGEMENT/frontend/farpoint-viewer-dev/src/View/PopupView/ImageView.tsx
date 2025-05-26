import './ImageView.css'
import { useRecoilState, useRecoilValue } from 'recoil'
import { useEffect, useState, Suspense } from 'react'
import { StatusStore } from '../../Store/statusStore'
import crypt from '../../Lib/crypt'

export function ImageView() {
    function Picture({ src }: { src: string }) {
        return <img className="picture-image" src={src} />
    }

    function Skeleton() {
        return <img className="picture-skeleton" alt="" />
    }

    const [picture, setPicture] = useRecoilState(StatusStore.picturePopupValue)

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [src, setSrc] = useState<string>('')

    useEffect(() => {
        if (picture?.SERIAL) {
            const img = new Image()
            img.src = `${process.env.REACT_APP_URL_LOCAL}/equipment/image/${crypt.encrypt(picture?.SERIAL)}`

            img.onload = () => {
                setIsLoading(false)
                setSrc(img.src)
            }
        }
    }, [picture?.SERIAL])

    return (
        <div
            className="picture-view"
            hidden={!picture}
            onClick={() => {
                setPicture(undefined)
            }}
        >
            <div className="picture-flex">
                <div className="picture-container">
                    <Suspense fallback={<Skeleton />}>{src !== '' && !isLoading ? <Picture src={src} /> : <Skeleton />}</Suspense>
                </div>
            </div>
        </div>
    )
}
