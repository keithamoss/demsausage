import copy from 'copy-to-clipboard'
import * as React from 'react'
import { connect } from 'react-redux'
import { IElection } from '../../redux/modules/elections'
import { getPollingPlacePermalink, IPollingPlace } from '../../redux/modules/polling_places'
import { IStore } from '../../redux/modules/reducer'
import { sendNotification } from '../../redux/modules/snackbars'
import PollingPlaceCardMini from './PollingPlaceCardMini'

interface IProps {
  pollingPlace: IPollingPlace
  election: IElection
  showFullCard?: boolean
  showCopyLinkButton?: boolean
}

interface IStoreProps {}

interface IDispatchProps {
  onClickCopyLink: Function | undefined
}

interface IStateProps {}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class PollingPlaceCardMiniContainer extends React.PureComponent<TComponentProps, IStateProps> {
  render() {
    const { pollingPlace, election, showFullCard, showCopyLinkButton, onClickCopyLink } = this.props

    return (
      <PollingPlaceCardMini
        pollingPlace={pollingPlace}
        election={election}
        showFullCardDefault={showFullCard !== undefined ? showFullCard : false}
        showMoreLessButton={showFullCard !== true}
        showCopyLinkButton={showCopyLinkButton !== false}
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
)(PollingPlaceCardMiniContainer)
