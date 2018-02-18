import * as React from "react"
import styled from "styled-components"

import { Field, reduxForm } from "redux-form"
import { IElection } from "../../redux/modules/interfaces"
// import "./ElectionEditor.css"

// import { grey100 } from "material-ui/styles/colors"
import { TextField, SelectField, Checkbox, DatePicker } from "redux-form-material-ui"
import MenuItem from "material-ui/MenuItem"
import RaisedButton from "material-ui/RaisedButton"

const required = (value: any) => (value ? undefined : "Required")

const PaddedCheckbox = styled(Checkbox)`
    margin-bottom: 16px;
`

const PaddedButton = styled(RaisedButton)`
    margin: 8px;
`

const HiddenButton = styled.button`
    display: none;
`

export interface IProps {
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
class CustomField extends React.Component<any, any> {
    render(): any {
        return <Field autoComplete={"off"} {...this.props} />
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
                    floatingLabelText={"The name of the election (e.g. Federal Election 2018)"}
                    fullWidth={true}
                    validate={[required]}
                />

                <CustomField
                    name="election_day"
                    component={DatePicker}
                    format={(value: any) => (value === "" ? null : value)}
                    floatingLabelText={"What day is election day?"}
                    fullWidth={true}
                    mode="landscape"
                    required={true}
                />

                <CustomField
                    name="lon"
                    component={TextField}
                    floatingLabelText={"Longitude"}
                    fullWidth={true}
                    type="number"
                    validate={[required]}
                />

                <CustomField
                    name="lat"
                    component={TextField}
                    floatingLabelText={"Latitude"}
                    fullWidth={true}
                    type="number"
                    validate={[required]}
                />

                <CustomField
                    name="default_zoom_level"
                    component={SelectField}
                    floatingLabelText={"Default map zoom level"}
                    fullWidth={true}
                    validate={[required]}
                >
                    <MenuItem value={4} primaryText="4 (The whole country)" />
                    <MenuItem value={5} primaryText="5 (Larger states and territories)" />
                    <MenuItem value={6} primaryText="6 (Smaller states and territories)" />
                    <MenuItem value={7} primaryText="7" />
                    <MenuItem value={8} primaryText="8" />
                    <MenuItem value={9} primaryText="9" />
                    <MenuItem value={10} primaryText="10 (Really small states and territories)" />
                    <MenuItem value={11} primaryText="11" />
                    <MenuItem value={12} primaryText="12" />
                    <MenuItem value={13} primaryText="13" />
                    <MenuItem value={14} primaryText="14" />
                </CustomField>

                <CustomField name="is_active" component={PaddedCheckbox} label="Is this an active election?" labelPosition="right" />

                <CustomField name="hidden" component={PaddedCheckbox} label="Hide election?" labelPosition="right" />

                <PaddedButton label={election === null ? "Create" : "Save"} disabled={!isDirty} primary={true} onClick={onSaveForm} />
                <PaddedButton label={"Cancel"} primary={false} onClick={onCancelForm} />
                <HiddenButton type="submit" />
            </form>
        )
    }
}

// Decorate the form component
let ElectionEditorReduxForm = reduxForm({
    form: "election", // a unique name for this form
    enableReinitialize: true,
    onChange: (values: object, dispatch: Function, props: any) => {
        // console.log("values", values)
        // props.onFormChange(values, dispatch, props)
    },
})(ElectionEditor)

export default ElectionEditorReduxForm
