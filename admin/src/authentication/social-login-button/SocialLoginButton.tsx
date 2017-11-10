import * as React from "react"
import RaisedButton from "material-ui/RaisedButton"

export interface ISocialLoginButtonProps {
    providerName: string
    providerUrl: string
    colour: string
}
export interface ISocialLoginButtonState {}

export class SocialLoginButton extends React.Component<ISocialLoginButtonProps, ISocialLoginButtonState> {
    handleClick = () => {
        window.location.href = this.props.providerUrl
    }
    render() {
        const { providerName, colour } = this.props

        return (
            <RaisedButton
                label={providerName}
                style={{
                    margin: 12,
                    display: "block",
                }}
                backgroundColor={colour}
                labelColor={"#ffffff"}
                onClick={this.handleClick}
            />
        )
    }
}
