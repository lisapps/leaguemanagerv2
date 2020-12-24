import React, { useState, useEffect } from "react";
import axios from "axios";
import playerImg from "../../public/images/icons/icons-photo-person.svg";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const PlayerModal = ({ team, onConfirm, onSelect, onCreate, ...props }) => {
  const initialstate = {
    players: [],
    isLoading: true,
    errorMessage: false,
  };

  const [modalData, setModalData] = useState(initialstate);

  useEffect(() => {
    axios({
      method: "post",
      url: server + "/loadPlayerModal",
      data: {
        tId: team,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setModalData({ players: res.data.poolplayersList, isLoading: false });
        } else {
          throw res;
        }
      })
      .catch((error) => {
        setModalData({
          isLoading: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "No data loaded. Try logging in again.") || error.statusText,
        });
      });
  }, []);

  const handleAddPlayer = (p) => {
    onSelect(p);
    onConfirm();
  };

  const toggleForm = () => {
    onCreate();
    onConfirm();
  };

  if (modalData.isLoading) {
    return (
      <>
        <div className="c-personTable__header">
          <div className="c-personTable__header__item">
            <span>Name</span>
          </div>
          <div className="c-personTable__header__item">
            <span>Address</span>
          </div>
          <div className="c-personTable__header__item">
            <div className="c-modalLink">
              <span className="e-btn__plus e-btn__plus--greyBtn">
                + &nbsp;Add Location
              </span>
            </div>
          </div>
        </div>
        <div className="c-personTable" id="c-personTable__container">
          <div className={`c-personTable__listing u-table__listing--temp`}>
            <div className="u-table__listing__item">
              <span></span>
            </div>
            <div className="u-table__listing__item">
              <span></span>
            </div>
            <div className="u-table__listing__item">
              <span></span>
            </div>
          </div>
        </div>
      </>
    );
  }
  if (modalData.errorMessage)
    return `Something went wrong in the Teams Modal: ${modalData.errorMessage}`;

  if (modalData && modalData.length == 0) {
    return (
      <>
        <div className="c-personTable__header">
          <div className="c-personTable__header__item">
            <span>Name</span>
          </div>
          <div className="c-personTable__header__item">
            <span>Address</span>
          </div>
          <div className="c-personTable__header__item">
            <div className="c-modalLink">
              <span
                className="e-btn__plus e-btn__plus--greyBtn"
                onClick={toggleForm}
              >
                + &nbsp;Add Location
              </span>
            </div>
          </div>
        </div>
        <div className="c-personTable" id="c-personTable__container">
          <div className={`c-personTable__listing--empty`}>
            <div className="personTable__listing__item">
              <span>NO PLAYERS AVAILABLE IN THIS LEAGUE</span>
            </div>
          </div>
        </div>
      </>
    );
  }
  if (modalData) {
    return (
      <>
        <div className="c-personTable__header">
          <div className="c-personTable__header__item c-personTable__header__item--modal">
            <span>Name</span>
          </div>
          <div className="c-personTable__header__item c-personTable__header__item--modal">
            <span>Age</span>
          </div>
          <div className="c-personTable__header__item c-personTable__header__item--modal">
            <span>Division</span>
          </div>
          <div className="c-personTable__header__item c-personTable__header__item--modal">
            <span>Membership</span>
          </div>
        </div>
        <div className="c-personTable" id="c-playerTable__container">
          {modalData.players.length > 0 ? (
            modalData.players.map((player) => (
              <div className={`c-personTable__listing`} key={player.avpId}>
                <div className="c-personTable__listing__item c-personTable__listing__item--modal">
                  <img
                    className="u-img-rounded"
                    src={
                      player.profilePic
                        ? "https://avp-backend.com/" + player.profilePic
                        : playerImg
                    }
                  />
                  <span>{player.firstName + " " + player.lastName}</span>
                </div>

                <div className="c-personTable__listing__item c-personTable__listing__item--modal">
                  <span>{player.age}</span>
                </div>
                <div className="c-personTable__listing__item">
                  <span>{player.divisionName}</span>
                </div>
                <div className="c-personTable__listing__item c-statusIndicator">
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
                  <span>{player.paymentStatus}</span>
                </div>
                <div className="c-personTable__listing__item c-personTable__listing__item--modal">
                  <button
                    className="e-btn__add"
                    onClick={(e) => {
                      e.preventDefault;
                      onSelect(player);
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="c-personTable__listing">
              <span>
                NO PLAYERS YET. Go to the dashboard to create a player.
              </span>
            </div>
          )}
        </div>
      </>
    );
  }
};

export default PlayerModal;
