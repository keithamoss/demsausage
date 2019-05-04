import * as React from "react"
import { connect } from "react-redux"
import { IStore } from "../../redux/modules/reducer"
import { IPendingStall } from "../../redux/modules/stalls"
import StallInfoCard from "./StallInfoCard"

export interface IProps {
    stall: IPendingStall
    cardActions?: any
}

export interface IDispatchProps {}

export interface IStoreProps {}

export interface IStateProps {}

class StallInfoCardContainer extends React.PureComponent<IProps & IDispatchProps, IStateProps> {
    render() {
        const { stall, cardActions } = this.props

        return <StallInfoCard stall={stall} cardActions={cardActions} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
    return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
    mapStateToProps,
    mapDispatchToProps
)(StallInfoCardContainer)
