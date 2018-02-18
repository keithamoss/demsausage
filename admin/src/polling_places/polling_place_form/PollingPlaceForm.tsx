import * as React from "react"
import styled from "styled-components"

import { Field, reduxForm } from "redux-form"
import { IElection, IPollingPlace } from "../../redux/modules/interfaces"
// import "./PollingPlaceForm.css"

// import Paper from "material-ui/Paper"
import { Card, CardTitle, CardText, CardActions } from "material-ui/Card"
import { grey100 } from "material-ui/styles/colors"
// import { GridList, GridTile } from "material-ui/GridList"
import { TextField, Toggle, SelectField } from "redux-form-material-ui"
import MenuItem from "material-ui/MenuItem"
import Divider from "material-ui/Divider"
import RaisedButton from "material-ui/RaisedButton"
import { List, ListItem } from "material-ui/List"
// import { Avatar } from "material-ui"
// import { ActionHome, MapsPlace, ActionDescription, AvWeb, CommunicationEmail, ActionInfo, MapsLocalDining } from "material-ui/svg-icons"
// import { ActionInfo, MapsLocalDining } from "material-ui/svg-icons"
import { ContentBlock } from "material-ui/svg-icons"

import SausageIcon from "../../icons/sausage"
import CakeIcon from "../../icons/cake"
import VegoIcon from "../../icons/vego"
import HalalIcon from "../../icons/halal"
import CoffeeIcon from "../../icons/coffee"
import BaconandEggsIcon from "../../icons/bacon-and-eggs"
import RedCrossofShameIcon from "../../icons/red-cross-of-shame"
import { yellow700 } from "material-ui/styles/colors"

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

const FormCardTitle = styled(CardTitle)`
    padding-bottom: 0px !important;
`

const HiddenButton = styled.button`
    display: none;
`

class PollingPlaceForm extends React.PureComponent<IProps, {}> {
    render() {
        const { isDirty, pollingPlaceTypes, onSaveForm, handleSubmit, onSubmit } = this.props

        return (
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <FormCardTitle title={"Deliciousness"} />
                    <CardText>
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
                            <Divider />
                            <ListItem
                                primaryText="Red. Cross. Of. Shame."
                                leftIcon={<RedCrossofShameIcon />}
                                rightToggle={<DeliciousnessToggle name="has_nothing" />}
                            />
                            <ListItem
                                primaryText="They've run out of food!"
                                leftIcon={<ContentBlock color={yellow700} />}
                                rightToggle={<DeliciousnessToggle name="has_run_out" />}
                            />
                        </List>

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
                        </DeliciousnessGrid> */}

                        <CustomField
                            name="has_freetext"
                            component={TextField}
                            floatingLabelText={"What other types of delicious are here?"}
                            fullWidth={true}
                        />
                    </CardText>
                </Card>

                <Card>
                    <FormCardTitle title={"Stall Information"} />
                    <CardText>
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
                    </CardText>
                </Card>

                <Card>
                    <FormCardTitle title={"Polling Place Information"} />
                    <CardText>
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
                    </CardText>
                    <CardActions>
                        <RaisedButton label={"Save"} disabled={!isDirty} primary={true} onClick={onSaveForm} />
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
