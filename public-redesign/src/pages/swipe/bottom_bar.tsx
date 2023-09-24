import AddLocationIcon from '@mui/icons-material/AddLocation';
// import MoreVertIcon from "@mui/icons-material/MoreVert";
import PublicIcon from '@mui/icons-material/Public';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SearchIcon from '@mui/icons-material/Search';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { Link } from 'react-router-dom';

import Paper from '@mui/material/Paper';

import * as React from 'react';

interface Props {}

// @TODO Is it possible to use the Link component from MaterialUI?

export default function BottomBar(props: Props) {
	const [value, setValue] = React.useState(null);

	return (
		// <Box sx={{ width: "100%", zIndex: 2000, position: "absolute", bottom: 0 }}>
		<Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 2000 }} elevation={3}>
			<BottomNavigation
				showLabels
				value={value}
				onChange={(event, newValue) => {
					setValue(newValue);
				}}
			>
				<BottomNavigationAction label="Map" icon={<PublicIcon />} component={Link} to="/" />
				<BottomNavigationAction label="Search" icon={<SearchIcon />} />
				<BottomNavigationAction label="Add Stall" icon={<AddLocationIcon />} />
				<BottomNavigationAction label="Stats" icon={<QueryStatsIcon />} />
				{/* <BottomNavigationAction label="More" icon={<MoreVertIcon />} /> */}
			</BottomNavigation>
		</Paper>
	);
}
