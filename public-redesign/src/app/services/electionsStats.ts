export interface ISausagelyticsFederalStats {
	australia: IElectionStats;
	states: IElectionStats[];
	divisions: {
		top: IElectionStats[];
		bottom: IElectionStats[];
	};
}

export interface IElectionStats {
	domain: string;
	metadata?: {
		state?: string;
		rank?: number;
	};
	data: IElectionStatsData;
}

export interface IElectionStatsData {
	all_booths: {
		booth_count: number;
		expected_voters: number;
	};
	all_booths_by_noms: {
		[key: string]: IElectionStatsNoms;
	};
}

export interface IElectionStatsNoms {
	booth_count: number;
	expected_voters: number;
}

export interface ISausagelyticsStateStats {
	state: IElectionStateStats;
}

export interface IElectionStateStats {
	domain: string;
	data: IElectionStateStatsData;
}

export interface IElectionStateStatsData {
	all_booths: {
		booth_count: number;
	};
	all_booths_by_noms: {
		[key: string]: IElectionStateStatsNoms;
	};
}

export interface IElectionStateStatsNoms {
	booth_count: number;
}
