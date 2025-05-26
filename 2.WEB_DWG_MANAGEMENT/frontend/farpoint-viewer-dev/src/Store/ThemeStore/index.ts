import './ThemeStore.css'
import { atom, selector } from 'recoil'

const color = {
    darkBlack: { r: 20, g: 20, b: 20 },
    darkWhite: { r: 240, g: 240, b: 240 },
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
    orange: { r: 243, g: 156, b: 18 },
    red: { r: 255, g: 2, b: 3 },
    cherry: { r: 199, g: 0, b: 57 },
    blue: { r: 20, g: 20, b: 255 },
    skyBlue: { r: 3, g: 215, b: 252 },
    pink: { r: 252, g: 3, b: 244 },
    green: { r: 3, g: 251, b: 107 },
}
const commonTheme = {
    mouseOverColor: color.orange,
    selectedColor: color.pink,
    equipmentLibColor: color.blue,
    notificationColor: color.red,
    orderColor: color.red,
    pldColor: color.orange,
    pldMainLineColor: color.pink,
    pldSubLineColor: color.skyBlue,
    pldOpenValveColor: color.red,
    pldCloseValveColor: color.blue,
    pldControlValveColor: color.green,
}
const darkTheme = {
    type: 'dark',
    backgroundColor: color.darkBlack,
    strokeColor: color.darkWhite,
    ...commonTheme,
}

const lightTheme = {
    type: 'light',
    backgroundColor: color.white,
    strokeColor: color.black,
    ...commonTheme,
}

const ThemeStore = {
    documentDisplayType: atom<DisplayType>({
        key: 'documentDisplayType',
        default: process.env.REACT_APP_DB === '한수원' ? 'number' : 'name',
    }),
    favoriteDocumentDisplayType: atom<DisplayType>({
        key: 'favoriteDocumentDisplayType',
        default: 'number',
    }),
    theme: atom<Theme>({
        key: 'theme',
        default: lightTheme,
    }),
    toggleTheme: selector({
        key: 'toggleTheme',
        get: ({ get }) => {
            const theme = get(ThemeStore.theme)
            if (theme.type === 'light') {
                return darkTheme
            } else {
                return lightTheme
            }
        },
    }),
    colorElements: atom<Map<string, any>>({
        key: 'colorElements',
        default: new Map<string, any>(),
    }),
    lineWeightElements: atom<Map<string, number>>({
        key: 'lineWeightElements',
        default: new Map<string, number>(),
    }),

    hColorStyles: selector({
        key: 'hColorStyles',
        get: ({ get }) => {
            const theme = get(ThemeStore.theme)

            const colorStyles: ColorStyles = {
                select: { color: theme.selectedColor, index: 0 },
                hover: { color: theme.mouseOverColor, index: 1 },
                notification: { color: theme.notificationColor, index: 2 },
                order: { color: theme.orderColor, index: 3 },
                sideEquip: { color: theme.equipmentLibColor, index: 4 },
                pldColor: { color: theme.pldColor, index: 5 },
                pldMainLineColor: { color: theme.pldMainLineColor, index: 6 },
                pldSubLineColor: { color: theme.pldSubLineColor, index: 7 },
                pldOpenValveColor: { color: theme.pldOpenValveColor, index: 8 },
                pldCloseValveColor: { color: theme.pldCloseValveColor, index: 9 },
                pldControlValveColor: { color: theme.pldControlValveColor, index: 10 },
            }

            return colorStyles
        },
    }),
}

export default ThemeStore
