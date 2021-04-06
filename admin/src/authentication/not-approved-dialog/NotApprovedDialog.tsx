import * as React from 'react'
import Dialog from 'material-ui/Dialog'

interface NotApprovedDialogProps {
  open: boolean
}
interface NotApprovedDialogState {}

export class NotApprovedDialog extends React.Component<NotApprovedDialogProps, NotApprovedDialogState> {
  render() {
    const { open } = this.props

    return (
      <Dialog title="Welcome to EALGIS" modal={true} open={open}>
        Thanks for signing up for EALGIS! Access to this EALGIS instance is limited to users who have been approved by
        the administrators.
      </Dialog>
    )
  }
}
