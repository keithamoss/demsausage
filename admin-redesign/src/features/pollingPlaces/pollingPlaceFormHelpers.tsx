export const getPollingPlaceNameForFormHeading = (premises: string, name: string) => {
	// For elections with polling places
	if (premises !== '' || name !== '') {
		return premises || name;
	}

	return '!! Unable to determine polling place name !!';
};
