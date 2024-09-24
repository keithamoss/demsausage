import { SvgIcon } from '@mui/material';

const setAttributesOnElement = (svg: Element, attributes: { [key: string]: string }) =>
	Object.entries(attributes).forEach(([attributeName, attributeValue]) =>
		svg.setAttribute(attributeName, attributeValue),
	);

export const createInlinedSVGImage = (
	rawSVG: string,
	style: React.CSSProperties,
	onClick: React.MouseEventHandler<HTMLImageElement>,
) => <img src={`data:image/svg+xml;utf8,${rawSVG.replaceAll('#', '%23')}`} style={style} onClick={onClick} />;

export const prepareRawSVGForOpenLayers = (rawSvg: string, width?: number, height?: number, style?: string) => {
	// Wrapping the SVG element in a <div> let's us easily convert the DOM to a string with `.documentElement.innerHTML` later on
	const svgDOMElementWrapped = new DOMParser().parseFromString(
		`<div>${rawSvg.replace('<?xml version="1.0" encoding="UTF-8"?>', '')}</div>`,
		'image/svg+xml',
	);
	const svgDOMElement = svgDOMElementWrapped.getElementsByTagName('svg')[0];

	// Apply our overall icon styling and required attributes to the outer <svg> element
	if (width !== undefined && height !== undefined) {
		setAttributesOnElement(svgDOMElement, {
			'aria-hidden': 'true',
			focusable: 'false',
			// * 2 here to give us sharper icons (we downscale them to 0.5 in OpenLayers)
			width: `${width * 2}`,
			height: `${height * 2}`,
		});
	}

	if (style !== undefined) {
		setAttributesOnElement(svgDOMElement, {
			style,
		});
	}

	return svgDOMElementWrapped.documentElement.innerHTML.replaceAll('#', '%23');
};

export const createReactSvgIcon = (Icon: JSX.ElementType) => (
	<SvgIcon>
		<Icon width="24" height="24" />
	</SvgIcon>
);
