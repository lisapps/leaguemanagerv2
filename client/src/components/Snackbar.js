import React from "react";

const Snackbar = ({ text }) => {
  return (
    <div className="l-content__flexContainer--center">
      <div className={`e-snackbar`}>{text}</div>
    </div>
  );
};

export default Snackbar;
