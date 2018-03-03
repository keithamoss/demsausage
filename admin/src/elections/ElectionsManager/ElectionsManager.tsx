import * as React from "react"
import styled from "styled-components"
import { Link, browserHistory } from "react-router"
import { IElection } from "../../redux/modules/interfaces"
// import "./ElectionsManager.css"

import { Table, TableBody, TableRow, TableRowColumn } from "material-ui/Table"

import { ListItem } from "material-ui/List"
import RaisedButton from "material-ui/RaisedButton"
import IconButton from "material-ui/IconButton"
import { FileFileUpload, FileCloudDownload, ActionCheckCircle, ImageRemoveRedEye, NavigationRefresh } from "material-ui/svg-icons"
import { green500, red600 } from "material-ui/styles/colors"

// Fixes issues with tooltips and tables
// https://github.com/mui-org/material-ui/issues/5912
const TableRowColumnWithIconButtons = styled(TableRowColumn)`
    overflow: visible !important;
`

const ElectionTableRowColumn = styled(TableRowColumn)`
    padding-left: 0px !important;
`

export interface IProps {
    elections: Array<IElection>
    onDownloadElection: any
    onRegenerateElectionGeoJSON: any
}

class ElectionsManager extends React.PureComponent<IProps, {}> {
    onClickElection: Function
    onClickFileUpload: Function

    constructor(props: any) {
        super(props)

        this.onClickElection = (election: any) => {
            browserHistory.push(`/election/${election.id}/`)
        }
        this.onClickFileUpload = (election: any) => {
            browserHistory.push(`/election/${election.id}/load_polling_places/`)
        }
    }

    render() {
        const { elections, onDownloadElection, onRegenerateElectionGeoJSON } = this.props

        return (
            <div>
                <RaisedButton label={"Create Election"} primary={true} containerElement={<Link to={`/election/new`} />} />

                <Table selectable={false}>
                    <TableBody displayRowCheckbox={false}>
                        {elections.map((election: IElection) => (
                            <TableRow key={election.id} selectable={false}>
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
                                </ElectionTableRowColumn>
                                <TableRowColumnWithIconButtons>
                                    {election.is_active ? (
                                        <IconButton tooltip={"This election is live!"}>
                                            <ActionCheckCircle color={green500} />
                                        </IconButton>
                                    ) : null}
                                    {election.hidden ? (
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
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }
}

export default ElectionsManager
