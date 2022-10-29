import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui'
import * as React from 'react'
import styled from 'styled-components'
import { IElection, ISausagelyticsStateStats } from '../../redux/modules/elections'

interface IProps {
  election: IElection
  stats: ISausagelyticsStateStats
}

const SausagelyticsContainer = styled.div`
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
`

const FlexboxWrapContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  height: 100%;
  min-width: 30%;
  max-width: 600px;
  justify-content: center;
`

const BoothsWithSausageSizzlesContainer = styled(FlexboxWrapContainer)`
  margin-bottom: 20px;
  align-items: stretch;
`

const BoothsWithSausageSizzlesLabel = styled.div`
  width: 30%;
  vertical-align: middle;
  text-align: right;
  padding-right: 10px;
  font-size: 22px;
`

const BoothsWithSausageSizzlesBigNumberContainer = styled.div`
  background-color: #e8bb3c;
  text-align: center;
  align-items: center;
  justify-content: center;
  display: flex;
`

const BoothsWithSausageSizzlesBigNumber = styled.h2`
  font-size: 50px;
  margin-top: 10px;
  margin-bottom: 10px;
  padding-left: 10px;
  padding-right: 10px;
`

const FlexboxContainerCols = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* Or do it all in one line with flex flow */
  /* flex-flow: row wrap; */
  /* tweak where items line up on the row valid values are: 
       flex-start, flex-end, space-between, space-around, stretch */
  /* align-content: flex-end; */
  /* margin-bottom: 20px; */
`

const FlexboxItemTitle = styled.h2`
  margin-top: 0px;
  margin-bottom: 20px;
  background-color: #e8bb3c;
  color: #292336;
  padding: 20px 10%;
`

const FlexboxItemSubtitle = styled(FlexboxItemTitle)`
  padding: 5px 5%;
`

const SausagelyticsTable = styled(Table)`
  max-width: 600px;
`

const SausagelyticsTableHeaderColumn = styled(TableHeaderColumn)`
  color: black !important;
  font-weight: bold !important;
`

class SausagelyticsState extends React.PureComponent<IProps, {}> {
  render() {
    const { stats } = this.props

    return (
      <SausagelyticsContainer>
        <FlexboxContainerCols>
          <BoothsWithSausageSizzlesContainer>
            <BoothsWithSausageSizzlesLabel>Polling booths with sausage sizzles</BoothsWithSausageSizzlesLabel>
            <BoothsWithSausageSizzlesBigNumberContainer>
              <BoothsWithSausageSizzlesBigNumber>
                {stats.state.data.all_booths_by_noms.bbq.booth_count}
              </BoothsWithSausageSizzlesBigNumber>
            </BoothsWithSausageSizzlesBigNumberContainer>
          </BoothsWithSausageSizzlesContainer>
        </FlexboxContainerCols>

        <FlexboxContainerCols>
          <FlexboxItemSubtitle style={{ marginBottom: 10, marginTop: 20 }}>
            What&apos;s available at stalls
          </FlexboxItemSubtitle>

          <FlexboxWrapContainer>
            <SausagelyticsTable selectable={false}>
              <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <SausagelyticsTableHeaderColumn>Noms</SausagelyticsTableHeaderColumn>
                  <SausagelyticsTableHeaderColumn># of booths</SausagelyticsTableHeaderColumn>
                  <SausagelyticsTableHeaderColumn>% of all booths</SausagelyticsTableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false}>
                {Object.keys(stats.state.data.all_booths_by_noms).map((nomsName: string) => (
                  <TableRow key={nomsName}>
                    <TableRowColumn>{nomsName.replace(/_/g, ' ')}</TableRowColumn>
                    <TableRowColumn>{stats.state.data.all_booths_by_noms[nomsName].booth_count}</TableRowColumn>
                    <TableRowColumn>
                      {stats.state.data.all_booths.booth_count > 0 &&
                        new Intl.NumberFormat('en-AU', {
                          style: 'percent',
                          minimumFractionDigits: 1,
                        }).format(
                          stats.state.data.all_booths_by_noms[nomsName].booth_count /
                            stats.state.data.all_booths.booth_count
                        )}
                    </TableRowColumn>
                  </TableRow>
                ))}
              </TableBody>
            </SausagelyticsTable>
          </FlexboxWrapContainer>
        </FlexboxContainerCols>
      </SausagelyticsContainer>
    )
  }
}

export default SausagelyticsState
