// tslint:disable:max-line-length

import * as React from "react"
import { pure } from "recompose"
import SvgIcon from "material-ui/SvgIcon"

let svg = (props: any) => (
    <SvgIcon {...props}>
        <svg
            viewBox="0 0 500 500"
            xmlns="http://www.w3.org/2000/svg"
            fillRule="evenodd"
            clipRule="evenodd"
            strokeLinejoin="round"
            strokeMiterlimit="1.41421"
        >
            <path
                d="M118.8909 359.2148s-58-133 178-219c135-50 132-126 132-126s27 345-203 378c0 0-63 14-95-8 0 0-33 66-28 98l-30 2s50-133 73-148l-27 23z"
                fill="#4a0"
                fillRule="nonzero"
            />
        </svg>
    </SvgIcon>
)

let VegoIcon: any = pure(svg)
VegoIcon.displayName = "VegoIcon"
VegoIcon.muiName = "SvgIcon"

export default VegoIcon
