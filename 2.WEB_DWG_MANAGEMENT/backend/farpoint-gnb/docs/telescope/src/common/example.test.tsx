import { act } from 'react-dom/test-utils'
import { render, unmountComponentAtNode } from 'react-dom'

let container: Element | null

beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
})

afterEach(() => {
    if (container) {
        unmountComponentAtNode(container)
        container.remove()
        container = null
    }
})

const App = () => {
    return <div>{'abc123'}</div>
}

test('renders learn react link', async () => {
    await act(async () => {
        if (container !== null) {
            render(<App />, container)
        }
    })

    expect(container!.textContent).toBe('abc123')
})
