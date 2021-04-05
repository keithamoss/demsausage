import { capitalize } from "lodash-es"
import * as React from "react"

interface IProps {
    errors: IDjangoAPIError | undefined
}

export interface IDjangoAPIError {
    [key: string]: string[] | string
}

export default class DjangoAPIErrorUI extends React.PureComponent<IProps, {}> {
    render() {
        const { errors } = this.props

        if (errors !== undefined) {
            if (Object.keys(errors).length === 1 && "detail" in errors) {
                return (
                    <div>
                        <h2>Sorry about this, but we've found a snag (geddit?) in what you're trying to do:</h2>
                        {errors.detail}
                    </div>
                )
            }

            return (
                <div>
                    <h4>Sorry about this, but we found a few problems with your submission:</h4>
                    <ul>
                        {Object.keys(errors).map((key: string) => {
                            return (
                                <li key={key}>
                                    <strong>{capitalize(key)}:</strong>{" "}
                                    {Array.isArray(errors[key]) === true ? (errors[key] as string[]).join("; ") : errors[key]}
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )
        }
        return null
    }
}
