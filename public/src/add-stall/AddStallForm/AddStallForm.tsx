import { List, ListItem } from "material-ui/List"
import { RadioButton } from "material-ui/RadioButton"
import RaisedButton from "material-ui/RaisedButton"
// import "./AddStallForm.css"
import { Step, StepContent, StepLabel, Stepper } from "material-ui/Stepper"
import { grey100, grey500, grey800 } from "material-ui/styles/colors"
import { HardwareSecurity } from "material-ui/svg-icons"
import * as React from "react"
import { Field, reduxForm } from "redux-form"
import { RadioButtonGroup, TextField, Toggle } from "redux-form-material-ui"
import styled from "styled-components"
import BaconandEggsIcon from "../../icons/bacon-and-eggs"
import CakeIcon from "../../icons/cake"
import CoffeeIcon from "../../icons/coffee"
import HalalIcon from "../../icons/halal"
import SausageIcon from "../../icons/sausage"
import VegoIcon from "../../icons/vego"
import { IElection } from "../../redux/modules/elections"
import DjangoAPIErrorUI, { IDjangoAPIError } from "../../shared/ui/DjangoAPIErrorUI/DjangoAPIErrorUI"
import GooglePlacesAndPollingPlacesAutocompleteListWithConfirm from "../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAndPollingPlacesAutocompleteListWithConfirm"
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
    formIsSubmitting: boolean
    formSyncErrors: any
    formHasSubmitFailed: boolean
    errors: IDjangoAPIError | undefined
    onSubmit: any
    onSaveForm: any

    // From redux-form
    initialValues: any
    handleSubmit: any
}

