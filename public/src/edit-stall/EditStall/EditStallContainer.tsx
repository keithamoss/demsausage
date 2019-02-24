import * as React from "react"
import { connect } from "react-redux"
import { IStore } from "../../redux/modules/reducer"
import { fetchStallWithCredentials, IStall } from "../../redux/modules/stalls"
import { IDjangoAPIError } from "../../shared/ui/DjangoAPIErrorUI/DjangoAPIErrorUI"
import EditStall from "./EditStall"

export interface IProps {
    onStallAdded: Function
}

export interface IDispatchProps {
    fetchStall: Function
}

export interface IStoreProps {}

export interface IStateProps {
    stall: IStall | undefined | null
    errors: IDjangoAPIError | undefined
    formSubmitted: boolean
}

interface IOwnProps {}

export interface IRouteProps {
    location: {
        query: {
            stall_id: string
            token: string
            signature: string
        }
    }
}

export interface IStallEditCredentials {
    token: string
    signature: string
}

type TComponentProps = IProps & IStoreProps & IDispatchProps & IRouteProps
class EditStallFormContainer extends React.Component<TComponentProps, IStateProps> {
    constructor(props: any) {
        super(props)
        this.state = {
            stall: undefined,
            errors: undefined,
            formSubmitted: false,
        }

        this.onStallUpdated = this.onStallUpdated.bind(this)
    }

    onStallUpdated() {
        this.setState({ ...this.state, formSubmitted: true })
    }

    getCredentials() {
        const { token, signature } = this.props.location.query
        return { token, signature }
    }

    async componentDidMount() {
        document.title = "Democracy Sausage | Update your sausage sizzle or cake stall"

        const { fetchStall, location } = this.props
        const { response, json } = await fetchStall(location.query.stall_id, location.query.token, location.query.signature)

        if (response.status === 200) {
            this.setState({ ...this.state, stall: json })
        } else if (response.status >= 400) {
            this.setState({ ...this.state, stall: null, errors: json })
        }
    }

    render() {
        const { stall, formSubmitted, errors } = this.state

        if (stall === undefined) {
            return null
        }

        return (
            <EditStall
                showAPIErrors={errors !== undefined}
                showWelcome={!formSubmitted && errors === undefined}
                showThankYou={formSubmitted && errors === undefined}
                showForm={!formSubmitted && errors === undefined}
                stall={stall}
                errors={errors}
                credentials={this.getCredentials()}
                onStallUpdated={this.onStallUpdated}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        fetchStall: (stallId: string, token: string, signature: string) => {
            return dispatch(fetchStallWithCredentials(stallId, token, signature))
        },
    }
}

const EditStallFormContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(EditStallFormContainer) as any

export default EditStallFormContainerWrapped
