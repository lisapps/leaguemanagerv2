import React, { useState } from "react";
import ByeButton from "./ByeButton";
import teamImg from "../../public/images/icons/icons-photo-team.svg";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const ByeTab = ({ divisions, next }) => {
  const initialstate = {
    isLoading: true,
    errorMessage: false,
  };

  const [data, setData] = useState(initialstate);
  const [byeTeams, setByeTeams] = useState([]);

  const resetBye = () => setByeTeams([]);

  //-- adds and removes id from state array to send to bye teams api
  const handleByeClick = (id) => {
    if (byeTeams.includes(id)) {
      let index = byeTeams.indexOf(id);
      let arr = [...byeTeams];
      if (index !== -1) {
        arr.splice(index, 1);
        setByeTeams([...arr]);
      }
    } else {
      setByeTeams([...byeTeams, id]);
    }
  };

  const notify = (txt) =>
    toast.dark(txt, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    });

  const sendBye = () => {
    let bt = byeTeams;

    byeTeams.length > 0 ? (bt = byeTeams.join()) : (bt = "");

    axios({
      method: "post",
      url: server + "/bye-teams",
      data: {
        teams: bt,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          notify("Bye teams set.");
          setTimeout(function () {
            next();
          }, 3200);
        } else {
          throw res;
        }
      })
      .catch((error) => {
        notify("Bye not set. There was a problem.");
      });
  };

  if (divisions == undefined) return <p>Bye Locked</p>;
  return (
    <div
      className={`l-content__flexContainer l-content__flexContainer--column u-mt35 u-animated u-animated--faster fadeIn`}
    >
      <div className="c-bye">
        {divisions.map((division) => (
          <div className="l-divisionContainer" key={division.divisionId}>
            <span className="c-bye__dateTime">{division.playDate + " "}</span>
            {/* <span
              className={`c-bye__setsPoints tooltip--top`}
              aria-label="Sets and Point are editable in Results."
            >
              {division.playDate}
            </span> */}
            {division.maxScore == "60 mins" ? (
              <span
                className={`c-bye__setsPoints tooltip--top`}
                aria-label="Sets and Point are editable in Results."
              >
                {"Timed Match"}
              </span>
            ) : (
              <span
                className={`c-bye__setsPoints tooltip--top`}
                aria-label="Sets and Point are editable in Results."
              >
                {division.maxScore}
              </span>
            )}
            <div className="c-bye__divTitle">{division.division} Division</div>
            <div className="c-bye__division">
              <div className={`c-card c-byeTable`}>
                <div className="c-byeTable__header">
                  <div className="c-byeTable__header__item">
                    <span>Teams</span>
                  </div>
                  <div className="c-byeTable__header__item">
                    <span>Record</span>
                  </div>
                  <div className="c-byeTable__header__item">
                    <span>Participation</span>
                  </div>
                </div>
                {division.teamsList.map((team) => (
                  <div className="c-byeTable__listing" key={team.teamId}>
                    <div className="c-byeTable__listing__item">
                      <img
                        className="u-img-rounded"
                        src={
                          team.teamProfilePic
                            ? "https://avp-backend.com/" + team.teamProfilePic
                            : teamImg
                        }
                        alt={team.teamName}
                      />
                      <span className="c-byeTable__cell">{team.teamName}</span>
                    </div>
                    <div className="c-byeTable__listing__item">
                      <span className="e-indicatorText">{team.teamName}</span>
                    </div>
                    <div className="c-byeTable__listing__item">
                      <ByeButton
                        byeclick={handleByeClick}
                        id={team.teamId}
                        bye={team.bye}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <ToastContainer />
      </div>
      <span className={`l-content__flexContainer--right u-sticky__bottomBtns`}>
        <button
          className={`e-btn--small e-btn--secondary`}
          onClick={resetBye}
          type="button"
          disabled={data.isSubmitting}
        >
          cancel
        </button>
        <button
          className="e-btn--small"
          type="button"
          disabled={data.isSubmitting}
          onClick={sendBye}
        >
          {data.isSubmitting ? "Sending..." : "Next"}
        </button>
      </span>
    </div>
  );
};

export default ByeTab;
