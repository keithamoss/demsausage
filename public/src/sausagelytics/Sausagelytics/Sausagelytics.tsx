// import "./SausagelyticsForm.css"
import LinearProgress from "material-ui/LinearProgress"
// import CircularProgress from "material-ui/CircularProgress"
import { ActionHome } from "material-ui/svg-icons"
import * as React from "react"
import styled from "styled-components"
// import PercentageCircle from "../../shared/viz/PercentageCircle/PercentageCircle"
import { VictoryBar, VictoryLabel, VictoryPie } from "victory"
import BaconandEggsIcon from "../../icons/bacon-and-eggs"
import CakeIcon from "../../icons/cake"
// import HalalIcon from "../../icons/halal"
import CoffeeIcon from "../../icons/coffee"
import SausageIcon from "../../icons/sausage"
import VegoIcon from "../../icons/vego"
import { IElection } from "../../redux/modules/elections"

interface IProps {
    currentElection: IElection
}

const SausagelyticsContainer = styled.div`
    padding-left: 10px;
    padding-right: 10px;
`

const FlexboxContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: left;
    justify-content: left;
    /* Or do it all in one line with flex flow */
    flex-flow: row wrap;
    /* tweak where items line up on the row valid values are: 
       flex-start, flex-end, space-between, space-around, stretch */
    align-content: flex-end;
    /* margin-bottom: -4px; */
`

const FlexboxContainerVictoryCircle = styled(FlexboxContainer)`
    background-color: rgb(61, 61, 61);
    color: white;
    padding: 10px;
    margin-bottom: 3px;
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
`

const FlexboxItemCircleGap = styled.div`
    width: 10%;
`

const FlexboxItemCircleTitle = styled.div`
    /* max-width: 500px; */
    width: 60%;

    & h5 {
        margin-top: 5px;
        text-transform: uppercase;
    }

    & h2 {
        margin-bottom: 5px;
    }
`

// const FlexboxItemPie = styled.div`
//     /* max-width: 500px; */
//     /* width: 60%; */
//     /* margin-right: 10px; */
// `

const FlexboxItemBar = styled.div`
    max-width: 500px;
    width: 80%;
    margin-right: 10px;
`

const FlexboxItemIcon = styled.div`
    /* margin-right: 10px; */
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

const FlexboxItemTitle = styled.div`
    margin-bottom: 20px;
    font-weight: bold;
`

const FlexboxItemCircle = styled.div`
    position: relative;
`

const FlexboxItemCircleOverlay = styled.div`
    /* text-align: center; */
    /* align-items: start; */
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 28px;
    color: #fbc02d;
