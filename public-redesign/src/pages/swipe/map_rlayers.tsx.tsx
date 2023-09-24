import styled from '@emotion/styled';
import GeoJSON from 'ol/format/GeoJSON';
import { Point } from 'ol/geom';
import 'ol/ol.css';
import { fromLonLat } from 'ol/proj';

// import geojsonFeatures from "../../vic_election.geojson";

import LocationIcon from '../../icons/location.svg';

import { RFeature, RLayerVector, RMap, ROSM, RStyle } from 'rlayers';

const StyledRMap = styled(RMap)(() => ({
	position: 'absolute',
	width: '100%',
	// height: "calc(100vh - 175px - 112px)",
	height: 'calc(100vh - 175px)',
	zIndex: 1040,
}));

interface Props {}

export default function Map(props: Props) {
	return (
		// Create a map, its size is set in the CSS class example-map
		<StyledRMap
			initial={{
				center: fromLonLat([134, -25]),
				zoom: 4,
			}}
			noDefaultControls
		>
			{/* Use an OpenStreetMap background */}
			<ROSM />

			<RLayerVector
				zIndex={5}
				format={new GeoJSON({ featureProjection: 'EPSG:4326' })}
				url="https://public.test.democracysausage.org/api/0.1/map/?election_id=34"
				// features={new GeoJSON({
				//   featureProjection: "EPSG:4326",
				// }).readFeatures(geojsonFeatures)}
				// onPointerEnter={useCallback(
				//   (e) => {
				//     setFlow([...flow, "Entering " + e.target.get("nom")].slice(-16));
				//   },
				//   [flow]
				// )}
			>
				<RStyle.RStyle>
					<RStyle.RStroke color="#007bff" width={3} />
					<RStyle.RFill color="transparent" />
				</RStyle.RStyle>
			</RLayerVector>

			{/* Create a single layer for holding vector features */}
			<RLayerVector zIndex={10}>
				{/* Create a style for rendering the features */}
				<RStyle.RStyle>
					{/* Consisting of a single icon, that is slightly offset
					 * so that its center falls over the center of the feature */}
					<RStyle.RIcon src={LocationIcon} anchor={[0.5, 0.8]} />
				</RStyle.RStyle>
				{/* Create a single feature in the vector layer */}
				<RFeature
					// Its geometry is a point geometry over the monument
					geometry={new Point(fromLonLat([134, -25]))}
					onClick={(e: any) =>
						// e.map is the underlying OpenLayers map - we call getView().fit()
						// to pan/zoom the map over the monument with a small animation
						e.map.getView().fit(e.target.getGeometry().getExtent(), {
							duration: 250,
							maxZoom: 15,
						})
					}
				/>
				<RFeature
					// Its geometry is a point geometry over the monument
					geometry={new Point(fromLonLat([124, -35]))}
					onClick={(e: any) =>
						// e.map is the underlying OpenLayers map - we call getView().fit()
						// to pan/zoom the map over the monument with a small animation
						e.map.getView().fit(e.target.getGeometry().getExtent(), {
							duration: 250,
							maxZoom: 15,
						})
					}
					// style={
					//   <RStyle.RStyle>
					//     <RStyle.RIcon src={LocationIcon} anchor={[0.5, 0.8]} />
					//   </RStyle.RStyle>
					// }
				/>
			</RLayerVector>
		</StyledRMap>
	);
}
