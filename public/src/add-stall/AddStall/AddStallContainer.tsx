import * as React from "react"
import { connect } from "react-redux"

import AddStall from "./AddStall"
import { IStore } from "../../redux/modules/interfaces"

export interface IProps {}

export interface IDispatchProps {}

export interface IStoreProps {}

export interface IStateProps {
    formSubmitted: boolean
}

interface IRouteProps {
    electionIdentifier: string
}

interface IOwnProps {
    params: IRouteProps
}

export class AddStallFormContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    initialValues: object

    constructor(props: any) {
        super(props)
        this.state = { formSubmitted: false }

        this.onStallAdded = this.onStallAdded.bind(this)
    }

    onStallAdded() {
        this.setState({ formSubmitted: true })
    }

    render() {
        const { formSubmitted } = this.state

        return (
            <AddStall
                showWelcome={!formSubmitted}
                showThankYou={formSubmitted}
                showForm={!formSubmitted}
                onStallAdded={this.onStallAdded}
            />
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

const AddStallFormContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(AddStallFormContainer)

export default AddStallFormContainerWrapped
