import * as React from "react"
import styled from "styled-components"

import { Field, reduxForm } from "redux-form"
import { IElection, IStallLocationInfo } from "../../redux/modules/interfaces"
// import "./AddStallForm.css"

import GooglePlacesAutocompleteList from "../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocompleteList"
import StallLocationCard from "../StallLocationCard/StallLocationCard"
import { grey100, grey500 } from "material-ui/styles/colors"
import { TextField, Toggle } from "redux-form-material-ui"
import RaisedButton from "material-ui/RaisedButton"
import { List, ListItem } from "material-ui/List"

import SausageIcon from "../../icons/sausage"
import CakeIcon from "../../icons/cake"
import VegoIcon from "../../icons/vego"
import HalalIcon from "../../icons/halal"
import CoffeeIcon from "../../icons/coffee"
import BaconandEggsIcon from "../../icons/bacon-and-eggs"

const required = (value: any) => (value ? undefined : "Required")
const email = (value: any) => (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? "Invalid email address" : undefined)

export interface IProps {
    election: IElection
    // pollingPlace: IPollingPlace
    locationChosen: boolean
    stallLocationInfo: IStallLocationInfo
    onChoosePlace: any
    onCancelChosenLocation: any
    onConfirmChosenLocation: any
    locationConfirmed: boolean
    formSubmitting: boolean
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

class CustomTextField extends React.Component<any, any> {
    render(): any {
        const { hintText, ...rest } = this.props

        return (
            <div>
                <CustomField {...rest} />
                <div style={{ color: grey500, fontSize: 12 }}>{hintText}</div>
            </div>
        )
    }
}

class DeliciousnessToggle extends React.Component<any, any> {
    render(): any {
        return <CustomField component={Toggle} thumbStyle={{ backgroundColor: grey100 }} {...this.props} />
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

class AddStallForm extends React.PureComponent<IProps, {}> {
    render() {
        const {
            election,
            locationChosen,
            stallLocationInfo,
            onChoosePlace,
            onCancelChosenLocation,
            onConfirmChosenLocation,
            locationConfirmed,
            formSubmitting,
        } = this.props
        const { isDirty, onSaveForm, handleSubmit, onSubmit } = this.props

        return (
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormSection>
                    <FormSectionHeader>Stall location</FormSectionHeader>
                    <br />
                    {locationConfirmed === false &&
                        election.polling_places_loaded === false && (
                            <div>
                                <GooglePlacesAutocompleteList
                                    componentRestrictions={{ country: "AU" }}
                                    hintText={"Where is your stall?"}
                                    onChoosePlace={onChoosePlace}
                                />
                                <br />
                            </div>
                        )}
                    {locationChosen && (
                        <StallLocationCard
                            stallLocationInfo={stallLocationInfo}
                            showActions={locationConfirmed === false}
                            onCancel={onCancelChosenLocation}
                            onConfirm={onConfirmChosenLocation}
                        />
                    )}
                </FormSection>

                {locationConfirmed && (
                    <div>
                        <FormSection>
                            <FormSectionHeader>Stalls details</FormSectionHeader>
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
                                floatingLabelText={"Stall description"}
                                hintText={"e.g. Sausages, bread rolls, drinks to fund the local cricket team"}
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
                                hintText={"So we can contact you when we approve your stall"}
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
                                    rightToggle={<DeliciousnessToggle name="has_baconandeggs" />}
                                />
                            </List>
                        </FormSection>

                        <RaisedButton label={"Submit Stall"} disabled={!isDirty || formSubmitting} primary={true} onClick={onSaveForm} />
                        <HiddenButton type="submit" />
                        <br />
                        <br />
                    </div>
                )}
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
