import { List, ListItem } from "material-ui/List"
import RaisedButton from "material-ui/RaisedButton"
import * as React from "react"
import { reduxForm } from "redux-form"
import { TextField } from "redux-form-material-ui"
import styled from "styled-components"
import { CustomTextField, DeliciousnessToggle } from "../../add-stall/AddStallForm/AddStallForm"
import BaconandEggsIcon from "../../icons/bacon-and-eggs"
import CakeIcon from "../../icons/cake"
import CoffeeIcon from "../../icons/coffee"
import HalalIcon from "../../icons/halal"
import SausageIcon from "../../icons/sausage"
import VegoIcon from "../../icons/vego"
import DjangoAPIErrorUI, { IDjangoAPIError } from "../../shared/ui/DjangoAPIErrorUI/DjangoAPIErrorUI"

const required = (value: any) => (value ? undefined : "Required")
const email = (value: any) => (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? "Invalid email address" : undefined)

interface IProps {
    formSubmitting: boolean
    errors: IDjangoAPIError | undefined
    onSubmit: any
    onSaveForm: any

    // From redux-form
    initialValues: any
    handleSubmit: any
    isValid: any
}

const FormSection = styled.div`
    margin-top: 30px;
    margin-bottom: 30px;
`

const FormSectionHeader = styled.h2`
    margin-bottom: 0px;
`

// Fix that iOS Safari bug
const RaisedButtonChunkyBottom = styled(RaisedButton)`
    margin-bottom: 60px;
`

const HiddenButton = styled.button`
    display: none;
`

class EditStallForm extends React.PureComponent<IProps, {}> {
    render() {
        const { formSubmitting, errors } = this.props
        const { isValid, onSaveForm, handleSubmit, onSubmit } = this.props

        return (
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormSection style={{ marginTop: 0 }}>
                    <FormSectionHeader>Stall details</FormSectionHeader>
                    <CustomTextField
                        name="name"
                        component={TextField}
                        floatingLabelText={"What should we call your stall?"}
                        hintText={"e.g. Smith Hill Primary School Sausage Sizzle"}
                        fullWidth={true}
                        validate={[required]}
                    />
                    <CustomTextField
                        name="description"
                        component={TextField}
                        multiLine={true}
                        floatingLabelText={"Describe your stall"}
                        hintText={
                            "Who's running it and why you're running it e.g. The P&C is running the stall to raise funds for the Year 7 school camp"
                        }
                        fullWidth={true}
                        validate={[required]}
                    />
                    <CustomTextField
                        name="opening_hours"
                        component={TextField}
                        floatingLabelText={"Stall opening hours (optional)"}
                        hintText={"e.g. 8AM - 2PM"}
                        fullWidth={true}
                    />
                    <CustomTextField
                        name="website"
                        component={TextField}
                        floatingLabelText={"Stall website or social media page (optional)"}
                        hintText={"We'll include a link to your site as part of your stall's information"}
                        fullWidth={true}
                    />
                </FormSection>

                <FormSection>
                    <FormSectionHeader>What's on offer?</FormSectionHeader>
                    <List>
                        <ListItem
                            primaryText="Is there a sausage sizzle?"
                            leftIcon={<SausageIcon />}
                            rightToggle={<DeliciousnessToggle name="bbq" />}
                        />
                        <ListItem
                            primaryText="Is there a cake stall?"
                            leftIcon={<CakeIcon />}
                            rightToggle={<DeliciousnessToggle name="cake" />}
                        />
                        <ListItem
                            primaryText="Are there vegetarian options?"
                            leftIcon={<VegoIcon />}
                            rightToggle={<DeliciousnessToggle name="vego" />}
                        />
                        <ListItem
                            primaryText="Is there any food that's halal?"
                            leftIcon={<HalalIcon />}
                            rightToggle={<DeliciousnessToggle name="halal" />}
                        />
                        <ListItem
                            primaryText="Do you have coffee?"
                            leftIcon={<CoffeeIcon />}
                            rightToggle={<DeliciousnessToggle name="coffee" />}
                        />
                        <ListItem
                            primaryText="Are there bacon and eggs?"
                            leftIcon={<BaconandEggsIcon />}
                            rightToggle={<DeliciousnessToggle name="bacon_and_eggs" />}
                        />
                    </List>

                    <CustomTextField
                        name="free_text"
                        component={TextField}
                        floatingLabelText={"Anything else?"}
                        hintText={"e.g. We also have cold drinks and pony rides!"}
                        fullWidth={true}
                    />
                </FormSection>

                <FormSection>
                    <FormSectionHeader>Your details</FormSectionHeader>
                    <CustomTextField
                        name="email"
                        component={TextField}
                        floatingLabelText={"Contact email"}
                        hintText={"So we can contact you when we approve your stall (Don't worry - we won't spam you.)"}
                        fullWidth={true}
                        validate={[required, email]}
                        type={"email"}
                    />
                </FormSection>

                <DjangoAPIErrorUI errors={errors} />

                <RaisedButtonChunkyBottom
                    label={"Submit Stall Changes"}
                    disabled={!isValid || formSubmitting}
                    primary={true}
                    onClick={onSaveForm}
                />
                <HiddenButton type="submit" />
            </form>
        )
    }
}

// Decorate the form component
let EditStallFormReduxForm = reduxForm({
    form: "editStall", // a unique name for this form
    enableReinitialize: true,
    // tslint:disable-next-line: no-empty
    onChange: (values: object, dispatch: Function, props: any) => {},
})(EditStallForm)

export default EditStallFormReduxForm
