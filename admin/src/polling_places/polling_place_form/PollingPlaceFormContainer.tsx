import * as React from "react"
import { connect } from "react-redux"
// import { formValueSelector, getFormValues, isDirty, initialize, submit, change } from "redux-form"
import { isDirty, submit } from "redux-form"
import { cloneDeep } from "lodash-es"

import PollingPlaceForm from "./PollingPlaceForm"
import { IStore, IElection, IPollingPlace, IStall } from "../../redux/modules/interfaces"
import { updatePollingPlace, pollingPlaceHasReportsOfNoms } from "../../redux/modules/polling_places"

export interface IProps {
    election: IElection
    stall?: IStall
    pollingPlace: IPollingPlace
    onPollingPlaceEdited: Function
}

export interface IDispatchProps {
    onFormSubmit: Function
    onSaveForm: Function
}

export interface IStoreProps {
    isDirty: boolean
    pollingPlaceTypes: Array<string>
}

export interface IStateProps {}

interface IOwnProps {
    
}

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
        has_bacon_and_eggs: "has_bacon_and_eggs" in hasOther && hasOther.has_bacon_and_eggs === true,
        has_free_text: "has_free_text" in hasOther ? hasOther.has_free_text : "",
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
    if (formValues.has_bacon_and_eggs === true) {
        hasOther.has_bacon_and_eggs = formValues.has_bacon_and_eggs
    }
    if (formValues.has_free_text === true) {
        hasOther.has_free_text = formValues.has_free_text
    }

    let formValuesCopy = cloneDeep(formValues)
    delete formValuesCopy.has_coffee
    delete formValuesCopy.has_vego
    delete formValuesCopy.has_halal
    delete formValuesCopy.has_bacon_and_eggs
    delete formValuesCopy.has_free_text

    return {
        ...formValuesCopy,
        has_other: JSON.stringify(hasOther),
    }
}

export class PollingPlaceFormContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    initialValues: any

    canStallPropsBeMerged() {
        const { pollingPlace, stall } = this.props
        return (stall !== undefined && pollingPlaceHasReportsOfNoms(pollingPlace) === false)
    }

    getInitialValues(pollingPlace: IPollingPlace, stall?: IStall) {
        // Each layer mounts this component anew, so store their initial layer form values.
        // e.g. For use in resetting the form state (Undo/Discard Changes)
        let initialValues = cloneDeep(toFormValues(pollingPlace))

        // If there's no reports for this polling place yet then we can
        // safely merge in the stall's props
        if(stall !== undefined && this.canStallPropsBeMerged()) {
            initialValues.has_bbq = stall.has_bbq
            initialValues.has_caek = stall.has_caek
            initialValues.has_coffee = stall.has_coffee
            initialValues.has_halal = stall.has_halal
            initialValues.has_vego = stall.has_vego
            initialValues.has_bacon_and_eggs = stall.has_bacon_and_eggs
            
            initialValues.stall_name = stall.stall_name
            initialValues.stall_description = stall.stall_description
            initialValues.stall_website = stall.stall_website
            initialValues.source = "Direct"
        }

        return initialValues
    }

    componentWillReceiveProps(nextProps: IProps & IStoreProps & IDispatchProps) {
        if(this.props.pollingPlace.id !== nextProps.pollingPlace.id || this.props.election.id !== nextProps.election.id) {
            this.initialValues = this.getInitialValues(nextProps.pollingPlace, nextProps.stall)
        }
    }

    componentWillMount() {
        this.initialValues = this.getInitialValues(this.props.pollingPlace, this.props.stall)
    }

    render() {
        const { election, pollingPlace, onPollingPlaceEdited, isDirty, pollingPlaceTypes, onFormSubmit, onSaveForm } = this.props

        return (
            <PollingPlaceForm
                election={election}
                pollingPlace={pollingPlace}
                initialValues={this.initialValues}
                isDirty={isDirty}
                stallWasMerged={this.canStallPropsBeMerged()}
                pollingPlaceTypes={pollingPlaceTypes}
                onSubmit={(values: object, dispatch: Function, props: IProps) => {
                    onFormSubmit(values, election, pollingPlace, onPollingPlaceEdited)
                }}
                onSaveForm={() => {
                    onSaveForm(pollingPlace, isDirty)
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { polling_places } = state

    return {
        // election: elections.elections[ownProps.params.electionIdentifier],
        // pollingPlaceId: ownProps.params.pollingPlaceId || null,
        isDirty: isDirty("pollingPlace")(state),
        pollingPlaceTypes: polling_places.types,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        async onFormSubmit(values: object, election: IElection, pollingPlace: IPollingPlace, onPollingPlaceEdited: Function) {
            const pollingPlaceNew: Partial<IPollingPlace> = fromFormValues(values)

            const json = await dispatch(updatePollingPlace(election, pollingPlace, pollingPlaceNew))
            if (json.rows === 1) {
                onPollingPlaceEdited()
            }
            // dispatch(initialize("layerForm", layerFormValues, false))
        },
        onSaveForm: (pollingPlace: IPollingPlace, isDirty: boolean) => {
            dispatch(submit("pollingPlace"))
        },
    }
}

const PollingPlaceFormContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(PollingPlaceFormContainer)

export default PollingPlaceFormContainerWrapped
