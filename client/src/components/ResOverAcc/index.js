import React, { useState } from "react";
import ROHeader from "./ROAccHeader";
import ROBody from "./ROAccBody";

const RO = ({ children }) => {
  //children are actually the Accordion.toggle and collapse components
  return <div className="c-accordion">{children}</div>;
};

RO.Header = ROHeader;
RO.Body = ROBody;

export default RO;
