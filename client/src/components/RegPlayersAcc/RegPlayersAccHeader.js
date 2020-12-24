import React from "react";
import tIcon from "../../../public/images/icons/icons-photo-team.svg";

const RegTeamsAccHeader = ({ children, ...props }) => {
  return (
    // add context to compare to activekey, if match add active class for triangle button turn. children[2] adds active class
    <div
      key={children[0].teamId}
      className={`c-accordion c-accordion--players c-accordion--border`}
      {...props}
    >
      <div className="l-content__flexContainer">
        <img
          className="u-img-rounded--small"
          src={
            !children[0].teamIcon == ""
              ? `https://avp-backend.com/` + children[0].teamIcon
              : tIcon
          }
        />
        <button
          className={
            children[1]
              ? `c-accordion__btn c-accordion__btn--playertab`
              : `c-accordion__btn c-accordion__btn--playertab ` + children[2]
          }
        >
          {children[0].teamName}
        </button>
      </div>
    </div>
  );
};

export default RegTeamsAccHeader;
