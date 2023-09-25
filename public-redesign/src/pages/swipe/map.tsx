import 'ol/ol.css';
import { useAppSelector } from '../../app/hooks';
import { selectElectionById } from '../../features/elections/electionsSlice';
import { IMapFilterOptions } from '../../icons/noms';
import OpenLayersMap from './OpenLayersMap/OpenLayersMap';
import { IMapSearchResults } from './infra/map_stuff';

// const StyledOpenLayersMap = styled(OpenLayersMap)(() => ({
//   position: "absolute",
//   width: "200px",
//   height: "200px",
//   // height: "calc(100vh - 175px - 112px)",
//   // height: "calc(100vh - 175px)",
//   zIndex: 1040,
// }));

interface Props {
	electionId: number;
	mapSearchResults: number | null;
	mapFilterOptions: IMapFilterOptions;
}

export default function Map(props: Props) {
	const { electionId, mapSearchResults, mapFilterOptions } = props;

	const election = useAppSelector((state) => selectElectionById(state, electionId));

	// const election = {
	// 	id: 34,
	// 	name: 'Federal Election 2013',
	// 	short_name: 'FED 2013',
	// 	geom: {
	// 		type: 'Polygon',
	// 		coordinates: [
	// 			[
	// 				[140.2734375, -39.232253141714885],
	// 				[150.73242187500003, -39.232253141714885],
	// 				[150.73242187500003, -33.28461996888768],
	// 				[140.2734375, -33.28461996888768],
	// 				[140.2734375, -39.232253141714885],
	// 			],
	// 		],
	// 	},
	// 	is_hidden: false,
	// 	is_primary: false,
	// 	election_day: '2013-09-07T08:00:00+08:00',
	// 	polling_places_loaded: true,
	// };

	const mapSearchResultsArray = [
		{
			lon: 144.92225294477464,
			lat: -37.77228703019065,
			extent: [144.90931227679806, -37.79525859266615, 144.9531919227886, -37.75317190681365] as any,
			formattedAddress: 'Foobar foobar',
		},
		{
			lon: 145.4739089,
			lat: -37.9169381,
			extent: [145.3531296040862, -38.010189690473965, 145.54602434367877, -37.81607099611173] as any,
			formattedAddress: 'Foobar foobar',
		},
	];

	const onMapBeginLoading = () => {};
	const stashMapData = () => {};
	const onMapLoaded = () => {};
	const onQueryMap = () => {};

	if (election === undefined) {
		return null;
	}

	return (
		<OpenLayersMap
			election={election}
			mapSearchResults={
				mapSearchResults != null ? (mapSearchResultsArray[mapSearchResults] as IMapSearchResults) : null
			}
			mapFilterOptions={mapFilterOptions}
			onMapBeginLoading={onMapBeginLoading}
			onMapDataLoaded={stashMapData}
			onMapLoaded={onMapLoaded}
			onQueryMap={onQueryMap}
		/>
	);
}
