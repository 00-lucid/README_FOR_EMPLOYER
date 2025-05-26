import React from 'react'
import './Titlebar.css'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// 전역 Store
import { StatusStore, MarkUpStore, PMDCStore } from '../../../../Store/statusStore'
import ThemeStore from '../../../../Store/ThemeStore'
//Lib
import { useNavigate } from 'react-router-dom'
import crypt from '../../../../Lib/crypt'
import commonFunc from '../../../../Lib/commonFunc'

const Titlebar = ({ selectedCanvas }: TitleBarProps) => {
    // 전역 Store
    const [canvases, setCanvases] = useRecoilState(StatusStore.canvases)
    const setSelectedCanvas = useSetRecoilState(StatusStore.selectedCanvas)
    const setSelectedDocFile = useSetRecoilState(StatusStore.selectedDocFile)
    const setSelectedDocKey = useSetRecoilState(StatusStore.selectedDocKey)
    const documentDisplayType = useRecoilValue(ThemeStore.documentDisplayType)

    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)

    const [controlMode, setControlMode] = useRecoilState(StatusStore.controlMode)
    const [isPMDC, setIsPMDC] = useRecoilState(PMDCStore.isPMDC)
    const setIsPMDCTagOn = useSetRecoilState(PMDCStore.isPMDCTagOn)
    const setSelPMDCEquipment = useSetRecoilState(PMDCStore.selPMDCEquipment)

    // MarkUp State
    const isMarkupChanged = useRecoilValue(MarkUpStore.isMarkupChanged)
    const setIsShowMarkupPopup = useSetRecoilState(MarkUpStore.isShowMarkupPopup)

    const selectDocId = selectedCanvas.documentCtx.docId
    const selectDocName = selectedCanvas.documentCtx.docName
    const selectDocNumber = selectedCanvas.documentCtx.docNumber

    // 라우터 경로 이동을 위한 네비게이터
    const navigate = useNavigate()

    // Titlebar 도면 목록 드로우 확장 상태
    const [titleExtended, setTitleExtended] = React.useState<boolean>(false)

    const titlebarHeight = React.useMemo((): number => {
        return titleExtended ? canvases.length * 36 : 36
    }, [canvases.length, titleExtended])

    const getTitles = React.useMemo((): JSX.Element[] => {
        const elements: JSX.Element[] = []

        if (!titleExtended) {
            const value = documentDisplayType === 'name' ? selectDocName : selectDocNumber
            elements.push(
                <div key={selectDocId} className="TitlebarItem">
                    <div className="Text CurrentText">{value}</div>
                    <div className="Underline" />
                </div>
            )
        }

        // titleExtended가 false라서 현재 도면만 보여준다 하더라도,
        // 애니메이션 때문에 나머지 아이템도 보여줘야 한다.
        for (const canvas of canvases) {
            if (!titleExtended && selectDocId === canvas.documentCtx.docId) {
                continue
            }

            const value = documentDisplayType === 'name' ? canvas.documentCtx.docName : canvas.documentCtx.docNumber
            const { docId, docVer, plantCode } = canvas.documentCtx
            elements.push(
                // 선택했던 도면 리스트 아이템
                <div
                    key={docId}
                    className="TitlebarItem"
                    onClick={() => {
                        // 도면 변경 클릭
                        if (controlMode === 'pmdc') {
                            console.log("controlMode:", controlMode)
                            setControlMode('select')
                            setIsPMDC(false)
                            setIsPMDCTagOn(false)
                            setSelPMDCEquipment([])
                        }
                        // Event : MainView/Canvas/index.tsx -> 2. URL Params를 통해 도면 & 설비 설정
                        commonFunc.changeDocument(
                            crypt.encrypt(docId),
                            crypt.encrypt(docVer),
                            crypt.encrypt(plantCode),
                            undefined,
                            isMarkupChanged,
                            setIsShowMarkupPopup,
                            navigate,
                            setYesNoPopupValue
                        )
                    }}
                >
                    <div className={'Text ' + (selectDocId === docId ? 'HighlightItemText' : 'ItemText')}>{value}</div>
                    {/* CloseButton 도면 닫기(X) 버튼 */}
                    <svg
                        className="Close"
                        width="18"
                        height="18"
                        onClick={(e) => {
                            e.stopPropagation()
                            // 도면을 닫으면
                            // 다음으로 선택할 도면을 먼저 선택하고, 없으면 도면 없게 처리
                            // canvases 목록에 기존 도면을 제거

                            const newCanvases = canvases.filter((canvasValue) => {
                                return canvasValue.documentCtx.docId !== canvas.documentCtx.docId
                            })
                            if (newCanvases.length > 0) {
                                // X한 도면이 현재 도면이라면 도면 list 첫번째를 선택
                                // 아니라면 현재 도면 상태를 변경할 필요 없음.
                                if (selectDocId === canvas.documentCtx.docId) {
                                    const newSelectedCanvas = newCanvases[0]
                                    const { docId, docVer, plantCode } = newSelectedCanvas.documentCtx

                                    if (controlMode === 'pmdc') {
                                        console.log("controlMode:", controlMode)
                                        setControlMode('select')
                                        setIsPMDC(false)
                                        setIsPMDCTagOn(false)
                                        setSelPMDCEquipment([])
                                    }

                                    // Event : MainView/Canvas/index.tsx -> 2. URL Params를 통해 도면 & 설비 설정
                                    commonFunc.changeDocument(
                                        crypt.encrypt(docId),
                                        crypt.encrypt(docVer),
                                        crypt.encrypt(plantCode),
                                        undefined,
                                        isMarkupChanged,
                                        setIsShowMarkupPopup,
                                        navigate,
                                        setYesNoPopupValue
                                    )
                                }
                            } else {
                                setSelectedDocKey('')
                                setSelectedDocFile(undefined)
                                setSelectedCanvas(undefined)

                                if (controlMode === 'pmdc') {
                                    console.log("controlMode:", controlMode)
                                    setControlMode('select')
                                    setIsPMDC(false)
                                    setIsPMDCTagOn(false)
                                    setSelPMDCEquipment([])
                                }
                                // Event : MainView/Canvas/index.tsx -> 2. URL Params를 통해 도면 & 설비 설정
                                commonFunc.changeDocument(
                                    undefined,
                                    undefined,
                                    undefined,
                                    undefined,
                                    isMarkupChanged,
                                    setIsShowMarkupPopup,
                                    navigate,
                                    setYesNoPopupValue
                                )
                            }

                            setCanvases(newCanvases) // 기억하는 도면 리스트 설정
                        }}
                    >
                        <g fill="none" fillRule="evenodd">
                            <path d="M18 9a9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9 9 9 0 0 1 9 9" fill="var(--Titlebar-Icon-Fill)" />
                            <path
                                stroke="var(--Titlebar-Icon-Stroke)"
                                strokeLinecap="round"
                                d="m12.855 5.145-7.711 7.711M12.855 12.855 5.144 5.144"
                            />
                        </g>
                    </svg>
                    <div className="Underline" />
                </div>
            )
        }

        return elements
    }, [
        canvases,
        selectDocId,
        selectDocName,
        selectDocNumber,
        documentDisplayType,
        setCanvases,
        setSelectedCanvas,
        setSelectedDocFile,
        setSelectedDocKey,
        titleExtended,
        navigate,
        isMarkupChanged,
        setIsShowMarkupPopup,
        setYesNoPopupValue,
    ])

    return (
        <div
            id="MainViewTitlebar"
            className="Titlebar"
            style={{ height: titlebarHeight }}
            hidden={canvases.length === 0}
            onClick={(e) => {
                e.stopPropagation()
                setTitleExtended(!titleExtended)
            }}
            tabIndex={0}
            onBlur={() => setTitleExtended(false)}
        >
            {getTitles}
            {getCountIcon(canvases.length)}
        </div>
    )
}

