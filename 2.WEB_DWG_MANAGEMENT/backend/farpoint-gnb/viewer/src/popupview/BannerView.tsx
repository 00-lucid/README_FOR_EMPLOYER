import React from 'react'
import './BannerView.css'

export function setBanner(message: string | undefined) {
    var event = new CustomEvent('showNotification', { detail: message })

    document.dispatchEvent(event)
}

export function BannerView() {
    const [message, setMessage] = React.useState<string>()

    React.useEffect(() => {
        const handler = (event: CustomEvent<string | undefined>) => {
            const message = event.detail

            setMessage(message)
        }

        document.addEventListener<any>('showNotification', handler, { passive: false })

        return () => {
            document.removeEventListener<any>('showNotification', handler)
        }
    }, [])

    return (
        <div className="BannerView" hidden={!message}>
            <div className="BannerViewBox">
                <div className="Indecator" />
                <div className="Label">
                    <div>{message}</div>
                </div>
            </div>
        </div>
    )
}
