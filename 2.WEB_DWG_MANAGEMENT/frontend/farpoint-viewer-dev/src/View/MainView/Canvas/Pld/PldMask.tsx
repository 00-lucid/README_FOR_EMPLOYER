interface Props {
    curSvg: { path: JSX.Element; viewBox: string; type: string } | null
    maskPoint: Point2d
    maskScale: number
}

export function PldMask({ curSvg, maskPoint, maskScale }: Props) {
    return (
        <svg
            style={{ position: 'absolute', pointerEvents: 'none', width: '100%', height: '100%' }}
            visibility={maskPoint.x === 0 ? 'hidden' : 'visible'}
            transform={`translate(${maskPoint.x - 80}, ${maskPoint.y})`}
        >
            <g transform={`scale(${1 * maskScale})`}>
                <svg width="30" height="30" viewBox={curSvg?.viewBox}>
                    {curSvg?.path}
                </svg>
            </g>
        </svg>
    )
}
