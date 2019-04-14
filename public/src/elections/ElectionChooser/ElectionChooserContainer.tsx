import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { getURLSafeElectionName, IElection } from "../../redux/modules/elections"
import { clearMapToSearch } from "../../redux/modules/map"
import { IStore } from "../../redux/modules/reducer"
import { gaTrack } from "../../shared/analytics/GoogleAnalytics"
import ElectionChooser from "./ElectionChooser"

export interface IProps {}

export interface IDispatchProps {
    onChooseElection: Function
}

export interface IStoreProps {
    elections: Array<IElection>
}

export interface IStateProps {
    isElectionChooserOpen: boolean
}

export interface IRouterProps {
    content: any
    location: any
}

type TComponentProps = IProps & IStoreProps & IDispatchProps & IRouterProps
class ElectionChooserContainer extends React.Component<TComponentProps, IStateProps> {
    static muiName = "ElectionChooserContainer"
    static pageTitle = "Democracy Sausage | Elections"
    static pageBaseURL = "/elections"

    componentDidMount() {
        document.title = ElectionChooserContainer.pageTitle
    }

    render() {
        const { elections, onChooseElection } = this.props

        if (elections === undefined) {
            return null
        }

        return <ElectionChooser elections={elections} onChooseElection={onChooseElection} />
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { elections } = state

    return {
        elections: elections.elections,
    }
}

const mapDispatchToProps = (dispatch: Function, ownProps: TComponentProps): IDispatchProps => {
    return {
        onChooseElection(election: IElection) {
            gaTrack.event({
                category: "ElectionChooserContainer",
                action: "onChooseElectionFromList",
            })

            dispatch(clearMapToSearch())

            browserHistory.push(`/${getURLSafeElectionName(election)}`)
        },
    }
}

const ElectionChooserContainerWrapped = connect<IStoreProps, IDispatchProps, IProps>(
    // @ts-ignore
    mapStateToProps,
    mapDispatchToProps
)(ElectionChooserContainer)

export default ElectionChooserContainerWrapped
