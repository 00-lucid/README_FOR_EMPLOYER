import React, { createContext } from 'react'
import { EntityPainter } from '../Controller/UseCanvas/useEntityPainter'
const PainterContext = createContext<PainterContextType | null>(null)

/*
    description : painter context, 도면 설비에 색상 입히기
*/
const PainterContextProvider = ({ children }: Children) => {
    const [entityPainter, setEntityPainter] = React.useState<EntityPainter | undefined>()

    const value = {
        entityPainter,
        setEntityPainter,
    }
    return <PainterContext.Provider value={value}>{children}</PainterContext.Provider>
}

export { PainterContext, PainterContextProvider }
