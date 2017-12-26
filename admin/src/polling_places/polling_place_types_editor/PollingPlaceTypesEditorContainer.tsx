import * as React from "react"
import { connect } from "react-redux"
import styled from "styled-components"

import PollingPlaceTypesEditor from "./PollingPlaceTypesEditor"
import { IStore, IElection, IPollingPlace } from "../../redux/modules/interfaces"
import { fetchAllPollingPlaces, updatePollingPlace } from "../../redux/modules/polling_places"

import { GridTile } from "material-ui/GridList"
import CommunicationLocationOff from "material-ui/svg-icons/communication/location-off"

const EmptyState = styled.div`
  max-width: 250px;
  max-height: 250px;
  opacity: 0.4;
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`

const CenteredCommunicationLocationOff = styled(CommunicationLocationOff)`
  width: 125px !important;
  height: 125px !important;
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`

export interface IStoreProps {
  election: IElection
  pollingPlaces: Array<IPollingPlace>
  pollingPlaceTypes: Array<string>
}

export interface IDispatchProps {
  fetchInitialState: Function
  updatePollingPlaceType: Function
}

export interface IStateProps {}

interface IRouteProps {
  electionIdentifier: string
}

interface IOwnProps {
  params: IRouteProps
}

export class PollingPlaceTypesEditorContainer extends React.PureComponent<IStoreProps & IDispatchProps, IStateProps> {
  componentDidMount() {
    const { fetchInitialState, election } = this.props
    fetchInitialState(election)
  }

  render() {
    const { pollingPlaces, pollingPlaceTypes, election, updatePollingPlaceType } = this.props

    if (election.db_table_name === "") {
      return (
        <EmptyState>
          <GridTile
            title={
              <div>
                We don't have any polling<br />places for this election yet :(
              </div>
            }
            titleBackground={"rgb(255, 255, 255)"}
            titleStyle={{ color: "black" }}
          >
            <CenteredCommunicationLocationOff />
          </GridTile>
        </EmptyState>
      )
    }

    return (
      <PollingPlaceTypesEditor
        pollingPlaces={pollingPlaces}
        pollingPlaceTypes={pollingPlaceTypes}
        onChangeType={(value: string, pollingPlace: IPollingPlace) => {
          updatePollingPlaceType(election, pollingPlace, value)
        }}
      />
    )
  }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
  const { elections, polling_places } = state

  return {
    election: elections.elections[ownProps.params.electionIdentifier],
    pollingPlaces: polling_places.by_election[ownProps.params.electionIdentifier] || [],
    pollingPlaceTypes: polling_places.types,
  }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
  return {
    fetchInitialState: (election: IElection) => {
      if (election.db_table_name !== "") {
        dispatch(fetchAllPollingPlaces(election))
      }
    },
    updatePollingPlaceType: (election: IElection, pollingPlace: IPollingPlace, newType: string) => {
      dispatch(updatePollingPlace(election, pollingPlace, { polling_place_type: newType }))
    },
  }
}

const PollingPlaceTypesEditorContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(PollingPlaceTypesEditorContainer)

export default PollingPlaceTypesEditorContainerWrapped
