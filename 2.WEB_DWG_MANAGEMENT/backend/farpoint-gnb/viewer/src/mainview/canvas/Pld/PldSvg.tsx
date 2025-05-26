import { Simbol } from '../../../types'
import { PldSimbol } from './PldSimbol'

interface Props {
    svgList: Simbol[]
    viewer: any
    lib: any
    handleStep: boolean
    setSvgList: any
    controlMode: string
}

export function PldSvg({ svgList, viewer, lib, handleStep, setSvgList, controlMode }: Props) {
    return (
        <svg id="pldSvg" viewBox="0 0 100% 100%">
            {/* 임시로 key를 createPoint로 지정 */}
            {null !== svgList &&
                svgList.map((svg: Simbol, idx: number) => (
                    <PldSimbol
                        key={`${svg.createPoint.x + svg.createPoint.y}`}
                        svg={svg}
                        viewer={viewer}
                        lib={lib}
                        handleStep={handleStep}
                        setSvgList={setSvgList}
                        idx={idx}
                        controlMode={controlMode}
                    />
                ))}
        </svg>
    )
}
