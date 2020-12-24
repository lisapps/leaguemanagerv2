import React, { useState, useEffect } from "react";
import teamImg from "../../public/images/icons/icons-photo-team.svg";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const SchedTab = ({ divisions, update }) => {
  const initialstate = {
    isLoading: true,
    errorMessage: false,
    isSubmitting: false
  };

  const [data, setData] = useState(initialstate);

  useEffect(() => {
    let tempDiv = [];
    if (divisions)
      divisions.map((division, index) => {
        let t = division.teamsList;
        const courtnums = [...new Set(t.map((team) => team.courtNumber))];
        courtnums.map((num) => {
          let courtTeams = [];
          courtTeams = t.filter((team) => (team.courtNumber = num));

          let courtObj = {};
          courtObj = {
            court: num,
            teams: courtTeams,
          };

          let courtList = [];
          courtList.push(courtObj);

          let newDiv = {};
          newDiv = { ...division, courtList };

          tempDiv.push(newDiv);
        });

        setData({
          ...data,
          isLoading: false,
          divis: tempDiv,
        });
      });
  }, [divisions]);

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

  const handleDupe = (court, divId) => {
    setData({
      ...data,
      isSubmitting: true,
    });
    axios({
      method: "post",
      url: server + "/dupe-round",
      data: {
        cid: court,
        did: divId,
      },
      withCredentials: true,
    })
      .then((res) => {
        if (res.data.status == "Success") {
          setData({
            ...data,
            errorMessage: false,
            isSubmitting: false,
          });
          notify("Round duplicated.");
          update();
        } else {
          throw error;
        }
      })
      .catch((error) => {
        console.error("Duplicate round failed:", error);
        setData({
          ...data,
          isSubmitting: false,
          errorMessage:
            (error.data ? error.data.status : "Try logging in again.") ||
            error.statusText,
        });
        notify("There was a problem.");
      });
  };

  if (divisions == undefined) return <p>Schedule Locked</p>;
  if (data.isLoading || !data.divis) return "...Loading"
  if (data.divis.length > 0 && !data.isLoading)
    return (
      <div
        className={`l-content__flexContainer l-content__flexContainer--column u-mt35 u-animated u-animated--faster fadeIn`}
      >
        <div className="c-schedule">
          {data.divis.map((division, index) => (
            <div className="l-divisionContainer" key={index}>
              <span className="c-schedule__dateTime">
                {division.playDate + " "}
              </span>
              {division.maxScore == "60 mins" ? (
                <span
                  className={`c-schedule__setsPoints tooltip--top`}
                  aria-label="Sets and Point are editable in Results."
                >
                  {"Timed Match"}
                </span>
              ) : (
                <span
                  className={`c-schedule__setsPoints tooltip--top`}
                  aria-label="Sets and Point are editable in Results."
                >
                  {division.maxScore}
                </span>
              )}
              <div
                className={
                  `c-schedule__divTitle c-schedule__divTitle--` + index
                }
              >
                {division.division + ` Division`}
              </div>
              {division.courtList.map((ct, index) => (
                <div className="c-schedule__court" key={index}>
                  <div
                    className={`l-content__flexContainer l-content__flexContainer--row justify-space-between`}
                  >
                    <span className="e-courtTitle">{`Court ` + ct.court}</span>
                    <div
                      className="e-duplicate"
                      onClick={() => handleDupe(ct.court, division.divisionId)}
                      disabled={data.isSubmitting}
                    >
                      duplicate round
                    </div>
                  </div>
                  {ct.teams.map((team, index) => (
                    <div className="c-scheduleTable c-card" key={index}>
                      <div className="c-scheduleTable__listing" key={index}>
                        <div className="c-scheduleTable__listing__item">
                          <span>{`R ` + team.round}</span>
                        </div>
                        <div className="c-scheduleTable__listing__item">
                          <img
                            className="u-img-rounded"
                            src={
                              team.teamAProfilePicture
                                ? "https://avp-backend.com/" +
                                  team.teamAProfilePicture
                                : teamImg
                            }
                            alt={team.teamAName}
                          />
                          <span className="c-setScheduleTable__cell">
                            {team.teamAName}
                          </span>
                        </div>
                        <div className="c-scheduleTable__listing__item">
                          <span className="c-scheduleTable__listing__cell">
                            {team.teamAStandings}
                          </span>
                        </div>
                        <div className="c-scheduleTable__listing__item">
                          <span className="c-scheduleTable__listing__cell--vs">
                            VS
                          </span>
                        </div>
                        <div className="c-scheduleTable__listing__item">
                          <img
                            className="u-img-rounded"
                            src={
                              team.teamBProfilePicture
                                ? "https://avp-backend.com/" +
                                  team.teamBProfilePicture
                                : teamImg
                            }
                            alt={team.teamBName}
                          />
                          <span className="c-setScheduleTable__cell">
                            {team.teamBName}
                          </span>
                        </div>
                        <div className="c-scheduleTable__listing__item">
                          <span className="c-scheduleTable__listing__cell">
                            {team.teamBStandings}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
        <ToastContainer />
      </div>
    );
};

export default SchedTab;
