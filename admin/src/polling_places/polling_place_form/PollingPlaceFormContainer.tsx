import * as React from "react"
import { connect } from "react-redux"
// import { formValueSelector, getFormValues, isDirty, initialize, submit, change } from "redux-form"
import { isDirty, submit } from "redux-form"

import PollingPlaceForm from "./PollingPlaceForm"
import { IStore, IElection, IPollingPlace } from "../../redux/modules/interfaces"
import { updatePollingPlace } from "../../redux/modules/polling_places"

export interface IProps {
    election: IElection
    pollingPlace: IPollingPlace
    onPollingPlaceEdited: Function
}

export interface IDispatchProps {
    onFormSubmit: Function
    onSaveForm: Function
}

export interface IStoreProps {
    isDirty: boolean
}

export interface IStateProps {}

interface IOwnProps {}

const toFormValues = (pollingPlace: IPollingPlace) => {
    const hasOther: any = pollingPlace.has_other
    return {
        has_bbq: pollingPlace.has_bbq,
        has_caek: pollingPlace.has_caek,
        has_nothing: pollingPlace.has_nothing,
        has_run_out: pollingPlace.has_run_out,
        has_coffee: "has_coffee" in hasOther && hasOther.has_coffee === true,
        has_vego: "has_vego" in hasOther && hasOther.has_vego === true,
        has_halal: "has_halal" in hasOther && hasOther.has_halal === true,
        has_baconandeggs: "has_baconandeggs" in hasOther && hasOther.has_baconandeggs === true,
        has_freetext: "has_freetext" in hasOther ? hasOther.has_freetext : "",
        stall_name: pollingPlace.stall_name,
        stall_description: pollingPlace.stall_description,
        stall_website: pollingPlace.stall_website,
        polling_place_type: pollingPlace.polling_place_type,
        extra_info: pollingPlace.extra_info,
        source: pollingPlace.source,
    }
}

const fromFormValues = (formValues: any): IPollingPlace => {
    let hasOther: any = {}
    if (formValues.has_coffee === true) {
        hasOther.has_coffee = formValues.has_coffee
    }
    if (formValues.has_vego === true) {
        hasOther.has_vego = formValues.has_vego
    }
    if (formValues.has_halal === true) {
        hasOther.has_halal = formValues.has_halal
    }
    if (formValues.has_baconandeggs === true) {
        hasOther.has_baconandeggs = formValues.has_baconandeggs
    }
    if (formValues.has_freetext === true) {
        hasOther.has_freetext = formValues.has_freetext
    }

    let formValuesCopy = JSON.parse(JSON.stringify(formValues))
    delete formValuesCopy.has_coffee
    delete formValuesCopy.has_vego
    delete formValuesCopy.has_halal
    delete formValuesCopy.has_baconandeggs
    delete formValuesCopy.has_freetext

    return {
        ...formValuesCopy,
        has_other: JSON.stringify(hasOther),
    }
}

export class PollingPlaceFormContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    initialValues: object
    componentWillMount() {
        const { pollingPlace } = this.props

        // Each layer mounts this component anew, so store their initial layer form values.
        // e.g. For use in resetting the form state (Undo/Discard Changes)
        this.initialValues = JSON.parse(JSON.stringify(toFormValues(pollingPlace)))
    }
    render() {
        const { election, pollingPlace, isDirty, onFormSubmit, onSaveForm } = this.props

        return (
            <PollingPlaceForm
                election={election}
                pollingPlace={pollingPlace}
                initialValues={this.initialValues}
                isDirty={isDirty}
                onSubmit={onFormSubmit}
                onSaveForm={() => {
                    onSaveForm(pollingPlace, isDirty)
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    // const { elections } = state

    return {
        // election: elections.elections[ownProps.params.electionIdentifier],
        // pollingPlaceId: ownProps.params.pollingPlaceId || null,
        isDirty: isDirty("pollingPlace")(state),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        async onFormSubmit(values: object, dispatch: Function, props: IProps) {
            const pollingPlaceNew: Partial<IPollingPlace> = fromFormValues(values)
            await dispatch(updatePollingPlace(props.election, props.pollingPlace, pollingPlaceNew))
            props.onPollingPlaceEdited()
            // dispatch(initialize("layerForm", layerFormValues, false))
        },
        onSaveForm: (pollingPlace: IPollingPlace, isDirty: boolean) => {
            dispatch(submit("pollingPlace"))
        },
    }
}

const PollingPlaceFormContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(PollingPlaceFormContainer)

export default PollingPlaceFormContainerWrapped
