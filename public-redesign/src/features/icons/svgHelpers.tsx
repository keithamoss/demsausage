import { SvgIcon } from '@mui/material';
import React from 'react';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';

const setAttributesOnElement = (svg: Element, attributes: { [key: string]: string }) =>
	Object.entries(attributes).forEach(([attributeName, attributeValue]) =>
		svg.setAttribute(attributeName, attributeValue),
	);

export const prepareRawSVG = (rawSvg: string, width: number, height: number, style?: string) => {
	// Wrapping the SVG element in a <div> let's us easily convert the DOM to a string with `.documentElement.innerHTML` later on
	const svgDOMElementWrapped = new DOMParser().parseFromString(
		`<div>${rawSvg.replace('<?xml version="1.0" encoding="UTF-8"?>', '')}</div>`,
		'image/svg+xml',
	);
	const svgDOMElement = svgDOMElementWrapped.getElementsByTagName('svg')[0];

	// Apply our overall icon styling and required attributes to the outer <svg> element
	setAttributesOnElement(svgDOMElement, {
		'aria-hidden': 'true',
		focusable: 'false',
		width: `${width * 2}`,
		height: `${height * 2}`,
	});

	if (style !== undefined) {
		setAttributesOnElement(svgDOMElement, {
			style,
		});
	}

	return svgDOMElementWrapped.documentElement.innerHTML.replaceAll('#', '%23');
};

export const createReactSvgIcon = (Icon: any) => (
	<SvgIcon>
		<Icon width="24" height="24" />
	</SvgIcon>
);