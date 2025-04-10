import EmailIcon from '@mui/icons-material/Email';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
	useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import { getDefaultOGMetaTags } from '../../app/ui/socialSharingTagsHelpers';
import { StyledInteractableBoxFullHeight } from '../../app/ui/styledInteractableBoxFullHeight';
import { getBaseURL } from '../../app/utils';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
	'& h3:first-of-type': {
		marginTop: theme.spacing(1),
	},
}));

const mediaReleases = [
	{
		title: 'Federal Election 2025',
		date: 'April 11th 2025',
		filename: '2025 Federal Election Media Release - 11 April.pdf',
	},
	{
		title: 'Federal Election 2022',
		date: 'April 10th 2022',
		filename: '2022 Federal Election Media Release - 10 April.pdf',
	},
	{
		title: 'WA Election 2021',
		date: 'March 6th 2021',
		filename: '2021 WA Election Media Release - 6 March.pdf',
	},
	{
		title: 'ACT & QLD Elections 2020',
		date: 'October 11th 2020',
		filename: '2020 ACT and QLD Election Media Release - 11 October.pdf',
	},
	{
		title: 'NT Election 2020',
		date: 'August 18th 2020',
		filename: '2020 NT Election Media Release - 18 August.pdf',
	},
	{
		title: 'Federal Election 2019',
		date: 'May 17th 2019',
		filename: '2019 Federal Election Media Release - 17 May.pdf',
	},
	{
		title: 'Federal Election 2019',
		date: 'April 13th 2019',
		filename: '2019 Federal Election Media Release - 13 April.pdf',
	},
	{
		title: 'Federal Election 2016',
		date: 'July 2nd 2016',
		filename: '2016 Federal Election Media Release - 2 July.pdf',
	},
	{
		title: 'Canning By-election 2015',
		date: 'September 17th 2015',
		filename: '2016 Canning By-election Media Release - 17 September.pdf',
	},
];

export default function MediaPage() {
	const theme = useTheme();

	return (
		<StyledInteractableBoxFullHeight>
			<Helmet>
				<title>Media | Democracy Sausage</title>

				{/* Open Graph: Facebook / Twitter */}
				{getDefaultOGMetaTags()}
				<meta property="og:url" content={`${getBaseURL()}/media/`} />
				<meta property="og:title" content="Media | Democracy Sausage" />
			</Helmet>

			<PageWrapper>
				<Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
					Media
				</Typography>

				<Typography variant="body2" gutterBottom>
					Do you love sausage? We do!
				</Typography>

				<List sx={{ mb: 2 }}>
					<ListItem
						disablePadding
						sx={{
							'& .MuiListItemText-primary': {
								fontWeight: theme.typography.fontWeightMedium,
							},
						}}
					>
						<ListItemButton href={'mailto:media@democracysausage.org'} dense>
							<ListItemIcon>
								<IconButton edge="start" disableRipple>
									<EmailIcon />
								</IconButton>
							</ListItemIcon>
							<ListItemText primary="Media Contact" secondary="media@democracysausage.org" />
						</ListItemButton>
					</ListItem>
				</List>

				<Typography variant="h5" sx={{ fontWeight: 600 }} gutterBottom>
					Media Releases
				</Typography>

				<List>
					{mediaReleases.map((item) => (
						<ListItem
							key={item.filename}
							disablePadding
							sx={{
								'& .MuiListItemText-primary': {
									fontWeight: theme.typography.fontWeightMedium,
								},
							}}
						>
							<ListItemButton href={`/media/${encodeURI(item.filename)}`} target="_blank" dense>
								<ListItemIcon>
									<IconButton edge="start" disableRipple>
										<FileDownloadIcon />
									</IconButton>
								</ListItemIcon>
								<ListItemText primary={item.title} secondary={item.date} />
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</PageWrapper>
		</StyledInteractableBoxFullHeight>
	);
}
