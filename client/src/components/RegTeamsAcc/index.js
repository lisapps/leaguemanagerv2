import React from "react";

import RegTeamsAccHeader from "./RegTeamsAccHeader";
import RegTeamsAccBody from "./RegTeamsAccBody";

const RegTeamsAcc = ({ children }) => {
  return <div className="c-accordion">{children}</div>;
};

RegTeamsAcc.Header = RegTeamsAccHeader;
RegTeamsAcc.Body = RegTeamsAccBody;

export default RegTeamsAcc;
