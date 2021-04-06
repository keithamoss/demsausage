/* eslint-disable-next-line max-classes-per-file */
import RaisedButton from 'material-ui/RaisedButton'
import * as React from 'react'
import { BaseFieldProps, Field, reduxForm } from 'redux-form'
import { Checkbox, DatePicker, TextField } from 'redux-form-material-ui'
import styled from 'styled-components'
import { IElection } from '../../redux/modules/elections'
import { IGeoJSON } from '../../redux/modules/interfaces'
import MapExtentChooserContainer from '../MapExtentChooser/MapExtentChooserContainer'

const required = (value: any) => (value ? undefined : 'Required')

const PaddedCheckbox = styled(Checkbox)`
  margin-bottom: 16px;
`

const PaddedButton = styled(RaisedButton)`
  margin: 8px;
`

const HiddenButton = styled.button`
  display: none;
`

interface IProps {
  election: IElection | null
  onSubmit: any
  onSaveForm: any
  onCancelForm: any

  // From redux-form
  initialValues: any
  handleSubmit: any
  isDirty: any
}

// Work around TypeScript issues with redux-form. There's a bunch of issues logged in DefinitelyTyped's issue tracker.
interface ICustomFieldProps extends BaseFieldProps<any> {
  floatingLabelText?: string
  fullWidth?: boolean
  type?: string
  mode?: string
  required?: boolean
  labelPosition?: string
  label?: string
}
class CustomField extends React.Component<ICustomFieldProps, any> {
  render(): any {
    return <Field autoComplete="off" {...this.props} />
  }
}

class ElectionEditor extends React.PureComponent<IProps, {}> {
  render() {
    const { election, isDirty, onSaveForm, onCancelForm, handleSubmit, onSubmit } = this.props

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <CustomField
          name="name"
          component={TextField}
          floatingLabelText="The name of the election (e.g. Federal Election 2018)"
          fullWidth={true}
          validate={[required]}
        />

        <CustomField
          name="short_name"
          component={TextField}
          floatingLabelText="A short name for this election (e.g. FED 2018)"
          fullWidth={true}
          validate={[required]}
        />

        <CustomField
          name="election_day"
          component={DatePicker}
          format={(value: any) => (value === '' ? null : value)}
          floatingLabelText="What day is election day?"
          fullWidth={true}
          mode="landscape"
          required={true}
        />

        <Field
          name="geom"
          component={(props: any) => (
            <MapExtentChooserContainer
              value={props.input.value !== '' ? props.input.value : undefined}
              onChange={(geojson: IGeoJSON) => props.input.onChange(geojson)}
            />
          )}
        />

        <CustomField name="is_hidden" component={PaddedCheckbox} label="Hide election?" labelPosition="right" />

        <PaddedButton
          label={election === null ? 'Create' : 'Save'}
          disabled={!isDirty}
          primary={true}
          onClick={onSaveForm}
        />
        <PaddedButton label="Cancel" primary={false} onClick={onCancelForm} />
        <HiddenButton type="submit" />
      </form>
    )
  }
}

// Decorate the form component
const ElectionEditorReduxForm = reduxForm({
  form: 'election', // a unique name for this form
  enableReinitialize: true,
  onChange: (_values: object, _dispatch: Function, _props: any) => {
    // console.log("values", values)
    // props.onFormChange(values, dispatch, props)
  },
})(ElectionEditor)

export default ElectionEditorReduxForm
