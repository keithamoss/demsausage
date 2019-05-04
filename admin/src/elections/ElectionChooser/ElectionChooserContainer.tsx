import * as React from "react"
import { connect } from "react-redux"
import { IElection, setCurrentElection } from "../../redux/modules/elections"
import { IStore } from "../../redux/modules/reducer"
import ElectionChooser from "./ElectionChooser"

export interface IProps {
    onElectionChanged: Function
}
export interface IStoreProps {
    elections: Array<IElection>
    currentElectionId: number
}

export interface IDispatchProps {
    onChangeElection: Function
}

export interface IStateProps {}

class ElectionChooserContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    render() {
        const { elections, currentElectionId, onChangeElection, onElectionChanged } = this.props

        return (
            <ElectionChooser
                elections={elections}
                currentElectionId={currentElectionId}
                onChangeElection={(event: object, key: number, electionId: number) =>
                    onChangeElection(event, key, electionId, onElectionChanged)
                }
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
    const { elections } = state

    return { elections: elections.elections, currentElectionId: elections.current_election_id }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        onChangeElection: (event: object, key: number, electionId: number, onElectionChanged: Function) => {
            dispatch(setCurrentElection(electionId))
            onElectionChanged(electionId)
        },
    }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
    mapStateToProps,
    mapDispatchToProps
)(ElectionChooserContainer)
