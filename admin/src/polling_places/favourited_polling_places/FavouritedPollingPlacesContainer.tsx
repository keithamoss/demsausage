import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { IElection } from "../../redux/modules/elections"
import { fetchFavouritedPollingPlaces, IPollingPlace } from "../../redux/modules/polling_places"
import { IStore } from "../../redux/modules/reducer"
import FavouritedPollingPlaces from "./FavouritedPollingPlaces"

interface IRouteProps {
    electionIdentifier: string
}

interface IOwnProps {
    params: IRouteProps
}

interface IProps extends IOwnProps {}

export interface IStoreProps {
    election: IElection
}

export interface IDispatchProps {
    fetchPollingPlaces: Function
    onElectionChanged: Function
}

export interface IStateProps {
    pollingPlaces: IPollingPlace[] | null
}

type TComponentProps = IStoreProps & IDispatchProps & IOwnProps
class FavouritedPollingPlacesContainer extends React.PureComponent<TComponentProps, IStateProps> {
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
        const { onElectionChanged } = this.props
        const { pollingPlaces } = this.state

        if (pollingPlaces === null) {
            return null
        }

        return <FavouritedPollingPlaces pollingPlaces={pollingPlaces} onElectionChanged={onElectionChanged} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
    const { elections } = state

    return {
        election: elections.elections.find((election: IElection) => election.id === parseInt(ownProps.params.electionIdentifier, 10))!,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        fetchPollingPlaces: async (election: IElection) => {
            return await dispatch(fetchFavouritedPollingPlaces(election))
        },
        onElectionChanged: (electionId: number) => {
            browserHistory.push(`/election/${electionId}/favourited_polling_places/`)
        },
    }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
    mapStateToProps,
    mapDispatchToProps
)(FavouritedPollingPlacesContainer)
