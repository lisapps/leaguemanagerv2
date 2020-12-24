import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import teamImg from "../../../public/images/icons/icons-photo-team.svg";
import PlayersButton from "./PlayersButton";
import { setCookie } from "../../libs/cookie";
import { useAccordionContext } from "../Accordion/hooks";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const TeamsSetupAccBody = ({ children, ...props }) => {
  let history = useHistory();

  const initialstate = {
    teamsList: [],
    isLoading: true,
    errorMessage: false,
  };
  const [data, setData] = useState(initialstate);
  const { updateCollapse, onChangeBody, removeBtn } = useAccordionContext();

  const useUpdateCollapse = (s) => {
    //onChangeBody is just setUpDateCollapse prop set in Teams, which triggers data update from api for this component.
    //not calling setupdatecollapse directly prevents unnecessary re-renders, and avoids using dispatch
    onChangeBody(s);
  };

  const getDivTeams = () => {
    axios({
      method: "post",
      url: server + "/loadTeamsSetup",
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
          useUpdateCollapse(false);
        } else {
          throw res;
        }
      })
      .catch((error) => {
        console.error("loading teams failed:", error);
        setData({
          isLoading: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "There was a problem loading the teams") || error.statusText,
        });
      });
  };

  useEffect(() => {
    getDivTeams();
  }, [updateCollapse]);

  function removeTeam(id) {
    axios({
      method: "post",
      url: server + "/removeTeams",
      data: {
        tId: id,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          notify("Team was removed from the division.");
          useUpdateCollapse(true);
        } else {
          throw res;
        }
      })
      .catch((error) => {
        notify("Team was not removed.");
        useUpdateCollapse(true);
      });
  }

  const handleViewTeam = (t, i, n) => {
    setCookie("currentTeam", JSON.stringify([t, i, n]), 1);
    history.push("/teams/view-team");
  };

  const handleRemove = (index, tId) => {
    setData({
      ...data,
      teamsList: [
        ...data.teamsList.slice(0, index),
        { ...data.teamsList[index], disabled: true },
        ...data.teamsList.slice(index + 1),
      ],
    });
    removeTeam(tId);
    useUpdateCollapse(false);
  };

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
            <span>Payment</span>
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
  if (data.teamsList !== [])
    return (
      <div
        className={`c-accordion__panel c-card c-teamTable u-animated u-animated--faster a-fadeIn ${
          removeBtn ? "remove-active" : ""
        }`}
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
        {data.teamsList.map((team, i) => (
          <div
            className={
              `c-teamTable__listing` + (team.disabled ? ` removing` : "")
            }
            key={team.teamId}
          >
            <div className="c-teamTable__listing__item ">
              <div
                className={`e-btn__x`}
                onClick={(e) => handleRemove(i, team.teamId)}
              ></div>
              <img
                className="u-img-rounded"
                src={
                  team.teamIcon
                    ? "https://avp-backend.com/" + team.teamIcon
                    : teamImg
                }
                onClick={() =>
                  handleViewTeam(team.teamId, team.teamIcon, team.teamName)
                }
              />
              <span
                className="c-teamTable__cell"
                onClick={() =>
                  handleViewTeam(team.teamId, team.teamIcon, team.teamName)
                }
              >
                {team.teamName}
              </span>
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
              <PlayersButton
                team={[team.teamId, team.teamIcon, team.teamName]}
              />
            </div>
          </div>
        ))}
        <ToastContainer />
      </div>
    );
};

export default TeamsSetupAccBody;
