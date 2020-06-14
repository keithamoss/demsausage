import { CssBaseline } from '@material-ui/core'
import React, { Fragment } from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import Home from './pages/Home'

const App: React.FC = () => {
  return (
    <HashRouter>
      <Switch>
        <Fragment>
          <CssBaseline />
          <div className="container">
            <Route path="/" component={Home} exact />
          </div>
        </Fragment>
      </Switch>
    </HashRouter>
  )
}
export default App
