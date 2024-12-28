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

export const jurisdictionCrests = {
	[eJurisdiction.wa]: {
		standalone: {
			raw: WAJurisdictionCrest,
			react: React_WAJurisdictionCrest,
		},
		circle: {
			raw: WAJurisdictionCrestCircle,
			react: React_WAJurisdictionCrestCircle,
		},
	},
	[eJurisdiction.sa]: {
		standalone: {
			raw: SAJurisdictionCrest,
			react: React_SAJurisdictionCrest,
		},
		circle: {
			raw: SAJurisdictionCrestCircle,
			react: React_SAJurisdictionCrestCircle,
		},
	},
	[eJurisdiction.nsw]: {
		standalone: {
			raw: NSWJurisdictionCrest,
			react: React_NSWJurisdictionCrest,
		},
		circle: {
			raw: NSWJurisdictionCrestCircle,
			react: React_NSWJurisdictionCrestCircle,
		},
	},
	[eJurisdiction.act]: {
		standalone: {
			raw: ACTJurisdictionCrest,
			react: React_ACTJurisdictionCrest,
		},
		circle: {
			raw: ACTJurisdictionCrestCircle,
			react: React_ACTJurisdictionCrestCircle,
		},
	},
	[eJurisdiction.vic]: {
		standalone: {
			raw: VICJurisdictionCrest,
			react: React_VICJurisdictionCrest,
		},
		circle: {
			raw: VICJurisdictionCrestCircle,
			react: React_VICJurisdictionCrestCircle,
		},
	},
	[eJurisdiction.nt]: {
		standalone: {
			raw: NTJurisdictionCrest,
			react: React_NTJurisdictionCrest,
		},
		circle: {
			raw: NTJurisdictionCrestCircle,
			react: React_NTJurisdictionCrestCircle,
		},
	},
	[eJurisdiction.tas]: {
		standalone: {
			raw: TASJurisdictionCrest,
			react: React_TASJurisdictionCrest,
		},
		circle: {
			raw: TASJurisdictionCrestCircle,
			react: React_TASJurisdictionCrestCircle,
		},
	},
	[eJurisdiction.qld]: {
		standalone: {
			raw: QLDJurisdictionCrest,
			react: React_QLDJurisdictionCrest,
		},
		circle: {
			raw: QLDJurisdictionCrestCircle,
			react: React_QLDJurisdictionCrestCircle,
		},
	},
	[eJurisdiction.aus]: {
		standalone: {
			raw: AUSJurisdictionCrest,
			react: React_AUSJurisdictionCrest,
		},
		circle: {
			raw: AUSJurisdictionCrestCircle,
			react: React_AUSJurisdictionCrestCircle,
		},
	},
};

export const getJurisdictionCrestStandaloneReact = (
	jurisdiction: keyof typeof jurisdictionCrests,
	style?: React.CSSProperties,
) => {
	if (jurisdiction in jurisdictionCrests) {
		const Crest = jurisdictionCrests[jurisdiction].standalone.react;
		return <Crest style={style} />;
	}

	return <React_Grey_Question />;
};

export const getJurisdictionCrestCircleReact = (
	jurisdiction: keyof typeof jurisdictionCrests,
	style?: React.CSSProperties,
) => {
	if (jurisdiction in jurisdictionCrests) {
		const Crest = jurisdictionCrests[jurisdiction].circle.react;
		return <Crest style={style} />;
	}

	return <React_Grey_Question />;
};
