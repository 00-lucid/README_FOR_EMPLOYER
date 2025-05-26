import './PictureListSkeleton.css'

export function PictureListSkeleton() {
    return (
        <>
            <div
                className="Label"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <div className="picture-list-skeleton"></div>
                <div className="picture-list-skeleton"></div>
                <div className="picture-list-skeleton"></div>
            </div>
        </>
    )
}
