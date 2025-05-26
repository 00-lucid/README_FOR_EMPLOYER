import { useEffect, useState, useCallback, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import AppStore from '../../Store/appStore'
import { StatusStore, MarkUpStore, WCDStore, PMDCStore} from '../../Store/statusStore'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import './WCDListView.css'
import crypt from '../../Lib/crypt'
import commonFunc from '../../Lib/commonFunc'

// Api
import Api from '../../Api'
import { global } from '../../Lib/util'
// import { DocumentContext, EquipmentContext } from '../types'
// import Repository from '../Repository'
// import { StatusContext, AppContext, pushCommand } from '..'
// import { CanvasContext } from './useCanvasContext'

type Props = {
    equipments: any
    document: DocumentContext | undefined
    canvasContext: CanvasContext | undefined
}

const indexInfo = [
    {
        title: '설비',
        content: 'Equipment',
        color: '#06BC09',
    },
    {
        title: '지정 C(CRTE)',
        content: 'Crte/Initial Tag Status',
        color: '#FEFF01',
    },
    {
        title: '준비 I(ITG)',
        content: 'PREP/Initial Tag Status',
        color: '#05FFFC',
    },
    {
        title: '인쇄 P(PTAG)',
        content: 'TAG Printed',
        color: '#FC8004',
    },
    {
        title: '부착 E(ETG)',
        content: 'Tagged',
        color: '#FE0202',
    },
    {
        title: '테스트 인쇄 T(PTST)',
        content: 'Test Tag Printed',
        color: '#BF01BF',
    },
    {
        title: '임시해제 G(ETUG)',
        content: 'Temporarily Untagged',
        color: '#7E34E7',
    },
    {
        title: '해제 U(EUG)',
        content: 'Untagged',
        color: '#0224FD',
    },
    {
        title: '비활성 N(INAC)',
        content: 'Object Deactive',
        color: '#FEFF01',
    },
]

export default function WCDListView() {
    // const selectedDocKey = useRecoilValue(StatusStore.selectedDocKey);
    const userId = useRecoilValue(AppStore.userId)
    const [wcdEquipments, setWCDEquipments] = useRecoilState(WCDStore.wcdEquipments)
    const [selWCDEquipment, setSelWCDEquipment] = useRecoilState(WCDStore.selWCDEquipment)
    const [wcdTagDoc, setWCDTagDoc] = useRecoilState(WCDStore.wcdTagDoc)
    const [wcdTagItem, setWCDTagItem] = useRecoilState(WCDStore.wcdTagItem)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const setBanner = useSetRecoilState(StatusStore.banner)

    global.log('selectedCanvas:', selectedCanvas)

    const [listFlag, setListFlag] = useState({ func: '', list: [] })
    const [list, setList] = useState({ func: '', list: [] })
    const [item, setItem] = useState({ func: '', type: '', list: [], refDoc: [] })
    const [doc, setDoc] = useState({ func: '', type: '', list: [], refDoc: [] })
    const [wcdHandle, setWcdHandle] = useState<any>([])
    const [enableIndex, setEnableIndex] = useState(false)
    const [popMenu, setPopMenu] = useState({ x: 0, y: 0, id: '', func: '', wcdNo: '', open: false })

    const getOrderList = async (func: string) => {
        global.log('func:', func)
        if (selectedCanvas) {
            if (userId) {
                if (func) {
                    setBanner('데이터 수집중...')
                    const list = await Api.wcd.getOrderList(func)
                    setList({
                        func: func,
                        list: list,
                    })
                    setBanner(undefined)
                } else {
                    global.log('nofunc')
                    setList({ func: '', list: [] })
                }
            }
        }
    }

    const getTaggingItemList = async (id: string, func: string, wcdNo: string, type: string) => {
        if (selectedCanvas) {
            if (userId) {
                if (func) {
                    setBanner('데이터 수집중...')
                    const selectedDocKey = selectedCanvas.documentCtx.docId + '_' + selectedCanvas.documentCtx.docVer
                    const list = await Api.wcd.getTaggingItemList(id, func, wcdNo, selectedDocKey)
                    global.log('tagginList:', list)
                    if (type == 'item') {
                        setItem({
                            func: func,
                            type: type,
                            list: list.tagList,
                            refDoc: list.refDoc,
                        })
                        setBanner(undefined)
                    } else if (type == 'doc') {
                        setDoc({
                            func: func,
                            type: type,
                            list: list.tagList,
                            refDoc: list.refDoc,
                        })
                        setWCDTagDoc(list.tagList)
                        setBanner('적용중...')
                    }
                } else {
                    if (type == 'item')
                        setItem({
                            func: '',
                            type: type,
                            list: [],
                            refDoc: [],
                        })
                    else if (type == 'doc') {
                        setDoc({
                            func: '',
                            type: type,
                            list: [],
                            refDoc: [],
                        })
                        setWCDTagDoc([])
                    }
                }
            }
        }
    }

    function buttonIcon(icon: string): JSX.Element {
        const index = (
            <svg
                width="36"
                height="36"
                viewBox="0 0 566.93 566.93"
                xmlns="http://www.w3.org/2000/svg"
                // fill="#4A70F7"
                fill="var(--Menu-Toolbar-Item-Stroke)"
                fillOpacity=".9"
                stroke="var(--Menu-Toolbar-Item-Stroke)"
            >
                <path d="M186.37,482c-7.69-3.52-10.05-9.74-9.64-17.82.39-7.61.09-7.62-7.65-7.62-3.25,0-6.49,0-9.73,0-8.12,0-13.56-5.25-13.95-13.36-.05-1,0-2,0-3q0-133,0-266a14.93,14.93,0,0,1,.44-5.18,5.63,5.63,0,0,1,10.7-.05,14.93,14.93,0,0,1,.46,5.18q0,132.84,0,265.67c0,5.56,0,5.56,5.44,5.56H394.81c5,0,5,0,5-4.86q0-147.61.07-295.23c0-3.11-.73-3.83-3.83-3.83q-117.68.15-235.36,0c-3.18,0-3.92.81-3.78,3.87.19,4.36-2.09,6.86-5.59,6.94-3.65.09-5.92-2.51-5.94-7-.05-10.85-.11-21.7,0-32.55.1-8.38,5.63-13.79,13.87-13.79q94.85,0,189.7,0c4.81,0,7.86,2.7,7.1,6.42-.55,2.65-2.14,4.48-5,4.76-1.11.11-2.24,0-3.36,0H162.12c-5.1,0-5.11,0-5.11,5.14a107.61,107.61,0,0,1-.09,11.22c-.37,3.56,1.09,3.93,4.14,3.91,20.7-.13,41.41-.06,62.11-.06q86.43,0,172.87.07c3,0,4.1-.61,3.86-3.8a124.25,124.25,0,0,1,0-13.09c.08-2.66-1-3.47-3.54-3.43-7.11.12-14.22.06-21.33,0-4,0-6.57-2.17-6.66-5.48s2.58-5.72,6.79-5.73q11.22,0,22.45,0c8.06,0,13.53,5.3,13.85,13.45.13,3.24.12,6.49,0,9.73-.07,1.81.51,2.34,2.31,2.3,5.11-.11,10.22-.06,15.34,0,7.78,0,13.11,5,13.79,12.75.08,1,0,2,0,3V430.76a13.76,13.76,0,0,1-.44,4.81,5.67,5.67,0,0,1-10.71.11,14.2,14.2,0,0,1-.46-5.18q0-129.64.08-259.3c0-3.71-1-4.64-4.47-4.34a86.94,86.94,0,0,1-12,0c-2.66-.15-3.64.41-3.54,3.37.25,7.72.08,15.46.08,23.19V441.15c0,7.92-3.11,12.7-9.39,14.87a16.32,16.32,0,0,1-5.54.52q-102,0-203.92-.06c-3.33,0-4.66.71-4.21,4.18a43.27,43.27,0,0,1,0,7.11c-.09,2.29,1,3.19,3.15,3,.62,0,1.25,0,1.87,0H426.17c5.08,0,5.08,0,5.09-5.17,0-2.49-.12-5,.05-7.48.24-3.4,2.66-5.84,5.61-5.93a6,6,0,0,1,5.91,6c.17,3.73.17,7.49,0,11.22-.33,6.26-4.3,9.9-9.48,12.57Z" />
                <path d="M324.46,205c-14.82,0-29.65,0-44.47,0-5.49,0-8.54-3.63-6.81-7.9,1.09-2.68,3.29-3.61,5.95-3.66,3.36-.06,6.73,0,10.09,0h77c.75,0,1.5,0,2.24,0,5,0,8,2.28,7.89,5.92s-3,5.67-7.78,5.67Z" />
                <path d="M324.37,181.15c-15.2,0-30.4,0-45.6,0-3.43,0-5.45-1.74-6-4.94a5.22,5.22,0,0,1,3.51-5.91,8.91,8.91,0,0,1,3.28-.38H369.3c4.33,0,6.93,2,7,5.46s-2.62,5.76-7.12,5.76Z" />
                <path d="M324.28,406.4H279.81c-4.48,0-7.24-2.27-7.15-5.79s2.65-5.5,7-5.5q44.83,0,89.69,0c4.31,0,6.93,2.18,7,5.57s-2.7,5.72-7.21,5.72Z" />
                <path d="M324.4,294.21q22.61,0,45.22,0c2.72,0,4.82.87,6.1,3.4a5.21,5.21,0,0,1-.53,5.62c-1.32,2-3.36,2.41-5.56,2.42H281.44c-5.92,0-8.78-1.87-8.78-5.7s2.91-5.73,8.77-5.73Z" />
                <path d="M324.39,270.59h43a33.13,33.13,0,0,1,3.73.12,5.36,5.36,0,0,1,5.16,5.4c.16,3.12-1.8,5.06-4.76,5.83a11.79,11.79,0,0,1-3,.15h-88.2c-.5,0-1,0-1.49,0-3.57-.25-6.15-2.66-6.17-5.76s2.45-5.62,6.14-5.69c7.09-.14,14.2-.06,21.3-.06Z" />
                <path d="M324.73,371.32q22.42,0,44.85,0c4,0,6.59,2.23,6.76,5.5s-2.41,5.67-6.29,6c-1.12.08-2.24,0-3.36,0H302.78c-8,0-15.95,0-23.92,0-3.25,0-5.54-1.63-6.05-4.94-.43-2.75.92-4.74,3.43-6a8.53,8.53,0,0,1,4-.54Z" />
                <rect x="185.9" y="161.07" width="54.05" height="54.05" rx="12" />
                <rect x="185.54" y="260.31" width="54.05" height="54.05" rx="12" />
                <rect x="186.54" y="359.31" width="54.05" height="54.05" rx="12" />

                {/* <g fillRule="evenodd" fill="none" transform="matrix(0.77777785 0 0 0.77777785 0 0)">
                    <path
                        d="M13.748 12.896L4.075 14.302L11.075 21.125L9.423 30.758999L18.073 26.210999L26.727001 30.758999L25.074001 21.125L32.074 14.302L22.401001 12.896L18.074001 4.13L13.748 12.896z"
                        fill="#4A70F7"
                        fillOpacity=".9"
                    />
                    <path
                        d="M4.074 14.301L13.747999 12.8949995L18.074999 4.1289997L22.401 12.8949995L32.074997 14.301L25.074997 21.124L26.726997 30.759L18.074997 26.210001L9.4229965 30.760002L11.074997 21.124002L4.074 14.301z"
                        stroke="#4A70F7"
                    />
                </g> */}
            </svg>
        )

        const list = (
            <svg
                width="36"
                height="36"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
                stroke="var(--Menu-Toolbar-Item-Stroke)"
                opacity=".9"
                fill="var(--Menu-Toolbar-Item-Stroke)"
            >
                <path
                    d="M84,99c2.2,0.7,4.4,1.3,6.6,2c14.1,4.6,24.1,17.8,24.4,32.7c0.2,12,0.1,24,0,36c0,5.5-2.9,8.6-7.5,8.6
                    c-4.6-0.1-7.4-3.3-7.4-8.8c-0.1-11.2,0-22.3,0-33.5c-0.1-12.5-8.8-21.8-20.5-21.8c-11.6,0-20.6,9.4-20.5,21.8
                    c0.2,16.5-1,33,0.8,49.4c1.5,13.1,5.6,25.3,11.7,36.9c1.8,3.5,2.9,3.4,5.5,0.7c18.9-19.1,38-37.9,56.8-57
                    c15.2-15.5,33.5-22.9,55.1-22.8c41.5,0.1,83,0.1,124.5,0c4,0,5.9,0.5,5.7,5.3c-0.4,9.8-0.1,9.8-10.1,9.8c-39.5,0-79,0.2-118.5-0.1
                    c-18.7-0.1-34.2,6.2-47.3,19.7c-18.8,19.4-38,38.3-57.3,57.3c-3.1,3-3,5,0.1,7.4c0.1,0.1,0.2,0.2,0.3,0.4c4.8,6,8.9,9.4,18.3,6
                    c12.3-4.5,24.1,0.6,32.1,11.4c8,10.8,8.4,22.4,2.3,34.3c-1.7,3.2-3.3,4.4-6.1,1.1c-1-1.1-2.1-2.2-3.3-3c-3.2-2.3-4-4.4-2.5-8.7
                    c4.6-13.2-8.3-24.3-19.5-20.8c-0.1,2.2,1.8,3,3,4.1c10.3,9.5,10,12.1,6.2,16.8c-3.7,4.6-7.8,2.9-16.7-5.9c-0.4-0.4-0.7-0.8-1.1-1
                    c-1-0.7-1.5-2.7-3.1-1.8c-1.3,0.7-0.9,2.4-1,3.7c-0.2,9.7,8.8,17.6,18.6,16.4c3.7-0.5,13.7,5.3,14.8,8.8c0.8,2.2-1.5,2.4-2.6,2.9
                    c-11.3,5.4-22.3,4.7-32.6-2.5C81,296,76.8,280.4,82.9,266.4c1.3-2.9,1.2-4.8-1.3-6.8c-2.2-1.8-4.3-3.7-6.1-5.9
                    c-2.7-3.4-4.3-3.4-6.6,0.6c-10.5,18.1-9,41.7,5.5,56.7c24.4,25.3,49.4,50,74.6,74.6c11,10.8,25.1,14.8,40.4,14.2
                    c4.6-0.2,6.2,1.2,5.7,5.7c-0.4,3.1-0.1,6.3-0.1,9.5c-5,0-10,0-15,0c-0.9-0.3-1.9,0.3-2.8,0.2c-15.7-1.9-29.4-9.5-40.6-20.5
                    c-24-23.8-48-47.6-71.6-71.7c-13.8-14.1-19.4-31.5-17.2-51.2c1.2-11.2,5.2-21.3,11.9-30.2c2.3-3,2.9-5.5,0.5-9.2
                    c-5.1-7.8-8.4-16.6-11.2-25.5c-2.5-7.8-3.2-15.9-5-23.8c0-18,0-36,0-54c2.5-8.6,6.2-16.4,13.5-22.1c5.2-4.2,11.3-6,17.5-7.9
                    C78,99,81,99,84,99z"
                />
                <path
                    d="M183,415c0.4-4.9-2.1-11.5,1.1-14.3c3.2-1.2,9.2-0.8,14-0.8c80,0,159.9,0,239.9,0c18.3,0,28-9.7,28-28.1
                    c0-62,0-124,0-185.9c0-17.7-9.9-27.6-27.5-27.6c-41.5,0-83-0.1-124.5,0.1c-4.2,0-5.3-1.2-5.2-5.3c0.3-9.8,0.1-9.8,10.1-9.8
                    c39.5,0,79,0,118.5,0c23.3,0,36.9,10.4,43,32.9c0.1,0.3,0.4,0.5,0.6,0.8c0,68,0,136,0,204c-0.4,1.2-0.8,2.5-1.2,3.7
                    c-3.9,13.9-12.6,23.3-26.3,28.1c-2.5,0.9-5,1.4-7.6,2.1C358.3,415,270.7,415,183,415z"
                />
            </svg>
        )

        return icon == 'index' ? index : list
    }

    useEffect(() => {
        global.log('selWCDEquipment:', selWCDEquipment)
        if (selWCDEquipment && selWCDEquipment.length > 0) getOrderList(selWCDEquipment[0].function)
        else getOrderList('')
    }, [selWCDEquipment])

    useEffect(() => {
        if (!wcdTagItem[0] || !wcdTagItem)
            setItem({
                func: '',
                type: '',
                list: [],
                refDoc: [],
            })
    }, [wcdTagItem])

    useEffect(() => {
        if (!wcdTagDoc || !wcdTagDoc[0]) {
            setDoc({
                func: '',
                type: '',
                list: [],
                refDoc: [],
            })
            setEnableIndex(false)
        }
    }, [wcdTagDoc])

    useEffect(() => {
        if (wcdEquipments.length == 0) setPopMenu({ ...popMenu, open: false })
    }, [wcdEquipments])

    useEffect(() => {
        global.log('list:', list)
    }, [list])

    return (
        <>
            {list.list && list.list.length > 0 && (
                <div className="OrderListFlagView">
                    <div>
                        <div className="OrderListFlagTitlebar">
                            <div className="Text">
                                {/* {listFlag.list.length>0&&'오더 리스트 플래그('+listFlag.func+')'} */}
                                {list.list.length > 0 && '조회 오더 리스트(' + list.func + ')'}
                            </div>
                        </div>
                        {/* {listFlag.list.length>0&&<OrderListFlag
                        list={listFlag}
                        listType='listflag'
                        getOrderList={getOrderList}
                        getTaggingItemList={getTaggingItemList}
                        wcdHandle={wcdHandle}
                        setWcdHandle={setWcdHandle}
                        selectedDocky={selectedDocKey}
                        setEnableIndex={setEnableIndex}
                        setPopMenu={setPopMenu}
                        setWCDEquipments={setWCDEquipments}
                        setSelWCDQuipment={setSelWCDEquipment}
                    />} */}
                        {list.list.length > 0 && (
                            <OrderListFlag
                                list={list}
                                listType="list"
                                getOrderList={getOrderList}
                                getTaggingItemList={getTaggingItemList}
                                wcdHandle={wcdHandle}
                                setWcdHandle={setWcdHandle}
                                selectedCanvas={selectedCanvas}
                                setEnableIndex={setEnableIndex}
                                setPopMenu={setPopMenu}
                                setWCDEquipments={setWCDEquipments}
                                setSelWCDEquipment={setSelWCDEquipment}
                            />
                        )}
                    </div>
                </div>
            )}
            {item.list && item.list.length > 0 && (
                <div
                    className="OrderListFlagView"
                    style={{
                        left: 'calc(((100% - 800px) / 2) + 60px)',
                        top: 'calc(((100% - 400px) / 2) + 90px)',
                        position: 'absolute',
                    }}
                >
                    <div>
                        <div className="OrderListFlagTitlebar">
                            <div className="Text">{item.list.length > 0 && '태깅 아이템 목록(' + item.func + ')'}</div>
                        </div>
                        {item.list.length > 0 && (
                            <OrderListFlag
                                list={item}
                                listType="item"
                                getOrderList={getOrderList}
                                getTaggingItemList={getTaggingItemList}
                                wcdHandle={wcdHandle}
                                setWcdHandle={setWcdHandle}
                                selectedCanvas={selectedCanvas}
                                setEnableIndex={setEnableIndex}
                                setPopMenu={setPopMenu}
                                setWCDEquipments={setWCDEquipments}
                                setSelWCDEquipment={setSelWCDEquipment}
                            />
                        )}
                    </div>
                </div>
            )}
            {doc.list && doc.list.length > 0 && (
                <div className="WCDView">
                    <div>
                        <div className="OrderListFlagTitlebar">
                            <div className="Text">WCD 보기</div>
                        </div>
                        <div className="Subtitlebar">
                            <div className="Text">{doc.func}</div>
                        </div>
                        <div className="Buttons">
                            <div
                                className="Icon"
                                onClick={() => {
                                    setEnableIndex(!enableIndex)
                                }}
                            >
                                <div>{buttonIcon('index')}</div>
                                <div className="Text" style={{ marginBottom: '5px' }}>
                                    범례
                                </div>
                            </div>
                            <div
                                className="Icon"
                                onClick={() => {
                                    getTaggingItemList(popMenu.id, popMenu.func, popMenu.wcdNo, 'item')
                                }}
                            >
                                <div>{buttonIcon('list')}</div>
                                <div className="Text" style={{ marginBottom: '5px' }}>
                                    태깅목록
                                </div>
                            </div>
                        </div>
                        {doc.list.length > 0 && (
                            <OrderListFlag
                                list={{ list: doc.refDoc }}
                                listType="doc"
                                getOrderList={getOrderList}
                                getTaggingItemList={getTaggingItemList}
                                wcdHandle={wcdHandle}
                                setWcdHandle={setWcdHandle}
                                selectedCanvas={selectedCanvas}
                                setEnableIndex={setEnableIndex}
                                setPopMenu={setPopMenu}
                                setWCDEquipments={setWCDEquipments}
                                setSelWCDEquipment={setSelWCDEquipment}
                            />
                        )}
                    </div>
                </div>
            )}
            {enableIndex && wcdTagDoc && (
                <div className="IndexView">
                    <div className="IndexViewContainer">
                        <div className="OrderListFlagTitlebar">
                            <div className="Text">범례 (LEGEND)</div>
                        </div>
                        <div className="IndexViewContents">
                            {indexInfo.map((f: any, i) => (
                                <div key={i} className="IndexViewLine" style={{ marginTop: i == 0 ? '0px' : '10px' }}>
                                    <div className="Rect" style={{ backgroundColor: f.color }} />
                                    <div className="Text">
                                        {f.title}
                                        <br />
                                        {f.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="Footer">
                            <div
                                className="CancelLoadButton"
                                onClick={() => {
                                    setEnableIndex(false)
                                }}
                            >
                                <div className="Text">닫기</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {popMenu.open && (
                <div
                    className="PopMenu"
                    style={{
                        left: popMenu.x,
                        top: popMenu.y,
                    }}
                >
                    <div
                        className="Menu"
                        onClick={() => {
                            getTaggingItemList(popMenu.id, popMenu.func, popMenu.wcdNo, 'doc')
                            getOrderList('')
                            setWcdHandle(wcdEquipments)
                            setWCDEquipments([])
                            setSelWCDEquipment([])
                            // pushCommand({ name: 'setWCDEquipments', value: { wcdAllEquipments: [] } });
                            // pushCommand({ name: 'selectWCDHandle', value: { wcdEquipments: [], x:0, y:0}});
                            setPopMenu({ ...popMenu, open: false })
                        }}
                    >
                        도면으로 보기
                    </div>
                    <br />
                    <div
                        className="Menu"
                        onClick={() => {
                            getTaggingItemList(popMenu.id, popMenu.func, popMenu.wcdNo, 'item')
                            setPopMenu({ ...popMenu, open: false })
                        }}
                    >
                        태깅아이템 목록 보기
                    </div>
                </div>
            )}
        </>
    )
}

function OrderListFlag({
    list,
    listType,
    getOrderList,
    getTaggingItemList,
    wcdHandle,
    setWcdHandle,
    selectedCanvas,
    setEnableIndex,
    setPopMenu,
    setWCDEquipments,
    setSelWCDEquipment,
}: any) {
    const navigate = useNavigate()
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)
    const isMarkupChanged = useRecoilValue(MarkUpStore.isMarkupChanged)
    const setIsShowMarkupPopup = useSetRecoilState(MarkUpStore.isShowMarkupPopup)
    const setIsRelativeDoc = useSetRecoilState(WCDStore.isRelativeDoc)
    const [controlMode, setControlMode] = useRecoilState(StatusStore.controlMode)
    const [isPMDC, setIsPMDC] = useRecoilState(PMDCStore.isPMDC)
    const setIsPMDCTagOn = useSetRecoilState(PMDCStore.isPMDCTagOn)
    const setSelPMDCEquipment = useSetRecoilState(PMDCStore.selPMDCEquipment)
    const docId = selectedCanvas.documentCtx.docId
    const docVer = selectedCanvas.documentCtx.docVer
    const plantCode = selectedCanvas.documentCtx.PlantCode
    const getItems = (): JSX.Element[] => {
        const result: JSX.Element[] = []

        let idx = 0
        for (const row of list.list) {
            listType == 'listflag'
                ? result.push(
                      <tr
                          key={idx}
                          className="RowItem"
                          onClick={() => {
                              global.log('getOrderListFlag')
                              getOrderList(list.func)
                          }}
                      >
                          <td className="Item"> {row.taskType}</td>
                          <td className="Item"> {row.id} </td>
                          <td className="Item"> {row.detail} </td>
                          <td className="Item"> {row.startDate} </td>
                          <td className="Item"> {row.endDate} </td>
                          <td className="Item"> {row.status} </td>
                      </tr>
                  )
                : listType == 'list'
                ? result.push(
                      <tr
                          key={idx}
                          className="RowItem"
                          onClick={(e) => {
                              setPopMenu({ x: e.clientX, y: e.clientY, id: row.id, func: list.func, wcdNo: row.wcdNo, open: true })
                          }}
                      >
                          <td className="Item" style={{ width: '100px', maxWidth: '100px' }}>
                              {' '}
                              &nbsp;{row.id}&nbsp;{' '}
                          </td>
                          <td className="Item" style={{ width: '200px', maxWidth: '200px' }}>
                              {' '}
                              &nbsp;{row.detail}&nbsp;{' '}
                          </td>
                          <td className="Item" style={{ width: '100px', maxWidth: '100px' }}>
                              {' '}
                              &nbsp;{row.wcaNo}&nbsp;{' '}
                          </td>
                          <td className="Item" style={{ width: '100px', maxWidth: '100px' }}>
                              {' '}
                              &nbsp;{row.wcdNo}&nbsp;{' '}
                          </td>
                          <td className="Item" style={{ width: '90px', maxWidth: '90px' }}>
                              {' '}
                              &nbsp;{row.status}&nbsp;{' '}
                          </td>
                          <td className="Item" style={{ width: '200px', maxWidth: '200px' }}>
                              {' '}
                              &nbsp;{row.object}&nbsp;{' '}
                          </td>
                      </tr>
                  )
                : listType == 'item'
                ? result.push(
                      <tr key={idx} className="RowItem">
                          <td className="Item" style={{ width: '50px', maxWidth: '50px' }}>
                              {' '}
                              &nbsp;{row.counter}&nbsp;{' '}
                          </td>
                          <td className="Item" style={{ width: '170px', maxWidth: '170px' }}>
                              {' '}
                              &nbsp;{row.object}&nbsp;{' '}
                          </td>
                          <td className="Item" style={{ width: '50px', maxWidth: '50px' }}>
                              {' '}
                              &nbsp;{row.order}&nbsp;{' '}
                          </td>
                          <td className="Item" style={{ width: '50px', maxWidth: '50px' }}>
                              {' '}
                              &nbsp;{row.setOption}&nbsp;{' '}
                          </td>
                          <td className="Item" style={{ width: '130px', maxWidth: '130px' }}>
                              {' '}
                              &nbsp;{row.setCaution}&nbsp;{' '}
                          </td>
                          <td className="Item" style={{ width: '50px', maxWidth: '50px' }}>
                              {' '}
                              &nbsp;{row.resetOption}&nbsp;{' '}
                          </td>
                          <td className="Item" style={{ width: '130px', maxWidth: '130px' }}>
                              {' '}
                              &nbsp;{row.resetCaution}&nbsp;
                          </td>
                          <td className="Item" style={{ width: '50px', maxWidth: '50px' }}>
                              {' '}
                              &nbsp;{row.line}&nbsp;{' '}
                          </td>
                          <td className="Item" style={{ width: '100px', maxWidth: '100px' }}>
                              {' '}
                              &nbsp;{row.docNo}&nbsp;{' '}
                          </td>
                      </tr>
                  )
                : result.push(
                      <tr
                          key={idx}
                          className="RowItem"
                          onClick={() => {
                              global.log('row:', row)
                              setIsRelativeDoc(true)
                              if (controlMode === 'pmdc') {
                                console.log("controlMode:", controlMode)
                                setControlMode('select')
                                setIsPMDC(false)
                                setIsPMDCTagOn(false)
                                setSelPMDCEquipment([])
                              }
                              commonFunc.changeDocument(
                                  crypt.encrypt(row.DOCNO),
                                  crypt.encrypt(row.DOCVR),
                                  crypt.encrypt(row.PLANTCODE),
                                  undefined,
                                  isMarkupChanged,
                                  setIsShowMarkupPopup,
                                  navigate,
                                  setYesNoPopupValue
                              )
                          }}
                      >
                          <td className="Item" style={{ padding: '0px 0px 0px 5px' }}>
                              {docId == row.DOCNO && docVer == row.DOCVR && '▶'}
                          </td>
                          <td className="Item" style={{ textAlign: 'left' }}>
                              <span className="DocNo">{row.DOCNUMBER}</span>
                          </td>
                      </tr>
                  )

            idx++
        }

        return result
    }

    const onClose = () => {
        if (listType == 'list') {
            setSelWCDEquipment([])
            setPopMenu(false)
        } else if (listType == 'item') {
            getTaggingItemList('', '', '', 'item')
        } else if (listType == 'doc') {
            getTaggingItemList('', '', '', 'doc')
            setWCDEquipments(wcdHandle)
            setEnableIndex(false)
        }
    }

    return (
        <div className="ListView">
            <table style={{ maxWidth: '800px' }}>
                <thead className="Header">
                    {listType == 'listflag' && (
                        <tr>
                            <th className="Item">오더유형</th>
                            <th className="Item">오더번호</th>
                            <th className="Item">오더내역</th>
                            <th className="Item">기본시작일</th>
                            <th className="Item">기본종료일</th>
                            <th className="Item">오더상태</th>
                        </tr>
                    )}
                    {listType == 'list' && (
                        <tr>
                            <th className="Item">오더번호</th>
                            <th className="Item">오더내역</th>
                            <th className="Item" style={{ minWidth: '90px' }}>
                                WCA번호
                            </th>
                            <th className="Item" style={{ minWidth: '90px' }}>
                                WCD번호
                            </th>
                            <th className="Item">WCD상태</th>
                            <th className="Item">참조 오브젝트</th>
                            {/* <th className="Item" colSpan={2}>보기</th> */}
                        </tr>
                    )}
                    {listType == 'item' && (
                        <tr>
                            <th className="Item">카운터</th>
                            <th className="Item">기술적 오브젝트</th>
                            <th className="Item">
                                태그
                                <br />
                                설정순서
                            </th>
                            <th className="Item">
                                태그
                                <br />
                                설정조건
                            </th>
                            <th className="Item">부착시 주의사항</th>
                            <th className="Item">
                                태그
                                <br />
                                해제조건
                            </th>
                            <th className="Item">해제시 주의사항</th>
                            <th className="Item">라인조회</th>
                            <th className="Item">도면번호</th>
                        </tr>
                    )}
                    {listType == 'doc' && (
                        <tr>
                            <th className="Item"> </th>
                            <th className="Item" style={{ textAlign: 'left', paddingLeft: '10px' }}>
                                참조도면
                            </th>
                        </tr>
                    )}
                </thead>
                <tbody>{getItems()}</tbody>
            </table>
            <div className="Footer">
                <div className="CancelLoadButton" onClick={onClose}>
                    <div className="Text">닫기</div>
                </div>
            </div>
        </div>
    )
}
