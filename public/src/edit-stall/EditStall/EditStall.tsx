import { ListItem } from "material-ui"
import { ActionHome } from "material-ui/svg-icons"
import * as React from "react"
import styled from "styled-components"
import { getStallLocationAddress, getStallLocationName, IStall } from "../../redux/modules/stalls"
import DjangoAPIErrorUI, { IDjangoAPIError } from "../../shared/ui/DjangoAPIErrorUI/DjangoAPIErrorUI"
import EditStallFormContainer from "../EditStallForm/EditStallFormContainer"
import { IStallEditCredentials } from "./EditStallContainer"

export interface IProps {
    showAPIErrors: boolean
    showWelcome: boolean
    showThankYou: boolean
    showForm: boolean
    stall: IStall | null
    errors: IDjangoAPIError | undefined
    credentials: IStallEditCredentials
    onStallUpdated: any
}

const EditStallUIContainer = styled.div`
    padding-left: 15px;
    padding-right: 15px;
    margin-top: 30px;
    margin-bottom: 15px;
`

const SectionHeader = styled.h2`
    margin-bottom: 0px;
`

const BodyText = styled.p`
    margin-top: 20px;
`

class EditStall extends React.PureComponent<IProps, {}> {
    render() {
        const { showAPIErrors, showWelcome, showThankYou, showForm, stall, errors, credentials, onStallUpdated } = this.props

        return (
            <EditStallUIContainer>
                {showAPIErrors === true && <DjangoAPIErrorUI errors={errors} />}
                {showWelcome === true && (
                    <React.Fragment>
                        <SectionHeader>Update your sausage sizzle or cake stall</SectionHeader>
                        <BodyText>
                            Please complete the form below to update your stall details. Please do not submit entries that are offensive,
                            political or do not relate to an election day stall. Please also make sure that you have authorisation to run
                            your fundraising event at the polling place. All entries are moderated and subject to approval.
                            <br />
                            <br />
                            Having trouble submitting your changes? Email us at{" "}
                            <a href="mailto:ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a>!
                        </BodyText>
                    </React.Fragment>
                )}
                {showThankYou === true && (
                    <React.Fragment>
                        <SectionHeader>Thank you</SectionHeader>
                        <BodyText>
                            Thanks for letting us know about the changes your stall! We'll let you know once they've been approved and the
                            map has been updated.
                        </BodyText>
                    </React.Fragment>
                )}
                {showForm === true && stall !== undefined && stall != null && (
                    <React.Fragment>
                        <SectionHeader>Polling place</SectionHeader>
                        <ListItem
                            primaryText={getStallLocationName(stall)}
                            secondaryText={getStallLocationAddress(stall)}
                            leftIcon={<ActionHome />}
                        />
                        <EditStallFormContainer stall={stall} credentials={credentials} onStallUpdated={onStallUpdated} />
                    </React.Fragment>
                )}
            </EditStallUIContainer>
        )
    }
}

export default EditStall
