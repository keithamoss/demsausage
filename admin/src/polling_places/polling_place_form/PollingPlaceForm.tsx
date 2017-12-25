import * as React from "react"
import styled from "styled-components"

import { Field, reduxForm } from "redux-form"
import { IElection, IPollingPlace } from "../../redux/modules/interfaces"
// import "./PollingPlaceForm.css"

import { grey100 } from "material-ui/styles/colors"
import { GridList, GridTile } from "material-ui/GridList"
import { TextField, Toggle, SelectField } from "redux-form-material-ui"
import MenuItem from "material-ui/MenuItem"
import RaisedButton from "material-ui/RaisedButton"

export interface IProps {
  election: IElection
  pollingPlace: IPollingPlace
  pollingPlaceTypes: Array<string>
  onSubmit: any
  onSaveForm: any

  // From redux-form
  initialValues: any
  handleSubmit: any
  isDirty: any
}

// Work around TypeScript issues with redux-form. There's a bunch of issues logged in DefinitelyTyped's issue tracker.
class CustomField extends React.Component<any, any> {
  render(): any {
    return <Field autoComplete={"off"} {...this.props} />
  }
}
class DeliciousnessToggle extends React.Component<any, any> {
  render(): any {
    return <CustomField component={Toggle} thumbStyle={{ backgroundColor: grey100 }} {...this.props} />
  }
}

const FormSection = styled.div`
  margin-top: 35px;
  margin-bottom: 35px;
`

const FormSectionHeader = styled.h2`
  margin-bottom: 0px;
`

const DeliciousnessGrid = styled(GridList)`
  width: 475px;
  margin-top: 15px !important;
`

const DeliciousnessGridTile = styled(GridTile)`
  margin-right: 25px;
`
const HiddenButton = styled.button`
  display: none;
`

class PollingPlaceForm extends React.PureComponent<IProps, {}> {
  render() {
    const { isDirty, pollingPlaceTypes, onSaveForm, handleSubmit, onSubmit } = this.props

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormSection>
          <FormSectionHeader>Deliciousness</FormSectionHeader>
          <DeliciousnessGrid cellHeight={"auto"} cols={3} padding={18}>
            <DeliciousnessGridTile>
              <DeliciousnessToggle name="has_bbq" label={"BBQ"} />
            </DeliciousnessGridTile>
            <DeliciousnessGridTile>
              <DeliciousnessToggle name="has_caek" label={"Cake"} />
            </DeliciousnessGridTile>
            <DeliciousnessGridTile>
              <DeliciousnessToggle name="has_nothing" label={"Nothing"} />
            </DeliciousnessGridTile>
            <DeliciousnessGridTile>
              <DeliciousnessToggle name="has_run_out" label={"Run Out"} />
            </DeliciousnessGridTile>
            <DeliciousnessGridTile>
              <DeliciousnessToggle name="has_coffee" label={"Coffee"} />
            </DeliciousnessGridTile>
            <DeliciousnessGridTile>
              <DeliciousnessToggle name="has_vego" label={"Vego"} />
            </DeliciousnessGridTile>
            <DeliciousnessGridTile>
              <DeliciousnessToggle name="has_halal" label={"Halal"} />
            </DeliciousnessGridTile>
            <DeliciousnessGridTile>
              <DeliciousnessToggle name="has_baconandeggs" label={"Bacon & Eggs"} />
            </DeliciousnessGridTile>
          </DeliciousnessGrid>
          <CustomField
            name="has_freetext"
            component={TextField}
            floatingLabelText={"What other types of delicious are here?"}
            fullWidth={true}
          />
        </FormSection>

        <FormSection>
          <FormSectionHeader>Stall Information</FormSectionHeader>
          <CustomField name="stall_name" component={TextField} floatingLabelText={"The name of the stall that is here"} fullWidth={true} />
          <CustomField
            name="stall_description"
            component={TextField}
            floatingLabelText={"A brief description of the stall"}
            fullWidth={true}
          />
          <CustomField
            name="stall_website"
            component={TextField}
            floatingLabelText={"A link to the website of the people organising the stall"}
            fullWidth={true}
          />
        </FormSection>

        <FormSection>
          <FormSectionHeader>Polling Place Information</FormSectionHeader>
          <CustomField
            name="polling_place_type"
            component={SelectField}
            floatingLabelText={"What type of polling place is this?"}
            fullWidth={true}
          >
            {pollingPlaceTypes.map((type: string) => <MenuItem key={type} value={type} primaryText={type} />)}
          </CustomField>
          <CustomField
            name="extra_info"
            component={TextField}
            floatingLabelText={"Is there any extra information to add?"}
            fullWidth={true}
          />
          <CustomField
            name="source"
            component={TextField}
            floatingLabelText={"What is the source? (e.g. Twitter, Facebook, School Newsletter)"}
            fullWidth={true}
          />
        </FormSection>

        <RaisedButton label={"Save"} disabled={!isDirty} primary={true} onClick={onSaveForm} />
        <HiddenButton type="submit" />
      </form>
    )
  }
}

// Decorate the form component
let PollingPlaceFormReduxForm = reduxForm({
  form: "pollingPlace", // a unique name for this form
  enableReinitialize: true,
  onChange: (values: object, dispatch: Function, props: any) => {
    // console.log("values", values)
    // props.onFormChange(values, dispatch, props)
  },
})(PollingPlaceForm)

export default PollingPlaceFormReduxForm
