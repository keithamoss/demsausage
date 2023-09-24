import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import { styled, useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

interface Props {}

const TitleLogo = styled('img')(({ theme }) => ({
	height: '32px',
	marginRight: '10px',
}));

interface Props {
	toggleSideDrawerOpen: any;
	topPadding: boolean;
}

export default function DSAppBar(props: Props) {
	const { toggleSideDrawerOpen, topPadding } = props;

	const theme = useTheme();

	return (
		<AppBar
			// position="static"
			sx={{
				paddingTop: topPadding ? 1 : 0,
				backgroundColor: theme.palette.secondary.main,
				height: '46px !important',
			}}
		>
			<Container maxWidth="xl">
				<Toolbar disableGutters sx={{ minHeight: '46px !important' }}>
					<IconButton
						size="small"
						edge="start"
						color="inherit"
						aria-label="menu"
						sx={{ mr: 1, pointerEvents: 'all' }}
						onClick={toggleSideDrawerOpen}
					>
						<MenuIcon />
					</IconButton>

					<TitleLogo src="https://democracysausage.org/icons/sausage+cake_big.png" />

					<Typography
						variant="h5"
						noWrap
						component="a"
						href=""
						sx={{
							mr: 2,
							display: { xs: 'flex', md: 'none' },
							flexGrow: 1,
							fontWeight: 500,
							color: 'inherit',
							textDecoration: 'none',
						}}
					>
						Democracy Sausage
					</Typography>
				</Toolbar>
			</Container>
		</AppBar>
	);
}
