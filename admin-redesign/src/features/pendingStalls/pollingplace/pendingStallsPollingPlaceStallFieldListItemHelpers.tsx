import {
	AccessTimeFilled,
	Description,
	EmailOutlined,
	LocalOffer,
	QuestionMark,
	Restaurant,
	Title,
	Web,
} from '@mui/icons-material';
import { ListItemText, styled } from '@mui/material';
import type { PendingStall, StallFoodOptions } from '../../../app/services/stalls';
import { mapaThemePrimaryGrey } from '../../../app/ui/theme';
import { mergeJSXElementsItemsWithOxfordComma } from '../../../app/utils';
import { DiffGreenSXProps, DiffRedSXProps, diffWordsAndFormat } from '../../../app/utils-diff';
import { getAllFoodsAvailableOnStalls } from '../../icons/iconHelpers';
import { getNomsDescriptiveTextWithoutFreeText } from '../../pollingPlaces/pollingPlaceHelpers';

type FieldNamesTextFields = 'name' | 'description' | 'opening_hours' | 'website' | 'email';

type FieldNamesNoms = 'noms' | 'noms.free_text';

export type FieldNames = FieldNamesTextFields | FieldNamesNoms;

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
	marginTop: theme.spacing(0),
	'& .MuiListItemText-primary': {
		color: mapaThemePrimaryGrey,
		fontWeight: 700,
	},
}));

export const getFieldIcon = (fieldName: FieldNames) => {
	switch (fieldName) {
		case 'name':
			return <Title sx={{ color: mapaThemePrimaryGrey }} />;
		case 'description':
			return <Description sx={{ color: mapaThemePrimaryGrey }} />;
		case 'opening_hours':
			return <AccessTimeFilled sx={{ color: mapaThemePrimaryGrey }} />;
		case 'website':
			return <Web sx={{ color: mapaThemePrimaryGrey }} />;
		case 'noms':
			return <Restaurant sx={{ color: mapaThemePrimaryGrey }} />;
		case 'noms.free_text':
			return <LocalOffer sx={{ color: mapaThemePrimaryGrey }} />;
		case 'email':
			return <EmailOutlined sx={{ color: mapaThemePrimaryGrey }} />;
		default:
			return <QuestionMark sx={{ color: mapaThemePrimaryGrey }} />;
	}
};

export const getFieldValue = (fieldName: FieldNames, stall: PendingStall) => {
	if (fieldName === 'noms') {
		return getNomsDescriptiveTextWithoutFreeText(stall.noms);
	}

	if (fieldName === 'noms.free_text') {
		return stall.noms.free_text || '';
	}

	return stall[fieldName] || '';
};

const getNomsDescriptiveTextWithoutFreeTextAndWithVisualDiff = (stall: PendingStall) => {
	const fieldDiff = stall.diff?.find((item) => item.field === 'noms');

	const elements: JSX.Element[] = [];

	// If noms haven't changed, just stringify the noms and be done with it
	if (fieldDiff === undefined) {
		return getNomsDescriptiveTextWithoutFreeText(stall.noms);
	}

	// Loop through the defined list of available noms so we always maintain a consistent order
	getAllFoodsAvailableOnStalls().map((option) => {
		const isNoChangedNoms =
			fieldDiff.new[option.value as keyof StallFoodOptions] === true &&
			fieldDiff.old[option.value as keyof StallFoodOptions] === true;
		const isNewNoms =
			fieldDiff.new[option.value as keyof StallFoodOptions] === true &&
			fieldDiff.old[option.value as keyof StallFoodOptions] === undefined;
		const isRemovedNoms =
			fieldDiff.new[option.value as keyof StallFoodOptions] === undefined &&
			fieldDiff.old[option.value as keyof StallFoodOptions] === true;

		if (isNoChangedNoms === true || isNewNoms === true || isRemovedNoms === true) {
			elements.push(
				<span
					key={option.value}
					style={isNewNoms === true ? DiffGreenSXProps : isRemovedNoms === true ? DiffRedSXProps : undefined}
				>
					{option.label.toLowerCase()}
				</span>,
			);
		}
	});

	return mergeJSXElementsItemsWithOxfordComma(elements);
};

export const getNomsStyledListItemText = (fieldLabel: string, stall: PendingStall) => (
	<StyledListItemText
		sx={{
			'& .MuiListItemText-secondary > *:first-of-type:first-letter': { textTransform: 'capitalize' },
			'& .MuiListItemText-secondary:first-letter': { textTransform: 'capitalize' },
		}}
		primary={fieldLabel}
		secondary={getNomsDescriptiveTextWithoutFreeTextAndWithVisualDiff(stall)}
	/>
);

const getFreeTextNomsDescriptiveTextWithVisualDiff = (stall: PendingStall) => {
	const fieldDiff = stall.diff?.find(
		(item) => item.field === 'noms' && ('free_text' in item.new || 'free_text' in item.old),
	);

	// If the field hasn't changed, just return the value and be done with it
	if (fieldDiff === undefined) {
		return stall.noms.free_text || <em>Not provided</em>;
	}

	if (typeof fieldDiff.old === 'object' && typeof fieldDiff.new === 'object') {
		return diffWordsAndFormat(fieldDiff.old.free_text, fieldDiff.new.free_text);
	}

	return <em>INVALID_NO_ONE_SHOULD_EVER_SEE_THIS</em>;
};

export const getFreeTextNomsStyledListItemText = (fieldLabel: string, stall: PendingStall) => (
	<StyledListItemText primary={fieldLabel} secondary={getFreeTextNomsDescriptiveTextWithVisualDiff(stall)} />
);

const getTextFieldDescriptiveTextWithVisualDiff = (fieldName: FieldNamesTextFields, stall: PendingStall) => {
	const fieldDiff = stall.diff?.find((item) => item.field === fieldName);

	// If the field hasn't changed, just return the value and be done with it
	if (fieldDiff === undefined) {
		return `${stall[fieldName]}` || <em>Not provided</em>;
	}

	if (typeof fieldDiff.old === 'string' && typeof fieldDiff.new === 'string') {
		return diffWordsAndFormat(fieldDiff.old, fieldDiff.new);
	}

	return <em>INVALID_NO_ONE_SHOULD_EVER_SEE_THIS</em>;
};

export const getTextFieldStyledListItemText = (
	fieldName: FieldNamesTextFields,
	fieldLabel: string,
	stall: PendingStall,
) => (
	<StyledListItemText
		primary={fieldLabel}
		secondary={getTextFieldDescriptiveTextWithVisualDiff(fieldName, stall)}
		sx={fieldName === 'website' ? { '& .MuiListItemText-secondary': { wordWrap: 'break-word' } } : undefined}
	/>
);