`

class Sausagelytics extends React.PureComponent<IProps, {}> {
    render() {
        const { currentElection } = this.props

        console.log(currentElection)
        const sampleData = [
            { x: 1, y: 2, width: 25 },
            { x: 2, y: 3, width: 25 },
            { x: 3, y: 5, width: 25 },
            { x: 4, y: 4, width: 25 },
            { x: 5, y: 6, width: 25 },
        ]
        const sampleDataPie = [{ x: 1, y: 3.1 }, { x: 2, y: 6.9 }]

        return (
            <SausagelyticsContainer>
                <FlexboxContainerCols>
                    <FlexboxItemTitle>Booths Reported</FlexboxItemTitle>
                    <FlexboxItemCircle>
                        <svg viewBox="0 0 120 120" style={{ width: 120, height: 120, position: "relative", transform: "rotate(0.75turn)" }}>
                            <circle
                                cx="60"
                                cy="60"
                                r="57.5"
                                fill="none"
                                strokeWidth="5"
                                strokeMiterlimit="20"
                                style={{
                                    stroke: "#FBC02D",
                                    strokeLinecap: "round",
                                    transition: "all 0.3s linear 0ms",
                                    strokeDasharray: "110.993, 361.283",
                                }}
                            />
                        </svg>
                        <FlexboxItemCircleOverlay>351</FlexboxItemCircleOverlay>
                    </FlexboxItemCircle>
                </FlexboxContainerCols>

                <VictoryBar
                    style={{ data: { fill: "#c43a31" }, labels: { fill: "white" } }}
                    data={sampleData}
                    labels={d => d.y}
                    labelComponent={<VictoryLabel dy={30}>CoffeeIcon</VictoryLabel>}
                />

                <FlexboxContainerVictoryCircle>
                    <FlexboxItemCircleTitle>
                        <h5>Sausage Sizzles</h5>
                        <h2>35.2%</h2>
                        <LinearProgress
                            mode="determinate"
                            value={350}
                            max={651}
                            color={"#62c175"}
                            style={{ backgroundColor: "rgb(43, 43, 43)", height: "2px" }}
                        />
                    </FlexboxItemCircleTitle>
                    <FlexboxItemCircleGap />
                    <FlexboxItemCircle style={{ width: "30%" }}>
                        <VictoryPie
                            innerRadius={140}
                            padAngle={3}
                            data={sampleDataPie}
                            colorScale={["#62c175", "rgb(43, 43, 43)"]}
                            // labelRadius={90}
                            padding={10}
                        />
                        <FlexboxItemVictoryPieOverlay>351</FlexboxItemVictoryPieOverlay>
                    </FlexboxItemCircle>

                    {/* </FlexboxItemPie> */}
                </FlexboxContainerVictoryCircle>

                <FlexboxContainerVictoryCircle>
                    <FlexboxItemCircleTitle>
                        <h5>Cake Stalls</h5>
                        <h2>35.2%</h2>
                        <LinearProgress
                            mode="determinate"
                            value={350}
                            max={651}
                            color={"#62c175"}
                            style={{ backgroundColor: "rgb(43, 43, 43)", height: "2px" }}
                        />
                        {/* <SausageIcon /> */}
                    </FlexboxItemCircleTitle>
                    <FlexboxItemCircleGap />
                    <FlexboxItemCircle style={{ width: "30%" }}>
                        <VictoryPie
                            innerRadius={140}
                            padAngle={3}
                            data={sampleDataPie}
                            colorScale={["#62c175", "rgb(43, 43, 43)"]}
                            padding={10}
                            // labelRadius={90}
                        />
                        <FlexboxItemVictoryPieOverlay>351</FlexboxItemVictoryPieOverlay>
                    </FlexboxItemCircle>

                    {/* </FlexboxItemPie> */}
                </FlexboxContainerVictoryCircle>
                <br />
                <br />

                <FlexboxContainerCols>
                    <FlexboxItemTitle>Cake Stalls</FlexboxItemTitle>
                    <FlexboxItemCircle>
                        <svg viewBox="0 0 120 120" style={{ width: 120, height: 120, position: "relative", transform: "rotate(0.75turn)" }}>
                            <circle
                                cx="60"
                                cy="60"
                                r="57.5"
                                fill="none"
                                strokeWidth="5"
                                strokeMiterlimit="20"
                                style={{
                                    stroke: "#FBC02D",
                                    strokeLinecap: "round",
                                    transition: "all 0.3s linear 0ms",
                                    strokeDasharray: "110.993, 361.283",
                                }}
                            />
                        </svg>
                        <FlexboxItemCircleOverlay>
                            <CakeIcon />
                        </FlexboxItemCircleOverlay>
                    </FlexboxItemCircle>
                </FlexboxContainerCols>

                <br />

                <FlexboxContainer style={{ marginBottom: 10 }}>
                    <FlexboxItemBar>
                        <LinearProgress mode="determinate" value={350} max={651} style={{ height: 50 }} />
                    </FlexboxItemBar>
                    <FlexboxItemIcon>
                        <ActionHome style={{ width: 30, height: 30 }} />
                    </FlexboxItemIcon>
                </FlexboxContainer>

                <FlexboxContainer>
                    <FlexboxItemBar>
                        <LinearProgress mode="determinate" value={340} max={651} style={{ height: 30 }} />
                    </FlexboxItemBar>
                    <FlexboxItemIcon>
                        <SausageIcon style={{ width: 30, height: 30 }} />
                    </FlexboxItemIcon>
                </FlexboxContainer>

                <FlexboxContainer>
                    <FlexboxItemBar>
                        <LinearProgress mode="determinate" value={220} max={651} style={{ height: 30 }} />
                    </FlexboxItemBar>
                    <FlexboxItemIcon>
                        <CakeIcon style={{ width: 30, height: 30 }} />
                    </FlexboxItemIcon>
                </FlexboxContainer>

                <FlexboxContainer>
                    <FlexboxItemBar>
                        <LinearProgress mode="determinate" value={110} max={651} style={{ height: 30 }} />
                    </FlexboxItemBar>
                    <FlexboxItemIcon>
                        <BaconandEggsIcon style={{ width: 30, height: 30 }} />
                    </FlexboxItemIcon>
                </FlexboxContainer>

                <FlexboxContainer>
                    <FlexboxItemBar>
                        <LinearProgress mode="determinate" value={75} max={651} style={{ height: 30 }} />
                    </FlexboxItemBar>
                    <FlexboxItemIcon>
                        <CoffeeIcon style={{ width: 30, height: 30 }} />
                    </FlexboxItemIcon>
                </FlexboxContainer>

                <FlexboxContainer>
                    <FlexboxItemBar>
                        <LinearProgress mode="determinate" value={45} max={651} style={{ height: 30 }} />
                    </FlexboxItemBar>
                    <FlexboxItemIcon>
                        <VegoIcon style={{ width: 30, height: 30 }} />
                    </FlexboxItemIcon>
                </FlexboxContainer>
            </SausagelyticsContainer>
        )
    }
}

export default Sausagelytics
