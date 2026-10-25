import { Box, Link, Stack, Typography } from '@mui/material';
import React from 'react';
import type { StallFoodOptions, StallNonFoodOptions } from '../../../app/services/stalls';
import { getAllFoodsAvailableOnStalls, supportingIcons } from '../../icons/iconHelpers';
import { wrapIconWithTooltip } from '../pendingStallsHelpers';

export function NomsIcons({ noms }: { noms: StallFoodOptions & StallNonFoodOptions }) {
	const foodIcons = getAllFoodsAvailableOnStalls();

	return (
		<Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
			{noms.nothing === true &&
				wrapIconWithTooltip(supportingIcons.red_cross.icon.react, supportingIcons.red_cross.description)}

			{foodIcons
				.filter((foodIcon) => noms[foodIcon.value as keyof StallFoodOptions] === true)
				.map((foodIcon) => wrapIconWithTooltip(foodIcon.icon.react, foodIcon.label))}

			{noms.run_out === true &&
				wrapIconWithTooltip(supportingIcons.yellow_minus.icon.react, supportingIcons.yellow_minus.description)}

			{typeof noms.free_text === 'string' && noms.free_text !== '' && (
				<Typography variant="body2" component="span">
					Also: {noms.free_text}
				</Typography>
			)}
		</Stack>
	);
}

const diffFieldLabels: { [key: string]: string } = {
	name: 'Name',
	description: 'Description',
	opening_hours: 'Opening hours',
	website: 'Website',
	email: 'Email',
	noms: 'Food & drink',
};

export const getDiffFieldLabel = (field: string) => diffFieldLabels[field] || field;

export function DiffValue({ value }: { value: unknown }) {
	if (value === null || value === undefined || value === '') {
		return <em>(empty)</em>;
	}

	if (typeof value === 'object') {
		return (
			<Box component="span" sx={{ display: 'inline-flex', verticalAlign: 'middle' }}>
				<NomsIcons noms={value as StallFoodOptions & StallNonFoodOptions} />
			</Box>
		);
	}

	return <span>{String(value)}</span>;
}

export function DetailsGrid({ rows }: { rows: [string, React.ReactNode][] }) {
	return (
		<Box
			sx={{
				display: 'grid',
				gridTemplateColumns: 'max-content 1fr',
				columnGap: 2,
				rowGap: 0.5,
				alignItems: 'center',
			}}
		>
			{rows.map(([label, value]) => (
				<React.Fragment key={label}>
					<Typography variant="body2" color="text.secondary">
						{label}
					</Typography>
					<Box sx={{ typography: 'body2', minWidth: 0, overflowWrap: 'anywhere' }}>{value}</Box>
				</React.Fragment>
			))}
		</Box>
	);
}

export const getWebsiteLink = (website: string) => {
	if (website === '') {
		return '-';
	}

	const href = /^https?:\/\//i.test(website) ? website : `https://${website}`;
	return (
		<Link href={href} target="_blank" rel="noopener noreferrer">
			{website}
		</Link>
	);
};
