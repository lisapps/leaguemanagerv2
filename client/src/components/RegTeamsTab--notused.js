import React from "react";

const RegTeamsTab = () => {
  <ul className="l-tabcontainer">
    <li className={`e-tabBtn currentTab`} id="tabA">
      Teams
    </li>
    <li className="e-tabBtn" onclick="showTeamsTab(e)" id="tabB">
      Players
    </li>
  </ul>;
};

export default RegTeamsTab;
