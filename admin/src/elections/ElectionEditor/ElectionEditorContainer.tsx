import { cloneDeep } from "lodash-es"
import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
// import { formValueSelector, getFormValues, isDirty, initialize, submit, change } from "redux-form"
import { isDirty, submit } from "redux-form"
import { IElection, updateElection } from "../../redux/modules/elections"
import { IStore } from "../../redux/modules/reducer"
import ElectionEditor from "./ElectionEditor"

export interface IProps {
    // election: IElection
    onElectionEdited: Function
}

export interface IDispatchProps {
    onFormSubmit: Function
    onSaveForm: Function
}

export interface IStoreProps {
    election: IElection
    isDirty: boolean
}

export interface IStateProps {}

interface IRouteProps {
    electionIdentifier: string
}

interface IOwnProps {
    params: IRouteProps
}

const toFormValues = (election: IElection) => {
    return {
        lon: election.lon,
        lat: election.lat,
        name: election.name,
        short_name: election.short_name,
        default_zoom_level: election.default_zoom_level,
        has_division_boundaries: election.has_division_boundaries,
        is_active: election.is_active,
        hidden: election.hidden,
        election_day: new Date(election.election_day),
    }
}

const fromFormValues = (formValues: any): IElection => {
    let formValuesCopy = cloneDeep(formValues)
    return {
        ...formValuesCopy,
        lon: parseFloat(formValuesCopy.lon),
        lat: parseFloat(formValuesCopy.lat),
    }
}

type TComponentProps = IProps & IStoreProps & IDispatchProps & IOwnProps
export class ElectionEditorContainer extends React.Component<TComponentProps, IStateProps> {
    initialValues: any
    componentWillMount() {
        const { election } = this.props

        // Each layer mounts this component anew, so store their initial layer form values.
        // e.g. For use in resetting the form state (Undo/Discard Changes)
        this.initialValues = cloneDeep(toFormValues(election))
    }
    render() {
        const { election, onElectionEdited, isDirty, onFormSubmit, onSaveForm } = this.props

        return (
            <ElectionEditor
                election={election}
                initialValues={this.initialValues}
                isDirty={isDirty}
                onSubmit={(values: object, dispatch: Function, props: IProps) => {
                    onFormSubmit(values, election, onElectionEdited)
                }}
                onSaveForm={() => {
                    onSaveForm(election, isDirty)
                }}
                onCancelForm={() => {
                    browserHistory.push("/elections/")
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: TComponentProps): IStoreProps => {
    const { elections } = state

    return {
        election: elections.elections.find((election: IElection) => election.id === parseInt(ownProps.params.electionIdentifier, 10))!,
        isDirty: isDirty("election")(state),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        async onFormSubmit(values: object, election: IElection, onElectionEdited: Function) {
            const electionNew: Partial<IElection> = fromFormValues(values)
            const json = await dispatch(updateElection(election, electionNew))
            if (json.rows === 1) {
                // onElectionEdited()
                browserHistory.push("/elections/")
            }
        },
        onSaveForm: (election: IElection, isDirty: boolean) => {
            dispatch(submit("election"))
        },
    }
}

const ElectionEditorContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(ElectionEditorContainer)

export default ElectionEditorContainerWrapped
