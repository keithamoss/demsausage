import { default as React_Grey_Question } from '../../../public/assets/icons/circles/grey_question.svg?raw';
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

export const jurisdictionCrests = {
	wa: {
		standalone: {
			raw: WAJurisdictionCrest,
			react: React_WAJurisdictionCrest,
		},
		circle: {
			raw: WAJurisdictionCrestCircle,
			react: React_WAJurisdictionCrestCircle,
		},
	},
	sa: {
		standalone: {
			raw: SAJurisdictionCrest,
			react: React_SAJurisdictionCrest,
		},
		circle: {
			raw: SAJurisdictionCrestCircle,
			react: React_SAJurisdictionCrestCircle,
		},
	},
	nsw: {
		standalone: {
			raw: NSWJurisdictionCrest,
			react: React_NSWJurisdictionCrest,
		},
		circle: {
			raw: NSWJurisdictionCrestCircle,
			react: React_NSWJurisdictionCrestCircle,
		},
	},
	act: {
		standalone: {
			raw: ACTJurisdictionCrest,
			react: React_ACTJurisdictionCrest,
		},
		circle: {
			raw: ACTJurisdictionCrestCircle,
			react: React_ACTJurisdictionCrestCircle,
		},
	},
	vic: {
		standalone: {
			raw: VICJurisdictionCrest,
			react: React_VICJurisdictionCrest,
		},
		circle: {
			raw: VICJurisdictionCrestCircle,
			react: React_VICJurisdictionCrestCircle,
		},
	},
	nt: {
		standalone: {
			raw: NTJurisdictionCrest,
			react: React_NTJurisdictionCrest,
		},
		circle: {
			raw: NTJurisdictionCrestCircle,
			react: React_WAJurisdictionCrestCircle,
		},
	},
	tas: {
		standalone: {
			raw: TASJurisdictionCrest,
			react: React_TASJurisdictionCrest,
		},
		circle: {
			raw: TASJurisdictionCrestCircle,
			react: React_TASJurisdictionCrestCircle,
		},
	},
	qld: {
		standalone: {
			raw: QLDJurisdictionCrest,
			react: React_QLDJurisdictionCrest,
		},
		circle: {
			raw: QLDJurisdictionCrestCircle,
			react: React_QLDJurisdictionCrestCircle,
		},
	},
	aus: {
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
