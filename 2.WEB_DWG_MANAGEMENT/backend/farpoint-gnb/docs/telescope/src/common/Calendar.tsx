import './Calendar.css'

type Props = {
    id: string
    date: Date
    onClick: (date: Date) => void
}

export function Calendar({ id, date, onClick: onChange }: Props) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const days = getMonthDays(year, month)
    const weekday = getWeekday(year, month)

    const elements: JSX.Element[] = []

    let n = 0

    for (; n < weekday; n++)
        elements.push(
            <div key={id + n} className="Day">
                <div className="Empty"></div>
            </div>
        )

    for (let day = 1; day <= days; day++) {
        elements.push(
            <div
                key={id + n + date.toDateString()}
                className="Day"
                onClick={() => onChange(new Date(year, month - 1, day))}
            >
                <div className={'Text ' + (date.getDate() === day ? 'Today' : '')}>{day}</div>
            </div>
        )

        if (n % 7 === 6 && day !== days) elements.push(<br key={id + n} />)
        n++
    }

    while (n % 7) {
        elements.push(
            <div key={id + n} className="Day">
                <div className="Empty"></div>
            </div>
        )
        n++
    }

    elements.push(<br key={id + n} />)

    return (
        <div className="CommonComponent" id={id}>
            <div className={'Calendar'}>{elements}</div>
        </div>
    )
}

function getMonthDays(year: number, month: number) {
    switch (month) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            return 31
        case 4:
        case 6:
        case 9:
        case 11:
            return 30
        case 2:
            if ((year % 4 === 0 && year % 100 !== 0) || year % 400 !== 0) return 29
            else return 28
    }

    throw new Error(`month(${month})는 1~12 사이여야 한다.`)
}

function getWeekday(year: number, month: number) {
    const day = 0

    if (month === 1 || month === 2) {
        year--
        month += 12
    }

    return (year + year / 4 - year / 100 + year / 400 + (13 * month + 8) / 5 + day) % 7
}

export function getMonthName(month: number) {
    const names = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ]

    return names[month - 1]
}
