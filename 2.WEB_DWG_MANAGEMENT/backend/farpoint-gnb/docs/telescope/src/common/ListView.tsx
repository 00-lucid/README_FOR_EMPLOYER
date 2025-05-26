import './ListView.css'

export type ListViewHeader = {
    className?: string
    text: string
}

export type ListViewRow = {
    key: string
    onClick: () => void
    columns: string[]
}

type ListViewProps = {
    id: string
    headers: ListViewHeader[]
    rows: ListViewRow[]
    selectedRows?: Set<string>
}

export function ListView({ id, headers, rows }: ListViewProps) {
    const getHeaders = (): JSX.Element[] => {
        const values: JSX.Element[] = []

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i]

            values.push(
                <th className={header.className} key={i}>
                    {header.text}
                </th>
            )
        }

        return values
    }

    const getRows = (): JSX.Element[] => {
        const values: JSX.Element[] = []

        for (const row of rows) {
            const columns: JSX.Element[] = []

            for (let i = 0; i < row.columns.length; i++) {
                const text = row.columns[i]
                const className = headers[i].className
                const key = i + text

                columns.push(
                    <td className={className} key={key}>
                        {text}
                    </td>
                )
            }

            values.push(
                <tr className="RowItem" key={row.key} onClick={row.onClick}>
                    {columns}
                </tr>
            )
        }

        return values
    }

    return (
        <div className="CommonComponent" id={id}>
            <div className="ListViewControl">
                <table>
                    <thead className="Header">
                        <tr>{getHeaders()}</tr>
                    </thead>
                    <tbody>{getRows()}</tbody>
                </table>
            </div>
        </div>
    )
}
