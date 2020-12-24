import React, { useState, useEffect } from "react";
import { LeaguesContext } from "../hooks/LeaguesContext";
import axios from "axios";
import courtImg from "../../public/images/icons/icons-photo-team.svg";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const CourtsModal = ({ zip, onConfirm, onSelect, onCreate, ...props }) => {
  const initialstate = {
    courts: [],
    isLoading: true,
    errorMessage: false,
  };
  const { selectedLeague } = React.useContext(LeaguesContext);
  const [modalData, setModalData] = useState(initialstate);

  //
  useEffect(() => {
    axios({
      method: "post",
      url: server + "/loadCourtsModal",
      data: {
        lId: selectedLeague,
        zip: zip,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setModalData({ courts: res.data.courtList, isLoading: false });
        } else {
          throw res;
        }
      })
      .catch((error) => {
        console.error("court modal failed:", error);
        setModalData({
          isLoading: false,
          errorMessage:
            (error.data
              ? error.data.status
              : "No data loaded. Try logging in again.") || error.statusText,
        });
      });
  }, []);

  const handleCourt = (c) => {
    onSelect(c);
    onConfirm();
  };

  const toggleForm = () => {
    onCreate();
    onConfirm();
  };

  if (modalData.isLoading) {
    return (
      <>
        <div className="c-courtTable__header">
          <div className="c-courtTable__header__item">
            <span>Name</span>
          </div>
          <div className="c-courtTable__header__item">
            <span>Address</span>
          </div>
          <div className="c-courtTable__header__item">
            <div className="c-modalLink">
              <span className="e-btn__plus e-btn__plus--greyBtn">
                + &nbsp;Add Location
              </span>
            </div>
          </div>
        </div>
        <div className="c-courtTable" id="c-courtTable__container">
          <div className={`c-courtTable__listing u-table__listing--temp`}>
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
    return `Something went wrong in the Court Modal: ${modalData.errorMessage}`;

  if (modalData && modalData.length == 0) {
    return (
      <>
        <div className="c-courtTable__header">
          <div className="c-courtTable__header__item">
            <span>Name</span>
          </div>
          <div className="c-courtTable__header__item">
            <span>Address</span>
          </div>
          <div className="c-courtTable__header__item">
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
        <div className="c-courtTable" id="c-courtTable__container">
          <div className={`c-courtTable__listing--empty`}>
            <div className="courttable__listing__item">
              <span>NO COURTS AVAILABLE/CREATED IN THIS AREA</span>
            </div>
          </div>
        </div>
      </>
    );
  }
  if (modalData) {
    return (
      <>
        <div className="c-courtTable__header">
          <div className="c-courtTable__header__item">
            <span>Name</span>
          </div>
          <div className="c-courtTable__header__item">
            <span>Address</span>
          </div>
          <div className="c-courtTable__header__item">
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
        <div className="c-courtTable" id="c-courtTable__container">
          {modalData.courts.map((court) => (
            <div className={`c-courtTable__listing`} key={court.courtId}>
              <div className="c-courtTable__listing__item">
                <img
                  className="u-img-rounded"
                  src={
                    court.courtImage
                      ? "https://avp-backend.com/" + court.courtImage
                      : courtImg
                  }
                />
                <span>{court.courtName}</span>
              </div>

              <div className="c-courtTable__listing__item">
                <span>
                  {court.address +
                    " " +
                    court.city +
                    ", " +
                    court.stateCode +
                    " " +
                    court.zip}
                </span>
              </div>
              <div className="c-courtTable__listing__item">
                <button
                  className="e-btn__court"
                  type="button"
                  onClick={() => handleCourt(court)}
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

export default CourtsModal;
