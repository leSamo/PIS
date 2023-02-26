import React, { useState } from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Wrapper from './Wrapper';
import IndexPage from './IndexPage';
import LaddersPage from './LaddersPage';

const App = () => {
  const [userInfo, setUserInfo] = useState({});

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Wrapper navIndex={0} userInfo={userInfo} setUserInfo={setUserInfo}>
            <IndexPage />
          </Wrapper>
        </Route>
        <Route exact path="/ladders">
          <Wrapper navIndex={1} userInfo={userInfo} setUserInfo={setUserInfo}>
            <LaddersPage />
          </Wrapper>
        </Route>
      </Switch>
    </Router>
  )
}

export default App;
