import React, { useState } from "react";
import TeamsSetupAccHeader from "./TeamsSetupAccHeader";
import TeamsSetupAccBody from "./TeamsSetupAccBody";

const TeamsSetupAcc = ({ children }) => {
  //children are actually the Accordion.toggle and collapse components
  return <div className="c-accordion">{children}</div>;
};

TeamsSetupAcc.Header = TeamsSetupAccHeader;
TeamsSetupAcc.Body = TeamsSetupAccBody;

export default TeamsSetupAcc;
