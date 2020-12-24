import React, { useContext, useState } from "react";
import { useAccordionContext } from "../Accordion/hooks";
// import lIcon from "../../../public/images/icons/icons-photo-league.svg";

const ROHeader = ({ children, ...props }) => {
  const { toggleRemBtn } = useAccordionContext();

  return (
    // add context to compare to activekey, if match add active class for triangle button turn. children[2] adds active class

    <div className="c-accordion__header">
      <div
        key={children[0].divisionId}
        className={
          children[1] ? `c-accordion__btn` : `c-accordion__btn ` + children[2]
        }
        {...props}
      >
        {children[0].division} Division
      </div>
      <div className="c-textBtnContainer">
        <span
          className={`e-btn__minus tooltip--top`}
          aria-label="Reveal buttons to delete a match."
          onClick={toggleRemBtn}
        >
          <span className="e-minustext"> Remove Match</span>
        </span>
      </div>
    </div>
  );
};

export default ROHeader;
