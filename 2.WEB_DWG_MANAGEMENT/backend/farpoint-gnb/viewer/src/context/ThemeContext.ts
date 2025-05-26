import React from 'react'
import './ThemeContext.css'
import { Color } from '../types'
import './NanumBarunGothic.otf'

export type Theme = {
    type: string
    backgroundColor: Color
    strokeColor: Color
    mouseOverColor: Color
    selectedColor: Color
    equipmentLibColor: Color
    notificationColor: Color
    orderColor: Color
    // equipmemtColor: Color
    // crteColor: Color
    // prepColor: Color
    // ptagColor: Color
    etgColor: Color
    // ptstColor: Color
    // etugColor: Color
    // eugColor: Color
    // inacColor: Color
    pldColor: Color
    pldMainLineColor: Color
    pldSubLineColor: Color
    pldOpenValveColor: Color
    pldCloseValveColor: Color
    pldControlValveColor: Color
}

type DisplayType = 'name' | 'number'

const darkTheme = {
    type: 'dark',
    backgroundColor: { r: 20, g: 20, b: 20 },
    strokeColor: { r: 240, g: 240, b: 240 },
    mouseOverColor: { r: 20, g: 20, b: 255 },
    selectedColor: { r: 0, g: 0, b: 235 },
    equipmentLibColor: { r: 30, g: 132, b: 73 },
    notificationColor: { r: 243, g: 156, b: 18 },
    orderColor: { r: 199, g: 0, b: 57 },
    equipmentColor: { r: 0x06, g: 0xbc, b: 0x09 },
    crteColor: { r: 0xfe, g: 0xff, b: 0x01 },
    prepColor: { r: 0x05, g: 0xff, b: 0xfc },
    ptagColor: { r: 0xfc, g: 0x80, b: 0x04 },
    etgColor: { r: 0xfe, g: 0x02, b: 0x02 },
    ptstColor: { r: 0xbf, g: 0x34, b: 0x37 },
    etugColor: { r: 0x7e, g: 0x34, b: 0xe7 },
    eugColor: { r: 0x02, g: 0x24, b: 0xfd },
    inacColor: { r: 0xb3, g: 0xb2, b: 0xbd },
    pldColor: { r: 255, g: 152, b: 0 },
    pldMainLineColor: { r: 252, g: 3, b: 244 },
    pldSubLineColor: { r: 3, g: 215, b: 252 },
    pldOpenValveColor: { r: 255, g: 2, b: 3 },
    pldCloseValveColor: { r: 3, g: 11, b: 252 },
    pldControlValveColor: { r: 3, g: 251, b: 107 }
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
    equipmentColor: { r: 0x06, g: 0xbc, b: 0x09 },
    crteColor: { r: 0xfe, g: 0xff, b: 0x01 },
    prepColor: { r: 0x05, g: 0xff, b: 0xfc },
    ptagColor: { r: 0xfc, g: 0x80, b: 0x04 },
    etgColor: { r: 0xfe, g: 0x02, b: 0x02 },
    ptstColor: { r: 0xbf, g: 0x34, b: 0x37 },
    etugColor: { r: 0x7e, g: 0x34, b: 0xe7 },
    eugColor: { r: 0x02, g: 0x24, b: 0xfd },
    inacColor: { r: 0xb3, g: 0xb2, b: 0xbd },
    pldColor: { r: 255, g: 152, b: 0 },
    pldMainLineColor: { r: 252, g: 3, b: 244 },
    pldSubLineColor: { r: 3, g: 215, b: 252 },
    pldOpenValveColor: { r: 255, g: 2, b: 3 },
    pldCloseValveColor: { r: 3, g: 11, b: 252 },
    pldControlValveColor: { r: 3, g: 251, b: 107 }
}

export const defaultTheme = lightTheme

export class ThemeContextImpl {
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

export const ThemeContext = React.createContext(defaultValue)

export function useThemeContext() {
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

    return context
}
