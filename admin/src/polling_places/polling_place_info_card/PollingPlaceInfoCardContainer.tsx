import * as React from "react"
import { connect } from "react-redux"

import PollingPlaceInfoCard from "./PollingPlaceInfoCard"
import { IStore, IElection, IPollingPlace } from "../../redux/modules/interfaces"

export interface IProps {
    election: IElection
    pollingPlace: IPollingPlace
}

export interface IDispatchProps {}

export interface IStoreProps {}

export interface IStateProps {}

interface IOwnProps {}

export class PollingPlaceInfoCardContainer extends React.PureComponent<IProps & IDispatchProps, IStateProps> {
    render() {
        const { election, pollingPlace } = this.props

        return <PollingPlaceInfoCard election={election} pollingPlace={pollingPlace} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const PollingPlaceInfoCardContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(PollingPlaceInfoCardContainer)

export default PollingPlaceInfoCardContainerWrapped
