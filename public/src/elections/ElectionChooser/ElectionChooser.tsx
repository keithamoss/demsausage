// import { white } from "material-ui/styles/colors"
import FullscreenDialog from "material-ui-fullscreen-dialog"
import { ResponsiveAppBar } from "material-ui-responsive-drawer"
// import RaisedButton from "material-ui/RaisedButton"
import Avatar from "material-ui/Avatar"
import { Card, CardHeader } from "material-ui/Card"
import FlatButton from "material-ui/FlatButton"
import IconButton from "material-ui/IconButton"
import Subheader from "material-ui/Subheader"
import { NavigationMoreHoriz, NavigationMoreVert } from "material-ui/svg-icons"
// import { getElectionStatsDescription } from "../../redux/modules/elections"
// import { getMapboxAPIKey } from "../../redux/modules/app"
import { Tab, Tabs } from "material-ui/Tabs"
import * as React from "react"
import styled from "styled-components"
// import "./ElectionChooser.css"
import { IElection } from "../../redux/modules/interfaces"

// import SausageIcon from "../../icons/sausage"
// import CakeIcon from "../../icons/cake"
// import VegoIcon from "../../icons/vego"
// import RedCrossofShameIcon from "../../icons/red-cross-of-shame"
// import HalalIcon from "../../icons/halal"
// import CoffeeIcon from "../../icons/coffee"
// import BaconandEggsIcon from "../../icons/bacon-and-eggs"

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

// const ElectionsFlexboxContainer = styled.div`
//     display: flex;
//     flex-direction: row;
//     align-items: center;
//     justify-content: center;
//     /* Or do it all in one line with flex flow */
//     flex-flow: row wrap;
//     /* tweak where items line up on the row valid values are:
//        flex-start, flex-end, space-between, space-around, stretch */
//     align-content: flex-end;
//     position: relative;
//     width: 80%;
//     margin: 0 auto;
// `

// const ElectionsFlexboxItem = styled.div`
//     width: 150px;
//     height: 150px;
//     margin: 6px;
//     position: relative;
//     border: ${props => (props.className === "selected" ? "1px solid rgba(120, 200, 172, 1)" : "")};
//     cursor: ${props => (props.className === "selected" ? "auto" : "pointer")};

//     & img {
//         width: 150px;
//         height: 150px;
//     }
// `

// const ElectionTitle = styled.span`
//     position: absolute;
//     bottom: 0;
//     left: 0;
//     width: 100%;
//     background-color: ${props => (props.className === "selected" ? "rgba(120, 200, 172, 0.6)" : "rgba(0, 0, 0, 0.4)")};
//     line-height: 24px;
//     text-align: center;
//     color: ${white};
//     -webkit-font-smoothing: antialiased;
//     -moz-osx-font-smoothing: grayscale;
// `

const ElectionCardContainer = styled.div`
    cursor: pointer;
`

