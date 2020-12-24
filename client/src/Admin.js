import React, { useState, useEffect } from "react";
import LeaguesTab from "./components/LeaguesTab";
import { Link } from "react-router-dom";
import axios from "axios";
import Accordion from "./components/Accordion";
import AdminAcc from "./components/AdminAcc";
import "react-toastify/dist/ReactToastify.css";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const Admin = () => {
  const initialstate = {
    leagues: [],
    isLoading: true,
    errorMessage: false,
  };

  // detailed league data from dashboard API call
  const [data, setData] = useState(initialstate);
  const [currentTab, setCurrentTab] = useState("tabA");
  //for accordions
  const [activeEventKey, setActiveEventKey] = useState(0);
  const [updateCollapse, setUpdateCollapse] = useState(false);
  const [removeBtn, setRemoveBtn] = useState(false);

  // loads leagues with managers.
  useEffect(() => {
    axios(server + "/admin-leagues", {
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
        console.error("Admin failed:", error);
        setData({
          isLoading: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "No data loaded. Try logging in again.") || error.statusText,
        });
      });
  }, [updateCollapse]);

  const handleTabClick = (event) => {
    if (currentTab == "tabA") {
      setCurrentTab("tabB");
      // load data again for merge tab in case of changes?
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
    return `Something went wrong in Admin: ${data.errorMessage}`;
  if (data.leagues) {
    return (
      <>
        <section className="l-content">
          <ul className="l-tabcontainer">
            <li
              className={
                currentTab == "tabA" ? `e-tabBtn currentTab` : "e-tabBtn"
              }
              name="tabA"
              onClick={handleTabClick}
            >
              Managers
            </li>
            <li
              className={
                currentTab == "tabB" ? `e-tabBtn currentTab` : "e-tabBtn"
              }
              name="tabB"
              onClick={handleTabClick}
            >
              Leagues
            </li>
          </ul>
          {/* Managers tab*/}

          <div
            className={`tab ${
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
              {data.leagues.map((item) => (
                <AdminAcc key={item.leagueId}>
                  <Accordion.Toggle
                    //passing header component in as property defined in AdminAcc index.js
                    element={AdminAcc.Header}
                    eventKey={item.leagueId}
                  >
                    {item}
                    {activeEventKey !== item.leagueId && ``}
                    {activeEventKey === item.leagueId && `active`}
                  </Accordion.Toggle>
                  <Accordion.Collapse
                    eventKey={item.leagueId}
                    element={AdminAcc.Body}
                  >
                    {item}
                  </Accordion.Collapse>
                </AdminAcc>
              ))}
            </Accordion>
            <span
              className={`l-content__flexContainer--right u-sticky__bottomBtns`}
            >
              <Link to="/admin/invite-manager">
                <button type="button">Invite Manager</button>
              </Link>
            </span>
          </div>
          {/* merge tab*/}
          <div
           
            className={`tab ${
              
              currentTab == "tabB" ? "u-show" : "u-hide"
            
            } u-animated u-animated--faster fadeIn`}
          
          >
            {/* league table */}
            <LeaguesTab />
          </div>
        </section>
      </>
    );
  }
  if (currentLeagueData === undefined) return "Loading...";
  if (currentLeagueData === [])
    return (
      <>
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
        <section className="l-content">
          <p className="animated fadeIn">...</p>
        </section>
      </>
    );
};

export default Admin;
