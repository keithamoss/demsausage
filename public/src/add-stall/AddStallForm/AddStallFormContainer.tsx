import * as React from "react"
import { connect } from "react-redux"
// import { formValueSelector, getFormValues, isDirty, initialize, submit, change } from "redux-form"
import { isDirty, submit } from "redux-form"
// import { cloneDeep } from "lodash-es"

import AddStallForm from "./AddStallForm"
import { IStore, IElection, IStallLocationInfo, IStall, IPollingPlace } from "../../redux/modules/interfaces"
import { createStall } from "../../redux/modules/stalls"

export interface IProps {
    onStallAdded: Function
}

export interface IDispatchProps {
    onFormSubmit: Function
    onSaveForm: Function
}

export interface IStoreProps {
    election: IElection
    isDirty: boolean
}

export interface IStateProps {
    stallLocationInfo: IStallLocationInfo | null /* Actually IStallLocationInfo or IPollingPlace (depending on election.polling_places_loaded) */
    locationConfirmed: boolean
    formSubmitting: boolean
}

// interface IRouteProps {
//     electionIdentifier: string
// }

interface IOwnProps {}

const fromFormValues = (formValues: any): IStall => {
    return {
        ...formValues,
    }
}

export class AddStallFormContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    initialValues: object

    constructor(props: any) {
        super(props)
        this.state = { stallLocationInfo: null, locationConfirmed: false, formSubmitting: false }

        this.onConfirmChosenLocation = this.onConfirmChosenLocation.bind(this)
    }

    onConfirmChosenLocation(stallLocationInfo: IStallLocationInfo) {
        this.setState(
            Object.assign(this.state, {
                stallLocationInfo: stallLocationInfo,
                locationConfirmed: true,
            })
        )
    }
    toggleFormSubmitting() {
        this.setState(
            Object.assign(this.state, {
                formSubmitting: !this.state.formSubmitting,
            })
        )
    }

    componentWillMount() {
        // const { pollingPlace } = this.props

        // Each layer mounts this component anew, so store their initial layer form values.
        // e.g. For use in resetting the form state (Undo/Discard Changes)
        // this.initialValues = cloneDeep(toFormValues(pollingPlace))
        this.initialValues = {}
    }

    render() {
        const { election, isDirty, onFormSubmit, onSaveForm, onStallAdded } = this.props
        const { stallLocationInfo, locationConfirmed, formSubmitting } = this.state

        return (
            <AddStallForm
                initialValues={this.initialValues}
                election={election}
                onConfirmChosenLocation={this.onConfirmChosenLocation}
                stallLocationInfo={stallLocationInfo}
                locationConfirmed={locationConfirmed}
                formSubmitting={formSubmitting}
                isDirty={isDirty}
                onSubmit={async (values: object, dispatch: Function, props: IProps) => {
                    this.toggleFormSubmitting()
                    await onFormSubmit(onStallAdded, values, election, stallLocationInfo)
                }}
                onSaveForm={() => {
                    onSaveForm(isDirty)
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { elections } = state

    return {
        election: elections.elections[elections.current_election_id],
        isDirty: isDirty("addStall")(state),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        async onFormSubmit(onStallAdded: Function, values: object, election: IElection, stallLocationInfo: Partial<IPollingPlace>) {
            const stall: Partial<IStall> = fromFormValues(values)
            stall.elections_id = election.id

            // FIXME
            if (election.polling_places_loaded === false) {
                stall.stall_location_info = stallLocationInfo as IStallLocationInfo
            } else {
                stall.polling_place_id = stallLocationInfo.id
            }

            const json = await dispatch(createStall(election, stall))
            if (!("error" in json) && json.id > 0) {
                onStallAdded()
            }
        },
        onSaveForm: (isDirty: boolean) => {
            dispatch(submit("addStall"))
        },
    }
}

const AddStallFormContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(AddStallFormContainer) as any

export default AddStallFormContainerWrapped
