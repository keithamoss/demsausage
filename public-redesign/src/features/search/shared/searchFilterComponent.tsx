import { Card } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks/store';
import { Election } from '../../../app/services/elections';
import { mapaThemePrimaryPurple } from '../../../app/ui/theme';
import { selectMapFilterSettings, setMapFilterSettings } from '../../app/appSlice';
import { getAllFoodsAvailableOnStalls, standaloneIconSize } from '../../icons/iconHelpers';
import { IMapFilterSettings } from '../../pollingPlaces/pollingPlacesInterfaces';

interface Props {
	election: Election;
	marginBottom?: number;
}

export default function SearchFilterComponent(props: Props) {
	const { election, marginBottom } = props;

	const dispatch = useAppDispatch();

	const mapFilterSettings = useAppSelector((state) => selectMapFilterSettings(state, election.id));

	const onClickFilterOptionListItemButton = useCallback(
		(value: keyof IMapFilterSettings) => () => {
			dispatch(
				setMapFilterSettings({
					mapFilterSettings: {
						...mapFilterSettings,
						[value]: !mapFilterSettings[value],
					},
					electionId: election.id,
				}),
			);
		},
		[dispatch, election.id, mapFilterSettings],
	);

	const onChangeFilterOption = useCallback(
		(value: keyof IMapFilterSettings) => (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
			dispatch(
				setMapFilterSettings({
					mapFilterSettings: {
						...mapFilterSettings,
						[value]: checked,
					},
					electionId: election.id,
				}),
			);
		},
		[dispatch, election.id, mapFilterSettings],
	);

	return (
		<Card
			variant="outlined"
			sx={{
				marginTop: 1.5,
				marginBottom,
			}}
		>
			<List dense>
				{Object.values(getAllFoodsAvailableOnStalls()).map((noms) => (
					<ListItem
						key={noms.value}
						secondaryAction={
							<Checkbox
								checked={mapFilterSettings[noms.value as keyof IMapFilterSettings] === true}
								onChange={onChangeFilterOption(noms.value as keyof IMapFilterSettings)}
								edge="end"
								sx={{ color: mapaThemePrimaryPurple }}
							/>
						}
						disablePadding
					>
						<ListItemButton onClick={onClickFilterOptionListItemButton(noms.value as keyof IMapFilterSettings)}>
							<ListItemAvatar>
								<Avatar alt={noms.label} sx={{ backgroundColor: 'transparent', '& svg': standaloneIconSize }}>
									{noms.icon.react}
								</Avatar>
							</ListItemAvatar>
							<ListItemText primary={noms.label} />
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</Card>
	);
}
