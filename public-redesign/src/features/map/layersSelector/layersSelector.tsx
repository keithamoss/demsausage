import LayersIcon from '@mui/icons-material/Layers';
import { Badge, Button, Fab } from '@mui/material';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';
import { getStringParamOrUndefined } from '../../../app/routing/routingHelpers';
import { mapaThemePrimaryPurple } from '../../../app/ui/theme';
import { selectActiveElections, selectAllElections } from '../../elections/electionsSlice';
import { getJurisdictionCrestCircleReact } from '../../icons/jurisdictionHelpers';
import ElectionsList from './electionsList';

// Note: We did start down a path of using flexbox to line all of these elements up, but
// ultimately abandoned that as this works well enough!

const LayersSelectorContainer = styled(Box)(() => ({
	position: 'sticky',
	top: 64, // 48px (AppBar) + 16px (two lots of standard padding)
	maxWidth: 350 + 48 + 48, // 350 for an iPhone 15 Pro Max + the 48px padding on left and right
	marginLeft: 'auto',
	paddingLeft: 48,
	paddingRight: 48,
	zIndex: 1050,
}));

const StyledLayersButton = styled(Button)(() => ({
	width: '100%',
	height: 36,
	marginTop: 4, // Just enough to line it up with the vertical centre of the other two elements
	// These next two prevent really long election names from wrapping on smaller screens
	overflow: 'hidden',
	whiteSpace: 'nowrap',
}));

const StyledLayersBadge = styled(Badge)(({ theme }) => ({
	position: 'absolute',
	right: 26, // 24px of padding + 2px to get the edge of the <Button> to line up exactly with the centre of the Fab inside this badge
	'& .MuiBadge-badge': {
		right: 4,
		top: 4,
		backgroundColor: theme.palette.secondary.main,
	},
}));

const StyledFab = styled(Fab)(({ theme }) => ({
	backgroundColor: theme.palette.secondary.main,
	width: '44px',
	height: '44px',
}));

interface Props {
	electionId: number;
}

export default function LayersSelector(props: Props) {
	const { electionId } = props;

	const params = useParams();

	const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

	const activeElections = useAppSelector((state) => selectActiveElections(state));
	const elections = useAppSelector((state) => selectAllElections(state));
	const currentElection = elections.find((e) => e.id === electionId);

	const urlElectionName = getStringParamOrUndefined(params, 'election_name');

	const toggleDrawer = useCallback(
		(open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
			if (
				event.type === 'keydown' &&
				((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
			) {
				return;
			}

			setIsDrawerOpen(open);
		},
		[],
	);

	if (currentElection === undefined) {
		return null;
	}

	return (
		<React.Fragment>
			<LayersSelectorContainer>
				{getJurisdictionCrestCircleReact(currentElection.jurisdiction, {
					position: 'absolute',
					width: 48,
					height: 48,
					left: 23, // Just enough to line the visual centre of the crest up with the edge of the <Button>
					zIndex: 1,
				})}

				<StyledLayersButton
					size="small"
					onClick={toggleDrawer(true)}
					disableTouchRipple
					disableFocusRipple
					disableRipple
					sx={{
						// Disable all visual on hover effects
						'&.MuiButtonBase-root:hover': {
							backgroundColor: 'white',
							boxShadow:
								'0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
						},

						// Option 1: Purple + White
						// backgroundColor: mapaThemePrimaryPurple,
						// color: 'white !important',

						// Option 2: Blue Grey and White
						// backgroundColor: blueGrey[400],
						// color: 'white !important',

						// Option 3: White and Purple
						backgroundColor: 'white',
						color: `${mapaThemePrimaryPurple} !important`,

						boxShadow:
							'0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
					}}
				>
					{elections.find((e) => e.name_url_safe === urlElectionName)?.name}
				</StyledLayersButton>

				<StyledLayersBadge
					badgeContent={activeElections.length > 1 ? activeElections.length : null}
					// badgeContent={2}
					// color="primary"
					sx={{
						'& .MuiBadge-badge': {
							// Option 1: Purple and White
							// backgroundColor: mapaThemePrimaryPurple,
							// color: 'white',

							// Option 2: Blue Grey and White
							// backgroundColor: mapaThemePrimaryPurple,
							// color: 'white',

							// Option 3: White and Purple
							backgroundColor: 'white',
							color: mapaThemePrimaryPurple,

							zIndex: 1100,
						},
					}}
				>
					<StyledFab
						onClick={toggleDrawer(true)}
						color="primary"
						// Option 2: Blue Grey and White
						// color="primary"
						sx={
							{
								// Option 1: Purple and White
								// backgroundColor: 'white',
								// color: mapaThemePrimaryPurple,
								// Option 2: Blue Grey and White
								// backgroundColor: 'white',
								// color: mapaThemePrimaryPurple,
								// Option 3: White and Purple
								// defaults
							}
						}
					>
						<LayersIcon />
					</StyledFab>
				</StyledLayersBadge>
			</LayersSelectorContainer>

			<Drawer anchor="bottom" open={isDrawerOpen} onClose={toggleDrawer(false)}>
				<ElectionsList onToggleDrawer={toggleDrawer} />
			</Drawer>
		</React.Fragment>
	);
}
