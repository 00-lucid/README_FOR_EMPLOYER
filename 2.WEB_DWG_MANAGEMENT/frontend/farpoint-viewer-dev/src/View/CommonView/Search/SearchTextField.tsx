import { eventNames } from 'process'
import React from 'react'
import './SearchTextField.css'

type Props = {
    value: string
    placeHolder: string
    onChange: (value: string) => void
    id: string
    onSearch: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

function TextField({ id, value, placeHolder, onChange, onSearch }: Props) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value)
    }

    const handleOnSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        onSearch(e)
    }

    return (
        <div className="CommonComponent TextInput" id={id}>
            <div className={'SearchTextField'}>
                <input
                    value={value}
                    type="text"
                    placeholder={placeHolder}
                    name="search"
                    onChange={handleChange}
                    autoComplete={'off'}
                    onKeyDown={handleOnSearch}
                />
            </div>
        </div>
    )
}

export default TextField
