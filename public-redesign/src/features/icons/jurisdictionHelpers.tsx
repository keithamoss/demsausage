import { default as Grey_Question } from '../../../public/assets/icons/circles/grey_question.svg?raw';
import { default as React_Grey_Question } from '../../../public/assets/icons/circles/grey_question.svg?react';
import {
	WAJurisdictionCrest,
	React_WAJurisdictionCrest,
	WAJurisdictionCrestCircle,
	React_WAJurisdictionCrestCircle,
	SAJurisdictionCrest,
	React_SAJurisdictionCrest,
	SAJurisdictionCrestCircle,
	React_SAJurisdictionCrestCircle,
	NSWJurisdictionCrest,
	React_NSWJurisdictionCrest,
	NSWJurisdictionCrestCircle,
	React_NSWJurisdictionCrestCircle,
	ACTJurisdictionCrest,
	React_ACTJurisdictionCrest,
	ACTJurisdictionCrestCircle,
	React_ACTJurisdictionCrestCircle,
	VICJurisdictionCrest,
	React_VICJurisdictionCrest,
	VICJurisdictionCrestCircle,
	React_VICJurisdictionCrestCircle,
	NTJurisdictionCrest,
	React_NTJurisdictionCrest,
	NTJurisdictionCrestCircle,
	TASJurisdictionCrest,
	React_TASJurisdictionCrest,
	TASJurisdictionCrestCircle,
	React_TASJurisdictionCrestCircle,
	QLDJurisdictionCrest,
	React_QLDJurisdictionCrest,
	QLDJurisdictionCrestCircle,
	React_QLDJurisdictionCrestCircle,
	AUSJurisdictionCrest,
	React_AUSJurisdictionCrest,
	AUSJurisdictionCrestCircle,
	React_AUSJurisdictionCrestCircle,
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

export const getJurisdictionCrestStandaloneReact = (jurisdiction: keyof typeof jurisdictionCrests, style?: object) => {
	if (jurisdiction in jurisdictionCrests) {
		const Crest = jurisdictionCrests[jurisdiction].standalone.react;
		return <Crest style={style} />;
	}

	return <React_Grey_Question style={style} />;
};

export const getJurisdictionCrestCircleReact = (jurisdiction: keyof typeof jurisdictionCrests, style?: object) => {
	if (jurisdiction in jurisdictionCrests) {
		const Crest = jurisdictionCrests[jurisdiction].circle.react;
		return <Crest style={style} />;
	}

	return <React_Grey_Question style={style} />;
};
