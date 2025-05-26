import { useRecoilValue } from "recoil"
import AppStore from "../../../../Store/appStore"

export function CloseResultView({ onMenuChange }: onMenuChange) {
    const userId = useRecoilValue(AppStore.userId)

    return (
        <svg className="CloseResultView" onClick={() => onMenuChange('', userId)}>
            <path d="M19.908 5.167a.5.5 0 0 1-.038.706L5.875 18.426c-.407.366-.676.82-.785 1.315H36.5a.5.5 0 0 1 0 1l-31.41.001c.11.494.379.949.785 1.313L19.87 34.61a.5.5 0 1 1-.668.744L5.207 22.8c-.704-.63-1.113-1.463-1.165-2.36a.498.498 0 0 1-.001-.396l-.005.198c0-.973.416-1.88 1.171-2.559L19.202 5.128a.498.498 0 0 1 .706.04z" />
        </svg>
    )
}