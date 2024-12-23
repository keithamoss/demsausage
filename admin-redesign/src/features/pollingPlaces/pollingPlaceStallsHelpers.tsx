import { HourglassEmptyOutlined, ThumbDownOffAlt, ThumbUpOffAlt } from '@mui/icons-material';
import { Button } from '@mui/material';
import blueGrey from '@mui/material/colors/blueGrey';
import { type Stall, StallStatus, StallSubmitterType } from '../../app/services/stalls';
import StallSubmitterTypeOwner from '../../assets/stalls/submit_mystall.svg?react';
import StallSubmitterTypeTipOff from '../../assets/stalls/submit_tipoff.svg?react';

export const getStallStatusElement = (stallStatus: StallStatus): JSX.Element => {
	const createButton = (icon: JSX.Element, colour: string, label: string) => (
		<Button
			size="small"
			variant="contained"
			disabled={true}
			startIcon={icon}
			sx={{
				color: 'white !important',
				backgroundColor: `${colour} !important`,
			}}
		>
			{label}
		</Button>
	);

	switch (stallStatus) {
		case StallStatus.Approved:
			return createButton(<ThumbUpOffAlt />, '#2e7d33', 'Approved');

		case StallStatus.Declined:
			return createButton(<ThumbDownOffAlt />, '#922269', 'Denied');

		case StallStatus.Pending:
			return createButton(<HourglassEmptyOutlined />, '#0389d1', 'Pending');
	}
};

export const getStallSubmitterTypeElement = (stall: Stall): JSX.Element => {
	const createButton = (icon: JSX.Element, label: string) => (
		<Button
			size="small"
			disabled={true}
			startIcon={icon}
			sx={{ color: `${blueGrey.A700} !important`, flex: 1, justifyContent: 'flex-end' }}
		>
			{label}
		</Button>
	);

	switch (stall.submitter_type) {
		case StallSubmitterType.Owner:
			return createButton(<StallSubmitterTypeOwner style={{ width: 18, height: 18 }} />, 'Stall Owner');

		case StallSubmitterType.TipOff:
		case StallSubmitterType.TipOffRunOut:
		case StallSubmitterType.TipOffRedCrossOfShame:
			return createButton(
				<StallSubmitterTypeTipOff style={{ width: 18, height: 18 }} />,
				`Tip-off (${stall.tipoff_source_other || stall.tipoff_source})`,
			);
	}
};
