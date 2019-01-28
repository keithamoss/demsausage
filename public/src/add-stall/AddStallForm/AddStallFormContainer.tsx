import * as React from "react"
import { connect } from "react-redux"
// import { formValueSelector, getFormValues, isDirty, initialize, submit, change } from "redux-form"
import { isDirty, submit } from "redux-form"
import { getLiveElections, IElection } from "../../redux/modules/elections"
import { INoms } from "../../redux/modules/polling_places"
import { IStore } from "../../redux/modules/reducer"
import { createStall, IStallLocationInfo } from "../../redux/modules/stalls"
// import { cloneDeep } from "lodash-es"
import AddStallForm from "./AddStallForm"

export interface IProps {
    onStallAdded: Function
}

export interface IDispatchProps {
    onFormSubmit: Function
    onSaveForm: Function
}

export interface IStoreProps {
    liveElections: Array<IElection>
    isDirty: boolean
}

export interface IStateProps {
    stepIndex: number
    chosenElection: IElection | null
    stallLocationInfo: IStallLocationInfo | null /* Actually IStallLocationInfo or IPollingPlace (depending on election.polling_places_loaded) */
    locationConfirmed: boolean
    formSubmitting: boolean
}

interface IOwnProps {}

export interface IStallFormInfo {
    name: string
    description: string
    website: string
    email: string
    noms: Partial<INoms>
    location_info?: IStallLocationInfo
    election: number
    polling_place: number
}

const fromFormValues = (formValues: any): Partial<IStallFormInfo> => {
    const getNoms = () => {
        const noms: Partial<INoms> = {}
        const fields = ["bbq", "cake", "vego", "halal", "coffee", "bacon_and_eggs", "free_text"]
        fields.forEach((fieldName: string) => {
            if (fieldName !== "free_text") {
                if (formValues[fieldName] === true) {
                    noms[fieldName] = true
                }
            } else {
                if (formValues[fieldName] !== undefined) {
                    noms[fieldName] = formValues[fieldName]
                }
            }
        })
        return noms
    }

    return {
        name: formValues.name,
        description: formValues.description,
        website: formValues.website,
        email: formValues.email,
        noms: getNoms(),
    }
}

export class AddStallFormContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    initialValues: object
    constructor(props: any) {
        super(props)
        this.state = {
            stepIndex: 0,
            chosenElection: props.liveElections.length === 1 ? props.liveElections[0] : null,
            stallLocationInfo: null,
            locationConfirmed: false,
            formSubmitting: false,
        }

        this.onChooseElection = this.onChooseElection.bind(this)
        this.onConfirmChosenLocation = this.onConfirmChosenLocation.bind(this)

        this.initialValues = {}
    }

    onChooseElection(event: any, election: IElection) {
        this.setState(
            Object.assign(this.state, {
                stepIndex: 1,
                chosenElection: election,
                stallLocationInfo: null,
                locationConfirmed: false,
            })
        )
    }

    onConfirmChosenLocation(stallLocationInfo: IStallLocationInfo) {
        this.setState(
            Object.assign(this.state, {
                stepIndex: 2,
                stallLocationInfo: stallLocationInfo,
                locationConfirmed: true,
            })
        )
    }

    toggleFormSubmitting() {
        this.setState(
            Object.assign(this.state, {
                formSubmitting: !this.state.formSubmitting,
            })
        )
    }

    componentWillMount() {
        // const { pollingPlace } = this.props

        // Each layer mounts this component anew, so store their initial layer form values.
        // e.g. For use in resetting the form state (Undo/Discard Changes)
        // this.initialValues = cloneDeep(toFormValues(pollingPlace))
        this.initialValues = {}
    }

    render() {
        const { liveElections, isDirty, onFormSubmit, onSaveForm, onStallAdded } = this.props
        const { stepIndex, chosenElection, stallLocationInfo, locationConfirmed, formSubmitting } = this.state

        return (
            <AddStallForm
                liveElections={liveElections}
                stepIndex={stepIndex}
                onChooseElection={this.onChooseElection}
                chosenElection={chosenElection}
                onConfirmChosenLocation={this.onConfirmChosenLocation}
                stallLocationInfo={stallLocationInfo}
                locationConfirmed={locationConfirmed}
                initialValues={this.initialValues}
                formSubmitting={formSubmitting}
                isDirty={isDirty}
                onSubmit={async (values: object, dispatch: Function, props: IProps) => {
                    this.toggleFormSubmitting()
                    await onFormSubmit(onStallAdded, values, chosenElection, stallLocationInfo)
                }}
                onSaveForm={() => {
                    onSaveForm(isDirty)
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    return {
        liveElections: getLiveElections(state),
        isDirty: isDirty("addStall")(state),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        async onFormSubmit(onStallAdded: Function, values: object, election: IElection, stallLocationInfo: IStallLocationInfo) {
            const stall: Partial<IStallFormInfo> = fromFormValues(values)
            stall.election = election.id

            if (election.polling_places_loaded === false) {
                stall.location_info = stallLocationInfo
            } else {
                stall.polling_place = stallLocationInfo.id
            }

            const json = await dispatch(createStall(stall as IStallFormInfo))
            if (json) {
                onStallAdded()
            }
        },
        onSaveForm: (isDirty: boolean) => {
            dispatch(submit("addStall"))
        },
    }
}

const AddStallFormContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(AddStallFormContainer) as any

export default AddStallFormContainerWrapped
