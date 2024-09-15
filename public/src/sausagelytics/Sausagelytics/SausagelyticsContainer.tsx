import * as React from 'react';
import { connect } from 'react-redux';
import {
	IElection,
	ISausagelyticsStateStats,
	ISausagelyticsStats,
	fetchElectionStats,
} from '../../redux/modules/elections';
import { IStore } from '../../redux/modules/reducer';
import SausagelyticsFederal from './SausagelyticsFederal';
import SausagelyticsState from './SausagelyticsState';

interface IProps {}

interface IDispatchProps {
	fetchStats: Function;
}

interface IStoreProps {
	currentElection: IElection;
}

interface IStateProps {
	stats: ISausagelyticsStats | ISausagelyticsStateStats | undefined;
}

type TComponentProps = IProps & IStoreProps & IDispatchProps;
class SausagelyticsContainer extends React.Component<TComponentProps, IStateProps> {
	static muiName = 'SausagelyticsContainer';

	static pageTitle = 'Democracy Sausage | Charts, graphs, and data!';

	static pageBaseURL = '/sausagelytics';

	private fetchStats: Function;

	constructor(props: TComponentProps) {
		super(props);

		this.state = { stats: undefined };

		this.fetchStats = (election: IElection) => props.fetchStats(election);
	}

	async UNSAFE_componentWillMount() {
		const { currentElection } = this.props;

		if (currentElection !== undefined) {
			this.setState({ stats: await this.fetchStats(currentElection) });
		}
	}

	render() {
		const { currentElection } = this.props;
		const { stats } = this.state;

		// Not loaded yet
		if (stats === undefined) {
			return null;
		}

		if (stats === null) {
			return <div>No stats are available for this election 😢</div>;
		}

    return currentElection.id === 27 || currentElection.id === 37 || currentElection.id === 53 ? (
      <SausagelyticsFederal election={currentElection} stats={stats as ISausagelyticsStats} />
    ) : (
      <SausagelyticsState election={currentElection} stats={stats as ISausagelyticsStateStats} />
    )
  }
}

const mapStateToProps = (state: IStore): IStoreProps => {
	const { elections } = state;

	return {
		currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
	};
};

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
	return {
		fetchStats: async (election: IElection) => {
			// eslint-disable-next-line @typescript-eslint/return-await
			return await dispatch(fetchElectionStats(election));
		},
	};
};

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
	mapStateToProps,
	mapDispatchToProps,
)(SausagelyticsContainer);
