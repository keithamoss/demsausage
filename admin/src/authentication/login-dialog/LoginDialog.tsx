import Dialog from "material-ui/Dialog"
import * as React from "react"
import { SocialLoginButton } from "../social-login-button/SocialLoginButton"

export interface ILoginDialogProps {
    open: boolean
}
export interface ILoginDialogState {}

export class LoginDialog extends React.Component<ILoginDialogProps, ILoginDialogState> {
    render() {
        const { open } = this.props

        return (
            <Dialog title="Please login to access Democracy Sausage" modal={true} open={open}>
                <SocialLoginButton providerName="Google" providerUrl={`https://localhost:8001/login/google-oauth2/`} colour={"#DD4B39"} />
            </Dialog>
        )
    }
}
