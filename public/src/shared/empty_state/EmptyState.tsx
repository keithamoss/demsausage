import * as React from "react"
import styled from "styled-components"

import { GridTile } from "material-ui/GridList"

const EmptyStateContainer = styled.div`
    max-width: 250px;
    max-height: 250px;
    opacity: 0.4;
    margin: auto;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
`

const BigIcon = styled.div`
    & > * {
        width: 125px !important;
        height: 125px !important;
        margin: auto;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
    }
`

export interface IProps {
    message: any
    icon: any
}

export class EmptyState extends React.PureComponent<IProps, {}> {
    render() {
        const { message, icon } = this.props

        return (
            <EmptyStateContainer>
                <GridTile title={message} titleBackground={"rgb(255, 255, 255)"} titleStyle={{ color: "black", textAlign: "center" }}>
                    <BigIcon>{icon}</BigIcon>
                </GridTile>
            </EmptyStateContainer>
        )
    }
}

export default EmptyState
