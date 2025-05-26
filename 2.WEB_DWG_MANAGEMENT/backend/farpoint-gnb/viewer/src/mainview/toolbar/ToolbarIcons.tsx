export function zoomExtents(): JSX.Element {
    return (
        <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <g stroke="var(--Menu-Toolbar-Item-Stroke)" fill="none" fillRule="evenodd" opacity=".9">
                <path d="M3.5 27.5h29v-24h-29zM18 27v5M11 32.5h14M4 23.5h24" />
                <path d="M6.5 11V6.5H11M11.5 11.5 7 7M29.5 11V6.5H25M24.5 11.5 29 7M29.5 16v4.5H25M24.5 15.5 29 20M6.5 16v4.5H11M11.5 15.5 7 20" />
            </g>
        </svg>
    )
}

export function changeTheme(): JSX.Element {
    return (
        <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd" opacity=".9">
                <path stroke="var(--Menu-Toolbar-Item-Stroke)" d="M15 32.5H3.5v-18h18v18H19" />
                <path fill="var(--Menu-Toolbar-Item-Stroke)" d="M14.5 3.5v11h7v7h11v-18z" />
                <path stroke="var(--Menu-Toolbar-Item-Stroke)" d="M14.5 3.5v11h7v7h11v-18zM5.5 11V5.5H11" />
                <g stroke="var(--Menu-Toolbar-Item-Stroke)">
                    <path d="m7.5 9.5-2 2-2-2M9.5 3.5l2 2-2 2" />
                </g>
            </g>
        </svg>
    )
}

export function showMarkup(isActive: boolean): JSX.Element {
    return isActive ? (
        <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd" opacity=".9">
                <path
                    d="M6 5.984V33h19.993V14.813l-1.493-.895-4.497 2.699V5.984H6zM10 13h9v-1h-9v1zM10 18h7v-1h-7v1zm0 5h5v-1h-5v1z"
                    fill="#4A70F7"
                />
                <path stroke="#4A70F7" d="m29.497 17.5-4.997-3-4.997 3v-14h9.994z" />
            </g>
        </svg>
    ) : (
        <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <g stroke="var(--Menu-Toolbar-Item-Stroke)" fill="none" fillRule="evenodd" opacity=".9">
                <path d="M25.493 15v17.5H6.5V6.484H19M10 12.5h9M10 17.5h7M10 22.5h5" />
                <path d="m29.497 17.5-4.997-3-4.997 3v-14h9.994z" />
            </g>
        </svg>
    )
}

export function editMarkup(): JSX.Element {
    return (
        <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd" opacity=".9">
                <path
                    stroke="var(--Menu-Toolbar-Item-Stroke)"
                    d="M24.5 26v6.5h-21v-29h21V11M7 9.5h14M7.067 14.5h8.558M7 19.5h4.067"
                />
                <path
                    d="m16.321 27.893-4.95.707.707-4.95L27.697 8.03a1.913 1.913 0 0 1 2.704 0l1.539 1.54a1.91 1.91 0 0 1 0 2.704L16.321 27.893z"
                    stroke="var(--Menu-Toolbar-Item-Stroke)"
                />
                <path
                    d="m24.786 10.943 4.728 4.728a1.814 1.814 0 0 1 0 2.565l-1.525 1.525"
                    stroke="var(--Menu-Toolbar-Item-Stroke)"
                />
                <path fill="var(--Menu-Toolbar-Item-Stroke)" d="m11.651 26.64-.28 1.96 1.96-.28z" />
            </g>
        </svg>
    )
}

export function startWCD(isActive: Boolean): JSX.Element {
    return isActive ? (
        <svg width="36" height="36" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M22.442 17.185 7 3.8l.042 20.435 4.598-5.403 3.374 7.368 3.707-1.697-3.374-7.368z"
                fill="#4A70F7"
                stroke="#4A70F7"
                fillRule="evenodd"
                opacity=".9"
            />
        </svg>
    ) : (
        <svg width="36" height="36" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M22.442 17.185 7 3.8l.042 20.435 4.598-5.403 3.374 7.368 3.707-1.697-3.374-7.368z"
                stroke="var(--Menu-Toolbar-Item-Stroke)"
                fill="none"
                fillRule="evenodd"
                opacity=".9"
            />
        </svg>
    )
}

