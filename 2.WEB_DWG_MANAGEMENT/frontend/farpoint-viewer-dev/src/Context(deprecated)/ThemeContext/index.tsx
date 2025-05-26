import React, { Children } from 'react'
import './ThemeContext.css'
import './NanumBarunGothic.otf'
import { global } from '../../Lib/util'

const darkTheme = {
    type: 'dark',
    backgroundColor: { r: 20, g: 20, b: 20 },
    strokeColor: { r: 240, g: 240, b: 240 },
    mouseOverColor: { r: 20, g: 20, b: 255 },
    selectedColor: { r: 0, g: 0, b: 235 },
    equipmentLibColor: { r: 30, g: 132, b: 73 },
    notificationColor: { r: 243, g: 156, b: 18 },
    orderColor: { r: 199, g: 0, b: 57 },
    pldColor: { r: 255, g: 152, b: 0 },
    pldMainLineColor: { r: 252, g: 3, b: 244 },
    pldSubLineColor: { r: 3, g: 215, b: 252 },
    pldOpenValveColor: { r: 255, g: 2, b: 3 },
    pldCloseValveColor: { r: 3, g: 11, b: 252 },
    pldControlValveColor: { r: 3, g: 251, b: 107 },
}

const lightTheme = {
    type: 'light',
    backgroundColor: { r: 255, g: 255, b: 255 },
    strokeColor: { r: 0, g: 0, b: 0 },
    mouseOverColor: { r: 20, g: 20, b: 255 },
    selectedColor: { r: 0, g: 0, b: 235 },
    equipmentLibColor: { r: 0, g: 80, b: 255 },
    notificationColor: { r: 243, g: 156, b: 18 },
    orderColor: { r: 199, g: 0, b: 57 },
    pldColor: { r: 255, g: 152, b: 0 },
    pldMainLineColor: { r: 252, g: 3, b: 244 },
    pldSubLineColor: { r: 3, g: 215, b: 252 },
    pldOpenValveColor: { r: 255, g: 2, b: 3 },
    pldCloseValveColor: { r: 3, g: 11, b: 252 },
    pldControlValveColor: { r: 3, g: 251, b: 107 },
}

const defaultTheme = lightTheme

class ThemeContextImpl {
    public readonly theme: Theme
    public readonly documentDisplayType: DisplayType
    public readonly toggleTheme: () => void
    public readonly setDocumentDisplayType: (value: DisplayType) => void

    public constructor(
        theme: Theme,
        documentDisplayType: DisplayType,
        toggleTheme: () => void,
        setDocumentDisplayType: (value: DisplayType) => void
    ) {
        this.theme = theme
        this.documentDisplayType = documentDisplayType
        this.toggleTheme = toggleTheme
        this.setDocumentDisplayType = setDocumentDisplayType
    }
}

const defaultValue = new ThemeContextImpl(
    defaultTheme,
    'number',
    () => {},
    (value: DisplayType) => {}
)

const ThemeContext = React.createContext(defaultValue)

/*
  description : 테마 컨텍스트(정보) 
*/
const ThemeContextProvider = ({ children }: Children) => {
    global.log('ThemeContextProvider 읽힘')
    const [context, setContext] = React.useState(defaultValue)
    const [theme, setTheme] = React.useState<Theme>(lightTheme)
    const [documentDisplayType, setDocumentDisplayType] = React.useState<DisplayType>('number')

    const toggleTheme = React.useCallback(() => {
        setTheme((prev) => {
            if (prev.type === 'light') {
                return darkTheme
            } else {
                return lightTheme
            }
        })
    }, [])

    React.useEffect(() => {
        setContext(new ThemeContextImpl(theme, documentDisplayType, toggleTheme, setDocumentDisplayType))
    }, [theme, toggleTheme, setDocumentDisplayType, documentDisplayType])

    return <ThemeContext.Provider value={context}>{children}</ThemeContext.Provider>
}

export { ThemeContext, ThemeContextProvider }
