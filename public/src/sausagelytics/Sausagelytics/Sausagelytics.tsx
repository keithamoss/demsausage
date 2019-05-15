import { Table, TableBody, TableRow, TableRowColumn } from "material-ui"
import * as React from "react"
import styled from "styled-components"
import { VictoryBar, VictoryChart, VictoryGroup, VictoryLabel, VictoryPie } from "victory"
import { IElection, IElectionStats, ISausagelyticsStats } from "../../redux/modules/elections"
import { theme } from "../../shared/sausagelytics/Victory"

interface IProps {
    election: IElection
    stats: ISausagelyticsStats
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
    width: 30%;
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
`

const FlexboxItemVictoryPieOverlay = styled.div`
    /* text-align: center; */
    /* align-items: start; */
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 18px;
    margin-top: -3px;
    text-align: center;

    background-color: #e8bb3c;
    color: #292336;
    padding: 10px 10%;
    border-top-left-radius: 50%;
    border-top-right-radius: 50%;
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

const FlexboxItemCircle = styled.div`
    position: relative;
`

const FlexboxWrapContainerChild = styled.div`
    position: relative;
    min-width: 280px;
    max-width: 300px;
    max-height: 200px;
    margin: 10px;
`

const SausagelyticsTable = styled(Table)`
    max-width: 600px;
    margin-bottom: 40px;

    & td {
        text-overflow: clip !important;
    }
`

const getPie = (stats: IElectionStats, style: any = undefined) => {
    const data = [stats.data.all_booths, stats.data.all_booths_by_noms.bbq]
    const percentage = stats.data.all_booths_by_noms.bbq.expected_voters / stats.data.all_booths.expected_voters

    return (
        <React.Fragment>
            <VictoryPie
                data={data}
                x={"booth_count"}
                y={"expected_voters"}
                padding={20}
                innerRadius={150}
                startAngle={90}
                endAngle={-90}
                // style={{
                //     data: {
                //         fill: d => d.fill,
                //     },
                // }}
                style={{ parent: { maxHeight: "300px" } }}
                theme={theme}
                // labelPosition="endAngle"
                labels={[""]}
            />
            <FlexboxItemVictoryPieOverlay style={style}>
                <strong>{stats.domain}</strong>
                <br />
                {new Intl.NumberFormat("en-AU").format(stats.data.all_booths_by_noms.bbq.expected_voters)} (
                {new Intl.NumberFormat("en-AU", { style: "percent", minimumFractionDigits: 1 }).format(percentage)})
            </FlexboxItemVictoryPieOverlay>
        </React.Fragment>
    )
}

class Sausagelytics extends React.PureComponent<IProps, {}> {
    render() {
        const { stats } = this.props

        const nomsByState = this.groupStateStatsByNoms()

        return (
            <SausagelyticsContainer>
                <FlexboxContainerCols>
                    <BoothsWithSausageSizzlesContainer>
                        <BoothsWithSausageSizzlesLabel>Polling booths with sausage sizzles</BoothsWithSausageSizzlesLabel>
                        <BoothsWithSausageSizzlesBigNumberContainer>
                            <BoothsWithSausageSizzlesBigNumber>
                                {stats.australia.data.all_booths_by_noms.bbq.booth_count}
                            </BoothsWithSausageSizzlesBigNumber>
                        </BoothsWithSausageSizzlesBigNumberContainer>
                    </BoothsWithSausageSizzlesContainer>
                </FlexboxContainerCols>

                <FlexboxContainerCols>
                    <FlexboxItemTitle>Expected % of voters with access to #democracysausage</FlexboxItemTitle>
                    <FlexboxItemCircle style={{ minWidth: "30%", maxWidth: "500px" }}>
                        {getPie(stats.australia, { borderTopLeftRadius: "unset", borderTopRightRadius: "unset", top: "70%" })}
                    </FlexboxItemCircle>

                    <FlexboxWrapContainer>
                        {stats.states.map((stats: IElectionStats) => (
                            <FlexboxWrapContainerChild key={stats.domain}>{getPie(stats)}</FlexboxWrapContainerChild>
                        ))}
                    </FlexboxWrapContainer>
                </FlexboxContainerCols>

                <FlexboxContainerCols>
                    <FlexboxItemTitle>By electorate - Expected % of voters with access to #democracysausage</FlexboxItemTitle>

                    <FlexboxItemSubtitle>Leaders of the Sizzling Award for commitment to #democracysausage</FlexboxItemSubtitle>
                    <FlexboxWrapContainer>
                        <SausagelyticsTable selectable={false}>
                            <TableBody displayRowCheckbox={false}>
                                {stats.divisions.top.map((stats: IElectionStats) => (
                                    <TableRow key={stats.domain}>
                                        <TableRowColumn style={{ width: "40px" }}>{stats.metadata!.rank!}.</TableRowColumn>
                                        <TableRowColumn>{stats.domain}</TableRowColumn>
                                        <TableRowColumn>{stats.metadata!.state!}</TableRowColumn>
                                        <TableRowColumn>
                                            {new Intl.NumberFormat("en-AU", {
                                                style: "percent",
                                                minimumFractionDigits: 1,
                                            }).format(
                                                stats.data.all_booths_by_noms.bbq.expected_voters / stats.data.all_booths.expected_voters
                                            )}
                                        </TableRowColumn>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </SausagelyticsTable>
                    </FlexboxWrapContainer>

                    <FlexboxItemSubtitle>The Wurst</FlexboxItemSubtitle>
                    <FlexboxWrapContainer>
                        <SausagelyticsTable selectable={false}>
                            <TableBody displayRowCheckbox={false}>
                                {stats.divisions.bottom.map((stats: IElectionStats) => (
                                    <TableRow key={stats.domain}>
                                        <TableRowColumn style={{ width: "40px" }}>{stats.metadata!.rank!}.</TableRowColumn>
                                        <TableRowColumn>{stats.domain}</TableRowColumn>
                                        <TableRowColumn>{stats.metadata!.state!}</TableRowColumn>
                                        <TableRowColumn>
                                            {new Intl.NumberFormat("en-AU", {
                                                style: "percent",
                                                minimumFractionDigits: 1,
                                            }).format(
                                                stats.data.all_booths_by_noms.bbq.expected_voters / stats.data.all_booths.expected_voters
                                            )}
                                        </TableRowColumn>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </SausagelyticsTable>
                    </FlexboxWrapContainer>
                </FlexboxContainerCols>

                <FlexboxContainerCols>
                    <FlexboxItemTitle>By state - Who's got what stalls</FlexboxItemTitle>

                    <FlexboxWrapContainer>
                        <VictoryChart height={1400}>
                            <VictoryGroup offset={20} padding={50} horizontal={true} colorScale={"qualitative"}>
                                {Object.keys(nomsByState).map((nomsName: string) => (
                                    <VictoryBar
                                        key={`byNomsByState-${nomsName}`}
                                        data={nomsByState[nomsName]}
                                        barWidth={20}
                                        labels={d => `${d.y} ${nomsName.replace(/_/g, " ")}`}
                                        style={{ labels: { fill: "black" } }}
                                        labelComponent={<VictoryLabel />}
                                    />
                                ))}
                            </VictoryGroup>
                        </VictoryChart>
                    </FlexboxWrapContainer>
                </FlexboxContainerCols>
            </SausagelyticsContainer>
        )
    }

    private groupStateStatsByNoms() {
        const { stats } = this.props
        const statsGrouped: any = []

        stats.states.forEach((stateStats: IElectionStats) => {
            for (const [nomsName, nomsStats] of Object.entries(stateStats.data.all_booths_by_noms)) {
                if (!(nomsName in statsGrouped)) {
                    statsGrouped[nomsName] = []
                }

                statsGrouped[nomsName].push({
                    x: stateStats.domain,
                    y: nomsStats.booth_count,
                })
            }
        })

        return statsGrouped
    }
}

export default Sausagelytics
