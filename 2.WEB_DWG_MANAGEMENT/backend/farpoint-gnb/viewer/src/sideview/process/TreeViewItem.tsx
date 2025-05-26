import './TreeViewItem.css'
import { pushCommand, TreeViewItemLabel, TreeViewItemSource } from '../../common'
import { ProcessList } from '../../types'

export const makeFolderLabel = (text: string, depth: number, type: string): TreeViewItemLabel => {
    const labelHeight = 40

    const normalOpen = (
        <div className="Label" style={{ height: labelHeight + 'px' }}>
            {arrowIcon(false, 'var(--Icon-Normal)', depth)}
            {folderOpenIcon('var(--Icon-Normal)', depth, type)}
            {getNormalText(text, depth)}
        </div>
    )

    const normalClose = (
        <div className="Label" style={{ height: labelHeight + 'px' }}>
            {arrowIcon(true, 'var(--Icon-Normal)', depth)}
            {folderCloseIcon('var(--Icon-Normal)', depth, type)}
            {getNormalText(text, depth)}
        </div>
    )

    const selectedOpen = (
        <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
            {arrowIcon(false, 'var(--Icon-Highlight)', depth)}
            {folderOpenIcon('var(--Icon-Highlight)', depth, type)}
            {getSelectedText(text, depth)}
        </div>
    )

    const selectedClose = (
        <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
            {arrowIcon(true, 'var(--Icon-Highlight)', depth)}
            {folderCloseIcon('var(--Icon-Highlight)', depth, type)}
            {getSelectedText(text, depth)}
        </div>
    )

    return {
        height: labelHeight,
        heightUnit: 'px',
        selected: {
            open: selectedOpen,
            close: selectedClose
        },
        normal: { open: normalOpen, close: normalClose }
    }
}

const closeIcon = (
    <svg className="CloseIcon" width="24" height="24">
        <g fill="none" fillRule="evenodd">
            <path
                d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10"
                fill="var(--CloseIcon-Fill)"
            />
            <path stroke="var(--CloseIcon-Stroke)" strokeLinecap="round" d="m16 8-8 8M16 16 8 8" />
        </g>
    </svg>
)

function processIcon(color: string, depth: number): React.SVGProps<SVGSVGElement> {
    return (
        <svg
            className="Image2"
            style={{ left: `calc(24px + var(--TreeView-Indent-Width) * ${depth})` }}
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            id="Capa_1"
            viewBox="0 0 306.637 306.637"
        >
            <g>
                <g>
                    <path d="M12.809,238.52L0,306.637l68.118-12.809l184.277-184.277l-55.309-55.309L12.809,238.52z M60.79,279.943l-41.992,7.896    l7.896-41.992L197.086,75.455l34.096,34.096L60.79,279.943z" />
                    <path d="M251.329,0l-41.507,41.507l55.308,55.308l41.507-41.507L251.329,0z M231.035,41.507l20.294-20.294l34.095,34.095    L265.13,75.602L231.035,41.507z" />
                </g>
            </g>
        </svg>
    )
}

function arrowIcon(
    isRightDirection: boolean,
    color: string,

    depth: number
): React.SVGProps<SVGSVGElement> {
    return (
        <svg
            className="Image1"
            fill={color}
            style={{
                transform: isRightDirection ? 'rotate(-90deg)' : 'rotate(0deg)',
                left: `calc(0px + var(--TreeView-Indent-Width) * ${depth})`
            }}
        >
            <path d="M12 15.001c-.495 0-.957-.192-1.301-.541l-3.555-3.609a.5.5 0 1 1 .712-.702l3.556 3.61c.307.31.869.31 1.176 0l3.556-3.61a.5.5 0 1 1 .712.702l-3.555 3.609a1.812 1.812 0 0 1-1.301.541" />
        </svg>
    )
}

