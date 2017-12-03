import * as React from "react"
// import styled from "styled-components"
import { Link } from "react-router"
import { IElection } from "../../redux/modules/interfaces"
// import "./ElectionsManager.css"

import { List, ListItem } from "material-ui/List"
import RaisedButton from "material-ui/RaisedButton"

export interface IProps {
    elections: Array<IElection>
}

class ElectionsManager extends React.PureComponent<IProps, {}> {
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
                            // secondaryText={election.polling_place_premises}
                            containerElement={<Link to={`/election/${election.id}/`} />}
                        />
                    ))}
                </List>
            </div>
        )
    }
}

export default ElectionsManager
