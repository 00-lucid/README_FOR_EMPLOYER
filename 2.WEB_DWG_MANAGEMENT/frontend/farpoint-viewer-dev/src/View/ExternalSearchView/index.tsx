import React, { useEffect } from 'react'
import './ExternalSearchView.css'
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil'
import { useSearchParams } from 'react-router-dom'
// Component
import { CheckBox } from '../CommonView/Icon'
import SelectSearch from '../CommonView/Search/SelectSearch'
import SearchTextField from '../CommonView/Search/SearchTextField'
// Api
import Api from '../../Api'
// 전역 Store
import ThemeStore from '../../Store/ThemeStore'
import { StatusStore } from '../../Store/statusStore'
// Lib
import cn from 'classnames'

const createHost = require('cross-domain-storage/host')

const getKeyString = (docResult: DocumentResult): string => {
    return `${docResult.docId}_${docResult.docVer}_${docResult.hogi}`
}

const SearchListView = ({ searchList, docMap, setDocMap }: SearchListViewProps) => {
    const mapDocFromName = useRecoilValue(StatusStore.mapDocPathName)

    const onCheckBoxClick = React.useCallback(
        (key: string, search: DocumentResult) => {
            const newMap = new Map(docMap)
            if (newMap.has(key)) {
                newMap.delete(key)
            } else {
                newMap.set(key, search)
            }
            setDocMap(newMap)
        },
        [docMap, setDocMap]
    )

    return (
        <tbody>
            {searchList.map((search: DocumentResult) => {
                const pathName = mapDocFromName.get(search.folderId)
                const key = getKeyString(search)
                return (
                    <tr className="RowItem" key={key}>
                        <td
                            className="Item"
                            onClick={(e) => {
                                e.stopPropagation()
                                onCheckBoxClick(key, search)
                            }}
                        >
                            {docMap.has(key) ? CheckBox.onImg : CheckBox.offImg}
                        </td>
                        <td className="Item" title={search.docName}>
                            {search.docName}
                        </td>
                        <td className="Item" title={search.docNumber}>
                            {search.docNumber}
                        </td>
                        <td className="Item" title={pathName ? pathName : search.plantCode}>
                            {pathName ? pathName : search.plantCode}{' '}
                        </td>
                        <td className="Item"> {search.hogi === '0' ? '공용' : search.hogi} </td>
                    </tr>
                )
            })}
        </tbody>
    )
}

