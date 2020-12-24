import React from "react";

import RegPlayersAccHeader from "./RegPlayersAccHeader";
import RegPlayersAccBody from "./RegPlayersAccBody";

const RegPlayersAcc = ({ children }) => {
  return <div className="c-accordion">{children}</div>;
};

RegPlayersAcc.Header = RegPlayersAccHeader;
RegPlayersAcc.Body = RegPlayersAccBody;

export default RegPlayersAcc;
