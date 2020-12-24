import React from "react";
import Infocards from "../Infocards";

const LeagueAccBody = ({ children, ...props }) => {
  return (
    <div
      className={`c-accordion__panel u-animated u-animated--faster a-fadeIn`}
      key={children.leagueId}
      {...props}
    >
      <Infocards children={children} />
    </div>
  );
};

export default LeagueAccBody;