export function favoriteImg(isActive: boolean): JSX.Element {
    const fill = (
        <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd" opacity=".9">
                <path
                    fill="#4A70F7"
                    d="m13.748 12.896-9.673 1.406 7 6.823-1.652 9.634 8.65-4.548 8.654 4.548-1.653-9.634 7-6.823-9.673-1.406-4.327-8.766z"
                />
                <path
                    stroke="#4A70F7"
                    d="m4.074 14.301 9.674-1.406 4.327-8.766 4.326 8.766 9.674 1.406-7 6.823 1.652 9.635-8.652-4.549-8.652 4.55 1.652-9.636z"
                />
            </g>
        </svg>
    )

    const empty = (
        <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M7.487 18.571 7 18.096l-1-.974-2-1.95 9.674-1.406L18 5l4.326 8.766L32 15.172l-7 6.823 1.652 9.635L18 27.081 9.348 31.63 11 21.995l-1-.974"
                stroke="var(--Menu-Toolbar-Item-Stroke)"
                fill="none"
                fillRule="evenodd"
                opacity=".9"
            />
        </svg>
    )

    return isActive ? fill : empty
}

export function dragImg(): JSX.Element {
    return (
        <svg width="32" height="60" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
                <path d="M0 0h32v60H0z" />
                <g transform="translate(10 17)" fill="#7B8185">
                    <rect width="4" height="4" rx="2" />
                    <rect y="8" width="4" height="4" rx="2" />
                    <rect x="8" width="4" height="4" rx="2" />
                    <rect x="8" y="8" width="4" height="4" rx="2" />
                    <rect y="16" width="4" height="4" rx="2" />
                    <rect y="24" width="4" height="4" rx="2" />
                    <rect x="8" y="16" width="4" height="4" rx="2" />
                    <rect x="8" y="24" width="4" height="4" rx="2" />
                </g>
            </g>
        </svg>
    )
}

export function markupSelect(isActive: boolean): JSX.Element {
    return isActive ? (
        <svg width="36" height="36" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M22.442 17.185 7 3.8l.042 20.435 4.598-5.403 3.374 7.368 3.707-1.697-3.374-7.368z"
                fill="#4A70F7"
                stroke="#4A70F7"
                fillRule="evenodd"
                opacity=".9"
            />
        </svg>
    ) : (
        <svg width="36" height="36" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M22.442 17.185 7 3.8l.042 20.435 4.598-5.403 3.374 7.368 3.707-1.697-3.374-7.368z"
                stroke="var(--Menu-Toolbar-Item-Stroke)"
                fill="none"
                fillRule="evenodd"
                opacity=".9"
            />
        </svg>
    )
}

export function markupEdit(isActive: boolean): JSX.Element {
    return isActive ? (
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M22.442 17.185 7 3.8l.042 20.435 4.598-5.403 3.374 7.368 3.707-1.697-3.374-7.368z"
                fill="#4A70F7"
                stroke="#4A70F7"
                fillRule="evenodd"
                opacity=".9"
            />
        </svg>
    ) : (
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M22.442 17.185 7 3.8l.042 20.435 4.598-5.403 3.374 7.368 3.707-1.697-3.374-7.368z"
                stroke="var(--Menu-Toolbar-Item-Stroke)"
                fill="none"
                fillRule="evenodd"
                opacity=".9"
            />
        </svg>
    )
}

export function markupPen(isActive: boolean): JSX.Element {
    return isActive ? (
        <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
        >
            <g transform="translate(3 3)" fill="none" fillRule="evenodd">
                <path
                    d="m20.473 7.106-3.49-3.49.565-.566 3.49 3.49-.565.566zm-19.49 16 .405-2.324a3.503 3.503 0 0 1 1.92 1.92l-2.325.404zM23.38 1.896 22.193.71a2.433 2.433 0 0 0-3.433 0L.974 18.494 0 24.09l5.595-.974L21.039 7.671l-.283-.283.283.283.393.394a1.512 1.512 0 0 1 0 2.136l-1.818 1.82.566.565 1.818-1.82c.9-.9.9-2.366 0-3.267l-.394-.393-.283-.284.283.284L23.38 5.33a2.431 2.431 0 0 0 0-3.434z"
                    fill="#4A70F7"
                />
            </g>
        </svg>
    ) : (
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
                <path
                    d="m8.402 25.745-4.91.855.855-4.91L22.043 3.994a2.028 2.028 0 0 1 2.867 0l1.188 1.188a2.027 2.027 0 0 1 0 2.867L8.402 25.745z"
                    stroke="var(--Menu-Toolbar-Item-Stroke)"
                />
                <path
                    d="m19.984 6.053 4.732 4.732a1.91 1.91 0 0 1 0 2.7l-1.818 1.819"
                    stroke="var(--Menu-Toolbar-Item-Stroke)"
                />
                <path
                    d="m3.718 23.577-.439 3.236 3.235-.44a3.46 3.46 0 0 0-.972-1.823 3.456 3.456 0 0 0-1.824-.973"
                    fill="var(--Menu-Toolbar-Item-Stroke)"
                />
            </g>
        </svg>
    )
}

