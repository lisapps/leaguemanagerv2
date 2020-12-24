import React, { useState, useEffect } from "react";
import axios from "axios";
import playerImg from "../../../public/images/icons/icons-photo-person.svg";
import RemindPlayerButton from "./RemindPlayerButton";
import dotenv from "dotenv";
import { useHistory } from "react-router-dom";
import { setCookie } from "../../libs/cookie";

dotenv.config();
var server = process.env.API_URL;

const RegPlayersAccBody = ({ children, ...props }) => {
  const initialstate = {
    players: [],
    isLoading: true,
    errorMessage: false,
  };
  const [data, setData] = useState(initialstate);

  let history = useHistory();

  function handleViewPlayer(pid) {
    if (pid) {
      setCookie("currentPid", pid, 1);
      history.push("/teams/view-player");
    }
  }

  useEffect(() => {
    axios({
      method: "post",
      url: server + "/loadRegPlayers",
      data: {
        teamId: children.teamId,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setData({
            players: res.data.teamPlayersList,
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
              : "There was a problem loading Players.") || error.statusText,
        });
      });
  }, []);

  if (data.isLoading)
    return (
      <div
        className={`c-accordion__panel c-card c-personTable u-animated u-animated--faster a-fadeIn`}
      >
        <div className="c-personTable__header">
          <div className="c-personTable__header__item">
            <span>Name</span>
          </div>
          <div className="c-personTable__header__item">
            <span>Age</span>
          </div>
          <div className="c-personTable__header__item">
            <span>Experience</span>
          </div>
          <div className="c-personTable__header__item">
            <span>Membership</span>
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
  if (data.errorMessage)
    return `Something went wrong in Players: ${data.errorMessage}`;
  if (data.players.length <= 0)
    return (
      <div
        className={`c-accordion__panel c-card c-personTable u-animated u-animated--faster a-fadeIn`}
        key={children.teamId}
      >
        <div className="c-personTable__header">
          <div className="c-personTable__header__item">
            <span>Name</span>
          </div>
          <div className="c-personTable__header__item">
            <span>Age</span>
          </div>
          <div className="c-personTable__header__item">
            <span>Experience</span>
          </div>
          <div className="c-personTable__header__item">
            <span>Membership</span>
          </div>
        </div>
        <div className={`c-personTable__listing js-empty`}>
          <span>NO PLAYERS YET</span>{" "}
        </div>
      </div>
    );
  if (data.players !== [])
    return (
      <div
        className={`c-accordion__panel c-card c-personTable u-animated u-animated--faster a-fadeIn`}
        key={children.teamId}
      >
        <div className="c-personTable__header">
          <div className="c-personTable__header__item">
            <span>Name</span>
          </div>
          <div className="c-personTable__header__item">
            <span>Age</span>
          </div>
          <div className="c-personTable__header__item">
            <span>Experience</span>
          </div>
          <div className="c-personTable__header__item">
            <span>Membership</span>
          </div>
        </div>
        {data.players.map((player) => (
          <div
            className="c-personTable__listing"
            key={player.leagueTeamMemberId}
          >
            <div className="c-personTable__listing__item c-personTable__listing__item--link">
              <img
                className="u-img-rounded"
                src={
                  player.profilePic
                    ? "https://avp-backend.com/" + player.profilePic
                    : playerImg
                }
                onClick={(e) => {
                  e.preventDefault;
                  handleViewPlayer(player.avpId);
                }}
              />
              <span
                className="c-personTable__cell"
                onClick={(e) => {
                  e.preventDefault;
                  handleViewPlayer(player.avpId);
                }}
              >
                {player.firstName} {player.lastName}
              </span>
            </div>
            <div className="c-personTable__listing__item">
              <span>{player.age}</span>
            </div>
            <div className={`c-personTable__listing__item`}>
              {player.division}
            </div>
            <div className={`c-personTable__listing__item c-statusIndicator`}>
              {player.paymentStatus == "Paid" ? (
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
              <span className="e-indicatorText">{player.paymentStatus}</span>
            </div>
            <div className="c-personTable__listing__item ">
              {/* {player.paymentStatus == "Not Paid" ? (
                <button className="e-btn" onClick={remindTeam}>
                  remind
                </button>
              ) : (
                <button className="e-btn--secondary"></button>
              )} */}
              {/* <RemindTeamButton paid={player.paymentStatus} id={player.teamId} /> */}
              <span>Stripe here</span>
            </div>
          </div>
        ))}
      </div>
    );
};

export default RegPlayersAccBody;
