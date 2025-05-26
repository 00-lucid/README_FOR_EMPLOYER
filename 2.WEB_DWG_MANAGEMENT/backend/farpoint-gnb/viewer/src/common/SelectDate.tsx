import React from 'react'
import { Calendar, getMonthName } from './Calendar'
import './SelectDate.css'

type Props = {
    id: string
    date: Date
    onChange: (date: Date) => void
}

export function SelectDate({ id, date, onChange }: Props) {
    const [hiddenCalendar, setHiddenCalendar] = React.useState(true)

    const getStyle = () => {
        const body = document.body.getBoundingClientRect()
        const element = document.getElementById(id)
        const rect = element?.getBoundingClientRect()

        if (rect) {
            const bodyWidth = body.width
            const elementTop = rect.top
            const elementLeft = rect.left

            const targetWidth = 244
            const targetHeight = 230
            const targetLeft = elementLeft - (targetWidth - 115) / 2

            let top = elementTop + 28

            const isBottomOver = body.height < top + targetHeight

            if (isBottomOver) {
                top = elementTop - targetHeight
            }

            const isLeftOver = targetLeft < 0
            const isRightOver = bodyWidth < targetLeft + targetWidth

            if (isLeftOver) {
                return { top: top + 'px', left: 10 + 'px' }
            } else if (isRightOver) {
                return { top: top + 'px', right: 10 + 'px' }
            }
            return { top: top + 'px', left: targetLeft + 'px' }
        }

        return {}
    }

    return (
        <div className="CommonComponent" id={id}>
            <div
                className="SelectDate"
                tabIndex={0}
                onBlur={() => {
                    setHiddenCalendar(true)
                }}
            >
                <div
                    className="CurrentDate CenterText"
                    onClick={() =>
                        setHiddenCalendar((prev: boolean) => {
                            return !prev
                        })
                    }
                >
                    {date.getFullYear()}-{zeroFill(date.getMonth() + 1)}-{zeroFill(date.getDate())}
                </div>
                <div hidden={hiddenCalendar} className="SelectCalendar" style={getStyle()}>
                    <div className="TopView">
                        <div className="ControlsFrame">
                            <div className="Controls">
                                <svg
                                    width="14"
                                    height="14"
                                    xmlns="http://www.w3.org/2000/svg"
                                    onClick={() => {
                                        const newDate = new Date(date.getTime())
                                        newDate.setMonth(date.getMonth() - 1)
                                        onChange(newDate)
                                    }}
                                >
                                    <path
                                        d="m9.594 1.75-5.51 5.51 5.51 5.51"
                                        stroke="#FFF"
                                        fill="none"
                                        fillRule="evenodd"
                                        opacity=".9"
                                    />
                                </svg>
                                <div className="MonthName">{getMonthName(date.getMonth() + 1)}</div>
                                <svg
                                    width="14"
                                    height="14"
                                    xmlns="http://www.w3.org/2000/svg"
                                    onClick={() => {
                                        const newDate = new Date(date.getTime())
                                        newDate.setMonth(date.getMonth() + 1)
                                        onChange(newDate)
                                    }}
                                >
                                    <path
                                        d="m4.083 1.75 5.51 5.51-5.51 5.51"
                                        stroke="#FFF"
                                        fill="none"
                                        fillRule="evenodd"
                                        opacity=".9"
                                    />
                                </svg>
                            </div>
                        </div>
                        <svg className="CloseButton" width="16" height="16" onClick={() => setHiddenCalendar(true)}>
                            <g stroke="#FFF" fill="none" fillRule="evenodd" opacity=".9">
                                <path d="m14.35 1.65-12.7 12.7M14.35 14.35 1.65 1.65" />
                            </g>
                        </svg>
                    </div>
                    <div className="WeekDayNames">
                        <div>
                            <div className="CenterText">S</div>
                        </div>
                        <div>
                            <div className="CenterText">M</div>
                        </div>
                        <div>
                            <div className="CenterText">T</div>
                        </div>
                        <div>
                            <div className="CenterText">W</div>
                        </div>
                        <div>
                            <div className="CenterText">T</div>
                        </div>
                        <div>
                            <div className="CenterText">F</div>
                        </div>
                        <div>
                            <div className="CenterText">S</div>
                        </div>
                    </div>
                    <Calendar key={id + 'Calendar'} id={id + 'Calendar'} date={date} onClick={onChange} />
                </div>
            </div>
        </div>
    )
}

const zeroFill = (value: number) => String(value).padStart(2, '0')
