import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks/store';
import { selectMapFilterOptions, setMapFilterOptions } from '../../../app/appSlice';
import { IMapFilterOptions, NomsOptionsAvailable } from '../../../icons/noms';

export default function SearchBarFilter() {
	const dispatch = useAppDispatch();

	const mapFilterOptions = useAppSelector((state) => selectMapFilterOptions(state));

	const onClickFilterOptionListItemButton = (value: keyof IMapFilterOptions) => () => {
		dispatch(
			setMapFilterOptions({
				...mapFilterOptions,
				[value]: !mapFilterOptions[value],
			}),
		);
	};

	const onChangeFilterOption =
		(value: keyof IMapFilterOptions) => (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
			dispatch(
				setMapFilterOptions({
					...mapFilterOptions,
					[value]: checked,
				}),
			);
		};

	return (
		<List
			dense
			sx={{
				width: '100%',
				marginTop: 1,
				bgcolor: 'background.paper',
			}}
		>
			{Object.values(NomsOptionsAvailable).map((noms) => (
				<ListItem
					key={noms.value}
					secondaryAction={
						<Checkbox
							checked={mapFilterOptions[noms.value as keyof IMapFilterOptions] === true}
							onChange={onChangeFilterOption(noms.value as keyof IMapFilterOptions)}
							edge="end"
						/>
					}
					disablePadding
				>
					<ListItemButton onClick={onClickFilterOptionListItemButton(noms.value as keyof IMapFilterOptions)}>
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
	);
}
