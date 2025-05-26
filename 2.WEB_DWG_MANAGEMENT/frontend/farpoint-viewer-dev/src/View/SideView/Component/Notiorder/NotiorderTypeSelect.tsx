import './NotiorderTypeSelect.css'

type Props = {
    notiorderType: string
    setTypeValue: (value: string) => void
}

export function NotiorderTypeSelect({ notiorderType, setTypeValue }: Props) {
    return (
        <div className="NotiorderTypeSelect">
            <CheckBox
                id="full"
                label={'통지/오더'}
                isOn={'full' === notiorderType}
                onClickMenu={() => setTypeValue('full')}
            />
            <CheckBox
                id="nocomplete"
                label={'미결 통지/오더'}
                isOn={'nocomplete' === notiorderType}
                onClickMenu={() => setTypeValue('nocomplete')}
            />
        </div>
    )
}

type CheckBoxProps = {
    id: string
    label: string
    isOn: boolean
    onClickMenu: () => void
}

function CheckBox({ id, label, isOn, onClickMenu }: CheckBoxProps) {
    const on = (
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
                <path
                    d="M22 12.5a9.5 9.5 0 0 1-9.5 9.5A9.5 9.5 0 0 1 3 12.5 9.5 9.5 0 0 1 12.5 3a9.5 9.5 0 0 1 9.5 9.5"
                    stroke="var(--Background-Highlight)"
                    fill="#CDD4DF"
                />
                <path d="M17.5 12.5a5 5 0 1 1-10 0 5 5 0 0 1 10 0" fill="var(--Background-Highlight)" />
            </g>
        </svg>
    )

    const off = (
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M22 12.5a9.5 9.5 0 0 1-9.5 9.5A9.5 9.5 0 0 1 3 12.5 9.5 9.5 0 0 1 12.5 3a9.5 9.5 0 0 1 9.5 9.5"
                fill="#CDD4DF"
                stroke="#A3AEB9"
                fillRule="evenodd"
            />
        </svg>
    )

    return (
        <div className="CheckBox" id={id} onClick={() => onClickMenu()}>
            <div className={isOn ? 'Selected' : 'Normal'}>
                {isOn ? on : off}
                <span>{label}</span>
            </div>
        </div>
    )
}
