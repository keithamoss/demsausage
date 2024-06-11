import { Card } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks/store';
import { mapaThemePrimaryPurple } from '../../../../app/ui/theme';
import { selectMapFilterSettings, setMapFilterSettings } from '../../../app/appSlice';
import { IMapFilterSettings, NomsOptionsAvailable } from '../../../icons/noms';

interface Props {
	marginBottom?: number;
}

export default function SearchBarFilter(props: Props) {
	const { marginBottom } = props;

	const dispatch = useAppDispatch();

	const mapFilterSettings = useAppSelector((state) => selectMapFilterSettings(state));

	const onClickFilterOptionListItemButton = useCallback(
		(value: keyof IMapFilterSettings) => () => {
			dispatch(
				setMapFilterSettings({
					...mapFilterSettings,
					[value]: !mapFilterSettings[value],
				}),
			);
		},
		[dispatch, mapFilterSettings],
	);

	const onChangeFilterOption = useCallback(
		(value: keyof IMapFilterSettings) => (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
			dispatch(
				setMapFilterSettings({
					...mapFilterSettings,
					[value]: checked,
				}),
			);
		},
		[dispatch, mapFilterSettings],
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
				{Object.values(NomsOptionsAvailable).map((noms) => (
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
								<Avatar alt={noms.label} sx={{ backgroundColor: 'transparent' }}>
									{noms.icon}
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
