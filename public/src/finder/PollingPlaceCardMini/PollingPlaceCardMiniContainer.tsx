import * as React from "react"
import { connect } from "react-redux"
import { IElection } from "../../redux/modules/elections"
import { IPollingPlace } from "../../redux/modules/polling_places"
import { IStore } from "../../redux/modules/reducer"
import { sendNotification } from "../../redux/modules/snackbars"
import PollingPlaceCardMini from "./PollingPlaceCardMini"

export interface IProps {
    pollingPlace: IPollingPlace
    election: IElection
    copyLinkEnabled?: boolean
}

export interface IStoreProps {}

export interface IDispatchProps {
    onClickCopyLink: Function | undefined
}

export interface IStateProps {}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class PollingPlaceCardMiniContainer extends React.PureComponent<TComponentProps, IStateProps> {
    render() {
        const { pollingPlace, election, copyLinkEnabled, onClickCopyLink } = this.props

        return (
            <PollingPlaceCardMini
                pollingPlace={pollingPlace}
                election={election}
                copyLinkEnabled={copyLinkEnabled === true ? true : false}
                onClickCopyLink={onClickCopyLink}
            />
        )
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    return {}
}

const mapDispatchToProps = (dispatch: Function, ownProps: IProps): IDispatchProps => {
    return {
        onClickCopyLink() {
            dispatch(sendNotification(`Polling place link copied to clipboard.`))
        },
    }
}

const PollingPlaceCardMiniContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(PollingPlaceCardMiniContainer)

export default PollingPlaceCardMiniContainerWrapped
