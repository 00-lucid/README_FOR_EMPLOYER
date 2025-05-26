import React from 'react'
import { Canvas } from './canvas/Canvas'
import './BasicView.css'
import Repository from '../Repository'
import { setHandler, SelectedDocument } from '..'

export const BasicView = () => {
    const [docFile, setDocFile] = React.useState<Uint8Array>()

    React.useEffect(() => {
        setHandler('openDocument', async (value: SelectedDocument) => {
            const docFile = await Repository.getDocumentFile(value.docKey)

            setDocFile(docFile)
        })
    }, [])

    return (
        <div className={'BasicView'}>
            <Canvas docFile={docFile} />
        </div>
    )
}
