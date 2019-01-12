// import { ListItem } from "material-ui/List"
import Avatar from "material-ui/Avatar"
import { Card, CardActions, CardHeader } from "material-ui/Card"
import FlatButton from "material-ui/FlatButton"
// import styled from "styled-components"
// import { Link, browserHistory } from "react-router"
// import "./StallLocationCard.css"
import Paper from "material-ui/Paper"
import { ActionHome, ActionQuestionAnswer } from "material-ui/svg-icons"
import * as React from "react"
import { IStallLocationInfo } from "../../redux/modules/stalls"

export interface IProps {
    stallLocationInfo: IStallLocationInfo
    showActions: boolean
    onCancel: any
    onConfirm: any
}

class StallLocationCard extends React.PureComponent<IProps, {}> {
    constructor(props: any) {
        super(props)
        this.onConfirm = this.onConfirm.bind(this)
    }

    onConfirm() {
        this.props.onConfirm(this.props.stallLocationInfo)
    }

    render() {
        const { stallLocationInfo, showActions, onCancel } = this.props

        return (
            <Paper>
                <Card>
                    <CardHeader
                        title={stallLocationInfo.polling_place_name}
                        subtitle={stallLocationInfo.address}
                        avatar={<Avatar icon={<ActionHome />} />}
                        textStyle={{
                            width: "80%",
                            paddingRight: "0px",
                        }} /* Hacky fix for Cards being wider than the screen on mobiles with smaller screens */
                    />
                </Card>

                {showActions && (
                    <Card>
                        <CardHeader
                            title={"Is this where your stall is?"}
                            titleStyle={{ paddingTop: 12 }}
                            avatar={<Avatar icon={<ActionQuestionAnswer />} />}
                            textStyle={{
                                width: "80%",
                                paddingRight: "0px",
                            }} /* Hacky fix for Cards being wider than the screen on mobiles with smaller screens */
                        />
                        <CardActions>
                            <FlatButton label="No" onClick={onCancel} primary={true} />
                            <FlatButton label="Yes" onClick={this.onConfirm} primary={true} />
                        </CardActions>
                    </Card>
                )}
            </Paper>
        )
    }
}

export default StallLocationCard
