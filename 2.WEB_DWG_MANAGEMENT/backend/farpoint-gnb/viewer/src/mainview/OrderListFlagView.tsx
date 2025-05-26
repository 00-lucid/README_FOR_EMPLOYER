import React, { useEffect } from 'react'
import { DocumentContext, EquipmentContext } from '../types'
import { TreeView, TreeViewItemSource } from '../common'
import './OrderListFlagView.css'
import { EquipmentLink } from '../types'
import Repository from '../Repository'
import { StatusContext, AppContext, pushCommand } from '..'
import { CanvasContext } from './useCanvasContext'
// import { equipment } from '../sideview/MenuBarIcons'

type Props = {
    equipments: any
    document: DocumentContext | undefined
    canvasContext: CanvasContext | undefined
}

export function OrderListFlagView({ equipments, document, canvasContext }: Props) {
    const appContext = React.useContext(AppContext)
    const status = React.useContext(StatusContext)
    // const equipment = useSelectedWCDEquipments(canvasContext)

    const [listFlag, setListFlag] = React.useState({func:'', list:[]});
    const [list, setList] = React.useState({func:'', list:[]});
    const [item, setItem] = React.useState({func:'', type: '', list:[]});

    console.log('equipments:', equipments);

    const getOrderListFlag = React.useCallback(async () => {
        // if (!equipments) return;
        if (equipments){
            console.log('equipments1:', equipments)
            const list = await Repository.getOrderListFlag(
                equipments.function
            )
            console.log('listFlag:', list);
            setListFlag({
                func: equipments.function,
                list: list
            });
        }
        else {
            setListFlag({func:'', list:[]});
        }
    }, [equipments]);

    const getOrderList = async (func:string) => {
        pushCommand({ name: 'selectWCDHandle', value: { equipments: [], x: 0, y: 0}});
        console.log('id:', func);
        if (status.document) {
            if (appContext.userId ) {
                if (func) {
                    const list = await Repository.getOrderList(
                        func
                    )
                    console.log('list:', list);
                    setList({
                        func: func,
                        list: list
                    });
                }
                else {
                    setList({func:'', list:[]});
                }
            }
        }
    }

    const getTaggingItemList = async (id: string, func:string, wcdNo:string, type: string) => {
        if (status.document) {
            if (appContext.userId ) {
                if (func) {
                    const list = await Repository.getTaggingItemList(
                        id,
                        func,
                        wcdNo,
                        document
                    )
                    console.log('item:', list);
                    setItem({
                        func: func,
                        type: type,
                        list: list
                    });
                    if (type == 'doc') {

                    }
                }
                else {
                    setItem({
                        func: '',
                        type: type, 
                        list: []
                    });
                }
            }
        }
    }

    const popSelect = async (func:string) => {

    }

    function buttonIcon(icon:string): JSX.Element {
        const index = (
            <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                <g fillRule="evenodd" fill="none" transform="matrix(0.77777785 0 0 0.77777785 0 0)">
                    <path
                        d="M13.748 12.896L4.075 14.302L11.075 21.125L9.423 30.758999L18.073 26.210999L26.727001 30.758999L25.074001 21.125L32.074 14.302L22.401001 12.896L18.074001 4.13L13.748 12.896z"
                        fill="#4A70F7"
                        fillOpacity=".9"
                    />
                    <path
                        d="M4.074 14.301L13.747999 12.8949995L18.074999 4.1289997L22.401 12.8949995L32.074997 14.301L25.074997 21.124L26.726997 30.759L18.074997 26.210001L9.4229965 30.760002L11.074997 21.124002L4.074 14.301z"
                        stroke="#4A70F7"
                    />
                </g>
            </svg>
        )
    
        const list = (
            <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                <path
                    transform="matrix(0.77777785 0 0 0.77777785 0 0)"
                    d="M7.487 18.571L7 18.096L6 17.122002L4 15.172002L13.674 13.766002L18 5L22.326 13.766L32 15.172L25 21.994999L26.652 31.63L18 27.081L9.348 31.63L11 21.995L10 21.021"
                    stroke="var(--Menu-Toolbar-Item-Stroke)"
                    opacity=".9"
                    fill="none"
                />
            </svg>
        )
    
        return icon=='index'? index : list
    }

    React.useEffect(() => {
        getOrderListFlag();
    }, [equipments])
    
    // React.useEffect(() => {
    //     console.log('list:', list);
    // }, [list])

    return (
        <>
            {(listFlag.list.length>0||list.list.length>0)&&<div className="OrderListFlagView">
                <div >
                    <div className="OrderListFlagTitlebar">
                        <div className="Text">
                            {listFlag.list.length>0&&'오더 리스트 플래그('+listFlag.func+')'}
                            {list.list.length>0&&'조회 오더 리스트('+list.func+')'}
                        </div>
                    </div>
                    {listFlag.list.length>0&&<OrderListFlag
                        list={listFlag}
                        listType='listflag'
                        getOrderList={getOrderList}
                        getTaggingItemList={getTaggingItemList}
                    />}
                    {list.list.length>0&&<OrderListFlag
                        list={list}
                        listType='list'
                        getOrderList={getOrderList}
                        getTaggingItemList={getTaggingItemList}
                    />}
                    {/* <div className="CancelLoadButton" onClick={onClose}>
                        <div className="Text">닫기</div>
                    </div> */}
                </div>
            </div>}
            {(item.list.length>0&&item.type=='list')&&<div className="OrderListFlagView" 
                style={{
                    left:'calc(((100% - 800px) / 2) + 60px)', 
                    top:'calc(((100% - 400px) / 2) + 90px)',
                    // left:'100px',
                    // top:'100px',
                    position:'absolute'
                }}
            >
                <div >
                    <div className="OrderListFlagTitlebar">
                        <div className="Text">
                            {item.list.length>0&&'태깅 아이템 목록('+item.func+')'}
                        </div>
                    </div>
                    {item.list.length>0&&<OrderListFlag
                        list={item}
                        listType='item'
                        getOrderList={getOrderList}
                        getTaggingItemList={getTaggingItemList}
                    />}
                </div>
            </div>}
            {(item.list.length>0&&item.type=='doc')&&<div className="WCDView">
                <div>
                    <div className="OrderListFlagTitlebar">
                        <div className="Text">WCD 보기</div>
                    </div>
                    <div className="Subtitlebar">
                        <div className="Text">{item.func}</div>
                    </div>
                    <div className='Buttons'>
                        <div className='Icon' onClick={()=>{console.log('범례')}}>
                            <div>{buttonIcon('index')}</div>
                            <div className='Text'>범례</div>
                        </div>
                        <div className='Icon' onClick={()=>{console.log('태깅목록')}}>
                            <div>{buttonIcon('list')}</div>
                            <div>태깅목록</div>
                        </div>
                    </div>
                    {item.list.length>0&&<OrderListFlag
                        list={item}
                        listType='doc'
                        getOrderList={getOrderList}
                        getTaggingItemList={getTaggingItemList}
                    />}
                </div>
            </div>}
        </>
    )
}

