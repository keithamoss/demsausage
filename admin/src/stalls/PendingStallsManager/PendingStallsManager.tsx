// import styled from "styled-components"
import { groupBy } from "lodash-es"
// import "./PendingStallsManager.css"
import { List, ListItem } from "material-ui/List"
import Subheader from "material-ui/Subheader"
import { ActionHome } from "material-ui/svg-icons"
import * as React from "react"
import { Link } from "react-router"
import { IElection } from "../../redux/modules/elections"
import { IStall } from "../../redux/modules/stalls"

export interface IProps {
    stalls: Array<IStall>
    elections: Array<IElection>
}

class PendingStallsManager extends React.PureComponent<IProps, {}> {
    render() {
        const { stalls, elections } = this.props

        const stallsByElection: any = groupBy(stalls, "elections_id")

        return (
            <List>
                {Object.keys(stallsByElection).map((electionId: string) => {
                    const election: IElection = elections.find((e: IElection) => e.id === parseInt(electionId, 10))!
                    return (
                        <div key={electionId}>
                            <Subheader key={electionId}>{election.name}</Subheader>
                            {stallsByElection[electionId].map((stall: IStall) => (
                                <ListItem
                                    key={stall.id}
                                    primaryText={stall.stall_name}
                                    secondaryText={
                                        stall.stall_location_info === null
                                            ? stall.polling_place_info.premises
                                            : stall.stall_location_info.polling_place_name
                                    }
                                    leftIcon={<ActionHome />}
                                    containerElement={<Link to={`/stalls/${stall.id}/`} />}
                                />
                            ))}
                        </div>
                    )
                })}
            </List>
        )
    }
}

export default PendingStallsManager
