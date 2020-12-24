import React from "react";
import lIcon from "../../../public/images/icons/icons-photo-league.svg";

const PPAccHeader = ({ children, ...props }) => {
  return (
    // add context to compare to activekey, if match add active class for triangle button turn. children[2] adds active class

    <div
      key={children.leagueId}
      className={`l-content__flexContainer`}
      {...props}
    >
      <img
        className="u-img-rounded--small"
        alt={children[0].league}
        src={
          !children[0].leagueIcon == ""
            ? `https://avp-backend.com/` + children[0].leagueIcon
            : lIcon
        }
      />

      <button
        className={
          children[1]
            ? `c-accordion__btn c-accordion__btn--playertab`
            : `c-accordion__btn c-accordion__btn--playertab ` + children[2]
        }
      >
        {children[0].league}
      </button>
    </div>
  );
};

export default PPAccHeader;
