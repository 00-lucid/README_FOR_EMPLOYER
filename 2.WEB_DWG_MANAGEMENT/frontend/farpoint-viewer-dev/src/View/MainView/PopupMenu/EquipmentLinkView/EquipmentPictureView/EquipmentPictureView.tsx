import './EquipmentPictureView.css'
import { useEffect, useMemo, useState } from 'react'
import equipment from '../../../../../Api/equipment'
import { PictureList } from './PictureList'
import { PictureListSkeleton } from './PictureListSkeleton'

interface EquipmentLinkPictureViewProps {
    selectedCanvas: any
    equipmentLink: any
}

export function EquipmentPictureView({ selectedCanvas, equipmentLink }: EquipmentLinkPictureViewProps) {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [pictures, setPictures] = useState<[]>([])

    const fetch = async () => {
        const tplnr = selectedCanvas.equipmentByTagId.get(equipmentLink.tagId)?.function
        const res = await equipment.getEquipmentImage(tplnr)
        console.log('EquipmentPictureView.res:', res)
        setPictures(res)
        setIsLoading(false)
    }
    useEffect(() => {
        fetch()
    }, [equipmentLink])

    const pictureList = useMemo(() => {
        return pictures.map((picture: any) => 
            <PictureList key={picture.SERIAL} picture={picture} fetch={fetch} />)
    }, [pictures])

    if (isLoading && pictures.length === 0) return <PictureListSkeleton />

    if (!isLoading && pictures.length == 0)
        return (
            <div
                className="Label"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <div
                    className="Text VerticalCenter"
                    style={{
                        left: `calc(0px + var(--TreeView-Indent-Width) * 1 + 24px)`,
                    }}
                >
                    검색 결과가 없습니다
                </div>
            </div>
        )

    return <div className="equipment-picture-view-container">{pictureList}</div>
}
