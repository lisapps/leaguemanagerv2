import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import LeagueSwitcher from "./components/LeagueSwitcher/LeagueSwitcher";
import { LeaguesContext } from "./hooks/LeaguesContext";
import Accordion from "./components/Accordion";
import TeamsSetupAcc from "./components/TeamsSetupAcc";
import MergeTab from "./components/MergeTab";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dotenv from "dotenv";
import { AuthContext } from "./App";
import Cookies from "universal-cookie";

dotenv.config();
var server = process.env.API_URL;

const Teams = () => {
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

  // detailed league data from dashboard API call
  const [data, setData] = useState(initialstate);
  // LeaguesContext only provides enough info for the dropdown
  const { selectedLeague } = React.useContext(LeaguesContext);
  // just the current league details
  const [currentLeagueData, setCurrentLeagueData] = useState(null);
  const [currentTab, setCurrentTab] = useState("tabA");
  //for accordions
  const [activeEventKey, setActiveEventKey] = useState(0);
  //true means accordion body should have data updated
  const [updateCollapse, setUpdateCollapse] = useState(false);
  const [removeBtn, setRemoveBtn] = useState(false);

  // changes data in page based on selected league
  useEffect(() => {
    if (selectedLeague !== null && data.leagues && data.leagues !== []) {
      let l = data.leagues.flat();
      let currId = selectedLeague[0].value;
      let currL = l.find((x) => x.leagueId === currId);
      setCurrentLeagueData(currL);
    }
  }, [data, selectedLeague]);

  // loads divisions
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
        console.error("registration failed:", error);
        setData({
          isLoading: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "No data loaded. Try logging in again.") || error.statusText,
        });
      });
  }, []);

  const handleTabClick = (event) => {
    if (currentTab == "tabA") {
      setCurrentTab("tabB");
    } else {
      setCurrentTab("tabA");
    }
  };

  const toggleRemBtn = () => {
    setRemoveBtn(!removeBtn);
  };

  // Modal content is in TeamsSetupAccHeader
  if (data.isLoading) return "Loading...";
  if (data.errorMessage)
    return `Something went wrong in Teams: ${data.errorMessage}`;
  if (currentLeagueData) {
    return (
      <>
        <LeagueSwitcher />
        <section className="l-content">
          <ul className="l-tabcontainer">
            <li
              className={
                currentTab == "tabA" ? `e-tabBtn currentTab` : "e-tabBtn"
              }
              name="tabA"
              onClick={handleTabClick}
            >
              Setup
            </li>
            <li
              className={
                currentTab == "tabB" ? `e-tabBtn currentTab` : "e-tabBtn"
              }
              name="tabB"
              onClick={handleTabClick}
            >
              Merge
            </li>
          </ul>
          {/* teams tab*/}

          <div
            className={`tab tab--circles ${
              currentTab == "tabA" ? "u-show" : "u-hide"
            } u-animated u-animated--faster fadeIn`}
          >
            <Accordion
              activeEventKey={activeEventKey}
              onToggle={setActiveEventKey}
              updateCollapse={updateCollapse}
              onChangeBody={setUpdateCollapse}
              removeBtn={removeBtn}
              toggleRemBtn={toggleRemBtn}
            >
              {currentLeagueData.divisionsList.map((item) => (
                <TeamsSetupAcc key={item.divisionId}>
                  <Accordion.Toggle
                    //passing header component in as property defined in TeamsSetupAcc index.js
                    element={TeamsSetupAcc.Header}
                    eventKey={item.divisionId}
                  >
                    {item}
                    {activeEventKey !== item.divisionId && ``}
                    {activeEventKey === item.divisionId && `active`}
                  </Accordion.Toggle>
                  <Accordion.Collapse
                    eventKey={item.divisionId}
                    element={TeamsSetupAcc.Body}
                  >
                    {item}
                  </Accordion.Collapse>
                </TeamsSetupAcc>
              ))}
            </Accordion>
          </div>
          {currentTab == "tabA" ? (
            <span
              className={`l-content__flexContainer--right u-sticky__bottomBtns`}
            >
              <Link to="/teams/create-team">
                <button type="button">New Team</button>
              </Link>
            </span>
          ) : (
            ""
          )}
          {/* merge tab*/}
          <div className={`tab ${currentTab == "tabB" ? "u-show" : "u-hide"}`}>
            <MergeTab onMerge={() => setCurrentTab("tabA")} />
          </div>
        </section>
      </>
    );
  }
  if (currentLeagueData === undefined) return "Loading...";
  if (currentLeagueData === [])
    return (
      <>
        <LeagueSwitcher />
        <section className="l-content">
          <p className="animated fadeIn">
            Create some leagues and teams to see information.
          </p>
        </section>
      </>
    );
  if (currentLeagueData === null)
    return (
      <>
        <LeagueSwitcher />
        <section className="l-content">
          <p className="animated fadeIn">...</p>
        </section>
      </>
    );
};

export default Teams;