const ExternalSearchView = () => {
    // cross-domain-storage 설정
    createHost([
        {
            origin: process.env.REACT_APP_URL_LOCAL,
            allowedMethods: ['get', 'set', 'remove'],
        },
        {
            origin: 'http://shms.kospo.co.kr:7040/',
            allowedMethods: ['get'],
        },
    ])

    // 전역 Stroe
    const theme = useRecoilValue(ThemeStore.theme)
    // State
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)
    const setYesNoPopupValue = useSetRecoilState(StatusStore.yesNoPopupValue)
    const [searchTypeValue, setSearchTypeValue] = React.useState('docName')
    const [searchValue, setSearchValue] = React.useState('')
    const [searchList, setSearchList] = React.useState<DocumentResult[]>([])
    const setBanner = useSetRecoilState(StatusStore.banner)
    const setTheme = useSetRecoilState(ThemeStore.theme)
    const toggleTheme = useRecoilValue(ThemeStore.toggleTheme)

    const mapFolderList = useRecoilValue(StatusStore.mapFolderList)

    const companyItems = useRecoilValue(StatusStore.companyItems)
    const [plantItems, setPlantItems] = useRecoilState(StatusStore.plantItems)
    const [hogiItems, setHogiItems] = useRecoilState(StatusStore.hogiItems)

    const [companyValue, setCompanyValue] = useRecoilState(StatusStore.companyValue)
    const [plantValue, setPlantValue] = useRecoilState(StatusStore.plantValue)
    const [hogiValue, setHogiValue] = useRecoilState(StatusStore.hogiValue)

    // 선택한 도면목록
    const [searchSelectedDocMap, setSearchSelectedDocMap] = React.useState<Map<string, DocumentResult>>(new Map<string, DocumentResult>())
    const [addedSelectedDocMap, setAddedSelectedDocMap] = React.useState<Map<string, DocumentResult>>(new Map<string, DocumentResult>())
    // 추가된 도면목록
    const [addedDocMap, setAddedDocMap] = React.useState<Map<string, DocumentResult>>(new Map<string, DocumentResult>())

    const controlItems = React.useRef([
        { value: 'docName', text: '도면명' },
        { value: 'docNumber', text: '도면번호' },
    ])

    // URL 파라미터 조회
    const [searchParams] = useSearchParams()
    const plantCode = searchParams.get('plantCode')

    // 사업소 셀렉트 변경 이벤트
    const companyValueChange = React.useCallback(
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

    // 발전소 셀렉트 변경 이벤트
    const plantValueChange = React.useCallback(
        async (item: SelectItem) => {
            setPlantValue(item)

            const newHogiItems = mapFolderList.get(item.value)
            setHogiValue(undefined)
            if (newHogiItems) {
                setHogiItems(newHogiItems)
            }
        },
        [setPlantValue, setHogiItems, mapFolderList, setHogiValue]
    )
    // 호기 셀렉트 변경 이벤트
    const hogiValueChange = React.useCallback(
        (item: SelectItem) => {
            setHogiValue(item)
        },
        [setHogiValue]
    )

    const searchTypeChange = (item: SelectItem) => {
        const { value } = item
        setSearchTypeValue(value)
    }
    const searchValueChange = (value: string) => {
        setSearchValue(value)
    }

    // 초기 셋팅
    useEffect(() => {
        // 검색은 Default DarkTheme으로 변경 - Banner Text Color가 겹치기 때문에
        if (theme.type === 'light') setTheme(toggleTheme)
    }, [])
    useEffect(() => {
        if (mapFolderList.size > 0) {
            // 검색 필터 초기 셋팅
            const setFilterByPlantCode = async (plantCode: string) => {
                const res = await Api.document.getFolderIdsByPlantCode(plantCode)
                for (let i = 0; i < res.length; i++) {
                    if (i === 0) {
                        companyValueChange(res[i])
                    } else if (i === 1) {
                        plantValueChange(res[i])
                    }
                }
            }
            if (plantCode) {
                setFilterByPlantCode(plantCode)
            }
        }
    }, [mapFolderList])

    // 검색 실행
    const onSearchClick = async () => {
        if (searchValue.trim().length === 0) {
            setOkPopupValue({ message: '검색어를 입력해주세요.', ok: () => {} })
            return
        }

        let folderId: string | undefined = undefined
        if (hogiValue && 0 < hogiValue.value.length) {
            folderId = hogiValue.value
        } else if (plantValue && 0 < plantValue.value.length) {
            folderId = plantValue.value
        } else if (companyValue && 0 < companyValue.value.length) {
            folderId = companyValue.value
        }

        setBanner(`도면 검색 중...`)

        const results = await Api.document.searchDocument(
            folderId,
            searchTypeValue === 'docName' ? searchValue : undefined,
            searchTypeValue === 'docNumber' ? searchValue : undefined,
            '100'
        )
        setSearchList(results.data)
        if (results.data.length === 0) {
            setOkPopupValue({ message: '검색 결과가 없습니다.', ok: () => {} })
        }
        setBanner(undefined)
    }

    // 전체 체크박스 클릭
    const onTotalCheckBoxClick = React.useCallback(
        (
            targetDocList: DocumentResult[],
            docMap: Map<string, DocumentResult>,
            setDocMap: (value: React.SetStateAction<Map<string, DocumentResult>>) => void
        ) => {
            if (docMap.size === targetDocList.length) {
                setDocMap(new Map<string, DocumentResult>())
            } else {
                const newMap = new Map<string, DocumentResult>()

                for (const search of targetDocList) {
                    newMap.set(getKeyString(search), search)
                }
                setDocMap(newMap)
            }
        },
        []
    )

    // 도면 추가
    const docAddBtnClick = React.useCallback(() => {
        const newAddedDocMap = new Map(addedDocMap)
        let isDuplicated = false
        for (const docKey of Array.from(searchSelectedDocMap.keys())) {
            if (!newAddedDocMap.has(docKey)) {
                const docResult = searchSelectedDocMap.get(docKey)
                if (docResult) newAddedDocMap.set(docKey, docResult)
            } else {
                isDuplicated = true
            }
        }
        if (isDuplicated) setOkPopupValue({ message: '같은 도면은 중복 추가되지 않습니다.', ok: () => {} })

        setAddedDocMap(newAddedDocMap)
        setSearchSelectedDocMap(new Map())
    }, [addedDocMap, setAddedDocMap, searchSelectedDocMap, setOkPopupValue])

    // 선택된 도면 삭제 클릭
    const onDeleteClick = React.useCallback(() => {
        const newAddedDocMap = new Map(addedDocMap)
        for (const key of Array.from(addedSelectedDocMap.keys())) {
            newAddedDocMap.delete(key)
        }
        setAddedDocMap(newAddedDocMap)
        setAddedSelectedDocMap(new Map())
    }, [addedDocMap, addedSelectedDocMap])

    const onSaveClick = React.useCallback(
        (docMap: Map<string, DocumentResult>) => {
            const confirmValue = {
                message: '추가된 도면목록을 저장하시겠습니까?',
                yes: () => {
                    const value = Array.from(docMap.values()).map((doc) => {
                        const { docId, docName, docNumber, docVer } = doc
                        return { docId, docName, docNumber, docVer }
                    })
                    localStorage.setItem('epnidSearchDocInfo', JSON.stringify(value))
                    setAddedDocMap(new Map())
                    setAddedSelectedDocMap(new Map())
                },
                no: () => {},
                nextAction: () => {},
            }
            setYesNoPopupValue(confirmValue)
        },
        [setYesNoPopupValue]
    )
    return (
        <div className={cn('ExternalSearchViewBackGround', 'LightTheme')}>
            <div className={cn('ExternalSearchView')}>
                <div className={cn('Titlebar')}>
                    <div className={cn('Text')}>전산화 도면 검색</div>
                </div>

                <div className="SearchBar">
                    <SelectSearch
                        id="CompanyControl"
                        items={companyItems}
                        placeHolder="본부"
                        value={companyValue?.value}
                        onChange={companyValueChange}
                    />

                    <SelectSearch
                        id="PlantControl"
                        items={plantItems}
                        placeHolder="발전소"
                        value={plantValue?.value}
                        onChange={plantValueChange}
                    />

                    <SelectSearch
                        id="HogiControl"
                        items={hogiItems}
                        placeHolder="호기"
                        value={hogiValue?.value}
                        onChange={hogiValueChange}
                    />

                    <SelectSearch
                        id="SymbolControl"
                        items={controlItems.current}
                        placeHolder="검색필터"
                        value={searchTypeValue}
                        onChange={searchTypeChange}
                    />

                    <SearchTextField
                        id="TagControl"
                        value={searchValue}
                        placeHolder="검색어"
                        onChange={searchValueChange}
                        onSearch={(e) => {
                            if (e.key === 'Enter') {
                                onSearchClick()
                            }
                        }}
                    />
                    <div className="SearchButton" onClick={onSearchClick}>
                        검색
                    </div>
                </div>

                <div className="SearchListTitle">검색결과</div>
                <div className={cn('ListView')}>
                    <table>
                        <thead className="Header">
                            <tr>
                                <th
                                    className="Total"
                                    onClick={() => {
                                        onTotalCheckBoxClick(searchList, searchSelectedDocMap, setSearchSelectedDocMap)
                                    }}
                                >
                                    {searchSelectedDocMap.size === searchList.length && searchSelectedDocMap.size !== 0
                                        ? CheckBox.onImg
                                        : CheckBox.offImg}
                                </th>
                                <th className="DocumentName">도면명</th>
                                <th className="DocumentNumber">도면번호</th>
                                <th className="Plant">사업소</th>
                                <th className="Hogi">호기</th>
                            </tr>
                        </thead>
                        {/* 검색 결과 리스트 뷰 */}
                        <SearchListView searchList={searchList} docMap={searchSelectedDocMap} setDocMap={setSearchSelectedDocMap} />
                    </table>
                </div>
                <div className="BtnGroup">
                    <div className={cn('AddButton', searchSelectedDocMap.size === 0 ? 'DisabledButton' : '')} onClick={docAddBtnClick}>
                        도면추가
                    </div>
                </div>

                <div className="SearchListTitle">저장할 도면목록</div>
                <div className={cn('ListView')}>
                    <table>
                        <thead className="Header">
                            <tr>
                                <th
                                    className="Total"
                                    onClick={() => {
                                        onTotalCheckBoxClick(Array.from(addedDocMap.values()), addedSelectedDocMap, setAddedSelectedDocMap)
                                    }}
                                >
                                    {addedSelectedDocMap.size === addedDocMap.size && addedSelectedDocMap.size !== 0
                                        ? CheckBox.onImg
                                        : CheckBox.offImg}
                                </th>
                                <th className="DocumentName">도면명</th>
                                <th className="DocumentNumber">작성자</th>
                                <th className="Date">개정일자</th>
                                <th className="Version">버전</th>
                            </tr>
                        </thead>

                        {/* 추가된 도면 리스트 뷰 */}
                        <SearchListView
                            searchList={Array.from(addedDocMap.values())}
                            docMap={addedSelectedDocMap}
                            setDocMap={setAddedSelectedDocMap}
                        />
                    </table>
                </div>

                <div className="BtnGroup">
                    <div
                        className={cn('SaveViewButton', addedDocMap.size === 0 ? 'DisabledButton' : '')}
                        onClick={() => onSaveClick(addedDocMap)}
                    >
                        저장
                    </div>
                    <div className={cn('DeleteButton', addedSelectedDocMap.size === 0 ? 'DisabledButton' : '')} onClick={onDeleteClick}>
                        선택 삭제
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExternalSearchView
