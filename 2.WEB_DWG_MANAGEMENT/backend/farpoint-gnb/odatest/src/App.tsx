import React from 'react'
import './App.css'
import { Canvas } from './Canvas'

function App() {
    const [docFile, setDocFile] = React.useState<Uint8Array>()

    React.useEffect(() => {
        async function fetchData() {
            const res = await fetch('/color.vsf')
            // const res = await fetch('/large.vsf')
            // const res = await fetch('/large.server.vsfx')

            const buffer = await res.arrayBuffer()

            setDocFile(new Uint8Array(buffer))
        }

        fetchData()
    }, [])

    return <Canvas docFile={docFile} />
}

export default App