export function markupErase(isActive: boolean): JSX.Element {
    return isActive ? (
        <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
        >
            <defs>
                <path id="a" d="M0 .02h23.998v23.953H0z" />
                <path id="c" d="M0 24.779h24V.799H0z" />
            </defs>
            <g transform="translate(3 2.2)" fill="none" fillRule="evenodd" opacity=".9">
                <g transform="translate(0 .779)">
                    <path
                        d="M8.45 23.173H7.378L1.144 16.94a1.182 1.182 0 0 1 0-1.669l9.776-9.775 7.604 7.604L8.45 23.173zM23.418 6.535 17.484.6a1.982 1.982 0 0 0-2.8 0L.579 14.705a1.982 1.982 0 0 0 0 2.8l6.469 6.468H8.78L23.42 9.335a1.982 1.982 0 0 0 0-2.8z"
                        fill="#4A70F7"
                    />
                </g>
                <path fill="#4A70F7" d="M3.2 24.779H24v-1.6H3.2z" />
            </g>
        </svg>
    ) : (
        <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
        >
            <defs>
                <path id="a" d="M0 24h24V.02H0z" />
            </defs>
            <g fill="none" fillRule="evenodd" opacity=".9">
                <path stroke="var(--Menu-Toolbar-Item-Stroke)" d="m13.551 8.105 8.344 8.344" />
                <g transform="translate(3 2.98)">
                    <path
                        d="M23.137 6.818 17.202.883a1.58 1.58 0 0 0-2.234 0L.863 14.987a1.58 1.58 0 0 0 0 2.235l6.351 6.352h1.402L23.137 9.052a1.58 1.58 0 0 0 0-2.234z"
                        stroke="var(--Menu-Toolbar-Item-Stroke)"
                    />
                    <path stroke="var(--Menu-Toolbar-Item-Stroke)" d="M3.6 23.6h20v-.8h-20z" />
                </g>
            </g>
        </svg>
    )
}

export function markupSave(): JSX.Element {
    return (
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <g stroke="var(--Menu-Toolbar-Item-Stroke)" fill="none" fillRule="evenodd" opacity=".9">
                <path d="M7.4 26.6h15.2V17H7.4zM20.2 3.825V10.2H9V3.4h10.8M17.8 3.42V7.8M9.4 20.2h11.2M9.4 23.4h11.2" />
                <path d="M5.354 3.4c-.637 0-1.154.517-1.154 1.154v20.892c0 .637.517 1.154 1.154 1.154h19.292c.637 0 1.154-.517 1.154-1.154V9.308L19.892 3.4H5.354z" />
            </g>
        </svg>
    )
}

export function markupLoad(): JSX.Element {
    return (
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <g stroke="var(--Menu-Toolbar-Item-Stroke)" fill="none" fillRule="evenodd" opacity=".9">
                <path strokeLinecap="square" d="M24.2 13V8.2H12.8l-.6-2.4H3.4v18.4" />
                <path d="M24.082 24.2H3.8L6.2 13h20.282z" />
            </g>
        </svg>
    )
}

export function markupActive(): JSX.Element {
    return (
        <svg width="60" height="61" viewBox="0 0 60 61" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
                <path d="M0 .518h60v60H0z" />
                <path
                    d="M60 .518c-3.336.016-5.004 3.702-5.004 11.06v38.977a5 5 0 0 1-5 5h-40a5 5 0 0 1-5-5V11.578C4.996 4.22 3.33.534 0 .518z"
                    fill="var(--Markup-Toolbar-Border)"
                />
            </g>
        </svg>
    )
}

