import * as React from "react"
import { connect } from "react-redux"
import StallLocationCard from "../../../add-stall/StallLocationCard/StallLocationCard"
import { IElection } from "../../../redux/modules/elections"
import { IStore } from "../../../redux/modules/reducer"
import { IStallLocationInfo } from "../../../redux/modules/stalls"
import { IGoogleAddressSearchResult, IGoogleGeocodeResult } from "./GooglePlacesAutocomplete"
import GooglePlacesAutocompleteList from "./GooglePlacesAutocompleteList"

export interface IProps {
    election: IElection
    onConfirmChosenLocation: Function

    onChoosePlace: Function
    // From SearchBar via GooglePlacesAutocomplete
    componentRestrictions: object
    autoFocus: boolean
    hintText: string
    onRequestSearch?: Function
}
export interface IStoreProps {}

export interface IDispatchProps {}

export interface IStateProps {
    addressResult: IGoogleAddressSearchResult | null
    geocodedPlace: IGoogleGeocodeResult | null
    stallLocationInfo: IStallLocationInfo | null
    locationConfirmed: boolean
}

interface IOwnProps {}

export class GooglePlacesAutocompleteListWithConfirm extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    constructor(props: any) {
        super(props)
        this.state = { addressResult: null, geocodedPlace: null, stallLocationInfo: null, locationConfirmed: false }

        this.onChoosePlace = this.onChoosePlace.bind(this)
        this.onCancelChosenLocation = this.onCancelChosenLocation.bind(this)
        this.onConfirmChosenLocation = this.onConfirmChosenLocation.bind(this)
    }

    onChoosePlace(addressResult: IGoogleAddressSearchResult, place: IGoogleGeocodeResult) {
        this.setState({
            ...this.state,
            addressResult: addressResult,
            geocodedPlace: place,
            stallLocationInfo: this.getPollingPlaceInfo(addressResult, place),
        })
    }

    onCancelChosenLocation() {
        this.setState({ ...this.state, addressResult: null, geocodedPlace: null, stallLocationInfo: null, locationConfirmed: false })
    }

    onConfirmChosenLocation(stallLocationInfo: IStallLocationInfo) {
        this.setState({ ...this.state, locationConfirmed: true })
        this.props.onConfirmChosenLocation(this.state.stallLocationInfo!)
    }

    getPollingPlaceInfo(addressResult: IGoogleAddressSearchResult, geocodedPlace: IGoogleGeocodeResult): IStallLocationInfo {
        const stateComponent: any = geocodedPlace.address_components.find(
            (o: any) => o.types.includes("administrative_area_level_1") && o.types.includes("political")
        )
        return {
            geom: {
                type: "Point",
                coordinates: [geocodedPlace.geometry.location.lng(), geocodedPlace.geometry.location.lat()],
            },
            name: addressResult.structured_formatting.main_text,
            address: geocodedPlace.formatted_address,
            state: stateComponent !== undefined ? stateComponent.short_name : null,
        }
    }

    render() {
        const { election, componentRestrictions, autoFocus, hintText } = this.props
        const { stallLocationInfo, locationConfirmed } = this.state

        return (
            <div>
                {locationConfirmed === false && election.polling_places_loaded === false && (
                    <div>
                        <GooglePlacesAutocompleteList
                            componentRestrictions={componentRestrictions}
                            autoFocus={autoFocus}
                            hintText={hintText}
                            onChoosePlace={this.onChoosePlace}
                        />
                        <br />
                    </div>
                )}

                {stallLocationInfo !== null && (
                    <StallLocationCard
                        stallLocationInfo={stallLocationInfo}
                        showActions={locationConfirmed === false}
                        onCancel={this.onCancelChosenLocation}
                        onConfirm={this.onConfirmChosenLocation}
                    />
                )}
            </div>
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const GooglePlacesAutocompleteListWithConfirmWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(GooglePlacesAutocompleteListWithConfirm)

export default GooglePlacesAutocompleteListWithConfirmWrapped as any
