import { cloneDeep } from 'lodash-es'
import * as React from 'react'
import { connect } from 'react-redux'
import { isValid, submit } from 'redux-form'
import { fromStallFormValues, IStallFormInfo } from '../../add-stall/AddStallForm/AddStallFormContainer'
import { buildNomsObject } from '../../redux/modules/polling_places'
import { IStore } from '../../redux/modules/reducer'
import { IStall, updateStallWithCredentials } from '../../redux/modules/stalls'
import { IDjangoAPIError } from '../../shared/ui/DjangoAPIErrorUI/DjangoAPIErrorUI'
import { IStallEditCredentials } from '../EditStall/EditStallContainer'
import EditStallForm from './EditStallForm'

interface IProps {
  stall: IStall
  credentials: IStallEditCredentials
  onStallUpdated: Function
}

interface IDispatchProps {
  onFormSubmit: Function
  onSaveForm: Function
}

interface IStoreProps {
  isValid: boolean
}

interface IStateProps {
  formSubmitting: boolean
  errors: IDjangoAPIError | undefined
}

const toFormValues = (stall: IStall): any => {
  return {
    ...buildNomsObject(stall.noms as any),
    ...cloneDeep(stall),
  }
}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class EditStallFormContainer extends React.Component<TComponentProps, IStateProps> {
  initialValues: object | undefined

  constructor(props: TComponentProps) {
    super(props)

    this.state = {
      formSubmitting: false,
      errors: undefined,
    }

    this.initialValues = cloneDeep(toFormValues(props.stall))
  }

  toggleFormSubmitting() {
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, formSubmitting: !this.state.formSubmitting })
  }

  render() {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { isValid, onFormSubmit, onSaveForm } = this.props
    const { formSubmitting, errors } = this.state

    return (
      <EditStallForm
        initialValues={this.initialValues}
        formSubmitting={formSubmitting}
        errors={errors}
        isValid={isValid}
        onSubmit={async (values: object, _dispatch: Function, _props: IProps) => {
          this.toggleFormSubmitting()
          await onFormSubmit(values, this)
        }}
        onSaveForm={() => {
          onSaveForm()
        }}
      />
    )
  }
}

const mapStateToProps = (state: IStore, _ownProps: IProps): IStoreProps => {
  return {
    isValid: isValid('editStall')(state),
  }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
  return {
    async onFormSubmit(values: object, that: EditStallFormContainer) {
      const stallFormFields: Partial<IStallFormInfo> = fromStallFormValues(values)

      const { stall, credentials, onStallUpdated } = that.props

      const { response, json } = await dispatch(
        updateStallWithCredentials(stall.id, stallFormFields, credentials.token, credentials.signature)
      )
      if (response.status === 200) {
        onStallUpdated()
      } else if (response.status === 400) {
        that.setState({ ...that.state, errors: json }, () => that.toggleFormSubmitting())
      }
    },
    onSaveForm: () => {
      dispatch(submit('editStall'))
    },
  }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(EditStallFormContainer)