export function markupRect(isActive: boolean): JSX.Element {
    return isActive ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
            <path
                fill="#4a70f7"
                d="M9 42Q7.8 42 6.9 41.1Q6 40.2 6 39V9Q6 7.8 6.9 6.9Q7.8 6 9 6H39Q40.2 6 41.1 6.9Q42 7.8 42 9V39Q42 40.2 41.1 41.1Q40.2 42 39 42ZM9 39H39Q39 39 39 39Q39 39 39 39V9Q39 9 39 9Q39 9 39 9H9Q9 9 9 9Q9 9 9 9V39Q9 39 9 39Q9 39 9 39ZM9 39Q9 39 9 39Q9 39 9 39V9Q9 9 9 9Q9 9 9 9Q9 9 9 9Q9 9 9 9V39Q9 39 9 39Q9 39 9 39Z"
            />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
            <path
                fill="var(--Menu-Toolbar-Item-Stroke)"
                d="M9 42Q7.8 42 6.9 41.1Q6 40.2 6 39V9Q6 7.8 6.9 6.9Q7.8 6 9 6H39Q40.2 6 41.1 6.9Q42 7.8 42 9V39Q42 40.2 41.1 41.1Q40.2 42 39 42ZM9 39H39Q39 39 39 39Q39 39 39 39V9Q39 9 39 9Q39 9 39 9H9Q9 9 9 9Q9 9 9 9V39Q9 39 9 39Q9 39 9 39ZM9 39Q9 39 9 39Q9 39 9 39V9Q9 9 9 9Q9 9 9 9Q9 9 9 9Q9 9 9 9V39Q9 39 9 39Q9 39 9 39Z"
            />
        </svg>
    )
}
export function pldActive(): JSX.Element {
    return (
        <svg width="60" height="61" viewBox="0 0 60 61" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
                <path d="M0 .518h60v60H0z" />
                <path
                    d="M60 .518c-3.336.016-5.004 3.702-5.004 11.06v38.977a5 5 0 0 1-5 5h-40a5 5 0 0 1-5-5V11.578C4.996 4.22 3.33.534 0 .518z"
                    fill="var(--Markup-Toolbar-Border)"
                />
            </g>
        </svg>
    )
}

