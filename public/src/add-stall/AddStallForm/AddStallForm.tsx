import * as React from "react"
import styled from "styled-components"

import { Field, reduxForm } from "redux-form"
import { IElection, IStallLocationInfo } from "../../redux/modules/interfaces"
// import "./AddStallForm.css"

import { Step, Stepper, StepLabel, StepContent } from "material-ui/Stepper"
// import RaisedButton from "material-ui/RaisedButton"
// import FlatButton from "material-ui/FlatButton"

import GooglePlacesAutocompleteListWithConfirm from "../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocompleteListWithConfirm"
import PollingPlaceAutocompleteListWithConfirm from "../../finder/PollingPlaceAutocomplete/PollingPlaceAutocompleteListWithConfirm"
import { grey100, grey500 } from "material-ui/styles/colors"
import { TextField, Toggle } from "redux-form-material-ui"
import RaisedButton from "material-ui/RaisedButton"
import { List, ListItem } from "material-ui/List"
import { RadioButton, RadioButtonGroup } from "material-ui/RadioButton"

import SausageIcon from "../../icons/sausage"
import CakeIcon from "../../icons/cake"
import VegoIcon from "../../icons/vego"
import HalalIcon from "../../icons/halal"
import CoffeeIcon from "../../icons/coffee"
import BaconandEggsIcon from "../../icons/bacon-and-eggs"

const required = (value: any) => (value ? undefined : "Required")
const email = (value: any) => (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? "Invalid email address" : undefined)

export interface IProps {
    activeElections: Array<IElection>
    stepIndex: number
    onChooseElection: any
    chosenElection: IElection
    onConfirmChosenLocation: any
    stallLocationInfo: IStallLocationInfo
    locationConfirmed: boolean
    formSubmitting: boolean
    onSubmit: any
    onSaveForm: any

    // From redux-form
    initialValues: any
    handleSubmit: any
    isDirty: any
}

class CustomTextField extends React.Component<any, any> {
    render(): any {
        const { hintText, name, ...rest } = this.props

        return (
            <div>
                <Field name={name} {...rest} />
                <div style={{ color: grey500, fontSize: 12 }}>{hintText}</div>
            </div>
        )
    }
}

class DeliciousnessToggle extends React.Component<any, any> {
    render(): any {
        const { name, ...rest } = this.props
        return <Field name={name} component={Toggle} thumbStyle={{ backgroundColor: grey100 }} {...rest} />
    }
}

const FormSection = styled.div`
    margin-top: 30px;
    margin-bottom: 30px;
`

const FormSectionHeader = styled.h2`
    margin-bottom: 0px;
`

const HiddenButton = styled.button`
    display: none;
`

const StepContentStyled = styled(StepContent)`
    /* Give the contents of StepContent some breathing room so components
    using <Paper /> don't look cut off */
    & > div > div > div > div > div {
        padding: 5px;
    }
`

