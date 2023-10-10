import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';

import { nomsData } from '../icons/noms';

interface Props {
	onChangeFilter: any;
}

export default function SearchFilter(props: Props) {
	const { onChangeFilter } = props;

	const [checked, setChecked] = React.useState<string[]>([]);

	const handleToggle = (value: string, label: string) => () => {
		const currentIndex = checked.indexOf(value);
		const newChecked = [...checked];

		if (currentIndex === -1) {
			newChecked.push(value);
		} else {
			newChecked.splice(currentIndex, 1);
		}

		setChecked(newChecked);

		const filterOptions: any = {};
		Object.values(nomsData).forEach((noms) => {
			filterOptions[noms.value] = newChecked.indexOf(noms.value) !== -1;
		});
		onChangeFilter(filterOptions);
	};

	return (
		<List
			dense
			sx={{
				width: '100%',
				marginTop: 1,
				// marginBottom: 1,
				/*maxWidth: 360, */ bgcolor: 'background.paper',
			}}
		>
			{Object.values(nomsData).map((noms) => {
				const labelId = `checkbox-list-secondary-label-${noms.value}`;
				return (
					<ListItem
						key={noms.value}
						secondaryAction={
							<Checkbox
								edge="end"
								onChange={handleToggle(noms.value, noms.label)}
								checked={checked.indexOf(noms.value) !== -1}
								inputProps={{ 'aria-labelledby': labelId }}
							/>
						}
						disablePadding
					>
						<ListItemButton>
							<ListItemAvatar>
								<Avatar
									alt={`Avatar n°${noms.value + 1}`}
									sx={{ backgroundColor: 'transparent' }}
									// src={`/static/images/avatar/${noms.value + 1}.jpg`}
								>
									{noms.icon}
								</Avatar>
							</ListItemAvatar>
							<ListItemText id={labelId} primary={noms.label} />
						</ListItemButton>
					</ListItem>
				);
			})}
		</List>
	);
}
