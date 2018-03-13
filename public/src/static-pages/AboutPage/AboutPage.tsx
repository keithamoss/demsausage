import * as React from "react"
import { connect } from "react-redux"
import styled from "styled-components"

import { IStore } from "../../redux/modules/interfaces"

export interface IProps {}

export interface IDispatchProps {}

export interface IStoreProps {}

export interface IStateProps {}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

const PageWrapper = styled.div`
    padding-left: 15px;
    padding-right: 15px;
`

export class AboutPage extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    componentDidMount() {
        document.title = "Democracy Sausage | About us"
    }

    render() {
        return (
            <PageWrapper>
                <h1>About Us</h1>
                <h2>What?</h2>
                <p>A map of sausage and cake availability on election day.</p>
                <h2>Why?</h2>
                <p>It's practically part of the Australian Constitution. Or something.</p>
                <h2>How?</h2>
                <p>
                    We crowdsource (or is it crowdsauce?) data from Twitter and Facebook. To let us know about sausage and cake availability
                    (or the absence thereof), tweet using the hashtag{" "}
                    <a href="https://twitter.com/intent/tweet?hashtags=democracysausage">#democracysausage</a>. We'll be watching.
                </p>{" "}
                <p>
                    To make this work, we've also used:
                    <ul>
                        <li>
                            <a href="http://www.aec.gov.au/election/downloads.htm">AEC polling place data</a> (as well as from the various
                            state electoral commissions);
                        </li>
                        <li>
                            Images from <a href="http://openclipart.org">openclipart.org</a>; specifically:{" "}
                            <a href="http://openclipart.org/detail/7983/red-+-green-ok-not-ok-icons-by-tzeeniewheenie">
                                these tick and cross icons
                            </a>, <a href="http://openclipart.org/detail/6165/sausage-by-mcol">this sausage icon</a> and{" "}
                            <a href="http://openclipart.org/detail/181486/cake-by-vectorsme-181486">this cake icon</a> (with our
                            acknowledgements and appreciation to the artists).
                        </li>
                    </ul>
                </p>
                <h2>Who?</h2>
                <p>
                    We're just an ordinary group of democracy sausage enthusiasts. Find us on Twitter:{" "}
                    <a href="http://twitter.com/DemSausage">@DemSausage</a>. You can also email us at{" "}
                    <a href="mailto: ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a>.
                </p>
                <h2>Who else?</h2>
                <p>
                    We know of three other groups with similar (and possibly more organised) ambitions:
                    <ul>
                        <li>
                            <a href="http://www.electionsausagesizzle.com.au/">Snag Votes Election Sausage Sizzle Map</a>
                        </li>
                        <li>
                            <a href="http://boothrev.net/">Booth Reviews</a>
                        </li>
                        <li>
                            <a href="https://www.facebook.com/AussieDemocracyonFacebook/app_596824103674208">
                                Australian Democracy on Facebook - sausage sizzle ratings
                            </a>
                        </li>
                    </ul>
                </p>
            </PageWrapper>
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    // const { elections } = state

    return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const AboutPageWrapped = connect(mapStateToProps, mapDispatchToProps)(AboutPage)

export default AboutPageWrapped
