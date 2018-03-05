import * as React from "react"
import { IElection } from "../../redux/modules/interfaces"
// import "./ElectionChooser.css"

import SelectField from "material-ui/SelectField"
import MenuItem from "material-ui/MenuItem"

export interface IProps {
    elections: Array<IElection>
    currentElectionId: number
    onChangeElection: any
}

class ElectionChooser extends React.PureComponent<IProps, {}> {
    render() {
        const { elections, currentElectionId, onChangeElection } = this.props

        return (
            <SelectField floatingLabelText="Election" style={{ width: "auto" }} value={currentElectionId} onChange={onChangeElection}>
                {elections.map((election: IElection) => <MenuItem key={election.id} value={election.id} primaryText={election.name} />)}
            </SelectField>
        )
    }
}

export default ElectionChooser
