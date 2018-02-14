import * as React from "react"
import styled from "styled-components"

import { /* Field, */ reduxForm } from "redux-form"
import { IElection } from "../../redux/modules/interfaces"
// import "./AddStallForm.css"

// import { grey100 } from "material-ui/styles/colors"
// import { GridList, GridTile } from "material-ui/GridList"
// import { TextField, Toggle, SelectField } from "redux-form-material-ui"
// import MenuItem from "material-ui/MenuItem"
// import RaisedButton from "material-ui/RaisedButton"

export interface IProps {
    election: IElection
    // pollingPlace: IPollingPlace
    onSubmit: any
    onSaveForm: any

    // From redux-form
    initialValues: any
    handleSubmit: any
    isDirty: any
}

// Work around TypeScript issues with redux-form. There's a bunch of issues logged in DefinitelyTyped's issue tracker.
// class CustomField extends React.Component<any, any> {
//     render(): any {
//         return <Field autoComplete={"off"} {...this.props} />
//     }
// }

// class DeliciousnessToggle extends React.Component<any, any> {
//     render(): any {
//         return <CustomField component={Toggle} thumbStyle={{ backgroundColor: grey100 }} {...this.props} />
//     }
// }

const SausageForm = styled.form`
    padding: 10px;
`

const FormSection = styled.div`
    margin-top: 35px;
    margin-bottom: 35px;
`

const FormSectionHeader = styled.h2`
    margin-bottom: 0px;
`

// const DeliciousnessGrid = styled(GridList)`
//     width: 475px;
//     margin-top: 15px !important;
// `

// const DeliciousnessGridTile = styled(GridTile)`
//     margin-right: 25px;
// `
// const HiddenButton = styled.button`
//     display: none;
// `

class AddStallForm extends React.PureComponent<IProps, {}> {
    render() {
        const { /* isDirty, onSaveForm, */ handleSubmit, onSubmit } = this.props

        return (
            <SausageForm onSubmit={handleSubmit(onSubmit)}>
                <FormSection>
                    <FormSectionHeader>Add your sausage sizzle or cake stall</FormSectionHeader>
                    <br />
                    Hi there,<br />
                    <br />
                    We're busily rebuilding the Democracy Sausage site for the upcoming Tasmanian and South Australian elections.<br />
                    <br />
                    We expect to be ready around the middle of February - in the mean time if you'd like to submit a stall please get in
                    touch at <a href="mailto:ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a>.<br />
                    <br />
                    Cheers,<br />
                    <br />
                    The Democracy Sausage Team
                    {/* <DeliciousnessGrid cellHeight={"auto"} cols={3} padding={18}>
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
                    /> */}
                </FormSection>

                {/* <FormSection>
                    <FormSectionHeader>Stall Information</FormSectionHeader>
                    <CustomField
                        name="stall_name"
                        component={TextField}
                        floatingLabelText={"The name of the stall that is here"}
                        fullWidth={true}
                    />
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
                    />
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
                <HiddenButton type="submit" /> */}
            </SausageForm>
        )
    }
}

// Decorate the form component
let AddStallFormReduxForm = reduxForm({
    form: "addStall", // a unique name for this form
    enableReinitialize: true,
    onChange: (values: object, dispatch: Function, props: any) => {
        // console.log("values", values)
        // props.onFormChange(values, dispatch, props)
    },
})(AddStallForm)

export default AddStallFormReduxForm
