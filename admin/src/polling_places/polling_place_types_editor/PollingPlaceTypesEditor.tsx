import { RadioButton, RadioButtonGroup } from "material-ui/RadioButton"
import RaisedButton from "material-ui/RaisedButton"
import { blueGrey50 } from "material-ui/styles/colors"
import { ActionCheckCircle, ActionOpenInNew } from "material-ui/svg-icons"
import * as React from "react"
import { Link } from "react-router"
import { default as VirtualList } from "react-tiny-virtual-list"
import styled from "styled-components"
import ElectionChooser from "../../elections/ElectionChooser/ElectionChooserContainer"
import { IPollingPlace } from "../../redux/modules/polling_places"
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
    pollingPlaces: Array<IPollingPlace>
    pollingPlaceTypes: Array<string>
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

    constructor(props: any) {
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

        const pollingPlacesSansType = pollingPlaces.filter((pollingPlace: IPollingPlace) => pollingPlace.polling_place_type === null)

        if (pollingPlaces.length === 0) {
            return null
        }

        if (pollingPlacesSansType.length === 0) {
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
                    itemCount={pollingPlacesSansType.length}
                    itemSize={122.25}
                    renderItem={({ index, style }: any) => (
                        <div key={index} style={style}>
                            <GridBox>
                                <div>
                                    <h3>{pollingPlacesSansType[index].polling_place_name}</h3>
                                    <h4>{pollingPlacesSansType[index].premises}</h4>
                                </div>
                                <div>
                                    <RadioButtonGroup
                                        name={`pollingPlaceTypes-${pollingPlacesSansType[index].id}`}
                                        onChange={this.onChangeType.bind(this, pollingPlacesSansType[index])}
                                    >
                                        {pollingPlaceTypes.map((type: string) => (
                                            <RadioButton key={type} value={type} label={type} style={styles.radio} />
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
                                                to={`https://www.google.com.au/search?q=${pollingPlacesSansType[index].premises}`}
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
