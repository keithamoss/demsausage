import * as React from "react"
import { connect } from "react-redux"
// import { formValueSelector, getFormValues, isDirty, initialize, submit, change } from "redux-form"
import { isDirty, submit } from "redux-form"
// import { cloneDeep } from "lodash-es"

import AddStallForm from "./AddStallForm"
import { IStore, IElection, IPollingPlace } from "../../redux/modules/interfaces"
// import { updatePollingPlace } from "../../redux/modules/polling_places"

export interface IProps {}

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

// const toFormValues = (pollingPlace: IPollingPlace) => {
//     const hasOther: any = pollingPlace.has_other
//     return {
//         has_bbq: pollingPlace.has_bbq,
//         has_caek: pollingPlace.has_caek,
//         has_nothing: pollingPlace.has_nothing,
//         has_run_out: pollingPlace.has_run_out,
//         has_coffee: "has_coffee" in hasOther && hasOther.has_coffee === true,
//         has_vego: "has_vego" in hasOther && hasOther.has_vego === true,
//         has_halal: "has_halal" in hasOther && hasOther.has_halal === true,
//         has_baconandeggs: "has_baconandeggs" in hasOther && hasOther.has_baconandeggs === true,
//         has_freetext: "has_freetext" in hasOther ? hasOther.has_freetext : "",
//         stall_name: pollingPlace.stall_name,
//         stall_description: pollingPlace.stall_description,
//         stall_website: pollingPlace.stall_website,
//         polling_place_type: pollingPlace.polling_place_type,
//         extra_info: pollingPlace.extra_info,
//         source: pollingPlace.source,
//     }
// }

// const fromFormValues = (formValues: any): IPollingPlace => {
//     let hasOther: any = {}
//     if (formValues.has_coffee === true) {
//         hasOther.has_coffee = formValues.has_coffee
//     }
//     if (formValues.has_vego === true) {
//         hasOther.has_vego = formValues.has_vego
//     }
//     if (formValues.has_halal === true) {
//         hasOther.has_halal = formValues.has_halal
//     }
//     if (formValues.has_baconandeggs === true) {
//         hasOther.has_baconandeggs = formValues.has_baconandeggs
//     }
//     if (formValues.has_freetext === true) {
//         hasOther.has_freetext = formValues.has_freetext
//     }

//     let formValuesCopy = cloneDeep(formValues)
//     delete formValuesCopy.has_coffee
//     delete formValuesCopy.has_vego
//     delete formValuesCopy.has_halal
//     delete formValuesCopy.has_baconandeggs
//     delete formValuesCopy.has_freetext

//     return {
//         ...formValuesCopy,
//         has_other: JSON.stringify(hasOther),
//     }
// }

export class AddStallFormContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    initialValues: object
    componentWillMount() {
        // const { pollingPlace } = this.props

        // Each layer mounts this component anew, so store their initial layer form values.
        // e.g. For use in resetting the form state (Undo/Discard Changes)
        // this.initialValues = cloneDeep(toFormValues(pollingPlace))
        this.initialValues = {}
    }
    render() {
        const { election, isDirty, onFormSubmit, onSaveForm } = this.props

        return (
            <AddStallForm
                election={election}
                initialValues={this.initialValues}
                isDirty={isDirty}
                onSubmit={(values: object, dispatch: Function, props: IProps) => {
                    onFormSubmit(values, election)
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
        election: elections.elections[ownProps.params.electionIdentifier],
        // pollingPlaceId: ownProps.params.pollingPlaceId || null,
        isDirty: isDirty("addStall")(state),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        async onFormSubmit(values: object, election: IElection, pollingPlace: IPollingPlace) {
            console.log("onFormSubmit", values)

            // const pollingPlaceNew: Partial<IPollingPlace> = fromFormValues(values)
            // // if (pollingPlace.first_report === "") {
            // //     pollingPlaceNew.first_report = "strftime('%Y-%m-%d %H:%M:%f','now') || '+00'"
            // // }
            // // pollingPlaceNew.latest_report = "strftime('%Y-%m-%d %H:%M:%f','now') || '+00'"

            // const json = await dispatch(updatePollingPlace(election, pollingPlace, pollingPlaceNew))
            // if (json.rows === 1) {
            //     // onPollingPlaceEdited()
            // }
        },
        onSaveForm: (pollingPlace: IPollingPlace, isDirty: boolean) => {
            dispatch(submit("addStall"))
        },
    }
}

const AddStallFormContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(AddStallFormContainer)

export default AddStallFormContainerWrapped
