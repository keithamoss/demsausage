import * as React from "react"
import { Link } from "react-router"
// import styled from "styled-components"
import { IElection, IPollingPlaceLoaderResponseMessage as IMessage } from "../../redux/modules/interfaces"
// import "./ElectionPollingPlaceLoader.css"

import RaisedButton from "material-ui/RaisedButton"
import { List, ListItem } from "material-ui/List"
import { red500, greenA200 } from "material-ui/styles/colors"
import FileFileUpload from "material-ui/svg-icons/file/file-upload"
import EditorInsertDriveFile from "material-ui/svg-icons/editor/insert-drive-file"
import AlertError from "material-ui/svg-icons/alert/error"
import AlertWarning from "material-ui/svg-icons/alert/warning"
import ActionInfo from "material-ui/svg-icons/action/info"

export interface IProps {
  election: IElection
  file: File | undefined
  error: boolean | undefined
  messages: Array<IMessage>
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

    const errors: Array<IMessage> = messages.filter((value: IMessage) => value.level === "ERROR")
    const info: Array<IMessage> = messages.filter((value: IMessage) => value.level === "INFO")
    const warnings: Array<IMessage> = messages.filter((value: IMessage) => value.level === "WARNING")

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
            primaryText={"There was a problem loading the polling places. Please review the logs below for further information."}
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
            <RaisedButton label={"Create Election"} primary={true} containerElement={<Link to={`/elections/`} />} />
          </div>
        )}

        {info.length > 0 && (
          <div>
            <h2>Info</h2>
            <List>
              {info.map((value: IMessage, index: number) => (
                <ListItem key={index} primaryText={value.message} leftIcon={<ActionInfo />} disabled={true} />
              ))}
            </List>
          </div>
        )}

        {error === true && (
          <div>
            <h2>Errors</h2>
            <List>
              {errors.map((value: IMessage, index: number) => (
                <ListItem key={index} primaryText={value.message} leftIcon={<AlertError />} disabled={true} />
              ))}
            </List>
          </div>
        )}

        {warnings.length > 0 && (
          <div>
            <h2>Warnings</h2>
            <List>
              {warnings.map((value: IMessage, index: number) => (
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
