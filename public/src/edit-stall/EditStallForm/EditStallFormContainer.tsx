import { cloneDeep } from "lodash-es"
import * as React from "react"
import { connect } from "react-redux"
import { isValid, submit } from "redux-form"
import { fromStallFormValues, IStallFormInfo } from "../../add-stall/AddStallForm/AddStallFormContainer"
import { buildNomsObject } from "../../redux/modules/polling_places"
import { IStore } from "../../redux/modules/reducer"
import { IStall, updateStallWithCredentials } from "../../redux/modules/stalls"
import { IDjangoAPIError } from "../../shared/ui/DjangoAPIErrorUI/DjangoAPIErrorUI"
import { IStallEditCredentials } from "../EditStall/EditStallContainer"
import EditStallForm from "./EditStallForm"

export interface IProps {
    stall: IStall
    credentials: IStallEditCredentials
    onStallUpdated: Function
}

export interface IDispatchProps {
    onFormSubmit: Function
    onSaveForm: Function
}

export interface IStoreProps {
    isValid: boolean
}

export interface IStateProps {
    formSubmitting: boolean
    errors: IDjangoAPIError | undefined
}

interface IOwnProps {}

const toFormValues = (stall: IStallFormInfo): any => {
    return {
        ...buildNomsObject(stall.noms as any),
        ...cloneDeep(stall),
    }
}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class EditStallFormContainer extends React.Component<TComponentProps, IStateProps> {
    initialValues: object | undefined
    constructor(props: any) {
        super(props)
        this.state = {
            formSubmitting: false,
            errors: undefined,
        }

        this.initialValues = cloneDeep(toFormValues(props.stall))
    }

    toggleFormSubmitting() {
        this.setState({ ...this.state, formSubmitting: !this.state.formSubmitting })
    }

    render() {
        const { isValid, onFormSubmit, onSaveForm } = this.props
        const { formSubmitting, errors } = this.state

        return (
            <EditStallForm
                initialValues={this.initialValues}
                formSubmitting={formSubmitting}
                errors={errors}
                isValid={isValid}
                onSubmit={async (values: object, dispatch: Function, props: IProps) => {
                    this.toggleFormSubmitting()
                    await onFormSubmit(values, this)
                }}
                onSaveForm={() => {
                    onSaveForm()
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    return {
        isValid: isValid("editStall")(state),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        async onFormSubmit(values: object, that: EditStallFormContainer) {
            const stallFormFields: Partial<IStallFormInfo> = fromStallFormValues(values)

            const { stall, credentials, onStallUpdated } = that.props

            const { response, json } = await dispatch(
                updateStallWithCredentials(stall.id, stallFormFields, credentials.token, credentials.signature)
            )
            if (response.status === 200) {
                onStallUpdated()
            } else if (response.status === 400) {
                that.setState({ ...that.state, errors: json }, () => that.toggleFormSubmitting())
            }
        },
        onSaveForm: () => {
            dispatch(submit("editStall"))
        },
    }
}

const EditStallFormContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(EditStallFormContainer) as any

export default EditStallFormContainerWrapped
