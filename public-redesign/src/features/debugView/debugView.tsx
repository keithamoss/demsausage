import { Box, List, ListItem, ListItemText, Stack, styled } from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';
import { ListItemButtonLink } from '../../app/ui/link';
import {
	PollingPlaceCardDebugViewEntrypointLayer1,
	PollingPlaceSearchResultsCardDebugViewEntrypointLayer1,
	getPollingPlacePropsFromURL,
} from './debugViewHelpers';

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
					{
						url: '/federal_election_2022/polling_places/Ultimo/Ultimo_Community_Centre/NSW/',
						text: 'Stall with a Red Cross of Shame, entrance instructions, full wheelchair access, and a single division',
					},
					{
						url: '/new_south_wales_election_2019/polling_places/Sydney_Town_Hall/Sydney_Town_Hall/NSW/',
						text: 'Stall with a Red Cross of Shame, no entrance instructions, very very long wheelchair access information, and many many many divisions',
					},
					{
						url: '/federal_election_2022/polling_places/Darlinghurst_South/COMA_Gallery/NSW/',
						text: 'Stall with no reports at all, pretty long entrance instructions, and a single divison',
					},
					{
						url: '/federal_election_2022/polling_places/Pyrmont/Pyrmont_Community_Centre/NSW/',
						text: 'Stall with a BBQ and a Red Cross of Shame (how?), free text other noms, a pretty long stall description, a medium length entrance description, as well as wheelchair access, a single division, and opening hours',
					},
					{
						url: "/federal_election_2022/polling_places/Kings_Cross/St_Johns'_Anglican_Church_Hall/NSW/",
						text: 'Stall with a BBQ, reports of having run out of food, a stall title, a short stall description, free text noms, a long-ish entrance description, wheelchair access, two divisions, and opening hours',
					},
					{
						url: '/tasmanian_election_2018/polling_places/Branxholm_Community_Hall/TAS/',
						text: 'Stall with a BBQ and cake, no stall name, no stall description, no wheelchair access, no booth info, no opening hours, and no division',
					},
				]
					.filter((item, index) => index >= 0)
					.map((item, index) => {
						const { electionName, pollinPlaceName, pollingPlacePremises, pollingPlaceState } =
							getPollingPlacePropsFromURL(item.url);

						return (
							<React.Fragment key={index}>
								<ListItem component={'div'}>
									<ListItemText primary={item.url.split('/')[4].replace(/_/g, ' ')} secondary={item.text} />
									<ListItemButtonLink to={item.url} primary="Redesign" target="_blank" />
									<ListItemButtonLink to={`https://democracysausage.org${item.url}`} primary="Legacy" target="_blank" />
								</ListItem>

								<Stack direction="row" spacing={2} sx={{ marginBottom: 2 }}>
									<Box sx={{ width: 390, border: '1px solid grey' }}>
										<PollingPlaceSearchResultsCardDebugViewEntrypointLayer1
											electionName={electionName}
											name={pollinPlaceName}
											premises={pollingPlacePremises}
											state={pollingPlaceState}
										/>
									</Box>

									<Box sx={{ width: 390, border: '1px solid grey' }}>
										<PollingPlaceCardDebugViewEntrypointLayer1
											electionName={electionName}
											name={pollinPlaceName}
											premises={pollingPlacePremises}
											state={pollingPlaceState}
										/>
									</Box>
								</Stack>

								<Stack direction="row" spacing={2} sx={{ marginBottom: 4 }}>
									<iframe
										src={`https://public.test.democracysausage.org${item.url}?debugViewShowMiniCard`}
										scrolling="no"
										loading="lazy"
										width="390"
										height="844"
										style={{ border: '1px solid grey' }}
									/>
									<iframe
										src={`https://public.test.democracysausage.org${item.url}`}
										scrolling="no"
										loading="lazy"
										width="390"
										height="844"
										style={{ border: '1px solid grey' }}
									/>
								</Stack>
							</React.Fragment>
						);
					})}
			</List>
		</StyledInteractableBoxFullHeight>
	);
}
