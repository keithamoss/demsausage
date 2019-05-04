import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { getElectionsToShowInAppBar, getLiveElections, getURLSafeElectionName, IElection } from "../../redux/modules/elections"
import { IStore } from "../../redux/modules/reducer"
import { gaTrack } from "../../shared/analytics/GoogleAnalytics"
import ElectionAppBar from "./ElectionAppBar"

interface IProps {
    isResponsiveAndOverBreakPoint: boolean
    pageTitle: string
    pageBaseURL: string
}

interface IDispatchProps {
    onChooseElection: Function
}

interface IStoreProps {
    elections: Array<IElection>
    liveElections: Array<IElection>
    currentElection: IElection
    defaultElection: IElection
    browserBreakpoint: string
}

interface IStateProps {}

class ElectionAppBarContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    render() {
        const {
            pageBaseURL,
            elections,
            liveElections,
            currentElection,
            browserBreakpoint,
            isResponsiveAndOverBreakPoint,
            onChooseElection,
        } = this.props
        const { electionsToShow, isHistoricalElectionShown } = getElectionsToShowInAppBar(elections, liveElections, currentElection)

        return (
            <ElectionAppBar
                electionsToShow={electionsToShow}
                isHistoricalElectionShown={isHistoricalElectionShown}
                currentElection={currentElection}
                browserBreakpoint={browserBreakpoint}
                isResponsiveAndOverBreakPoint={isResponsiveAndOverBreakPoint}
                onOpenElectionChooser={() => browserHistory.push(`${pageBaseURL}/elections`)}
                onChooseElectionTab={(electionId: number) => {
                    // Navigate to the Current Elections tab (and change our current election to the defaultElection)
                    if (electionId === -1) {
                        gaTrack.event({
                            category: "ElectionAppBarContainer",
                            action: "onChooseCurrentElectionsTab",
                            label: "Go to Current Elections",
                        })
                        browserHistory.push(pageBaseURL)
                    } else {
                        // Navigate to the election chosen by the user
                        gaTrack.event({
                            category: "ElectionAppBarContainer",
                            action: "onClickElectionTab",
                            label: "Go to a specific election",
                        })
                        onChooseElection(elections.find((election: IElection) => election.id === electionId), pageBaseURL)
                    }
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { elections, browser } = state

    return {
        elections: elections.elections,
        liveElections: getLiveElections(state),
        currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
        defaultElection: elections.elections.find((election: IElection) => election.id === elections.default_election_id)!,
        browserBreakpoint: browser.mediaType,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        onChooseElection(election: IElection, pageBaseURL: string) {
            browserHistory.push(`${pageBaseURL}/${getURLSafeElectionName(election)}`)
        },
    }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
    mapStateToProps,
    mapDispatchToProps
)(ElectionAppBarContainer)
