import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
// import { formValueSelector, getFormValues, isDirty, initialize, submit, change } from "redux-form"
import { isDirty, submit } from "redux-form"
import { createElection, IElection } from "../../redux/modules/elections"
import { IStore } from "../../redux/modules/reducer"
import ElectionEditor from "./ElectionEditor"
import { IElectionFormValues } from "./ElectionEditorContainer"

export interface IProps {
    onElectionCreated: Function
}

export interface IDispatchProps {
    onFormSubmit: Function
    onSaveForm: Function
}

export interface IStoreProps {
    isDirty: boolean
}

export interface IStateProps {}

interface IOwnProps {}

const fromFormValues = (formValues: any): IElectionFormValues => {
    return {
        name: formValues.name,
        short_name: formValues.short_name,
        default_zoom_level: formValues.default_zoom_level,
        is_hidden: formValues.is_hidden,
        election_day: formValues.election_day,
        geom: {
            type: "Point",
            coordinates: [parseFloat(formValues.lon), parseFloat(formValues.lat)],
        },
    }
}

export class ElectionCreatorContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    render() {
        const { onElectionCreated, isDirty, onFormSubmit, onSaveForm } = this.props

        return (
            <ElectionEditor
                election={null}
                initialValues={{}}
                isDirty={isDirty}
                onSubmit={(values: object, dispatch: Function, props: IProps) => {
                    onFormSubmit(values, onElectionCreated)
                }}
                onSaveForm={() => {
                    onSaveForm(isDirty)
                }}
                onCancelForm={() => {
                    browserHistory.push("/elections/")
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    return {
        isDirty: isDirty("election")(state),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        async onFormSubmit(values: object, onElectionCreated: Function) {
            const electionNew: Partial<IElection> = fromFormValues(values)
            await dispatch(createElection(electionNew))
            browserHistory.push("/elections/")
        },
        onSaveForm: (isDirty: boolean) => {
            dispatch(submit("election"))
        },
    }
}

const ElectionCreatorContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(ElectionCreatorContainer)

export default ElectionCreatorContainerWrapped
