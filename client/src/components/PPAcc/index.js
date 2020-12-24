import React, { useState } from "react";
import PPAccHeader from "./PPAccHeader";
import PPAccBody from "./PPAccBody";

const PPAcc = ({ children }) => {
  //children are actually the Accordion.toggle and collapse components
  return <div className="c-accordion">{children}</div>;
};

PPAcc.Header = PPAccHeader;
PPAcc.Body = PPAccBody;

export default PPAcc;
