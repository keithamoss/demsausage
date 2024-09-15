import { Box, Button, Fade, Paper, Stack, Typography } from '@mui/material';
import TrapFocus from '@mui/material/Unstable_TrapFocus';
import Cookies from 'js-cookie';
import React, { useState } from 'react';

export const MapWelcomeToTheNewWebsite = () => {
	const [isShown, setIsShown] = useState(Cookies.get('hasSeenNewWebsiteWelcomeMessage') === 'true' ? false : true);

	const onClickGotcha = () => {
		setIsShown(false);

		Cookies.set('hasSeenNewWebsiteWelcomeMessage', 'true', {
			expires: 400, // This is the new maximum expiry for cookies in days
		});
	};

	return (
		<React.Fragment>
			{/* Stolen from https://mui.com/material-ui/react-dialog/#non-modal-dialog */}
			<TrapFocus open disableAutoFocus disableEnforceFocus>
				<Fade appear={false} in={isShown}>
					<Paper
						role="dialog"
						square
						variant="outlined"
						tabIndex={-1}
						sx={{
							position: 'fixed',
							bottom: 0,
							left: 0,
							right: 0,
							m: 0,
							p: 2,
							borderWidth: 0,
							borderTopWidth: 1,
							zIndex: 1050,
						}}
					>
						<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
							<Box
								sx={{
									flexShrink: 1,
									alignSelf: { xs: 'flex-start', sm: 'center' },
								}}
							>
								<Typography fontWeight="bold">Welcome to the brand new Democracy Sausage!</Typography>
								<Typography variant="body2">
									We&apos;ve completely redesigned and rebuilt the site for the first time in a decade. We hope
									we&apos;ve squashed all of the bugs, but if you do run across any please give us a shout at{' '}
									<a href="mailto:ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a> 🙂
								</Typography>
							</Box>

							<Stack
								gap={2}
								direction={{
									xs: 'row-reverse',
									sm: 'row',
								}}
								sx={{
									flexShrink: 0,
									alignSelf: { xs: 'flex-end', sm: 'center' },
								}}
							>
								<Button size="small" onClick={onClickGotcha} variant="contained">
									Gotcha
								</Button>
							</Stack>
						</Stack>
					</Paper>
				</Fade>
			</TrapFocus>

			{/* <Box
				sx={{
					position: 'absolute',
					bottom: '24px',
					width: '96%',
					zIndex: 1050,
					padding: '8px',
				}}
			>
				<Alert
					severity="success"
					icon={<WavingHandOutlinedIcon fontSize="inherit" />}
					action={
						<Button color="inherit" size="small">
							Gotcha
						</Button>
					}
				>
					<AlertTitle>Welcome to the brand new Democracy Sausage site!</AlertTitle>
					We&apos;ve completely redesigned and rebuilt the site for the first time in a decade. We hope we&apos;ve
					squashed all of the bugs, but if you do run across any please give us a shout at{' '}
					<a href="mailto:ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a>. Cheers!
				</Alert>
			</Box>

			<Dialog
				open={false}
				// onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">{"Use Google's location service?"}</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Let Google help apps determine location. This means sending anonymous location data to Google, even when no
						apps are running.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button>Disagree</Button>
					<Button autoFocus>Agree</Button>
				</DialogActions>
			</Dialog> */}
		</React.Fragment>
	);
};
