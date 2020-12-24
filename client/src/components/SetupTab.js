import React, { useCallback, useState } from "react";
import teamImg from "../../public/images/icons/icons-photo-team.svg";
import SetupDDmenu from "./DDmenu/SetupDDmenu";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const SetupTab = ({ divisions, update }) => {

  const initialstate = {
    isSubmitting: false,
    errorMessage: false,
  };

  const [data, setData] = useState(initialstate);
  const changeCourt = useCallback((tid, court) => {
    handleCourtChange(court, tid);
  }, []);

  const handleCourtChange = (court, tid) => {
    axios({
      method: "post",
      url: server + "/change-court",
      data: {
        courtId: court,
        teamId: tid,
      },
      withCredentials: true,
    })
      .then((res) => {
        update();
        if (res.data.status == "Success") {
          notify("Team moved.");
        } else {
          throw res;
        }
      })
      .catch((error) => {
        notify("Team not moved. There was a problem.");
      });
  };

  const sendGen = () => {
    setData({
      ...data,
      isSubmitting: true,
    });
    axios(server + "/generate", {
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setData({
            errorMessage: false,
          });
          update();
        } else {
          throw res;
        }
      })
      .catch((error) => {
        console.error("Generate schedule failed:", error);
        setData({
          isSubmitting: false,
          errorMessage:
            (error.data ? error.data.status : "Try logging in again.") ||
            error.statusText,
        });
      });
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

  if (divisions == undefined) return <p>Setup Locked</p>;
  if (divisions.length > 0)
    return (
      <div
        className={`l-content__flexContainer l-content__flexContainer--column u-mt35 u-animated u-animated--faster fadeIn`}
      >
        <div className="c-setSchedule">
          {divisions.map((division, index) => (
            <div className="l-divisionContainer" key={division.divisionId}>
              <span className="c-setSchedule__dateTime">
                {division.playDate + " "}
              </span>
              {division.maxScore == "60 mins" ? (
                <span
                  className={`c-setSchedule__setsPoints tooltip--top`}
                  aria-label="Sets and Point are editable in Results."
                >
                  {"Timed Match"}
                </span>
              ) : (
                <span
                  className={`c-setSchedule__setsPoints tooltip--top`}
                  aria-label="Sets and Point are editable in Results."
                >
                  {division.maxScore}
                </span>
              )}
              <div
                className={`c-setSchedule__divTitle ${
                  `c-setSchedule__divTitle--` + index
                }`}
              >
                {division.division} Division
              </div>
              {division.courtList.map((court) => (
                <div key={court.courtNo}>
                  <div className={`c-setSchedule__courtTitle u-mb15`}>
                    {`Court ` + court.courtNo}
                  </div>
                  <div className={`c-card c-setScheduleTable`}>
                    <div className="c-setScheduleTable__header">
                      <div className="c-setScheduleTable__header__item">
                        <span>Teams</span>
                      </div>
                      <div className="c-setScheduleTable__header__item">
                        <span>Record</span>
                      </div>
                      <div className="c-setScheduleTable__header__item">
                        <span>Rounds</span>
                      </div>
                      <div className="c-setScheduleTable__header__item">
                        <span>Assigned To</span>
                      </div>
                    </div>
                    {court.teamsList && court.teamsList.length > 0 ? (
                      court.teamsList.map((team) => (
                        <div
                          className="c-setScheduleTable__listing"
                          key={team.teamId}
                        >
                          <div className="c-setScheduleTable__listing__item">
                            <img
                              className="u-img-rounded"
                              src={
                                team.teamProfilePic
                                  ? "https://avp-backend.com/" +
                                    team.teamProfilePic
                                  : teamImg
                              }
                              alt={team.teamName}
                            />
                            <span className="c-setScheduleTable__cell">
                              {team.teamName}
                            </span>
                          </div>
                          <div className="c-setScheduleTable__listing__item">
                            <span className="e-indicatorText">
                              {team.standings}
                            </span>
                          </div>
                          <div className="c-setScheduleTable__listing__item">
                            <span className="e-indicatorText">
                              {team.round}
                            </span>
                          </div>
                          <SetupDDmenu
                            start={division.courtStartNumber}
                            available={division.courtsAvailable}
                            selCallBack={changeCourt}
                            court={court.courtNo}
                            team={team.teamId}
                          />
                        </div>
                      ))
                    ) : (
                      <p>No teams playing in this division.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <ToastContainer />
        <span
          className={`l-content__flexContainer--right u-sticky__bottomBtns`}
        >
          <button
            className="e-btn--small"
            type="button"
            disabled={data.isSubmitting}
            onClick={sendGen}
          >
            {data.isSubmitting ? "Sending..." : "Generate"}
          </button>
        </span>
      </div>
    );
  return <p>Nothing to set up.</p>;
};

export default SetupTab;
