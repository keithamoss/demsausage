import { RadioButton, RadioButtonGroup } from "material-ui/RadioButton"
import RaisedButton from "material-ui/RaisedButton"
import { blueGrey50 } from "material-ui/styles/colors"
import { ActionCheckCircle, ActionOpenInNew } from "material-ui/svg-icons"
import * as React from "react"
import { Link } from "react-router"
import { default as VirtualList } from "react-tiny-virtual-list"
import styled from "styled-components"
import ElectionChooser from "../../elections/ElectionChooser/ElectionChooserContainer"
import { IPollingPlace, IPollingPlaceFacilityType } from "../../redux/modules/polling_places"
// import "./PollingPlaceTypesEditor.css"
import EmptyState from "../../shared/empty_state/EmptyState"

const GridWrapper = styled.div`
    width: 100%;
    display: grid;
    grid-gap: 2%;
    grid-template-columns: repeat(1, 100%);
`

const GridBox = styled.div`
    width: 100%;
    display: grid;
    grid-gap: 1%;
    grid-template-columns: 25% 60% 15%;
    border-bottom: 1px solid ${blueGrey50};
`

export interface IProps {
    pollingPlaces: IPollingPlace[]
    pollingPlaceTypes: IPollingPlaceFacilityType[]
    onChangeType: any
    onElectionChanged: any
}

// Work around TypeScript not allowing us to pass <a> props to react-router's <Link>
class CustomLink extends React.Component<any, any> {
    render(): any {
        return <Link to="something" {...this.props} />
    }
}

class PollingPlaceTypesEditor extends React.PureComponent<IProps, {}> {
    onChangeType: Function

    constructor(props: IProps) {
        super(props)

        this.onChangeType = (pollingPlace: IPollingPlace, e: any, value: string) => {
            props.onChangeType(value, pollingPlace)
        }
    }

    render() {
        const { pollingPlaces, pollingPlaceTypes, onElectionChanged } = this.props

        const styles = {
            radio: { display: "inline-block", width: "33%" },
        }

        if (pollingPlaces.length === 0) {
            return (
                <EmptyState
                    message={
                        <div>
                            Good work, all of the polling
                            <br /> places have types!
                        </div>
                    }
                    icon={<ActionCheckCircle />}
                />
            )
        }

        return (
            <GridWrapper>
                <ElectionChooser onElectionChanged={onElectionChanged} />
                <br />
                <VirtualList
                    width="100%"
                    height={900}
                    itemCount={pollingPlaces.length}
                    itemSize={122.25}
                    renderItem={({ index, style }: any) => (
                        <div key={index} style={style}>
                            <GridBox>
                                <div>
                                    <h3>{pollingPlaces[index].name}</h3>
                                    <h4>{pollingPlaces[index].premises}</h4>
                                </div>
                                <div>
                                    <RadioButtonGroup
                                        name={`pollingPlaceTypes-${pollingPlaces[index].id}`}
                                        onChange={this.onChangeType.bind(this, pollingPlaces[index])}
                                    >
                                        {pollingPlaceTypes.map((type: IPollingPlaceFacilityType) => (
                                            <RadioButton key={type.name} value={type.name} label={type.name} style={styles.radio} />
                                        ))}
                                    </RadioButtonGroup>
                                </div>
                                <div>
                                    <RaisedButton
                                        label="Google It"
                                        primary={true}
                                        icon={<ActionOpenInNew />}
                                        containerElement={
                                            <CustomLink
                                                to={`https://www.google.com.au/search?q=${pollingPlaces[index].premises}`}
                                                target="_blank"
                                            />
                                        }
                                    />
                                </div>
                            </GridBox>
                        </div>
                    )}
                />
            </GridWrapper>
        )
    }
}

export default PollingPlaceTypesEditor
