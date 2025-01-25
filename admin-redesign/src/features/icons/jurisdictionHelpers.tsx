import { Avatar } from '@mui/material';
import { default as React_Grey_Question } from '../../assets/icons/circles/grey_question.svg?raw';
import {
	ACTJurisdictionCrest,
	ACTJurisdictionCrestCircle,
	AUSJurisdictionCrest,
	AUSJurisdictionCrestCircle,
	NSWJurisdictionCrest,
	NSWJurisdictionCrestCircle,
	NTJurisdictionCrest,
	NTJurisdictionCrestCircle,
	QLDJurisdictionCrest,
	QLDJurisdictionCrestCircle,
	React_ACTJurisdictionCrest,
	React_ACTJurisdictionCrestCircle,
	React_AUSJurisdictionCrest,
	React_AUSJurisdictionCrestCircle,
	React_NSWJurisdictionCrest,
	React_NSWJurisdictionCrestCircle,
	React_NTJurisdictionCrest,
	React_NTJurisdictionCrestCircle,
	React_QLDJurisdictionCrest,
	React_QLDJurisdictionCrestCircle,
	React_SAJurisdictionCrest,
	React_SAJurisdictionCrestCircle,
	React_TASJurisdictionCrest,
	React_TASJurisdictionCrestCircle,
	React_VICJurisdictionCrest,
	React_VICJurisdictionCrestCircle,
	React_WAJurisdictionCrest,
	React_WAJurisdictionCrestCircle,
	SAJurisdictionCrest,
	SAJurisdictionCrestCircle,
	TASJurisdictionCrest,
	TASJurisdictionCrestCircle,
	VICJurisdictionCrest,
	VICJurisdictionCrestCircle,
	WAJurisdictionCrest,
	WAJurisdictionCrestCircle,
} from './jurisdictions';

export enum eJurisdiction {
	wa = 'wa',
	sa = 'sa',
	nsw = 'nsw',
	act = 'act',
	vic = 'vic',
	nt = 'nt',
	tas = 'tas',
	qld = 'qld',
	aus = 'aus',
}

