import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LeagueSwitcher from "./components/LeagueSwitcher/LeagueSwitcher";
import { LeaguesContext } from "./hooks/LeaguesContext";
import Accordion from "./components/Accordion";
import ResStandingsAcc from "./components/ResStandingsAcc"
import ResOverAcc from "./components/ResOverAcc"
import dotenv from "dotenv";


dotenv.config();
var server = process.env.API_URL;

const Results = () => {
  const initialstate = {
    leagues: [],
    isLoading: true,
    errorMessage: false,
  };

  const [data, setData] = useState(initialstate);
  const { selectedLeague } = React.useContext(LeaguesContext);
  const [currentLeagueData, setCurrentLeagueData] = useState(null);
  const [currentTab, setCurrentTab] = useState("tabA");
  //-- for accordions --//
  const [activeEventKey, setActiveEventKey] = useState(0);
  //-- true means accordion body should have data updated --//
  const [updateCollapse, setUpdateCollapse] = useState(false);
  const [removeBtn, setRemoveBtn] = useState(false);
  //-- state controlling regular or batch edit view in overview --//
  const [viewEdit, setViewEdit] = useState(false);
  //-- for edit/sending button state on edits
  const [confirmClicked, setConfirmClicked] = useState(false);

  //-- changes data in page based on selected league --//
  useEffect(() => {
    if (selectedLeague !== null && data.leagues && data.leagues !== []) {
      //set current league Id to use for search in result api data
      let currId = selectedLeague[0].value;

      //flatten array of api data to search
      let l = data.leagues.flat();
      //search to see if currently selected league Id from league switcher is a league that has results data
      var currL = l.find((x) => x.leagueId === currId);

      if (currL !== undefined) {
        // if selected league id matches one in results, set that as page content
        setCurrentLeagueData(currL);
      } else if (currL == undefined || currentLeagueData == null) {
        // if no match then set as null
        setCurrentLeagueData({});
      }
    }
  }, [data, selectedLeague]);

  function fetchStandings() {
    axios(server + "/results", {
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setData({
            leagues: res.data.leagueList,
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
  }

  useEffect(() => {
    fetchStandings();
  }, [updateCollapse]);

  const notify = (txt) =>
    toast.dark(txt, {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    });

  const handleTabClick = () => {
    if (currentTab == "tabA") {
      setCurrentTab("tabB");
    } else {
      setCurrentTab("tabA");
    }
  };

  const toggleRemBtn = () => {
    setRemoveBtn(!removeBtn);
  };

  //-- cancel button
  const switchView = () => {
    setViewEdit(!viewEdit);
  };

  //-- edit btn if division expanded by seeing if Accordion activeEventKey is not null
  const handleEditBtn = () => {
    if(activeEventKey) { 
      setViewEdit(!viewEdit) } 
      else { notify("Expand a division to edit.")};
  };

  if (data.isLoading) return "Loading...";
  if (data.errorMessage)
    return `Something went wrong in Results: ${data.errorMessage}`;
  if (currentLeagueData === null)
    return (
      <>
        <LeagueSwitcher />
        <section className="l-content">
          <p className="animated fadeIn">...</p>
        </section>
      </>
    );
  if (currentLeagueData && Object.keys(currentLeagueData).length !== 0) {
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
              Standings
            </li>
            <li
              className={
                currentTab == "tabB" ? `e-tabBtn currentTab` : "e-tabBtn"
              }
              name="tabB"
              onClick={handleTabClick}
            >
              Overview
            </li>
          </ul>
          {/* Standings tab*/}
          <div
            className={`tab tab--circles ${
              currentTab == "tabA" ? "u-show" : "u-hide"
            } u-animated u-animated--faster fadeIn`}
          >
            <Accordion
              activeEventKey={activeEventKey}
              onToggle={setActiveEventKey}
            >
              {currentLeagueData.standings.divisionList.map((item) => (
                <ResStandingsAcc key={item.divisionId}>
                  <Accordion.Toggle
                    element={ResStandingsAcc.Header}
                    eventKey={item.divisionId}
                  >
                    {item}
                    {activeEventKey !== item.divisionId && ``}
                    {activeEventKey === item.divisionId && `active`}
                  </Accordion.Toggle>
                  <Accordion.Collapse
                    eventKey={item.divisionId}
                    element={ResStandingsAcc.Body}
                  >
                    {item}
                  </Accordion.Collapse>
                </ResStandingsAcc>
              ))}
            </Accordion>
          </div>
          {/* Overview tab*/}
          <div
            className={`tab tab--circles ${
              currentTab == "tabB" ? "u-show" : "u-hide"
            } u-animated u-animated--faster fadeIn`}
          >
            {currentLeagueData.results !== [] ? (
              <>
                <Accordion
                  activeEventKey={activeEventKey}
                  onToggle={setActiveEventKey}
                  updateCollapse={updateCollapse}
                  onChangeBody={setUpdateCollapse}
                  removeBtn={removeBtn}
                  toggleRemBtn={toggleRemBtn}
                >
                  {currentLeagueData.results.divisionList.map((item) => (
                    <ResOverAcc key={item.divisionId}>
                      <Accordion.Toggle
                        element={ResOverAcc.Header}
                        eventKey={item.divisionId}
                      >
                        {item}
                        {activeEventKey !== item.divisionId && ``}
                        {activeEventKey === item.divisionId && `active`}
                      </Accordion.Toggle>
                      <Accordion.Collapse
                        eventKey={item.divisionId}
                        element={ResOverAcc.Body}
                        viewEdit={viewEdit}
                        confirm={confirmClicked}
                        sent={() => setConfirmClicked(false)}
                        setViewEdit={() => setViewEdit}
                      >
                        {item}
                      </Accordion.Collapse>
                    </ResOverAcc>
                  ))}
                </Accordion>
                <ToastContainer />
                <span
                  className={`l-content__flexContainer--right u-sticky__bottomBtns`}
                >
                  {!viewEdit ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleEditBtn();
                        }}
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className={`e-btn--small e-btn--secondary`}
                        onClick={(e) => {
                          e.preventDefault();
                          switchView();
                        }}
                      >
                        cancel
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setConfirmClicked(true);
                        }}
                        className="e-btn--small"
                        disabled={confirmClicked}
                      >
                        {confirmClicked ? "Sending..." : "Confirm"}
                      </button>
                    </>
                  )}
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
  if (currentLeagueData && Object.keys(currentLeagueData).length === 0) {
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
              Standings
            </li>
            <li
              className={
                currentTab == "tabB" ? `e-tabBtn currentTab` : "e-tabBtn"
              }
              name="tabB"
              onClick={handleTabClick}
            >
              Overview
            </li>
          </ul>
          {/* Standings tab*/}
          <div
            className={`tab tab--circles ${
              currentTab == "tabA" ? "u-show" : "u-hide"
            }`}
          >
            <p>This league doesn't have any results.</p>
          </div>
          {/* Overview tab*/}
          <div className={`tab ${currentTab == "tabB" ? "u-show" : "u-hide"}`}>
            <p>This league doesn't have an overview to display.</p>
          </div>
        </section>
      </>
    );
  }
};

export default Results;
