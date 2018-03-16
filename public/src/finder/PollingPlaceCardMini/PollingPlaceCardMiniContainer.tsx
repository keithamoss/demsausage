import * as React from "react"
import { connect } from "react-redux"

import PollingPlaceCardMini from "./PollingPlaceCardMini"
import { IStore, IPollingPlace, IElection } from "../../redux/modules/interfaces"

export interface IProps {
    pollingPlace: IPollingPlace
    election: IElection
}

export interface IStoreProps {}

export interface IDispatchProps {}

export interface IStateProps {}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

export class PollingPlaceCardMiniContainer extends React.PureComponent<IProps & IStoreProps & IDispatchProps, IStateProps> {
    render() {
        const { pollingPlace, election } = this.props

        return <PollingPlaceCardMini pollingPlace={pollingPlace} election={election} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const PollingPlaceCardMiniContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(PollingPlaceCardMiniContainer)

export default PollingPlaceCardMiniContainerWrapped
