import Dialog from 'material-ui/Dialog'
import * as React from 'react'
import { getAPIBaseURL } from '../../redux/modules/app'
import { SocialLoginButton } from '../social-login-button/SocialLoginButton'

interface ILoginDialogProps {
  open: boolean
}
interface ILoginDialogState {}

export class LoginDialog extends React.Component<ILoginDialogProps, ILoginDialogState> {
  render() {
    const { open } = this.props

    return (
      <Dialog title="Please login to access Democracy Sausage" modal={true} open={open}>
        <SocialLoginButton
          providerName="Google"
          providerUrl={`${getAPIBaseURL()}/login/google-oauth2/`}
          colour="#DD4B39"
        />
        <SocialLoginButton
          providerName="Microsoft"
          providerUrl={`${getAPIBaseURL()}/login/azuread-oauth2/`}
          colour="#00A4EF"
        />
      </Dialog>
    )
  }
}