function OrderListFlag({ list, listType, getOrderList, getTaggingItemList, document }:any) {
    
    const getItems = (): JSX.Element[] => {
        const result: JSX.Element[] = []

        let idx = 0;
        for (const row of list.list) {
            listType=='listflag' ?
                result.push(
                    <tr
                        key={idx}
                        className="RowItem"
                        onClick={() => {
                            console.log('getOrderListFlag');
                            getOrderList(list.func);
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
                : listType=='list' ?
                result.push(
                    <tr
                        key={idx}
                        className="RowItem"
                        // onClick={() => {
                        //     console.log('getOrderList');
                        //     getTaggingItemList(list.func);
                        // }}
                    >
                        <td className="Item"> {row.id} 
                            
                        </td>
                        <td className="Item"> {row.detail} </td>
                        <td className="Item"> {row.wcaNo} </td>
                        <td className="Item"> {row.wcdNo} </td>
                        <td className="Item"> {row.status} </td>
                        <td className="Item"> {row.object} </td>
                        <td 
                            className="Item" 
                            onClick={()=>{
                                getTaggingItemList(row.id, list.func, row.wcdNo, 'doc');
                                getOrderList('');
                            }}
                        > 
                            <span className='ListBtn'>도면</span> 
                        </td>
                        <td className="Item" onClick={()=>{getTaggingItemList(row.id, list.func, row.wcdNo, 'list')}}> 
                            <span className='ListBtn'>목록</span> 
                        </td>
                    </tr>
                )
                : list.type=='list'?
                result.push(
                    <tr
                        key={idx}
                        className="RowItem"
                        // onClick={() => {
                        //     console.log('getTagginItemList');
                        //     getOrderList(row.id);
                        // }}
                    >
                        <td className="Item"> {row.counter} </td>
                        <td className="Item"> {row.object} </td>
                        <td className="Item"> {row.order} </td>
                        <td className="Item"> {row.setOption} </td>
                        <td className="Item"> {row.setCaution} </td>
                        <td className="Item"> {row.resetOption} </td>
                        <td className="Item"> {row.resetCaution} </td>
                        <td className="Item"> {row.line} </td>
                        <td className="Item"> {row.docNo} </td>
                    </tr>
                )
                :
                result.push(
                    <tr
                        key={idx}
                        className='RowItem'
                    >
                        <td className='item'>{row.docNo}</td>
                    </tr>
                )

            idx++
        }

        return result
    }

    const onClose = () => {
        console.log('close');
        if (listType == 'listflag') pushCommand({ name: 'selectWCDHandle', value: { equipments: [], x: 0, y: 0}});
        else if (listType == 'list') getOrderList('');
        else {
            console.log('clostTag');
            getTaggingItemList('');
        }
    }

    return (
        <div className="ListView">
            <table>
                <thead className="Header">
                    {listType=='listflag'&&<tr>
                        <th className="Item">오더유형</th>
                        <th className="Item">오더번호</th>
                        <th className="Item">오더내역</th>
                        <th className="Item">기본시작일</th>
                        <th className="Item">기본종료일</th>
                        <th className="Item">오더상태</th>
                    </tr>}
                    {listType=='list'&&<tr>
                        <th className="Item">오더번호</th>
                        <th className="Item">오더내역</th>
                        <th className="Item">WCA번호</th>
                        <th className="Item">WCD번호</th>
                        <th className="Item">WCD상태</th>
                        <th className="Item">참조 오브젝트</th>
                        <th className="Item" colSpan={2}>보기</th>
                    </tr>}
                    {list.type=='list'&&<tr>
                        <th className="Item">카운터</th>
                        <th className="Item">기술적 오브젝트</th>
                        <th className="Item">태그설정순서</th>
                        <th className="Item">태그설정조건</th>
                        <th className="Item">부착시 주의사항</th>
                        <th className="Item">태그해제조건</th>
                        <th className="Item">해제시 주의사항</th>
                        <th className="Item">라인조회</th>
                        <th className="Item">도면번호</th>
                        
                    </tr>}
                    {list.type=='doc'&&<tr style={{borderRadius:'6px'}}>
                        <th className="Item">참조도면</th>
                    </tr>}
                    
                </thead>
                <tbody>{getItems()}</tbody>
            </table>
            <div className='Footer'>
                <div className="CancelLoadButton" onClick={onClose}>
                    <div className="Text">닫기</div>
                </div>
            </div>
        </div>
    )
}

// const makeFolder = (
//     text: string,
//     key: string,
//     children: TreeViewItemSource[],
//     onClick: (key: string) => void,
//     depth: number
// ): TreeViewItemSource => {
//     const open = (
//         <div className="Label">
//             <svg
//                 className="FolderIcon"
//                 fill="var(--icon-toolbar-foreground)"
//                 style={{ transform: 'rotate(0deg)', left: `calc(0px + var(--TreeView-Indent-Width) * ${depth})` }}
//             >
//                 <path d="M12 15.001c-.495 0-.957-.192-1.301-.541l-3.555-3.609a.5.5 0 1 1 .712-.702l3.556 3.61c.307.31.869.31 1.176 0l3.556-3.61a.5.5 0 1 1 .712.702l-3.555 3.609a1.812 1.812 0 0 1-1.301.541" />
//             </svg>
//             <div
//                 className="Text VerticalCenter"
//                 style={{ left: `calc(0px + var(--TreeView-Indent-Width) * ${depth} + 24px)` }}
//             >{`${text}`}</div>
//         </div>
//     )

//     const close = (
//         <div className="Label">
//             <svg
//                 className="FolderIcon"
//                 fill="var(--icon-toolbar-foreground)"
//                 style={{ transform: 'rotate(-90deg)', left: `calc(0px + var(--TreeView-Indent-Width) * ${depth})` }}
//             >
//                 <path d="M12 15.001c-.495 0-.957-.192-1.301-.541l-3.555-3.609a.5.5 0 1 1 .712-.702l3.556 3.61c.307.31.869.31 1.176 0l3.556-3.61a.5.5 0 1 1 .712.702l-3.555 3.609a1.812 1.812 0 0 1-1.301.541" />
//             </svg>
//             <div
//                 className="Text VerticalCenter"
//                 style={{ left: `calc(0px + var(--TreeView-Indent-Width) * ${depth} + 24px)` }}
//             >{`${text}`}</div>
//         </div>
//     )

//     const label = {
//         height: 30,
//         heightUnit: 'px',
//         selected: { open, close },
//         normal: { open, close }
//     }

//     return { label, key, items: children, onClick: () => onClick(key) }
// }

// const makeInfo = (text: string, key: string, onClick = () => {}, depth: number): TreeViewItemSource => {
//     const open = (
//         <div className="Label">
//             <div
//                 className="Text VerticalCenter"
//                 style={{ left: `calc(0px + var(--TreeView-Indent-Width) * ${depth} + 24px)` }}
//             >{`${text}`}</div>
//         </div>
//     )

//     const label = {
//         height: 30,
//         heightUnit: 'px',
//         selected: { open, close: open },
//         normal: { open, close: open }
//     }

//     return { label, key, items: [], onClick }
// }

// const makeDate = (
//     text: string,
//     key: string,
//     value: Date,
//     onChange: (date: Date) => void,
//     depth: number
// ): TreeViewItemSource => {
//     const open = (
//         <div className="Label">
//             <div
//                 className="Text VerticalCenter"
//                 style={{ left: `calc(0px + var(--TreeView-Indent-Width) * ${depth} + 24px)` }}
//             >
//                 {text}
//             </div>
//             <div className="Date" style={{ left: `calc(0px + var(--TreeView-Indent-Width) * ${depth} + 70px)` }}>
//                 {/* <SelectDate id={key} date={value} onChange={(value) => onChange(value)} /> */}
//                 <input
//                     className="DatePick"
//                     type="date"
//                     value={toStringByFormatting(value)}
//                     onChange={(e) => onChange(new Date(e.target.value))}
//                 ></input>
//             </div>
//         </div>
//     )

//     const label = {
//         height: 30,
//         heightUnit: 'px',
//         selected: { open, close: open },
//         normal: { open, close: open }
//     }

//     return { label, key, items: [], onClick: () => {} }
// }

// const toStringByFormatting = (source: Date, delimiter = '-') => {
//     const leftPad = (value: number) => {
//         if (value >= 10) {
//             return value
//         }
//         return `0${value}`
//     }

//     const year = source.getFullYear()
//     const month = leftPad(source.getMonth() + 1)
//     const day = leftPad(source.getDate())
//     return [year, month, day].join(delimiter)
// }

// const openWindow = (url: string) => {
//     console.log(url)
//     window.open(url, 'FarpointExternalWindow')
// }

// function favoriteImg(isActive: boolean): JSX.Element {
//     const fill = (
//         <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
//             <g fillRule="evenodd" fill="none" transform="matrix(0.77777785 0 0 0.77777785 0 0)">
//                 <path
//                     d="M13.748 12.896L4.075 14.302L11.075 21.125L9.423 30.758999L18.073 26.210999L26.727001 30.758999L25.074001 21.125L32.074 14.302L22.401001 12.896L18.074001 4.13L13.748 12.896z"
//                     fill="#4A70F7"
//                     fillOpacity=".9"
//                 />
//                 <path
//                     d="M4.074 14.301L13.747999 12.8949995L18.074999 4.1289997L22.401 12.8949995L32.074997 14.301L25.074997 21.124L26.726997 30.759L18.074997 26.210001L9.4229965 30.760002L11.074997 21.124002L4.074 14.301z"
//                     stroke="#4A70F7"
//                 />
//             </g>
//         </svg>
//     )

//     const empty = (
//         <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
//             <path
//                 transform="matrix(0.77777785 0 0 0.77777785 0 0)"
//                 d="M7.487 18.571L7 18.096L6 17.122002L4 15.172002L13.674 13.766002L18 5L22.326 13.766L32 15.172L25 21.994999L26.652 31.63L18 27.081L9.348 31.63L11 21.995L10 21.021"
//                 stroke="var(--Menu-Toolbar-Item-Stroke)"
//                 opacity=".9"
//                 fill="none"
//             />
//         </svg>
//     )

//     return isActive ? fill : empty
// }

function useSelectedWCDEquipments(current: CanvasContext | undefined) {
    const status = React.useContext(StatusContext)

    const [selectedWCDEquipments, setSelectedWCDEquipments] = React.useState<EquipmentContext[]>([])

    React.useEffect(() => {
        const handles: EquipmentContext[] = []

        if (current) {
            if (0 < status.wcdEquipments.length) {
                for (const equipment of status.wcdEquipments) {
                    const value = current.equipmentByTagId.get(equipment.tagId)

                    if (value) {
                        handles.push(value)
                    }
                }
            }
        }

        setSelectedWCDEquipments(handles)
    }, [current, status.wcdEquipments])

    return selectedWCDEquipments
}
