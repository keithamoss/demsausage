import { RaisedButton } from 'material-ui';
import * as React from 'react';
import styled from 'styled-components';
import PollingPlaceCardMiniContainer from '../../finder/PollingPlaceCardMini/PollingPlaceCardMiniContainer';
import { IElection } from '../../redux/modules/elections';
import { IPollingPlace } from '../../redux/modules/polling_places';

const Container = styled.div`
	padding: 20px;
`;

const RaisedButtonPadded = styled(RaisedButton)`
	margin-top: 20px;
`;

interface IProps {
	pollingPlace: IPollingPlace;
	election: IElection;
	onViewOnMap: any;
}

type TComponentProps = IProps;
class PollingPlacePermalink extends React.PureComponent<TComponentProps, {}> {
	private onViewOnMap: any;

	constructor(props: TComponentProps) {
		super(props);

		this.onViewOnMap = (_event: React.MouseEvent<HTMLElement>) => props.onViewOnMap(props.election, props.pollingPlace);
	}

	render() {
		const { pollingPlace, election } = this.props;

		return (
			<Container>
				<PollingPlaceCardMiniContainer
					pollingPlace={pollingPlace}
					election={election}
					showFullCard={window.location.search !== '?debugViewShowMiniCard' ? true : false}
				/>

				<RaisedButtonPadded label="View on Map" primary={true} onClick={this.onViewOnMap} />
			</Container>
		);
	}
}

export default PollingPlacePermalink;
