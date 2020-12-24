import React, { useState, useEffect } from "react";
import axios from "axios";
import teamImg from "../../../public/images/icons/icons-photo-team.svg";
import dotenv from "dotenv";

dotenv.config();
var server = process.env.API_URL;

const ResStandingsAccBody = ({ children, ...props }) => {
  let data = children.teamsList;

  if (data.length !== 0)
    return (
      <div
        className={`c-accordion__panel c-teamTable u-animated u-animated--faster a-fadeIn`}
        key={children.divisionId}
      >
        {data.map((team, index) => (
          <div
            className={`l-content__flexContainer u-mb25 justify-center`}
            key={team.teamId}
          >
            <span className="e-rank">{index + 1}</span>
            <div
              className={`c-match__results c-match__results--standings c-card c-card__sm e-match__teamStandings`}
            >
              <div className={`e-match__team e-match__team`}>
                <div className="e-standings__cell">
                  <img
                    className="u-img-rounded"
                    src={
                      team.teamProfilePic
                        ? "https://avp-backend.com/" + team.teamProfilePic
                        : teamImg
                    }
                  />
                  <span className="e-match__teamName">{team.teamName}</span>
                </div>
                <span className="e-match__teamStandings">
                  {team.teamStandings}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  if (data.length == 0)
    return (
      <div
        className={`l-content__flexContainer--center u-h3_inactive c-accordion__panel--empty`}
      >
        No Standings found.
      </div>
    );
};

export default ResStandingsAccBody;
