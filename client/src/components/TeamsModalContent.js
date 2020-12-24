import React, { useState, useEffect } from "react";
import { LeaguesContext } from "../hooks/LeaguesContext";
import axios from "axios";
import teamImg from "../../public/images/icons/icons-photo-team.svg";
import { useAccordionContext } from "../components/Accordion/hooks";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const TeamsModalContent = ({ division, onConfirm }) => {
  const initialstate = {
    teams: [],
    isLoading: true,
    errorMessage: false,
  };
  const { selectedLeague } = React.useContext(LeaguesContext);
  const [modalData, setModalData] = useState(initialstate);
  const [addList, setAddList] = useState([]);
  //changing this state should update the accordion body
  const { onChangeBody } = useAccordionContext();

  useEffect(() => {
    axios({
      method: "post",
      url: server + "/loadTeamsModal",
      data: {
        lId: selectedLeague,
        divisionId: division,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setModalData(res.data.poolTeamsList);
        } else {
          throw res;
        }
      })
      .catch((error) => {
        console.error("team modal failed:", error);
        setModalData({
          isLoading: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "No data loaded. Try logging in again.") || error.statusText,
        });
      });
  }, []);

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

  function handleRemove(id) {
    const newTeams = modalData.filter((team) => team.teamId != id);
    setModalData(newTeams);
  }

  const addTeam = (tId) => {
    handleRemove(tId);
    setAddList((addList) => [...addList, tId]);
  };

  const handleConfirm = () => {
    sendAddTeams();
    onConfirm();
    onChangeBody(true);
  };

  const handleCancel = () => {
    setAddList([]);
    onConfirm();
    onChangeBody(true);
  };

  function sendAddTeams() {
    if (addList.length > 0)
      axios({
        method: "post",
        url: server + "/addTeams",
        data: {
          lId: selectedLeague,
          dId: division,
          teams: addList,
        },
        withCredentials: true,
      })
        .then((res) => {
          if (res.data.status == "Success") {
            notify("Team was added to the division.");
          } else {
            throw res;
          }
        })
        .catch((error) => {
          notify("Team was not added. There was a problem.");
          console.error("adding teams failed:", error);
        });
  }

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

  if (modalData && modalData.length == 0) {
    return (
      <div>
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
          <div className="c-teamTable__listing">
            <span>NO TEAMS TO ADD</span>
          </div>
        </div>
        {addList.length > 0 ? (
          <div className={`l-content__row c-btnrow`}>
            <button
              className={`e-btn--small e-btn--secondary`}
              onClick={handleCancel}
            >
              cancel
            </button>
            <button className="e-btn--small" onClick={handleConfirm}>
              confirm
            </button>
          </div>
        ) : (
          ""
        )}
        <ToastContainer />
      </div>
    );
  }
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
          {modalData.map((team) => (
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
                  {team.registeredTeamMembers} of {team.maxTeamPlayers}
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
                <span className="e-indicatorText">
                  {team.teamPaymentStatus}
                </span>
              </div>
              <div className="c-teamTable__listing__item">
                <button
                  className="e-btn__add"
                  onClick={() => addTeam(team.teamId)}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className={`l-content__row c-btnrow`}>
          <button
            className={`e-btn--small e-btn--secondary`}
            onClick={handleCancel}
          >
            cancel
          </button>
          <button className="e-btn--small" onClick={handleConfirm}>
            confirm
          </button>
        </div>
      </>
    );
  }
};

export default TeamsModalContent;
