import CommunicationLocationOff from "material-ui/svg-icons/communication/location-off"
import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { IElection } from "../../redux/modules/elections"
import {
    fetchPollingPlacesWithoutFacilityTypes,
    IPollingPlace,
    IPollingPlaceFacilityType,
    updatePollingPlace,
} from "../../redux/modules/polling_places"
import { IStore } from "../../redux/modules/reducer"
import EmptyState from "../../shared/empty_state/EmptyState"
import PollingPlaceTypesEditor from "./PollingPlaceTypesEditor"

interface IRouteProps {
    electionIdentifier: string
}

interface IOwnProps {
    params: IRouteProps
}

interface IProps extends IOwnProps {}

export interface IStoreProps {
    election: IElection
    pollingPlaceTypes: IPollingPlaceFacilityType[]
}

export interface IDispatchProps {
    fetchPollingPlaces: Function
    updatePollingPlaceType: Function
    onElectionChanged: Function
}

export interface IStateProps {
    pollingPlaces: IPollingPlace[] | null
}

type TComponentProps = IProps & IStoreProps & IDispatchProps & IOwnProps
class PollingPlaceTypesEditorContainer extends React.PureComponent<TComponentProps, IStateProps> {
    public constructor(props: TComponentProps) {
        super(props)

        this.state = {
            pollingPlaces: null,
        }
    }

    async componentDidMount() {
        const { fetchPollingPlaces, election } = this.props
        this.setState({ pollingPlaces: await fetchPollingPlaces(election) })
    }

    async componentWillReceiveProps(nextProps: TComponentProps) {
        const { election } = this.props
        if (election.id !== nextProps.election.id) {
            this.setState({ pollingPlaces: await nextProps.fetchPollingPlaces(nextProps.election) })
        }
    }

    render() {
        const { pollingPlaceTypes, election, updatePollingPlaceType, onElectionChanged } = this.props
        const { pollingPlaces } = this.state

        if (election.polling_places_loaded === false) {
            return (
                <EmptyState
                    message={
                        <div>
                            We don't have any polling
                            <br />
                            places for this election yet :(
                        </div>
                    }
                    icon={<CommunicationLocationOff />}
                />
            )
        }

        if (pollingPlaces === null) {
            return null
        }

        return (
            <PollingPlaceTypesEditor
                pollingPlaces={pollingPlaces}
                pollingPlaceTypes={pollingPlaceTypes}
                onChangeType={(value: string, pollingPlace: IPollingPlace) => {
                    updatePollingPlaceType(election, pollingPlace, value)
                }}
                onElectionChanged={onElectionChanged}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
    const { elections, polling_places } = state

    return {
        election: elections.elections.find((election: IElection) => election.id === parseInt(ownProps.params.electionIdentifier, 10))!,
        pollingPlaceTypes: polling_places.types,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        fetchPollingPlaces: async (election: IElection) => {
            if (election.polling_places_loaded === true) {
                return await dispatch(fetchPollingPlacesWithoutFacilityTypes(election))
            }
            return null
        },
        updatePollingPlaceType: (election: IElection, pollingPlace: IPollingPlace, newType: string) => {
            dispatch(updatePollingPlace(election, pollingPlace, { facility_type: newType }))
        },
        onElectionChanged: (electionId: number) => {
            browserHistory.push(`/election/${electionId}/polling_place_types/`)
        },
    }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
    mapStateToProps,
    mapDispatchToProps
)(PollingPlaceTypesEditorContainer)
