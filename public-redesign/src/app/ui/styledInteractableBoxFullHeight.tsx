import { Box } from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { appBarHeight } from '../../features/addStall/addStallHelpers';

export const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	overflowY: 'auto',
	height: `100dvh`,
	padding: theme.spacing(2),
	paddingBottom: appBarHeight,
}));
