import { Box, List, ListItem, ListItemText, styled } from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';
import { ListItemButtonLink } from '../../app/ui/link';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	padding: theme.spacing(1),
	overflowY: 'auto',
	height: `90dvh`,
}));

export default function DebugView() {
	return (
		<StyledInteractableBoxFullHeight>
			<List>
				{[
					{
						url: '/federal_election_2022/polling_places/Bayswater/Bayswater_Community_Centre/WA/',
						text: 'No stall, mixed chance of sausage, and no wheelchair access',
					},
					{
						url: '/federal_election_2022/polling_places/Embleton/Embleton_Primary_School/WA/',
						text: 'No stall, strong chance of sausage, and full wheelchair access',
					},
					{
						url: '/federal_election_2022/polling_places/Bedford/Filipino_Australian_Club/WA/',
						text: 'No stall, never had a report, and no wheelchair access',
					},
					{
						url: '/federal_election_2022/polling_places/Ashfield/Cyril_Jackson_Senior_Campus/WA/',
						text: 'Stall with all food options, including free text, opening hours, a website, and full wheelchair access',
					},
					{
						url: '/federal_election_2022/polling_places/Bayswater_North/Hillcrest_Primary_School/WA/',
						text: 'Stall with some food options, no free text, opening hours, no website, and assisted wheelchair access',
					},
					{
						url: '/federal_election_2022/polling_places/Belmont/Belmont_Primary_School/WA/',
						text: 'Stall with just a sausage sizzle, opening hours, no website, and assisted wheelchair access',
					},
					{
						url: '/referendum_2023/polling_places/Mentone/Mentone_Primary_School/VIC/',
						text: 'Stall with two noms options, no opening hours, and no website',
					},
					{
						url: '/federal_election_2022/polling_places/Australian_Embassy/GERMANY,_Berlin/Overseas/',
						text: 'Overseas stall with just a sausage sizzle and free text, polling place booth info, opening hours, all divisions, opening hours, and a website',
					},
				]
					.filter((item, index) => index >= 0)
					.map((item, index) => (
						<React.Fragment key={index}>
							<ListItem component={'div'}>
								<ListItemText primary={item.url.split('/')[4].replace(/_/g, ' ')} secondary={item.text} />
								<ListItemButtonLink to={item.url} primary="Redesign" />
								<ListItemButtonLink to={`https://democracysausage.org${item.url}`} primary="Legacy" target="_blank" />
							</ListItem>

							<iframe
								src={`${item.url}?showSearchResultsCardForDebug`}
								scrolling="no"
								loading="lazy"
								width="390"
								height="844"
								style={{ border: '1px solid grey', marginRight: 16 }}
							/>

							<iframe
								src={item.url}
								scrolling="no"
								loading="lazy"
								width="390"
								height="844"
								style={{ border: '1px solid grey', marginRight: 16 }}
							/>

							<iframe
								src={`https://democracysausage.org${item.url}`}
								scrolling="no"
								loading="lazy"
								width="390"
								height="844"
								style={{ border: '1px solid grey' }}
							/>
						</React.Fragment>
					))}
			</List>
		</StyledInteractableBoxFullHeight>
	);
}
