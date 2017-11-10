import * as React from "react"
import { connect } from "react-redux"
import { fetchStuff } from "./redux/modules/app"
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import { LoginDialog } from "./authentication/login-dialog/LoginDialog"
import "./App.css"

const logo = require("./logo.svg")

interface IDispatchProps {
    fetchStuff: Function
}

class App extends React.Component<IDispatchProps, {}> {
    componentDidMount() {
        const { fetchStuff } = this.props
        fetchStuff()
    }

    render() {
        return (
            <MuiThemeProvider>
                <div className="App">
                    <div className="App-header">
                        <img src={logo} className="App-logo" alt="logo" />
                        <h2>Welcome to React</h2>
                        <LoginDialog open={true} />
                    </div>
                    <p className="App-intro">
                        To get started, edit <code>src/App.tsx</code> and save to reload.
                    </p>
                </div>
            </MuiThemeProvider>
        )
    }
}

const mapStateToProps = (state: any) => {
    // const { app, map, ealgis, snackbars } = state

    return {}
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        fetchStuff: () => {
            dispatch(fetchStuff())
        },
    }
}

const AppWrapped = connect(mapStateToProps, mapDispatchToProps)(App as any)

export default AppWrapped
