import React, { useState, useEffect } from "react";
import axios from "axios";
import teamImg from "../../public/images/icons/icons-photo-team.svg";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const MergeModalContent = ({ onConfirm }) => {
  const initialstate = {
    teams: "",
    ptImg: null,
    ctImg: null,
    ptName: null,
    ctName: null,
    isLoading: true,
    errorMessage: false,
  };

  const [modalData, setModalData] = useState(initialstate);

  const handleConfirm = (t, i, n) => {
    onConfirm(t, i, n);
  };

  useEffect(() => {
    loadMMTeams();
  }, []);

  const loadMMTeams = () => {
    axios(server + "/loadMergeModal", {
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setModalData({
            ...modalData,
            teams: res.data.teamsList,
            isLoading: false,
            errorMessage: false,
          });
        } else {
          throw res;
        }
      })
      .catch((error) => {
        console.error("team data failed:", error);
        setModalData({
          ...modalData,
          isLoading: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "No data loaded. Try logging in again.") || error.statusText,
        });
      });
  };

  if (modalData.isLoading)
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
  if (modalData.errorMessage)
    return `Something went wrong in the Teams Modal: ${modalData.errorMessage}`;
  if (modalData) {
    return (
      <>
        <div className="c-teamTable__header">
          <div className="c-teamTable__header__item">
            <span>Team</span>
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
          <div className="c-teamTable__header__item">
            <span> </span>
          </div>
        </div>
        <div className="c-teamTable" id="c-teamTable__container">
          {modalData.teams.map((team) => (
            <div className="c-teamTable__listing" key={team.teamId}>
              <div className="c-teamTable__listing__item">
                <img
                  className="u-img-rounded"
                  src={
                    team.teamIcon
                      ? "https://avp-backend.com/" + team.teamIcon
                      : teamImg
                  }
                  alt={team.teamName}
                />
                <span className="c-teamTable__cell">{team.teamName}</span>
              </div>
              <div className="c-teamTable__listing__item">
                <span>
                  {" "}
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
                    className="e-indicatorImg--red"
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
              <div className="c-teamTable__listing__item">
                <button
                  className="e-btn__add"
                  onClick={(e) => {
                    e.preventDefault();
                    handleConfirm(team.teamId, team.teamIcon, team.teamName);
                  }}
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
};

export default MergeModalContent;
