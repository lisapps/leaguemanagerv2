import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { setCookie } from "../../libs/cookie";

const PlayersButton = ({ team }) => {
  let history = useHistory();

  const handleClick = (teamdata) => {
    var teamString = JSON.stringify(teamdata);
    setCookie("currentTeam", teamString, 1);
    history.push("/teams/team-players");
  };
  var teamdata = team;

  return (
    <>
      <button className="e-btn" onClick={(e) => handleClick(teamdata)}>
        players
      </button>
    </>
  );
};

export default PlayersButton;
