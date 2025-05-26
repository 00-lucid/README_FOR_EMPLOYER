import React, { createContext } from 'react'
import { CanvasController } from '../Controller/UseCanvas/CanvasController'
const ControllerContext = createContext<CanvasContextType | null>(null)

/*
  description : controller context, 
                도면 캔버스 컨트롤러는 recoil - atom 에 담을 수 없어서 
                Context API로 전역 변수 사용
*/
const ControllerContextProvider = ({ children }: Children) => {
    const [canvasController, setCanvasController] = React.useState<CanvasController | undefined>()

    const value = {
        canvasController,
        setCanvasController,
    }
    return <ControllerContext.Provider value={value}>{children}</ControllerContext.Provider>
}

export { ControllerContext, ControllerContextProvider }
