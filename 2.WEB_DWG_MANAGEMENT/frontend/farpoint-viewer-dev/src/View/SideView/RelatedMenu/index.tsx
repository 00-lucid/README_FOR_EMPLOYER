import React from 'react'
import './RelatedMenu.css'
import { useRecoilValue, useSetRecoilState } from 'recoil'

// 전역 Store
import { StatusStore } from '../../../Store/statusStore'
import commonActive from '../../../Controller/useCommonActive'
import AppStore from '../../../Store/appStore'
// Api
import Api from '../../../Api'
// Component
import { CloseSideMenuBtn } from '../Component/CloseSideMenuBtn'
import { TextField } from '../../CommonView/TextField'
import RelatedSearchView from '../Component/Related/RelatedSearchView'

// Controller
import SelectSecond from '../../CommonView/SelectSecond'

export function RelatedMenu() {
    // 전역 Store
    const setWarningPopupValue = useSetRecoilState(StatusStore.warningPopupValue)
    const currentMenu = useRecoilValue(StatusStore.currentMenu)
    const setCurrentMenu = useSetRecoilState(StatusStore.currentMenu)
    const setBanner = useSetRecoilState(StatusStore.banner)

    const userId = useRecoilValue(AppStore.userId)
    const [companyValue, setCompanyValue] = React.useState('')
    const [categoryValue, setCategoryValue] = React.useState('')
    const [typeValue, setTypeValue] = React.useState('')
    const [docNameValue, setDocNameValue] = React.useState('')
    const [docNumberValue, setDocNumberValue] = React.useState('')
    const [relatedSearchResults, setRelatedSearchResults] = React.useState<RelatedSearchResult[]>([])

    const onClear = () => {
        setCompanyValue('')
        setCategoryValue('')
        setTypeValue('')
        setDocNumberValue('')
        setDocNameValue('')

        setRelatedSearchResults([])

        setCompanyItems([])
        setCategoryItems([])
        setTypeItems([])
    }

    const onCloseView = () => {
        setRelatedSearchResults([])
    }

    React.useEffect(() => {
        async function fetchData() {
            const values = await Api.related.getRelatedRoot()
            setCompanyItems(values)
        }

        if (companyItems.length === 0) {
            fetchData()
        }
    })

    function getItems(items: RelatedFolder[]): SelectItem[] {
        const values: SelectItem[] = []

        if (0 < items.length) values.push({ value: '', text: '-전체-' })

        for (const item of items) {
            values.push({ value: item.VALUE, text: item.TEXT })
        }

        return values
    }

    const [companyItems, setCompanyItems] = React.useState<RelatedFolder[]>([])
    const getCompanyItems = (): SelectItem[] => {
        return getItems(companyItems)
    }

    const [categoryItems, setCategoryItems] = React.useState<RelatedFolder[]>([])
    const getCategoryItems = (): SelectItem[] => {
        return getItems(categoryItems)
    }

    const [typeItems, setTypeItems] = React.useState<RelatedFolder[]>([])
    const getTypeItems = (): SelectItem[] => {
        return getItems(typeItems)
    }

    const companyValueChange = async (value: string) => {
        setCategoryItems([])
        setCategoryValue('')
        setTypeItems([])
        setTypeValue('')

        setCompanyValue(value)

        if (0 < value.length) {
            const values = await Api.related.getRelatedFolders(value)
            setCategoryItems(values)
        }
    }
    const categoryValueChange = async (value: string) => {
        setTypeItems([])
        setTypeValue('')

        setCategoryValue(value)

        if (0 < value.length) {
            const values = await Api.related.getRelatedFolders(value)
            setTypeItems(values)
        }
    }

    const typeValueChange = async (value: string) => {
        setTypeValue(value)
    }

    const docNumberValueChange = (value: string) => {
        setDocNumberValue(value)
    }
    const docNameValueChange = (value: string) => {
        setDocNameValue(value)
    }
    const setOkPopupValue = useSetRecoilState(StatusStore.okPopupValue)

    const onSearchClick = async () => {
        let folders: string[] = []

        if (0 < typeValue.length) {
            folders.push(typeValue)
        } else if (0 < categoryValue.length) {
            folders.push(categoryValue)
        } else if (0 < companyValue.length) {
            folders.push(companyValue)
        }

        const searchActive = async () => {
            setBanner(`관련문서 검색 중...`)
            const docName = 0 < docNameValue.length ? docNameValue : undefined
            const docNumber = 0 < docNumberValue.length ? docNumberValue : undefined

            const results = await Api.related.searchRelated(folders, docName, docNumber)

            if (results.length === 0) {
                setOkPopupValue({ message: '검색 결과가 없습니다.', ok: () => {} })
            }

            setRelatedSearchResults(results)

            setBanner(undefined)
        }

        if (!companyValue || !categoryValue) {
            const confirmValue = {
                title: '검색',
                message: '검색량이 많아 다소 시간이 소요될 수 있습니다.',
                submessage: '검색을 진행하시겠습니까?',
                yes: searchActive,
                no: () => {},
            }
            setWarningPopupValue(confirmValue)
        } else {
            searchActive()
        }
    }

    const selectViewClosecase = (menuId: string) => {
        // const userId = useRecoilValue(AppStore.userId)
        // const setCurrentMenu = useSetRecoilState(StatusStore.currentMenu)
        if (0 < relatedSearchResults.length) {
            setRelatedSearchResults([])
        } else {
            commonActive.onMenuChange(menuId, userId, setCurrentMenu)
        }
    }

    function style(currentMenu: string) {
        return 'related' === currentMenu
            ? { transform: 'translateX(var(--SideMenuWidth))' }
            : { transform: 'translateX(calc(var(--RelatedMenuWidth) * -1 ))' }
    }

    return (
        <div className="RelatedMenu SideViewShadow" style={style(currentMenu)}>
            <RelatedSearchView hidden={'related' !== currentMenu} onCloseView={onCloseView} results={relatedSearchResults} />

            <div className="Background SideViewBackground" />
            <div className="VerticalLine" />

            <span className="SideMenuLabel">관련문서</span>

            <CloseSideMenuBtn />
            <div className="space"></div>

            <div className="ControlsView">
                <SelectSecond
                    id="CompanyControl"
                    items={getCompanyItems()}
                    placeHolder="사업소"
                    value={companyValue}
                    onChange={companyValueChange}
                />
                <SelectSecond
                    id="CategoryControl"
                    items={getCategoryItems()}
                    placeHolder="종류"
                    value={categoryValue}
                    onChange={categoryValueChange}
                />

                <SelectSecond id="TypeControl" items={getTypeItems()} placeHolder="유형" value={typeValue} onChange={typeValueChange} />
                <TextField id="DocNumberControl" value={docNumberValue} placeHolder="문서번호" onChange={docNumberValueChange} />
                <TextField id="DocNameControl" value={docNameValue} placeHolder="문서이름" onChange={docNameValueChange} />
            </div>
            <div className="ResetButton" onClick={onClear}>
                {resetImage()}
                <div>검색 초기화</div>
            </div>
            <div className="SearchButton" onClick={onSearchClick}>
                <div>검색</div>
            </div>
        </div>
    )
}

