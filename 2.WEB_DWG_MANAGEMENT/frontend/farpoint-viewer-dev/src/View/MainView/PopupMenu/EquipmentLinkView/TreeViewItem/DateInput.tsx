import React from 'react'
import dateFunc from '../../../../../Lib/dateFunc'

export const DateInput = ({ text, depth, date, onChange }: DateInputProps) => {
    return (
        <div
            className="TreeViewItem"
            onClick={(e) => {
                e.stopPropagation()
            }}
        >
            <div className="Label2">
                <div className="Text VerticalCenter" style={{ left: `calc(0px + var(--TreeView-Indent-Width) * ${depth} + 24px)` }}>
                    {text}
                </div>
                <div className="Date" style={{ left: `calc(0px + var(--TreeView-Indent-Width) * ${depth} + 70px)` }}>
                    <input
                        className="DatePick"
                        type="date"
                        value={dateFunc.dateToStringByFormatting(date)}
                        onChange={(e) => onChange(new Date(e.target.value))}
                    ></input>
                </div>
            </div>
        </div>
    )
}
