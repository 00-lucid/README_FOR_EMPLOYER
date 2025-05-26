import { useSetRecoilState } from 'recoil'
import { StatusStore } from '../../../../../Store/statusStore'
import equipment from '../../../../../Api/equipment'

interface PictureListProps {
    picture: any
    fetch: any
}

export function PictureList({ picture, fetch }: PictureListProps) {
    const setPicture = useSetRecoilState(StatusStore.picturePopupValue)
    const delPicture = async(serial: string) => {
        const res = await equipment.delEquipmentImage(serial)
        console.log('delPicture.res:', res)
        await fetch()
    }

    return (
        <div>
            <div
                className="Text VerticalCenter"
                style={{
                    fontSize: '11px',
                    left: `calc(0px + var(--TreeView-Indent-Width) * 2 + 24px)`,
                }}
            >
                <div 
                    className="Label"
                    style={{width:'180px', paddingLeft:'5px', paddingRight:'5px'}}
                    onClick={() => setPicture(picture)}
                >
                    {`${picture.NAME}.${picture.PICEXT} (${picture.PBS})`}
                </div>
                <div
                    className="Label"
                    style={{width:'22px', paddingLeft:'5px', paddingRight:'5px'}}
                    onClick={() => delPicture(picture.SERIAL)}
                >
                    삭제
                </div>
            </div>
            
        </div>
    )
}
