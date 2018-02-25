import * as React from "react"
// import styled from "styled-components"
// import { Link, browserHistory } from "react-router"
// import "./StallLocationCard.css"
import { IStallLocationInfo } from "../../redux/modules/interfaces"

import Paper from "material-ui/Paper"
import { Card, CardActions, CardHeader } from "material-ui/Card"
import FlatButton from "material-ui/FlatButton"
// import { ListItem } from "material-ui/List"
import Avatar from "material-ui/Avatar"
import { ActionHome, ActionQuestionAnswer } from "material-ui/svg-icons"

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
                    />
                </Card>

                {showActions && (
                    <Card>
                        <CardHeader
                            title={"Is this where your stall is?"}
                            titleStyle={{ paddingTop: 12 }}
                            avatar={<Avatar icon={<ActionQuestionAnswer />} />}
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
