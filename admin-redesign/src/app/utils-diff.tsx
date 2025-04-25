import { diffWords } from 'diff';

export const DiffGreenSXProps = {
	backgroundColor: '#ddfae1',
	color: '#3b5338',
	display: 'inline-block',
};

export const DiffRedSXPropsNoStrikethrough = {
	backgroundColor: '#fcdfde',
	color: '#b29c96',
	display: 'inline-block',
};

export const DiffRedSXProps = {
	...DiffRedSXPropsNoStrikethrough,
	textDecoration: 'line-through',
};

export const diffWordsAndFormat = (oldValue: string | undefined, newValue: string | undefined) => {
	const textDiff = diffWords(oldValue || '', newValue || '');

	const elements: JSX.Element[] = [];

	for (const part of textDiff) {
		const style = part.added ? DiffGreenSXProps : part.removed ? DiffRedSXProps : undefined;

		elements.push(
			<span key={part.value} style={style}>
				{part.value}
			</span>,
		);
	}

	return elements;
};
