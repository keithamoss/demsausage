import * as React from "react"
// import styled from "styled-components"
import { Link } from "react-router"
import { IStall } from "../../redux/modules/interfaces"
// import "./PendingStallsManager.css"

import { List, ListItem } from "material-ui/List"

export interface IProps {
    stalls: Array<IStall>
}

class PendingStallsManager extends React.PureComponent<IProps, {}> {
    render() {
        const { stalls } = this.props

        return (
            <List>
                {stalls.map((stall: IStall) => (
                    <ListItem
                        key={stall.id}
                        primaryText={stall.stall_name}
                        secondaryText={stall.polling_place_premises}
                        containerElement={<Link to={`/stalls/${stall.id}/`} />}
                    />
                ))}
            </List>
        )
    }
}

export default PendingStallsManager
