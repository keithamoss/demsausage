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
  margin-bottom: 20px;
`

const ElectionImageURLTextField = styled(TextField)`
  width: 450px !important;
  margin-right: 20px;
`

const ElectionEmbedIFrameCodePreviewContainer = styled.div`
  width: 900px;
  height: 472.5px;
`

const ElectionEmbedIFrameCodePreview = styled.code`
  background-color: #f4f4f4;
  border: 1px solid #e4e2e2;
  display: block;
  padding: 20px;
`

const defaultMapZoomStates = [
  { name: 'Australia', extent: [112.568664550781, -10.1135419412474, 154.092864990234, -44.2422476272383] },
  {
    name: 'Australian Capital Territory',
    extent: [148.677978515625, -35.07496485398955, 149.43603515625, -35.96022296929668],
  },
  {
    name: 'New South Wales',
    extent: [140.6015665303642, -28.13879606611416, 154.1025132963242, -38.02075411828389],
  },
  {
    name: 'Northern Territory',
    extent: [128.14453125, -9.275622176792098, 138.8671875, -26.509904531413923],
  },
  { name: 'Queensland', extent: [137.724609375, -8.494104537551863, 155.478515625, -29.76437737516313] },
  {
    name: 'South Australia',
    extent: [128.58398437499997, -25.48295117535531, 141.591796875, -38.82259097617711],
  },
  { name: 'Tasmania', extent: [142.998046875, -39.19820534889478, 149.1943359375, -44.245199015221274] },
  {
    name: 'Victoria',
    extent: [140.899144152847, -32.0615020550698, 150.074726746086, -39.2320874986644],
  },
  {
    name: 'Western Australia',
    extent: [111.796875, -12.726084296948173, 129.19921874999997, -35.88905007936091],
  },
]

// Used to manufacture defaultMapZoomStates
// const getExtentFromPolygon = (geom: IGeoJSONPoylgon) => {
//   if (geom.type === 'Polygon') {
//     const smallestLongitude = Math.min(...geom.coordinates[0].map((coord) => coord[0]))
//     const biggestLongitude = Math.max(...geom.coordinates[0].map((coord) => coord[0]))
//     const biggestLatitude = Math.min(...geom.coordinates[0].map((coord) => coord[1]))
//     const smallestLatitude = Math.max(...geom.coordinates[0].map((coord) => coord[1]))

//     return [smallestLongitude, smallestLatitude, biggestLongitude, biggestLatitude]
//   }

//   return null
// }

const getEmbedMapURL = (election: IElection, mapEmbedDefaultPosition: [number, number, number, number] | null) => {
  const url = `${getBaseURL()}/${getURLSafeElectionName(election)}?embed`
  if (mapEmbedDefaultPosition !== null) {
    return `${url}&extent=${mapEmbedDefaultPosition}`
  }
  return url
}

export default function EmbedBuilder() {
  const elections = useSelector((state: IStore) => state.elections.elections)

  const [electionId, setElectionId] = React.useState(elections[0].id)
  const election = elections.find((e: IElection) => e.id === electionId)
  const handleChange = (_event: React.ChangeEvent<{ value: unknown }>, _key: number, selectedElectionId: number) => {
    setElectionId(selectedElectionId)
  }

  const [mapEmbedDefaultPosition, setDefaultMapEmbedPosition] = React.useState<[number, number, number, number] | null>(
    null
  )
  const handleDefaultMapPositionChange = (
    _event: React.ChangeEvent<{ value: unknown }>,
    _key: number,
    selectedExtent: [number, number, number, number]
  ) => {
    setDefaultMapEmbedPosition(selectedExtent)
  }

  const [, copy] = useCopyToClipboard()

  if (election === undefined) {
    return null
  }

  const electionImageEmbedURL = `${getAPIBaseURL()}/0.1/map_image/${election.id}/`

  const electionMapEmbedHTML = `<iframe src="${getEmbedMapURL(
    election,
    mapEmbedDefaultPosition
  )}" title="Democracy Sausage"
  scrolling="no"
  loading="lazy"
  allowTransparency="false"
  allowFullScreen="true"
  width="100%"
  height="472.5"
  style="border: none;"></iframe>`

  return (
    <PageWrapper>
      <p>Would you like to embed the Democracy Sausage map on your website?</p>

      <React.Fragment>
        <h2>Choose an election</h2>
        <ElectionSelectField value={electionId} onChange={handleChange} autoWidth={true}>
          {elections.map((e: IElection) => (
            <MenuItem key={e.id} value={e.id} primaryText={e.name} />
          ))}
        </ElectionSelectField>
      </React.Fragment>

      <React.Fragment>
        <h2>Embed an image of the map</h2>
        <img src={electionImageEmbedURL} />

        <br />

        <ElectionImageURLTextField name="embed_image_url" value={electionImageEmbedURL} fullWidth={false} />

        <RaisedButton
          primary={true}
          icon={<ContentCopy />}
          label="Copy link"
          onClick={() => copy(electionImageEmbedURL)}
        />

        <br />
        <br />
      </React.Fragment>

      <React.Fragment>
        <h2>Embed an interactive map</h2>

        <ElectionSelectField
          floatingLabelText="Zoom to an area"
          value={mapEmbedDefaultPosition}
          onChange={handleDefaultMapPositionChange}
          autoWidth={true}
        >
          {defaultMapZoomStates.map((state) => {
            return <MenuItem key={state.name} value={state.extent} primaryText={state.name} />
          })}
        </ElectionSelectField>

        <ElectionEmbedIFrameCodePreviewContainer>
          <iframe
            src={`${getEmbedMapURL(election, mapEmbedDefaultPosition)}`}
            title="Democracy Sausage"
            scrolling="no"
            loading="lazy"
            allowTransparency={false}
            allowFullScreen={true}
            width="100%"
            height="472.5"
            style={{ border: 'none' }}
          />
        </ElectionEmbedIFrameCodePreviewContainer>

        <br />

        <pre>
          <ElectionEmbedIFrameCodePreview>{electionMapEmbedHTML}</ElectionEmbedIFrameCodePreview>
        </pre>

        <RaisedButton
          primary={true}
          icon={<ContentCopy />}
          label="Copy code"
          onClick={() => copy(electionMapEmbedHTML)}
        />
      </React.Fragment>
    </PageWrapper>
  )
}
