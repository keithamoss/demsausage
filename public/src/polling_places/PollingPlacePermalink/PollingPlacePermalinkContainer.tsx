import { ActionSearch } from "material-ui/svg-icons"
import * as React from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import PollingPlaceCardMiniContainer from "../../finder/PollingPlaceCardMini/PollingPlaceCardMiniContainer"
import { getElectionByURLSafeName, IElection } from "../../redux/modules/elections"
import {
    IPollingPlace,
    lookupPollingPlaces,
    lookupPollingPlacesByECId,
    lookupPollingPlacesByStallId,
} from "../../redux/modules/polling_places"
import { IStore } from "../../redux/modules/reducer"
import EmptyState from "../../shared/empty_state/EmptyState"

const Container = styled.div`
    padding: 20px;
`

export interface IProps {}

export interface IStoreProps {
    election: IElection | undefined
}

export interface IDispatchProps {
    fetchPollingPlace: Function
}

export interface IStateProps {
    pollingPlace: IPollingPlace | undefined
}

interface IRouteParams {
    electionName: string
    stallId?: string
    ecId?: string
    name?: string
    premises?: string
    state?: string
}

interface IOwnProps {
    routeParams: IRouteParams
}

type TComponentProps = IProps & IStoreProps & IDispatchProps & IOwnProps
class PollingPlacePermalinkContainer extends React.Component<TComponentProps, IStateProps> {
    private fetchPollingPlace: Function

    constructor(props: TComponentProps) {
        super(props)

        this.state = { pollingPlace: undefined }

        this.fetchPollingPlace = (election: IElection) => props.fetchPollingPlace(election)
    }

    async componentWillMount() {
        const { election } = this.props

        if (this.props.election !== undefined) {
            this.setState({ pollingPlace: await this.fetchPollingPlace(election) })
        }
    }

    render() {
        const { election } = this.props
        const { pollingPlace } = this.state

        if (election === undefined || pollingPlace === undefined) {
            return (
                <EmptyState
                    message={
                        <div>
                            Sorry about this, but we couldn't
                            <br />
                            find that polling place.
                        </div>
                    }
                    icon={<ActionSearch />}
                />
            )
        }

        return (
            <Container>
                <PollingPlaceCardMiniContainer pollingPlace={pollingPlace} election={election} />
            </Container>
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const getElectionByURLSafeNameFilter = getElectionByURLSafeName(state)

    return {
        election: getElectionByURLSafeNameFilter(ownProps.routeParams.electionName),
    }
}

const mapDispatchToProps = (dispatch: Function, ownProps: IOwnProps): IDispatchProps => {
    return {
        fetchPollingPlace: async (election: IElection) => {
            const { routeParams } = ownProps

            if ("stallId" in routeParams) {
                return await dispatch(lookupPollingPlacesByStallId(election, routeParams.stallId!))
            }
            if ("ecId" in routeParams) {
                return await dispatch(lookupPollingPlacesByECId(election, routeParams.ecId!))
            } else if ("name" in routeParams && "premises" in routeParams && "state" in routeParams) {
                return await dispatch(lookupPollingPlaces(election, routeParams.name!, routeParams.premises!, routeParams.state!))
            }
        },
    }
}

const PollingPlacePermalinkContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(PollingPlacePermalinkContainer)

export default PollingPlacePermalinkContainerWrapped