const resetImage = () => {
    return (
        <svg width="22" height="22">
            <path d="M18.677 6.827c.121.24.233.489.334.742l1.106-3.405a.452.452 0 1 1 .86.28l-1.14 3.503a1.4 1.4 0 0 1-.714.826 1.411 1.411 0 0 1-1.091.076l-3.486-1.192a.451.451 0 0 1-.281-.574.45.45 0 0 1 .574-.282l3.347 1.145a8.057 8.057 0 0 0-.317-.709c-1.973-3.89-6.745-5.453-10.632-3.477-3.89 1.972-5.45 6.742-3.477 10.632 1.973 3.891 6.744 5.453 10.632 3.478a7.905 7.905 0 0 0 1.349-.865.453.453 0 1 1 .564.709 8.92 8.92 0 0 1-1.503.963 8.763 8.763 0 0 1-3.973.952c-3.218 0-6.324-1.766-7.876-4.827-2.2-4.335-.461-9.65 3.874-11.85 4.335-2.199 9.65-.459 11.85 3.875zm-.132 7.21c.226.108.32.379.212.604a8.94 8.94 0 0 1-.926 1.515.455.455 0 0 1-.635.087.453.453 0 0 1-.087-.634 7.98 7.98 0 0 0 .833-1.36.451.451 0 0 1 .603-.212z" />
        </svg>
    )
}
