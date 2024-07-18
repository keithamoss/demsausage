import SecurityIcon from '@mui/icons-material/Security';
import { List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const PrivacyNoticeContainer = styled('div')(({ theme }) => ({
	marginTop: theme.spacing(2),
}));

const StyledListItemIcon = styled(ListItemIcon)(() => ({
	minWidth: '30px',
}));

const StyledListItemText = styled(ListItemText)(() => ({
	'& .MuiListItemText-primary': {
		fontSize: '16px',
		fontWeight: 700,
	},
}));

const PrivacyMessage = styled('div')(() => ({
	fontSize: '14px',
	lineHeight: '24px',
}));

export default function AddStallFormPrivacyNotice() {
	return (
		<PrivacyNoticeContainer>
			<Typography gutterBottom variant="h6" component="div" sx={{ mb: 1 }}>
				A word about privacy
			</Typography>

			<List dense sx={{ paddingTop: 0, paddingBottom: 0, marginBottom: 0, display: 'none' }}>
				<ListItem disableGutters>
					<StyledListItemIcon>
						<SecurityIcon sx={{ color: 'black' }} />
					</StyledListItemIcon>

					<StyledListItemText primary="A word about privacy" />
				</ListItem>
			</List>

			<PrivacyMessage>
				Democracy Sausage loves open data, but we also love privacy and not sharing your data with anyone who
				shouldn&apos;t have it. Without access to open (i.e. publicly available, reusable, and free) polling place data
				from the electoral commissions Democracy Sausage wouldn&apos;t exist, so where we can we like to share the data
				we crowdsauce as open data for others to use.
				<br />
				<br />
				For some elections we&apos;ll allow third parties to display information submitted to Democracy Sausage on their
				websites - e.g. local media outlets who want to show a map of sausage sizzles, other election sausage sizzle
				mapping sites, or companies and political parties running &quot;Where to vote&quot; websites who want to show
				people where to find sausage sizzles. Democracy Sausage is 100% volunteer-run because we love the idea of
				mapping sausage sizzles - we <strong>never</strong> benefit financially or personally from these arrangements.
				<br />
				<br />
				We&apos;ll allow these third parties to use information about your stall (
				<strong>its name, a description of it, and any website address</strong>) and what you have on offer (
				<strong>whether there&apos;s a sausage sizzle, cake stall, et cetera</strong>
				). We <strong>won&apos;t</strong> tell these third parties anything about you (the person who is submitting this
				stall), this includes{' '}
				<strong>
					your email, IP address, and any other personally identifiable information that your phone or laptop transmits
					to us
				</strong>
				. All of the information about where your stall actually is comes from the electoral commissions and is already
				publicly available.
				<br />
				<br />
				Got questions or concerns about any of this? Just get in touch with us at{' '}
				<a href="mailto:ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a> - we&apos;re very happy to
				discuss.
			</PrivacyMessage>
		</PrivacyNoticeContainer>
	);
}
