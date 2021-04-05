import * as React from 'react'
import styled from 'styled-components'

const FlexboxCentredContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100%;
`

const FlexboxCentredBox = styled.div`
  width: 70%;
  max-width: 300px;
  text-align: center;
  align-items: start;
  opacity: 0.5;

  & > div:first-child > * {
    width: 125px !important;
    height: 125px !important;
  }

  & > div:last-child {
    margin-top: -5px;
  }
`

interface IProps {
  message: any
  icon: any
}

export default class EmptyState extends React.PureComponent<IProps, {}> {
  render() {
    const { message, icon } = this.props

    return (
      <FlexboxCentredContainer>
        <FlexboxCentredBox>
          <div>{icon}</div>
          <div>{message}</div>
        </FlexboxCentredBox>
      </FlexboxCentredContainer>
    )
  }
}
