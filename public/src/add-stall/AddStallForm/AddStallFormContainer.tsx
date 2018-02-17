import * as React from "react"
import { connect } from "react-redux"
// import { formValueSelector, getFormValues, isDirty, initialize, submit, change } from "redux-form"
import { isDirty, submit } from "redux-form"
// import { cloneDeep } from "lodash-es"

import AddStallForm from "./AddStallForm"
import {
    IStore,
    IElection,
    IStallLocationInfo,
    IStall,
    IGoogleAddressSearchResult,
    IGoogleGeocodeResult,
} from "../../redux/modules/interfaces"
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
    addressResult: IGoogleAddressSearchResult | null
    geocodedPlace: IGoogleGeocodeResult | null
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
        this.state = { addressResult: null, geocodedPlace: null, locationConfirmed: false, formSubmitting: false }

        this.onChoosePlace = this.onChoosePlace.bind(this)
        this.onCancelChosenLocation = this.onCancelChosenLocation.bind(this)
        this.onConfirmChosenLocation = this.onConfirmChosenLocation.bind(this)
    }

    onChoosePlace(addressResult: IGoogleAddressSearchResult, place: IGoogleGeocodeResult) {
        this.setState(Object.assign(this.state, { addressResult: addressResult, geocodedPlace: place }))
    }

    onCancelChosenLocation() {
        this.setState(Object.assign(this.state, { addressResult: null, geocodedPlace: null, locationConfirmed: false }))
    }

    onConfirmChosenLocation() {
        this.setState(
            Object.assign(this.state, {
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

    getPollingPlaceInfo(): IStallLocationInfo | null {
        const { addressResult, geocodedPlace } = this.state

        if (addressResult === null || geocodedPlace === null) {
            return null
        }

        const stateComponent: any = geocodedPlace.address_components.find(
            (o: any) => o.types.includes("administrative_area_level_1") && o.types.includes("political")
        )
        return {
            lon: geocodedPlace.geometry.location.lng(),
            lat: geocodedPlace.geometry.location.lat(),
            polling_place_name: addressResult.structured_formatting.main_text,
            address: geocodedPlace.formatted_address,
            state: stateComponent !== undefined ? stateComponent.short_name : null,
        }
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
        const { addressResult, locationConfirmed, formSubmitting } = this.state

        return (
            <AddStallForm
                initialValues={this.initialValues}
                election={election}
                locationChosen={addressResult !== null}
                stallLocationInfo={this.getPollingPlaceInfo()}
                onChoosePlace={this.onChoosePlace}
                onCancelChosenLocation={this.onCancelChosenLocation}
                onConfirmChosenLocation={this.onConfirmChosenLocation}
                locationConfirmed={locationConfirmed}
                formSubmitting={formSubmitting}
                isDirty={isDirty}
                onSubmit={async (values: object, dispatch: Function, props: IProps) => {
                    const stallLocationInfo = this.getPollingPlaceInfo()
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
        // pollingPlaceId: ownProps.params.pollingPlaceId || null,
        isDirty: isDirty("addStall")(state),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        async onFormSubmit(onStallAdded: Function, values: object, election: IElection, stallLocationInfo: IStallLocationInfo) {
            const stall: Partial<IStall> = fromFormValues(values)
            stall.elections_id = election.id

            if (election.polling_places_loaded === false) {
                stall.stall_location_info = stallLocationInfo
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