export class CustomTextField extends React.Component<any, any> {
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

export class DeliciousnessToggle extends React.Component<any, any> {
    render(): any {
        const { name, ...rest } = this.props
        return <Field name={name} component={Toggle as any} thumbStyle={{ backgroundColor: grey100 }} {...rest} />
    }
}

const StepContentStyled = styled(StepContent)`
    /* Give the contents of StepContent some breathing room so components
    using <Paper /> don't look cut off */
    & > div > div > div > div > div {
        padding: 5px;
    }
`

const FormSection = styled.div`
    margin-top: 35px;
    margin-bottom: 35px;
`

const FormSectionHeader = styled.h2`
    margin-bottom: 0px;
`

const PrivacySection = styled.div`
    margin-top: 30px;
`

const PrivacySectionHeader = styled.h4`
    margin-top: 20px;
    margin-bottom: 10px;
`

const Privacy = styled.div`
    margin-bottom: 25px;
    font-size: 14px;
    line-height: 24px;
    color: ${grey800};
    width: 75%;
`

const HiddenButton = styled.button`
    display: none;
`

// Fix that iOS Safari bug
const StupidFormPadderToFixiOSBugs = styled.div`
    margin-bottom: 60px;
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
            formIsSubmitting,
            formSyncErrors,
            formHasSubmitFailed,
            errors,
        } = this.props
        const { onSaveForm, handleSubmit, onSubmit } = this.props

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
            <Stepper activeStep={stepIndex} orientation="vertical">
                <Step>
                    <StepLabel>{chosenElection === null ? "Choose an election" : chosenElection.name}</StepLabel>
                    <StepContentStyled>
                        <RadioButtonGroup name="elections" onChange={onChooseElection}>
                            {liveElections.map((election: IElection) => (
                                <RadioButton key={election.id} value={election.id} label={election.name} style={{ marginBottom: 16 }} />
                            ))}
                        </RadioButtonGroup>
                    </StepContentStyled>
                </Step>

                <Step>
                    <StepLabel>{locationConfirmed === false ? "Where is your stall?" : primaryTextString}</StepLabel>
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
                            <GooglePlacesAndPollingPlacesAutocompleteListWithConfirm
                                election={chosenElection}
                                onConfirmChosenLocation={onConfirmChosenLocation}
                                componentRestrictions={{ country: "AU" }}
                                autoFocus={false}
                                hintText={"Where is your stall?"}
                            />
                        )}
                    </StepContentStyled>
                </Step>

                <Step>
                    <StepLabel>Tell us about your stall</StepLabel>
                    <StepContentStyled>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* <div> required here so that StepContentStyled works */}
                            <div>
                                <FormSection style={{ marginTop: 0 }}>
                                    <CustomTextField
                                        name="name"
                                        component={TextField}
                                        floatingLabelText={"Give your stall a name!"}
                                        hintText={"e.g. Smith Hill Primary School Sausage Sizzle"}
                                        fullWidth={true}
                                        validate={[required]}
                                        autoComplete="no"
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
                                        autoComplete="no"
                                    />
                                    <CustomTextField
                                        name="opening_hours"
                                        component={TextField}
                                        floatingLabelText={"Stall opening hours (optional)"}
                                        hintText={"e.g. 8AM - 2PM"}
                                        fullWidth={true}
                                        autoComplete="no"
                                    />
                                    <CustomTextField
                                        name="website"
                                        component={TextField}
                                        floatingLabelText={"Stall website or social media page (optional)"}
                                        hintText={"We'll include a link to your site as part of your stall's information"}
                                        fullWidth={true}
                                        autoComplete="no"
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
                                        hintText={"e.g. We also have yummy gluten free sausage rolls, cold drinks, and pony rides!"}
                                        fullWidth={true}
                                        autoComplete="no"
                                    />
                                </FormSection>

                                <FormSection>
                                    <FormSectionHeader>Your details</FormSectionHeader>
                                    <CustomTextField
                                        name="email"
                                        component={TextField}
                                        floatingLabelText={"What's your email address?"}
                                        hintText={"So we can let you know when we've approved your stall"}
                                        fullWidth={true}
                                        validate={[required, email]}
                                        type={"email"}
                                        autoComplete="email"
                                    />
                                </FormSection>

                                <DjangoAPIErrorUI errors={errors} />

                                {formHasSubmitFailed === true && Object.keys(formSyncErrors).length > 0 && (
                                    <DjangoAPIErrorUI errors={formSyncErrors} />
                                )}

                                <RaisedButton label={"Submit Stall"} disabled={formIsSubmitting} primary={true} onClick={onSaveForm} />
                                <HiddenButton type="submit" />

                                <PrivacySection>
                                    <PrivacySectionHeader>
                                        <HardwareSecurity /> A word about privacy
                                    </PrivacySectionHeader>
                                    <Privacy>
                                        Democracy Sausage loves open data, but we also love privacy and not sharing your data with anyone
                                        who shouldn't have it. Without access to open (i.e. publicly available, reusable, and free) polling
                                        place data from the electoral commissions Democracy Sausage wouldn't exist, so where we can we like
                                        to share the data we crowdsauce as open data for others to use.
                                        <br />
                                        <br />
                                        For some elections we'll allow third parties to display information submitted to Democracy Sausage
                                        on their websites - e.g. local media outlets who want to show a map of sausage sizzles, other
                                        election sausage sizzle mapping sites, or companies and political parties running "Where to vote"
                                        websites who want to show people where to find sausage sizzles. Democracy Sausage is 100%
                                        volunteer-run because we love the idea of mapping sausage sizzles - we <strong>never</strong>{" "}
                                        benefit financially or personally from these arrangements.
                                        <br />
                                        <br />
                                        We'll allow these third parties to use information about your stall (
                                        <strong>its name, a description of it, and any website address</strong>) and what you have on offer
                                        (<strong>whether there's a sausage sizzle, cake stall, et cetera</strong>). We{" "}
                                        <strong>won't</strong> tell these third parties anything about you (the person who is submitting
                                        this stall), this includes{" "}
                                        <strong>
                                            your email, IP address, and any other personally identifiable information that your phone or
                                            laptop transmits to us
                                        </strong>
                                        . All of the information about where your stall actually is comes from the electoral commissions and
                                        is already publicly available.
                                        <br />
                                        <br />
                                        Got questions or concerns about any of this? Just get in touch with us at{" "}
                                        <a href="mailto:ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a> - we're very happy
                                        to discuss.
                                    </Privacy>
                                </PrivacySection>

                                <StupidFormPadderToFixiOSBugs />
                            </div>
                        </form>
                    </StepContentStyled>
                </Step>
            </Stepper>
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
