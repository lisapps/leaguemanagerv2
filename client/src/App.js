import React from "react";
import { Route, Switch } from "react-router-dom";
import Cookies from 'universal-cookie';
// import ls from "local-storage";
import "../sass/main.scss";
import "../node_modules/animate.css/animate.css";
import Signin from "./Signin";
import Forgot from "./Forgot";
// import Main from "./Main";
import Nav from "./components/Nav";
import Header from "./components/Header";
import CompleteProfile from "./CompleteProfile";
import Dashboard from "./Dashboard";
import Registration from "./Registration";
import CreateTeam from "./CreateTeam";
import ViewTeam from "./ViewTeam";
import { LeaguesProvider } from "./hooks/LeaguesContext";
import CreatePlayer from "./CreatePlayer";
import ViewPlayer from "./ViewPlayer";
import TeamPlayers from "./TeamPlayers";
import CreateLeague from "./CreateLeague";
import ViewLeague from "./ViewLeague";
import Teams from "./Teams";
import Admin from "./Admin";
import InviteManager from "./InviteManager";
import ViewManager from "./ViewManager";
import Schedule from "./Schedule";
import Results from "./Results";
import Comm from "./Comm";
import Finance from "./Finance";

const bes = "https://avp-backend.com/";
const cookies = new Cookies();

export const AuthContext = React.createContext();

var authcookie = cookies.get("lmtoken");


const initialLoginState = {
  isAuthenticated: authcookie ? true : false,
  lmtoken: undefined,
  complete: undefined,
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  pic: undefined,
};

const removeCookie = (cname) => {
  document.cookie = cname + "=; expires=0";
};

const loginReducer = (loginState, action) => {
  switch (action.type) {
    case "LOGIN":
      cookies.remove("lmtoken");
      let upic = bes + action.payload.profilePic;
      let status = action.payload.completeProfileStatus;
      let fname = action.payload.firstName;
      let lname = action.payload.lastName;
      let eid = action.payload.emailId;
      let userdata = [status, lname, fname, eid, upic];
      let ucv = JSON.stringify(userdata);

      cookies.set("lmtoken", action.payload.jwt, 1);
      cookies.set("user", ucv, 1);
      cookies.set("currentMid", action.payload.userId, 1);

      return {
        ...loginState,
        isAuthenticated: true,
        // user: action.payload.user,
        lmtoken: action.payload.jwt,
        complete: status,
        firstName: fname,
        lastName: lname,
        email: eid,
        pic: upic,
      };
    case "LOGOUT":
      cookies.remove("lmtoken");
      cookies.remove("currentMid");
      cookies.remove("currentLid");
      cookies.remove("user");
      //userid is in cookie currentMid, not state
      return {
        ...loginState,
        isAuthenticated: false,
        lmtoken: null,
        complete: null,
        firstName: null,
        lastName: null,
        email: null,
        pic: null,
      };
    default:
      return loginState;
  }
};

function App() {
  const [loginState, dispatch] = React.useReducer(
    loginReducer,
    initialLoginState
  );

  if (!loginState.isAuthenticated)
    return (
      <AuthContext.Provider
        value={{
          loginState,
          dispatch,
        }}
      >
        <div className="App">
          <div className="l-wrapper">
            <Switch>
              <Forgot path="/forgot" />
              <Signin path="/" />
            </Switch>
          </div>
        </div>
      </AuthContext.Provider>
    );
  if (loginState.isAuthenticated)
    return (
      <AuthContext.Provider
        value={{
          loginState,
          dispatch,
        }}
      >
        <div className="App">
          <div className="l-wrapper">
            {loginState.complete == "0" ? (
              <>
                <Nav />
                <div className="l-content__column">
                  <Header />
                  <Switch>
                    <Route path="/" component={CompleteProfile} />
                  </Switch>
                </div>
              </>
            ) : (
              <>
                <Nav />
                <div className="l-content__column">
                  <Header />
                  <LeaguesProvider>
                    <Switch>
                      <Route
                        path="/complete-profile"
                        component={CompleteProfile}
                      />
                      <Route path="/schedule" component={Schedule} />
                      <Route path="/results" component={Results} />
                      <Route path="/registration" component={Registration} />
                      <Route path="/teams/create-team" component={CreateTeam} />
                      <Route path="/teams/view-team" component={ViewTeam} />
                      <Route
                        path="/teams/create-player"
                        component={CreatePlayer}
                      />
                      <Route path="/teams/view-player" component={ViewPlayer} />
                      <Route
                        path="/teams/team-players"
                        component={TeamPlayers}
                      />
                      <Route path="/teams" component={Teams} />
                      <Route
                        path="/admin/create-league"
                        component={CreateLeague}
                      />
                      <Route path="/communication" component={Comm} />
                      <Route path="/finance" component={Finance} />
                      <Route path="/admin/view-league" component={ViewLeague} />
                      <Route
                        path="/admin/invite-manager"
                        component={InviteManager}
                      />
                      <Route
                        path="/admin/view-manager"
                        component={ViewManager}
                      />
                      <Route path="/admin" component={Admin} />

                      <Route path="/" component={Dashboard} exact />
                    </Switch>
                  </LeaguesProvider>
                </div>
              </>
            )}
          </div>
        </div>
      </AuthContext.Provider>
    );
}

export default App;
