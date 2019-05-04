import Avatar from "material-ui/Avatar"
import { ListItem } from "material-ui/List"
import { blue500 } from "material-ui/styles/colors"
import { CommunicationLocationOff } from "material-ui/svg-icons"
import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { IElection } from "../../redux/modules/elections"
import { fetchPollingPlacesByIds, IPollingPlace } from "../../redux/modules/polling_places"
import { IStore } from "../../redux/modules/reducer"
import { IStall } from "../../redux/modules/stalls"
import { PollingPlaceEditor } from "./PollingPlaceEditor"

interface IProps {
    election: IElection
    pollingPlaceId: number | null
    stall?: IStall
    showAutoComplete: boolean
    showElectionChooser: boolean
    onPollingPlaceEdited: Function
}
interface IStoreProps {}

interface IDispatchProps {
    fetchRequiredState: Function
    onElectionChanged: Function
}

interface IStateProps {
    pollingPlacesChecked: boolean
    pollingPlace?: IPollingPlace
}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class PollingPlaceEditorContainer extends React.Component<TComponentProps, IStateProps> {
    constructor(props: IProps & IStoreProps & IDispatchProps) {
        super(props)

        this.state = { pollingPlacesChecked: false }
    }

    async componentWillMount() {
        const { fetchRequiredState, election, pollingPlaceId } = this.props

        if (pollingPlaceId !== null /* && election.polling_places_loaded === true*/) {
            this.setState({ pollingPlacesChecked: true, pollingPlace: await fetchRequiredState(election, pollingPlaceId) })
        }
    }

    async componentWillReceiveProps(nextProps: any) {
        const { fetchRequiredState, election, pollingPlaceId } = nextProps

        if (pollingPlaceId !== null) {
            this.setState({ pollingPlacesChecked: true, pollingPlace: await fetchRequiredState(election, pollingPlaceId) })
        } else if (pollingPlaceId === null) {
            await this.setState({ pollingPlacesChecked: true, pollingPlace: undefined })
        }
    }

    render() {
        const { election, stall, showAutoComplete, showElectionChooser, onPollingPlaceEdited, onElectionChanged } = this.props
        const pollingPlace: any = this.state !== null && this.state.pollingPlace !== null ? this.state.pollingPlace : null

        if (/*election.polling_places_loaded === false || */ this.state.pollingPlacesChecked && this.state.pollingPlace === null) {
            return (
                <ListItem
                    leftAvatar={<Avatar icon={<CommunicationLocationOff />} backgroundColor={blue500} />}
                    primaryText={"Notice"}
                    secondaryText={"No polling place found"}
                    secondaryTextLines={2}
                    disabled={true}
                />
            )
        }

        return (
            <PollingPlaceEditor
                election={election}
                pollingPlace={pollingPlace}
                stall={stall}
                showAutoComplete={showAutoComplete}
                showElectionChooser={showElectionChooser}
                onPollingPlaceEdited={onPollingPlaceEdited}
                onElectionChanged={onElectionChanged}
            />
        )
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        fetchRequiredState: async (election: IElection, pollingPlaceId: number) => {
            const pollingPlaces: Array<IPollingPlace> = await dispatch(fetchPollingPlacesByIds(election, [pollingPlaceId]))
            if (pollingPlaces.length === 1) {
                return pollingPlaces[0]
            }
            // @TOOD Gracefully handle no polling place being returned
            return null
        },
        onElectionChanged: (electionId: number) => {
            browserHistory.push(`/election/${electionId}/polling_places/`)
        },
    }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
    mapStateToProps,
    mapDispatchToProps
)(PollingPlaceEditorContainer)
