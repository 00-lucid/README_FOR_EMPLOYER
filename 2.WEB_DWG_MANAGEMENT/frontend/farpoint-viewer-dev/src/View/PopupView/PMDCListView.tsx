import { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil'
import './PMDCListView.css'

import { getEntities } from '../../Lib/canvasUtils'

import Api from '../../Api'
import AppStore from '../../Store/appStore'
import { StatusStore, PMDCStore } from '../../Store/statusStore'

type Props = {
    viewer: any
    getPMDCUserListPopup: () => void
}

const dsInfo = [
    {
        id: 'HDPI',
        name: '하동',
        plantCode: '5100',
    },
    {
        id: 'SICPI',
        name: '신인천',
        plantCode: '5200',
    },
    {
        id: 'bspi',
        name: '부산',
        plantCode: '5300',
    },
    {
        id: 'JJPI',
        name: '남제주',
        plantCode: '5700',
    },
    {
        id: 'YWPI',
        name: '영월',
        plantCode: '5800',
    },
    {
        id: 'ADPI',
        name: '안동',
        plantCode: '6000',
    },
]

const offImg = (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(-21 -155)" fill="none" fillRule="evenodd">
            <path fill="var(--icon-toolbar-foreground)" opacity=".15" d="M23.5 176.5h19v-19h-19z" />
            <path stroke="gray" d="M23.5 176.5h19v-19h-19z" />
        </g>
    </svg>
)

const onImg = (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(-21 -210)" fill="none" fillRule="evenodd">
            <path fill="var(--icon-toolbar-foreground)" opacity=".15" d="M23.5 231.5h19v-19h-19z" />
            <path stroke="gray" d="M23.5 231.5h19v-19h-19z" />
            <path stroke="var(--icon-toolbar-foreground)" d="m26.5 220.5 5.167 5.167L40 217.333" />
        </g>
    </svg>
)

export default function PMDCListView({ viewer, getPMDCUserListPopup }: Props) {
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const setBanner = useSetRecoilState(StatusStore.banner)
    const userContext = useRecoilValue(AppStore.userContext)
    const pmdcEquipments = useRecoilValue(PMDCStore.pmdcEquipments)

    const [selPMDCEquipment, setSelPMDCEquipment] = useRecoilState(PMDCStore.selPMDCEquipment)

    const [displayList, setDisplayList] = useState<any>({ func: '', user: [], master: [] })
    const [settingList, setSettingList] = useState<any>({ func: '', master: [] })
    const [open, setOpen] = useState<any>({ display: false, setting: false })

    const [searchText, setSearchText] = useState<string>('')
    const [searchType, setSearchType] = useState<string>('')
    const [searchUnit, setSearchUnit] = useState<string>('')
    const [searchDesc, setSearchDesc] = useState<string>('')
    const getPMDCUserList = async (func: string) => {
        if (selectedCanvas?.documentCtx) {
            if (userContext?.userId) {
                if (func) {
                    setBanner('데이터 수집중...')
                    const list = await Api.pmdc.getPMDCUserList(userContext.userId, selectedCanvas.documentCtx, func)
                    // const master = pmdcEquipments.filter((f: any) => f.FUNCTION === func);
                    const master = await Api.pmdc.getPMDCEquipments(selectedCanvas.documentCtx, func)
                    console.log('user:', list, ' master:', master)
                    setDisplayList({
                        func: func,
                        user: list,
                        master: master,
                    })
                    setOpen({ ...open, display: true })
                    setBanner(undefined)
                } else {
                    setDisplayList({ func: '', user: [], master: [] })
                    setOpen({ display: false, setting: false })
                }
            }
        }
    }

    const getPMDCMasterList = async (func: string) => {
        if (selectedCanvas?.documentCtx) {
            if (userContext?.userId) {
                if (func) {
                    setBanner('데이터 수집중...')
                    const list = await Api.pmdc.getPMDCEquipments(selectedCanvas.documentCtx, func)
                    console.log('masterList:', list)
                    const handle = selPMDCEquipment[0].handles[0].handle
                    setSettingList({
                        func: func,
                        handle: handle,
                        docid: selectedCanvas.documentCtx.docId,
                        docver: selectedCanvas.documentCtx.docVer,
                        docnumber: selectedCanvas.documentCtx.docNumber,
                        plantcode: selectedCanvas.documentCtx.plantCode,
                        master: list,
                    })
                    setOpen({ ...open, setting: true })
                    setBanner(undefined)
                } else {
                    setSettingList({ func: '', master: [] })
                }
            }
        }
    }

    const getPMDCSearchList = async (searchText: string, sourcePos: string): Promise<any> => {
        if (selectedCanvas?.documentCtx) {
            if (userContext?.userId) {
                if (searchText) {
                    setBanner('데이터 수집중...')
                    const list = await Api.pmdc.getPMDCSearchList(searchText, sourcePos)
                    console.log('PMDCSearchList:', list)
                    setBanner(undefined)
                    return list
                }
                return []
            }
        }
    }

    useEffect(() => {
        getPMDCUserList(selPMDCEquipment[0]?.function ?? '')
    }, [selPMDCEquipment])

    useEffect(() => {
        if (open.display) {
            const master = pmdcEquipments.filter((f: any) => f.FUNCTION === displayList.func)
            setDisplayList({ ...displayList, master: master })
        }
        if (pmdcEquipments.length === 0) {
            setSelPMDCEquipment([])
            setOpen({ display: false, setting: false })
        }
    }, [pmdcEquipments])

    useEffect(() => {
        setOpen({ display: false, setting: false })
    }, [selectedCanvas?.documentCtx])

    return (
        <>
            {open.display && (
                <div className="PMDCListView">
                    <div className="PMDCListContainer">
                        <div className="Titlebar">
                            <div className="Text">{'PMDC 표시 설정(' + displayList.func + ')'}</div>
                        </div>
                        {open.display && (
                            <PMDCList
                                list={displayList}
                                listType="display"
                                getPMDCUserList={getPMDCUserList}
                                getPMDCMasterList={getPMDCMasterList}
                                getPMDCSearchList={getPMDCSearchList}
                                viewer={viewer}
                                open={open}
                                setOpen={setOpen}
                                getPMDCUserListPopup={getPMDCUserListPopup}
                            />
                        )}
                    </div>
                </div>
            )}
            {open.setting && (
                <div
                    className="PMDCListView"
                    style={{
                        left: 'calc(((100% - 800px) / 2) + 60px)',
                        top: 'calc(((100% - 400px) / 2) + 90px)',
                        position: 'absolute',
                    }}
                >
                    <div className="PMDCListContainer">
                        <div className="Titlebar">
                            <div className="Text">{'PMDC 연동 설정(' + settingList.func + ')'}</div>
                        </div>
                        {open.setting > 0 && (
                            <PMDCList
                                list={settingList}
                                listType="setting"
                                getPMDCUserList={getPMDCUserList}
                                getPMDCMasterList={getPMDCMasterList}
                                getPMDCSearchList={getPMDCSearchList}
                                veiwer={viewer}
                                open={open}
                                setOpen={setOpen}
                                getPMDCUserListPopup={getPMDCUserListPopup}
                                searchText={searchText}
                                setSearchText={setSearchText}
                                searchType={searchType}
                                setSearchType={setSearchType}
                                searchUnit={searchUnit}
                                setSearchUnit={setSearchUnit}
                                searchDesc={searchDesc}
                                setSearchDesc={setSearchDesc}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

const CancelIcon = () => {
    return (
        <span>
            <span
                style={{
                    width: '20px',
                    height: '22px',
                    borderRadius: '100%',
                    backgroundColor: 'red',
                    color: 'white',
                    fontSize: '15px',
                }}
            >
                &nbsp;-&nbsp;
            </span>
        </span>
    )
}

function PMDCList({
    list,
    listType,
    getPMDCMasterList,
    getPMDCUserList,
    getPMDCSearchList,
    viewer,
    open,
    setOpen,
    getPMDCUserListPopup,
    searchText,
    setSearchText,
    searchType,
    setSearchType,
    searchUnit,
    setSearchUnit,
    searchDesc,
    setSearchDesc,
}: any) {
    const [userList, setUserList] = useState<any>(list.user)
    const [masterList, setMasterList] = useState<any>(list.master)
    const [sourcePos, setSourcePos] = useState<string>('all')
    const [searchList, setSearchList] = useState<any>([])
    const [sourceInfo, setSourceInfo] = useState<any>([])
    const [originPmList, setOriginPmList] = useState<string[]>([])
    const [pmList, setPmList] = useState<string[]>([])
    const [addPmList, setAddPmList] = useState<string[]>([])
    const [subPmList, setSubPmList] = useState<string[]>([])

    const userContext = useRecoilValue(AppStore.userContext)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)
    const isShowPm = useRecoilValue(PMDCStore.isShowPm)

    const [pmdcEquipments, setPMDCEquipments] = useRecoilState(PMDCStore.pmdcEquipments)

    const okPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)
    const setSelPMDCEquipment = useSetRecoilState(PMDCStore.selPMDCEquipment)
    const setIsPMDCChanged = useSetRecoilState(PMDCStore.isPMDCChanged)
    const setBanner = useSetRecoilState(StatusStore.banner)

    useEffect(() => {
        if (listType === 'display') {
            const pmList = masterList.map((item: any) => {
                if (item.ISPM === 1) return item.ID
            })
            setPmList(pmList)
            setOriginPmList(pmList)
            setMasterList(list.master)
        }
    }, [list])

    useEffect(() => {
        const getPMDCSourcePos = async () => {
            // setBanner('사업소 정보 수집중...')
            const sourceInfo = await Api.pmdc.getPMDCSourcePos()
            setBanner(undefined)
            const selInfo = dsInfo.filter((f: any) => f.plantCode === selectedCanvas?.documentCtx.plantCode)
            const lastInfo = sourceInfo.Items.filter((f: any) => f.Name === selInfo[0].id)
            setSourcePos(lastInfo[0].WebId)
        }
        if (listType === 'setting') getPMDCSourcePos()
    }, [])

    const getItems = (search?: any): JSX.Element[] => {
        const result: JSX.Element[] = []
        let idx = 0
        if (!search) {
            for (const row of masterList) {
                listType === 'display'
                    ? result.push(
                          <tr key={idx} className="HovableItem">
                              <td
                                  className="Item"
                                  onClick={() => {
                                      if (userList.some((f: any) => f.ID === row.ID)) {
                                          setUserList(userList.filter((f: any) => f.ID !== row.ID))
                                          setIsPMDCChanged(true)
                                      } else {
                                          const entity = getEntities(viewer, [row.HANDLE])
                                          const position = entity[0].openObjectAsInsert().getPosition()
                                          position.pop()
                                          const temp = {
                                              ID: row.ID,
                                              MEMO: '',
                                              POSITION: JSON.stringify(position),
                                              USERID: userContext?.userId,
                                          }
                                          setUserList([...userList, temp])
                                          setIsPMDCChanged(true)
                                      }
                                  }}
                              >
                                  &nbsp;{userList.some((f: any) => f.ID === row.ID) ? onImg : offImg}&nbsp;
                              </td>
                              <td className="Item"> &nbsp;{row.NAME_KEY}&nbsp; </td>
                              <td className="Item"> &nbsp;{row.DESCRIPTION}&nbsp; </td>
                              <td className="Item"> &nbsp;{row.POINTTYPE}&nbsp; </td>
                              <td className="Item"> &nbsp;{row.ENGUNITS}&nbsp; </td>
                              {isShowPm && (
                                  <td
                                      className="Item"
                                      onClick={() => {
                                          if (pmList.includes(row.ID)) {
                                              setPmList(pmList.filter((item) => item !== row.ID))
                                              setAddPmList(addPmList.filter((item) => item !== row.ID))
                                              setSubPmList([...subPmList, row.ID])
                                          } else {
                                              setPmList([...pmList, row.ID])
                                              setAddPmList([...addPmList, row.ID])
                                              setSubPmList(subPmList.filter((item) => item !== row.ID))
                                          }
                                      }}
                                  >
                                      &nbsp;{pmList.some((item) => row.ID === item) ? onImg : offImg}&nbsp;
                                  </td>
                              )}
                          </tr>
                      )
                    : result.push(
                          <tr key={idx} className="RowItem">
                              <td className="Item"> &nbsp;{row.NAME_KEY}&nbsp; </td>
                              <td
                                  className="HovableItem"
                                  onClick={() => {
                                      const confirmValue = {
                                          message: `해당 태그를 제거하시겠습니까?\n해당제거는 모든 사용자들에게 영항을 줍니다`,
                                          yes: async () => {
                                              setMasterList(masterList.filter((f: any) => f.NAME_KEY !== row.NAME_KEY))
                                              setIsPMDCChanged(true)
                                          },
                                          no: () => {},
                                      }
                                      setYesNoPopupValue(confirmValue)
                                  }}
                              >
                                  {' '}
                                  &nbsp;
                                  <CancelIcon />
                                  &nbsp;{' '}
                              </td>
                          </tr>
                      )

                idx++
            }
        } else {
            for (const row of search) {
                result.push(
                    <tr
                        key={idx}
                        className="RowItem"
                        onClick={() => {
                            console.log('info:', masterList, row.Name)
                            if (!masterList.some((f: any) => f.NAME_KEY === row.Name)) {
                                const confirmValue = {
                                    message: '해당 태그를 이 설비에 추가하시겠습니까?',
                                    yes: async () => {
                                        const now = new Date().getTime()
                                        setMasterList([
                                            ...masterList,
                                            {
                                                ID: now + '-' + row.Name,
                                                NAME_KEY: row.Name,
                                                HANDLE: list.handle,
                                                FUNCTION: list.func,
                                                MEMO: '',
                                                REG_DT: now,
                                                DOCID: list.docid,
                                                DOCVR: list.docver,
                                                DESCRIPTION: row.Descriptor,
                                                POINTSOURCE: row.PointClass,
                                                DIGITALSET: row.DigitalSetName,
                                                DISPLAYDIGITS: row.DisplayDigits.toString(),
                                                ENGUNITS: row.EngineeringUnits,
                                                POINTTYPE: row.PointType,
                                                WEBID: row.WebId,
                                            },
                                        ])
                                        setIsPMDCChanged(true)
                                    },
                                    no: () => {},
                                }
                                setYesNoPopupValue(confirmValue)
                            } else {
                                okPopupValue({ message: '이미 해당 설비에 추가된 태그입니다.', ok: () => {} })
                            }
                        }}
                    >
                        <td className="Item" style={{ width: '140px', maxWidth: '140px' }}>
                            {' '}
                            &nbsp;{row.Name}&nbsp;{' '}
                        </td>
                        <td className="Item" style={{ width: '200px', maxWidth: '200px' }}>
                            {' '}
                            &nbsp;{row.Descriptor}&nbsp;{' '}
                        </td>
                        {/* <td className="Item"> &nbsp;{row.POINTSOURCE}&nbsp; </td> */}
                        <td className="Item" style={{ width: '70px', maxWidth: '70px' }}>
                            {' '}
                            &nbsp;{row.PointType}&nbsp;{' '}
                        </td>
                        <td className="Item" style={{ width: '50px', maxWidth: '50px' }}>
                            {' '}
                            &nbsp;{row.EngineeringUnits}&nbsp;{' '}
                        </td>
                    </tr>
                )
                idx++
            }
        }

        return result
    }

    const onClose = async () => {
        if (listType === 'display') {
            const common = userList.filter((f: any) => list.user.some((g: any) => g.id === f.id))
            if (common.length !== list.user.length) {
                const confirmValue = {
                    message: '변경된 설정을 저장하지 않고 나가시겠습니까?',
                    yes: async () => {
                        setSelPMDCEquipment([])
                        setOpen({ ...open, display: false })
                        await getPMDCUserListPopup()
                        setIsPMDCChanged(false)
                    },
                    no: () => {},
                }
                setYesNoPopupValue(confirmValue)
            } else {
                setSelPMDCEquipment([])
                setOpen({ ...open, display: false })
                await getPMDCUserListPopup()
                setIsPMDCChanged(false)
            }
        } else if (listType === 'setting') {
            getPMDCMasterList('')
            setOpen({ ...open, setting: false })
            setIsPMDCChanged(false)
        }
    }

    const onAddTag = async () => {
        console.log('func:', list.func)
        await getPMDCMasterList(list.func)
        // await getPMDCUserList('');
    }

    const onSave = async () => {
        if (listType === 'display') {
            const confirmValue = {
                message: '변경된 설정을 저장시겠습니까?',
                yes: async () => {
                    const common = userList.filter((f: any) => list.user.includes(f))
                    const add = userList.filter((f: any) => !common.includes(f))
                    const sub = list.user.filter((f: any) => !common.includes(f))
                    const value = { add: add, sub: sub }
                    const add2 = addPmList.filter((item) => !originPmList.includes(item))
                    const updatePm = { add: add2, sub: subPmList }
                    console.log(updatePm)
                    console.log('value:', value)
                    if (add.length > 0 || sub.length > 0) await Api.pmdc.updatePMDCUserList(value)
                    if ((add2.length > 0 || subPmList.length > 0) && isShowPm) {
                        await Api.pmdc.updatePMDCIspm(updatePm)
                    }
                    setSelPMDCEquipment([])
                    setOpen({ ...open, display: false })
                    await getPMDCUserListPopup()
                    setIsPMDCChanged(false)
                },
                no: () => {},
            }
            setYesNoPopupValue(confirmValue)
        } else {
            const confirmValue = {
                message: '변경된 설정을 저장시겠습니까?',
                yes: async () => {
                    const common = masterList.filter((f: any) => list.master.includes(f))
                    const add = masterList.filter((f: any) => !common.includes(f))
                    const sub = list.master.filter((f: any) => !common.includes(f))
                    const value = { add: add, sub: sub }
                    console.log('value:', value)
                    await Api.pmdc.updatePMDCMasterList(value)
                    await getPMDCMasterList('')
                    let currentPMDCEquipments = JSON.parse(JSON.stringify(pmdcEquipments))
                    currentPMDCEquipments = [...currentPMDCEquipments, ...add]
                    if (sub.length > 0)
                        currentPMDCEquipments = currentPMDCEquipments.filter((f: any) => !sub.some((g: any) => g.ID === f.ID))
                    console.log('currentPMDCEquipments:', currentPMDCEquipments, add, sub)
                    setPMDCEquipments(currentPMDCEquipments)
                    setOpen({ ...open, setting: false })
                    await getPMDCUserListPopup()
                    setIsPMDCChanged(false)
                },
                no: () => {},
            }
            setYesNoPopupValue(confirmValue)
        }
    }

    const onChangeSourcePos = async (e: any) => {
        console.log('select:', e.target.value)
        setSourcePos(e.target.value)
    }

    const onSearchClick = async () => {
        if (searchText) {
            if (searchText.includes("*") && searchText.replace(/\*/g, "").length < 3) {
                okPopupValue({
                    message: `'*' 검색시 3자 이상 검색어를 입력해주세요`,
                    ok: () => {
                        return
                    },
                })
                return; 
            }
        }
        let result = await getPMDCSearchList(searchText, sourcePos)
        console.log("result:", result);
        if (searchType) {
            result = result.filter((v: any) => new RegExp('^' + searchType.toLowerCase().replace(/\*/g, '.*') + '$').test(v.PointType.toLowerCase()));
        }
        if (searchUnit) {
            result = result.filter((v: any) => new RegExp('^' + searchUnit.toLowerCase().replace(/\*/g, '.*') + '$').test(v.EngineeringUnits.toLowerCase()));
        }
        if (searchDesc) {
            result = result.filter((v: any) => new RegExp('^' + searchDesc.toLowerCase().replace(/\*/g, '.*') + '$').test(v.Descriptor.toLowerCase()));
        }
        setSearchList(result)
    }

    return (
        <div className="ListView">
            <div>
                {listType === 'display' && (
                    <div className="Display">
                        <table style={{ width: '100%' }}>
                            <thead className="Header">
                                <tr>
                                    <th className="Item">활성화</th>
                                    <th className="Item">태그</th>
                                    <th className="Item">설명</th>
                                    <th className="Item">타입</th>
                                    <th className="Item">단위</th>
                                    {isShowPm && <th className="Item">예지보전</th>}
                                </tr>
                            </thead>
                            <tbody>{getItems()}</tbody>
                        </table>
                    </div>
                )}
                {listType === 'setting' && (
                    <div className="Setting">
                        <div className="PMDCMaster">
                            <table>
                                <thead className="Header">
                                    <tr>
                                        <th className="Item">태그</th>
                                        <th className="Item">해제</th>
                                    </tr>
                                </thead>
                                <tbody>{getItems()}</tbody>
                            </table>
                        </div>
                        <div className="PMDCSearch">
                            <div className="SearchBar">
                                <div>
                                    <input
                                        className="SearchText"
                                        type="text"
                                        placeholder="태그"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') onSearchClick()
                                        }}
                                    />
                                    <input
                                        className="SearchText"
                                        type="text"
                                        placeholder="타입"
                                        value={searchType}
                                        onChange={(e) => setSearchType(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') onSearchClick()
                                        }}
                                    />
                                    <input
                                        className="SearchText"
                                        type="text"
                                        placeholder="단위"
                                        value={searchUnit}
                                        onChange={(e) => setSearchUnit(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') onSearchClick()
                                        }}
                                    />
                                </div>

                                <div>
                                    <input
                                        className="SearchText"
                                        type="text"
                                        placeholder="설명"
                                        value={searchDesc}
                                        onChange={(e) => setSearchDesc(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') onSearchClick()
                                        }}
                                    />
                                    <div className="SearchButton" onClick={onSearchClick}>
                                        검색
                                    </div>
                                </div>
                            </div>
                            <div className="SearchResult">
                                <table style={{ width: '100%' }}>
                                    <thead className="Header">
                                        {listType === 'setting' && (
                                            <tr>
                                                <th className="Item">태그</th>
                                                <th className="Item">설명</th>
                                                {/* <th className="Item">소스위치</th> */}
                                                <th className="Item">타입</th>
                                                <th className="Item">단위</th>
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody>{getItems(searchList)}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="Footer">
                {listType === 'display' && (
                    <div className="Button" onClick={onAddTag}>
                        <div className="Text">태그추가</div>
                    </div>
                )}
                <div className="Button" onClick={onSave}>
                    <div className="Text">저장</div>
                </div>
                <div className="Button" onClick={onClose}>
                    <div className="Text">닫기</div>
                </div>
            </div>
        </div>
    )
}
