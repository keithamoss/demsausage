import { MenuItem, RaisedButton, SelectField, TextField } from 'material-ui'
import ContentCopy from 'material-ui/svg-icons/content/content-copy'
import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { useCopyToClipboard } from 'usehooks-ts'
import { getAPIBaseURL, getBaseURL } from '../../redux/modules/app'
import { getURLSafeElectionName, IElection } from '../../redux/modules/elections'
import { IStore } from '../../redux/modules/reducer'

const PageWrapper = styled.div`
  padding-left: 15px;
  padding-right: 15px;
`

const ElectionSelectField = styled(SelectField)`
  width: 350px !important;
`

const ElectionImageURLTextField = styled(TextField)`
  width: 450px !important;
  margin-right: 20px;
`

const ElectionEmbedIFrameCodePreviewContainer = styled.div`
  width: 600px;
  height: 315px;
`

const ElectionEmbedIFrameCodePreview = styled.code`
  background-color: #f4f4f4;
  border: 1px solid #e4e2e2;
  display: block;
  padding: 20px;
`

export default function EmbedBuilder() {
  // const { elections, onChooseElection } = this.props
  const elections = useSelector((state: IStore) => state.elections.elections)
  console.log('elections', elections)

  const [electionId, setElectionId] = React.useState(elections[0].id)
  console.log('election', electionId, setElectionId)
  const election = elections.find((e: IElection) => e.id === electionId)
  console.log('election', election)

  const handleChange = (_event: React.ChangeEvent<{ value: unknown }>, _key: number, selectedElectionId: number) => {
    setElectionId(selectedElectionId)
  }

  const [value, copy] = useCopyToClipboard()
  console.log('value', value)

  if (election === undefined) {
    return null
  }

  const electionImageEmbedURL = `${getAPIBaseURL()}/0.1/map_image/${election.id}/`

  const electionMapEmbedHTML = `<iframe src="${getBaseURL()}/${getURLSafeElectionName(
    election
  )}?embed" title="Democracy Sausage"
  scrolling="no"
  loading="lazy"
  allowTransparency="false"
  allowFullScreen="true"
  width="100%"
  height="315"
  style="border: none;"></iframe>`

  return (
    <PageWrapper>
      <ElectionSelectField
        floatingLabelText="Election"
        value={electionId}
        onChange={handleChange}
        autoWidth={true}
        // fullWidth={true}
      >
        {elections.map((e: IElection) => (
          <MenuItem key={e.id} value={e.id} primaryText={e.name} />
        ))}
      </ElectionSelectField>

      <h2>Embed an image of the map</h2>
      <img src={electionImageEmbedURL} />

      <br />

      <ElectionImageURLTextField value={electionImageEmbedURL} fullWidth={false} />

      <RaisedButton
        primary={true}
        icon={<ContentCopy />}
        label="Copy link"
        onClick={() => copy(electionImageEmbedURL)}
      />

      <h2>Embed an interactive map</h2>

      <ElectionEmbedIFrameCodePreviewContainer>
        <iframe
          src={`${getBaseURL()}/${getURLSafeElectionName(election)}?embed`}
          title="Democracy Sausage"
          scrolling="no"
          loading="lazy"
          allowTransparency={false}
          allowFullScreen={true}
          width="100%"
          height="315"
          style={{ border: 'none' }}
        />
      </ElectionEmbedIFrameCodePreviewContainer>

      <br />

      {/* <ElectionImageURLTextField value={electionMapEmbedHTML} fullWidth={false} multiLine={true} /> */}

      <pre>
        <ElectionEmbedIFrameCodePreview>{electionMapEmbedHTML}</ElectionEmbedIFrameCodePreview>
      </pre>

      <RaisedButton
        primary={true}
        icon={<ContentCopy />}
        label="Copy code"
        onClick={() => copy(electionMapEmbedHTML)}
      />
    </PageWrapper>
  )
}
