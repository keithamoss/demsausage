import * as React from "react"
import styled from "styled-components"

import { Field, reduxForm } from "redux-form"
import { IElection } from "../../redux/modules/interfaces"
// import "./ElectionEditor.css"

// import { grey100 } from "material-ui/styles/colors"
import { TextField } from "redux-form-material-ui"
import RaisedButton from "material-ui/RaisedButton"

export interface IProps {
    election: IElection | null
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

const HiddenButton = styled.button`
    display: none;
`

class ElectionEditor extends React.PureComponent<IProps, {}> {
    render() {
        const { election, isDirty, onSaveForm, handleSubmit, onSubmit } = this.props

        return (
            <form onSubmit={handleSubmit(onSubmit)}>
                <CustomField name="name" component={TextField} floatingLabelText={"The name of the stall that is here"} fullWidth={true} />

                <RaisedButton label={election === null ? "Create" : "Save"} disabled={!isDirty} primary={true} onClick={onSaveForm} />
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
