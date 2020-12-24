import React, { useState, useEffect } from "react";
import axios from "axios";
import dotenv from "dotenv";
import lIcon from "../../public/images/icons/icons-photo-league.svg";
import { setCookie } from "../libs/cookie";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";

dotenv.config();
var server = process.env.API_URL;

const LeaguesTab = () => {
  let history = useHistory();

  const initialstate = {
    leagues: [],
    isLoading: true,
    errorMessage: false,
  };
  const [data, setData] = useState(initialstate);

  const handleViewLg = (id) => {
    setCookie("currentLid", id, 1);
    history.push("/admin/view-league");
  };

  useEffect(() => {
    axios(server + "/admin-leaguesTab", {
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setData({ ...data, leagues: res.data.leaguesList, isLoading: false });
        } else {
          throw res;
        }
      })
      .catch((error) => {
        console.error("court modal failed:", error);
        setData({
          ...data,
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
    return `Something went wrong in fetching leagues: ${data.errorMessage}`;

  if (data && data.leagues.length == 0) {
    return (
      <>
        <section className="l-content">
          <p className="animated fadeIn">
            Create some leagues to see information.
          </p>
        </section>
      </>
    );
  }
  if (data) {
    return (
      <>
        <div className={`c-card c-leagueTabTable animated fadeIn`}>
          <div className={`c-leagueTabTable__header`}>
            <div className={`c-leagueTabTable__header__item`}>
              <span>Name</span>
            </div>
            <div className={`c-leagueTabTable__header__item`}>
              <span>Location</span>
            </div>
            <div
              className={`c-leagueTabTable__header__item c-leagueTabTable__header__item--small`}
            >
              <span>Teams/Max</span>
            </div>
            <div
              className={`c-leagueTabTable__header__item c-leagueTabTable__header__item--small`}
            >
              <span>Status</span>
            </div>
            <div
              className={`c-leagueTabTable__header__item c-leagueTabTable__header__item--small`}
            >
              <span>Cost</span>
            </div>
          </div>
          {data.leagues.map((league) => (
            <div className={`c-leagueTabTable__listing`} key={league.leagueId}>
              <div className={`c-leagueTabTable__listing__item`}>
                <img
                  className={`u-img-rounded`}
                  src={
                    league.leagueIcon
                      ? "https://avp-backend.com/" + league.leagueIcon
                      : lIcon
                  }
                  alt="nLeague-21"
                />
                <span className={`c-leagueTabTable__cell`}>
                  {league.leagueName}
                </span>
              </div>
              <div className={`c-leagueTabTable__listing__item`}>
                <span>{league.city + ", " + league.stateCode}</span>
              </div>
              <div
                className={`c-leagueTabTable__listing__item c-leagueTabTable__listing__item--small`}
              >
                <span>{league.teams}</span>
              </div>
              <div
                className={`c-leagueTabTable__listing__item c-leagueTabTable__listing__item--small c-statusIndicator`}
              >
                {league.leagueStatus == "Open" ? (
                  <svg
                    className="e-indicatorImg--green"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="6" cy="6" r="3"></circle>
                  </svg>
                ) : league.leagueStatus == "Creating" ? (
                  <svg
                    className="e-indicatorImg--yellow"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="6" cy="6" r="3"></circle>
                  </svg>
                ) : (
                  <svg
                    className="e-indicatorImg--red"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="6" cy="6" r="3"></circle>
                  </svg>
                )}
                {/* <svg className={`e-indicatorImg--green`} xmlns="http://www.w3.org/2000/svg">
                      <circle cx="6" cy="6" r="3"></circle>
                      </svg> */}
                <span className={`e-indicatorText`}>{league.leagueStatus}</span>
              </div>
              <div
                className={`c-leagueTabTable__listing__item c-leagueTabTable__listing__item--small`}
              >
                <span>{league.cost}</span>
              </div>
              <div className={`c-leagueTabTable__listing__item`}>
                <button
                  className={`e-btn__add--admLeague`}
                  onClick={() => handleViewLg(league.leagueId)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
        <span
          className={`l-content__flexContainer--right u-sticky__bottomBtns`}
        >
          <Link to="/admin/create-league">
            <button type="button">Create New League</button>
          </Link>
        </span>
      </>
    );
  }
};

export default LeaguesTab;
