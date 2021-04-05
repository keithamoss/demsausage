import * as React from 'react'
import styled from 'styled-components'
import { isIE11 } from '../../utils'
import AddStallFormContainer from '../AddStallForm/AddStallFormContainer'
// import "./AddStallForm.css"

interface IProps {
  showNoLiveElections: boolean
  showWelcome: boolean
  showThankYou: boolean
  showForm: boolean
  onStallAdded: Function
}

const FormContainer = styled.div``

const FormSection = styled.div`
  padding-left: 15px;
  padding-right: 15px;
  margin-top: 10px;
  margin-bottom: 10px;
`

const FormSectionHeader = styled.h2`
  margin-bottom: 0px;
`

const FormText = styled.p`
  margin-top: 20px;
`

class AddStall extends React.PureComponent<IProps, {}> {
  render() {
    const { showNoLiveElections, showWelcome, showThankYou, showForm, onStallAdded } = this.props

    return (
      <FormContainer>
        {showNoLiveElections && (
          <FormSection>
            <FormSectionHeader>There aren't any live elections at the moment</FormSectionHeader>
            <FormText>
              Thanks for your interest in submitting a stall, but there aren't any elections coming up that we're
              planning to cover. If you know of an election that you think we should cover, please get in touch with us
              at <a href="mailto:ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a> and we'll consider
              adding it.
            </FormText>
          </FormSection>
        )}

        {showWelcome && isIE11 === false && (
          <FormSection>
            <FormSectionHeader>Add your sausage sizzle or cake stall</FormSectionHeader>
            <FormText>
              Please complete the form below to add your stall to the map. Please do not submit entries that are
              offensive, political or do not relate to an election day stall. Please also make sure that you have
              authorisation to run your fundraising event at the polling place. All entries are moderated and subject to
              approval.
              <br />
              <br />
              Having trouble submitting a stall? Email us at{' '}
              <a href="mailto:ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a>!
            </FormText>
          </FormSection>
        )}

        {showWelcome && isIE11 === true && (
          <FormSection>
            <FormSectionHeader>Send in your sausage sizzle or cake stall</FormSectionHeader>
            <FormText>
              You can submit your stall by emailing us at{' '}
              <a href="mailto:ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a>.<br />
              <br />
              Please do not submit entries that are offensive, political or do not relate to an election day stall.
              Please also make sure that you have authorisation to run your fundraising event at the polling place. All
              entries are moderated and subject to approval.
            </FormText>
          </FormSection>
        )}

        {showThankYou && (
          <FormSection>
            <FormSectionHeader>Thank you</FormSectionHeader>
            <FormText>
              Thanks for letting us know about your stall! We'll let you know once it's approved and it's appearing on
              the map.
            </FormText>
          </FormSection>
        )}

        {showForm && isIE11 === false && <AddStallFormContainer onStallAdded={onStallAdded} />}
      </FormContainer>
    )
  }
}

export default AddStall
