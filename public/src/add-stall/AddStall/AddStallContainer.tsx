import * as React from "react"
import { connect } from "react-redux"
import { IElection } from "../../redux/modules/elections"
import { IStore } from "../../redux/modules/reducer"
import AddStall from "./AddStall"

export interface IProps {}

export interface IDispatchProps {}

export interface IStoreProps {
    activeElections: Array<IElection>
}

export interface IStateProps {
    formSubmitted: boolean
}

type TComponentProps = IProps & IStoreProps & IDispatchProps
export class AddStallFormContainer extends React.Component<TComponentProps, IStateProps> {
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

const mapStateToProps = (state: IStore): IStoreProps => {
    const { elections } = state

    return {
        activeElections: elections.elections.filter((election: IElection) => election.is_active),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const AddStallFormContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(AddStallFormContainer)

export default AddStallFormContainerWrapped