function folderOpenIcon(color: string, depth: number, type: string): React.SVGProps<SVGSVGElement> {
    switch (type) {
        case 'openValve':
            return (
                <svg
                    className="Image2"
                    fill="red"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 70 70"
                    style={{ left: `calc(24px + var(--TreeView-Indent-Width) * ${depth})` }}
                >
                    <path stroke="none" d="m17,26v18l36-18v18z" />
                </svg>
            )
        case 'closeValve':
            return (
                <svg
                    className="Image2"
                    fill="blue"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 70 70"
                    style={{ left: `calc(24px + var(--TreeView-Indent-Width) * ${depth})` }}
                >
                    <path stroke="none" d="m17,26v18l36-18v18z" />
                </svg>
            )
        case 'controlValve':
            return (
                <svg
                    className="Image2"
                    fill="pink"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 70 70"
                    style={{ left: `calc(24px + var(--TreeView-Indent-Width) * ${depth})` }}
                >
                    <path stroke="none" d="m17,26v18l36-18v18z" />
                </svg>
            )
        case 'main':
            return (
                <svg
                    className="Image2"
                    fill="puple"
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.0"
                    viewBox="0 0 1024.000000 1024.000000"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ left: `calc(24px + var(--TreeView-Indent-Width) * ${depth})` }}
                >
                    <g transform="translate(200.000000,700.000000) scale(0.100000,-0.100000)" stroke="none">
                        <path d="M4850 5109 c-28 -8 -541 -516 -2418 -2392 -1311 -1310 -2393 -2398 -2405 -2417 -34 -53 -31 -153 5 -207 41 -62 90 -88 168 -88 50 0 73 5 100 22 19 12 1107 1094 2417 2405 2206 2207 2382 2386 2393 2428 34 129 -45 246 -171 255 -30 3 -70 0 -89 -6z" />
                    </g>
                </svg>
            )
        case 'sub':
            return (
                <svg
                    className="Image2"
                    fill="orange"
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.0"
                    viewBox="0 0 1024.000000 1024.000000"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ left: `calc(24px + var(--TreeView-Indent-Width) * ${depth})` }}
                >
                    <g transform="translate(200.000000,700.000000) scale(0.100000,-0.100000)" stroke="none">
                        <path d="M4850 5109 c-28 -8 -541 -516 -2418 -2392 -1311 -1310 -2393 -2398 -2405 -2417 -34 -53 -31 -153 5 -207 41 -62 90 -88 168 -88 50 0 73 5 100 22 19 12 1107 1094 2417 2405 2206 2207 2382 2386 2393 2428 34 129 -45 246 -171 255 -30 3 -70 0 -89 -6z" />
                    </g>
                </svg>
            )
        default:
            return (
                <svg
                    className="Image2"
                    fill={color}
                    style={{ left: `calc(24px + var(--TreeView-Indent-Width) * ${depth})` }}
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.0"
                    width="512.000000pt"
                    height="512.000000pt"
                    viewBox="0 0 512.000000 512.000000"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" stroke="none">
                        <path d="M2227 5104 c-59 -19 -118 -76 -135 -130 -8 -28 -12 -125 -12 -300 l0 -259 -45 -28 c-92 -59 -172 -175 -196 -288 -6 -29 -9 -91 -7 -139 3 -74 9 -97 41 -164 l37 -77 -40 -80 -40 -79 -852 0 -851 0 -43 -25 c-28 -16 -49 -39 -63 -68 l-21 -43 0 -1640 c0 -1588 1 -1640 19 -1681 12 -26 35 -52 62 -70 l43 -28 2240 -3 c1502 -2 2267 1 2320 8 211 27 387 192 426 399 6 35 10 657 10 1790 0 1495 -2 1745 -15 1799 -46 192 -205 351 -397 397 -153 36 -251 7 -299 -87 -18 -34 -19 -64 -19 -393 l0 -355 -825 0 -826 0 -36 75 -35 75 35 73 c96 194 58 410 -98 556 -36 33 -70 61 -75 61 -6 0 -10 105 -10 275 0 295 -4 320 -53 373 -55 59 -157 83 -240 56z m123 -154 c19 -19 20 -33 20 -255 l0 -235 -70 0 -70 0 0 235 c0 222 1 236 20 255 11 11 33 20 50 20 17 0 39 -9 50 -20z m53 -656 c64 -22 140 -92 174 -162 24 -48 28 -69 28 -137 0 -73 -4 -86 -36 -145 -105 -191 -348 -227 -503 -73 -151 149 -107 406 86 503 51 25 73 30 133 30 39 0 92 -7 118 -16z m2298 -54 c119 -37 213 -130 249 -246 20 -65 20 -88 20 -1600 l0 -1534 -47 37 c-87 66 -162 92 -293 102 l-85 6 -3 1615 c-1 888 0 1621 3 1628 7 18 84 15 156 -8z m-2617 -660 c32 -17 65 -30 72 -30 8 0 14 -4 14 -9 0 -9 -878 -1752 -889 -1763 -4 -4 -23 41 -42 100 l-36 108 409 812 c225 447 410 812 411 812 1 0 29 -14 61 -30z m862 -798 l391 -817 -34 -100 c-19 -55 -38 -103 -42 -107 -6 -7 -844 1733 -853 1770 -2 7 22 23 55 36 33 14 61 27 65 30 3 3 10 6 16 6 6 0 187 -368 402 -818z m-527 369 c66 -140 121 -259 121 -264 0 -9 -508 -2 -518 7 -2 2 56 122 128 266 72 145 135 259 139 254 5 -5 63 -123 130 -263z m-669 254 c0 -2 -59 -120 -131 -261 l-131 -256 -138 4 c-124 3 -140 1 -159 -16 -14 -13 -21 -31 -21 -56 0 -58 21 -70 139 -77 55 -3 101 -8 101 -11 0 -2 -81 -165 -180 -361 -99 -196 -180 -367 -180 -379 0 -46 109 -358 133 -380 47 -44 110 -50 165 -14 15 10 119 208 303 574 154 308 286 561 294 564 7 3 162 2 345 -3 l332 -8 263 -550 c144 -302 271 -561 280 -574 24 -31 81 -54 119 -47 64 12 82 40 146 220 33 93 60 180 60 193 0 13 -77 185 -171 381 -94 196 -173 362 -175 367 -3 6 35 10 102 10 99 0 107 1 125 24 25 30 24 76 -1 101 -16 16 -33 20 -82 20 -35 0 -100 3 -145 6 l-81 7 -33 71 c-18 39 -74 158 -125 264 l-93 192 789 0 790 0 0 -1210 c0 -1330 -4 -1254 61 -1302 47 -35 61 -39 166 -48 157 -14 255 -75 315 -198 29 -60 33 -76 33 -152 0 -73 -4 -93 -28 -142 -52 -106 -145 -177 -259 -198 -56 -11 -4485 -14 -4512 -4 -15 6 -16 158 -16 1623 0 890 3 1621 7 1624 7 8 1593 10 1593 2z" />
                        <path d="M548 1364 c-57 -30 -58 -39 -58 -447 0 -373 0 -374 23 -408 13 -19 38 -39 57 -46 50 -17 3350 -17 3400 0 19 7 44 27 57 46 23 34 23 35 23 408 0 315 -2 379 -15 403 -33 64 94 60 -1767 60 -1478 -1 -1696 -3 -1720 -16z m282 -211 c0 -91 20 -123 77 -123 57 0 73 27 73 120 l0 80 95 0 95 0 0 -124 c0 -110 2 -126 21 -150 26 -33 79 -36 109 -6 18 18 20 33 20 150 l0 130 95 0 95 0 0 -75 c0 -67 3 -79 25 -100 30 -31 77 -33 105 -5 17 17 20 33 20 100 l0 80 94 0 94 0 4 -131 c3 -123 4 -132 27 -150 28 -23 69 -24 99 -3 21 14 22 22 22 150 l0 134 94 0 93 0 5 -82 c4 -69 8 -84 28 -100 29 -23 71 -23 100 0 20 16 24 31 28 100 l5 82 93 0 94 0 0 -130 c0 -117 2 -132 20 -150 27 -27 81 -26 106 1 16 18 19 40 22 150 l4 129 94 0 94 0 0 -80 c0 -94 16 -120 74 -120 55 0 76 35 76 126 l0 74 95 0 95 0 0 -130 c0 -117 2 -132 20 -150 30 -30 83 -27 109 6 19 24 21 40 21 150 l0 124 95 0 95 0 0 -77 c0 -91 20 -123 77 -123 57 0 73 27 73 120 l0 80 95 0 95 0 0 -315 0 -315 -1630 0 -1630 0 0 315 0 315 95 0 95 0 0 -77z" />
                    </g>
                </svg>
            )
    }
}

