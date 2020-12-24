import React, { useState, useEffect } from "react";
import axios from "axios";
import teamImg from "../../../public/images/icons/icons-photo-team.svg";
import RemindTeamButton from "./RemindTeamButton";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const RegTeamsAccBody = ({ children, ...props }) => {
  const initialstate = {
    teamsList: [],
    isLoading: true,
    errorMessage: false,
  };
  const [data, setData] = useState(initialstate);

  useEffect(() => {
    axios({
      method: "post",
      url: server + "/loadRegTeams",
      data: {
        divisionId: children.divisionId,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setData({
            teamsList: res.data.teamsList,
            isLoading: false,
            errorMessage: false,
          });
          // findCurrentData();
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
              : "There was a problem loading teams.") || error.statusText,
        });
      });
  }, []);

  if (data.isLoading)
    return (
      <div
        className={`c-accordion__panel c-card c-teamTable u-animated u-animated--faster a-fadeIn`}
      >
        <div className="c-teamTable__header">
          <div className="c-teamTable__header__item">
            <span>Teams</span>
          </div>
          <div className="c-teamTable__header__item">
            <span>Players</span>
          </div>
          <div className="c-teamTable__header__item">
            <span>Status</span>
          </div>
          <div className="c-teamTable__header__item">
            <span>Registration</span>
          </div>
        </div>
        <div className={`c-teamTable__listing--reg u-table__listing--temp`}>
          <svg className="e-indicatorimg" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="14" fill="#eeeeee"></circle>
          </svg>
          <div className="u-table__listing__item"></div>
          <div className="u-table__listing__item">
            <span className="e-playercount"></span>
          </div>
          <div className={`u-table__listing__item c-statusIndicator`}>
            <svg></svg>
            <span className="e-indicatorText"></span>
          </div>
          <div className={`u-table__listing__item c-statusIndicator`}>
            <svg></svg>
            <span className="e-indicatorText"></span>
          </div>
          <div className="u-table__listing__item"></div>
        </div>
      </div>
    );
  if (data.errorMessage) return `Something went wrong: ${data.errorMessage}`;
  if (
    data.teamsList.length == 0 &&
    data.isLoading == false &&
    data.errorMessage == false
  )
    return (
      <div
        className={`l-content__flexContainer--center u-h3_inactive c-accordion__panel--empty`}
      >
        No Teams found. Click + ADD TEAM to get started
      </div>
    );

  if (
    data.teamsList.length !== 0 &&
    data.isLoading == false &&
    data.errorMessage == false
  )
    return (
      <div
        className={`c-accordion__panel c-card c-teamTable u-animated u-animated--faster a-fadeIn`}
        key={children.divisionId}
      >
        <div className="c-teamTable__header">
          <div className="c-teamTable__header__item">
            <span>Teams</span>
          </div>
          <div className="c-teamTable__header__item">
            <span>Players</span>
          </div>
          <div className="c-teamTable__header__item">
            <span>Status</span>
          </div>
          <div className="c-teamTable__header__item">
            <span>Registration</span>
          </div>
          <div className="c-teamTable__header__item"></div>
        </div>
        {data.teamsList.map((team) => (
          <div className="c-teamTable__listing" key={team.teamId}>
            <div className="c-teamTable__listing__item ">
              <img
                className="u-img-rounded"
                src={
                  team.teamIcon
                    ? "https://avp-backend.com/" + team.teamIcon
                    : teamImg
                }
              />
              <span className="c-teamTable__cell">{team.teamName}</span>
            </div>
            <div className="c-teamTable__listing__item c-teamTable__listing__item--pcount">
              {/* span.e-playercount(class='tooltip--top' aria-label='Confirmed Players / Team Size.') #{allTeams[i].numberOfTeamPlayers} of #{allTeams[i].maxPlayers} */}
              <span
                className="e-playercount"
                aria-label="Confirmed Players / Team Size."
              >
                {team.numberOfTeamPlayers} of {team.maxPlayers}
              </span>
            </div>
            <div className={`c-teamTable__listing__item c-statusIndicator`}>
              {team.teamStatus == "Complete" ? (
                <svg
                  className="e-indicatorImg--green"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="6" cy="6" r="3"></circle>
                </svg>
              ) : (
                <svg
                  className="e-indicatorImg--yellow"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="6" cy="6" r="3"></circle>
                </svg>
              )}
              <span className="e-indicatorText">{team.teamStatus}</span>
            </div>
            <div className={`c-teamTable__listing__item c-statusIndicator`}>
              {team.teamStatus == "Paid" ? (
                <svg
                  className="e-indicatorImg--green"
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
              <span className="e-indicatorText">{team.paymentStatus}</span>
            </div>
            <div className="c-teamTable__listing__item ">
              <RemindTeamButton paid={team.paymentStatus} id={team.teamId} />
            </div>
          </div>
        ))}
      </div>
    );
};

export default RegTeamsAccBody;
