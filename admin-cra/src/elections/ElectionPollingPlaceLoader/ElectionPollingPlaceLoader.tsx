import { Checkbox, List, TextField } from 'material-ui'
import { ListItem } from 'material-ui/List'
// import "./ElectionPollingPlaceLoader.css"
import RaisedButton from 'material-ui/RaisedButton'
import { greenA200, red500 } from 'material-ui/styles/colors'
import { ActionInfo, AlertWarning } from 'material-ui/svg-icons'
import AlertError from 'material-ui/svg-icons/alert/error'
import EditorInsertDriveFile from 'material-ui/svg-icons/editor/insert-drive-file'
import FileFileUpload from 'material-ui/svg-icons/file/file-upload'
import * as React from 'react'
import { Link } from 'react-router'
import { IElection } from '../../redux/modules/elections'
import { IPollingPlaceLoaderResponseMessages } from '../../redux/modules/polling_places'

interface IProps {
  election: IElection
  file: File | undefined
  error: boolean | undefined
  messages: IPollingPlaceLoaderResponseMessages | undefined
  onFileUpload: any
  onConfigChange: any
  onCheckDryRun: any
}

class ElectionPollingPlaceLoader extends React.PureComponent<IProps, {}> {
  onFileChange: any

  onConfigChange: any

  onCheckDryRun: any

  constructor(props: IProps) {
    super(props)

    this.onFileChange = this.uploadFile.bind(this)
    this.onConfigChange = this.props.onConfigChange.bind(this)
    this.onCheckDryRun = this.props.onCheckDryRun.bind(this)
  }

  uploadFile(e: any) {
    if (e.target.files[0] !== undefined) {
      this.props.onFileUpload(e.target.files[0])
    }
  }

  render() {
    const { election, file, error, messages } = this.props

    return (
      <div>
        <h1>{election.name}</h1>

        <TextField
          name="config"
          multiLine={true}
          floatingLabelText="JSON config"
          hintText="JSON config to use during polling places ingest"
          fullWidth={true}
          onChange={this.onConfigChange}
        />
        <br />
        <br />

        <Checkbox label="Dry run?" defaultChecked={true} onCheck={this.onCheckDryRun} />
        <br />
        <br />

        <RaisedButton
          containerElement="label"
          icon={<FileFileUpload />}
          label="Choose polling place CSV file to upload"
          labelColor="white"
          primary={true}
        >
          <input onChange={this.onFileChange} style={{ display: 'none' }} type="file" />
        </RaisedButton>

        {file !== undefined && (
          <ListItem
            primaryText={`${file.name} (${file.type})`}
            secondaryText={`${(file.size / 1048576).toFixed(3)}MB`}
            leftIcon={<EditorInsertDriveFile />}
            disabled={true}
          />
        )}

        {messages !== undefined && error === true && (
          <React.Fragment>
            <ListItem
              primaryText="There was a problem loading the polling places. Please review the logs below for further information."
              leftIcon={<AlertError color={red500} />}
              disabled={true}
            />
            <h2>{messages.message}</h2>
          </React.Fragment>
        )}

        {error === false && (
          <div>
            <ListItem
              primaryText="Polling places have been loaded successfully."
              leftIcon={<AlertError color={greenA200} />}
              disabled={true}
            />
            <RaisedButton label="Yay! 👏" primary={true} containerElement={<Link to="/elections/" />} />
          </div>
        )}

        {messages !== undefined && messages.logs.info.length > 0 && (
          <div>
            <h2>Info</h2>
            <List>
              {messages.logs.info.map((message: string, index: number) => (
                // eslint-disable-next-line react/no-array-index-key
                <ListItem key={index} primaryText={message} leftIcon={<ActionInfo />} disabled={true} />
              ))}
            </List>
          </div>
        )}

        {messages !== undefined && messages.logs.errors.length > 0 && (
          <div>
            <h2>Errors</h2>
            <List>
              {messages.logs.errors.map((message: string, index: number) => (
                // eslint-disable-next-line react/no-array-index-key
                <ListItem key={index} primaryText={message} leftIcon={<AlertError />} disabled={true} />
              ))}
            </List>
          </div>
        )}

        {messages !== undefined && messages.logs.warnings.length > 0 && (
          <div>
            <h2>Warnings</h2>
            <List>
              {messages.logs.warnings.map((message: string, index: number) => (
                // eslint-disable-next-line react/no-array-index-key
                <ListItem key={index} primaryText={message} leftIcon={<AlertWarning />} disabled={true} />
              ))}
            </List>
          </div>
        )}
      </div>
    )
  }
}

export default ElectionPollingPlaceLoader
