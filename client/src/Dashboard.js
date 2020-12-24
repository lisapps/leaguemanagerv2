import React, { useState, useEffect } from "react";
import axios from "axios";
import Hometiles from "./components/Hometiles";
import Accordion from "./components/Accordion";
import LeagueAcc from "./components/LeagueAcc";
import dotenv from "dotenv";
import { AuthContext } from "./App";
import Cookies from "universal-cookie";

dotenv.config();
var server = process.env.API_URL;

const Dashboard = () => {
  const { dispatch } = React.useContext(AuthContext);
  const cookies = new Cookies();

  var authcookie = cookies.get("lmtoken");

  if (authcookie == undefined)
    dispatch({
      type: "LOGOUT",
    });

  const initialstate = {
    leagues: [],
    isLoading: true,
    errorMessage: false,
  };

  const [data, setData] = useState(initialstate);
  const [activeEventKey, setActiveEventKey] = useState(0);

  useEffect(() => {
    axios(server + "/dashboard", {
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setData({
            leagues: res.data.leaguesList,
            isLoading: false,
            errorMessage: false,
          });
        } else {
          throw res;
        }
      })
      .catch((error) => {
        setData({
          isLoading: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "No data loaded. Try logging in again.") || error.statusText,
        });
      });
  }, []);

  if (data.isLoading) return "Loading...";
  if (data.errorMessage)
    return `Something went wrong in dashboard: ${data.errorMessage}`;

  if (data.leagues.length > 0)
    return (
      <>
        <section className="l-content">
          <p className={`e-section__title`}>{data.name}</p>
          <p className={`e-section__title`}>Quick Start</p>
          <Hometiles leagues={true} />
          <p className={`u-menu_active_text u-mt10`}>Leagues</p>
          <div
            className={`l-flexContainer l-flexContainer__column l-flexContainer--center animated fadeIn`}
          >
            <Accordion
              activeEventKey={activeEventKey}
              onToggle={setActiveEventKey}
            >
              {data.leagues.map((item) => (
                <LeagueAcc key={item[0].leagueId}>
                  <Accordion.Toggle
                    element={LeagueAcc.Header}
                    eventKey={item[0].leagueId}
                  >
                    {item[0]}
                    {activeEventKey !== item[0].leagueId && ``}
                    {activeEventKey === item[0].leagueId && `active`}
                  </Accordion.Toggle>
                  <Accordion.Collapse
                    eventKey={item[0].leagueId}
                    element={LeagueAcc.Body}
                  >
                    {item[0]}
                  </Accordion.Collapse>
                </LeagueAcc>
              ))}
            </Accordion>
          </div>
        </section>
      </>
    );
  else
    return (
      <>
        <p className={`e-section__title`}>{data.name}</p>
        <p className={`e-section__title`}>Quick Start</p>
        <Hometiles leagues={false} />
        <p className={`u-align__text--center u-menu_text`}>
          Welcome. Create a league to see more info here.
        </p>
      </>
    );
};

// const Dashboard = (data) => {
//   // const [state, dispatch] = React.useReducer(reducer, initialState);
//   return (
//     <>
//       <p className="animated fadeIn">{data.name}</p>
//       <p className="animated fadeIn">Dashboard</p>
//     </>
//   );
// };

export default Dashboard;
