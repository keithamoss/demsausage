import * as React from "react"
// import styled from "styled-components"
import { Link } from "react-router"
import { IStall } from "../../redux/modules/interfaces"
// import "./PendingStallsManager.css"

import { List, ListItem } from "material-ui/List"
import { ActionHome } from "material-ui/svg-icons"

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
                        secondaryText={
                            stall.stall_location_info === null
                                ? stall.polling_place_info.premises
                                : stall.stall_location_info.polling_place_name
                        }
                        leftIcon={<ActionHome />}
                        containerElement={<Link to={`/stalls/${stall.id}/`} />}
                    />
                ))}
            </List>
        )
    }
}

export default PendingStallsManager
