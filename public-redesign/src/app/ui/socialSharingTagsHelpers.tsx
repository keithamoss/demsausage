import React from 'react';

export const getDefaultOGMetaTags = () => (
	<React.Fragment>
		<meta property="og:type" content="website" />
		<meta
			property="og:description"
			content="A real-time crowd-sourced map of sausage and cake availability at Australian elections. It's practically part of the Australian Constitution. Or something. #demsausage"
		/>
	</React.Fragment>
);