export function markupCircle(isActive: boolean): JSX.Element {
    return isActive ? (
        <svg className="markup" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
            <path
                fill="#4a70f7"
                d="M24 44q-4.1 0-7.75-1.575-3.65-1.575-6.375-4.3-2.725-2.725-4.3-6.375Q4 28.1 4 24q0-4.15 1.575-7.8 1.575-3.65 4.3-6.35 2.725-2.7 6.375-4.275Q19.9 4 24 4q4.15 0 7.8 1.575 3.65 1.575 6.35 4.275 2.7 2.7 4.275 6.35Q44 19.85 44 24q0 4.1-1.575 7.75-1.575 3.65-4.275 6.375t-6.35 4.3Q28.15 44 24 44Zm0-3q7.1 0 12.05-4.975Q41 31.05 41 24q0-7.1-4.95-12.05Q31.1 7 24 7q-7.05 0-12.025 4.95Q7 16.9 7 24q0 7.05 4.975 12.025Q16.95 41 24 41Zm0-17Z"
            />
        </svg>
    ) : (
        <svg className="markupRect" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
            <path
                fill="var(--Menu-Toolbar-Item-Stroke)"
                d="M24 44q-4.1 0-7.75-1.575-3.65-1.575-6.375-4.3-2.725-2.725-4.3-6.375Q4 28.1 4 24q0-4.15 1.575-7.8 1.575-3.65 4.3-6.35 2.725-2.7 6.375-4.275Q19.9 4 24 4q4.15 0 7.8 1.575 3.65 1.575 6.35 4.275 2.7 2.7 4.275 6.35Q44 19.85 44 24q0 4.1-1.575 7.75-1.575 3.65-4.275 6.375t-6.35 4.3Q28.15 44 24 44Zm0-3q7.1 0 12.05-4.975Q41 31.05 41 24q0-7.1-4.95-12.05Q31.1 7 24 7q-7.05 0-12.025 4.95Q7 16.9 7 24q0 7.05 4.975 12.025Q16.95 41 24 41Zm0-17Z"
            />{' '}
        </svg>
    )
}
export function markupText(isActive: boolean): JSX.Element {
    return isActive ? (
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700">
            <path
                fill="#4a70f7"
                d="M350,522.7h130.7v-37.3h-56c-37.3,0-37.3-37.3-37.3-37.3V130.7h112c37.3,0,37.3,74.7,37.3,74.7H574V74.7l-448,0
                v130.7h37.3c0,0,0-74.7,37.3-74.7h112V448c0,0,0,37.3-37.3,37.3h-56v37.3L350,522.7z"
            />
        </svg>
    ) : (
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700">
            <path
                fill="var(--Menu-Toolbar-Item-Stroke)"
                d="M350,522.7h130.7v-37.3h-56c-37.3,0-37.3-37.3-37.3-37.3V130.7h112c37.3,0,37.3,74.7,37.3,74.7H574V74.7l-448,0
                v130.7h37.3c0,0,0-74.7,37.3-74.7h112V448c0,0,0,37.3-37.3,37.3h-56v37.3L350,522.7z"
            />
        </svg>
    )
}
export function markupCloud(isActive: boolean): JSX.Element {
    return isActive ? (
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700">
            <path
                fill="#4a70f7"
                d="M487.4,253.6c62.8,0,115.6,45.7,126,106.5c48.3,4.7,86.1,45.4,86.1,95c0,52.7-42.7,95.5-95.5,95.5H137.4
                c-76.1,0-137.9-61.7-137.9-137.9c0-71.4,54.4-130.4,124.4-137.2c22.8-75.2,92.4-127.9,172.6-127.9c72.7,0,137.2,43.4,165.5,108.6
                C470.2,254.4,478.8,253.6,487.4,253.6L487.4,253.6z M487.4,274.8c-9.9,0-19.6,1.4-28.9,4c-5.3,1.5-10.9-1.3-12.8-6.5
                c-23-61.8-82.1-103.6-149.1-103.6c-73.1,0-136.2,49.7-154.1,119.4c-1.2,4.5-5.2,7.8-9.8,8c-62.4,2.5-111.8,53.9-111.8,116.6
                c0,64.4,52.2,116.7,116.7,116.7h466.7c41,0,74.2-33.2,74.2-74.2c0-41-33.2-74.2-74.2-74.2c-5.5,0-10-4.1-10.6-9.6
                C588.2,316.8,542.3,274.8,487.4,274.8L487.4,274.8z"
            />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700">
            <path
                fill="var(--Menu-Toolbar-Item-Stroke)"
                d="M487.4,253.6c62.8,0,115.6,45.7,126,106.5c48.3,4.7,86.1,45.4,86.1,95c0,52.7-42.7,95.5-95.5,95.5H137.4
                c-76.1,0-137.9-61.7-137.9-137.9c0-71.4,54.4-130.4,124.4-137.2c22.8-75.2,92.4-127.9,172.6-127.9c72.7,0,137.2,43.4,165.5,108.6
                C470.2,254.4,478.8,253.6,487.4,253.6L487.4,253.6z M487.4,274.8c-9.9,0-19.6,1.4-28.9,4c-5.3,1.5-10.9-1.3-12.8-6.5
                c-23-61.8-82.1-103.6-149.1-103.6c-73.1,0-136.2,49.7-154.1,119.4c-1.2,4.5-5.2,7.8-9.8,8c-62.4,2.5-111.8,53.9-111.8,116.6
                c0,64.4,52.2,116.7,116.7,116.7h466.7c41,0,74.2-33.2,74.2-74.2c0-41-33.2-74.2-74.2-74.2c-5.5,0-10-4.1-10.6-9.6
                C588.2,316.8,542.3,274.8,487.4,274.8L487.4,274.8z"
            />
        </svg>
    )
}
export function markupPoli(isActive: boolean): JSX.Element {
    return isActive ? (
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200">
            <path
                fill="#4a70f7"
                d="M1175,500h-175v65.6L200,362.5v-31.2l450-175V200h200V0H650v103.1L200,279.7V250H0v200h200v-35.9l800,203.1
                v37.5L507.8,1000H350v200h200v-167.2L1021.9,700H1200V500L1175,500z M700,50h100v100H700V50z M150,400H50V300h100V400z M500,1150
                H400v-100h100V1150z M1150,650h-100V550h100V650z"
            />
        </svg>
    ) : (
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200">
            <path
                fill="var(--Menu-Toolbar-Item-Stroke)"
                d="M1175,500h-175v65.6L200,362.5v-31.2l450-175V200h200V0H650v103.1L200,279.7V250H0v200h200v-35.9l800,203.1
                v37.5L507.8,1000H350v200h200v-167.2L1021.9,700H1200V500L1175,500z M700,50h100v100H700V50z M150,400H50V300h100V400z M500,1150
                H400v-100h100V1150z M1150,650h-100V550h100V650z"
            />
        </svg>
    )
}
export function undo(): JSX.Element {
    return (
        <svg version="1.1" viewBox="100 100 500 500">
            <path
                fill="var(--Menu-Toolbar-Item-Stroke)"
                d="M145.5,255.6l2.6-1.5h0c2.4-1.4,5.2-1.8,7.9-1.1c2.7,0.7,4.9,2.5,6.3,4.9l12.7,21.9
                c31.6-82.9,117.1-139.3,213.7-126.1c89.1,12.1,159.5,84.3,169.7,173.7c13.7,120.3-80,222.2-197.6,222.2c-27.2,0-54.1-5.5-79.1-16.4
                c-25-10.8-47.4-26.7-66-46.5c-6.6-7-1.7-18.4,7.8-18.4c4.7,0,9.2,1.8,12.5,5.1c38.9,39.5,96.4,60.7,158.3,49.2
                c72.3-13.4,128.7-72.3,139.5-145c16.2-108.6-67.5-202-173-202c-74.4,0-137.9,46.4-163.2,111.8l21.4-12.4c5.7-3.3,13-1.4,16.3,4.4
                c3.3,5.7,1.4,13-4.4,16.3L185.5,322c-2.7,1.6-6,2-9.1,1.2c-3.1-0.8-5.7-2.8-7.2-5.6c-0.2-0.4-0.4-0.8-0.6-1.1l-27-46.7
                c-1.4-2.4-1.8-5.2-1-7.9C141.3,259.3,143.1,257,145.5,255.6L145.5,255.6z"
            />
        </svg>
    )
}
export function redo(): JSX.Element {
    return (
        <svg style={{ transform: 'scaleX(-1)' }} version="1.1" viewBox="100 100 500 500">
            <path
                fill="var(--Menu-Toolbar-Item-Stroke)"
                d="M145.5,255.6l2.6-1.5h0c2.4-1.4,5.2-1.8,7.9-1.1c2.7,0.7,4.9,2.5,6.3,4.9l12.7,21.9
                c31.6-82.9,117.1-139.3,213.7-126.1c89.1,12.1,159.5,84.3,169.7,173.7c13.7,120.3-80,222.2-197.6,222.2c-27.2,0-54.1-5.5-79.1-16.4
                c-25-10.8-47.4-26.7-66-46.5c-6.6-7-1.7-18.4,7.8-18.4c4.7,0,9.2,1.8,12.5,5.1c38.9,39.5,96.4,60.7,158.3,49.2
                c72.3-13.4,128.7-72.3,139.5-145c16.2-108.6-67.5-202-173-202c-74.4,0-137.9,46.4-163.2,111.8l21.4-12.4c5.7-3.3,13-1.4,16.3,4.4
                c3.3,5.7,1.4,13-4.4,16.3L185.5,322c-2.7,1.6-6,2-9.1,1.2c-3.1-0.8-5.7-2.8-7.2-5.6c-0.2-0.4-0.4-0.8-0.6-1.1l-27-46.7
                c-1.4-2.4-1.8-5.2-1-7.9C141.3,259.3,143.1,257,145.5,255.6L145.5,255.6z"
            />
        </svg>
    )
}
export function pldOpenValve(): JSX.Element {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" id="mdi-pipe" width="24" height="24" viewBox="0 0 24 24">
            <rect width="36" height="24" fill="none" stroke="red" />
            <text fill="red" x="5" y="16">
                열림
            </text>
        </svg>
    )
}

