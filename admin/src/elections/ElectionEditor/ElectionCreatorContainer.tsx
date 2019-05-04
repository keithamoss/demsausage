import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { isDirty, submit } from "redux-form"
import { createElection, IElection } from "../../redux/modules/elections"
import { IStore } from "../../redux/modules/reducer"
import ElectionEditor from "./ElectionEditor"
import { IElectionFormValues } from "./ElectionEditorContainer"

interface IProps {
    onElectionCreated: Function
}

interface IDispatchProps {
    onFormSubmit: Function
    onSaveForm: Function
}

interface IStoreProps {
    isDirty: boolean
}

interface IStateProps {}

const fromFormValues = (formValues: any): IElectionFormValues => {
    return {
        geom: formValues.geom,
        name: formValues.name,
        short_name: formValues.short_name,
        is_hidden: formValues.is_hidden,
        election_day: formValues.election_day,
    }
}

class ElectionCreatorContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
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

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
    return {
        isDirty: isDirty("election")(state),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        async onFormSubmit(values: object, onElectionCreated: Function) {
            const electionNew: Partial<IElection> = fromFormValues(values)
            const json = await dispatch(createElection(electionNew))
            if (json) {
                browserHistory.push("/elections/")
            }
        },
        onSaveForm: (isDirty: boolean) => {
            dispatch(submit("election"))
        },
    }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
    mapStateToProps,
    mapDispatchToProps
)(ElectionCreatorContainer)
