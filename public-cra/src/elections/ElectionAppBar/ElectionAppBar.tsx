import { ResponsiveAppBar } from "material-ui-responsive-drawer"
import IconButton from "material-ui/IconButton"
import { NavigationMoreHoriz, NavigationMoreVert } from "material-ui/svg-icons"
import { Tab, Tabs } from "material-ui/Tabs"
import * as React from "react"
import styled from "styled-components"
import { getElectionLabel, IElection } from "../../redux/modules/elections"

const AppBarStyled = styled(ResponsiveAppBar)`
    position: relative !important;
`

const ElectionTabs = styled(Tabs)`
    /* Modify the active tab div */
    & div div {
        margin-top: 0px !important;
    }
`

const ElectionTab = styled(Tab)`
    white-space: normal;
    padding-left: 12px !important;
    padding-right: 12px !important;
` as any

// 0_o Wtf Material UI?
// https://github.com/mui-org/material-ui/issues/3622
class ElectionTabWrapper extends React.Component<any, any> {
    static muiName = "Tab"

    render() {
        return <ElectionTab {...this.props} />
    }
}

interface IProps {
    electionsToShow: Array<IElection>
    isHistoricalElectionShown: boolean
    currentElection: IElection
    browserBreakpoint: string
    isResponsiveAndOverBreakPoint: boolean
    onOpenElectionChooser: any
    onChooseElectionTab: any
}

class ElectionAppBar extends React.PureComponent<IProps, {}> {
    render() {
        const {
            electionsToShow,
            isHistoricalElectionShown,
            currentElection,
            browserBreakpoint,
            isResponsiveAndOverBreakPoint,
            onOpenElectionChooser,
            onChooseElectionTab,
        } = this.props

        return (
            <AppBarStyled
                title={
                    <ElectionTabs
                        onChange={(electionId: number) => onChooseElectionTab(electionId)}
                        value={currentElection.id}
                        inkBarStyle={{ backgroundColor: "#78C8AC" }}
                    >
                        {electionsToShow.map((election: IElection) => (
                            <ElectionTabWrapper
                                key={election.id}
                                label={getElectionLabel(electionsToShow.length, election, isHistoricalElectionShown, browserBreakpoint)}
                                value={election.id}
                            />
                        ))}
                        {isHistoricalElectionShown === true && <ElectionTabWrapper label={"Current Elections"} value={-1} />}
                    </ElectionTabs>
                }
                iconStyleLeft={{ display: "none" }}
                iconElementRight={
                    <IconButton onClick={onOpenElectionChooser}>
                        {navigator.platform === "iPhone" ? (
                            <NavigationMoreHoriz color={"rgba(255, 255, 255, 0.7)"} />
                        ) : (
                            <NavigationMoreVert color={"rgba(255, 255, 255, 0.7)"} />
                        )}
                    </IconButton>
                }
                style={{ paddingLeft: "0px", left: isResponsiveAndOverBreakPoint === true ? "0px !important" : undefined }}
                zDepth={0}
            />
        )
    }
}

export default ElectionAppBar
