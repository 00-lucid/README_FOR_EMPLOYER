import React from 'react'
import './TextField.css'

type Props = {
    value: string
    placeHolder: string
    onChange: (value: string) => void
    id: string
    onKeyDown?: () => void
}

export function TextField({ id, value, placeHolder, onChange, onKeyDown = () => {} }: Props) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value)
    }

    const pressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') onKeyDown()
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
                    onKeyDown={pressEnter}
                    autoComplete={'off'}
                />
            </div>
        </div>
    )
}
