import ClearIcon from '@mui/icons-material/Clear';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { styled } from '@mui/material/styles';
import BaconandEggsIcon from '../icons/bacon-and-eggs';
import CakeIcon from '../icons/cake';
import CoffeeIcon from '../icons/coffee';
import HalalIcon from '../icons/halal';
import SausageIcon from '../icons/sausage';
import VegoIcon from '../icons/vego';

interface Props {
	toggleStallFocussed: any;
	toggleUserHasSearched: any;
}

const FlexboxIcons = styled('div')(() => ({
	flexGrow: 1,
	svg: {
		paddingLeft: '5px',
		paddingRight: '5px',
		paddingBottom: '5px',
		width: '30px',
	},
}));

const StyledCardContent = styled(CardContent)(() => ({
	paddingBottom: 0,
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
	paddingTop: theme.spacing(0.5),
}));

export default function StallSearchResults(props: Props) {
	const { toggleStallFocussed, toggleUserHasSearched } = props;

	return (
		<Box sx={{ width: '100%', marginTop: 1 }}>
			<Box
				sx={{
					width: '100%',
					marginBottom: 1,
					display: 'flex',
				}}
			>
				<Button
					size="small"
					sx={{
						flex: 1,
						justifyContent: 'flex-start',
						alignItems: 'flex-start',
						color: 'black !important',
					}}
					disabled={true}
				>
					4 results nearby
				</Button>
				<Button
					size="small"
					startIcon={<ClearIcon />}
					sx={{
						flex: 1,
						alignItems: 'flex-end',
						justifyContent: 'flex-end',
					}}
					onClick={() => {
						toggleUserHasSearched(false);
					}}
				>
					Clear
				</Button>
			</Box>
			<Stack spacing={1}>
				<Card variant="outlined" onClick={toggleStallFocussed}>
					<StyledCardContent>
						<FlexboxIcons>
							<FlexboxIcons>
								<SausageIcon />
								<CakeIcon />
								<VegoIcon />
								<HalalIcon />
								<CoffeeIcon />
								<BaconandEggsIcon />
							</FlexboxIcons>
						</FlexboxIcons>
						{/* <Typography
                    sx={{ fontSize: 14 }}
                    color="text.secondary"
                    gutterBottom
                  >
                    Word of the Day
                  </Typography> */}
						<Typography
							variant="h5"
							component="div"
							sx={{
								fontSize: 16,
								fontWeight: 550,
								textTransform: 'uppercase',
							}}
						>
							Gladstone Views, Gladstone Views Primary School
						</Typography>
						{/* <Typography sx={{ mb: 1.5 }} color="text.secondary"> */}
						<Typography color="text.secondary">Carrick Drive, Gladstone Park 3043</Typography>
						{/* <Typography variant="body2">
                    well meaning and kindly.
                    <br />
                    {'"a benevolent smile"'}
                  </Typography> */}
					</StyledCardContent>
					<StyledCardActions>
						<Button size="small" startIcon={<UnfoldMoreIcon />}>
							Learn More
						</Button>
					</StyledCardActions>
				</Card>

				<Card variant="outlined" onClick={toggleStallFocussed}>
					<StyledCardContent>
						<FlexboxIcons>
							<FlexboxIcons>
								<SausageIcon />
								<CakeIcon />
								<VegoIcon />
								<HalalIcon />
								<CoffeeIcon />
								<BaconandEggsIcon />
							</FlexboxIcons>
						</FlexboxIcons>
						{/* <Typography
            sx={{ fontSize: 14 }}
            color="text.secondary"
            gutterBottom
          >
            Word of the Day
          </Typography> */}
						<Typography
							variant="h5"
							component="div"
							sx={{
								fontSize: 16,
								fontWeight: 550,
								textTransform: 'uppercase',
							}}
						>
							Fisherman's Knob, Sea Views Primary School
						</Typography>
						{/* <Typography sx={{ mb: 1.5 }} color="text.secondary"> */}
						<Typography color="text.secondary">Avast Drive, Ye Matey Park 1234</Typography>
						{/* <Typography variant="body2">
            well meaning and kindly.
            <br />
            {'"a benevolent smile"'}
          </Typography> */}
					</StyledCardContent>
					<StyledCardActions>
						<Button size="small" startIcon={<UnfoldMoreIcon />}>
							Learn More
						</Button>
					</StyledCardActions>
				</Card>

				<Card variant="outlined" onClick={toggleStallFocussed}>
					<StyledCardContent>
						<FlexboxIcons>
							<FlexboxIcons>
								<SausageIcon />
								<CakeIcon />
								<VegoIcon />
								<HalalIcon />
								<CoffeeIcon />
								<BaconandEggsIcon />
							</FlexboxIcons>
						</FlexboxIcons>
						{/* <Typography
            sx={{ fontSize: 14 }}
            color="text.secondary"
            gutterBottom
          >
            Word of the Day
          </Typography> */}
						<Typography
							variant="h5"
							component="div"
							sx={{
								fontSize: 16,
								fontWeight: 550,
								textTransform: 'uppercase',
							}}
						>
							Fisherman's Knob, Sea Views Primary School
						</Typography>
						{/* <Typography sx={{ mb: 1.5 }} color="text.secondary"> */}
						<Typography color="text.secondary">Avast Drive, Ye Matey Park 1234</Typography>
						{/* <Typography variant="body2">
            well meaning and kindly.
            <br />
            {'"a benevolent smile"'}
          </Typography> */}
					</StyledCardContent>
					<StyledCardActions>
						<Button size="small" startIcon={<UnfoldMoreIcon />}>
							Learn More
						</Button>
					</StyledCardActions>
				</Card>

				<Card variant="outlined" onClick={toggleStallFocussed}>
					<StyledCardContent>
						<FlexboxIcons>
							<FlexboxIcons>
								<SausageIcon />
								<CakeIcon />
								<VegoIcon />
								<HalalIcon />
								<CoffeeIcon />
								<BaconandEggsIcon />
							</FlexboxIcons>
						</FlexboxIcons>
						{/* <Typography
    sx={{ fontSize: 14 }}
    color="text.secondary"
    gutterBottom
  >
    Word of the Day
  </Typography> */}
						<Typography
							variant="h5"
							component="div"
							sx={{
								fontSize: 16,
								fontWeight: 550,
								textTransform: 'uppercase',
							}}
						>
							Fisherman's Knob, Sea Views Primary School
						</Typography>
						{/* <Typography sx={{ mb: 1.5 }} color="text.secondary"> */}
						<Typography color="text.secondary">Avast Drive, Ye Matey Park 1234</Typography>
						{/* <Typography variant="body2">
    well meaning and kindly.
    <br />
    {'"a benevolent smile"'}
  </Typography> */}
					</StyledCardContent>
					<StyledCardActions>
						<Button size="small" startIcon={<UnfoldMoreIcon />}>
							Learn More
						</Button>
					</StyledCardActions>
				</Card>

				<Card variant="outlined" onClick={toggleStallFocussed}>
					<StyledCardContent>
						<FlexboxIcons>
							<FlexboxIcons>
								<SausageIcon />
								<CakeIcon />
								<VegoIcon />
								<HalalIcon />
								<CoffeeIcon />
								<BaconandEggsIcon />
							</FlexboxIcons>
						</FlexboxIcons>
						{/* <Typography
    sx={{ fontSize: 14 }}
    color="text.secondary"
    gutterBottom
  >
    Word of the Day
  </Typography> */}
						<Typography
							variant="h5"
							component="div"
							sx={{
								fontSize: 16,
								fontWeight: 550,
								textTransform: 'uppercase',
							}}
						>
							Fisherman's Knob, Sea Views Primary School
						</Typography>
						{/* <Typography sx={{ mb: 1.5 }} color="text.secondary"> */}
						<Typography color="text.secondary">Avast Drive, Ye Matey Park 1234</Typography>
						{/* <Typography variant="body2">
    well meaning and kindly.
    <br />
    {'"a benevolent smile"'}
  </Typography> */}
					</StyledCardContent>
					<StyledCardActions>
						<Button size="small" startIcon={<UnfoldMoreIcon />}>
							Learn More
						</Button>
					</StyledCardActions>
				</Card>
			</Stack>
		</Box>
	);
}