function folderCloseIcon(color: string, depth: number, type: string): React.SVGProps<SVGSVGElement> {
    switch (type) {
        case 'openValve':
            return (
                <svg
                    className="Image2"
                    fill="red"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 70 70"
                    style={{ left: `calc(24px + var(--TreeView-Indent-Width) * ${depth})` }}
                >
                    <path stroke="none" d="m17,26v18l36-18v18z" />
                </svg>
            )
        case 'closeValve':
            return (
                <svg
                    className="Image2"
                    fill="blue"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 70 70"
                    style={{ left: `calc(24px + var(--TreeView-Indent-Width) * ${depth})` }}
                >
                    <path stroke="none" d="m17,26v18l36-18v18z" />
                </svg>
            )
        case 'controlValve':
            return (
                <svg
                    className="Image2"
                    fill="pink"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 70 70"
                    style={{ left: `calc(24px + var(--TreeView-Indent-Width) * ${depth})` }}
                >
                    <path stroke="none" d="m17,26v18l36-18v18z" />
                </svg>
            )
        case 'main':
            return (
                <svg
                    className="Image2"
                    fill="puple"
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.0"
                    viewBox="0 0 1024.000000 1024.000000"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ left: `calc(24px + var(--TreeView-Indent-Width) * ${depth})` }}
                >
                    <g transform="translate(200.000000,700.000000) scale(0.100000,-0.100000)" stroke="none">
                        <path d="M4850 5109 c-28 -8 -541 -516 -2418 -2392 -1311 -1310 -2393 -2398 -2405 -2417 -34 -53 -31 -153 5 -207 41 -62 90 -88 168 -88 50 0 73 5 100 22 19 12 1107 1094 2417 2405 2206 2207 2382 2386 2393 2428 34 129 -45 246 -171 255 -30 3 -70 0 -89 -6z" />
                    </g>
                </svg>
            )
        case 'sub':
            return (
                <svg
                    className="Image2"
                    fill="orange"
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.0"
                    viewBox="0 0 1024.000000 1024.000000"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ left: `calc(24px + var(--TreeView-Indent-Width) * ${depth})` }}
                >
                    <g transform="translate(200.000000,700.000000) scale(0.100000,-0.100000)" stroke="none">
                        <path d="M4850 5109 c-28 -8 -541 -516 -2418 -2392 -1311 -1310 -2393 -2398 -2405 -2417 -34 -53 -31 -153 5 -207 41 -62 90 -88 168 -88 50 0 73 5 100 22 19 12 1107 1094 2417 2405 2206 2207 2382 2386 2393 2428 34 129 -45 246 -171 255 -30 3 -70 0 -89 -6z" />
                    </g>
                </svg>
            )
        default:
            return (
                <svg
                    className="Image2"
                    fill={color}
                    style={{ left: `calc(24px + var(--TreeView-Indent-Width) * ${depth})` }}
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.0"
                    width="512.000000pt"
                    height="512.000000pt"
                    viewBox="0 0 512.000000 512.000000"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" stroke="none">
                        <path d="M2227 5104 c-59 -19 -118 -76 -135 -130 -8 -28 -12 -125 -12 -300 l0 -259 -45 -28 c-92 -59 -172 -175 -196 -288 -6 -29 -9 -91 -7 -139 3 -74 9 -97 41 -164 l37 -77 -40 -80 -40 -79 -852 0 -851 0 -43 -25 c-28 -16 -49 -39 -63 -68 l-21 -43 0 -1640 c0 -1588 1 -1640 19 -1681 12 -26 35 -52 62 -70 l43 -28 2240 -3 c1502 -2 2267 1 2320 8 211 27 387 192 426 399 6 35 10 657 10 1790 0 1495 -2 1745 -15 1799 -46 192 -205 351 -397 397 -153 36 -251 7 -299 -87 -18 -34 -19 -64 -19 -393 l0 -355 -825 0 -826 0 -36 75 -35 75 35 73 c96 194 58 410 -98 556 -36 33 -70 61 -75 61 -6 0 -10 105 -10 275 0 295 -4 320 -53 373 -55 59 -157 83 -240 56z m123 -154 c19 -19 20 -33 20 -255 l0 -235 -70 0 -70 0 0 235 c0 222 1 236 20 255 11 11 33 20 50 20 17 0 39 -9 50 -20z m53 -656 c64 -22 140 -92 174 -162 24 -48 28 -69 28 -137 0 -73 -4 -86 -36 -145 -105 -191 -348 -227 -503 -73 -151 149 -107 406 86 503 51 25 73 30 133 30 39 0 92 -7 118 -16z m2298 -54 c119 -37 213 -130 249 -246 20 -65 20 -88 20 -1600 l0 -1534 -47 37 c-87 66 -162 92 -293 102 l-85 6 -3 1615 c-1 888 0 1621 3 1628 7 18 84 15 156 -8z m-2617 -660 c32 -17 65 -30 72 -30 8 0 14 -4 14 -9 0 -9 -878 -1752 -889 -1763 -4 -4 -23 41 -42 100 l-36 108 409 812 c225 447 410 812 411 812 1 0 29 -14 61 -30z m862 -798 l391 -817 -34 -100 c-19 -55 -38 -103 -42 -107 -6 -7 -844 1733 -853 1770 -2 7 22 23 55 36 33 14 61 27 65 30 3 3 10 6 16 6 6 0 187 -368 402 -818z m-527 369 c66 -140 121 -259 121 -264 0 -9 -508 -2 -518 7 -2 2 56 122 128 266 72 145 135 259 139 254 5 -5 63 -123 130 -263z m-669 254 c0 -2 -59 -120 -131 -261 l-131 -256 -138 4 c-124 3 -140 1 -159 -16 -14 -13 -21 -31 -21 -56 0 -58 21 -70 139 -77 55 -3 101 -8 101 -11 0 -2 -81 -165 -180 -361 -99 -196 -180 -367 -180 -379 0 -46 109 -358 133 -380 47 -44 110 -50 165 -14 15 10 119 208 303 574 154 308 286 561 294 564 7 3 162 2 345 -3 l332 -8 263 -550 c144 -302 271 -561 280 -574 24 -31 81 -54 119 -47 64 12 82 40 146 220 33 93 60 180 60 193 0 13 -77 185 -171 381 -94 196 -173 362 -175 367 -3 6 35 10 102 10 99 0 107 1 125 24 25 30 24 76 -1 101 -16 16 -33 20 -82 20 -35 0 -100 3 -145 6 l-81 7 -33 71 c-18 39 -74 158 -125 264 l-93 192 789 0 790 0 0 -1210 c0 -1330 -4 -1254 61 -1302 47 -35 61 -39 166 -48 157 -14 255 -75 315 -198 29 -60 33 -76 33 -152 0 -73 -4 -93 -28 -142 -52 -106 -145 -177 -259 -198 -56 -11 -4485 -14 -4512 -4 -15 6 -16 158 -16 1623 0 890 3 1621 7 1624 7 8 1593 10 1593 2z" />
                        <path d="M548 1364 c-57 -30 -58 -39 -58 -447 0 -373 0 -374 23 -408 13 -19 38 -39 57 -46 50 -17 3350 -17 3400 0 19 7 44 27 57 46 23 34 23 35 23 408 0 315 -2 379 -15 403 -33 64 94 60 -1767 60 -1478 -1 -1696 -3 -1720 -16z m282 -211 c0 -91 20 -123 77 -123 57 0 73 27 73 120 l0 80 95 0 95 0 0 -124 c0 -110 2 -126 21 -150 26 -33 79 -36 109 -6 18 18 20 33 20 150 l0 130 95 0 95 0 0 -75 c0 -67 3 -79 25 -100 30 -31 77 -33 105 -5 17 17 20 33 20 100 l0 80 94 0 94 0 4 -131 c3 -123 4 -132 27 -150 28 -23 69 -24 99 -3 21 14 22 22 22 150 l0 134 94 0 93 0 5 -82 c4 -69 8 -84 28 -100 29 -23 71 -23 100 0 20 16 24 31 28 100 l5 82 93 0 94 0 0 -130 c0 -117 2 -132 20 -150 27 -27 81 -26 106 1 16 18 19 40 22 150 l4 129 94 0 94 0 0 -80 c0 -94 16 -120 74 -120 55 0 76 35 76 126 l0 74 95 0 95 0 0 -130 c0 -117 2 -132 20 -150 30 -30 83 -27 109 6 19 24 21 40 21 150 l0 124 95 0 95 0 0 -77 c0 -91 20 -123 77 -123 57 0 73 27 73 120 l0 80 95 0 95 0 0 -315 0 -315 -1630 0 -1630 0 0 315 0 315 95 0 95 0 0 -77z" />
                    </g>
                </svg>
            )
    }
}

