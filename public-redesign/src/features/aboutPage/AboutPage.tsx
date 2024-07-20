import { Box, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import { mapaThemePrimaryGrey } from '../../app/ui/theme';
import { getBaseURL } from '../../app/utils';
import { appBarHeight } from '../addStall/addStallHelpers';
import { getAllFoodsAvailableOnStalls, getSupportingIconsForAboutPage, standaloneIconSize } from '../icons/iconHelpers';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	overflowY: 'auto',
	height: `100vh`,
	padding: theme.spacing(2),
	paddingBottom: appBarHeight,
}));

const PageWrapper = styled('div')(({ theme }) => ({
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
	'& h3:first-of-type': {
		marginTop: theme.spacing(1),
	},
}));

const Question = styled('h3')(({ theme }) => ({
	borderTop: `5px solid ${mapaThemePrimaryGrey}`,
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
				<meta property="og:url" content={`${getBaseURL()}/about/`} />
				<meta property="og:title" content="FAQs and About Us | Democracy Sausage" />
			</Helmet>

			<PageWrapper>
				<Question>What is this?</Question>
				<Answer>A map of sausage and cake availability on election day.</Answer>

				<Question>I still don&apos;t understand</Question>
				<Answer>It&apos;s practically part of the Australian Constitution. Or something.</Answer>

				<Question>But how do you get all of the sausage sizzles?</Question>
				<Answer>
					<p>
						We crowdsource (or is it crowdsauce?) data from Twitter, Facebook, and Instagram and from the stalls that
						people submit to us on this here website.
					</p>
					<p>
						To let us know about sausage and cake availability (or the absence thereof), tweet using the hashtag{' '}
						<a href="https://twitter.com/intent/tweet?hashtags=democracysausage">#democracysausage</a> or send us a
						Direct Message. We&apos;ll be keeping an eye out.
					</p>
					<p>To make this work, we&apos;ve also used:</p>
					<ul>
						<li>
							Australian Electoral Commission polling place data (likewise from the various state electoral
							commissions);
						</li>
						<li>
							Social media icons from <a href="https://fontawesome.com">fontawesome.com</a> under a{' '}
							<a href="https://fontawesome.com/license">Creative Commons Attribution 4.0 license</a>
						</li>
					</ul>
					Democracy Sausage incorporates data that is: © Commonwealth of Australia (Australian Electoral Commission){' '}
					{new Date().getFullYear()}
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
						Firstly, it&apos;s important to note that our site can&apos;t actually provide halal certification, and we
						display the symbol based on information submitted to us by the folks running the stalls themselves.
					</p>
					<p>
						The halal symbol we use is widely understood by our users to indicate halal. (From what we understand, it is
						just one of a variation of halal seals / stamps that are used in Australia - though we&apos;re happy to be
						corrected on that). For the curious, the ABC&apos;s Bush Telegraph has more in their segment{' '}
						<a href="https://www.abc.net.au/radionational/programs/archived/bushtelegraph/halal/5843904">
							What&apos;s the big fuss about Halal certification?
						</a>
						.
					</p>
				</Answer>

				<Question>Who are you?</Question>
				<Answer>
					<p>We&apos;re six people, three babies, three cats, and some parrots.</p>
					<p>
						Well, that and a whole bunch of dedicated and hard working volunteers on election days who help out with
						crowdsaucing sausage sizzle locations.
					</p>
					<p>
						We&apos;re enthusiastic about democracy sausage and making elections just a little bit more fun. You can
						find us on Twitter at <a href="http://twitter.com/DemSausage">@DemSausage</a> or email us at{' '}
						<a href="mailto:ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a>.
					</p>
				</Answer>

				<Question>Who do we need permission from to run a sausage sizzle fundraiser at our school?</Question>
				<Answer>
					Well your school, first of all (but you knew that already). Beyond that, your local government may require you
					to get a permit to run a temporary food stall - so give them a call to find out. There&apos;s also some pretty
					basic food safety regulations you&apos;ll need to abide by - check out foodstandards.gov.au{' '}
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
						If you submit a stall to us, we won&apos;t share any personal information about you - such as your email
						address, Twitter handle, et cetera.
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
