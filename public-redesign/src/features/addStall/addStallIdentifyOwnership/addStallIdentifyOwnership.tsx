import { FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import React, { useState } from 'react';

interface Props {
	onDone: () => void;
}

export default function AddStallIdentifyOwnership(props: Props) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { onDone } = props;

	// const params = useParams();
	// const navigate = useNavigate();
	// const location = useLocation();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [whoIsSubmitting, setWhoIsSubmitting] = useState<string>();

	const onChangeWhoIsSubmitting = (input: React.ChangeEvent<HTMLInputElement>, value: string) =>
		setWhoIsSubmitting(value);

	return (
		<React.Fragment>
			<Typography>Foobar foobar foobar</Typography>
			<FormControl>
				{/* <FormLabel id="demo-radio-buttons-group-label">
    Gender
  </FormLabel> */}
				<RadioGroup
					aria-labelledby="demo-radio-buttons-group-label"
					name="radio-buttons-group"
					onChange={onChangeWhoIsSubmitting}
				>
					<FormControlLabel value="owner" control={<Radio />} label="I'm involved in running this stall" />
					<FormControlLabel value="tip_off" control={<Radio />} label="I'm sending a tip-off about a stall I've seen" />
				</RadioGroup>
			</FormControl>
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
