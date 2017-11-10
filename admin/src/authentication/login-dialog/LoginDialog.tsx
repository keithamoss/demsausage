import * as React from "react"
import { SocialLoginButton } from "../social-login-button/SocialLoginButton"
import { getAPIBaseURL } from "../../redux/modules/app"
import Dialog from "material-ui/Dialog"

export interface ILoginDialogProps {
    open: boolean
}
export interface ILoginDialogState {}

export class LoginDialog extends React.Component<ILoginDialogProps, ILoginDialogState> {
    render() {
        const { open } = this.props

        return (
            <Dialog title="Please login to access Democracy Sausage" modal={true} open={open}>
                <SocialLoginButton providerName="Google" providerUrl={`${getAPIBaseURL()}/login.php`} colour={"#DD4B39"} />
            </Dialog>
        )
    }
}