export function pldCloseValve(): JSX.Element {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" id="mdi-pipe" width="24" height="24" viewBox="0 0 24 24">
            <rect width="36" height="24" fill="none" stroke="blue" />
            <text fill="blue" x="5" y="16">
                닫힘
            </text>
        </svg>
    )
}

export function pldControlValve(): JSX.Element {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" id="mdi-pipe" width="24" height="24" viewBox="0 0 24 24">
            <rect width="36" height="24" fill="none" stroke="pink" />
            <text fill="pink" x="5" y="16">
                조절
            </text>
        </svg>
    )
}

export function pldMainLine(): JSX.Element {
    return (
        <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230.453 230.453">
            <g fill="white">
                <polygon points="177.169,43.534 177.169,58.534 204.845,58.534 135.896,127.479 92.36,83.947 0,176.312 10.606,186.918   92.361,105.16 135.896,148.691 215.453,69.14 215.453,96.784 230.453,96.784 230.453,43.534 " />
            </g>
        </svg>
    )
}

export function pldSubLine(): JSX.Element {
    return (
        <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230.453 230.453">
            <g fill="white">
                <polygon points="177.169,43.534 177.169,58.534 204.845,58.534 135.896,127.479 92.36,83.947 0,176.312 10.606,186.918   92.361,105.16 135.896,148.691 215.453,69.14 215.453,96.784 230.453,96.784 230.453,43.534 " />
            </g>
        </svg>
    )
}

