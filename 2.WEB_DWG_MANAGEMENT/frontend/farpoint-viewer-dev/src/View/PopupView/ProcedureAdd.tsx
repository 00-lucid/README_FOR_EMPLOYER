import { useEffect, useState, useCallback, Dispatch, SetStateAction, useRef } from 'react'
import { TextField } from '../CommonView/TextField'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { ProcedureStore, StatusStore } from '../../Store/statusStore'
import Select from '../CommonView/Select'
import Api from '../../Api'
import AppStore from '../../Store/appStore'
import ThemeStore from '../../Store/ThemeStore'

type Props = {
    addMode: boolean
    setAddMode: Dispatch<SetStateAction<boolean>>
}

const ProcedureAdd = ({ addMode, setAddMode }: Props) => {
    const [procedureName, setProcedureName] = useState('')
    const [procedureContent, setProcedureContent] = useState('')
    const [changeBtn, setChangeBtn] = useState('')
    const [docInfo, setDocInfo] = useState<any>({})
    const [PMDCInfo, setPMDCInfo] = useState<any>({})

    const [addPMDC, setAddPMDC] = useRecoilState(ProcedureStore.addPMDC)
    const [tempStep, setTempStep] = useRecoilState(ProcedureStore.tempStep)
    const [isStepFix, setIsStepFix] = useRecoilState(ProcedureStore.isStepFix)
    const [procedureSourceInfo, setProcedureSourceInfo] = useRecoilState(ProcedureStore.procedureSourceInfo)

    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)

    useEffect(() => {
        if (isStepFix) {
            setProcedureName(isStepFix.STPNM)
            setProcedureContent(isStepFix.STPDESC)
            let docObj = { ...docInfo }
            docObj.FUNCTION = isStepFix.FUNCTION
            docObj.DOCNO = isStepFix.DOCNO
            docObj.DOCNUMBER = isStepFix.DOCNUMBER
            docObj.DOCVR = isStepFix.DOCVR
            docObj.PLANTCODE = isStepFix.PLANTCODE
            setDocInfo(docObj)
            let PMDCObj = { ...PMDCInfo }
            PMDCObj.WEBID = isStepFix.WEBID
            PMDCObj.POINTTYPE = isStepFix.POINTTYPE
            PMDCObj.DIGITALSET = isStepFix.DIGITALSET
            PMDCObj.NAME_KEY = isStepFix.NAME_KEY
            PMDCObj.ENGUNITS = isStepFix.ENGUNITS
            PMDCObj.DESCRIPTOR = isStepFix.DESCRIPTOR
            setPMDCInfo(PMDCObj)
        }
    }, [])

    return (
        <>
            <div className="prcedure-add-container">
                <div className="procedure-add-header">{isStepFix ? '절차 수정' : '절차 추가'}</div>

                <div className="procedure-add-body">
                    <div className="procedure-add-title">
                        <div>순서</div>
                        <div>{isStepFix ? isStepFix.STPORDER : tempStep.length > 0 ? tempStep.length + 1 : 1}</div>
                        <div>절차제목</div>
                        <TextField
                            id="procedureName"
                            value={procedureName}
                            placeHolder="절차 제목"
                            onChange={(value: string) => {
                                setProcedureName(value)
                            }}
                        />
                    </div>

                    <div className="procedure-add-equip">
                        <div>대상 설비</div>
                        <div
                            onClick={() => {
                                setChangeBtn('equip')
                            }}
                        >
                            변경
                        </div>
                        {JSON.stringify(docInfo) !== '{}' && (
                            <div>
                                {docInfo?.FUNCTION} {`(도면번호 : ${docInfo.DOCNUMBER ? docInfo.DOCNUMBER : ''})`}
                            </div>
                        )}
                    </div>

                    {procedureSourceInfo !== '삼척' && procedureSourceInfo !== '부산' && (
                        <div className="procedure-add-pmdc">
                            <div>PMDC 매칭</div>
                            <div
                                onClick={() => {
                                    setChangeBtn('pmdc')
                                }}
                            >
                                변경
                            </div>
                            {JSON.stringify(PMDCInfo) !== '{}' && (
                                <div>
                                    {PMDCInfo?.NAME_KEY} {`(설명: ${PMDCInfo.DESCRIPTOR ? PMDCInfo.DESCRIPTOR : ''})`}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="procedure-add-content">
                        <div>작업 내용</div>
                        <div className="CommonComponent">
                            <textarea
                                id="procedureContent"
                                value={procedureContent}
                                placeholder="절차서 내용"
                                onChange={(e: any) => {
                                    setProcedureContent(e.target.value)
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="procedure-footer">
                    <div
                        className="procedure-footer-btn"
                        onClick={() => {
                            if (JSON.stringify(docInfo) === '{}') {
                                setOkPopupValue({
                                    message: '대상 설비를 고르세요',
                                    ok: () => {},
                                })
                                return
                            }
                            if (JSON.stringify(PMDCInfo) === '{}') {
                                if (procedureSourceInfo === '부산' || procedureSourceInfo === '삼척') {
                                } else {
                                    setOkPopupValue({
                                        message: 'PMDC를 매칭 하세요',
                                        ok: () => {},
                                    })
                                    return
                                }
                            }
                            if (!procedureContent || !procedureName) {
                                setOkPopupValue({
                                    message: '절차 제목이나 내용을 입력하세요',
                                    ok: () => {},
                                })
                                return
                            }
                            const obj: any = {
                                DOCNO: docInfo.DOCNO ?? '',
                                DOCNUMBER: docInfo.DOCNUMBER ?? '',
                                DOCVR: docInfo.DOCVR ?? '',
                                FUNCTION: docInfo.FUNCTION ?? '',
                                HANDLE: docInfo.HANDLE ?? '',
                                NAME_KEY: PMDCInfo.NAME_KEY ?? '',
                                PLANTCODE: docInfo.PLANTCODE ?? '',
                                WEBID: PMDCInfo.WEBID ?? '',
                                DIGITALSET: PMDCInfo.DIGITALSET ?? '',
                                POINTTYPE: PMDCInfo.POINTTYPE ?? '',
                                ENGUNITS: PMDCInfo.ENGUNITS ?? '',
                                DESCRIPTOR: PMDCInfo.DESCRIPTOR ?? '',
                                PROID: isStepFix ? isStepFix.PROID : tempStep[0]?.PROID ?? '',
                                STPDESC: procedureContent ?? '',
                                STPNM: procedureName ?? '',
                                STPORDER: isStepFix ? isStepFix.STPORDER : tempStep?.length + 1,
                            }
                            if (!isStepFix) {
                                setTempStep([...tempStep, obj])
                            } else {
                                let arr = tempStep.map((v: any) => {
                                    if (v.STPORDER === isStepFix.STPORDER) {
                                        v = { ...v, ...obj }
                                    }
                                    return v
                                })
                                console.log('콘솔 수정', arr)
                                setTempStep(arr)
                            }
                            setIsStepFix(undefined)
                            setAddMode(false)
                        }}
                    >
                        등록
                    </div>
                    <div
                        className="procedure-footer-btn"
                        onClick={() => {
                            setAddMode(false)
                            setIsStepFix(undefined)
                            setAddPMDC('')
                        }}
                    >
                        취소
                    </div>
                </div>
            </div>
            {changeBtn && (
                <AddEquipOrPMDC
                    changeBtn={changeBtn}
                    setChangeBtn={setChangeBtn}
                    docInfo={docInfo}
                    setDocInfo={setDocInfo}
                    PMDCinfo={PMDCInfo}
                    setPMDCInfo={setPMDCInfo}
                />
            )}
        </>
    )
}

type Props2 = {
    changeBtn: string
    setChangeBtn: Dispatch<SetStateAction<string>>
    docInfo: any
    setDocInfo: any
    PMDCinfo: any
    setPMDCInfo: any
}

const AddEquipOrPMDC = ({ changeBtn, setChangeBtn, docInfo, setDocInfo, PMDCinfo, setPMDCInfo }: Props2) => {
    const theme = useRecoilValue(ThemeStore.theme)
    const userContext = useRecoilValue(AppStore.userContext)
    const setWarningPopupValue = useSetRecoilState(StatusStore.warningPopupValue)
    const setBanner = useSetRecoilState(StatusStore.banner)
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    const selectedCanvas = useRecoilValue(StatusStore.selectedCanvas)

    // const [companyValue, setCompanyValue] = useRecoilState(StatusStore.companyValue)
    // const [plantValue, setPlantValue] = useRecoilState(StatusStore.plantValue)
    // const [hogiValue, setHogiValue] = useRecoilState(StatusStore.hogiValue)

    const [companyValue, setCompanyValue] = useState<any>()
    const [plantValue, setPlantValue] = useState<any>()
    const [hogiValue, setHogiValue] = useState<any>()

    const companyItems = useRecoilValue(StatusStore.companyItems)
    const [plantItems, setPlantItems] = useRecoilState(StatusStore.plantItems)
    const [hogiItems, setHogiItems] = useRecoilState(StatusStore.hogiItems)

    const mapFolderList = useRecoilValue(StatusStore.mapFolderList)
    const mapDocItemList = useRecoilValue(StatusStore.mapDocItemList)

    const [procedureSourceInfo, setProcedureSourceInfo] = useRecoilState(ProcedureStore.procedureSourceInfo)
    const [addPMDC, setAddPMDC] = useRecoilState(ProcedureStore.addPMDC)

    const [symbolItems, setSymbolItems] = useState<SymbolResult[]>([])
    const [symbolValue, setSymbolValue] = useState('')
    const [cntValue, setCntValue] = useState('100')
    const [tagValue, setTagValue] = useState('')
    const [docSearchResults, setDocSearchResults] = useState<DocumentResult[]>([])
    const [equipSearchResults, setEquipSearchResults] = useState<EquipmentResult[]>([])
    const [signalSearchResults, setSignalSearchResults] = useState<SearchSignalResult[]>([])
    const [sourcePos, setSourcePos] = useState<string>('all')
    const [searchFilter, setSearchFilter] = useState<string>('Name')
    const [sourceInfo, setSourceInfo] = useState<any>([])
    const [searchList, setSearchList] = useState<any>([])

    const [searchText, setSearchText] = useState<string>('')
    const [searchUnit, setSearchUnit] = useState<string>('')
    const [searchDesc, setSearchDesc] = useState<string>('')

    const dsInfo = [
        {
            id: 'HDPI',
            name: '하동',
            plantCode: '5100',
            webId: '',
        },
        {
            id: 'bspi',
            name: '부산',
            plantCode: '5100',
            webId: '',
        },
        {
            id: 'SICPI',
            name: '신인천',
            plantCode: '5200',
            webId: '',
        },
        {
            id: 'JJPI',
            name: '남제주',
            plantCode: '5700',
            webId: '',
        },
        {
            id: 'YWPI',
            name: '영월',
            plantCode: '5800',
            webId: '',
        },
        {
            id: 'ADPI',
            name: '안동',
            plantCode: '6000',
            webId: '',
        },
    ]

    const cntItems = useRef([
        { value: '100', text: '100' },
        { value: '200', text: '200' },
        { value: '300', text: '300' },
        { value: '500', text: '500' },
        { value: '1000', text: '1000' },
    ])

    const onSearchClick = async () => {
        let folderId: string | undefined = undefined
        console.log(hogiValue)
        if (hogiValue && 0 < hogiValue.value.length) {
            folderId = hogiValue.value
        } else if (plantValue && 0 < plantValue.value.length) {
            folderId = plantValue.value
        } else if (companyValue && 0 < companyValue.value.length) {
            folderId = companyValue.value
        }

        const searchActive = async () => {
            setBanner(`설비 검색 중...`)
            const symbol = 0 < symbolValue.length ? symbolValue : undefined
            const tag = 0 < tagValue.length ? tagValue : undefined
            const results = await Api.equipment.searchEquipment(folderId, symbol, tag, cntValue)
            if (results.data.length === 0) {
                setOkPopupValue({ message: '검색 결과가 없습니다.', ok: () => {} })
            }
            setEquipSearchResults(results.data)
            setDocSearchResults([])
            setSignalSearchResults([])
            setBanner(undefined)
        }

        const confirmValue = {
            title: '검색',
            message: '검색량이 많아 다소 시간이 소요될 수 있습니다.',
            submessage: '검색을 진행하시겠습니까?',
            yes: searchActive,
            no: () => {},
        }
        setWarningPopupValue(confirmValue)
    }

    const onPMDCSearchClick = async () => {
        let result = await getPMDCSearchList(searchText, sourcePos)
        if (searchUnit) {
            result = result.filter((v: any) =>
                new RegExp('^' + searchUnit.toLowerCase().replace(/\*/g, '.*') + '$').test(v.EngineeringUnits.toLowerCase())
            )
        }
        if (searchDesc) {
            result = result.filter((v: any) =>
                new RegExp('^' + searchDesc.toLowerCase().replace(/\*/g, '.*') + '$').test(v.Descriptor.toLowerCase())
            )
        }
        setSearchList(result)
    }

    const getPMDCSearchList = async (searchText: string, sourcePos: string): Promise<any> => {
        if (userContext?.userId) {
            if (searchText) {
                setBanner('데이터 수집중...')
                const list = await Api.pmdc.getPMDCSearchList(searchText, sourcePos)
                console.log('PMDCSearchList:', list)
                setBanner(undefined)
                return list
            }
        }
        return []
    }

    const getSymbolItems = (): SelectItem[] => {
        const values: SelectItem[] = []

        if (0 < symbolItems.length) values.push({ value: '', text: '-전체-' })

        for (const item of symbolItems) {
            values.push({ value: item.libId, text: item.libName })
        }

        return values
    }

    const companyValueChange = useCallback(
        (item: SelectItem) => {
            setCompanyValue(item)
            const newPlantItems = mapFolderList.get(item.value)
            if (newPlantItems) setPlantItems(newPlantItems)
            setHogiItems([])
            setHogiValue(undefined)
            setPlantValue(undefined)
        },
        [setCompanyValue, setHogiItems, setPlantItems, mapFolderList, setHogiValue, setPlantValue]
    )

    const plantValueChange = useCallback(
        async (item: SelectItem) => {
            setPlantValue(item)
            const newHogiItems = mapFolderList.get(item.value)
            setHogiValue(undefined)
            if (newHogiItems) {
                setHogiItems(newHogiItems)
                if (newHogiItems.length > 0) {
                    let newDocumentList: DocumentItem[] | undefined

                    const newFolderList = mapFolderList.get(newHogiItems[0].value)
                    if (newFolderList && newFolderList.length > 0) {
                        newDocumentList = mapDocItemList.get(newFolderList[0].value)
                    } else {
                        newDocumentList = mapDocItemList.get(newHogiItems[0].value)
                    }
                    if (newDocumentList && newDocumentList.length > 0) {
                        const plantCode = newDocumentList[0].plantCode
                        // 설비 조회
                        const results = await Api.equipment.getSymbolsByPlant(plantCode)
                        console.log('plantValueChange:inner:', newDocumentList, plantCode, results)
                        setSymbolItems(results)
                    }
                }
            }
            console.log('plantValueChange:', newHogiItems)
        },
        [setPlantValue, setHogiItems, mapFolderList, setHogiValue, mapDocItemList]
    )

    const hogiValueChange = useCallback(
        (item: SelectItem) => {
            setHogiValue(item)
        },
        [setHogiValue]
    )

    useEffect(() => {
        if (changeBtn === 'pmdc') {
            const getPMDCSourcePos = async () => {
                if (procedureSourceInfo) {
                    setBanner('사업소 정보 수집중...')
                    const sourceInfo = await Api.pmdc.getPMDCSourcePos()
                    console.log('사업소 정보', sourceInfo)
                    setBanner(undefined)
                    const ds = dsInfo.filter((v: any) => v.name === procedureSourceInfo)[0]
                    sourceInfo.Items.map(async (v: any) => {
                        if (ds.id === v.Name) setSourcePos(v.WebId)
                    })
                }
            }
            getPMDCSourcePos()
        }
    }, [])

    return (
        <>
            <div className="procedure-change-container">
                <div className="procedure-change-header">
                    {changeBtn === 'equip' ? '대상설비' : `PMDC센서 추가(${procedureSourceInfo})`}
                </div>

                <div className="procedure-change-body">
                    {changeBtn === 'equip' ? (
                        <>
                            <div className="procedure-change-select">
                                <Select
                                    id="CompanyControl"
                                    items={companyItems}
                                    placeHolder="본부"
                                    value={companyValue?.value}
                                    onChange={companyValueChange}
                                />
                                <Select
                                    id="PlantControl"
                                    items={plantItems}
                                    placeHolder="발전소"
                                    value={plantValue?.value}
                                    onChange={plantValueChange}
                                />
                                <Select
                                    id="HogiControl"
                                    items={hogiItems}
                                    placeHolder="호기"
                                    value={hogiValue?.value}
                                    onChange={hogiValueChange}
                                />
                            </div>

                            <div className="procedure-change-cnt">
                                <Select
                                    id="SymbolControl"
                                    items={getSymbolItems()}
                                    placeHolder="심볼"
                                    value={symbolValue}
                                    onChange={(item: SelectItem) => {
                                        const { value } = item
                                        setSymbolValue(value)
                                    }}
                                />
                                <div className="procedure-change-cnt-title">적중 수</div>
                                <Select
                                    id="cnt"
                                    items={cntItems.current}
                                    placeHolder="적중 수"
                                    value={cntValue}
                                    onChange={(item: SelectItem) => {
                                        const { value } = item
                                        setCntValue(value)
                                    }}
                                />
                            </div>

                            <div className="procedure-change-search">
                                <TextField
                                    id="tagName"
                                    value={tagValue}
                                    placeHolder="태그 이름"
                                    onChange={(value: string) => {
                                        setTagValue(value)
                                    }}
                                    onKeyDown={() => {
                                        onSearchClick()
                                    }}
                                />
                                <div className="procedure-change-search-btn" onClick={onSearchClick}>
                                    검색
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="procedure-change-pmdc-search">
                            <div>
                                <TextField
                                    id="searchText"
                                    value={searchText}
                                    placeHolder="태그(검색어 3자 이상 필수)"
                                    onChange={(value: string) => setSearchText(value)}
                                />
                                <TextField
                                    id="searchUnit"
                                    value={searchUnit}
                                    placeHolder="단위"
                                    onChange={(value: string) => setSearchUnit(value)}
                                />
                            </div>

                            <div>
                                <TextField
                                    id="searchDesc"
                                    value={searchDesc}
                                    placeHolder="설명"
                                    onChange={(value: string) => setSearchDesc(value)}
                                />
                                <div className="procedure-change-search" onClick={onPMDCSearchClick}>
                                    <div className="procedure-change-search-btn">검색</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div
                        className="procedure-table"
                        style={{
                            maxHeight: '400px',
                            overflowY: 'auto',
                        }}
                    >
                        {changeBtn === 'equip' ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>태그</th>
                                        <th>도면번호</th>
                                        <th>호기</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipSearchResults.length > 0 &&
                                        equipSearchResults.map((v: any, i: number) => {
                                            return (
                                                <tr
                                                    key={i}
                                                    className="addHover"
                                                    onClick={async () => {
                                                        const handle = await Api.procedure.getProcedureEquipHandle(v.function, v.docId)
                                                        const obj = {
                                                            DOCNO: v.docId,
                                                            DOCNUMBER: v.docNumber,
                                                            DOCVR: v.docVer,
                                                            PLANTCODE: v.plantCode,
                                                            FUNCTION: v.function,
                                                            HANDLE: handle.length > 0 ? handle[0].TAGHANDLE : '',
                                                        }
                                                        setDocInfo(obj)
                                                        setChangeBtn('')
                                                    }}
                                                >
                                                    <td>&nbsp;{v.function}&nbsp;</td>
                                                    <td>&nbsp;{v.docNumber}&nbsp;</td>
                                                    <td>&nbsp;{v.hogi === '0' ? '공용' : v.hogi}&nbsp;</td>
                                                </tr>
                                            )
                                        })}
                                </tbody>
                            </table>
                        ) : (
                            <table className="procedure-add-pmdc-table">
                                <thead>
                                    <tr>
                                        <th>태그</th>
                                        <th>설명</th>
                                        <th>타입</th>
                                        <th>단위</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchList.length > 0 &&
                                        searchList.map((v: any, i: any) => {
                                            return (
                                                <tr
                                                    key={i}
                                                    className="addHover"
                                                    onClick={() => {
                                                        const obj = {
                                                            WEBID: v.WebId,
                                                            POINTTYPE: v.PointType,
                                                            ENGUNITS: v.EngineeringUnits,
                                                            DIGITALSET: v.DigitalSetName,
                                                            NAME_KEY: v.Name,
                                                            DESCRIPTOR: v.Descriptor,
                                                        }
                                                        setPMDCInfo(obj)
                                                        setChangeBtn('')
                                                    }}
                                                >
                                                    <td>&nbsp;{v.Name}&nbsp;</td>
                                                    <td>&nbsp;{v.Descriptor}&nbsp;</td>
                                                    <td>&nbsp;{v.PointType}&nbsp;</td>
                                                    <td>&nbsp;{v.EngineeringUnits}&nbsp;</td>
                                                </tr>
                                            )
                                        })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="procedure-footer">
                    <div
                        className="procedure-footer-btn"
                        onClick={() => {
                            setChangeBtn('')
                        }}
                    >
                        닫기
                    </div>
                </div>
            </div>
        </>
    )
}
export default ProcedureAdd
