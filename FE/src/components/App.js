import React, { useState } from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Wrapper from './Wrapper';
import IndexPage from './IndexPage';
import UserManagementPage from './UserManagementPage';
import './index.css';

const App = () => {
  const [userInfo, setUserInfo] = useState({ loaded: false });

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Wrapper navIndex={0} userInfo={userInfo} setUserInfo={setUserInfo}>
            <IndexPage />
          </Wrapper>
        </Route>
        <Route exact path="/userManagement">
          <Wrapper navIndex={1} userInfo={userInfo} setUserInfo={setUserInfo}>
            <UserManagementPage />
          </Wrapper>
        </Route>
      </Switch>
    </Router>
  )
}

export default App;