function getNormalText(text: string, depth: number) {
    return (
        <div
            className="Text"
            style={{
                color: 'var(--Stroke-Normal)',
                left: `calc(55px + var(--TreeView-Indent-Width) * ${depth})`,
                width: `calc(75% - var(--TreeView-Indent-Width) * ${depth})`
            }}
        >{`${text}`}</div>
    )
}

function getSelectedText(text: string, depth: number) {
    return (
        <div
            className="Text"
            style={{
                color: 'var(--Stroke-Highlight)',
                left: `calc(55px + var(--TreeView-Indent-Width) * ${depth})`,
                width: `calc(100% - var(--TreeView-Indent-Width) * ${depth})`
            }}
        >{`${text}`}</div>
    )
}

const makeProcessLabel = (text: string, depth: number, onRemoveClick: () => void, editable: boolean) => {
    const labelHeight = 40

    const normal = (
        <div className="Label" style={{ height: labelHeight + 'px' }}>
            <div className="Image1" />
            {processIcon('var(--Icon-Normal)', depth)}
            {getNormalText(text, depth)}
            <div
                hidden={!editable}
                className="CloseButton"
                onClick={(e) => {
                    onRemoveClick()
                    e.stopPropagation()
                }}
            >
                {closeIcon}
            </div>
        </div>
    )

    const selected = (
        <div className="Label SelectedLabel" style={{ height: labelHeight + 'px' }}>
            <div className="Image1" />
            {processIcon('var(--Icon-Highlight)', depth)}
            {getSelectedText(text, depth)}
        </div>
    )

    return {
        height: labelHeight,
        heightUnit: 'px',
        selected: { open: selected, close: selected },
        normal: { open: normal, close: normal }
    }
}

export function makeProcessItems(
    items: TreeViewItemSource[],
    list: ProcessList,
    depth: number,
    reload: () => Promise<void>,
    editable: boolean,
    pldHandleListChange: (handle: string) => void
) {
    for (const process of list.processes) {
        const onRemoveClick = async () => {
            const confirmValue = {
                message: '프로세스를 삭제할까요?',
                yes: () => {
                    pldHandleListChange(process.handle)
                },
                no: () => {}
            }

            pushCommand({ name: 'requestYesNo', value: confirmValue })
        }

        const item = {
            label: makeProcessLabel(process.equipment, depth + 1, onRemoveClick, editable),
            key: process.id,
            items: [],
            onClick: () => {
                pushCommand({ name: 'zoomEntity', value: { equipments: [{ tagId: process.handle }] } })
            }
        }

        items.push(item)
    }
}