export function pldPicture(): JSX.Element {
    return (
        <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <g fill="black">
                <path d="M480.6,11H31.4C20.1,11,11,20.1,11,31.4v449.2c0,11.3,9.1,20.4,20.4,20.4h449.2c11.3,0,20.4-9.1,20.4-20.4V31.4     C501,20.1,491.9,11,480.6,11z M460.2,51.8v133.8c-67.3,8.2-119.4,31.2-159.7,60.9C181.2,235.6,96.9,302,51.8,350.8V51.8H460.2z      M51.8,416.1c15-22.2,87-119,203.8-129.1c-58,63.7-79.4,139.1-86.5,173.1H51.8V416.1z M210.5,460.2     c12.7-58.1,63.5-208.3,249.7-233.4v233.4H210.5z" />
                <path d="m153.8,213.4c35.2,0 63.9-28.7 63.9-63.9 0-35.2-28.6-63.9-63.9-63.9-35.2,0-63.9,28.7-63.9,63.9 0.1,35.2 28.7,63.9 63.9,63.9zm0-86.9c12.7,0 23,10.3 23,23 0,12.7-10.3,23-23,23-12.7,0-23-10.3-23-23 0-12.7 10.3-23 23-23z" />
            </g>
        </svg>
    )
}

// export function alignCenter(isActive: boolean): JSX.Element {
//     return isActive ? (
//         <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24">
//             <path fill="#4a70f7" d="M3,3H21V5H3V3M7,7H17V9H7V7M3,11H21V13H3V11M7,15H17V17H7V15M3,19H21V21H3V19Z" />
//         </svg>
//     ) : (
//         <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24">
//             <path fill="white" d="M3,3H21V5H3V3M7,7H17V9H7V7M3,11H21V13H3V11M7,15H17V17H7V15M3,19H21V21H3V19Z" />
//         </svg>
//     )
// }
// export function alignLeft(isActive: boolean): JSX.Element {
//     return isActive ? (
//         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//             <path fill="#4a70f7" d="M3,3H21V5H3V3M3,7H15V9H3V7M3,11H21V13H3V11M3,15H15V17H3V15M3,19H21V21H3V19Z" />
//         </svg>
//     ) : (
//         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//             <path fill="white" d="M3,3H21V5H3V3M3,7H15V9H3V7M3,11H21V13H3V11M3,15H15V17H3V15M3,19H21V21H3V19Z" />
//         </svg>
//     )
// }
// export function alignRight(isActive: boolean): JSX.Element {
//     return isActive ? (
//         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//             <path fill="#4a70f7" d="M3,3H21V5H3V3M9,7H21V9H9V7M3,11H21V13H3V11M9,15H21V17H9V15M3,19H21V21H3V19Z" />
//         </svg>
//     ) : (
//         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//             <path fill="white" d="M3,3H21V5H3V3M9,7H21V9H9V7M3,11H21V13H3V11M9,15H21V17H9V15M3,19H21V21H3V19Z" />
//         </svg>
//     )
// }

