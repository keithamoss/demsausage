import { ContentCopy } from '@mui/icons-material';
import { Box, IconButton, LinearProgress, ListItem, ListItemText, Typography, styled } from '@mui/material';
import { red } from '@mui/material/colors';
import ErrorElement from '../../ErrorElement';
import { useGetImpossibilitiesReportQuery } from '../../app/services/elections';
import { isClipboardApiSupported } from '../../app/utils';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(2),
	paddingRight: theme.spacing(2),
}));

function QualityAssuranceReport() {
	const {
		data: qaReport,
		isLoading: isGetImpossibilitiesReportLoading,
		isSuccess: isGetImpossibilitiesReportSuccessful,
		isError: isGetImpossibilitiesReportErrored,
	} = useGetImpossibilitiesReportQuery();

	if (isGetImpossibilitiesReportLoading === true) {
		return <LinearProgress color="secondary" />;
	}

	if (isGetImpossibilitiesReportErrored === true || isGetImpossibilitiesReportSuccessful === false) {
		return <ErrorElement />;
	}

	const onCopyToClipboard = (ids: number[]) => async () => {
		try {
			await navigator.clipboard.writeText(ids.join(', '));
		} catch {
			/* empty */
		}
	};

	return (
		<PageWrapper>
			<Typography variant="body1" sx={{ mb: 1 }}>
				Our quality assurance report for recent elections to identify any "impossibilities" that might be creeping into
				the system.
			</Typography>

			{qaReport.map((item) => {
				const isGrouped = 'ids_by_election' in item;
				const totalCount = isGrouped ? item.ids_by_election.reduce((sum, g) => sum + g.ids.length, 0) : item.ids.length;

				return (
					<Box
						key={item.type}
						sx={{
							backgroundColor: item.passed === false ? red[100] : undefined,
							p: 1,
							mb: 1,
						}}
					>
						{/* Header row: count + check name */}
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							<Typography variant="h4">{totalCount}</Typography>

							{isGrouped ? (
								<ListItem sx={{ pt: 0, pb: 0 }}>
									<ListItemText primary={item.name} sx={{ flexGrow: 1 }} />
								</ListItem>
							) : (
								<ListItem
									secondaryAction={
										item.passed === false && isClipboardApiSupported() === true ? (
											<IconButton edge="end" onClick={onCopyToClipboard(item.ids)}>
												<ContentCopy />
											</IconButton>
										) : undefined
									}
									sx={{ pt: 0, pb: 0 }}
								>
									<ListItemText
										primary={item.name}
										secondary={item.ids.join(', ') || 'Everything is fine 🎉'}
										sx={{ flexGrow: 1 }}
									/>
								</ListItem>
							)}
						</Box>

						{/* Grouped: per-election sub-rows */}
						{isGrouped && item.ids_by_election.length === 0 && (
							<Typography variant="body2" sx={{ pl: 7, pb: 0.5, color: 'text.secondary' }}>
								Everything is fine 🎉
							</Typography>
						)}

						{isGrouped &&
							item.ids_by_election.map((group) => (
								<Box key={group.election_id} sx={{ display: 'flex', alignItems: 'center' }}>
									<ListItem
										secondaryAction={
											isClipboardApiSupported() === true ? (
												<IconButton edge="end" onClick={onCopyToClipboard(group.ids)}>
													<ContentCopy />
												</IconButton>
											) : undefined
										}
										sx={{ pt: 0.5, pb: 0.5 }}
									>
										<ListItemText
											primary={group.election_name}
											primaryTypographyProps={{ variant: 'body2' }}
											secondary={group.ids.join(', ')}
											sx={{ flexGrow: 1 }}
										/>
									</ListItem>
								</Box>
							))}
					</Box>
				);
			})}
		</PageWrapper>
	);
}

export default QualityAssuranceReport;
