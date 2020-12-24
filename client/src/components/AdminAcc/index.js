import React, { useState } from "react";
import AdminAccHeader from "./AdminAccHeader";
import AdminAccBody from "./AdminAccBody";

const AdminAcc = ({ children }) => {
  //children are actually the Accordion.toggle and collapse components
  return <div className="c-accordion">{children}</div>;
};

AdminAcc.Header = AdminAccHeader;
AdminAcc.Body = AdminAccBody;

export default AdminAcc;
