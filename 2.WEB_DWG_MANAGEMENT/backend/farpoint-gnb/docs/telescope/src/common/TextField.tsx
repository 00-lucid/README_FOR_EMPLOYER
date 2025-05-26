import React from 'react'
import './TextField.css'

type Props = {
    value: string
    placeHolder: string
    onChange: (value: string) => void
    id: string
}

export function TextField({ id, value, placeHolder, onChange }: Props) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value)
    }

    return (
        <div className="CommonComponent" id={id}>
            <div className={'TextField'}>
                <input
                    value={value}
                    type="text"
                    placeholder={placeHolder}
                    name="search"
                    onChange={handleChange}
                    autoComplete={'off'}
                />
            </div>
        </div>
    )
}
