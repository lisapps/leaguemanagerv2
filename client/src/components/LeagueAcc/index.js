import React from "react";

import LeagueAccHeader from "./LeagueAccHeader";
import LeagueAccBody from "./LeagueAccBody";

const LeagueAcc = ({ children }) => {
  return <div className="c-accordion">{children}</div>;
};

LeagueAcc.Header = LeagueAccHeader;
LeagueAcc.Body = LeagueAccBody;

export default LeagueAcc;
