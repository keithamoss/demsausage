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

			{qaReport.map((item) => (
				<Box
					key={item.type}
					sx={{
						display: 'flex',
						alignItems: 'center',
						backgroundColor: item.passed === false ? red[100] : undefined,
						p: 1,
						mb: 1,
					}}
				>
					<Typography variant="h4">{item.ids.length}</Typography>

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
				</Box>
			))}
		</PageWrapper>
	);
}

export default QualityAssuranceReport;
