import { Typography } from '@mui/material';
import React from 'react';
import { Election } from '../../../app/services/elections';
import SearchComponent from '../../search/searchByAddressOrGPS/searchComponent';

interface Props {
	onDone: () => void;
}

export default function AddStallSelectPollingPlace(props: Props) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { onDone } = props;

	// const params = useParams();
	// const navigate = useNavigate();
	// const location = useLocation();

	return (
		<React.Fragment>
			<Typography>Foobar foobar foobar</Typography>
			<br />
			<SearchComponent
				//   onSearch={toggleUserHasSearched}
				//   filterOpen={filterOpen}
				// onToggleFilter={toggleFilter}
				// onSearch={() => {}}
				// filterOpen={false}
				election={{} as Election}
				// onToggleFilter={() => {}}
				// onClick={() => () => {}}
				// isMapFiltered={false}
				enableFiltering={false}
				// styleProps={{}}
			/>

			{/* <Box sx={{ mb: 2 }}>
    <div>
      <Button
        variant="contained"
        onClick={handleNext}
        sx={{ mt: 1, mr: 1 }}
      >
        Continue
      </Button>
      <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
        Back
      </Button>
    </div>
  </Box> */}
		</React.Fragment>
	);
}
