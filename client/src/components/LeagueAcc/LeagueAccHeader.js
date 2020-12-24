import React from "react";
import lIcon from "../../../public/images/icons/icons-photo-league.svg";

const LeagueAccHeader = ({ children, ...props }) => {
  return (
    <div
      key={children[0].leagueId}
      className={`c-accordion c-accordion--dashboard c-accordion--border`}
      {...props}
    >
      <div className="l-content__row">
        <div className="e-leagueImage">
          <img
            className="u-img-rounded"
            id="e-leagueIcon"
            src={
              !children[0].leagueIcon == ""
                ? `https://avp-backend.com/` + children[0].leagueIcon
                : lIcon
            }
          />
        </div>
        <button
          className={
            children[1]
              ? `c-accordion__btn c-accordion__btn--centeredLarge ` +
                children[1]
              : `c-accordion__btn c-accordion__btn--centeredLarge ` +
                children[2]
          }
        >
          {children[0].leagueName}
        </button>
      </div>
    </div>

    // <>
    //   <div className={`c-accordion c-accordion--dashboard c-accordion--border`}>
    //     Test Header
    //   </div>
    // </>
  );
};

export default LeagueAccHeader;
