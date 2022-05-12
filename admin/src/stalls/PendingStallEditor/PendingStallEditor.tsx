import { cloneDeep, isArray, isPlainObject } from 'lodash-es'
import Avatar from 'material-ui/Avatar'
import { CardActions } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
// import "./PendingStallEditor.css"
import { ListItem } from 'material-ui/List'
import { blue500, orange300 } from 'material-ui/styles/colors'
import { AlertWarning } from 'material-ui/svg-icons'
import * as React from 'react'
import styled from 'styled-components'
import PollingPlaceEditorContainer from '../../polling_places/polling_place_editor/PollingPlaceEditorContainer'
import { IElection } from '../../redux/modules/elections'
import { IPendingStall, IStallDiff } from '../../redux/modules/stalls'
import StallInfoCardContainer from '../StallInfoCard/StallInfoCardContainer'

const FlexboxContainer = styled.div`
  display: -ms-flex;
  display: -webkit-flex;
  display: flex;
  flex-direction: row;
  align-items: left;
  justify-content: left;
  /* Or do it all in one line with flex flow */
  flex-flow: row wrap;
  /* tweak where items line up on the row valid values are: 
       flex-start, flex-end, space-between, space-around, stretch */
  align-content: flex-end;
`

const FlexboxColumn = styled.div`
  width: 40%;
  min-width: 340px;
  padding: 10px;
`

interface IProps {
  election: IElection
  stall: IPendingStall
  onPollingPlaceEdited: Function
  onApproveUnofficialStall: any
  onDeclineUnofficialStall: any
}

const applyDiffToStall = (stall: IPendingStall) => {
  if (stall.diff === undefined || stall.diff === null) {
    return stall
  }

  const newStall = cloneDeep(stall) as any

  stall.diff.forEach((diffItem: IStallDiff) => {
    if (isPlainObject(diffItem.old) && isPlainObject(diffItem.new)) {
      // newStall[diffItem.field] = { ...diffItem.old, ...diffItem.new }
      // On second thoughts, no, noms are a replacement and not a merge
      // So really this whole thing can just be a simple object merge at the top-level, right?
      newStall[diffItem.field] = diffItem.new
    } else if (isArray(diffItem.old) && isArray(diffItem.new)) {
      throw Error('Handling arrays in merging stall diffs is not implemented')
    } else {
      // Strings, numbers, and boolean
      newStall[diffItem.field] = diffItem.new
    }
  })

  return newStall
}

class PendingStallEditor extends React.PureComponent<IProps, {}> {
  render() {
    const { stall, election, onPollingPlaceEdited, onApproveUnofficialStall, onDeclineUnofficialStall } = this.props

    return (
      <FlexboxContainer>
        <FlexboxColumn>
          {stall.diff !== null && (
            <ListItem
              primaryText="This stall has been edited since it was first approved"
              secondaryText="Changes are highlighted below"
              leftIcon={<AlertWarning color={orange300} />}
              style={{ marginBottom: 10 }}
            />
          )}
          <StallInfoCardContainer
            stall={stall}
            cardActions={
              <CardActions>
                {stall.polling_place === null && (
                  <FlatButton label="Approve" primary={true} onClick={onApproveUnofficialStall} />
                )}
                <FlatButton label="Decline" primary={true} onClick={onDeclineUnofficialStall} />
              </CardActions>
            }
          />
          <ListItem primaryText={election.name} />
          {election.polling_places_loaded === false && stall.polling_place === null && (
            <ListItem
              leftAvatar={<Avatar icon={<AlertWarning />} backgroundColor={blue500} />}
              primaryText="Notice"
              secondaryText={
                "We don't have official polling places for this election yet. " +
                'Approving will add it to the map as a temporary polling place.'
              }
              secondaryTextLines={2}
              disabled={true}
            />
          )}
        </FlexboxColumn>
        <FlexboxColumn>
          <PollingPlaceEditorContainer
            election={election}
            pollingPlaceId={stall.polling_place !== null ? stall.polling_place.id : null}
            stall={applyDiffToStall(stall)}
            showAutoComplete={false}
            showElectionChooser={false}
            onPollingPlaceEdited={onPollingPlaceEdited}
          />
        </FlexboxColumn>
      </FlexboxContainer>
    )
  }
}

export default PendingStallEditor
