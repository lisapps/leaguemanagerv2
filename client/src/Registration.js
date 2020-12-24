import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import axios from "axios";
import LeagueSwitcher from "./components/LeagueSwitcher/LeagueSwitcher";
import { LeaguesContext } from "./hooks/LeaguesContext";
import Infocards from "./components/Infocards";
import Accordion from "./components/Accordion";
import RegTeamsAcc from "./components/RegTeamsAcc";
import RegPlayersAcc from "./components/RegPlayersAcc";
import "react-toastify/dist/ReactToastify.css";
import dotenv from "dotenv";
import { AuthContext } from "./App";
import Cookies from "universal-cookie";

dotenv.config();
var server = process.env.API_URL;

const Registration = () => {
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

  let history = useHistory();

  const [data, setData] = useState(initialstate);
  const { selectedLeague } = React.useContext(LeaguesContext);
  const [currentLeagueData, setCurrentLeagueData] = useState(null);
  const [currentTab, setCurrentTab] = useState("tabA");
  const [teamData, setTeamData] = useState(null);
  //for accordions
  const [activeEventKey, setActiveEventKey] = useState(0);

  //-- changes data in page based on selected league --//
  useEffect(() => {
    if (selectedLeague !== null && data.leagues && data.leagues !== []) {
      let currId = selectedLeague[0].value;
      let l = data.leagues.flat();
      let currL = l.find((x) => x.leagueId === currId);

      setCurrentLeagueData(currL);
    }
  }, [data, currentLeagueData, selectedLeague]);

  useEffect(() => {
    if (selectedLeague !== null && data.leagues && data.leagues !== []) {
      loadPlayerTabTeams(selectedLeague[0].value);
    }
  }, [selectedLeague]);

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

  //-- loads initial content for player tab --//
  function loadPlayerTabTeams(lId) {
    axios({
      method: "post",
      url: server + "/loadRegTeamsPlayerTab",
      data: {
        lId: lId,
      },
      withCredentials: true,
    })
      .then((res) => {        if (res.data.status == "Success") {
          setTeamData({
            teams: res.data.teamsList,
          });
        } else {
          throw res;
        }
      })
      .catch((error) => {
        console.error("registration failed:", error);
        setTeamData({
          isLoading: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "No data loaded. Try logging in again.") || error.statusText,
        });
      });
  }

  const handleTabClick = () => {
    if (currentTab == "tabA") {
      setCurrentTab("tabB");
      if (teamData == null) loadPlayerTabTeams(selectedLeague[0].value);
    } else {
      setCurrentTab("tabA");
    }
  };

  const getPlayerForm = () => {
    history.push("/teams/create-player");
  };

  if (data.isLoading) return "Loading...";
  if (data.errorMessage)
    return `Something went wrong in Registration: ${data.errorMessage}`;
  if (currentLeagueData) {
    return (
      <>
        <LeagueSwitcher />
        <section className="l-content">
          <Infocards children={currentLeagueData} />
          <ul className="l-tabcontainer">
            <li
              className={
                currentTab == "tabA" ? `e-tabBtn currentTab` : "e-tabBtn"
              }
              name="tabA"
              onClick={handleTabClick}
            >
              Teams
            </li>
            <li
              className={
                currentTab == "tabB" ? `e-tabBtn currentTab` : "e-tabBtn"
              }
              name="tabB"
              onClick={handleTabClick}
            >
              Players
            </li>
          </ul>
          {/* teams tab*/}

          <div
            className={`tab tab--circles ${
              currentTab == "tabA" ? "u-show" : "u-hide"
            }  u-animated u-animated--faster fadeIn`}
          >
            <Accordion
              activeEventKey={activeEventKey}
              onToggle={setActiveEventKey}
            >
              {currentLeagueData.divisionsList.map((item) => (
                <RegTeamsAcc key={item.divisionId}>
                  <Accordion.Toggle
                    element={RegTeamsAcc.Header}
                    eventKey={item.divisionId}
                  >
                    {item}
                    {activeEventKey !== item.divisionId && ``}
                    {activeEventKey === item.divisionId && `active`}
                  </Accordion.Toggle>
                  <Accordion.Collapse
                    eventKey={item.divisionId}
                    element={RegTeamsAcc.Body}
                  >
                    {item}
                  </Accordion.Collapse>
                </RegTeamsAcc>
              ))}
            </Accordion>
            <span
              className={`l-content__flexContainer--right u-sticky__bottomBtns`}
            >
              <Link to="/teams/create-team">
                <button type="button">New Team</button>
              </Link>
            </span>
          </div>
          {/* players tab*/}
          <div
            className={`tab ${
              currentTab == "tabB" ? "u-show" : "u-hide"
            } u-animated u-animated--faster fadeIn`}
          >
            {teamData !== null ? (
              <>
                <Accordion
                  activeEventKey={activeEventKey}
                  onToggle={setActiveEventKey}
                >
                  {teamData.teams.map((team) => (
                    <RegPlayersAcc key={team.teamId}>
                      <Accordion.Toggle
                        element={RegPlayersAcc.Header}
                        eventKey={team.teamId}
                      >
                        {team}
                        {activeEventKey !== team.teamId && ``}
                        {activeEventKey === team.teamId && `active`}
                      </Accordion.Toggle>
                      <Accordion.Collapse
                        eventKey={team.teamId}
                        element={RegPlayersAcc.Body}
                      >
                        {team}
                      </Accordion.Collapse>
                    </RegPlayersAcc>
                  ))}
                </Accordion>
                <span
                  className={`l-content__flexContainer--right u-sticky__bottomBtns`}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      getPlayerForm();
                    }}
                  >
                    Create Player
                  </button>
                </span>
              </>
            ) : (
              <div className="u-large_body"> No teams or players yet.</div>
            )}
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
            Create some leagues to see registration information.
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

export default Registration;
