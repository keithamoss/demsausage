import { Election } from '../../app/services/elections';
import { getAPIBaseURL, getBaseURL } from '../../app/utils';

export const getEmbedStaticMapImageURL = (election: Election) => `${getAPIBaseURL()}/0.1/map_image/${election.id}/`;

// export const embedPrecannedMapBboxes = [
// 	{ name: 'Australia', extent: [112.568664550781, -10.1135419412474, 154.092864990234, -44.2422476272383] },
// 	{
// 		name: 'Australian Capital Territory',
// 		extent: [148.677978515625, -35.07496485398955, 149.43603515625, -35.96022296929668],
// 	},
// 	{
// 		name: 'New South Wales',
// 		extent: [140.6015665303642, -28.13879606611416, 154.1025132963242, -38.02075411828389],
// 	},
// 	{
// 		name: 'Northern Territory',
// 		extent: [128.14453125, -9.275622176792098, 138.8671875, -26.509904531413923],
// 	},
// 	{ name: 'Queensland', extent: [137.724609375, -8.494104537551863, 155.478515625, -29.76437737516313] },
// 	{
// 		name: 'South Australia',
// 		extent: [128.58398437499997, -25.48295117535531, 141.591796875, -38.82259097617711],
// 	},
// 	{ name: 'Tasmania', extent: [142.998046875, -39.19820534889478, 149.1943359375, -44.245199015221274] },
// 	{
// 		name: 'Victoria',
// 		extent: [140.899144152847, -32.0615020550698, 150.074726746086, -39.2320874986644],
// 	},
// 	{
// 		name: 'Western Australia',
// 		extent: [111.796875, -12.726084296948173, 129.19921874999997, -35.88905007936091],
// 	},
// ];

// Used to manufacture embedPrecannedMapBboxes
// const getExtentFromPolygon = (geom: IGeoJSONPoylgon) => {
//   if (geom.type === 'Polygon') {
//     const smallestLongitude = Math.min(...geom.coordinates[0].map((coord) => coord[0]))
//     const biggestLongitude = Math.max(...geom.coordinates[0].map((coord) => coord[0]))
//     const biggestLatitude = Math.min(...geom.coordinates[0].map((coord) => coord[1]))
//     const smallestLatitude = Math.max(...geom.coordinates[0].map((coord) => coord[1]))

//     return [smallestLongitude, smallestLatitude, biggestLongitude, biggestLatitude]
//   }

//   return null
// }

export const getEmbedInteractiveMapURL = (election: Election, defaultBbox: number[] | undefined) => {
	const url = `${getBaseURL()}/${election.name_url_safe}?embed`;
	return defaultBbox !== undefined ? `${url}&extent=${defaultBbox.join(',')}` : url;
};

export const getEmbedInteractiveMapHTML = (
	election: Election,
	defaultBbox: number[] | undefined,
) => `<iframe src="${getEmbedInteractiveMapURL(election, defaultBbox)}" 
  title="Democracy Sausage"
  scrolling="no"
  loading="lazy"
  allowFullScreen="true"
  width="100%"
  height="472.5"
  style="border: none;"></iframe>`;
