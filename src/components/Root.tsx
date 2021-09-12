import * as React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import GraphQLBinApp from './GraphQLBinApp'

export default class Root extends React.Component<{}, {}> {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/" component={GraphQLBinApp} />
          <Redirect
            exact={true}
            from="/*"
            to="/"
            component={GraphQLBinApp}
          />
        </Switch>
      </BrowserRouter>
    )
  }
}
