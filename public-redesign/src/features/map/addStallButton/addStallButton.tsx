import AddLocationIcon from '@mui/icons-material/AddLocation';
import { Fab, styled } from '@mui/material';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

const StyledFab = styled(Fab)(({ theme }) => ({
	position: 'absolute',
	bottom: `${16 + 48 + 36}px`, // 16 for standard bottom padding, 48 for the height of <SearchBar />, and then 36 more on top
	right: '16px',
	backgroundColor: theme.palette.secondary.main,
}));

export default function AddStallButton() {
	const navigate = useNavigate();

	const onAddStall = React.useCallback(() => {
		navigate(`/add-stall`);
	}, [navigate]);

	return (
		<StyledFab color="primary" aria-label="The primary button to add a new stall to the map" onClick={onAddStall}>
			<AddLocationIcon />
		</StyledFab>
	);
}
