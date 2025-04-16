import { HourglassEmptyOutlined, ThumbDownOffAlt, ThumbUpOffAlt } from '@mui/icons-material';
import { Button } from '@mui/material';
import blueGrey from '@mui/material/colors/blueGrey';
import { type Stall, StallStatus, StallSubmitterType } from '../../app/services/stalls';
import StallSubmitterTypeOwner from '../../assets/stalls/submit_mystall.svg?react';
import StallSubmitterTypeTipOff from '../../assets/stalls/submit_tipoff.svg?react';

export const getStallStatusElement = (
	stallStatus: StallStatus,
	stallPreviousStatus: StallStatus | null,
): JSX.Element => {
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
			if (stallPreviousStatus === StallStatus.Approved) {
				return createButton(<HourglassEmptyOutlined />, '#0389d1', 'Pending (Previously Approved)');
			}

			if (stallPreviousStatus === StallStatus.Declined) {
				return createButton(<HourglassEmptyOutlined />, '#0389d1', 'Pending (Previously Declined)');
			}

			if (stallPreviousStatus === null) {
				return createButton(<HourglassEmptyOutlined />, '#0389d1', 'Pending');
			}

			return createButton(<HourglassEmptyOutlined />, '#0389d1', 'Pending (Previously INVALID_STATUS)');
	}
};

export const isStallATipOff = (stall: Stall) =>
	[StallSubmitterType.TipOff, StallSubmitterType.TipOffRunOut, StallSubmitterType.TipOffRedCrossOfShame].includes(
		stall.submitter_type,
	);

export const getStallSubmitterTypeInfo = (stall: Stall) => {
	switch (stall.submitter_type) {
		case StallSubmitterType.Owner:
			return {
				icon: <StallSubmitterTypeOwner style={{ width: 18, height: 18 }} />,
				label: 'Stall Owner',
			};

		case StallSubmitterType.TipOff:
		case StallSubmitterType.TipOffRunOut:
		case StallSubmitterType.TipOffRedCrossOfShame:
			return {
				icon: <StallSubmitterTypeTipOff style={{ width: 18, height: 18 }} />,
				label: `Tip-off (${stall.tipoff_source_other || stall.tipoff_source})`,
			};
	}
};

export const getStallSubmitterTypeElement = (stall: Stall): JSX.Element => {
	const data = getStallSubmitterTypeInfo(stall);

	return (
		<Button
			size="small"
			disabled={true}
			startIcon={data.icon}
			sx={{ color: `${blueGrey.A700} !important`, flex: 1, justifyContent: 'flex-end' }}
		>
			{data.label}
		</Button>
	);
};

export const getStallSubmitterTypeElementIcon = (stall: Stall) => getStallSubmitterTypeInfo(stall).icon;

export const getStallSubmitterTypeElementLabel = (stall: Stall) => getStallSubmitterTypeInfo(stall).label;

export const doesStallOnlyHaveFreeTextNoms = (stall: Stall) =>
	typeof stall.noms.free_text === 'string' && Object.keys(stall.noms).length === 1;

export const doesStallHaveNomsToShowOnOffer = (stall: Stall) => {
	if (stall.noms.nothing === true) {
		return false;
	}

	if (stall.noms.run_out === true && Object.keys(stall.noms).length === 1) {
		return false;
	}

	if (doesStallOnlyHaveFreeTextNoms(stall) === true) {
		return false;
	}

	return Object.keys(stall.noms).length >= 1;
};
