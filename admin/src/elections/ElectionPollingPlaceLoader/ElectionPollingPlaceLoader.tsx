import { List, ListItem } from "material-ui/List"
// import styled from "styled-components"
// import "./ElectionPollingPlaceLoader.css"
import RaisedButton from "material-ui/RaisedButton"
import { greenA200, red500 } from "material-ui/styles/colors"
import ActionInfo from "material-ui/svg-icons/action/info"
import AlertError from "material-ui/svg-icons/alert/error"
import AlertWarning from "material-ui/svg-icons/alert/warning"
import EditorInsertDriveFile from "material-ui/svg-icons/editor/insert-drive-file"
import FileFileUpload from "material-ui/svg-icons/file/file-upload"
import * as React from "react"
import { Link } from "react-router"
import { IElection } from "../../redux/modules/elections"
import { IPollingPlaceLoaderResponseMessage, PollingPlaceLoaderResponseMessageStatus } from "../../redux/modules/polling_places"

export interface IProps {
    election: IElection
    file: File | undefined
    error: boolean | undefined
    messages: Array<IPollingPlaceLoaderResponseMessage>
    onFileUpload: any
}

class ElectionPollingPlaceLoader extends React.PureComponent<IProps, {}> {
    onFileChange: any

    constructor(props: any) {
        super(props)

        this.onFileChange = this.uploadFile.bind(this)
    }

    uploadFile(e: any) {
        if (e.target.files[0] !== undefined) {
            this.props.onFileUpload(e.target.files[0])
        }
    }

    render() {
        const { election, file, error, messages } = this.props

        const info: Array<IPollingPlaceLoaderResponseMessage> = messages.filter(
            (value: IPollingPlaceLoaderResponseMessage) => value.level === PollingPlaceLoaderResponseMessageStatus.INFO
        )
        const errors: Array<IPollingPlaceLoaderResponseMessage> = messages.filter(
            (value: IPollingPlaceLoaderResponseMessage) => value.level === PollingPlaceLoaderResponseMessageStatus.ERROR
        )
        const checks: Array<IPollingPlaceLoaderResponseMessage> = messages.filter(
            (value: IPollingPlaceLoaderResponseMessage) => value.level === PollingPlaceLoaderResponseMessageStatus.CHECK
        )
        const warnings: Array<IPollingPlaceLoaderResponseMessage> = messages.filter(
            (value: IPollingPlaceLoaderResponseMessage) => value.level === PollingPlaceLoaderResponseMessageStatus.WARNING
        )

        return (
            <div>
                <h1>{election.name}</h1>

                <RaisedButton
                    containerElement="label"
                    icon={<FileFileUpload />}
                    label="Select polling place CSV file"
                    labelColor="white"
                    primary={true}
                >
                    <input onChange={this.onFileChange} style={{ display: "none" }} type="file" />
                </RaisedButton>

                {file !== undefined && (
                    <ListItem
                        primaryText={`${file.name} (${file.type})`}
                        secondaryText={`${(file.size / 1048576).toFixed(3)}MB`}
                        leftIcon={<EditorInsertDriveFile />}
                        disabled={true}
                    />
                )}

                {error === true && (
                    <ListItem
                        primaryText={
                            "There was a problem loading the polling places. Please review the logs below for further information."
                        }
                        leftIcon={<AlertError color={red500} />}
                        disabled={true}
                    />
                )}

                {error === false && (
                    <div>
                        <ListItem
                            primaryText={"Polling places have been loaded successfully."}
                            leftIcon={<AlertError color={greenA200} />}
                            disabled={true}
                        />
                        <RaisedButton label={"Yay! 👏"} primary={true} containerElement={<Link to={`/elections/`} />} />
                    </div>
                )}

                {info.length > 0 && (
                    <div>
                        <h2>Info</h2>
                        <List>
                            {info.map((value: IPollingPlaceLoaderResponseMessage, index: number) => (
                                <ListItem key={index} primaryText={value.message} leftIcon={<ActionInfo />} disabled={true} />
                            ))}
                        </List>
                    </div>
                )}

                {error === true && (
                    <div>
                        <h2>Errors</h2>
                        <List>
                            {errors.map((value: IPollingPlaceLoaderResponseMessage, index: number) => (
                                <ListItem key={index} primaryText={value.message} leftIcon={<AlertError />} disabled={true} />
                            ))}
                        </List>
                    </div>
                )}

                {checks.length > 0 && (
                    <div>
                        <h2>Hey you, check these!</h2>
                        <List>
                            {checks.map((value: IPollingPlaceLoaderResponseMessage, index: number) => (
                                <ListItem key={index} primaryText={value.message} leftIcon={<AlertWarning />} disabled={true} />
                            ))}
                        </List>
                    </div>
                )}

                {warnings.length > 0 && (
                    <div>
                        <h2>Warnings</h2>
                        <List>
                            {warnings.map((value: IPollingPlaceLoaderResponseMessage, index: number) => (
                                <ListItem key={index} primaryText={value.message} leftIcon={<AlertWarning />} disabled={true} />
                            ))}
                        </List>
                    </div>
                )}
            </div>
        )
    }
}

export default ElectionPollingPlaceLoader