class AddStallForm extends React.PureComponent<IProps, {}> {
    render() {
        const {
            activeElections,
            stepIndex,
            onChooseElection,
            chosenElection,
            onConfirmChosenLocation,
            stallLocationInfo,
            locationConfirmed,
            formSubmitting,
        } = this.props
        const { isDirty, onSaveForm, handleSubmit, onSubmit } = this.props

        return (
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stepper activeStep={stepIndex} orientation="vertical">
                    <Step>
                        <StepLabel>{chosenElection === null ? "Your election" : `Your election: ${chosenElection.name}`}</StepLabel>
                        <StepContentStyled>
                            <RadioButtonGroup name="elections" onChange={onChooseElection}>
                                {activeElections.map((election: IElection) => (
                                    <RadioButton key={election.id} value={election} label={election.name} style={{ marginBottom: 16 }} />
                                ))}
                            </RadioButtonGroup>
                        </StepContentStyled>
                    </Step>

                    <Step>
                        <StepLabel>
                            {locationConfirmed === false ? "Stall location" : `Stall location: ${stallLocationInfo.polling_place_name}`}
                        </StepLabel>
                        <StepContentStyled>
                            {chosenElection !== null &&
                                chosenElection.polling_places_loaded === false && (
                                    <GooglePlacesAutocompleteListWithConfirm
                                        election={chosenElection}
                                        onConfirmChosenLocation={onConfirmChosenLocation}
                                        componentRestrictions={{ country: "AU" }}
                                        autoFocus={false}
                                        hintText={"Where is your stall?"}
                                    />
                                )}
                            {chosenElection !== null &&
                                chosenElection.polling_places_loaded === true && (
                                    <PollingPlaceAutocompleteListWithConfirm
                                        key={chosenElection.id}
                                        election={chosenElection}
                                        onConfirmChosenLocation={onConfirmChosenLocation}
                                        autoFocus={false}
                                        hintText={"Where is your stall?"}
                                    />
                                )}
                        </StepContentStyled>
                    </Step>

                    <Step>
                        <StepLabel>Stalls details</StepLabel>
                        <StepContentStyled>
                            {/* <div> required here so that StepContentStyled works */}
                            <div>
                                <FormSection style={{ marginTop: 0 }}>
                                    <CustomTextField
                                        name="stall_name"
                                        component={TextField}
                                        floatingLabelText={"Stall name"}
                                        hintText={"e.g. Primary School Sausage Sizzle"}
                                        fullWidth={true}
                                        validate={[required]}
                                    />
                                    <CustomTextField
                                        name="stall_description"
                                        component={TextField}
                                        multiLine={true}
                                        floatingLabelText={"Stall description"}
                                        hintText={"e.g. We're raising funds for the Year 7 school camp"}
                                        fullWidth={true}
                                        validate={[required]}
                                    />
                                    <CustomTextField
                                        name="stall_website"
                                        component={TextField}
                                        floatingLabelText={"Stall website"}
                                        hintText={"We'll include a link to your site as part of your stall's information"}
                                        fullWidth={true}
                                    />
                                </FormSection>

                                <FormSection>
                                    <FormSectionHeader>Your details</FormSectionHeader>
                                    <CustomTextField
                                        name="contact_email"
                                        component={TextField}
                                        floatingLabelText={"Contact email"}
                                        hintText={"So we can contact you when we approve your stall (Don't worry - we won't spam you.)"}
                                        fullWidth={true}
                                        validate={[required, email]}
                                        type={"email"}
                                    />
                                </FormSection>

                                <FormSection>
                                    <FormSectionHeader>What's on offer?</FormSectionHeader>
                                    <List>
                                        <ListItem
                                            primaryText="Is there a sausage sizzle?"
                                            leftIcon={<SausageIcon />}
                                            rightToggle={<DeliciousnessToggle name="has_bbq" />}
                                        />
                                        <ListItem
                                            primaryText="Is there a cake stall?"
                                            leftIcon={<CakeIcon />}
                                            rightToggle={<DeliciousnessToggle name="has_caek" />}
                                        />
                                        <ListItem
                                            primaryText="Are there vegetarian options?"
                                            leftIcon={<VegoIcon />}
                                            rightToggle={<DeliciousnessToggle name="has_vego" />}
                                        />
                                        <ListItem
                                            primaryText="Is there any food that's halal?"
                                            leftIcon={<HalalIcon />}
                                            rightToggle={<DeliciousnessToggle name="has_halal" />}
                                        />
                                        <ListItem
                                            primaryText="Do you have coffee?"
                                            leftIcon={<CoffeeIcon />}
                                            rightToggle={<DeliciousnessToggle name="has_coffee" />}
                                        />
                                        <ListItem
                                            primaryText="Are there bacon and eggs?"
                                            leftIcon={<BaconandEggsIcon />}
                                            rightToggle={<DeliciousnessToggle name="has_bacon_and_eggs" />}
                                        />
                                    </List>

                                    <CustomTextField
                                        name="has_free_text"
                                        component={TextField}
                                        floatingLabelText={"Anything else?"}
                                        hintText={"e.g. We also have cold drinks and pony rides!"}
                                        fullWidth={true}
                                    />
                                </FormSection>

                                <RaisedButton
                                    label={"Submit Stall"}
                                    disabled={!isDirty || formSubmitting}
                                    primary={true}
                                    onClick={onSaveForm}
                                />
                                <HiddenButton type="submit" />
                            </div>
                        </StepContentStyled>
                    </Step>
                </Stepper>
            </form>
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
