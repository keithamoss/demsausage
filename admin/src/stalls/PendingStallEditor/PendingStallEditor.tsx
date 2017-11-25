import * as React from "react"
// import styled from "styled-components"
// import { Link } from "react-router"
import { IStall } from "../../redux/modules/interfaces"
// import "./PendingStallEditor.css"

// import { List, ListItem } from "material-ui/List"

export interface IProps {
    stall: IStall
}

class PendingStallEditor extends React.PureComponent<IProps, {}> {
    render() {
        const { stall } = this.props
        console.log("stall", stall)

        return <div />
    }
}

export default PendingStallEditor
