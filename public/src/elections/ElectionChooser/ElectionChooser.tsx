import * as React from "react"
import styled from "styled-components"
// import "./ElectionChooser.css"

import { IElection } from "../../redux/modules/interfaces"
import { getMapboxAPIKey } from "../../redux/modules/app"

import { Tabs, Tab } from "material-ui/Tabs"
import IconButton from "material-ui/IconButton"
import FlatButton from "material-ui/FlatButton"
import { NavigationMoreVert, NavigationMoreHoriz } from "material-ui/svg-icons"
import { white } from "material-ui/styles/colors"
import FullscreenDialog from "material-ui-fullscreen-dialog"
import { ResponsiveAppBar } from "material-ui-responsive-drawer"

const AppBarStyled = styled(ResponsiveAppBar)`
    margin-top: 50px; /* Height of ResponsiveAppBar */
    margin-bottom: 10px;
    z-index: 100;
    position: fixed !important;
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

const ElectionsFlexboxContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    /* Or do it all in one line with flex flow */
    flex-flow: row wrap;
    /* tweak where items line up on the row valid values are: 
       flex-start, flex-end, space-between, space-around, stretch */
    align-content: flex-end;
    position: relative;
    width: 80%;
    margin: 0 auto;
`

const ElectionsFlexboxItem = styled.div`
    width: 150px;
    height: 150px;
    margin: 6px;
    position: relative;
    border: ${props => (props.className === "selected" ? "1px solid rgba(120, 200, 172, 1)" : "")};
    cursor: ${props => (props.className === "selected" ? "auto" : "pointer")};

    & img {
        width: 150px;
        height: 150px;
    }
`

const ElectionTitle = styled.span`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: ${props => (props.className === "selected" ? "rgba(120, 200, 172, 0.6)" : "rgba(0, 0, 0, 0.4)")};
    line-height: 24px;
    text-align: center;
    color: ${white};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
`

// 0_o Wtf Material UI?
// https://github.com/mui-org/material-ui/issues/3622
class ElectionTabWrapper extends React.Component<any, any> {
    static muiName = "Tab"

    render() {
        return <ElectionTab {...this.props} />
    }
}

// Yeah, sorry. Replace with fields in the database if we ditch short_name in the longer term
// "South Australian Election 2018" => "South Australia"
const getElectionKindaShortName: any = (election: IElection) =>
    election.name
        .replace("Election ", "")
        .replace(/\s[0-9]{4}$/, "")
        .replace(/ian$/, "ia")
        .replace(/\sBy-election$/, "")

// "South Australian Election 2018" => "South Australia 2018"
const getElectionKindaNotSoShortName: any = (election: IElection) =>
    election.name
        .replace("Election ", "")
        .replace(/ian\s/, "ia ")
        .replace(/\sBy-election\s/, " ")

export interface IProps {
    elections: Array<IElection>
    currentElection: IElection
    isElectionChooserOpen: boolean
    onOpenElectionChooser: any
    onCloseElectionChooserDialog: any
    onChooseElection: any
    onChooseElectionTab: any
}

class ElectionChooser extends React.PureComponent<IProps, {}> {
    render() {
        const {
            elections,
            currentElection,
            isElectionChooserOpen,
            onOpenElectionChooser,
            onCloseElectionChooserDialog,
            onChooseElection,
            onChooseElectionTab,
        } = this.props

        const activeElections = elections.filter((election: IElection) => election.is_active)

        let electionsToShowAsTabs
        // Show our active elections
        if (activeElections.length > 0) {
            electionsToShowAsTabs = activeElections
        } else {
            // Show recent elections i.e. The last set of election(s) we did - may be weeks or months in the past
            electionsToShowAsTabs = elections.filter(
                (election: IElection) => election.election_day === elections[0].election_day || election.is_primary
            )
        }

        // or show an historical election
        let isHistoricalElectionShown = false
        if (electionsToShowAsTabs.includes(currentElection) === false) {
            isHistoricalElectionShown = true
            electionsToShowAsTabs = [currentElection]
        }

        return (
            <div>
                <AppBarStyled
                    title={
                        <ElectionTabs
                            onChange={(electionId: number) => onChooseElectionTab(electionId)}
                            value={currentElection.id}
                            inkBarStyle={{ backgroundColor: "#78C8AC" }}
                        >
                            {electionsToShowAsTabs.map((election: IElection) => (
                                <ElectionTabWrapper
                                    key={election.id}
                                    label={
                                        isHistoricalElectionShown === false
                                            ? getElectionKindaShortName(election)
                                            : getElectionKindaNotSoShortName(election)
                                    }
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
                        // tslint:disable-next-line:jsx-curly-spacing
                    }
                    style={{ paddingLeft: "0px" }}
                    zDepth={0}
                />

                <FullscreenDialog
                    open={isElectionChooserOpen}
                    onRequestClose={onCloseElectionChooserDialog}
                    title={"Elections"}
                    actionButton={<FlatButton label="Close" onClick={onCloseElectionChooserDialog} />}
                    containerStyle={{ paddingBottom: 56 }} /* Height of BottomNav */
                >
                    <ElectionsFlexboxContainer>
                        {elections.map((election: IElection) => (
                            <ElectionsFlexboxItem
                                key={election.id}
                                onClick={() => onChooseElection(election)}
                                className={election.id === currentElection.id ? "selected" : ""}
                            >
                                <img
                                    src={`https://api.mapbox.com/styles/v1/mapbox/light-v9/static/${election.lon},${
                                        election.lat
                                    },${election.default_zoom_level - 0.2},0,0/600x600?access_token=${getMapboxAPIKey()}`}
                                />
                                <ElectionTitle className={election.id === currentElection.id ? "selected" : ""}>
                                    {election.short_name}
                                </ElectionTitle>
                            </ElectionsFlexboxItem>
                        ))}
                    </ElectionsFlexboxContainer>
                </FullscreenDialog>
            </div>
        )
    }
}

export default ElectionChooser
