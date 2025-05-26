import React, { Suspense, useEffect, useState } from 'react'
import crypt from '../../../../../Lib/crypt'
import './PictureBox.css'

interface PictureBoxProps {
    picture: any
}

function Picture({ src }: { src: string }) {
    return <img className="picture-box-image" src={src} />
}

function Skeleton() {
    return <img className="picture-box-skeleton" alt="" />
}

export function PictureBox({ picture }: PictureBoxProps) {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [src, setSrc] = useState<string>('')

    useEffect(() => {
        if (picture.SERIAL) {
            const img = new Image()
            img.src = `${process.env.REACT_APP_URL_LOCAL}/equipment/image/${crypt.encrypt(picture.SERIAL)}`
    
            img.onload = () => {
                setIsLoading(false)
                setSrc(img.src)
            }
        }
    }, [picture.SERIAL])

    return (
        <div className="picture-box-container">
            <Suspense fallback={<Skeleton />}>{src !== '' && !isLoading ? <Picture src={src} /> : <Skeleton />}</Suspense>
        </div>
    )
}
