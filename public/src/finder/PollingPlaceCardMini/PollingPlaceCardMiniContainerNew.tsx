import copy from 'copy-to-clipboard'
import * as React from 'react'
import { connect } from 'react-redux'
import { IElection } from '../../redux/modules/elections'
import { getPollingPlacePermalink, IPollingPlace } from '../../redux/modules/polling_places'
import { IStore } from '../../redux/modules/reducer'
import { sendNotification } from '../../redux/modules/snackbars'
import PollingPlaceCardMiniNew from './PollingPlaceCardMiniNew'

interface IProps {
  pollingPlace: IPollingPlace
  election: IElection
  showFullCard?: boolean
}

interface IStoreProps {}

interface IDispatchProps {
  onClickCopyLink: Function | undefined
}

interface IStateProps {}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class PollingPlaceCardMiniContainerNew extends React.PureComponent<TComponentProps, IStateProps> {
  render() {
    const { pollingPlace, election, showFullCard, onClickCopyLink } = this.props

    return (
      <PollingPlaceCardMiniNew
        pollingPlace={pollingPlace}
        election={election}
        showFullCardDefault={showFullCard !== undefined ? showFullCard : false}
        showMoreLessButton={showFullCard !== true}
        onClickCopyLink={onClickCopyLink}
      />
    )
  }
}

const mapStateToProps = (_state: IStore): IStoreProps => {
  return {}
}

const mapDispatchToProps = (dispatch: Function, ownProps: IProps): IDispatchProps => {
  return {
    onClickCopyLink() {
      copy(getPollingPlacePermalink(ownProps.election, ownProps.pollingPlace), {
        format: 'text/plain',
      })
      dispatch(sendNotification(`Polling place link copied to clipboard.`))
    },
  }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(PollingPlaceCardMiniContainerNew)