const ElectionCard = styled(Card)`
    margin-bottom: 10px;
    max-width: 400px;
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

// "SA 2018" => "SA"
const getElectionVeryShortName: any = (election: IElection) => election.short_name.replace(/\s[0-9]{4}$/, "")

const getElectionLabel: any = (
    numberOfElectionTabsShowing: number,
    election: IElection,
    isHistoricalElectionShown: boolean,
    browserBreakpoint: string
) => {
    if (isHistoricalElectionShown === false) {
        // e.g. FREO
        if (numberOfElectionTabsShowing > 3 && browserBreakpoint === "extraSmall") {
            return getElectionVeryShortName(election)
        } else if (numberOfElectionTabsShowing > 3) {
            // e.g. Fremantle
            return getElectionKindaShortName(election)
        } else {
            // e.g. Fremantle 2018
            return getElectionKindaNotSoShortName(election)
        }
    }
    // e.g. Fremantle 2018
    return getElectionKindaNotSoShortName(election)
}

// export function renderElectionStats(election: IElection) {
//     const description: Array<any> = []

//     description.push(<FlatButton key={"booths"} label={`${election.stats.ttl_booths}`} icon={<ActionHome />} />)
//     description.push(<FlatButton key={"bbq"} label={`${election.stats.ttl_bbq}`} icon={<SausageIcon />} />)
//     description.push(<FlatButton key={"caek"} label={`${election.stats.ttl_caek}`} icon={<CakeIcon />} />)
//     description.push(<FlatButton key={"shame"} label={`${election.stats.ttl_shame}`} icon={<RedCrossofShameIcon />} />)

//     if ("ttl_coffee" in election.stats) {
//         description.push(<FlatButton key={"coffee"} label={`${election.stats.ttl_coffee}`} icon={<CoffeeIcon />} />)
//     }

//     if ("ttl_bacon_and_eggs" in election.stats) {
//         description.push(<FlatButton key={"baconandeggs"} label={`${election.stats.ttl_bacon_and_eggs}`} icon={<BaconandEggsIcon />} />)
//     }

//     if ("ttl_halal" in election.stats) {
//         description.push(<FlatButton key={"halal"} label={`${election.stats.ttl_halal}`} icon={<HalalIcon />} />)
//     }

//     if ("ttl_vego" in election.stats) {
//         description.push(<FlatButton key={"vego"} label={`${election.stats.ttl_vego}`} icon={<VegoIcon />} />)
//     }

//     if ("ttl_free_text" in election.stats) {
//         description.push(<FlatButton key={"free_text"} label={`${election.stats.ttl_free_text}`} icon={<MapsLocalDining />} />)
//     }

//     return description
// }

// https://en.wikipedia.org/wiki/Australian_state_colours
// export function getElectionColours(election: IElection) {
//     if (election.short_name.startsWith("SA ") === true) {
//         return { backgroundColor: "#FF0000", color: "white" }
//     } else if (election.short_name.startsWith("VIC ") === true || election.short_name.startsWith("BAT ") === true) {
//         return { backgroundColor: "#000075", color: "white" }
//     } else if (election.short_name.startsWith("WA ") === true) {
//         return { backgroundColor: "#FFD104", color: "white" }
//     } else if (election.short_name.startsWith("TAS ") === true) {
//         return { backgroundColor: "#005F45", color: "white" }
//     } else if (election.short_name.startsWith("QLD ") === true) {
//         return { backgroundColor: "#750000", color: "white" }
//     } else if (election.short_name.startsWith("NSW ") === true) {
//         return { backgroundColor: "#7CC7E8", color: "white" }
//     } else if (election.short_name.startsWith("ACT ") === true) {
//         return { backgroundColor: "#FFD104", color: "white" }
//     } else if (election.short_name.startsWith("NT ") === true) {
//         return { backgroundColor: "#E34F00", color: "white" }
//     }

//     return { backgroundColor: "#000000", color: "white" }
// }

export interface IProps {
    elections: Array<IElection>
    currentElection: IElection
    isElectionChooserOpen: boolean
    browserBreakpoint: string
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
            browserBreakpoint,
            onOpenElectionChooser,
            onCloseElectionChooserDialog,
            onChooseElection,
            onChooseElectionTab,
        } = this.props

        const activeElections = elections.filter((election: IElection) => election.is_active)

        let electionsToShowAsTabs: IElection[]
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

        // Insert year <Subheaders> between groups of elections
        let lastYear: number

        // https://pawelgrzybek.com/return-multiple-elements-from-a-component-with-react-16/
        const Aux = (props: any) => props.children

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
                                    label={getElectionLabel(
                                        electionsToShowAsTabs.length,
                                        election,
                                        isHistoricalElectionShown,
                                        browserBreakpoint
                                    )}
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
                    containerStyle={{ padding: 10, paddingBottom: 56 }} /* Height of BottomNav */
                >
                    {elections.map((election: IElection) => {
                        let sub
                        let fullYear = new Date(election.election_day).getFullYear()
                        if (lastYear === undefined || lastYear !== fullYear) {
                            sub = <Subheader>{fullYear}</Subheader>
                            lastYear = fullYear
                        }

                        return (
                            <Aux key={election.id}>
                                {sub}
                                <ElectionCardContainer onClick={() => onChooseElection(election)}>
                                    <ElectionCard>
                                        <CardHeader
                                            title={election.name}
                                            subtitle={new Date(election.election_day).toLocaleDateString("en-AU", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                            avatar={
                                                <Avatar size={50} style={{ fontSize: 20 }}>
                                                    {getElectionVeryShortName(election)}
                                                </Avatar>
                                                // tslint:disable-next-line:jsx-curly-spacing
                                            }
                                        />
                                        {/* <CardText>{renderElectionStats(election)}</CardText>
                                    <CardActions>
                                        <RaisedButton label="View Election" primary={true} />
                                    </CardActions> */}
                                    </ElectionCard>
                                </ElectionCardContainer>
                            </Aux>
                        )
                    })}

                    {/* <ElectionsFlexboxContainer>
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
                    </ElectionsFlexboxContainer> */}
                </FullscreenDialog>
            </div>
        )
    }
}

export default ElectionChooser
