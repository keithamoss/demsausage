import { cloneDeep } from 'lodash-es'
import { DateTime } from 'luxon'
import * as React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { isDirty, submit } from 'redux-form'
import { IElection, updateElection } from '../../redux/modules/elections'
import { IGeoJSON } from '../../redux/modules/interfaces'
import { IStore } from '../../redux/modules/reducer'
import ElectionEditor from './ElectionEditor'

interface IRouteProps {
  electionIdentifier: string
}

interface IOwnProps {
  params: IRouteProps
}

interface IProps extends IOwnProps {
  // election: IElection
  onElectionEdited: Function
}

interface IDispatchProps {
  onFormSubmit: Function
  onSaveForm: Function
}

interface IStoreProps {
  election: IElection
  isDirty: boolean
}

interface IStateProps {}

export interface IElectionFormValues {
  geom: IGeoJSON
  name: string
  short_name: string
  is_hidden: boolean
  election_day: string // Datetime
}

const toFormValues = (election: IElection) => {
  return {
    geom: election.geom,
    name: election.name,
    short_name: election.short_name,
    is_hidden: election.is_hidden,
    election_day: new Date(election.election_day),
  }
}

const fromFormValues = (formValues: any): IElectionFormValues => {
  const electionDayInLocal = DateTime.fromJSDate(formValues.election_day)
  const electionDayInUTC = DateTime.utc(
    electionDayInLocal.get('year'),
    electionDayInLocal.get('month'),
    electionDayInLocal.get('day')
  )

  return {
    geom: formValues.geom,
    name: formValues.name,
    short_name: formValues.short_name,
    is_hidden: formValues.is_hidden,
    election_day: electionDayInUTC.toISO() as string,
  }
}

type TComponentProps = IProps & IStoreProps & IDispatchProps & IOwnProps
class ElectionEditorContainer extends React.Component<TComponentProps, IStateProps> {
  initialValues: any

  UNSAFE_componentWillMount() {
    const { election } = this.props

    // Each layer mounts this component anew, so store their initial layer form values.
    // e.g. For use in resetting the form state (Undo/Discard Changes)
    this.initialValues = cloneDeep(toFormValues(election))
  }

  render() {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { election, onElectionEdited, isDirty, onFormSubmit, onSaveForm } = this.props

    return (
      <ElectionEditor
        election={election}
        initialValues={this.initialValues}
        isDirty={isDirty}
        onSubmit={(values: object, _dispatch: Function, _props: IProps) => {
          onFormSubmit(values, election, onElectionEdited)
        }}
        onSaveForm={() => {
          onSaveForm(election, isDirty)
        }}
        onCancelForm={() => {
          browserHistory.push('/elections/')
        }}
      />
    )
  }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
  const { elections } = state

  return {
    election: elections.elections.find(
      (election: IElection) => election.id === parseInt(ownProps.params.electionIdentifier, 10)
    )!,
    isDirty: isDirty('election')(state),
  }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
  return {
    async onFormSubmit(values: object, election: IElection, _onElectionEdited: Function) {
      const electionNew: Partial<IElection> = fromFormValues(values)
      const json = await dispatch(updateElection(election, electionNew))
      if (json) {
        // onElectionEdited()
        browserHistory.push('/elections/')
      }
    },
    onSaveForm: (_election: IElection, _isDirty: boolean) => {
      dispatch(submit('election'))
    },
  }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(ElectionEditorContainer)