export const jurisdictions = {
	[eJurisdiction.wa]: {
		name: 'Western Australia',
		crest: {
			standalone: {
				raw: WAJurisdictionCrest,
				react: React_WAJurisdictionCrest,
			},
			circle: {
				raw: WAJurisdictionCrestCircle,
				react: React_WAJurisdictionCrestCircle,
			},
		},
		geom: {
			type: 'Polygon',
			coordinates: [
				[
					[111.796875, -35.88905007936091],
					[129.19921874999997, -35.88905007936091],
					[129.19921874999997, -12.726084296948173],
					[111.796875, -12.726084296948173],
					[111.796875, -35.88905007936091],
				],
			],
		},
	},
	[eJurisdiction.sa]: {
		name: 'South Australia',
		crest: {
			standalone: {
				raw: SAJurisdictionCrest,
				react: React_SAJurisdictionCrest,
			},
			circle: {
				raw: SAJurisdictionCrestCircle,
				react: React_SAJurisdictionCrestCircle,
			},
		},
		geom: {
			type: 'Polygon',
			coordinates: [
				[
					[128.58398437499997, -38.82259097617711],
					[141.591796875, -38.82259097617711],
					[141.591796875, -25.48295117535531],
					[128.58398437499997, -25.48295117535531],
					[128.58398437499997, -38.82259097617711],
				],
			],
		},
	},
	[eJurisdiction.nsw]: {
		name: 'New South Wales',
		crest: {
			standalone: {
				raw: NSWJurisdictionCrest,
				react: React_NSWJurisdictionCrest,
			},
			circle: {
				raw: NSWJurisdictionCrestCircle,
				react: React_NSWJurisdictionCrestCircle,
			},
		},
		geom: {
			type: 'Polygon',
			coordinates: [
				[
					[140.2734375, -37.996162679728116],
					[153.984375, -37.996162679728116],
					[153.984375, -27.683528083787756],
					[140.2734375, -27.683528083787756],
					[140.2734375, -37.996162679728116],
				],
			],
		},
	},
	[eJurisdiction.act]: {
		name: 'Australian Capital Territory',
		crest: {
			standalone: {
				raw: ACTJurisdictionCrest,
				react: React_ACTJurisdictionCrest,
			},
			circle: {
				raw: ACTJurisdictionCrestCircle,
				react: React_ACTJurisdictionCrestCircle,
			},
		},
		geom: {
			type: 'Polygon',
			coordinates: [
				[
					[148.955103242085, -35.494092534522686],
					[149.25564290420598, -35.494092534522686],
					[149.25564290420598, -35.10836225912458],
					[148.955103242085, -35.10836225912458],
					[148.955103242085, -35.494092534522686],
				],
			],
		},
	},
	[eJurisdiction.vic]: {
		name: 'Victoria',
		crest: {
			standalone: {
				raw: VICJurisdictionCrest,
				react: React_VICJurisdictionCrest,
			},
			circle: {
				raw: VICJurisdictionCrestCircle,
				react: React_VICJurisdictionCrestCircle,
			},
		},
		geom: {
			type: 'Polygon',
			coordinates: [
				[
					[140.2734375, -39.232253141714885],
					[150.73242187500003, -39.232253141714885],
					[150.73242187500003, -33.28461996888768],
					[140.2734375, -33.28461996888768],
					[140.2734375, -39.232253141714885],
				],
			],
		},
	},
	[eJurisdiction.nt]: {
		name: 'Northern Territory',
		crest: {
			standalone: {
				raw: NTJurisdictionCrest,
				react: React_NTJurisdictionCrest,
			},
			circle: {
				raw: NTJurisdictionCrestCircle,
				react: React_NTJurisdictionCrestCircle,
			},
		},
		geom: {
			type: 'Polygon',
			coordinates: [
				[
					[128.14453125, -26.509904531413923],
					[138.8671875, -26.509904531413923],
					[138.8671875, -9.275622176792098],
					[128.14453125, -9.275622176792098],
					[128.14453125, -26.509904531413923],
				],
			],
		},
	},
	[eJurisdiction.tas]: {
		name: 'Tasmania',
		crest: {
			standalone: {
				raw: TASJurisdictionCrest,
				react: React_TASJurisdictionCrest,
			},
			circle: {
				raw: TASJurisdictionCrestCircle,
				react: React_TASJurisdictionCrestCircle,
			},
		},
		geom: {
			type: 'Polygon',
			coordinates: [
				[
					[142.998046875, -44.245199015221274],
					[149.1943359375, -44.245199015221274],
					[149.1943359375, -39.19820534889478],
					[142.998046875, -39.19820534889478],
					[142.998046875, -44.245199015221274],
				],
			],
		},
	},
	[eJurisdiction.qld]: {
		name: 'Queensland',
		crest: {
			standalone: {
				raw: QLDJurisdictionCrest,
				react: React_QLDJurisdictionCrest,
			},
			circle: {
				raw: QLDJurisdictionCrestCircle,
				react: React_QLDJurisdictionCrestCircle,
			},
		},
		geom: {
			type: 'Polygon',
			coordinates: [
				[
					[137.724609375, -29.76437737516313],
					[155.478515625, -29.76437737516313],
					[155.478515625, -8.494104537551863],
					[137.724609375, -8.494104537551863],
					[137.724609375, -29.76437737516313],
				],
			],
		},
	},
	[eJurisdiction.aus]: {
		name: 'Australia',
		crest: {
			standalone: {
				raw: AUSJurisdictionCrest,
				react: React_AUSJurisdictionCrest,
			},
			circle: {
				raw: AUSJurisdictionCrestCircle,
				react: React_AUSJurisdictionCrestCircle,
			},
		},
		geom: {
			type: 'Polygon',
			coordinates: [
				[
					[112.568664550781, -44.2422476272383],
					[154.092864990234, -44.2422476272383],
					[154.092864990234, -10.1135419412474],
					[112.568664550781, -10.1135419412474],
					[112.568664550781, -44.2422476272383],
				],
			],
		},
	},
};

export const getJurisdictionCrestStandaloneReact = (
	jurisdiction: keyof typeof jurisdictions,
	style?: React.CSSProperties,
) => {
	if (jurisdiction in jurisdictions) {
		const Crest = jurisdictions[jurisdiction].crest.standalone.react;
		return <Crest style={style} />;
	}

	return <React_Grey_Question />;
};

export const getJurisdictionCrestStandaloneReactAvatar = (jurisdiction: keyof typeof jurisdictions) => (
	<Avatar
		sx={{
			width: 58,
			height: 58,
			marginRight: 2,
			backgroundColor: 'transparent',
			'& svg': {
				width: 50,
			},
		}}
	>
		{getJurisdictionCrestStandaloneReact(jurisdiction)}
	</Avatar>
);

export const getJurisdictionCrestCircleReact = (
	jurisdiction: keyof typeof jurisdictions,
	style?: React.CSSProperties,
) => {
	if (jurisdiction in jurisdictions) {
		const Crest = jurisdictions[jurisdiction].crest.circle.react;
		return <Crest style={style} />;
	}

	return <React_Grey_Question />;
};
