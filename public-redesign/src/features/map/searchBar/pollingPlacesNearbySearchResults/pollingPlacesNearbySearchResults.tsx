import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

interface Props {
	numberOfResults: number;
	children: JSX.Element[];
}

export default function PollingPlacesNearbySearchResults(props: Props) {
	const { numberOfResults, children } = props;

	return (
		<Box sx={{ width: '100%', marginTop: 1 }}>
			<Box
				sx={{
					width: '100%',
					marginBottom: 1,
					display: 'flex',
				}}
			>
				<Button
					size="small"
					sx={{
						flex: 1,
						justifyContent: 'flex-start',
						alignItems: 'flex-start',
						color: 'black !important',
					}}
					disabled={true}
				>
					{numberOfResults} result{numberOfResults === 0 || numberOfResults > 1 ? 's' : ''} nearby
				</Button>

				{/* <Button
					size="small"
					startIcon={<ClearIcon />}
					sx={{
						flex: 1,
						alignItems: 'flex-end',
						justifyContent: 'flex-end',
					}}
					onClick={() => {
						toggleUserHasSearched(false);
					}}
				>
					Clear
				</Button> */}
			</Box>
			<Stack spacing={1}>{children}</Stack>
		</Box>
	);
}
