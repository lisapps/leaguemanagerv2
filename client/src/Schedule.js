import React, { useState, useEffect } from "react";
import axios from "axios";
import LeagueSwitcher from "./components/LeagueSwitcher/LeagueSwitcher";
import { LeaguesContext } from "./hooks/LeaguesContext";
import ByeTab from "./components/ByeTab";
import SetupTab from "./components/SetupTab";
import SchedTab from "./components/SchedTab";
import dotenv from "dotenv";
import { AuthContext } from "./App";
import Cookies from "universal-cookie";

dotenv.config();
var server = process.env.API_URL;

const Schedule = () => {
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
  const { selectedLeague } = React.useContext(LeaguesContext);
  const [currentLeagueData, setCurrentLeagueData] = useState(null);
  const [currentTab, setCurrentTab] = useState("tabA");

  const handleRestart = () => {
    setData({
      ...data,
      isLoading: true,
      errorMessage: false,
    });
    axios({
      method: "post",
      url: server + "/restart-schedule",
      data: {
        lId: selectedLeague[0].value,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setData({
            ...data,
            isLoading: false,
            errorMessage: false,
          });
          //load schedule data again
          getSchedule();
        } else {
          throw res;
        }
      })
      .catch((error) => {
        setData({
          ...data,
          isLoading: false,
          errorMessage:
            (error.data ? error.data.status : "Restarting failed.") ||
            error.statusText,
        });
      });
  };

  const handleTabClick = (tab) => {
    setCurrentTab(tab);
  };

  //-- call api for data --//
  const getSchedule = () => {
    
    axios(server + "/schedule", {
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.Status == "Success") {
          setData({
            ...data,
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
  };

  //-- changes data in page based on selected league --//
  useEffect(() => {
    if (selectedLeague !== null && data.leagues && data.leagues !== []) {
      let currId = selectedLeague[0].value;
      let l = data.leagues.flat();
      let currL = l.find((x) => x.leagueId === currId);

      setCurrentLeagueData(currL);
    }
  }, [data, selectedLeague]);

  //-- get data for all tabs --//
  useEffect(() => {
    getSchedule();
  }, []);

  //-- set visible tab for current league --//
  useEffect(() => {
    if (currentLeagueData !== undefined && currentLeagueData !== null) {
      if (currentLeagueData.flag == "2") setCurrentTab("tabC");
      if (currentLeagueData.flag == "1") setCurrentTab("tabB");
      if (currentLeagueData.flag == "0") setCurrentTab("tabA");
    }
  }, [currentLeagueData]);

  if (data.isLoading) return "Loading...";
  if (data.errorMessage)
    return `Something went wrong in Schedule: ${data.errorMessage}`;
  if (!data.isLoading && data.leagues.length == 0)
    return <p>No Leagues are ready to schedule.</p>;
  if (currentLeagueData === null || currentLeagueData === undefined)
    return (
      <>
        <LeagueSwitcher />
        <section className="l-content">
          <p className="animated fadeIn">
            This league isn't ready to schedule.
          </p>
        </section>
      </>
    );
  if (currentLeagueData === null && data.leagues.length == 0)
    return (
      <p className="animated fadeIn">
        This league isn't available to schedule. Be sure that the league has
        started or has not ended.
      </p>
    );
  if (currentLeagueData !== undefined && data.leagues.length !== 0)
    return (
      <>
        <LeagueSwitcher />
        <section className="l-content">
          <div
            className={`l-content__flexContainer l-content__flexContainer--right`}
          >
            <div
              className={`e-restart ${data.isLoading ? "disabled" : ""}`}
              onClick={handleRestart}
            >
              <span>Restart</span>
            </div>
          </div>
          <ul className="l-tabcontainer u-mt35">
            {currentLeagueData.flag == "0" ? (
              <>
                <li
                  className={
                    currentTab == "tabA"
                      ? `e-tabBtn currentTab  u-mr15`
                      : "e-tabBtn  u-mr15"
                  }
                  name="tabA"
                  onClick={() => handleTabClick("tabA")}
                >
                  Bye
                </li>
                <li className={`e-tabBtn u-ml15 u-mr15 u-locked`}>Set Up</li>
                <li className={`e-tabBtn u-ml15 u-locked`}>Schedule</li>
              </>
            ) : currentLeagueData.flag == "1" ? (
              <>
                <li
                  className={
                    currentTab == "tabA"
                      ? `e-tabBtn currentTab  u-mr15`
                      : `e-tabBtn  u-mr15`
                  }
                  name="tabA"
                  onClick={() => handleTabClick("tabA")}
                >
                  Bye
                </li>
                <li
                  className={
                    currentTab == "tabB"
                      ? `e-tabBtn currentTab  u-ml15 u-mr15`
                      : "e-tabBtn  u-mr15"
                  }
                  name="tabB"
                  onClick={() => handleTabClick("tabB")}
                >
                  Set Up
                </li>
                <li className={`e-tabBtn u-ml15 u-locked`}>Schedule</li>
              </>
            ) : (
              <>
                <li className={`e-tabBtn u-mr15 u-locked`}>Bye</li>
                <li className={`e-tabBtn u-ml15 u-mr15 u-locked`}>Set Up</li>
                <li
                  className={
                    currentTab == "tabC"
                      ? "e-tabBtn  u-ml15 currentTab"
                      : "e-tabBtn"
                  }
                  name="tabB"
                  onClick={() => handleTabClick("tabC")}
                >
                  View Schedule
                </li>
              </>
            )}
          </ul>
          {/* Bye tab*/}
          <div className={`tab ${currentTab == "tabA" ? "u-show" : "u-hide"}`}>
            <ByeTab
              divisions={
                currentLeagueData.bye
                  ? currentLeagueData.bye.divisionsList
                  : undefined
              }
              next={getSchedule}
            />
          </div>
          {/* Setup tab*/}
          <div className={`tab ${currentTab == "tabB" ? "u-show" : "u-hide"}`}>
            <SetupTab
              divisions={
                currentLeagueData.setUp
                  ? currentLeagueData.setUp.divisionsList
                  : undefined
              }
              update={getSchedule}
            />
          </div>
          <div className={`tab ${currentTab == "tabC" ? "u-show" : "u-hide"}`}>
            <SchedTab
              divisions={
                currentLeagueData.scheduled
                  ? currentLeagueData.scheduled
                  : undefined
              }
              update={getSchedule}
            />
          </div>
        </section>
      </>
    );
};

export default Schedule;
