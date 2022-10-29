import { groupBy, sortBy } from 'lodash-es'
import Avatar from 'material-ui/Avatar'
import { Card, CardHeader } from 'material-ui/Card'
import Subheader from 'material-ui/Subheader'
import * as React from 'react'
import styled from 'styled-components'
import { getElectionVeryShortName, IElection } from '../../redux/modules/elections'

const ElectionCardsContainer = styled.div`
  margin-left: 15px;
  margin-right: 15px;
  margin-bottom: 30px;
`

const ElectionCardContainer = styled.div`
  cursor: pointer;
`

const ElectionCard = styled(Card)`
  margin-bottom: 10px;
  max-width: 400px;
`

interface IProps {
  elections: Array<IElection>
  onChooseElection: any
}

class ElectionChooser extends React.PureComponent<IProps, {}> {
  render() {
    const { elections, onChooseElection } = this.props

    // https://pawelgrzybek.com/return-multiple-elements-from-a-component-with-react-16/
    const Aux = (props: any) => props.children

    const electionsByYear = groupBy(sortBy(elections, 'election_day').reverse(), (e: IElection) =>
      new Date(e.election_day).getFullYear()
    )

    return (
      <ElectionCardsContainer>
        {Object.keys(electionsByYear)
          .sort()
          .reverse()
          .map((year: string) => {
            return (
              <Aux key={year}>
                <Subheader>{year}</Subheader>
                {electionsByYear[year].map((election: IElection) => {
                  return (
                    <ElectionCardContainer onClick={() => onChooseElection(election)} key={election.id}>
                      <ElectionCard>
                        <CardHeader
                          title={election.name}
                          textStyle={{ maxWidth: '190px', whiteSpace: 'normal', paddingRight: '0px' }}
                          subtitle={new Date(election.election_day).toLocaleDateString('en-AU', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                          avatar={
                            <Avatar size={50} style={{ fontSize: 20 }}>
                              {getElectionVeryShortName(election)}
                            </Avatar>
                          }
                        />
                      </ElectionCard>
                    </ElectionCardContainer>
                  )
                })}
              </Aux>
            )
          })}
      </ElectionCardsContainer>
    )
  }
}

export default ElectionChooser
