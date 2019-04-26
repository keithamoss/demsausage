import Avatar from "material-ui/Avatar"
// import "./PollingPlaceForm.css"
import { Card, CardActions, CardText, CardTitle } from "material-ui/Card"
import Divider from "material-ui/Divider"
import { List, ListItem } from "material-ui/List"
import MenuItem from "material-ui/MenuItem"
import RaisedButton from "material-ui/RaisedButton"
import { blue500, grey100, grey500, yellow700 } from "material-ui/styles/colors"
import { AlertWarning, ContentBlock } from "material-ui/svg-icons"
import * as React from "react"
import { Field, reduxForm } from "redux-form"
import { SelectField, TextField, Toggle } from "redux-form-material-ui"
import styled from "styled-components"
import BaconandEggsIcon from "../../icons/bacon-and-eggs"
import CakeIcon from "../../icons/cake"
import CoffeeIcon from "../../icons/coffee"
import HalalIcon from "../../icons/halal"
import RedCrossofShameIcon from "../../icons/red-cross-of-shame"
import SausageIcon from "../../icons/sausage"
import VegoIcon from "../../icons/vego"
import { IElection } from "../../redux/modules/elections"
import { IPollingPlace, IPollingPlaceFacilityType } from "../../redux/modules/polling_places"

export interface IProps {
    election: IElection
    pollingPlace: IPollingPlace
    stallWasMerged: boolean
    pollingPlaceTypes: IPollingPlaceFacilityType[]
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
        return <Field name="something" autoComplete={"off"} {...this.props} />
    }
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
        return <CustomField component={Toggle} thumbStyle={{ backgroundColor: grey100 }} {...this.props} />
    }
}

const FormCardTitle = styled(CardTitle)`
    padding-bottom: 0px !important;
`

const FormCardText = styled(CardText)`
    padding-top: 0px !important;
`

const HiddenButton = styled.button`
    display: none;
`

class PollingPlaceForm extends React.PureComponent<IProps, {}> {
    render() {
        const { stallWasMerged, pollingPlaceTypes, onSaveForm, handleSubmit, onSubmit } = this.props

        return (
            <form onSubmit={handleSubmit(onSubmit)}>
                {stallWasMerged && (
                    <ListItem
                        leftAvatar={<Avatar icon={<AlertWarning />} backgroundColor={blue500} />}
                        primaryText={"Stall information has already been automatically populated for you"}
                        secondaryText={
                            "This polling place had no reports yet, so just double check everything and hit 'Save' if it's all OK."
                        }
                        secondaryTextLines={2}
                        disabled={true}
                    />
                )}

                <Card>
                    <FormCardTitle title={"Deliciousness"} />
                    <FormCardText>
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
                            <Divider />
                            <ListItem
                                primaryText="Red. Cross. Of. Shame."
                                leftIcon={<RedCrossofShameIcon />}
                                rightToggle={<DeliciousnessToggle name="nothing" />}
                            />
                            <ListItem
                                primaryText="They've run out of food!"
                                leftIcon={<ContentBlock color={yellow700} />}
                                rightToggle={<DeliciousnessToggle name="run_out" />}
                            />
                        </List>

                        <CustomTextField
                            name="free_text"
                            component={TextField}
                            floatingLabelText={"Anything else to add?"}
                            hintText={"What other types of delicious are here?"}
                            fullWidth={true}
                        />
                    </FormCardText>
                </Card>

                <Card>
                    <FormCardTitle title={"Stall Information"} />
                    <FormCardText>
                        <CustomTextField
                            name="name"
                            component={TextField}
                            floatingLabelText={"Stall name"}
                            hintText={"The name of the stall that is here"}
                            fullWidth={true}
                        />
                        <CustomTextField
                            name="description"
                            component={TextField}
                            multiLine={true}
                            floatingLabelText={"Stall description"}
                            hintText={"A brief description of the stall"}
                            fullWidth={true}
                        />
                        <CustomTextField
                            name="opening_hours"
                            component={TextField}
                            floatingLabelText={"Opening hours"}
                            hintText={"e.g. 8AM - 2PM"}
                            fullWidth={true}
                        />
                        <CustomTextField
                            name="website"
                            component={TextField}
                            floatingLabelText={"Stall website"}
                            hintText={"A link to the website of the people organising the stall"}
                            fullWidth={true}
                        />
                        <CustomTextField
                            name="extra_info"
                            component={TextField}
                            floatingLabelText={"Extra info"}
                            hintText={"Is there any other information to add?"}
                            fullWidth={true}
                        />
                    </FormCardText>
                </Card>

                <Card>
                    <FormCardTitle title={"Polling Place Information"} />
                    <FormCardText>
                        <CustomField
                            name="facility_type"
                            component={SelectField}
                            floatingLabelText={"What type of polling place is this?"}
                            fullWidth={true}
                        >
                            {pollingPlaceTypes.map((type: IPollingPlaceFacilityType) => (
                                <MenuItem key={type.name} value={type.name} primaryText={type.name} />
                            ))}
                        </CustomField>
                        <CustomTextField
                            name="source"
                            component={TextField}
                            floatingLabelText={"Source of this report"}
                            hintText={"What is the source? (e.g. Twitter, Facebook, School Newsletter)"}
                            fullWidth={true}
                        />
                    </FormCardText>
                    <CardActions>
                        <RaisedButton label={"Save"} primary={true} onClick={onSaveForm} />
                        <HiddenButton type="submit" />
                    </CardActions>
                </Card>
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
