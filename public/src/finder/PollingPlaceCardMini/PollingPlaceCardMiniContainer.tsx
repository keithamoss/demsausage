import * as React from "react"
import { connect } from "react-redux"
import { IElection } from "../../redux/modules/elections"
import { IPollingPlace } from "../../redux/modules/polling_places"
import { IStore } from "../../redux/modules/reducer"
import PollingPlaceCardMini from "./PollingPlaceCardMini"

export interface IProps {
    pollingPlace: IPollingPlace
    election: IElection
}

export interface IStoreProps {}

export interface IDispatchProps {}

export interface IStateProps {}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class PollingPlaceCardMiniContainer extends React.PureComponent<TComponentProps, IStateProps> {
    render() {
        const { pollingPlace, election } = this.props

        return <PollingPlaceCardMini pollingPlace={pollingPlace} election={election} />
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const PollingPlaceCardMiniContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(PollingPlaceCardMiniContainer)

export default PollingPlaceCardMiniContainerWrapped
