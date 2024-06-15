import Avatar from 'material-ui/Avatar';
import { List, ListItem } from 'material-ui/List';
import ActionStore from 'material-ui/svg-icons/action/store';
import * as React from 'react';
import reactStringReplace from 'react-string-replace';
import styled from 'styled-components';
import { IPollingPlace } from '../../redux/modules/polling_places';

interface IProps {
	searchText?: string;
	searchResults: Array<IPollingPlace> | undefined;
	onChoosePollingPlace: any;
}

const HighlightedString = styled.span`
	color: purple;
	font-weight: bold !important;
`;

class PollingPlaceAutocompleteList extends React.PureComponent<IProps, {}> {
	render() {
		const { searchText, searchResults, onChoosePollingPlace } = this.props;

		return (
			<div>
				{searchResults !== undefined && searchResults.length > 0 && (
					<List>
						{searchResults.map((pollingPlace: IPollingPlace, _index: number) => {
							const primaryTextString =
								pollingPlace.name === pollingPlace.premises
									? pollingPlace.name
									: `${pollingPlace.name}, ${pollingPlace.premises}`;
							const primaryText = reactStringReplace(primaryTextString, searchText, (match: string, i: number) => (
								<HighlightedString key={i}>{match}</HighlightedString>
							));
							const secondaryText = reactStringReplace(
								`${pollingPlace.address}, ${pollingPlace.state}`,
								searchText,
								(match: string, i: number) => <HighlightedString key={i}>{match}</HighlightedString>,
							);

							return (
								<ListItem
									key={pollingPlace.id}
									leftAvatar={<Avatar icon={<ActionStore />} />}
									primaryText={primaryText}
									secondaryText={secondaryText}
									secondaryTextLines={2}
									onClick={(_event: any) => {
										onChoosePollingPlace(pollingPlace);
									}}
								/>
							);
						})}
					</List>
				)}
			</div>
		);
	}
}

export default PollingPlaceAutocompleteList;
