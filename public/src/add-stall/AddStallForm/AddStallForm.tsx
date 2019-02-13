import { List, ListItem } from "material-ui/List"
import { RadioButton, RadioButtonGroup } from "material-ui/RadioButton"
import RaisedButton from "material-ui/RaisedButton"
// import "./AddStallForm.css"
import { Step, StepContent, StepLabel, Stepper } from "material-ui/Stepper"
import { grey100, grey500 } from "material-ui/styles/colors"
import * as React from "react"
import { Field, reduxForm } from "redux-form"
import { TextField, Toggle } from "redux-form-material-ui"
import styled from "styled-components"
import PollingPlaceAutocompleteListWithConfirm from "../../finder/PollingPlaceAutocomplete/PollingPlaceAutocompleteListWithConfirm"
import BaconandEggsIcon from "../../icons/bacon-and-eggs"
import CakeIcon from "../../icons/cake"
import CoffeeIcon from "../../icons/coffee"
import HalalIcon from "../../icons/halal"
import SausageIcon from "../../icons/sausage"
import VegoIcon from "../../icons/vego"
import { IElection } from "../../redux/modules/elections"
import DjangoAPIErrorUI, { IDjangoAPIError } from "../../shared/ui/DjangoAPIErrorUI/DjangoAPIErrorUI"
// import RaisedButton from "material-ui/RaisedButton"
// import FlatButton from "material-ui/FlatButton"
import GooglePlacesAutocompleteListWithConfirm from "../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocompleteListWithConfirm"

const required = (value: any) => (value ? undefined : "Required")
const email = (value: any) => (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? "Invalid email address" : undefined)

export interface IProps {
    liveElections: Array<IElection>
    stepIndex: number
    onChooseElection: any
    chosenElection: IElection
    onConfirmChosenLocation: any
    stallLocationInfo: any // Bit of a hack around the issue of this being IStallLocationInfo OR IPollingPlace
    locationConfirmed: boolean
    formSubmitting: boolean
    errors: IDjangoAPIError | undefined
    onSubmit: any
    onSaveForm: any

    // From redux-form
    initialValues: any
    handleSubmit: any
    isValid: any
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
        return <Field name={name} component={Toggle as any} thumbStyle={{ backgroundColor: grey100 }} {...rest} />
    }
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
            liveElections,
            stepIndex,
            onChooseElection,
            chosenElection,
            onConfirmChosenLocation,
            stallLocationInfo,
            locationConfirmed,
            formSubmitting,
            errors,
        } = this.props
        const { isValid, onSaveForm, handleSubmit, onSubmit } = this.props

        let primaryTextString
        if (stallLocationInfo !== null) {
            if ("id" in stallLocationInfo) {
                primaryTextString =
                    stallLocationInfo.name === stallLocationInfo.premises
                        ? stallLocationInfo.name
                        : `${stallLocationInfo.name}, ${stallLocationInfo.premises}`
            } else {
                primaryTextString = `${stallLocationInfo.name}, ${stallLocationInfo.address}`
            }
        }

        return (
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stepper activeStep={stepIndex} orientation="vertical">
                    <Step>
                        <StepLabel>{chosenElection === null ? "Your election" : `Your election: ${chosenElection.name}`}</StepLabel>
                        <StepContentStyled>
                            <RadioButtonGroup name="elections" onChange={onChooseElection}>
                                {liveElections.map((election: IElection) => (
                                    <RadioButton key={election.id} value={election} label={election.name} style={{ marginBottom: 16 }} />
                                ))}
                            </RadioButtonGroup>
                        </StepContentStyled>
                    </Step>

                    <Step>
                        <StepLabel>{locationConfirmed === false ? "Stall location" : `Stall location: ${primaryTextString}`}</StepLabel>
                        <StepContentStyled>
                            {chosenElection !== null && chosenElection.polling_places_loaded === false && (
                                <GooglePlacesAutocompleteListWithConfirm
                                    election={chosenElection}
                                    onConfirmChosenLocation={onConfirmChosenLocation}
                                    componentRestrictions={{ country: "AU" }}
                                    autoFocus={false}
                                    hintText={"Where is your stall?"}
                                />
                            )}
                            {chosenElection !== null && chosenElection.polling_places_loaded === true && (
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
                        <StepLabel>Stall details</StepLabel>
                        <StepContentStyled>
                            {/* <div> required here so that StepContentStyled works */}
                            <div>
                                <FormSection style={{ marginTop: 0 }}>
                                    <CustomTextField
                                        name="name"
                                        component={TextField}
                                        floatingLabelText={"Stall name"}
                                        hintText={"e.g. Primary School Sausage Sizzle"}
                                        fullWidth={true}
                                        validate={[required]}
                                    />
                                    <CustomTextField
                                        name="description"
                                        component={TextField}
                                        multiLine={true}
                                        floatingLabelText={"Stall description"}
                                        hintText={"e.g. We're raising funds for the Year 7 school camp"}
                                        fullWidth={true}
                                        validate={[required]}
                                    />
                                    <CustomTextField
                                        name="website"
                                        component={TextField}
                                        floatingLabelText={"Stall website"}
                                        hintText={"We'll include a link to your site as part of your stall's information"}
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

                                <DjangoAPIErrorUI errors={errors} />

                                <RaisedButtonChunkyBottom
                                    label={"Submit Stall"}
                                    disabled={!isValid || formSubmitting}
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