function getCountIcon(count: number): JSX.Element {
    switch (count) {
        case 1:
            return (
                <svg className="CountIcon" width="18" height="18" viewBox="0 0 18 18">
                    <defs>
                        <path
                            d="M1.5 5.264a.5.5 0 0 1 .5.5v8.472A2.766 2.766 0 0 0 4.762 17H7.74a.5.5 0 0 1 0 1H4.762A3.767 3.767 0 0 1 1 14.236V5.764c0-.277.223-.5.5-.5zM11.037 17a.5.5 0 0 1 0 1H9.481a.5.5 0 0 1 0-1h1.556zm.302-17a.5.5 0 0 1 0 1H5.965c-.773 0-1.402.629-1.402 1.402v10.462c0 .773.63 1.402 1.402 1.402h8.858c.772 0 1.401-.63 1.401-1.402V2.402c0-.773-.629-1.402-1.4-1.402h-.876a.5.5 0 1 1 0-1h.875a2.404 2.404 0 0 1 2.401 2.402v10.462a2.404 2.404 0 0 1-2.4 2.402H5.964a2.405 2.405 0 0 1-2.402-2.402V2.402A2.405 2.405 0 0 1 5.965 0h5.374zm-.265 3.736v7.408H10.07V4.887L8.71 6.143l-.586-.701 2.061-1.706h.89z"
                            id="a"
                        />
                    </defs>
                    <g fill="none" fillRule="evenodd">
                        <mask id="b" fill="#fff">
                            <use xlinkHref="#a" />
                        </mask>
                        <g mask="url(#b)" fill="var(--Stroke-Normal)">
                            <path d="M0 0h18v18H0z" />
                        </g>
                    </g>
                </svg>
            )
        case 2:
            return (
                <svg className="CountIcon" width="18" height="18" viewBox="0 0 18 18">
                    <defs>
                        <path
                            d="M1.5 5.264a.5.5 0 0 1 .5.5v8.472A2.766 2.766 0 0 0 4.762 17H7.74a.5.5 0 0 1 0 1H4.762A3.767 3.767 0 0 1 1 14.236V5.764c0-.277.223-.5.5-.5zM11.038 17a.5.5 0 0 1 0 1H9.481a.5.5 0 0 1 0-1h1.557zm.302-17a.5.5 0 0 1 0 1H5.965c-.773 0-1.402.629-1.402 1.402v10.462c0 .773.63 1.402 1.402 1.402h8.858c.773 0 1.402-.63 1.402-1.402V2.402c0-.773-.629-1.402-1.402-1.402h-.875a.5.5 0 1 1 0-1h.875a2.405 2.405 0 0 1 2.402 2.402v10.462a2.405 2.405 0 0 1-2.402 2.402H5.965a2.405 2.405 0 0 1-2.402-2.402V2.402A2.405 2.405 0 0 1 5.965 0h5.375zm-1.092 3.547c.322 0 .624.044.906.131.282.087.53.216.743.387.212.171.38.384.502.638.122.255.182.553.182.894 0 .245-.036.473-.11.686a2.873 2.873 0 0 1-.287.602 3.775 3.775 0 0 1-.408.534c-.153.167-.314.331-.482.491l-2.437 2.354h3.724v.88H7.727v-1.068l2.972-2.95c.104-.098.205-.204.302-.32.098-.115.186-.235.262-.36.077-.126.138-.259.184-.398.045-.14.067-.286.067-.44 0-.18-.033-.345-.1-.492a1.089 1.089 0 0 0-.271-.37 1.226 1.226 0 0 0-.408-.236 1.461 1.461 0 0 0-.497-.084c-.363 0-.662.101-.9.303-.237.202-.387.482-.45.837L7.8 5.472c.049-.328.145-.612.288-.852s.32-.44.534-.603c.212-.16.457-.278.732-.355.275-.076.573-.115.894-.115z"
                            id="a"
                        />
                        <path id="c" d="M.563 0h13.662v15.266H.563z" />
                    </defs>
                    <g fill="none" fillRule="evenodd">
                        <mask id="b" fill="#fff">
                            <use xlinkHref="#a" />
                        </mask>
                        <g mask="url(#b)" fill="var(--Stroke-Normal)">
                            <path d="M0 0h18v18H0z" />
                        </g>
                    </g>
                </svg>
            )

        case 3:
            return (
                <svg className="CountIcon" width="18" height="18" viewBox="0 0 18 18">
                    <defs>
                        <path
                            d="M1.5 5.264a.5.5 0 0 1 .5.5v8.472A2.766 2.766 0 0 0 4.762 17H7.74a.5.5 0 0 1 0 1H4.762A3.767 3.767 0 0 1 1 14.236V5.764c0-.277.223-.5.5-.5zM11.34 0a.5.5 0 0 1 0 1H5.965c-.773 0-1.402.629-1.402 1.402v10.462c0 .773.63 1.402 1.402 1.402h8.858c.773 0 1.402-.63 1.402-1.402V2.402c0-.773-.629-1.402-1.402-1.402h-.875a.5.5 0 1 1 0-1h.875a2.405 2.405 0 0 1 2.402 2.402v10.462a2.405 2.405 0 0 1-2.402 2.402H5.965a2.405 2.405 0 0 1-2.402-2.402V2.402A2.405 2.405 0 0 1 5.965 0h5.375zm-1.218 3.547c.3 0 .588.041.863.121.276.08.519.203.728.371.209.167.375.378.497.633s.183.553.183.894a1.746 1.746 0 0 1-1.266 1.675v.021c.23.042.436.118.617.23.182.112.335.251.46.418.126.168.22.355.283.56.063.206.094.424.094.654 0 .355-.067.668-.204.937a1.96 1.96 0 0 1-.544.669 2.369 2.369 0 0 1-.784.403 3.18 3.18 0 0 1-.937.137c-.565 0-1.062-.13-1.491-.388-.43-.258-.727-.666-.894-1.224l1.067-.325c.118.356.275.621.474.796.198.174.492.262.88.262a1.503 1.503 0 0 0 1-.372 1.249 1.249 0 0 0 .429-.968c0-.307-.064-.553-.193-.738a1.242 1.242 0 0 0-.497-.418 2.145 2.145 0 0 0-.67-.183 6.347 6.347 0 0 0-.722-.042v-.879c.383 0 .697-.026.942-.079.244-.052.435-.127.575-.225a.78.78 0 0 0 .293-.366c.055-.146.084-.31.084-.491 0-.399-.12-.698-.356-.901-.237-.202-.534-.303-.89-.303-.272 0-.517.079-.737.235a1.471 1.471 0 0 0-.497.623l-1.025-.346c.194-.473.493-.824.894-1.05a2.68 2.68 0 0 1 1.344-.341z"
                            id="a"
                        />
                    </defs>
                    <g fill="none" fillRule="evenodd">
                        <mask id="b" fill="#fff">
                            <use xlinkHref="#a" />
                        </mask>
                        <g mask="url(#b)" fill="var(--Stroke-Normal)">
                            <path d="M0 0h18v18H0z" />
                        </g>
                    </g>
                </svg>
            )

        case 4:
            return (
                <svg className="CountIcon" width="18" height="18" viewBox="0 0 18 18">
                    <defs>
                        <path
                            d="M1.5 5.264a.5.5 0 0 1 .5.5v8.472A2.766 2.766 0 0 0 4.762 17H7.74a.5.5 0 0 1 0 1H4.762A3.767 3.767 0 0 1 1 14.236V5.764c0-.277.223-.5.5-.5zM11.34 0a.5.5 0 0 1 0 1H5.965c-.773 0-1.402.629-1.402 1.402v10.462c0 .773.63 1.402 1.402 1.402h8.858c.773 0 1.402-.63 1.402-1.402V2.402c0-.773-.629-1.402-1.402-1.402h-.875a.5.5 0 1 1 0-1h.875a2.405 2.405 0 0 1 2.402 2.402v10.462a2.405 2.405 0 0 1-2.402 2.402H5.965a2.405 2.405 0 0 1-2.402-2.402V2.402A2.405 2.405 0 0 1 5.965 0h5.375zm.426 3.736v4.897h1.046v.879h-1.046v1.632H10.76V9.512H7.6V8.487l2.95-4.751h1.215zM10.76 4.929h-.021L8.48 8.633h2.28V4.929z"
                            id="a"
                        />
                    </defs>
                    <g fill="none" fillRule="evenodd">
                        <mask id="b" fill="#fff">
                            <use xlinkHref="#a" />
                        </mask>
                        <g mask="url(#b)" fill="var(--Stroke-Normal)">
                            <path d="M0 0h18v18H0z" />
                        </g>
                    </g>
                </svg>
            )

        case 5:
            return (
                <svg className="CountIcon" width="18" height="18" viewBox="0 0 18 18">
                    <defs>
                        <path
                            d="M1.5 5.264a.5.5 0 0 1 .5.5v8.472A2.766 2.766 0 0 0 4.762 17H7.74a.5.5 0 0 1 0 1H4.762A3.767 3.767 0 0 1 1 14.236V5.764c0-.277.223-.5.5-.5zM11.34 0a.5.5 0 0 1 0 1H5.965c-.773 0-1.402.629-1.402 1.402v10.462c0 .773.63 1.402 1.402 1.402h8.858c.773 0 1.402-.63 1.402-1.402V2.402c0-.773-.629-1.402-1.402-1.402h-.875a.5.5 0 1 1 0-1h.875a2.405 2.405 0 0 1 2.402 2.402v10.462a2.405 2.405 0 0 1-2.402 2.402H5.965a2.405 2.405 0 0 1-2.402-2.402V2.402A2.405 2.405 0 0 1 5.965 0h5.375zm.833 3.736v.94H9.17L9.139 6.53c.049-.021.119-.042.21-.063a3.394 3.394 0 0 1 .553-.084c.09-.007.168-.011.23-.011.35 0 .666.06.948.178.282.119.525.286.727.503.203.216.357.474.466.774.108.3.162.63.162.994 0 .37-.068.705-.204 1.004a2.35 2.35 0 0 1-.56.775 2.487 2.487 0 0 1-.826.497 2.933 2.933 0 0 1-1.016.173c-.502 0-.955-.13-1.36-.388a2.136 2.136 0 0 1-.868-1.11l1.005-.344c.132.342.31.588.535.737.224.15.504.226.84.226.196 0 .383-.035.562-.106a1.326 1.326 0 0 0 .772-.773c.077-.19.116-.401.116-.64 0-.543-.166-.95-.497-1.217-.332-.27-.763-.404-1.292-.404-.19 0-.428.033-.717.1-.29.066-.561.162-.812.288l.084-3.903h3.976z"
                            id="a"
                        />
                    </defs>
                    <g fill="none" fillRule="evenodd">
                        <mask id="b" fill="#fff">
                            <use xlinkHref="#a" />
                        </mask>
                        <g mask="url(#b)" fill="var(--Stroke-Normal)">
                            <path d="M0 0h18v18H0z" />
                        </g>
                    </g>
                </svg>
            )
        default:
            break
    }

    return <div />
}

export default Titlebar
