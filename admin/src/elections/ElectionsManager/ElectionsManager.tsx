import * as React from "react"
// import styled from "styled-components"
import { Link, browserHistory } from "react-router"
import { IElection } from "../../redux/modules/interfaces"
// import "./ElectionsManager.css"

import { List, ListItem } from "material-ui/List"
import RaisedButton from "material-ui/RaisedButton"
import IconButton from "material-ui/IconButton"
import FileFileUpload from "material-ui/svg-icons/file/file-upload"

export interface IProps {
    elections: Array<IElection>
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
        const { elections } = this.props

        return (
            <div>
                <RaisedButton label={"Create Election"} primary={true} containerElement={<Link to={`/election/new`} />} />
                <List>
                    {elections.map((election: IElection) => (
                        <ListItem
                            key={election.id}
                            primaryText={election.name}
                            secondaryText={
                                <span>
                                    {new Date(election.election_day).toLocaleDateString("en-AU", {
                                        weekday: "long",
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                    {election.is_active ? " (ACTIVE)" : undefined}
                                    {election.hidden ? " (HIDDEN)" : undefined}
                                </span>
                            }
                            onClick={this.onClickElection.bind(this, election)}
                            rightIconButton={
                                <IconButton tooltip="Load polling places" onClick={this.onClickFileUpload.bind(this, election)}>
                                    <FileFileUpload />
                                </IconButton>
                                // tslint:disable-next-line:jsx-curly-spacing
                            }
                        />
                    ))}
                </List>
            </div>
        )
    }
}

export default ElectionsManager
