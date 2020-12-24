import React from "react";

import ResStandingsAccHeader from "./ResStandingsAccHeader";
import ResStandingsAccBody from "./ResStandingsAccBody";

const ResStandingsAcc = ({ children }) => {
  return <div className="c-accordion">{children}</div>;
};

ResStandingsAcc.Header = ResStandingsAccHeader;
ResStandingsAcc.Body = ResStandingsAccBody;

export default ResStandingsAcc;
