import copy from 'copy-to-clipboard'
import { cloneDeep } from 'lodash-es'
import * as React from 'react'
import { connect } from 'react-redux'
import { isDirty, submit } from 'redux-form'
import { IElection } from '../../redux/modules/elections'
import {
  buildNomsObject,
  getPollingPlacePermalink,
  IPollingPlace,
  IPollingPlaceFacilityType,
  pollingPlaceHasReports,
  updatePollingPlace,
} from '../../redux/modules/polling_places'
import { IStore } from '../../redux/modules/reducer'
import { sendNotification } from '../../redux/modules/snackbars'
import { IStall } from '../../redux/modules/stalls'
import { deepValue } from '../../utils'
import PollingPlaceForm from './PollingPlaceForm'

interface IProps {
  election: IElection
  stall?: IStall
  pollingPlace: IPollingPlace
  onPollingPlaceEdited: Function
}

interface IDispatchProps {
  onFormSubmit: Function
  onSaveForm: Function
  onClickCopyLink: Function
}

interface IStoreProps {
  isDirty: boolean
  pollingPlaceTypes: IPollingPlaceFacilityType[]
}

interface IStateProps {}

const toFormValues = (pollingPlace: IPollingPlace): any => {
  return {
    ...buildNomsObject(pollingPlace.stall !== null ? pollingPlace.stall.noms : null),
    name: deepValue(pollingPlace, 'stall.name'),
    description: deepValue(pollingPlace, 'stall.description'),
    opening_hours: deepValue(pollingPlace, 'stall.opening_hours'),
    favourited: deepValue(pollingPlace, 'stall.favourited', false),
    website: deepValue(pollingPlace, 'stall.website'),
    extra_info: deepValue(pollingPlace, 'stall.extra_info'),
    source: deepValue(pollingPlace, 'stall.source'),
    facility_type: deepValue(pollingPlace, 'facility_type'),
  }
}

const fromFormValues = (formValues: any) => {
  return {
    stall: {
      noms: buildNomsObject(formValues),
      name: formValues.name || '',
      description: formValues.description || '',
      opening_hours: formValues.opening_hours || '',
      favourited: formValues.favourited,
      website: formValues.website || '',
      extra_info: formValues.extra_info || '',
      source: formValues.source || '',
    },
    facility_type: formValues.facility_type,
  }
}

class PollingPlaceFormContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
  initialValues: any

  canStallPropsBeMerged() {
    const { pollingPlace, stall } = this.props
    return stall !== undefined && pollingPlaceHasReports(pollingPlace) === false
  }

  getInitialValues(pollingPlace: IPollingPlace, stall?: IStall) {
    // Each layer mounts this component anew, so store their initial layer form values.
    // e.g. For use in resetting the form state (Undo/Discard Changes)
    const initialValues = cloneDeep(toFormValues(pollingPlace))

    // If there's no reports for this polling place yet then we can
    // safely merge in the stall's props
    if (stall !== undefined && this.canStallPropsBeMerged()) {
      initialValues.bbq = stall.noms.bbq
      initialValues.cake = stall.noms.cake
      initialValues.coffee = stall.noms.coffee
      initialValues.halal = stall.noms.halal
      initialValues.vego = stall.noms.vego
      initialValues.bacon_and_eggs = stall.noms.bacon_and_eggs
      initialValues.free_text = stall.noms.free_text
      initialValues.name = stall.name
      initialValues.description = stall.description
      initialValues.opening_hours = stall.opening_hours
      initialValues.website = stall.website
      initialValues.source = 'Direct'
      initialValues.extra_info = ''
      initialValues.favourited = false
    }

    return initialValues
  }

  componentWillReceiveProps(nextProps: IProps & IStoreProps & IDispatchProps) {
    if (this.props.pollingPlace.id !== nextProps.pollingPlace.id || this.props.election.id !== nextProps.election.id) {
      this.initialValues = this.getInitialValues(nextProps.pollingPlace, nextProps.stall)
    }
  }

  componentWillMount() {
    this.initialValues = this.getInitialValues(this.props.pollingPlace, this.props.stall)
  }

  render() {
    const {
      election,
      pollingPlace,
      onPollingPlaceEdited,
      isDirty,
      pollingPlaceTypes,
      onFormSubmit,
      onSaveForm,
      onClickCopyLink,
    } = this.props

    return (
      <PollingPlaceForm
        election={election}
        pollingPlace={pollingPlace}
        initialValues={this.initialValues}
        isDirty={isDirty}
        stallWasMerged={this.canStallPropsBeMerged()}
        pollingPlaceTypes={pollingPlaceTypes}
        onSubmit={(values: object, dispatch: Function, props: IProps) => {
          onFormSubmit(values, election, pollingPlace, onPollingPlaceEdited)
        }}
        onSaveForm={() => {
          onSaveForm(pollingPlace, isDirty)
        }}
        onClickCopyLink={onClickCopyLink}
      />
    )
  }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
  const { polling_places } = state

  return {
    isDirty: isDirty('pollingPlace')(state),
    pollingPlaceTypes: polling_places.types,
  }
}

const mapDispatchToProps = (dispatch: Function, ownProps: IProps): IDispatchProps => {
  return {
    async onFormSubmit(
      values: object,
      election: IElection,
      pollingPlace: IPollingPlace,
      onPollingPlaceEdited: Function
    ) {
      const pollingPlaceNew /* Partial<IPollingPlace> */ = fromFormValues(values)

      const json = await dispatch(updatePollingPlace(election, pollingPlace, pollingPlaceNew))
      if (json) {
        onPollingPlaceEdited()
      }
      // dispatch(initialize("layerForm", layerFormValues, false))
    },
    onSaveForm: (pollingPlace: IPollingPlace, isDirty: boolean) => {
      dispatch(submit('pollingPlace'))
    },
    onClickCopyLink() {
      copy(getPollingPlacePermalink(ownProps.election, ownProps.pollingPlace), {
        format: 'text/plain',
      })
      dispatch(sendNotification(`Polling place link copied to clipboard.`))
    },
  }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(PollingPlaceFormContainer)
