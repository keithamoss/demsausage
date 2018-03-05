import * as React from "react"
import { connect } from "react-redux"

import ElectionChooser from "./ElectionChooser"
import { IStore, IElection } from "../../redux/modules/interfaces"
import { setCurrentElection } from "../../redux/modules/elections"

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

interface IOwnProps {}

export class ElectionChooserContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
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

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
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

const ElectionChooserContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(ElectionChooserContainer)

export default ElectionChooserContainerWrapped