export function font(isFont: string, isActive: boolean): JSX.Element {
    switch (isFont) {
        case 'bold':
            return isActive ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 26 26">
                    <path
                        fill="#4a70f7"
                        d="M13.5,15.5H10V12.5H13.5A1.5,1.5 0 0,1 15,14A1.5,1.5 0 0,1 13.5,15.5M10,6.5H13A1.5,1.5 0 0,1 14.5,8A1.5,1.5 0 0,1 13,9.5H10M15.6,10.79C16.57,10.11 17.25,9 17.25,8C17.25,5.74 15.5,4 13.25,4H7V18H14.04C16.14,18 17.75,16.3 17.75,14.21C17.75,12.69 16.89,11.39 15.6,10.79Z"
                    />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 26 26">
                    <path
                        fill="var(--Markup-Popup-Color)"
                        d="M13.5,15.5H10V12.5H13.5A1.5,1.5 0 0,1 15,14A1.5,1.5 0 0,1 13.5,15.5M10,6.5H13A1.5,1.5 0 0,1 14.5,8A1.5,1.5 0 0,1 13,9.5H10M15.6,10.79C16.57,10.11 17.25,9 17.25,8C17.25,5.74 15.5,4 13.25,4H7V18H14.04C16.14,18 17.75,16.3 17.75,14.21C17.75,12.69 16.89,11.39 15.6,10.79Z"
                    />
                </svg>
            )
        case 'italic':
            return isActive ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 26 26">
                    <path fill="#4a70f7" d="M10,4V7H12.21L8.79,15H6V18H14V15H11.79L15.21,7H18V4H10Z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 26 26">
                    <path
                        fill="var(--Markup-Popup-Color)"
                        d="M10,4V7H12.21L8.79,15H6V18H14V15H11.79L15.21,7H18V4H10Z"
                    />
                </svg>
            )
        case 'underline':
            return isActive ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 28 28">
                    <path
                        fill="#4a70f7"
                        d="M5,21H19V19H5V21M12,17A6,6 0 0,0 18,11V3H15.5V11A3.5,3.5 0 0,1 12,14.5A3.5,3.5 0 0,1 8.5,11V3H6V11A6,6 0 0,0 12,17Z"
                    />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 28 28">
                    <path
                        fill="var(--Markup-Popup-Color)"
                        d="M5,21H19V19H5V21M12,17A6,6 0 0,0 18,11V3H15.5V11A3.5,3.5 0 0,1 12,14.5A3.5,3.5 0 0,1 8.5,11V3H6V11A6,6 0 0,0 12,17Z"
                    />
                </svg>
            )
        default:
            return <div></div>
    }
}

export function editMode(isActive: boolean): JSX.Element {
    return isActive ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
                fill="#4a70f7"
                d="M13.64,21.97C13.14,22.21 12.54,22 12.31,21.5L10.13,16.76L7.62,18.78C7.45,18.92 7.24,19 7,19A1,1 0 0,1 6,18V3A1,1 0 0,1 7,2C7.24,2 7.47,2.09 7.64,2.23L7.65,2.22L19.14,11.86C19.57,12.22 19.62,12.85 19.27,13.27C19.12,13.45 18.91,13.57 18.7,13.61L15.54,14.23L17.74,18.96C18,19.46 17.76,20.05 17.26,20.28L13.64,21.97Z"
            />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
                fill="var(--Markup-Popup-Color)"
                d="M13.64,21.97C13.14,22.21 12.54,22 12.31,21.5L10.13,16.76L7.62,18.78C7.45,18.92 7.24,19 7,19A1,1 0 0,1 6,18V3A1,1 0 0,1 7,2C7.24,2 7.47,2.09 7.64,2.23L7.65,2.22L19.14,11.86C19.57,12.22 19.62,12.85 19.27,13.27C19.12,13.45 18.91,13.57 18.7,13.61L15.54,14.23L17.74,18.96C18,19.46 17.76,20.05 17.26,20.28L13.64,21.97Z"
            />
        </svg>
    )
}

export function pldEdit(): JSX.Element {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 19 19">
            <g fill="white">
                <path d="M16.77 8l1.94-2a1 1 0 0 0 0-1.41l-3.34-3.3a1 1 0 0 0-1.41 0L12 3.23zm-5.81-3.71L1 14.25V19h4.75l9.96-9.96-4.75-4.75z" />
            </g>
        </svg>
    )
}
