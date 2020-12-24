import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { setCookie, getCookie } from "./libs/cookie";
import { ToastContainer, toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import Modal from "./components/Modal/Modal";
import PlayerModal from "./components/PlayerModal";
import teamImg from "../public/images/icons/icons-photo-team.svg";
import playerImg from "../public/images/icons/icons-photo-person.svg";
import captain from "../public/images/icons/captain.svg";
import tick from "../public/images/icons/tick.svg";
import dotenv from "dotenv";
import { AuthContext } from "./App";
import Cookies from "universal-cookie";

dotenv.config();
var server = process.env.API_URL;

const TeamPlayers = () => {
  const { dispatch } = React.useContext(AuthContext);
  const cookies = new Cookies();
  var authcookie = cookies.get("lmtoken");
  
  if (authcookie == undefined)
    dispatch({
      type: "LOGOUT",
    });

  var teamdata = getCookie("currentTeam");
  var arr, teamName, teamIcon, teamId;
  if (teamdata) {
    arr = JSON.parse(teamdata);
    teamName = arr[2];
    teamIcon = arr[1];
    teamId = arr[0];
  }

  const initialstate = {
    teamName: teamName,
    teamIcon: teamIcon,
    teamId: teamId,
    isLoading: true,
    isSubmitting: false,
    errorMessage: null,
  };
  const [data, setData] = useState(initialstate);
  const [isShowing, setIsShowing] = useState(false);

  let history = useHistory();

  const notifySuccess = (txt) =>
    toast.dark(txt, {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    });

  function handleViewPlayer(pid) {
    if (pid) {
      setCookie("currentPid", pid, 1);
      history.push("/teams/view-player");
    }
  }

  function setCaptain(pid, tid) {
    if (pid) {
      //send to api
      axios({
        method: "post",
        url: server + "/setTeamCaptain",
        data: {
          tId: tid,
          pId: pid,
        },
        withCredentials: true,
      })
        .then((res) => {
          if (res.data.status == "Success") {
            notifySuccess("Player set as captain.");
            setTimeout(() => {
              setData({
                ...data,
                isLoading: true,
                players: null,
              });
            }, 4000);
          } else {
            throw res;
          }
        })
        .catch((error) => {
          setData({
            ...data,
            isLoading: false,
            errorMessage:
              (error.data
                ? error.data.status
                : "Couldn't set team captain: there was an error at AVP.") ||
              error.statusText,
          });
        });
    }
  }

  function addPlayer(player) {
    setCookie("currPlayer", player.avpId, 1);
    handleClose();
    axios({
      method: "post",
      url: server + "/addPlayer",
      data: {
        tId: teamId,
        pId: player.avpId,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          notifySuccess("Player added.");
          setData({
            ...data,
            players: null,
            isLoading: true,
            errorMessage: false,
          });
        } else {
          throw res;
        }
      })
      .catch((error) => {
        setData({
          ...data,
          isLoading: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "Adding the player failed. Try again after logging in again.") ||
            error.statusText,
        });
      });
  }

  const handleShow = () => {
    setIsShowing(true);
  };

  const handleClose = () => {
    setIsShowing(false);
  };

  const removePlayer = (tmid) => {
    axios({
      method: "post",
      url: server + "/remPlayer",
      data: {
        tId: teamId,
        tmId: tmid,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {

          notifySuccess("Player removed.");
          setData({
            ...data,
            players: null,
            isLoading: true,
            errorMessage: false,
          });
        } else {
          throw res;
        }
      })
      .catch((error) => {
        setData({
          ...data,
          isLoading: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "Removing the player failed. Try logging in again.") ||
            error.statusText,
        });
      });
  };

  const handleRemove = (tpid) => {
    removePlayer(tpid);
  };

  useEffect(() => {
    if (
      (!data.players || data.players == null) &&
      (data.errorMessage == null || data.errorMessage == false)
    ) {
      if (teamId) {
        axios({
          method: "post",
          url: server + "/getTeamPlayers",
          data: {
            tId: teamId,
          },
          withCredentials: true,
        })
          .then((res) => {
            if (res.data.status == "Success") {
              setData({
                ...data,
                players: res.data.teamPlayersList,
                isLoading: false,
                errorMessage: false,
              });
            } else {
              throw res;
            }
          })
          .catch((error) => {
            console.error("player data api failed:", error);
            setData({
              ...data,
              isLoading: false,
              errorMessage:
                (error.data
                  ? error.data.status
                  : "No data loaded. Try logging in again.") ||
                error.statusText,
            });
          });
      } else {
        setData({
          ...data,
          isLoading: false,
          errorMessage: "No data loaded. Try logging in again.",
        });
      }
    }
  }, [data]);

  if (data.isLoading) return "Loading...";
  if (data.errorMessage)
    return `Something went wrong in View Player: ${data.errorMessage}`;
  if (data.players)
    return (
      <section className="l-content">
        <div className="c-accordion c-accordion--disabled">
          <div
            className={`l-content__flexContainer u-mt40 justify-space-between`}
          >
            <div>
              <div className="l-content__flexContainer">
                {data.teamIcon && data.teamIcon !== "" ? (
                  <img
                    className="u-img-rounded--small"
                    src={"https://avp-backend.com/" + data.teamIcon}
                    alt="androidLeague"
                  />
                ) : (
                  <img
                    className="u-img-rounded--small"
                    src={teamImg}
                    alt="androidLeague"
                  />
                )}

                <div className="c-accordion__btn--inactive">
                  {data.teamName}
                </div>
              </div>
            </div>
            <div>
              <span className={`js-modalBtn e-btn__plus`} onClick={handleShow}>
                <span className="e-plustext">+ </span>&nbsp;Add Player
              </span>
              <Modal
                mtype={"c-addPersonModal"}
                value={isShowing}
                onClose={handleClose}
              >
                <PlayerModal team={data.teamId} onSelect={addPlayer} />
              </Modal>
            </div>
          </div>
          <div id="c-acc_personTable">
            <div className={`c-card c-personTable`}>
              <div className="c-personTable__header">
                <div className="c-personTable__header__item">
                  <span>Name</span>
                </div>
                <div className="c-personTable__header__item">
                  <span>Captain</span>
                </div>
                <div className="c-personTable__header__item">
                  <span>Age</span>
                </div>
                <div className="c-personTable__header__item">
                  <span>Division</span>
                </div>
                <div className="c-personTable__header__item">
                  <span>Membership</span>
                </div>
                <div className="c-personTable__header__item">
                  <span> </span>
                </div>
              </div>
              {data.players.length > 0 ? (
                data.players.map((player) => (
                  <div className="c-personTable__listing" key={player.avpId}>
                    <div className="c-personTable__listing__item c-personTable__listing__item--link">
                      <img
                        className={`u-img-rounded e-playerIcon`}
                        src={
                          !player.profilePic == ""
                            ? "https://avp-backend.com/" + player.profilePic ||
                              playerImg
                            : playerImg
                        }
                        onClick={(e) => {
                          e.preventDefault;
                          handleViewPlayer(player.avpId);
                        }}
                        alt={player.firstName}
                      />
                      <span
                        className="c-personTable__cell"
                        onClick={(e) => {
                          e.preventDefault;
                          handleViewPlayer(player.avpId);
                        }}
                      >
                        {player.firstName + " " + player.lastName}
                      </span>
                    </div>
                    <div className="c-personTable__listing__item">
                      {player.captainFlag == "1" ? (
                        <img
                          className={`u-img-rounded e-captainImg`}
                          src={captain}
                        />
                      ) : (
                        <button
                          className="e-circleBtn"
                          onClick={(e) => {
                            e.preventDefault;
                            setCaptain(player.avpId, data.teamId);
                          }}
                        >
                          <img src={tick} />
                        </button>
                      )}
                    </div>
                    <div className="c-personTable__listing__item">
                      <span>{player.age}</span>
                    </div>
                    <div className="c-personTable__listing__item">
                      <span>{player.division}</span>
                    </div>
                    <div className="c-personTable__listing__item c-statusIndicator">
                      {player.avpMembershipPaymentStatus == "Paid" ? (
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
                        {player.avpMembershipPaymentStatus}
                      </span>
                    </div>
                    <div className="c-personTable__listing__item">
                      <button
                        className="e-btn js-remove"
                        onClick={(e) => {
                          e.preventDefault;
                          handleRemove(player.leagueTeamMemberId);
                        }}
                      >
                        remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`c-personTable__listing js-empty`}>
                  <span>
                    NO PLAYERS YET. Go to the dashboard to create some players.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <ToastContainer />
      </section>
    );
};

export default TeamPlayers;
