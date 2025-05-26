import { Component } from 'react'
import { SubscribeSubjectContext } from '../../utils/SubscribeSubjectContext'

const defaultState = {
    is3D: false,
    activeDraggerName: 'Pan',
    hasViewPointToSave: false,
    isEnable: false,
    cuttingChoose: false,
    isSupportViewPoint: true
}

export class DraggerComponent extends Component {
    state = { ...defaultState }

    constructor(props) {
        super(props)
        this.eventsConnection = props.eventsConnection
        this.subscribeSubjectContext = new SubscribeSubjectContext()

        this.subscribeSubjectContext.subscribe(this.eventsConnection.changeInitialization, () => {
            this.eventsConnection.onClearViewPoint.next()
            this.activateDraggerByName('Pan')
            this.setState({ hasViewPointToSave: false })

            this.setState({ ...defaultState })
        })

        this.subscribeSubjectContext.subscribe(this.eventsConnection.change3dMode, (is3D) => {
            this.activateDraggerByName('Pan')

            this.setState({ is3D })
        })

        this.subscribeSubjectContext.subscribe(this.eventsConnection.changeEnable, (isEnable) =>
            this.setState({ isEnable })
        )

        this.subscribeSubjectContext.subscribe(this.eventsConnection.changeSupportViewPoint, (isSupportViewPoint) =>
            this.setState({ isSupportViewPoint })
        )
    }

    componentWillUnmount() {
        this.subscribeSubjectContext.unsubscribe()
    }

    activateDraggerByName = (name, hasViewPointToSave) => {
        this.eventsConnection.onActivateDraggerByName.next(name)
        this.setState({
            activeDraggerName: name,
            hasViewPointToSave: hasViewPointToSave
        })
    }

    render() {
        return <div></div>
    }
}
