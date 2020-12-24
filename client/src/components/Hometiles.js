import React from "react";
import { Link } from "react-router-dom";
import player from "../../public/images/icons/icon-qs-player.svg";
import teams from "../../public/images/icons/qs-team.svg";
import leagueIcon from "../../public/images/icons/qs-league.svg";

export const Hometiles = ({ leagues }) => {
  const locked = (ls) => (ls ? "" : ` c-dashboardLink--locked`);

  return (
    <>
      <div
        className={`l-content__row l-content__row--even l-content__row--border`}
        id="dashboard-btns"
      >
        <div className={`c-dashboardLink` + locked(leagues)}>
          <Link to="/teams/create-player">
            <img
              className="c-dashboardLink__icon"
              src={player}
              alt="Create Player"
            />
            <span className="e-plustext">
              <span className="e-plustext">+ </span> Create Player
            </span>
          </Link>
        </div>
        <div className={`c-dashboardLink` + locked(leagues)}>
          <Link to="/teams/create-team">
            <img
              className="c-dashboardLink__icon"
              src={teams}
              alt="Create Teams"
            />
            <span className="e-plustext">
              <span className="e-plustext">+ </span> Add Team
            </span>
          </Link>
        </div>
        <div className="c-dashboardLink">
          <Link to="/admin/create-league">
            <img
              className="c-dashboardLink__icon"
              src={leagueIcon}
              alt="Create League"
            />
            <span className="e-plustext">
              <span className="e-plustext">+ </span> New League
            </span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Hometiles;
