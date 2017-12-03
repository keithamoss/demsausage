import * as React from "react"
import { connect } from "react-redux"

import ElectionsManager from "./ElectionsManager"
import { IStore, IElections } from "../../redux/modules/interfaces"

export interface IStoreProps {
    elections: IElections
}

export interface IDispatchProps {}

export interface IStateProps {}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

export class ElectionsManagerContainer extends React.PureComponent<IStoreProps & IDispatchProps, IStateProps> {
    render() {
        const { elections } = this.props

        return <ElectionsManager elections={Object.keys(elections).map(k => elections[k])} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { elections } = state

    return {
        elections: elections.elections,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const ElectionsManagerContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(ElectionsManagerContainer)

export default ElectionsManagerContainerWrapped
