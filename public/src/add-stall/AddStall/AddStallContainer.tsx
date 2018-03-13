import * as React from "react"
import { connect } from "react-redux"

import AddStall from "./AddStall"
import { IStore, IElection } from "../../redux/modules/interfaces"

export interface IProps {}

export interface IDispatchProps {}

export interface IStoreProps {
    activeElections: Array<IElection>
}

export interface IStateProps {
    formSubmitted: boolean
}

interface IRouteProps {
    electionIdentifier: string
}

interface IOwnProps {
    params: IRouteProps
}

export class AddStallFormContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    initialValues: object

    constructor(props: any) {
        super(props)
        this.state = { formSubmitted: false }

        this.onStallAdded = this.onStallAdded.bind(this)
    }

    componentDidMount() {
        document.title = "Democracy Sausage | Report your sausage sizzle or cake stall"
    }

    onStallAdded() {
        this.setState({ formSubmitted: true })
    }

    render() {
        const { activeElections } = this.props
        const { formSubmitted } = this.state

        const showNoActiveElections = activeElections.length === 0

        return (
            <AddStall
                showNoActiveElections={showNoActiveElections}
                showWelcome={!formSubmitted && !showNoActiveElections}
                showThankYou={formSubmitted && !showNoActiveElections}
                showForm={!formSubmitted && !showNoActiveElections}
                onStallAdded={this.onStallAdded}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { elections } = state

    return {
        activeElections: elections.elections.filter((election: IElection) => election.is_active),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const AddStallFormContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(AddStallFormContainer)

export default AddStallFormContainerWrapped
