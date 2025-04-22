import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import { getDefaultOGMetaTags } from '../../app/ui/socialSharingTagsHelpers';
import { StyledInteractableBoxFullHeight } from '../../app/ui/styledInteractableBoxFullHeight';
import { mapaThemePrimaryGrey } from '../../app/ui/theme';
import { getBaseURL } from '../../app/utils';
import { getAllFoodsAvailableOnStalls, getSupportingIconsForAboutPage, standaloneIconSize } from '../icons/iconHelpers';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
	'& h3:first-of-type': {
		marginTop: theme.spacing(1),
	},
}));

const Question = styled('h3')(({ theme }) => ({
	borderTop: `3px solid ${mapaThemePrimaryGrey}`,
	marginTop: theme.spacing(3),
	marginBottom: theme.spacing(1),
}));

const Answer = styled('div')(({ theme }) => ({
	fontSize: '14px',
	lineHeight: '24px',
	color: grey[800],
	width: '100%',

	'& > p': {
		marginTop: 0,
		marginBottom: theme.spacing(1),
	},
}));

export default function AboutPage() {
	return (
		<StyledInteractableBoxFullHeight>
			<Helmet>
				<title>FAQs and About Us | Democracy Sausage</title>

				{/* Open Graph: Facebook / Twitter */}
				{getDefaultOGMetaTags()}
				<meta property="og:url" content={`${getBaseURL()}/about/`} />
				<meta property="og:title" content="FAQs and About Us | Democracy Sausage" />
			</Helmet>

			<PageWrapper>
				<Question>What is this?</Question>
				<Answer>A map of sausage and cake availability on election day.</Answer>

				<Question>I still don't understand</Question>
				<Answer>It's practically part of the Australian Constitution. Or something.</Answer>

				<Question>But how do you get all of the sausage sizzles?</Question>
				<Answer>
					<p>
						We crowdsource (or is it crowdsauce?) data from social media, the web, and from the stalls that people
						submit to us on this here website.
					</p>
					<p>
						To let us know about sausage and cake availability (or the absence thereof), the best method is to use the
						"Add stall" functionality on our website - you can submit as either a stall owner or just a 'tip-off' as
						appropriate. You can also contact us via our various social media channels listed below.
					</p>
					<p>
						To make this work, we've also used Australian Electoral Commission polling place data (likewise from the
						state and territory electoral commissions).
					</p>
					Democracy Sausage incorporates data that is © Commonwealth of Australia (Australian Electoral Commission){' '}
					{new Date().getFullYear()}.
				</Answer>

				<Question>What do the all of the icons mean?</Question>
				<Answer sx={{ '& ul': { paddingTop: 0, paddingBottom: 0 } }}>
					<List>
						{getAllFoodsAvailableOnStalls().map((noms) => (
							<ListItemButton key={noms.value}>
								<ListItemIcon sx={{ '& svg': standaloneIconSize }}>{noms.icon.react}</ListItemIcon>
								<ListItemText primary={noms.description} />
							</ListItemButton>
						))}
						{getSupportingIconsForAboutPage().map((noms) => (
							<ListItemButton key={noms.value}>
								<ListItemIcon sx={{ '& svg': standaloneIconSize }}>{noms.icon.react}</ListItemIcon>
								<ListItemText primary={noms.description} />
							</ListItemButton>
						))}
					</List>
				</Answer>

				<Question>What does the halal symbol indicate?</Question>
				<Answer>
					<p>
						Firstly, it's important to note that our site can't actually provide halal certification, and we display the
						symbol based on information submitted to us by the folks running the stalls themselves.
					</p>
					<p>
						The halal symbol we use is widely understood by our users to indicate halal. (From what we understand, it is
						just one of a variation of halal seals / stamps that are used in Australia - though we're happy to be
						corrected on that). For the curious, the ABC's Bush Telegraph has more in their segment{' '}
						<a href="https://www.abc.net.au/radionational/programs/archived/bushtelegraph/halal/5843904">
							What's the big fuss about Halal certification?
						</a>
						.
					</p>
				</Answer>

				<Question>Who are you?</Question>
				<Answer>
					<p>We're six people, three children, three cats, and some birds.</p>
					<p>
						Well, that and a whole bunch of dedicated and hard working volunteers on election days who help out with
						crowdsaucing sausage sizzle locations.
					</p>
					<p>
						We're enthusiastic about democracy sausage and making elections just a little bit more fun. You can email us
						at <a href="mailto:help@democracysausage.org">help@democracysausage.org</a> or else find us on social media:
						<br />
						Bluesky: demsausage.bsky.social
						<br />
						Instagram, Reddit, TikTok, Threads all at ausdemocracysausage
						<br />
						Facebook at AusDemocracySausage
						<br />
						Twitter at DemSausage
					</p>
				</Answer>

				<Question>Who do we need permission from to run a sausage sizzle fundraiser at our school?</Question>
				<Answer>
					Well your school or polling place host site, first of all. Beyond that, your local government may require you
					to get a permit to run a temporary food stall - so give them a call to find out. There's also some pretty
					basic food safety regulations you'll need to abide by - check out foodstandards.gov.au{' '}
					<a href="http://www.foodstandards.gov.au/consumer/safety/faqsafety/pages/foodsafetyfactsheets/charitiesandcommunityorganisationsfactsheets/sausagesizzlesandbar1478.aspx">
						for more information
					</a>
					.
				</Answer>

				<Question>Are you part of any political parties?</Question>
				<Answer>Nope! Democracy Sausage is 100% non-partisan, organic, hormone free, and grass fed.</Answer>

				<Question>Will you share my info with others?</Question>
				<Answer>
					<p>
						If you submit a stall to us, we won't share any personal information about you - such as your email address,
						social media handle, et cetera.
					</p>
					<p>
						We do occasionally work with other websites to share data about sausage sizzles, but we only ever send them
						information about the stalls and locations and polling booths.
					</p>
				</Answer>
			</PageWrapper>
		</StyledInteractableBoxFullHeight>
	);
}
