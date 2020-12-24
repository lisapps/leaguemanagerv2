import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import teamImg from "../../../public/images/icons/icons-photo-team.svg";

const ViewMatchOverview = ({ data, removeBtn, handleRemove }) => {
  const [matchEdits, setMatchEdits] = useState({});

  return (
    <>
      <div
        className={`c-accordion__panel c-teamTable u-animated u-animated--faster a-fadeIn ${
          removeBtn ? "remove-active" : ""
        }`}
      >
        {data.map((match, i) => (
          <div key={match.leagueMatchId}>
            <div className="c-match__date">{match.leagueMatchDate}</div>
            <div
              className={`l-content__flexContainer l-content__flexContainer--row u-mb15`}
            >
              {removeBtn ? (
                <div className={`l-content__flexContainer u-alignItemsCenter`}>
                  <div
                    className={`e-btn__x e-btn__x--matches`}
                    onClick={(e) => handleRemove(match.leagueMatchId)}
                  ></div>
                </div>
              ) : (
                ""
              )}
              <div
                className={
                  `c-match__results c-match__results--scores c-card` +
                  (match.disputed == 1 ? ` c-match__results--disputed` : "")
                }
              >
                <div className="e-match__overview">
                  <div className="e-score__cell">
                    <img
                      className="u-img-rounded"
                      src={
                        match.teamAProfilePicture
                          ? "https://avp-backend.com/" +
                            match.teamAProfilePicture
                          : teamImg
                      }
                    />
                    <span className="e-match__teamName">{match.teamAName}</span>
                  </div>
                  <div
                    className={
                      `e-match__score` +
                      (match.teamAScore < match.teamBScore
                        ? ` e-match__score--lose`
                        : match.teamAScore > match.teamBScore
                        ? ` e-match__score--win`
                        : "")
                    }
                  >
                    <span>{match.teamAScore}</span>
                  </div>
                  <div className="e-match__center">VS</div>
                  <div
                    className={
                      `e-match__score` +
                      (match.teamBScore < match.teamAScore
                        ? ` e-match__score--lose`
                        : match.teamBScore > match.teamAScore
                        ? ` e-match__score--win`
                        : "")
                    }
                  >
                    <span>{match.teamBScore}</span>
                  </div>
                  <div className={`e-score__cell e-score__cell--end`}>
                    <span
                      className={`e-match__teamName e-match__teamName--right`}
                    >
                      {match.teamBName}
                    </span>
                    <img
                      className="u-img-rounded"
                      src={
                        match.teamBSProfilePicture
                          ? "https://avp-backend.com/" +
                            match.teamBProfilePicture
                          : teamImg
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ToastContainer />
    </>
  );
};

export default ViewMatchOverview;
