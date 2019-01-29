import IconButton from "material-ui/IconButton"
import LinearProgress from "material-ui/LinearProgress"
import { ListItem } from "material-ui/List"
import RaisedButton from "material-ui/RaisedButton"
import { red600, yellow600 } from "material-ui/styles/colors"
import {
    FileCloudDownload,
    FileFileUpload,
    ImageRemoveRedEye,
    NavigationRefresh,
    ToggleStar,
    ToggleStarBorder,
} from "material-ui/svg-icons"
// import "./ElectionsManager.css"
import { Table, TableBody, TableRow, TableRowColumn } from "material-ui/Table"
import * as React from "react"
import { browserHistory, Link } from "react-router"
import styled from "styled-components"
import { IElection } from "../../redux/modules/elections"

const TableRowNoBorder = styled(TableRow)`
    border-bottom: none !important;
`

// Fixes issues with tooltips and tables
// https://github.com/mui-org/material-ui/issues/5912
const TableRowColumnWithIconButtons = styled(TableRowColumn)`
    overflow: visible !important;
`

const ElectionTableRowColumn = styled(TableRowColumn)`
    padding-left: 0px !important;
`

const LinearProgressChunky = styled(LinearProgress)`
    height: 10px !important;
`

export interface IProps {
    elections: Array<IElection>
    onMakeElectionPrimary: any
    onDownloadElection: any
    onRegenerateElectionGeoJSON: any
}

class ElectionsManager extends React.PureComponent<IProps, {}> {
    onClickElection: Function
    onClickFileUpload: Function
    onMakeElectionPrimary: Function

    constructor(props: any) {
        super(props)

        this.onClickElection = (election: any) => {
            browserHistory.push(`/election/${election.id}/`)
        }
        this.onClickFileUpload = (election: any) => {
            browserHistory.push(`/election/${election.id}/load_polling_places/`)
        }
        this.onMakeElectionPrimary = (election: any) => {
            this.props.onMakeElectionPrimary(election.id)
        }
    }

    render() {
        const { elections, onDownloadElection, onRegenerateElectionGeoJSON } = this.props

        return (
            <div>
                <RaisedButton label={"Create Election"} primary={true} containerElement={<Link to={`/election/new`} />} />

                <Table selectable={false}>
                    <TableBody displayRowCheckbox={false}>
                        {elections.map((election: IElection) => {
                            const withDataPercentage = (election.stats.with_data / election.stats.total) * 100

                            return (
                                <TableRowNoBorder key={election.id} selectable={false}>
                                    <ElectionTableRowColumn>
                                        <ListItem
                                            primaryText={election.name}
                                            secondaryText={new Date(election.election_day).toLocaleDateString("en-AU", {
                                                weekday: "long",
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                            onClick={this.onClickElection.bind(this, election)}
                                        />
                                        {election.polling_places_loaded === true && (
                                            <div
                                                title={`${election.stats.with_data} of ${
                                                    election.stats.total
                                                } polling places have data (${Math.round(withDataPercentage)}%)`}
                                            >
                                                <LinearProgressChunky mode="determinate" value={withDataPercentage} />
                                            </div>
                                        )}
                                    </ElectionTableRowColumn>
                                    <TableRowColumnWithIconButtons>
                                        {election.is_primary === true && (
                                            <IconButton
                                                tooltip={"This election is the primary election"}
                                                onClick={this.onMakeElectionPrimary.bind(this, election)}
                                            >
                                                <ToggleStar color={yellow600} />
                                            </IconButton>
                                        )}
                                        {election.is_primary === false && (
                                            <IconButton
                                                tooltip={"Make this election the primary election"}
                                                onClick={this.onMakeElectionPrimary.bind(this, election)}
                                            >
                                                <ToggleStarBorder hoverColor={yellow600} />
                                            </IconButton>
                                        )}
                                        {/* {election.is_active ? (
                                            <IconButton tooltip={"This election is live!"}>
                                                <ActionPowerSettingsNew color={green500} />
                                            </IconButton>
                                        ) : null} */}
                                        {election.is_hidden ? (
                                            <IconButton tooltip={"This election is hidden - only admins can see it"}>
                                                <ImageRemoveRedEye color={red600} />
                                            </IconButton>
                                        ) : null}
                                    </TableRowColumnWithIconButtons>
                                    <TableRowColumnWithIconButtons>
                                        <IconButton
                                            tooltip="Load a new polling places file"
                                            onClick={this.onClickFileUpload.bind(this, election)}
                                        >
                                            <FileFileUpload />
                                        </IconButton>
                                        <IconButton
                                            tooltip="Download this election as an Excel file"
                                            onClick={onDownloadElection.bind(this, election)}
                                        >
                                            <FileCloudDownload />
                                        </IconButton>
                                        <IconButton
                                            tooltip="Refresh the map data for this election"
                                            onClick={onRegenerateElectionGeoJSON.bind(this, election)}
                                        >
                                            <NavigationRefresh />
                                        </IconButton>
                                    </TableRowColumnWithIconButtons>
                                </TableRowNoBorder>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        )
    }
}

export default ElectionsManager
