import Avatar from "material-ui/Avatar"
import { Card, CardHeader } from "material-ui/Card"
import Subheader from "material-ui/Subheader"
import * as React from "react"
import styled from "styled-components"
import { getElectionVeryShortName, IElection } from "../../redux/modules/elections"

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

export interface IProps {
    elections: Array<IElection>
    onChooseElection: any
}

class ElectionChooser extends React.PureComponent<IProps, {}> {
    render() {
        const { elections, onChooseElection } = this.props

        // Insert year <Subheaders> between groups of elections
        let lastYear: number

        // https://pawelgrzybek.com/return-multiple-elements-from-a-component-with-react-16/
        const Aux = (props: any) => props.children

        return (
            <ElectionCardsContainer>
                {elections.map((election: IElection) => {
                    let sub
                    let fullYear = new Date(election.election_day).getFullYear()
                    if (lastYear === undefined || lastYear !== fullYear) {
                        sub = <Subheader>{fullYear}</Subheader>
                        lastYear = fullYear
                    }

                    return (
                        <Aux key={election.id}>
                            {sub}
                            <ElectionCardContainer onClick={() => onChooseElection(election)}>
                                <ElectionCard>
                                    <CardHeader
                                        title={election.name}
                                        textStyle={{ maxWidth: "190px", whiteSpace: "normal", paddingRight: "0px" }}
                                        subtitle={new Date(election.election_day).toLocaleDateString("en-AU", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                        avatar={
                                            <Avatar size={50} style={{ fontSize: 20 }}>
                                                {getElectionVeryShortName(election)}
                                            </Avatar>
                                        }
                                    />
                                </ElectionCard>
                            </ElectionCardContainer>
                        </Aux>
                    )
                })}
            </ElectionCardsContainer>
        )
    }
}

export default ElectionChooser
