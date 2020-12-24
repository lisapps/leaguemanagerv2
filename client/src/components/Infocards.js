import React from "react";
import convertUTCTIME from "../libs/convertUTCTime";
import map from "../../public/images/icons/map.svg";
import teams from "../../public/images/icons/teams.svg";
import players from "../../public/images/icons/players.svg";
import calendar from "../../public/images/icons/calendar.svg";
import clock from "../../public/images/icons/clock.svg";
import star from "../../public/images/icons/star.svg";
import { setCookie } from "../libs/cookie";
import { useHistory } from "react-router-dom";

const Infocards = ({ children }) => {
  const lDay = (num) => {
    switch (num) {
      case "20":
        return "Monday";
      case "21":
        return "Tuesday";
      case "22":
        return "Wednesday";
      case "23":
        return " Thursday";
      case "24":
        return "Friday";
      case "25":
        return "Saturday";
      case "26":
        return "Sunday";
    }
  };

  const lStatus = (stat) => {
    switch (stat) {
      case "1":
        return "Creating";
      case "2":
        return "Reg Open";
      case "3":
        return "Reg Closed";
    }
  };

  let history = useHistory();

  const handleView = (id) => {
    setCookie("currentLid", id, 1);
    history.push("/admin/view-league");
  };

  return (
    <div
      className={`l-content__flexContainer u-mb25 l-content__flexContainer--wrap`}
    >
      <div className={`c-card c-card__md c-infobox`}>
        <div className="c-infobox__listing">
          <div className="c-infobox__listing--left">
            <img className="c-card__icon" src={map} />
            <span className="c-card__title">Location</span>
          </div>
          <div className="c-infobox__listing--right">
            <span>
              {children.city},{children.state}
              {children.zip}
            </span>
          </div>
        </div>
        <div className="c-infobox__listing">
          <div className="c-infobox__listing--left">
            <img className="c-card__icon" src={teams} />
            <span className="c-card__title">Total Teams</span>
          </div>
          <div className="c-infobox__listing--right">
            <span>{children.totalTeams}</span>
          </div>
        </div>
        <div className="c-infobox__listing">
          <div className="c-infobox__listing--left">
            <img className="c-card__icon" src={players} />
            <span className="c-card__title">Registered Players</span>
          </div>
          <div className="c-infobox__listing--right">
            <span>{children.registeredPlayers}</span>
          </div>
        </div>
        <div className="c-infobox__listing">
          <div className="c-infobox__listing--left">
            <img className="c-card__icon" src={players} />
            <span className="c-card__title">Registration Deadline</span>
          </div>
          <div className="c-infobox__listing--right">
            <span>{children.registrationDeadline}</span>
          </div>
        </div>
      </div>
      <div className={`l-content__flexContainer--column`}>
        <div className={`c-card c-card__md c-infobox`}>
          <div className="c-infobox__listing">
            <div className="c-infobox__listing--left">
              <img className="c-card__icon" src={calendar} />
              <span className="c-card__title">Start/End</span>
            </div>
            <div className="c-infobox__listing--right">
              <span>
                {children.startDate} - {children.endDate}
              </span>
            </div>
          </div>
          <div className="c-infobox__listing">
            <div className="c-infobox__listing--left">
              <img className="c-card__icon" src={clock} />
              <span className="c-card__title">League Time</span>
            </div>
            <div className="c-infobox__listing--right">
              <span>{convertUTCTIME(children.leaguePlayTime)}</span>
            </div>
          </div>
          <div className="c-infobox__listing">
            <div className="c-infobox__listing--left">
              <img className="c-card__icon" src={star} />
              <span className="c-card__title">League Day</span>
            </div>
            <div className="c-infobox__listing--right">
              <span>{lDay(children.leagueDay)}</span>
            </div>
          </div>
        </div>
        <span className={`e-btn__plus e-btn__plus--view`}>
          <span className="e-plustext">+ </span>
          <span onClick={() => handleView(children.leagueId)}>
            View League
          </span>{" "}
          / {lStatus(children.leagueStatus)}
        </span>
      </div>
    </div>
  );
};

export default Infocards;
