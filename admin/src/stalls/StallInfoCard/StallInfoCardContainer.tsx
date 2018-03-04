import * as React from "react"
import { connect } from "react-redux"

import StallInfoCard from "./StallInfoCard"
import { IStore, IStall } from "../../redux/modules/interfaces"

export interface IProps {
    stall: IStall
    cardActions?: any
}

export interface IDispatchProps {}

export interface IStoreProps {}

export interface IStateProps {}

interface IOwnProps {}

export class StallInfoCardContainer extends React.PureComponent<IProps & IDispatchProps, IStateProps> {
    render() {
        const { stall, cardActions } = this.props

        return <StallInfoCard stall={stall} cardActions={cardActions} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const StallInfoCardContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(StallInfoCardContainer)

export default StallInfoCardContainerWrapped
