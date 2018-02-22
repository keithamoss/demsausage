import * as React from "react"
import styled from "styled-components"

// import { IElection, IStallLocationInfo } from "../../redux/modules/interfaces"
// import "./AddStallForm.css"

import AddStallFormContainer from "../AddStallForm/AddStallFormContainer"

export interface IProps {
    showWelcome: boolean
    showThankYou: boolean
    showForm: boolean
    onStallAdded: Function
}

const FormContainer = styled.div`
    padding-left: 15px;
    padding-right: 15px;
`

const FormSection = styled.div`
    margin-top: 30px;
    margin-bottom: 30px;
`

const FormSectionHeader = styled.h2`
    margin-bottom: 0px;
`

class AddStall extends React.PureComponent<IProps, {}> {
    render() {
        const { showWelcome, showThankYou, showForm, onStallAdded } = this.props

        return (
            <FormContainer>
                {showWelcome && (
                    <FormSection>
                        <FormSectionHeader>Add your sausage sizzle or cake stall</FormSectionHeader>
                        <br />
                        Please complete the form below to add your stall to the map. Please do not submit entries that are offensive,
                        political or do not relate to an election day stall. Please also make sure that you have authorisation to run your
                        fundraising event at the polling place. All entries are moderated and subject to approval.<br />
                        <br />
                        Having trouble submitting a stall? Email us at{" "}
                        <a href="mailto:ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a>!
                        <br />
                        <br />
                    </FormSection>
                )}

                {showThankYou && (
                    <FormSection>
                        <FormSectionHeader>Thank you</FormSectionHeader>
                        <br />
                        Thanks for letting us know about your stall! We'll let you know once it's approved and it's appearing on the map.
                        <br />
                        <br />
                    </FormSection>
                )}

                {showForm && <AddStallFormContainer onStallAdded={onStallAdded} />}
            </FormContainer>
        )
    }
}

export default AddStall
