import * as React from "react"
import { connect } from "react-redux"
import { IPollingPlace } from "../../redux/modules/polling_places"
import { IStore } from "../../redux/modules/reducer"
import PollingPlaceInfoCardMini from "./PollingPlaceInfoCardMini"

export interface IProps {
    pollingPlace: IPollingPlace
}

export interface IDispatchProps {}

export interface IStoreProps {}

export interface IStateProps {}

interface IOwnProps {}

export class PollingPlaceInfoCardMiniContainer extends React.PureComponent<IProps & IDispatchProps, IStateProps> {
    render() {
        const { pollingPlace } = this.props

        return <PollingPlaceInfoCardMini pollingPlace={pollingPlace} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const PollingPlaceInfoCardMiniContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(PollingPlaceInfoCardMiniContainer)

export default PollingPlaceInfoCardMiniContainerWrapped
