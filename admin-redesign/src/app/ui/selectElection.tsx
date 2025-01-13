import {
	FormControl,
	InputLabel,
	LinearProgress,
	ListItemIcon,
	ListItemText,
	MenuItem,
	Select,
	type SelectChangeEvent,
	type SxProps,
	type Theme,
} from '@mui/material';
import { useCallback } from 'react';
import { getJurisdictionCrestCircleReact } from '../../features/icons/jurisdictionHelpers';
import type { Election } from '../services/elections';
import { theme } from './theme';

interface Props {
	election: Election | undefined;
	label: string;
	formControlSx?: SxProps<Theme>;
	elections: Election[];
	onChooseElection: (election: Election) => void;
	isLoading?: boolean;
}

export const SelectElection = (props: Props) => {
	const { election, label, formControlSx, elections, onChooseElection, isLoading } = props;

	const onSelectChange = useCallback(
		(e: SelectChangeEvent<number | string>) => {
			const electionId = Number.parseInt(`${e.target.value}`);

			if (Number.isNaN(electionId) === false) {
				const election = elections.find((e) => e.id === electionId);

				if (election !== undefined) {
					onChooseElection(election);
				}
			}
		},
		[elections, onChooseElection],
	);

	return (
		<FormControl fullWidth sx={{ mb: 2, ...formControlSx }}>
			<InputLabel id="choose-an-election">{label}</InputLabel>

			<Select labelId="choose-an-election" value={election?.id} label={label} onChange={onSelectChange}>
				{elections.map((e) => (
					<MenuItem key={e.id} value={e.id}>
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<ListItemIcon sx={{ minWidth: 36 }}>
								{getJurisdictionCrestCircleReact(e.jurisdiction, {
									width: 36,
									height: 36,
									paddingRight: theme.spacing(1),
								})}
							</ListItemIcon>

							<ListItemText primary={e.name} />
						</div>
					</MenuItem>
				))}
			</Select>

			{isLoading === true && <LinearProgress color="secondary" />}
		</FormControl>
	);
};
