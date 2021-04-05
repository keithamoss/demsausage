import * as React from 'react'
import { connect } from 'react-redux'
import { getFormSyncErrors, hasSubmitFailed, isSubmitting, submit } from 'redux-form'
import { getLiveElections, IElection } from '../../redux/modules/elections'
import { INoms } from '../../redux/modules/polling_places'
import { IStore } from '../../redux/modules/reducer'
import { createStall, IStallLocationInfo } from '../../redux/modules/stalls'
import { IDjangoAPIError } from '../../shared/ui/DjangoAPIErrorUI/DjangoAPIErrorUI'
import AddStallForm from './AddStallForm'

interface IProps {
  onStallAdded: Function
}

interface IDispatchProps {
  onFormSubmit: Function
  onSaveForm: Function
}

interface IStoreProps {
  liveElections: Array<IElection>
  formIsSubmitting: boolean
  formSyncErrors: any
  formHasSubmitFailed: boolean
}

interface IStateProps {
  stepIndex: number
  chosenElection: IElection | null
  stallLocationInfo: IStallLocationInfo | null /* Actually IStallLocationInfo or IPollingPlace (depending on election.polling_places_loaded) */
  locationConfirmed: boolean
  errors: IDjangoAPIError | undefined
}

export interface IStallFormInfo {
  name: string
  description: string
  opening_hours: string
  website: string
  email: string
  noms: Partial<INoms>
  location_info?: IStallLocationInfo
  election: number
  polling_place: number
}

export const fromStallFormValues = (formValues: any): Partial<IStallFormInfo> => {
  const getNoms = () => {
    const noms: Partial<INoms> = {}
    const fields = ['bbq', 'cake', 'vego', 'halal', 'coffee', 'bacon_and_eggs', 'free_text']
    fields.forEach((fieldName: string) => {
      if (fieldName !== 'free_text') {
        if (formValues[fieldName] === true) {
          noms[fieldName] = true
        }
      } else if (formValues[fieldName] !== undefined) {
        noms[fieldName] = formValues[fieldName]
      }
    })
    return noms
  }

  return {
    name: formValues.name,
    description: formValues.description,
    opening_hours: formValues.opening_hours,
    website: formValues.website,
    email: formValues.email,
    noms: getNoms(),
  }
}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class AddStallFormContainer extends React.Component<TComponentProps, IStateProps> {
  initialValues: object

  constructor(props: TComponentProps) {
    super(props)
    this.state = {
      stepIndex: props.liveElections.length === 1 ? 1 : 0,
      chosenElection: props.liveElections.length === 1 ? props.liveElections[0] : null,
      stallLocationInfo: null,
      locationConfirmed: false,
      errors: undefined,
    }

    this.onChooseElection = this.onChooseElection.bind(this)
    this.onConfirmChosenLocation = this.onConfirmChosenLocation.bind(this)

    this.initialValues = {}
  }

  onChooseElection(event: any, electionId: number) {
    const election = this.props.liveElections.find((e: IElection) => String(e.id) === String(electionId))!
    this.setState({
      ...this.state,
      stepIndex: 1,
      chosenElection: election,
      stallLocationInfo: null,
      locationConfirmed: false,
    })
  }

  onConfirmChosenLocation(stallLocationInfo: IStallLocationInfo) {
    this.setState({ ...this.state, stepIndex: 2, stallLocationInfo, locationConfirmed: true })
  }

  componentWillMount() {
    // const { pollingPlace } = this.props

    // Each layer mounts this component anew, so store their initial layer form values.
    // e.g. For use in resetting the form state (Undo/Discard Changes)
    // this.initialValues = cloneDeep(toFormValues(pollingPlace))
    this.initialValues = {}
  }

  render() {
    const {
      liveElections,
      formIsSubmitting,
      formSyncErrors,
      formHasSubmitFailed,
      onFormSubmit,
      onSaveForm,
      onStallAdded,
    } = this.props
    const { stepIndex, chosenElection, stallLocationInfo, locationConfirmed, errors } = this.state

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
        formIsSubmitting={formIsSubmitting}
        formSyncErrors={formSyncErrors}
        formHasSubmitFailed={formHasSubmitFailed}
        errors={errors}
        onSubmit={async (values: object, dispatch: Function, props: IProps) => {
          await onFormSubmit(onStallAdded, values, chosenElection, stallLocationInfo, this)
        }}
        onSaveForm={() => {
          onSaveForm()
        }}
      />
    )
  }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
  return {
    liveElections: getLiveElections(state),
    formIsSubmitting: isSubmitting('addStall')(state),
    formSyncErrors: getFormSyncErrors('addStall')(state),
    formHasSubmitFailed: hasSubmitFailed('addStall')(state),
  }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
  return {
    async onFormSubmit(
      onStallAdded: Function,
      values: object,
      election: IElection,
      stallLocationInfo: IStallLocationInfo,
      that: AddStallFormContainer
    ) {
      if (stallLocationInfo === null) {
        return
      }

      const stall: Partial<IStallFormInfo> = fromStallFormValues(values)
      stall.election = election.id

      if (election.polling_places_loaded === false) {
        stall.location_info = stallLocationInfo
      } else {
        stall.polling_place = stallLocationInfo.id
      }

      const { response, json } = await dispatch(createStall(stall as IStallFormInfo))
      if (response.status === 201) {
        onStallAdded()
      } else if (response.status === 400) {
        that.setState({ ...that.state, errors: json })
      }
    },
    onSaveForm: () => {
      dispatch(submit('addStall'))
    },
  }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(AddStallFormContainer)
